import math, random
from .query import Query

class Quiz:
    ladder = [ # lvl,lo_langcount,hi_langcount,num_of_items
        (1,95,320,1395),
        (2,80,110,1503),
        (3,72,90,1604),
        (4,64,75,1595),
        (5,58,66,1557),
        (6,54,62,1731),
        (7,51,58,1842),
        (8,48,54,2030),
        (9,46,51,1904),
        (10,43,48,2203),
        (11,42,46,1933),
        (12,39,43,2262),
        (13,38,41,1869),
        (14,36,39,2158),
        (15,34,37,2447),
        (16,33,35,1834),
        (17,32,34,1878),
        (18,31,33,1980),
        (19,30,32,2156),
        (20,29,31,2325),
        (21,28,30,2507),
        (22,27,29,2750),
        (23,27,28,1461),
        (24,26,27,1473),
        (25,25,26,1571),
        (26,24,25,1790),
        (27,23,24,1940),
        (28,22,23,2094),
        (29,21,22,2278),
        (30,2,21,2700),
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
        choices = Query.get_similar_titles(q_id, a_title_latin, alang, difficulty)
        random.shuffle(choices)
        answer = choices.index(a_title)
        return {
            'lvl': lvl, 
            'q_id': q_id, 
            'q_hypernym': q_hypernym, 
            'q_title': q_title,
            'q_title_en': q_title_en,
            'a_title': a_title, 
            'choices': choices, 
            'answer': answer,
            'board': board
        }
    
    @classmethod
    def run_fuzzy_level(cls, lvl, board, qlang, alang, hypernyms, difficulty, has_answer=False, recurr=0):
        hypernyms = [h for h in hypernyms if h > 0]
        hypernym_sample = random.sample(hypernyms, min(random.randint(3,30), len(hypernyms)))
        level = Query.get_fuzzy_level(cls.ladder[lvl-1], cls.played_correct(board), qlang, alang, hypernym_sample, difficulty, has_answer)
        # when run out of current level, run next level; circle the ladder, stop when done a circle
        #NOTE: hypernym will be randomized on each recursive run, possible premature termination
        if level is None:
            recurr += 1
            if recurr > len(cls.ladder):
                return cls.final_score(board)
            return cls.run_fuzzy_level(1 if lvl == len(cls.ladder) else lvl+1, board, qlang, alang, hypernyms, difficulty, has_answer, recurr)

        q_id, q_hypernym, q_title, q_title_en, a_title, a_title_latin = level[0][:6]
        choices = [row[4] for row in level[1:]] # wrong answers
        answer = -1
        if difficulty == 1 and has_answer:
            choices = [a_title]
            answer = 0
        elif has_answer:
            choices = Query.get_similar_titles(q_id, a_title_latin, alang, difficulty*2)[1:] + choices
            choices = list(filter(lambda s: s[-4:]!=a_title[-4:] and s[:5]!=a_title[:5], choices))
            choices = random.sample(choices, difficulty-1)
            choices.append(a_title)
            random.shuffle(choices)
            answer = choices.index(a_title)
        return {
            'lvl': lvl, 
            'q_id': q_id, 
            'q_hypernym': q_hypernym, 
            'q_title': q_title,
            'q_title_en': q_title_en,
            'a_title': a_title, 
            'choices': choices, 
            'answer': answer,
            'board': board
        }

    @classmethod
    def next_quiz(cls, data):
        lvl, board, qid, qlang, alang, hypernyms, is_correct, difficulty, match_mode =  \
        data['lvl'], data['board'], data['qid'], data['qlang'], data['alang'], data['hypernym'], data['is_correct'], data['difficulty'], data['match_mode']
        if (not isinstance(qlang, str) or not isinstance(alang, str) 
            or '--' in alang or '--' in qlang or len(alang) > 12 or len(qlang) > 12 
            or difficulty not in [1,2,3,4,6,8,9,12,16,24,36,54]
            or match_mode not in [0,1,2]):
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
        if match_mode == 1 or match_mode == 2:
            must_has_answer = match_mode == 1
            return cls.run_fuzzy_level(lvl, board, qlang, alang, hypernyms, difficulty, must_has_answer)

    @classmethod
    def final_score(cls, board):
        return {'score': round(cls.calculate_score(board),2), 'board': board}

    @classmethod
    def level_up(cls, lvl, board, qid):
        if qid != 0:
            board[str(lvl)].append(qid)
        cr,beta = cls.correct_rate(lvl, board), random.betavariate(10,10)
        if cr > beta:
            sample_size = len(board[str(lvl)])
            if lvl == len(cls.ladder) and sample_size > cls.total_sample_size(board) * 0.0618:
                lvl = 1 # round(random.gammavariate(len(cls.ladder), 0.2)) # rebounce back from top
            else:
                lvl += 1
        lvl = min(lvl, len(cls.ladder))
        return lvl, board

    @classmethod
    def level_down(cls, lvl, board, qid):
        if qid != 0:
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
        return score / total * 100 if total > 0 else 0

    @classmethod
    def correct_rate(cls, lvl, board, final=False):
        rate = 0
        sample_size = len(board[str(lvl)])/1.0
        if sample_size > 0:
            correct_count = len([k for k in board[str(lvl)] if k > 0])
            level_items_count = cls.level_items_count(lvl)
            miss_coef = math.log10((max(level_items_count-sample_size**3, 1)) / (sample_size+1)) + math.log1p(lvl)
            if final:
                miss_coef = max(miss_coef * lvl / len(cls.ladder)**2, 0)
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
