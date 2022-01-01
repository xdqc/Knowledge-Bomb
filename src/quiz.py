import math, random
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
        sqlstr = """SELECT TOP(320) code,name_local,label_question,label_answer,label_difficulty,label_gametitle,coord_x,coord_y 
        FROM wiki.language ORDER BY [rank]"""
        cls.conn = pyodbc.connect(cls.conn_str)
        cursor = cls.conn.cursor()
        res = []
        for lang in cursor.execute(sqlstr).fetchall():
            res.append({'value':lang[0], 'text':lang[1], 
                'label_q':lang[2], 'label_a':lang[3],
                'label_s':lang[4], 'label_t':lang[5],
                'coord_x':lang[6], 'coord_y':lang[7]})
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
    def get_fuzzy_level(cls, lv, played_correct, qlang, alang, hypernym, difficulty):
        sqlstr = f"""
        SELECT id ,hypernym ,qt ,qt_en ,at ,pos
            ,ht
        FROM (
            SELECT TOP(1) i.[id]
                ,i.hypernym ,c.title_monos ht
                ,q.title qt ,q_en.title qt_en ,'' at 
                ,-1 pos
            FROM (
                SELECT [id], hypernym
                FROM [wiki].[item]
                WHERE hypernym IN (?)
                    AND lang_count >= ?
                    AND lang_count <  ?
                    AND id NOT IN ({",".join(played_correct)})
            ) i
             JOIN wiki.category c on c.item=i.hypernym
            CROSS APPLY (
                SELECT item, title FROM wiki.article
                WHERE language = '{qlang}' AND item = i.id) q
            OUTER APPLY (
                SELECT item, title FROM wiki.article
                WHERE language = 'en' AND item = i.id) q_en
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
                WHERE hypernym NOT IN (?)
                    AND lang_count >= ?
                    AND lang_count <  ?
            ) i
             JOIN wiki.category c on c.item=i.hypernym
            CROSS APPLY (
                SELECT item, title FROM wiki.article 
                WHERE language = '{alang}' AND item = i.id) a
            ORDER BY NEWID()
        ) c
        ORDER BY pos
        """ #TODO: optimize true randomization performance on heterogeneous index
        params = [hypernym, lv[1], lv[2], hypernym, int(lv[1]*0.3), int(lv[2]*3)]
        result = None
        cursor = None
        t0 = time.time()
        try:
            cursor = cls.conn.cursor()
            result = cursor.execute(sqlstr, params).fetchall()
        except:
            cls.conn = pyodbc.connect(cls.conn_str)
            cursor = cls.conn.cursor()
            result = cursor.execute(sqlstr, params).fetchall()
        t1 = time.time()
        print('\t\t\t\tget_fuzzy_choice cost:', t1-t0)
        # validate q(result[0]) exist @pos (-1)
        if len(result) == 0 or result[0][5] != -1:
            return None

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


