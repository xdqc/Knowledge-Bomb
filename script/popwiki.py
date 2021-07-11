import re
import requests
import pyodbc
import webbrowser
import time
from datetime import datetime
from bs4 import BeautifulSoup
from slugify import slugify
from configparser import ConfigParser

config = ConfigParser()
config.read('config.ini')
conn_str = config['DEFAULT']['CW']
conn = pyodbc.connect(conn_str)



def insert_by_titles():
    en_titles = []
    with open('./titles.tsv', 'r', encoding='utf8') as f:
        for l in f:
            en_titles.append(l.split('\t')[2].strip())
    for title in en_titles:
        url = 'https://en.wikipedia.org/wiki/'
        insert_en_title(url+title)
        print()


def insert_en_title(titleurl, depth=1):
    r = requests.get(titleurl)
    soup = BeautifulSoup(r.content, features='html5lib')
    link_wikidata = soup.select_one('li#t-wikibase')
    if link_wikidata is None:
        print('No wikidata -', titleurl)
        return
    wikidata_id = re.search(r'\d+$', link_wikidata.find_all('a')[0]['href']).group(0)
    en_title = soup.select_one('h1#firstHeading').text
    langs = {'en': re.sub(r"\'", "''", en_title)}
    for a_tag in soup.find_all('a', class_='interlanguage-link-target', href=True):
        lang_code = re.match(r'https:\/\/([a-z\-]+)', a_tag['href'])[1]
        wiki_title = re.sub(r' – [^–]+$', '', a_tag['title'])
        wiki_title = re.sub(r"\'", "''", wiki_title)
        langs[lang_code] = wiki_title
    text_lastedit = re.search(r'on (\d{1,2} \w+ \d{4})', soup.select_one('li#footer-info-lastmod').text).group(1)
    date_lastedit = datetime.strptime(text_lastedit, '%d %B %Y').strftime('%Y-%m-%d')
    print(('Q'+wikidata_id).ljust(12, ' '), date_lastedit, len(langs), en_title, sep='\t')
    if len(langs) >= 20 and not en_title.startswith('Category:') and not en_title.startswith('Wikipedia:'):
        sql_insert_wiki(wikidata_id, langs, date_lastedit, depth)
        if depth <= 2:
            depth += 1
            sparql_get_hyperclass(wikidata_id, depth)


def sql_insert_wiki(wikidata_id, langs, date_lastedit:str, depth=1):
    cursor = conn.cursor()
    cursor.execute(f"SELECT id,lang_count,edited_enwiki FROM wiki.item WHERE id = {wikidata_id}")
    rs = cursor.fetchall()
    if len(rs) == 0:
        sqlstr = f"INSERT INTO wiki.item VALUES ({wikidata_id}, {str(len(langs))}, NULL, GETDATE(), GETDATE(), '{date_lastedit}' )"
        cursor.execute(sqlstr)
        cursor.commit()
        cursor.execute(prepare_insert_articles(wikidata_id, langs))
        cursor.commit()
        print(('Q'+wikidata_id).ljust(12, ' '),'Created')
        if depth > 1:
            with open('./sortitles.tsv', 'a', encoding='utf8') as f:
                f.write(('Q'+wikidata_id).ljust(12, ' ')+'Created\t'+'https://en.wikipedia.org/wiki/'+langs['en'].replace(' ', '_')+'\n')
    elif rs[0][1] != len(langs) or str(rs[0][2])[:7] != date_lastedit[:7]:
        cursor.execute(f"UPDATE wiki.item SET lang_count={str(len(langs))}, edited_enwiki='{date_lastedit}', updated=GETDATE() WHERE id={wikidata_id};")
        cursor.commit()
        cursor.execute(f"DELETE FROM wiki.article WHERE item = {wikidata_id};")
        cursor.commit()
        cursor.execute(prepare_insert_articles(wikidata_id, langs))
        cursor.commit()
        print(('Q'+wikidata_id).ljust(12, ' '),'Updated')


def prepare_insert_articles(wikidata_id, langs):
    values = []
    for c,t in langs.items():
        s = slugify(t, separator='', lowercase=False)
        values.append(f"( {wikidata_id}, '{c}', N'{t}', '{s}', SOUNDEX('{s}'),SOUNDEX(REVERSE('{s}')) )")
    return f"INSERT INTO wiki.article (item, language, title, title_latin, soundexo, soundexr) VALUES {', '.join(values)}"


