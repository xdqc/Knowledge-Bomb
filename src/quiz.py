import pyodbc
import math, random
from environs import Env


env = Env()
env.read_env()

conn_str = env('SQL_READ')

class Quiz:
    conn = pyodbc.connect(conn_str)
    ladder = [ # lvl,lo_langcount,hi_langcount,num_of_items
(1,100,320,1184),
(2,90,130,1158),
(3,80,100,1174),
(4,75,90,1216),
(5,70,80,1142),
(6,66,75,1235),
(7,62,70,1347),
(8,58,66,1557),
(9,54,62,1721),
(10,51,58,1831),
(11,48,54,2026),
(12,45,51,2343),
(13,42,48,2730),
(14,40,45,2647),
(15,37,42,3138),
(16,35,40,3518),
(17,33,37,3367),
(18,31,35,3810),
(19,29,33,4293),
(20,28,32,4632),
(21,27,31,5068),
(22,26,30,5418),
(23,25,29,5792),
(24,24,28,6297),
(25,23,27,6750),
(26,22,26,7374),
(27,21,25,8064),
(28,20,24,8741),
(29,20,23,6809),
(30,20,22,4728),
    ]

    @classmethod
    def get_languages(cls):
        sqlstr = """SELECT TOP(320) code,name_local,label_question,label_answer,label_difficulty,label_gametitle,coord_x,coord_y 
        FROM wiki.language ORDER BY [rank]"""
        cls.conn = pyodbc.connect(conn_str)
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
        sqlstr = """DECLARE @langfix AS nvarchar(max)
            = (SELECT TOP(1) langfix FROM wiki.language WHERE code = ?)
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
        cls.conn = pyodbc.connect(conn_str)
        cursor = cls.conn.cursor()
        res = []
        for lang in cursor.execute(sqlstr, [lang,lang]).fetchall():
            res.append({'value':lang[0], 'text':lang[1][:1].upper()+lang[1][1:], 
                'coord_x':lang[2], 'coord_y':lang[3]})
        return res

    @classmethod
    def get_hypernyms(cls, qlang, alang):
        sqlstr = """SELECT  DISTINCT 
            hypernym ,e.title ,a.title ,q.title
        FROM [wiki].[item] i
        OUTER APPLY (
            SELECT title FROM wiki.article
            WHERE language = 'en' AND item = i.hypernym
        ) e
        OUTER APPLY (
            SELECT title FROM wiki.article
            WHERE language = ? AND item = i.hypernym
        ) a
        OUTER APPLY (
            SELECT title FROM wiki.article
            WHERE language = ? AND item = i.hypernym
        ) q
        ORDER BY e.title"""
        cls.conn = pyodbc.connect(conn_str)
        cursor = cls.conn.cursor()
        res = []
        for h in cursor.execute(sqlstr, [alang, qlang]).fetchall():
            if h[0]:
                res.append({'value':h[0], 'texts': [h[1],h[2],h[3]]})
        return res

    @classmethod
    def get_item_by_level(cls, lvl, board, qlang, alang, hypernym=None):
        level = cls.ladder[lvl-1]
        played_correct = [str(k) for k in board[str(lvl)] if k > 0]
        if len(played_correct) == 0:
              played_correct.extend(['0'])
        sqlstr = f"""
        SELECT TOP(1) i.[id], i.hypernym, q.title, q_en.title, a.title ,a.title_latin
        FROM (
            SELECT [id], hypernym
            FROM [wiki].[item]
            WHERE lang_count >= ?
                AND lang_count <  ?
                AND id NOT IN ({','.join(played_correct)})
                {('AND hypernym IN('+ ",".join([str(h) for h in hypernym if h>0])+')') if hypernym else 'AND hypernym is NULL'}
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
        ORDER BY CHECKSUM(NEWID())
        """
        params = [level[1], level[2]]
        cursor = None
        while cursor is None:
            try:
                cursor = cls.conn.cursor()
            except:
                cls.conn = pyodbc.connect(conn_str)
        result = cursor.execute(sqlstr, params).fetchall()
        return result[0] if len(result) > 0 else None

    @classmethod
    def get_similar_titles(cls, item, a_title_latin, alang, difficulty):
        if difficulty not in [1,2,3,4,6,8,9,12,16,24]:
            difficulty = 4
        num = difficulty
        alang = alang.replace('--', '')
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
    def run_level(cls, lvl, board, qlang, alang, hypernym, difficulty, recurr=0):
        if len(alang) > 12 or len(qlang) > 12:
            return cls.final_score(board)
        level = cls.get_item_by_level(lvl, board, qlang, alang, hypernym)
        # when run out of current level, run next level; circle the ladder, stop when done a circle
        if level is None:
            recurr += 1
            if recurr > len(cls.ladder):
                return cls.final_score(board)
            return cls.run_level(1 if lvl == len(cls.ladder) else lvl+1, board, qlang, alang, hypernym, difficulty, recurr)
        
        q_id,q_hypernym,q_title,q_title_en,a_title,a_title_latin = level
        # find items with similar sound
        similar_titles = cls.get_similar_titles(q_id, a_title_latin, alang, difficulty)
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
    def next_quiz(cls, data):
        lvl, board, qid, qlang, alang, hypernym, is_correct, difficulty =  \
        data['lvl'], data['board'], data['qid'], data['qlang'], data['alang'], data['hypernym'], data['is_correct'], data['difficulty']
        if lvl < 0: # start quiz
            lvl = 1
            for l in cls.ladder:
                board[str(l[0])] = []
        elif lvl > 0: # next quiz
            lvl, board = cls.level_up(lvl, board, qid) if is_correct else cls.level_down(lvl, board, qid)
        if lvl == 0: # end quiz
            return cls.final_score(board)
        return cls.run_level(lvl, board, qlang, alang, hypernym, difficulty)

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