class Quiz:
    ladder = [ # lvl,lo_langcount,hi_langcount,num_of_items
        (1,120,320,643),
        (2,100,150,886),
        (3,90,120,1012),
        (4,85,110,1102),
        (5,80,100,1175),
        (6,76,92,1215),
        (7,72,85,1296),
        (8,69,80,1267),
        (9,66,75,1236),
        (10,62,70,1347),
        (11,58,66,1557),
        (12,54,62,1721),
        (13,51,58,1830),
        (14,48,54,2025),
        (15,46,51,1908),
        (16,43,48,2190),
        (17,42,46,1926),
        (18,39,43,2272),
        (19,38,41,1859),
        (20,36,39,2150),
        (21,34,37,2417),
        (22,33,35,1827),
        (23,32,34,1889),
        (24,31,33,1986),
        (25,30,32,2153),
        (26,29,31,2310),
        (27,28,30,2483),
        (28,27,29,2756),
        (29,27,28,1478),
        (30,26,27,1456),
        (31,25,26,1579),
        (32,24,25,1788),
        (33,23,24,1929),
        (34,22,23,2080),
        (35,21,22,2275),
        (36,20,21,2459),
    ]

    @classmethod
    def get_languages(cls, lang):
        return Query.get_language_names(lang) if lang else Query.get_languages()

    @classmethod
    def get_hypernyms(cls, qlang, alang):
        return Query.get_hypernyms(qlang, alang)

    @classmethod
    def run_exact_level(cls, lvl, board, qlang, alang, hypernyms, difficulty, recurr=0):
        level = Query.get_item_by_level(cls.ladder[lvl-1], cls.played_correct(board), qlang, alang, hypernyms)
        # when run out of current level, run next level; circle the ladder, stop when done a circle
        if level is None:
            recurr += 1
            if recurr > len(cls.ladder):
                return cls.final_score(board)
            return cls.run_exact_level(1 if lvl == len(cls.ladder) else lvl+1, board, qlang, alang, hypernyms, difficulty, recurr)
        
        q_id,q_hypernym,q_title,q_title_en,a_title,a_title_latin = level
        # find items with similar sound
        similar_titles = Query.get_similar_titles(q_id, a_title_latin, alang, difficulty)
        random.shuffle(similar_titles)
        correct_choice = similar_titles.index(a_title)
        return {
            'lvl': lvl, 
            'q_id': q_id, 
            'q_hypernym': q_hypernym, 
            'q_title': q_title,
            'q_title_en': q_title_en,
            'a_title': a_title, 
            'choices': similar_titles, 
            'answer': correct_choice,
            'board': board
        }
    
    @classmethod
    def run_fuzzy_level(cls, lvl, board, qlang, alang, hypernyms, difficulty, recurr=0):
        hypernyms = [h for h in hypernyms if h > 0]
        if len(hypernyms) == 0:
            return cls.final_score(board)
        hypernym = random.choice(hypernyms)
        # pick one and only one hypernym for fuzzy match
        #TODO: explore fuzzier on many hypernyms
        level = Query.get_fuzzy_level(cls.ladder[lvl-1], cls.played_correct(board), qlang, alang, hypernym, difficulty)
        # when run out of current level, run next level; circle the ladder, stop when done a circle
        #NOTE: hypernym will be randomized on each recursive run, possible premature termination
        if level is None:
            recurr += 1
            if recurr > len(cls.ladder):
                return cls.final_score(board)
            return cls.run_fuzzy_level(1 if lvl == len(cls.ladder) else lvl+1, board, qlang, alang, hypernyms, difficulty, recurr)

        q_id, q_hypernym, q_title, q_title_en = level[0][:4]
        a_title = level[1][4]
        print(*level, sep='\n')
        choices = [row[4] for row in level[1:]]
        random.shuffle(choices)
        correct_choice = choices.index(a_title)
        return {
            'lvl': lvl, 
            'q_id': q_id, 
            'q_hypernym': q_hypernym, 
            'q_title': q_title,
            'q_title_en': q_title_en,
            'a_title': a_title, 
            'choices': choices, 
            'answer': correct_choice,
            'board': board
        }

    @classmethod
    def next_quiz(cls, data):
        lvl, board, qid, qlang, alang, hypernyms, is_correct, difficulty, match_mode =  \
        data['lvl'], data['board'], data['qid'], data['qlang'], data['alang'], data['hypernym'], data['is_correct'], data['difficulty'], data['match_mode']
        if (not isinstance(qlang, str) or not isinstance(alang, str) 
            or '--' in alang or '--' in qlang or len(alang) > 12 or len(qlang) > 12 
            or difficulty not in [1,2,3,4,6,8,9,12,16,24,36,54]
            or match_mode not in [0,1]):
            return cls.final_score(board)

        if lvl < 0: # start quiz
            lvl = 1
            for l in cls.ladder:
                board[str(l[0])] = []
        elif lvl > 0: # next quiz
            lvl, board = cls.level_up(lvl, board, qid) if is_correct else cls.level_down(lvl, board, qid)
        if lvl == 0: # end quiz
            return cls.final_score(board)
        if match_mode == 0:
            return cls.run_exact_level(lvl, board, qlang, alang, hypernyms, difficulty)
        if match_mode == 1:
            return cls.run_fuzzy_level(lvl, board, qlang, alang, hypernyms, difficulty)

    @classmethod
    def final_score(cls, board):
        return {'score': round(cls.calculate_score(board),2), 'board': board}

    @classmethod
    def level_up(cls, lvl, board, qid):
        board[str(lvl)].append(qid)
        sample_size = len(board[str(lvl)])
        cr,beta = cls.correct_rate(lvl, board), random.betavariate(10,10)
        if cr > beta:
            if lvl == len(cls.ladder) and sample_size > cls.total_sample_size(board) * 0.0618:
                lvl = round(random.gammavariate(len(cls.ladder), 0.2)) # rebounce back from top
            else:
                lvl += 1
        lvl = min(lvl, len(cls.ladder))
        return lvl, board

    @classmethod
    def level_down(cls, lvl, board, qid):
        board[str(lvl)].append(-qid)
        lvl = math.floor(lvl * random.betavariate(30,3))
        return lvl, board

    @classmethod
    def calculate_score(cls, board):
        min_rate = 1
        avg_rate = 0
        reached_level = 0
        score = 0
        total = 0
        for lvlstr in board:
            lvl = int(lvlstr)
            rate = cls.correct_rate(lvl, board, final=True)
            if len(board[lvlstr]) > 0:
                min_rate = min(min_rate, rate)
                avg_rate = (avg_rate*(lvl-1)+(min_rate*(lvl-1)+rate)/lvl) / lvl
                score += rate * cls.level_items_count(lvl)
                reached_level += 1
            else:
                score += avg_rate * cls.level_items_count(lvl) * (len(cls.ladder)-lvl+reached_level)/(len(cls.ladder)+lvl-reached_level)
            total += cls.level_items_count(lvl)
        return score / total * 100

    @classmethod
    def correct_rate(cls, lvl, board, final=False):
        rate = 0
        sample_size = len(board[str(lvl)])/1.0
        if sample_size > 0:
            level_items_count = cls.level_items_count(lvl)
            miss_coef = math.log10((max(level_items_count-sample_size**3, 1)) / (sample_size+1)) + math.log1p(lvl) - 1
            if final:
                miss_coef = max(miss_coef * lvl / len(cls.ladder)**2, 0)
            correct_count = len([k for k in board[str(lvl)] if k > 0])
            rate = correct_count / (sample_size+miss_coef)
        return rate

    @classmethod
    def level_items_count(cls, lvl):
        return cls.ladder[lvl-1][3]

    @classmethod
    def total_sample_size(cls, board):
        total = 0
        for l in cls.ladder:
              total += len(board[str(l[0])])
        return total

    @classmethod
    def played_correct(cls, board):
        played_correct = [str(k) for sl in list(board.values()) for k in sl if k > 0]
        if len(played_correct) == 0:
              played_correct.extend(['0'])
        return played_correct
