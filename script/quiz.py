import pyodbc
import math, random
from configparser import ConfigParser

config = ConfigParser()
config.read('config.ini')
conn_str = config['DEFAULT']['CR']

class Quiz:
    conn = pyodbc.connect(conn_str)
    ladder = [ # lvl,lo_langcount,hi_langcount,num_of_items
        (1,147,300,252),
        (2,120,147,261),
        (3,106,120,244),
        (4,97,106,248),
        (5,91,97,226),
        (6,86,91,237),
        (7,82,86,246),
        (8,78,82,271),
        (9,75,78,252),
        (10,72,75,295),
        (11,69,72,300),
        (12,67,69,232),
        (13,65,67,280),
        (14,63,65,279),
        (15,61,63,331),
        (16,59,61,335),
        (17,57,59,367),
        (18,55,57,310),
        (19,54,55,218),
        (20,53,54,231),
        (21,52,53,262),
        (22,51,52,252),
        (23,50,51,253),
        (24,49,50,299),
        (25,48,49,315),
        (26,47,48,302),
        (27,46,47,331),
        (28,45,46,372),
        (29,44,45,363),
        (30,43,44,383),
        (31,42,43,394),
        (32,41,42,436),
        (33,40,41,481),
        (34,39,40,435),
        (35,38,39,517),
        (36,37,38,561),
        (37,36,37,574),
        (38,35,36,633),
        (39,34,35,685),
        (40,33,34,746),
        (41,32,33,774),
        (42,31,32,807),
        (43,30,31,893),
        (44,29,30,980),
        (45,28,29,1042),
        (46,27,28,1152),
        (47,26,27,1179),
        (48,25,26,1293),
        (49,24,25,1430),
        (50,23,24,1540),
        (51,22,23,1624),
        (52,21,22,1881),
        (53,20,21,1959),
    ]

    @classmethod
    def get_languages(cls):
        sqlstr = 'SELECT code,name_local FROM wiki.language'
        cls.conn = pyodbc.connect(conn_str)
        cursor = cls.conn.cursor()
        res = []
        for lang in cursor.execute(sqlstr):
              res.append({'value':lang[0], 'text':lang[1]})
        return res[:150]

    @classmethod
    def get_hypernyms(cls, qlang, alang):
        sqlstr = f"""SELECT  DISTINCT 
            hypernym
            ,e.title
            ,q.title
            ,a.title
        FROM [wiki].[item] i
        OUTER APPLY (
            SELECT title FROM wiki.article
            WHERE language = 'en' AND item = i.hypernym
        ) e
        OUTER APPLY (
            SELECT title FROM wiki.article
            WHERE language = '{qlang}' AND item = i.hypernym
        ) q
        OUTER APPLY (
            SELECT title FROM wiki.article
            WHERE language = '{alang}' AND item = i.hypernym
        ) a
        ORDER BY e.title"""
        cls.conn = pyodbc.connect(conn_str)
        cursor = cls.conn.cursor()
        res = []
        for h in cursor.execute(sqlstr):
            res.append({'value':h[0], 'texts': [h[1],h[2],h[3]]})
        return res

    @classmethod
    def get_item_by_level(cls, lvl, board, qlang, alang, hypernym=None):
        level = cls.ladder[lvl-1]
        played_correct = [k for k in board[str(lvl)] if k > 0]
        if len(played_correct) == 0:
              played_correct.extend([0])
        sqlstr = f"""
            SELECT TOP(1) i.[id]
            ,q.title
            ,a.title
            ,a.title_latin
            FROM (
            SELECT [id]
            FROM [wiki].[item]
            WHERE lang_count >= {level[1]}
                AND lang_count <  {level[2]}
                AND id NOT IN ({','.join([str(i) for i in played_correct])})
                {('AND hypernym IN('+ ",".join([str(h) for h in hypernym if h])+')') if hypernym else 'AND hypernym is NULL'}
            ) i
            CROSS APPLY (
            SELECT item, title FROM wiki.article
            WHERE language = '{qlang}' AND item = i.id
            ) q
            CROSS APPLY (
            SELECT item, title, title_latin FROM wiki.article 
            WHERE language = '{alang}' AND item = i.id
            ) a
            ORDER BY CHECKSUM(NEWID())
        """
        try:
            cursor = cls.conn.cursor()
        except:
            cls.conn = pyodbc.connect(conn_str)
            cursor = cls.conn.cursor()
        cursor.execute(sqlstr)
        result = cursor.fetchall()
        return result[0] if len(result) > 0 else None

    @classmethod
    def get_similar_titles(cls, item, a_title_latin, alang):
        num = 9
        sqlstr = f"""
        SELECT title, r FROM
        (
          SELECT title, r FROM
          (
            SELECT TOP ({num}) 
              title, 
              ABS(item - {item}) * 0.001 * (ABS(CHECKSUM(NewId())) % 127 + 1) r
            FROM wiki.article
            WHERE language = '{alang}'
              AND (soundexo = SOUNDEX('{a_title_latin}') AND soundexo <> '0000')
            ORDER BY r
          ) a
          UNION
          SELECT title, r FROM
          (
            SELECT TOP ({num}) 
              title, 
              ABS(item - {item}) * 0.01 * (ABS(CHECKSUM(NewId())) % 127 + 1) r
            FROM wiki.article
            WHERE language = '{alang}'
              AND (soundexr = SOUNDEX(REVERSE('{a_title_latin}')) )
            ORDER BY r
          ) b 
        ) u
        ORDER BY r
        """
        cursor = cls.conn.cursor()
        cursor.execute(sqlstr)
        result = [] 
        for r in cursor.fetchall():
            if r[0] not in result: # order should be preserved and no duplicate
                result.append(r[0])
        if len(result) < num:
            sqlstr = f"""
            SELECT
              title
            FROM wiki.article
            WHERE language = '{alang}'
            ORDER BY ABS(item - {item}) * 0.0001 * (ABS(CHECKSUM(NewId())) % 127 + 1)
            OFFSET (1) ROWS FETCH NEXT ({num}) ROWS ONLY
            """
            cursor.execute(sqlstr)
            result.extend([r[0] for r in cursor.fetchall() if r[0] not in result])
        return result[:num]

    @classmethod
    def run_level(cls, lvl, board, qlang, alang, hypernym, recurr=0):
        level = cls.get_item_by_level(lvl, board, qlang, alang, hypernym)
        # when run out of current level, run next level; circle the ladder, stop when done a circle
        if level is None:
            recurr += 1
            if recurr > len(cls.ladder):
                return cls.final_score(board)
            return cls.run_level(1 if lvl == len(cls.ladder) else lvl+1, board, qlang, alang, hypernym, recurr)
        
        id,q_title,a_title,a_title_latin = level
        # query database to select items with similar sound
        similar_titles = cls.get_similar_titles(id, a_title_latin, alang)
        random.shuffle(similar_titles)
        correct_choice = similar_titles.index(a_title)
        return {
            'lvl': lvl, 
            'q_id': id, 
            'q_title': q_title, 
            'a_title': a_title, 
            'choices': similar_titles, 
            'answer': correct_choice,
            'board': board
        }

    @classmethod
    def next_quiz(cls, data):
        lvl, board, qid, qlang, alang, hypernym, is_correct = data['lvl'], data['board'], data['qid'], data['qlang'], data['alang'], data['hypernym'], data['is_correct']
        if lvl < 0: # start quiz
            lvl = 1
            for l in cls.ladder:
                board[str(l[0])] = []
        elif lvl > 0: # next quiz
            lvl, board = cls.level_up(lvl, board, qid) if is_correct else cls.level_down(lvl, board, qid)
        if lvl == 0: # end quiz
            return cls.final_score(board)
        return cls.run_level(lvl, board, qlang, alang, hypernym)

    @classmethod
    def final_score(cls, board):
        return {'score': round(cls.calculate_score(board),2), 'board': board}

    @classmethod
    def level_up(cls, lvl, board, qid):
        board[str(lvl)].append(qid)
        sample_size = len(board[str(lvl)])
        cr,beta = cls.correct_rate(lvl, board), random.betavariate(4,4)
        if cr > beta:
            if lvl == len(cls.ladder) and sample_size > cls.total_sample_size(board) * 0.0618:
                lvl = round(random.gammavariate(len(cls.ladder), 0.5)) # rebounce back from top
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
        score = 0
        for lvlstr in board:
            lvl = int(lvlstr)
            score += cls.correct_rate(lvl, board, final=True) * cls.level_items_count(lvl)
        return score / sum([l[3] for l in cls.ladder]) * 100

    @classmethod
    def correct_rate(cls, lvl, board, final=False):
        rate = 0
        sample_size = len(board[str(lvl)])/1.0
        if sample_size > 0:
            level_items_count = cls.level_items_count(lvl)
            miss_coef = math.log10((max(level_items_count-sample_size**2, 1)) / sample_size) + math.log1p(lvl)
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