def sparql_get_hyperclass(qid, depth=0):
    sparql = """
    SELECT * WHERE{
    {
        SELECT ?c ?cLabel ?article  {
        VALUES (?i) {(wd:Q"""+str(qid)+""" )}
        ?i wdt:P31 ?c .
            ?article schema:about ?c .
            ?article schema:inLanguage "en" .
            ?article schema:isPartOf <https://en.wikipedia.org/> .
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
    }
    UNION
    {
        SELECT  ?s ?sLabel ?article {
        VALUES (?i) {(wd:Q"""+str(qid)+""" )}
        ?i wdt:P279 ?s .
            ?article schema:about ?s .
            ?article schema:inLanguage "en" .
            ?article schema:isPartOf <https://en.wikipedia.org/> .
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
    }
    }"""
    headers = {'Accept':'application/json'}
    r = requests.get('https://query.wikidata.org/sparql?query='+sparql, headers=headers)
    try:
        res = r.json()
        for b in (res['results']['bindings']):
            if 'c' in b:
                if b['c']['value'].split('Q')[1] != qid:
                    instance_of = b['cLabel']['value']
                    print(f'Q{qid}', 'is', 'instance_of', instance_of, sep='\t')
                    insert_en_title(b['article']['value'], depth)
            if 's' in b:
                if b['s']['value'].split('Q')[1] != qid:
                    subclass_of = b['sLabel']['value']
                    print(f'Q{qid}', 'is', 'subclass_of', subclass_of, sep='\t')
                    insert_en_title(b['article']['value'], depth)
        print(depth)
    except:
        sparql_get_hyperclass(qid, depth)


def batch_sparql(hypernym, hid, instance_of=True, n_subclass=None):
    sparql = """
    SELECT DISTINCT ?item ?linkCount
    WHERE {
    VALUES ?hypernym {wd:Q"""+str(hid)+"""} 
    ?item """ \
    +(('wdt:P31?/' if instance_of else '') \
    +('wdt:P279*' if n_subclass is None else ('wdt:P279?/'*n_subclass))).rstrip('/') \
    +""" ?hypernym;
     wikibase:sitelinks ?linkCount.
    FILTER (?linkCount >= 20)
    }"""
    # ?article schema:about ?item .
    # ?article schema:inLanguage "en" .
    # ?article schema:isPartOf <https://en.wikipedia.org/> .
    # SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    items = []
    headers = {'Accept':'application/json'}
    r = requests.get('https://query.wikidata.org/sparql?query='+sparql, headers=headers)
    res = r.json(strict=False)
    for b in res['results']['bindings']:
        item = b['item']['value'].split('Q')[1]
        items.append(item)
    sqlstr = f"UPDATE wiki.item SET hypernym = {hypernym} WHERE id IN ({','.join(items)[:-1]})"
    cursor = conn.cursor()
    cursor.execute(sqlstr)
    cursor.commit()
    sqlstr = f"SELECT id FROM wiki.item WHERE id IN ({','.join([str(i) for i in items])[:-1]})"
    cursor.execute(sqlstr)
    rs = [r[0] for r in cursor.fetchall()]
    with open('./sortitems.tsv', 'a', encoding='utf8') as f:
        for b in res['results']['bindings']:
            item = int(b['item']['value'].split('Q')[1])
            if item not in rs:
                f.write(f"{hypernym}\t{hid}\t{item}\t{b['linkCount']['value']}\n") #{b['article']['value'].replace(' ','_')}
        f.write('\n')
    print(f'{len(rs)} of {len(items)} items hypernym updated as {hypernym} ({hid})')
    return len(rs)

def build_hypernym_grid(hypernym=None):
    hypernyms = {
        'Concept': [(151885,),(151885,True,3),813912,3505845],
        'Something (concept)': [(35120,False,5),(35120,True,2),(28813620,False,5),(28813620,True,1),(16887380,False,4),(16887380,True,2)],
        'Object (philosophy)': [(488383,False,5),(488383,True,2),(7184903,False,6),(7184903,True,2)],
        'Action (philosophy)': [(4026292,),(4026292,True,3),124490,1174599,23009459],
        'Change (philosophy)': [(1150070,),(1150070,True,4),748250],
        'Property (philosophy)': [(937228,),(937228,True,2)],
        'Physical object': [(223557,False,5),(223557,True,1),(1310239,False,6),(1310239,True,2),(98119401,),23497981],
        'Structure': [(6671777,False,4),(6671777,True,2)],
        'Hypothesis': [(41719,),(41719,True,6),18706315],
        'Phenomenon': [(483247,),(483247,True,4),(16722960,),(16722960,True,5),602884],
        'Information': [(11028,),(11028,True,1),(628523,True,5),(1151067,True,5),7748,853614,6667497],
        'System': [(58778,),(58778,True,3),(811979,)],
        'Behavior': [(9332,),(9332,True,5),(1299714,),(1299714,True,6),(11024,True,4)],
        'Knowledge': [9081],
        'Terminology': [1725664,1969448],
        'Interaction': [52948,381072],
        'Technology ': [11016,2695280],
        'Astronomical object': [(6999,),(6999,True,0),17444909,9262,3235978,27521],
        'Document': [(49848,),(49848,True,3),(47461344,),(47461344,True,1),740464,2751586],
        'Organism': [(7239,),(7239,True,2),(16334298,),(16334298,True,2),729,756,39833,55983715],
        'Location': [(2221906,),(2221906,True,0),(27096213,),(27096213,True,1),(271669,True,0),1620908,52551684,123705,20719696],
        'Mathematics': [395,(24034552,),(246672,),(246672,True,3),1140046,11593,47279819,203066],
        'Chemical substance': [(79529,False,4),(43460564,True,3),19549,47154513,56256178,17339814],
        'Sign': [3695082,2001982,9788],
        'Humanities': [80083,11042,853725,210272,780687,7406919,14897293],
        'Organization': [(43229,),(43229,True,1),33104069,17197366],
        'Goods': [(28877,),(28877,True,2)],
        'Matter': [35758,177013],
        'Physical property': [4373292,3523867,107715],
        'Anatomy': [514,66394244,4936952],
        'Language': [315,34770,4536530,17376908],
        'Phrase': [187931,82042,43249,1759988],
        'Axiom': [17736],
        'Theorem': [65943],
        'Theory': [17737],
        'Ideology': [7257],
        'Art': [735,6647660,7832362],
        'Genre': [483394,8253],
        'Myth': [12827256,9134,24334685,21070568],
        'Religion': [9174,4392985,23847174,4504549,2110808,1845,1530022],
        'Tool': [39546,1183543,31807746],
        'Infrastructure': [121359],
        'Machine': [11019,839546],
        'Computer science': [21198,66747126,7397,173212,28643],
        'Time': [11471],
        'Shape': [207961],
        'Ethnic group': [41710],
        'Disease': [12136],
        'Food': [2095],
        'Clothing': [11460],
        'Sport': [349,31629,1781513,28829877],
        'Game': [11410,28114058,17638008],
        'Unit of measurement': [47574],
    }
    t0 = datetime.now()
    for k, v in hypernyms.items():
        for i in v:
            h = v[0][0] if type(v[0]) is tuple else v[0]
            print(k, h, i)
            res,retry = None,0
            while res is None and retry < 5:
                try:
                    if type(i) is tuple:
                        if len(i) == 3:
                            res = batch_sparql(h, i[0], i[1], i[2])
                        else:
                            res = batch_sparql(h, i[0], False)
                    else:
                        res = batch_sparql(h, i)
                except Exception as e:
                    retry+=1
                    print('Retry',retry,str(e))
        t1 = datetime.now()
        print(t1-t0)

