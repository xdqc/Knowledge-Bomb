import math, random
from .query import Query

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
        wrong_choices = [row[4] for row in level[1:]]
        #NOTE: the fuzzy answer search is passed on clientside
        # a_title = level[1][4]
        # choices = [row[4] for row in level[1:]]
        # random.shuffle(choices)
        # correct_choice = choices.index(a_title)
        return {
            'lvl': lvl, 
            'q_id': q_id, 
            'q_hypernym': q_hypernym, 
            'q_title': q_title,
            'q_title_en': q_title_en,
            'a_title': None, 
            'choices': wrong_choices, 
            'answer': -1,
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
