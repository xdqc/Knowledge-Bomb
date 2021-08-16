import json
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
    except Exception as e:
        print(qid , e)
        # sparql_get_hyperclass(qid, depth)

def sparql_batch_hypernym_update(hypernym, hid, is_instance=True, n_subclass=None):
    sparql = """
    SELECT DISTINCT ?item
    WHERE {
    VALUES ?hypernym {wd:Q"""+str(hid)+"""} 
    ?item """ \
    +(('wdt:P31?/' if is_instance else '') \
    +('wdt:P279*' if n_subclass is None else ('wdt:P279?/'*n_subclass))).rstrip('/') \
    +""" ?hypernym;
     wikibase:sitelinks ?linkCount.
    FILTER (?linkCount >= 20)
    }"""
    # ?article schema:about ?item .
    # ?article schema:inLanguage "en" .
    # ?article schema:isPartOf <https://en.wikipedia.org/> .
    # SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    items_all = []
    headers = {'Accept':'application/json'}
    r = requests.get('https://query.wikidata.org/sparql?query='+sparql, headers=headers)
    res = r.json(strict=False)
    for b in res['results']['bindings']:
        item = b['item']['value'].split('Q')[1]
        items_all.append(item)
    for i in range(0,100000,5000):
        items = items_all[i:i+5000]
        if len(items) == 0:
            break
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
                    f.write(f"{hypernym}\t{hid}\t{item}\n") #{b['linkCount']['value']} {b['article']['value'].replace(' ','_')}
            f.write('\n')
        print(f'{len(rs)} of {len(items)} items hypernym updated as {hypernym} ({hid})')
    return len(rs)

def build_hypernym_grid(hypernym=None):
    hypernyms = json.load(open('./hypernyms.json','r'))
    t0 = datetime.now()
    for h in hypernyms:
        hlabel,hitem = h['hypernym'],h['queries'][0]['item']
        for q in h['queries']:
            print(hlabel, hitem, q.values())
            res,retry = None,0
            while res is None and retry < 5:
                try:
                    res = sparql_batch_hypernym_update(hitem, q['item'], q['or_instance'], q['subclass_deep'])
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
'Yemen',
'Cichlid',
'QRIO',
'AD 39',
'3GPP',
'Dattatreya',
'.32 ACP',
'Fan Li',
'History of County Wexford',
'Desertas Islands',
'Erie Canal',
'Hyaluronidase',
'2008 in music',
'2004 in music',
'Al Imran',
'Lardaro',
'Coop Himmelb(l)au',
'Tonga Trench',
'Terpander',
]

for c in tbdws:
    delete_by_en_title(c)
    

if __name__ == '__main__':
    build_hypernym_grid()
    # order_hyperitemss()
    # open_sparql_item_links()
    # insert_by_titles()
    # sparql_batch_hypernym_update(514,66394244)
    conn.close()