def order_hyperitemss():
    hitems = {}
    with open('./sortitems.tsv', 'r', encoding='utf8') as f:
        for l in f:
            l = l.strip()
            if l:
                hypernym, hid, id, lc = l.split('\t')
                hitems[id] = (hypernym, hid, int(lc))
    with open('./sortitems1.tsv', 'w', encoding='utf8') as f:
        for k,v in sorted(hitems.items(), key=lambda i: (i[1][2],i[1][0],i[1][1],i[0]), reverse=True):
            f.write(f'{v[0]}\t{v[1]}\t{v[2]}\t{k}\n')

def open_sparql_item_links():
    with open('./sortitems1.tsv', 'r', encoding='utf8') as f:
        for l in f:
            qid=l.split('\t')[3]
            sparql="""SELECT DISTINCT ?item ?article
    WHERE {
    VALUES ?item { wd:Q"""+str(qid)+""" } 
    ?item  wikibase:sitelinks ?linkCount.
    ?article schema:about ?item .
    ?article schema:inLanguage "en" .
    ?article schema:isPartOf <https://en.wikipedia.org/> .
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    FILTER (?linkCount >= 20)
    }"""
            headers = {'Accept':'application/json'}
            r = requests.get('https://query.wikidata.org/sparql?query='+sparql, headers=headers)
            res,retry = None,0
            while res is None and retry < 5:
                try:
                    res = r.json()
                    for b in res['results']['bindings']:
                        link = b['article']['value']
                        webbrowser.open(link, new=0, autoraise=True)
                        print(qid, link, sep='\t')
                except Exception as e:
                    retry+=1
                    print('Retry',retry,qid,str(e),sep='\t')
            time.sleep(0.8)


def delete_by_en_title(en_title):
    sqlq = f"SELECT item FROM wiki.article WHERE language='en' AND title=N'{en_title}'"
    cursor = conn.cursor()
    res = []
    for row in cursor.execute(sqlq):
        res.append(row)
    if len(res) == 0:
        print('Cannot find:', en_title)
        return
    item = res[0][0]
    sqld = f"DELETE FROM wiki.article WHERE item = {item}"
    cursor.execute(sqld)
    cursor.commit()
    sqld = f"DELETE FROM wiki.item WHERE id = {item}"
    cursor.execute(sqld)
    cursor.commit()
    print('deleted', item, en_title)

def delete_by_wikidata_id(item):
    cursor = conn.cursor()
    sqld = f"DELETE FROM wiki.article WHERE item = {item}"
    cursor.execute(sqld)
    cursor.commit()
    sqld = f"DELETE FROM wiki.item WHERE id = {item}"
    cursor.execute(sqld)
    cursor.commit()
    print('deleted', item)


tbdws = [
]

for c in tbdws:
    delete_by_en_title(c)
    

if __name__ == '__main__':
    # insert_by_titles()
    # order_hyperitemss()
    # open_sparql_item_links()
    # build_hypernym_grid()
    # batch_sparql(514,66394244)
    conn.close()
