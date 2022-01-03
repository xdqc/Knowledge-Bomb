import pyodbc
import json
import time
import requests
from environs import Env

class Query:
    env = Env()
    env.read_env()
    conn_str = env('SQL_READ')
    conn = pyodbc.connect(conn_str)

    @classmethod
    def get_languages(cls):
        sqlstr = """SELECT TOP(320) code,name_local,label_question,label_answer,label_difficulty,label_gametitle,label_m0,label_m1,coord_x,coord_y 
        FROM wiki.language ORDER BY [rank]"""
        cls.conn = pyodbc.connect(cls.conn_str)
        cursor = cls.conn.cursor()
        res = []
        for lang in cursor.execute(sqlstr).fetchall():
            res.append({'value':lang[0], 'text':lang[1], 
                'label_q':lang[2], 'label_a':lang[3],
                'label_s':lang[4], 'label_t':lang[5],
                'label_m0':lang[6], 'label_m1':lang[7],
                'coord_x':lang[8], 'coord_y':lang[9]})
        return res

    @classmethod
    def get_language_names(cls, lang):
        sqlstr = """DECLARE @langfix AS nvarchar(max) = (SELECT TOP(1) langfix FROM wiki.language WHERE code = ?)
        SELECT code, TRIM(REPLACE(REPLACE(COALESCE(a.title, l.name), @langfix, ''), '()', '')) as title,
            CASE WHEN title IS NULL THEN NULL ELSE coord_x END, 
            CASE WHEN title IS NULL THEN NULL ELSE coord_y END
        FROM wiki.language l
        OUTER APPLY (
            SELECT item,title FROM wiki.article a
            WHERE a.item = l.item 
            AND a.language = ?
        ) a
        ORDER BY CASE WHEN a.title IS NULL THEN 1 ELSE 0 END, title, l.name"""
        cls.conn = pyodbc.connect(cls.conn_str)
        cursor = cls.conn.cursor()
        res = []
        for lang in cursor.execute(sqlstr, [lang,lang]).fetchall():
            res.append({'value':lang[0], 'text':lang[1].capitalize(), 
                'coord_x':lang[2], 'coord_y':lang[3]})
        return res

    @classmethod
    def get_hypernyms(cls, qlang, alang):
        sqlstr = """SELECT DISTINCT 
            i.hypernym ,e.title ,a.title ,q.title ,c.depth ,c.place
        FROM [wiki].[item] i
        LEFT JOIN wiki.article e
            ON e.item = i.hypernym AND e.language = 'en'
        LEFT JOIN wiki.article a
            ON a.item = i.hypernym AND a.language = ?
        LEFT JOIN wiki.article q
            ON q.item = i.hypernym AND q.language = ?
        JOIN wiki.category c
            ON c.item = i.hypernym
        WHERE e.title is not null
        ORDER BY c.place"""
        cls.conn = pyodbc.connect(cls.conn_str)
        cursor = cls.conn.cursor()
        res = []
        for h in cursor.execute(sqlstr, [alang, qlang]).fetchall():
            if h[0]:
                res.append({'value':h[0], 'texts': [h[1],h[2],h[3]], 'depth':h[4], 'place':h[5]})
        return res

    @classmethod
    def get_item_by_level(cls, lv, played_correct, qlang, alang, hypernyms=[]):
        hypernyms = [str(h) for h in hypernyms if h > 0]
        sqlstr = f"""
        SELECT TOP(1) i.[id], i.hypernym, q.title, q_en.title, a.title ,a.title_latin
        FROM (
            SELECT [id], hypernym
            FROM [wiki].[item]
            WHERE lang_count >= ?
                AND lang_count <  ?
                AND id NOT IN ({",".join(played_correct)})
                {'AND hypernym IN ('+",".join(hypernyms) +')' if len(hypernyms)>0 else ''}
        ) i
        CROSS APPLY (
            SELECT item, title FROM wiki.article
            WHERE language = '{qlang}' AND item = i.id) q
        CROSS APPLY (
            SELECT item, title FROM wiki.article
            WHERE language = 'en' AND item = i.id) q_en
        CROSS APPLY (
            SELECT item, title, title_latin FROM wiki.article 
            WHERE language = '{alang}' AND item = i.id) a
        ORDER BY NEWID()
        """
        params = [lv[1], lv[2]]
        result = None
        cursor = None
        try:
            cursor = cls.conn.cursor()
            result = cursor.execute(sqlstr, params).fetchall()
        except:
            cls.conn = pyodbc.connect(cls.conn_str)
            cursor = cls.conn.cursor()
            result = cursor.execute(sqlstr, params).fetchall()
        result = cursor.execute(sqlstr, params).fetchall()
        return result[0] if len(result) > 0 else None

    @classmethod
    def get_similar_titles(cls, item, a_title_latin, alang, difficulty):
        num = difficulty
        sqlstr = f"""
        SELECT title, r FROM (
          SELECT title, r FROM (
            SELECT TOP (?) 
              title, ABS(item - ?) * 0.001 * (ABS(CHECKSUM(NewId())) % 127 + 1) r
            FROM wiki.article
            WHERE language = '{alang}'
              AND (soundexo = SOUNDEX(?) AND soundexo <> '0000')
            ORDER BY r) a
          UNION
          SELECT title, r FROM (
            SELECT TOP (?) 
              title, ABS(item - ?) * 0.01 * (ABS(CHECKSUM(NewId())) % 127 + 1) r
            FROM wiki.article
            WHERE language = '{alang}'
              AND (soundexr = SOUNDEX(REVERSE(?)) )
            ORDER BY r) b 
        ) u
        ORDER BY r
        """
        params = [num,item,alang,a_title_latin]*2
        cursor = cls.conn.cursor()
        result = [] 
        for r in cursor.execute(sqlstr, [num,item,a_title_latin]*2).fetchall():
            if r[0] not in result: # order should be preserved and no duplicate
                result.append(r[0])
        if len(result) < num:
            sqlstr = """ SELECT title
            FROM wiki.article
            WHERE language = ?
            ORDER BY ABS(item - ?) * 0.0001 * (ABS(CHECKSUM(NewId())) % 127 + 1)
            OFFSET (1) ROWS FETCH NEXT (?) ROWS ONLY """
            result.extend([r[0] for r in cursor.execute(sqlstr, [alang,item,num]).fetchall() if r[0] not in result])
        return result[:num]

    @classmethod
    def get_fuzzy_level(cls, lv, played_correct, qlang, alang, hypernyms, difficulty):
        hypernyms = [str(h) for h in hypernyms if h > 0]
        sqlstr = f"""
        SELECT id ,hypernym ,qt ,qt_en ,at ,pos
            ,ht
        FROM (
            SELECT TOP(1) i.[id]
                ,i.hypernym ,c.title_monos ht
                ,q.title qt ,q_en.title qt_en ,a.title at 
                ,-1 pos
            FROM (
                SELECT [id], hypernym
                FROM [wiki].[item]
                WHERE lang_count >= ?
                  AND lang_count <  ?
                  AND id NOT IN ({",".join(played_correct)})
                  {'AND hypernym IN ('+",".join(hypernyms) +')' if len(hypernyms)>0 else ''}
            ) i
             JOIN wiki.category c on c.item=i.hypernym
            CROSS APPLY (
                SELECT item, title FROM wiki.article
                WHERE language = '{qlang}' AND item = i.id) q
            OUTER APPLY (
                SELECT item, title FROM wiki.article
                WHERE language = 'en' AND item = i.id) q_en
            OUTER APPLY (
                SELECT item, title FROM wiki.article
                WHERE language = '{alang}' AND item = i.id) a
            ORDER BY NEWID()
        ) q
        UNION ALL
        SELECT id ,hypernym ,qt ,qt_en ,at ,pos
            ,ht
        FROM (
            SELECT TOP({difficulty-1}) i.[id]
                ,i.hypernym, c.title_monos ht
                ,'' qt ,'' qt_en ,a.title at
                ,1 pos
            FROM (
                SELECT [id], hypernym
                FROM [wiki].[item]
                WHERE lang_count >= ?
                  AND lang_count <  ?
                  {'AND hypernym NOT IN ('+",".join(hypernyms) +')' if len(hypernyms)>0 else ''}
            ) i
             JOIN wiki.category c on c.item=i.hypernym
            CROSS APPLY (
                SELECT item, title FROM wiki.article 
                WHERE language = '{alang}' AND item = i.id) a
            ORDER BY NEWID()
        ) c
        ORDER BY pos
        """ #TODO: optimize true randomization performance on heterogeneous index
        params = [lv[1], lv[2], int(lv[1]*0.3), int(lv[2]*3)]
        result = None
        cursor = None
        try:
            cursor = cls.conn.cursor()
            result = cursor.execute(sqlstr, params).fetchall()
        except:
            cls.conn = pyodbc.connect(cls.conn_str)
            cursor = cls.conn.cursor()
            result = cursor.execute(sqlstr, params).fetchall()
        # validate q(result[0]) exist @pos (-1)
        if len(result) == 0 or result[0][5] != -1:
            return None
        return result


        #The following jobs are passed on clientside to reduce server resp time
        pass
        def trans_lang_code(lang):
            # resolve diff b/w WMF & IETF
            trans = {
                'be-x-old': 'be-tarask',
                'bh': 'bho',
                'cbk-sam': 'cbk',
                'fiu-vro': 'vro',
                'zh-min-nan': 'nan',
                'zh-yue': 'yue',
            }
            return trans[lang] if lang in trans else lang
        # get siblings of the q
        t1 = time.time()
        a_id, a_title = cls.get_fuzzy_answer(result[0][0], trans_lang_code(alang))
        t2 = time.time()
        print('\t\t\t\tget_fuzzy_answer cost:', t2-t1)
        if a_id > 0 and a_title:
            result[1:1] = [(a_id, hypernym, '', '', a_title.capitalize(), 0, '??')]
            return result
        else:
            return None

    @classmethod
    def get_fuzzy_answer(cls, q_id, alang):
        def sparql_get_siblings(item, lang, upscope='wdt:P31?', downscope='wdt:P31?', related=False):
            a_id = 0
            a_title = ''
            sparql = ''
            if related:
                #Possible related items P361 P366 P527 P1535 P1659 P2283 
                # excluding P31?/P279*
                # dropped canditates P1552 has_quality, P1889 different_from
                sparql = """
                SELECT DISTINCT * WHERE {
                {
                    SELECT DISTINCT
                    ?sibling ?siblingLabelA
                            WHERE 
                            {
                            wd:Q"""+str(item)+""" wdt:P361? ?whole .
                            ?sibling wdt:P361? ?whole .
                            ?sibling rdfs:label ?siblingLabelA filter (lang(?siblingLabelA) = """+f'"{lang}"'+""").
                            }
                }
                UNION
                {
                    SELECT DISTINCT
                    ?sibling ?siblingLabelA
                            WHERE 
                            {
                            wd:Q"""+str(item)+""" wdt:P527? ?part .
                            ?sibling wdt:P527? ?part .
                            ?sibling rdfs:label ?siblingLabelA filter (lang(?siblingLabelA) = """+f'"{lang}"'+""").
                            }
                }
                UNION
                {
                    SELECT DISTINCT
                    ?sibling ?siblingLabelA
                            WHERE 
                            {
                            wd:Q"""+str(item)+""" wdt:P366? ?use .
                            ?sibling wdt:P366? ?use .
                            ?sibling rdfs:label ?siblingLabelA filter (lang(?siblingLabelA) = """+f'"{lang}"'+""").
                            }
                }
                UNION
                {
                    SELECT DISTINCT
                    ?sibling ?siblingLabelA
                            WHERE 
                            {
                            wd:Q"""+str(item)+""" wdt:P1535? ?useby .
                            ?sibling wdt:P1535? ?useby .
                            ?sibling rdfs:label ?siblingLabelA filter (lang(?siblingLabelA) = """+f'"{lang}"'+""").
                            }
                }
                UNION
                {
                    SELECT DISTINCT
                    ?sibling ?siblingLabelA
                            WHERE 
                            {
                            wd:Q"""+str(item)+""" wdt:P2283? ?uses .
                            ?sibling wdt:P2283? ?uses .
                            ?sibling rdfs:label ?siblingLabelA filter (lang(?siblingLabelA) = """+f'"{lang}"'+""").
                            }
                }
                UNION
                {
                    SELECT DISTINCT
                    ?sibling ?siblingLabelA
                            WHERE 
                            {
                            wd:Q"""+str(item)+""" wdt:P1659? ?see .
                            ?sibling wdt:P1659? ?see .
                            ?sibling rdfs:label ?siblingLabelA filter (lang(?siblingLabelA) = """+f'"{lang}"'+""").
                            }
                }
                }
                ORDER BY UUID() 
                LIMIT 2
                """
            else:
                #NOTE: Because the `?` after upscope P31, directchild is also possible, so sibling actually means children and their uncles
                #exclude classes of concept, term, blanket terminology, technical term
                sparql = """
                SELECT DISTINCT ?sibling ?siblingLabelA
                WHERE
                {
                    wd:Q"""+str(item)+""" """+upscope+""" ?class.
                    FILTER (?class not in (wd:Q151885, wd:Q1969448, wd:Q4925178, wd:Q12812139))
                    ?sibling """+downscope+""" ?class .
                    ?sibling rdfs:label ?siblingLabelA filter (lang(?siblingLabelA) = """+f'"{lang}"'+""").
                }
                ORDER BY uuid()
                LIMIT 2 
                """
            headers = {'Accept':'application/json'}
            r = requests.get('https://query.wikidata.org/sparql?query='+sparql, headers=headers)
            try:
                res = r.json()
                for b in res['results']['bindings']:
                    a_id = int(b['sibling']['value'].split('Q')[1])
                    a_title = b['siblingLabelA']['value']
                    if a_id != q_id:
                        return a_id, a_title, True
            except Exception as e:
                print(q_id, alang, e, sep='\n')
            return a_id, a_title, False
            
        a_id, a_title, is_fuzzy = sparql_get_siblings(q_id, alang, related=True)
        if is_fuzzy:
            return a_id,  a_title
        print('Expand Class...', q_id, alang)
        a_id, a_title, is_fuzzy = sparql_get_siblings(q_id, alang, 'wdt:P31?', 'wdt:P31?')
        if is_fuzzy:
            return a_id,  a_title
        print('Expand SubClass...',  q_id, alang)
        a_id, a_title, is_fuzzy = sparql_get_siblings(q_id, alang, 'wdt:P31?', 'wdt:P31?/wdt:P279')
        if is_fuzzy:
            return a_id,  a_title
        print('Expand SubClasses...',  q_id, alang)
        a_id, a_title, is_fuzzy = sparql_get_siblings(q_id, alang, 'wdt:P31?', 'wdt:P31?/wdt:P279+')
        if is_fuzzy:
            return a_id,  a_title
        print('Expand SuperClass...',  q_id, alang)
        a_id, a_title, is_fuzzy = sparql_get_siblings(q_id, alang, 'wdt:P31?/wdt:P279', 'wdt:P31?/wdt:P279?')
        if is_fuzzy:
            return a_id, a_title
        print('Expand SuperSuperClass...',  q_id, alang)
        a_id, a_title, is_fuzzy = sparql_get_siblings(q_id, alang, 'wdt:P31?/wdt:P279/wdt:P279', 'wdt:P31?/wdt:P279?')
        if not is_fuzzy:
            print('Expand Scopes failure...',  q_id, alang)
        return a_id, a_title
