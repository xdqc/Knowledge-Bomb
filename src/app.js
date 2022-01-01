new Vue({
  el: '#app',
  data: {
    quoteLang: '',
    quoteQuote: '',
    quoteTitle: '',
    qlang: '',
    alang: '',
    qlang_options: [{ value: '', text: '(Question Language)' }],
    alang_options: [{ value: '', text: '(Answers Language)' }],
    aLeximap: [],
    qLeximap: [],
    q_title: '',
    q_title_en: '',
    q_id: 0,
    q_hypernym: 0,
    lvl: 1,
    board: {},
    choices: [],
    answer: -1,
    score: -1,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    isCollapsingBomb: true,
    displayTitleImage: true,
    displayTopQuote: true,
    displayHypernymTree: false,
    startBtnDisabled: false,
    progressAnimate: false,
    touchTimer: null,
    touchTimerLong: null,
    hypernyms: [],
    hypernym_list: [],
    hypernym_tree: [],
    hypernym_lang: [],
    hypernym_index: 1,
    match_mode: 0,
    difficulty: 4,
    difficultyLvl: 4,
    difficulties: [
      {value: 1, icon:'1️⃣', tooltip:'Wanderer', keymap:{'7':0,'8':0,'9':0}},
      {value: 2, icon:'2️⃣', tooltip:'Picnic', keymap:{'7':0,'8':0,'9':0,'4':1,'5':1,'6':1,'g':1,'u':1,'c':1,'i':1,'r':1,'o':1}},
      {value: 3, icon:'3️⃣', tooltip:'Casual', keymap:{'7':0,'8':0,'9':0,'4':1,'5':1,'6':1,'g':1,'u':1,'c':1,'i':1,'r':1,'o':1,'1':2,'2':2,'3':2,'h':2,'j':2,'t':2,'k':2,'n':2,'l':2}},
      {value: 4, icon:'4️⃣', tooltip:'Easy', keymap:{'7':0,'8':1,'4':2,'g':2,'u':2,'5':3,'c':3,'i':3}},
      {value: 6, icon:'6️⃣', tooltip:'Mild', keymap:{'7':0,'8':1,'4':2,'g':2,'u':2,'5':3,'c':3,'i':3,'1':4,'h':4,'j':4,'2':5,'t':5,'k':5}},
      {value: 8, icon:'8️⃣', tooltip:'Moderate', keymap:{'7':0,'8':1,'4':2,'g':2,'u':2,'5':3,'c':3,'i':3,'1':4,'h':4,'j':4,'2':5,'t':5,'k':5,'0':6,'m':6,'.':7,'w':7,',':7}},
      {value: 9, icon:'9️⃣', tooltip:'Intricate', keymap:{'7':0,'8':1,'9':2,'4':3,'g':3,'u':3,'5':4,'c':4,'i':4,'6':5,'r':5,'o':5,'1':6,'h':6,'j':6,'2':7,'t':7,'k':7,'3':8,'n':8,'l':8}},
      {value:12, icon:'1️⃣2️⃣', tooltip:'Devious', keymap:{}},
      {value:16, icon:'1️⃣6️⃣', tooltip:'Fiendish', keymap:{}},
      {value:24, icon:'2️⃣4️⃣', tooltip:'Mephistophelian', keymap:{}},
      {value:36, icon:'3️⃣6️⃣', tooltip:'Diabolical', keymap:{}},
      {value:54, icon:'5️⃣4️⃣', tooltip:'Maelstrom', keymap:{}},
    ]
  },
  mounted: function() {
    ;((saveState) => {
      // Set languages based on cookie, otherwise use browser languages
      if (saveState.length >= 3) {
        this.alang = saveState[0]
        this.qlang = saveState[1]
        this.match_mode = saveState[2]
      } else {
        let browserLangs = [...window.navigator.languages.reduce((s,a)=>{s.add(a.slice(0,2));return s},new Set())]
        this.alang = browserLangs[0] ? browserLangs[0] : ''
        this.qlang = browserLangs[1] ? browserLangs[1] : ''
      }
      // Hold v-model="qlang" in qlang_options, before async qLeximap() finish populating qlang_options
      this.alang_options.push({value: this.alang})
      this.qlang_options.push({value: this.qlang})

      fetch(`${window.location.origin}/language`)
      .then(resp => resp.json())
      .then(data => {
        this.alang_options = data
        // populate language lexical map selector
        this.aLeximap = data.filter(d => d.coord_x > 0).map(d=>({
          value: d.value,
          text: d.text,
          coord_x: d.coord_x,
          coord_y: d.coord_y,
        }))
        // show leximap on large screen
        if (this.windowWidth>1200 && this.windowHeight>950) {
          document.querySelector('.dropdown-lang .dropdown-toggle').click()
        }
      })
      .then(() => { this.popHypernym(true) })
      .catch((err) => { console.error(err) })
    })(this.getCookieValue('l').split('+'))

    ;((cdl) => {
      if (cdl) this.difficultyLvl = parseInt(cdl.slice(cdl.length-1),16) || this.difficultyLvl
    })(this.getCookieValue('d'))

    window.addEventListener('keydown', (e) => {
      if(this.quizStarted) {
        const getBtnIdxByKey = (key,dif) => this.difficulties[dif].keymap[key]
        const btnIdx = (key) => getBtnIdxByKey(key, this.difficultyIndex-1)
        const btnC = (idx) => document.getElementById('choice-'+idx)
        const c = btnC(btnIdx(e.key))
        if (c) c.click()
        
        if (e.key == 'a' || e.key == 'Escape') document.getElementById('btn-bomb').click()
        if (e.key == '*' || e.key == 'y') this.speakTitle()
        if (e.key == '/' || e.key == 's') this.speakQuote()
        if (e.key == '-' || e.key == 'd') this.toggleDisplayTitleImg()
        if (e.key == '+' || e.key == 'f') document.getElementsByClassName('title-link')[0].click()
      }
    })

    window.onresize = () => {
      this.windowWidth = window.innerWidth
    }
    window.onbeforeunload = () => {
      if (this.quizStarted) return ''
    }
  },
  watch: {
    alang: function() {
      if (!!this.alang) this.fetchLeadQuote()
    },
  },
  computed: {
    showScore() {
      return this.score >= 0
    },
    quizStarted() {
      return this.choices && this.choices.length > 0 && this.score < 0
    },
    qlangOptions() {
      return this.match_mode === 1 ? this.qlang_options : this.qlang_options.filter(l => l.value != this.alang)
    },
    alangOptions() {
      return this.alang_options
    },
    alangOpt() {
      return this.alang_options.find(l => l.value === this.alang) || { value: '', text: '', label_a: '', label_q: '', label_s: '', label_t: '', label_m0: '', label_m1: ''}
    },
    qlangOpt() {
      return this.qlang_options.find(l => l.value === this.qlang) || { value: '', text: '', label_a: '', label_q: '', label_s: '', label_t: '', label_m0: '', label_m1: ''}
    },
    quotelangOpt() {
      return this.qlang_options.find(l => l.value === this.quoteLang)
    },
    labelQuestion() {
      return this.alangOpt.label_q || this.alang_options[0].label_q
    },
    labelAnswer() {
      return this.alangOpt.label_a || this.alang_options[0].label_a
    },
    labelGameStart() {
      return this.alangOpt.label_s || this.alang_options[0].label_s
    },
    labelPageTitle() {
      if (this.quizStarted) return ''
      return this.alangOpt.label_t || this.alang_options[0].label_t
    },
    match_mode_options() {
      return [
        { text: `🙂 ${this.alangOpt.label_m0 || this.alang_options[0].label_m0 || ''} ${this.qlangOpt.text}`, value: 0 },
        { text: `😎 ${this.alangOpt.label_m1 || this.alang_options[0].label_m1 || ''} ${this.qlangOpt.text}`, value: 1 },
      ]
    },
    difficultyIndex() {
      return this.difficulties.findIndex(d => d.value == this.difficulty)+1
    },
    levelMaxCap(){
      return Object.keys(this.board).length
    },
    levelPlayed(){
      return Object.values(this.board).filter(v => v.length>0).length
    },
    quizPlayed() {
      return Object.values(this.board).reduce((s,v) => s+v.length, 0)
    },
    quizCorrect() {
      return Object.values(this.board).reduce((s,v) => s+v.filter(u=>u>0).length, 0)
    },
    qHypernymTexts() {
      // The hypernyme of current question as topics for quote search 
      // hypernym_option.texts [0]:English, [1]:<Answer Language>, [2]<Question Language>
      const hypernym = this.hypernym_list.find(h=>h.value === this.q_hypernym)
      if (hypernym) return hypernym.texts
      else return [null,null,null]
    },
    choiceHeight() {
      this.windowWidth
      let row = document.getElementsByClassName('choices')[0]
      let width =  window.getComputedStyle(row).width.slice(0, -2)
      return Math.ceil(width / this.difficulty * Math.floor(Math.sqrt(this.difficulty)))
    },
    choiceFontSize() {
      this.windowWidth && this.difficulty
      let row = document.getElementsByClassName('choices')[0] 
      let width =  window.getComputedStyle(row).width.slice(0, -2)
      return Math.ceil(width / 10 / Math.sqrt(this.difficulty) * (1+(Math.sqrt(this.difficulty)-1)/12))
    },
    showBottomAlert() {
      return !this.getCookieValue('lang')
    },
    showDifficulties() {
      return this.difficulties
        .slice(0, this.difficultyLvl+1)
        .map((d,i) => {
          const dd = JSON.parse(JSON.stringify(d))
          if (i===this.difficultyLvl && i!==this.difficulties.length) {
            dd.disabled = true
            dd.icon = '️??'
            dd.tooltip = 'Reach all levels in the previous difficulty to unlock'
          }
          if (i===0 && this.difficultyLvl<=this.difficulties.length-0) {
            dd.disabled = true
            dd.icon = '??'
            dd.hide = this.difficultyLvl<this.difficulties.length
            dd.tooltip = `Finish the last difficulty to unlock`
          }
          return dd 
        })
        .sort((a,b) => a.value-b.value)
    },
    hotkeyTable() {
      const groupBy = (xs, k, f) => xs.reduce((r,x) => {
        (r[x[k]] = r[x[k]] || []).push(f(x))
        return r
      }, {}) 
      const g = groupBy(Object.entries(this.difficulties[this.difficultyIndex-1].keymap), 1, (x)=>x[0])
      const gt = Object.entries(g).map(([k,v]) => ({ 
        Key: v.map(k=>k.length==1 ? k.toUpperCase() : k), 
        Description: `choose "${this.choices[k]}"`,
      }))

      return [
        {Key: ['A','Esc'], Description: `toggle category selector`},
        {Key: ['-','D'], Description: `dispaly or hide image`},
        {Key: ['/','S'], Description: `say <quote> in ${this.quotelangOpt ? this.quotelangOpt.text : this.alangOpt.text }`},
        {Key: ['*','Y'], Description: `yell "${this.q_title}" in ${this.qlangOpt.text}`},
        {Key: ['+','F'], Description: `find "${this.q_title}" on ${this.qlang}.wikipedia.org`},
        ...gt
      ]
    },
  },
  asyncComputed: {
    async titleImageUrl() {
      if (!this.displayTitleImage) return 'javascript:void(0)'

      const IMG_TYPE = ['collage','trid','schem','chem','pic','dist','locator','taxnrg','flag','logo','icon','rimg']
      const sparqalQuery = `
SELECT ?item ${IMG_TYPE.map(t=>'?'+t).join(' ')} {
  VALUES (?item) {(wd:Q${this.q_id})}
  OPTIONAL { ?item wdt:P2716 ?collage }
  OPTIONAL { ?item wdt:P4896 ?trid }
  OPTIONAL { ?item wdt:P5555 ?schem }
  OPTIONAL { ?item wdt:P117 ?chem }
  OPTIONAL { ?item wdt:P18 ?pic }
  OPTIONAL { ?item wdt:P1846 ?dist }
  OPTIONAL { ?item wdt:P242 ?locator }
  OPTIONAL { ?item wdt:P181 ?taxnrg }
  OPTIONAL { ?item wdt:P41 ?flag }
  OPTIONAL { ?item wdt:P154 ?logo }
  OPTIONAL { ?item wdt:P2910 ?icon }
  OPTIONAL { ?item wdt:P6802 ?rimg }
}`
      const resp = await fetch(`https://query.wikidata.org/sparql?query=${sparqalQuery}`, {
        headers: {'Accept':'application/json'},
      })
      const data = await resp.json()
      const imgUrls = IMG_TYPE.map(i => {
        const t = data.results.bindings.filter(b => b[i])
        return t.length>0 ? t[Math.floor(t.length*Math.random())][i].value : null
      })
      //DEBUG - add wikidata img
      // if (imgUrls.find(i=>i)){
      //   setTimeout(() => {
      //     document.getElementById('choice-'+this.answer).click()
      //   }, 300);
      // } else {
      //   document.getElementsByClassName('title-link')[0].click()
      //   window.open(data.results.bindings[0].item.value, '_blank')
      //   // setTimeout(() => {
      //   //   document.getElementById('choice-'+Math.floor(Math.random()*0+this.answer)%9).click()
      //   // }, 100);
      // }
      // return '#'
      //END_DEBUG
      return imgUrls.find(i=>i) || '#'
    },
    async qLeximap() {
      if (!this.alang) return
      const resp = await fetch(`${window.location.origin}/language?lang=${this.alang}`)
      const data = await resp.json()
      this.qlang_options = data
      return data.filter(l => l.coord_x > 0)
    },
  },
  methods: {
    //#region Game Actions
    setDifficulty: function(df) {
      this.difficulty = df
      this.newGame()
    },

    newGame: async function() {
      if (!this.qlang || !this.alang) {
        alert('no language selected')
      }
      this.score = -1
      this.startBtnDisabled = true

      try {
        const resp = await fetch(`${window.location.origin}/next`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(this.packPayload(-1, 0, {}, true))
        })
        const data = await resp.json()
        this.lvl = data.lvl
        this.board = data.board
        if (data.score >= 0) {
          this.gameOverAction(data.score)
        } else {
          this.popHypernym()
          if (this.match_mode == 0) {
            this.unpackRespData(data)
            this.gameStartAction()
          } else if (this.match_mode == 1) {
            await this.fetchFuzzyAnswer(data);
            this.gameStartAction()
          }
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.startBtnDisabled = false
        fetch(`${window.location.origin}/save-languages`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({alang: this.alang, qlang: this.qlang, mode: this.match_mode})
        })
      }
    },

    endGame: async function() {
      try {
        const resp = await fetch(`${window.location.origin}/next`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(this.packPayload(0, 0, this.board, false))
        })
        const data = await resp.json()
        setTimeout(() => {
          this.board = data.board
          this.gameOverAction(data.score)
        }, 200);
      } catch (error) {
        console.error(error)
      }
    },

    selectChoice: async function(e, index) {
      e.preventDefault()
      e.target.classList.remove('btn-secondary')
      if (this.difficulty > 1) {
        e.target.classList.add(this.answer === index ? 'btn-success' : 'btn-danger')
      }
      document.querySelectorAll('.btn-choice').forEach(b => b.disabled = true)
      this.progressAnimate = true

      try {
        const resp = await fetch(`${window.location.origin}/next`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(this.packPayload(this.lvl, this.q_id, this.board, this.answer===index))
        })
        const data = await resp.json()
        this.lvl = data.lvl
        this.board = data.board
        if (data.score >= 0) {
          this.gameOverAction(data.score)
        } else if (this.match_mode == 0) {
          this.unpackRespData(data)
        } else if (this.match_mode == 1) {
          await this.fetchFuzzyAnswer(data);
        }

        if (this.displayTopQuote) {
          // Update wikiquote foreach question
          this.fetchLeadQuote([
            this.choices[this.answer], 
            this.qHypernymTexts[1], 
            this.q_title_en, 
            this.qHypernymTexts[0]
          ])
        }
      } catch (err) {
        console.error(err)
      } finally {
        document.querySelectorAll('.btn-choice').forEach(b => b.disabled = false)
        e.target.classList.add('btn-secondary')
        if (this.difficulty > 1) {
          e.target.classList.remove('btn-success')
          e.target.classList.remove('btn-danger')
        }
        e.target.blur() // Desktop browser: remove focus on anchor; TODO: blur on iOS safari
        e.handled = true
        this.progressAnimate = false
      }
    },
    //#endregion
    
    //#region Fuzzy answer
    fetchFuzzyAnswer: async function(fqdata) {
      const ans = await this.queryFuzzyAnswer(fqdata.q_id, this.alang);
      console.log(fqdata.q_id,fqdata.q_title,ans);
      if (!ans.aid || !ans.atitle) {
        //TODO: fail to fetch fuzzy answer, retry another q_id
      }
      this.unpackRespData(fqdata);
      this.choices = [ans.atitle, ...fqdata.choices];
      this.shuffleArray(this.choices);
      this.answer = this.choices.indexOf(ans.atitle);
    },

    queryFuzzyAnswer: async function(item, lang) {
      let ans = await this.sparqlGetSiblings(item, lang, '', '', true)
      if (ans.isFuzzy) return { aid: ans.aid, atitle: ans.atitle }
      console.info('Expand Class...', item, lang, ans)
      ans = await this.sparqlGetSiblings(item, lang, 'wdt:P31?', 'wdt:P31?')
      if (ans.isFuzzy) return { aid: ans.aid, atitle: ans.atitle }
      console.info('Expand SubClass...', item, lang, ans)
      ans = await this.sparqlGetSiblings(item, lang, 'wdt:P31?', 'wdt:P31?/wdt:P279')
      if (ans.isFuzzy) return { aid: ans.aid, atitle: ans.atitle }
      console.info('Expand SuperClass...', item, lang, ans)
      ans = await this.sparqlGetSiblings(item, lang, 'wdt:P31?/wdt:P279', 'wdt:P31?/wdt:P279?')
      if (ans.isFuzzy) return { aid: ans.aid, atitle: ans.atitle }
      console.info('Expand SuperSuperClass...', item, lang, ans)
      ans = await this.sparqlGetSiblings(item, lang, 'wdt:P31?/wdt:P279/wdt:P279', 'wdt:P31?/wdt:P279?')
      if (ans.isFuzzy) return { aid: ans.aid, atitle: ans.atitle }
      console.info('Expand scopes failure...', item, lang, ans)
      return { aid: ans.aid, atitle: ans.atitle }
    },

    sparqlGetSiblings: async function(item, lang, upscope='wdt:P31?', downscope='wdt:P31?', related=false) {
      let aid = 0
      let atitle = ''
      let isFuzzy = false
      const sparqalQuery = related
//Possible related items P171 P361 P366 P373 P527 P1535 P1659 P2283 P4969
// excluding P31?/P279*
// dropped canditates P1552 has_quality, P1889 different_from, P373 common_category
?`SELECT DISTINCT * WHERE {
{
  SELECT DISTINCT
  ?sim ?simLabelA  
    WHERE {
    wd:Q${item} wdt:P361? ?whole .
    ?sim wdt:P361? ?whole .
    ?sim rdfs:label ?simLabelA filter (lang(?simLabelA) = '${lang}').
    }
}
UNION
{
  SELECT DISTINCT
  ?sim ?simLabelA 
    WHERE {
    wd:Q${item} wdt:P527? ?part .
    ?sim wdt:P527? ?part .
    ?sim rdfs:label ?simLabelA filter (lang(?simLabelA) = '${lang}').
    }
}
UNION
{
  SELECT DISTINCT
  ?sim ?simLabelA 
    WHERE {
    wd:Q${item} wdt:P366? ?use .
    ?sim wdt:P366? ?use .
    ?sim rdfs:label ?simLabelA filter (lang(?simLabelA) = '${lang}').
    }
}
UNION
{
  SELECT DISTINCT
  ?sim ?simLabelA 
    WHERE {
    wd:Q${item} wdt:P1535? ?useby .
    ?sim wdt:P1535? ?useby .
    ?sim rdfs:label ?simLabelA filter (lang(?simLabelA) = '${lang}').
    }
}
UNION
{
  SELECT DISTINCT
  ?sim ?simLabelA 
    WHERE {
    wd:Q${item} wdt:P2283? ?uses .
    ?sim wdt:P2283? ?uses .
    ?sim rdfs:label ?simLabelA filter (lang(?simLabelA) = '${lang}').
    }
}
UNION
{
  SELECT DISTINCT
  ?sim ?simLabelA 
    WHERE {
    wd:Q${item} wdt:P171? ?ptax .
    ?sim wdt:P171? ?ptax .
    ?sim rdfs:label ?simLabelA filter (lang(?simLabelA) = '${lang}').
    }
}
UNION
{
  SELECT DISTINCT
  ?sim ?simLabelA 
    WHERE {
    wd:Q${item} wdt:P4969? ?deriv .
    ?sim wdt:P4969? ?deriv .
    ?sim rdfs:label ?simLabelA filter (lang(?simLabelA) = '${lang}').
    }
}
UNION
{
  SELECT DISTINCT
  ?sim ?simLabelA 
    WHERE {
    wd:Q${item} wdt:P1659? ?see .
    ?sim wdt:P1659? ?see .
    ?sim rdfs:label ?simLabelA filter (lang(?simLabelA) = '${lang}').
    }
}
}
ORDER BY UUID() 
LIMIT 2`
//NOTE: Because the `?` after upscope P31, directchild is also possible, so sim actually means children and their uncles
// exclude classes of concept, term, blanket terminology, technical term
:`SELECT DISTINCT ?sim ?simLabelA 
WHERE
{
    wd:Q${item} ${upscope} ?class.
    FILTER (?class not in (wd:Q151885, wd:Q1969448, wd:Q4925178, wd:Q12812139))
    ?sim ${downscope} ?class .
    ?sim rdfs:label ?simLabelA filter (lang(?simLabelA) = '${lang}').
}
ORDER BY uuid()
LIMIT 2`
      try {
        const resp = await fetch(`https://query.wikidata.org/sparql?query=${sparqalQuery}`, {
          headers: {'Accept':'application/json'},
        })
        const data = await resp.json()
        for(let b of data['results']['bindings']) {
          aid = parseInt(b['sim']['value'].split('Q')[1]) || aid
          atitle = b['simLabelA']['value'] || atitle
          if (aid != item) {
            isFuzzy = true
            break
          }
        }
      } catch (err) {
        console.error(item,lang,err,sparqalQuery)
      } finally {
        atitle = atitle ? atitle.charAt(0).toUpperCase()+atitle.substring(1) : atitle
        return { aid, atitle, isFuzzy }
      }
    },
    //#endregion

    //#region Game Actions Helper
    packPayload: function(lvl, qid, board, is_correct) {
      //good DRY, bad DRY?
      return {
        lvl: lvl,
        board: board,
        qid: qid,
        qlang: this.qlang,
        alang: this.alang,
        hypernym: this.hypernyms,
        is_correct: is_correct,
        difficulty: this.difficulty,
        match_mode: this.match_mode,
      }
    },
    unpackRespData: function(data) {
      this.q_id = data.q_id
      this.q_hypernym = data.q_hypernym
      this.q_title = data.q_title
      this.q_title_en = data.q_title_en
      this.choices = data.choices
      this.answer = data.answer
    },

    gameStartAction: function() {
      if (this.windowWidth <= 576) {
        document.getElementById('btn-toggle-quote').click()
      }
      document.getElementById('page-header').classList.add('py-0','mb-0')
    },
    gameOverAction: function(score) {
      this.score = score
      this.choices = []
      this.q_id = 0
      this.q_title = ''
      this.q_title_en = ''
      this.q_hypernym = ''
      document.getElementById('page-header').classList.remove('py-0', 'mb-0')
      this.displayTopQuote = true

      // recalculate available difficulties
      if (this.difficultyLvl === this.difficultyIndex 
        && this.score > 0
        && this.levelPlayed === Object.keys(this.board).length) {
        this.difficultyLvl = Math.min(this.difficulties.length+1, this.difficultyLvl+1)
      }
      fetch(`${window.location.origin}/save-difficulty-level`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({difficultyLvl: this.difficultyLvl})
      })
    },
    //#endregion

    //#region Game Scores
    scoreBar: function(v) {
      // fold list of int to subgroup of consecutive pos/neg count
      return JSON.parse(JSON.stringify(v)).reduce((arr,next) => {
        let end = arr[arr.length-1] || 0
        if (end*next > 0) arr[arr.length-1] += Math.sign(next)
        else arr.push(Math.sign(next))
        return arr
      }, [])
    },
    //#endregion Game Scores

    //#region Language picker
    onClickLeximapBtnAlang: function(e, lexi) {
      this.alang = lexi.value
      e.target.parentElement.previousSibling.click()
    },
    onClickLeximapBtnQlang: function(e, lexi) {
      this.qlang = lexi.value
      e.target.parentElement.previousSibling.click()
    },
    //#endregion Language picker

    //#region Question Title interactions
    speakTitle: function(e,i) {
      let text = i >=0 ? this.choices[i] : this.q_title
      let lang = i >=0 ? this.alang : this.qlang
      lang = this.toMajorLang(lang, true)
      let langVoices = this.getSpeechSynthesisVoices(lang)
      let sp = new SpeechSynthesisUtterance(text)
      sp.voice = langVoices[Math.floor(Math.random()*langVoices.length)]
      speechSynthesis.cancel()
      speechSynthesis.speak(sp)
    },

    // for mobile devices
    touchStart: function(e, i) {
      var that = this
      this.touchTimer = setTimeout(()=> {
        that.speakTitle(e,i)
      }, 400)
      this.touchTimerLong = setTimeout(()=> {
        let title = this.choices[i] || this.q_title
        let lang = this.choices[i] ? this.alang : this.qlang
        window.open(`https://${lang}.wikipedia.org/wiki/${title}`, '_blank')
      }, 2000)
    },
    touchEnd: function(e) {
      clearTimeout(this.touchTimer)
      clearTimeout(this.touchTimerLong)
    },
    //#endregion Question Title interactions

    //#region Wikiquote
    fetchLeadQuote: function(topics, isMatch) {
      if (!!topics) topics = topics.filter(t => !!t).map(t => t.replace(/\(/m, '|').replace(/\)/m, ''))
      // onclick(for match), use existing quoteLang
      let quoteLang = isMatch ? this.quoteLang : this.toMajorLang(this.alang)
      let depth = 0
      const resolve = (q) => {
        depth++
        if (q.quote) {
          this.quoteLang = quoteLang
          this.quoteQuote = q.quote
          this.quoteTitle = '—— '+q.titles
        } else {
          Wikiquote(quoteLang).getRandomQuote((depth<10?topics:[]), resolve, reject)
        }
      }
      const reject = (err) => {
        if (!['nosuchsection', 'noPageCategories', 'unPageCategories'].includes(err.code)) {
          quoteLang = 'en'
        }
        Wikiquote(quoteLang).getRandomQuote(
          ((err.code == 'queryGeneratorLinksNoAlang' || err.code == 'queryGeneratorLinksNoResultAlang') && this.alang != 'en') ? topics : [],
          resolve, reject)
      }
      Wikiquote(quoteLang).getRandomQuote(topics, resolve, reject, isMatch)
    },
    
    speakQuote: function() {
      const sp = new SpeechSynthesisUtterance(this.quoteQuote)
      const lang = this.toMajorLang(this.quoteLang=='en'?'en':this.alang, true)
      const langVoices = this.getSpeechSynthesisVoices(lang)
      sp.voice = langVoices[Math.floor(Math.random()*langVoices.length)]
      speechSynthesis.cancel()
      speechSynthesis.speak(sp)
    },
    //#endregion Wikiquote
  
    //#region Hypernym options
    popHypernym: function(onMount) {
      fetch(`${window.location.origin}/hypernym?al=${this.alang}&ql=${this.qlang}`)
      .then(resp => resp.json())
      .then(data => {
        data.forEach(h => {
          h.texts = h.texts.map(t => t ? t : h.texts[0]).map(t => t.replace(/ *\([^)]*\) */g, ''))
          // add "text" property as ViewModel of checkbox options group
          h.text = h.texts[this.hypernym_index]
        })
        this.hypernym_lang = ['en', this.alang, this.qlang]
        this.hypernym_tree = data
        this.hypernym_list = data.map(h => ({
          value: h.value,
          texts: h.texts,
          text: h.text,
        }))
        this.sortHypernymTree()
        
        if (onMount) {
          // by default fill-in all hypernyms, excluding language==315
          this.hypernyms = data.filter(h=>h.value!==315).map(h=>h.value)
        } else {
          this.sortHypernymList()
        }
      })
    },
    sortHypernymList: function() {
      this.hypernym_list.sort((h1,h2) => h1.text.localeCompare(h2.text, this.toMajorLang(this.hypernym_index==2?this.qlang:this.alang)))
    },
    sortHypernymTree: function() {
      this.hypernym_tree.sort((h1,h2) => h1.place-h2.place)
      setTimeout(() => {
        this.hypernym_tree.forEach(h => {
          const node = document.querySelector(`.tree-hypernyms input[value="${h.value}"]`)
          node.parentElement.style['margin-left'] = h.depth*1 + 'rem'
        })
      }, 1);
    },
    switchHypernymLang: function() {
      this.hypernym_index = (this.hypernym_index+1)%3
      this.hypernym_list.forEach(h => h.text=h.texts[this.hypernym_index])
      this.hypernym_tree.forEach(h => h.text=h.texts[this.hypernym_index])
      if (!this.quizStarted && 
          !(this.hypernym_lang[1] == this.alang && this.hypernym_lang[2] == this.qlang)) {
        this.popHypernym()
      } else if (!this.displayHypernymTree) {
         this.sortHypernymList()
      }
    },
    reverseHypernymSelect: function() {
      this.hypernyms = this.hypernym_list
      .map(h => h.value)
      .filter(v => this.hypernyms.indexOf(v)<0)
    },
    toggleDisplayHypernymTree: function() {
      this.displayHypernymTree = !this.displayHypernymTree
      document.getElementById('btn-toggle-hypernym-tree').textContent = this.displayHypernymTree ? '🎄' : '🌲'
      document.getElementById('btn-toggle-hypernym-tree').title = this.displayHypernymTree ? 'to list' : 'to tree'
      this.displayHypernymTree || this.sortHypernymList()
    },
    //#endregion Hypernym options

    //#region Menu interactions
    toggleDisplayQuote: function(e) {
      this.displayTopQuote = !this.displayTopQuote
      document.getElementById('btn-toggle-quote').textContent = this.displayTopQuote ? '🧙💬' : '🧙🔇'
      document.getElementById('btn-toggle-quote').title = this.displayTopQuote ? "If you can't keep quiet, shut up!" : "shut up and shine"
    },

    toggleCollapseBomb: function(e) {
      this.isCollapsingBomb = !this.isCollapsingBomb
      document.getElementById('btn-bomb').textContent = this.isCollapsingBomb ? '💣' : '💥'
      document.getElementById('btn-bomb').title = this.isCollapsingBomb ? 'detonator' : `B${'o'.repeat(Math.max(2,this.quizCorrect))}m!`
    },
        
    toggleDisplayTitleImg: function() {
      this.displayTitleImage = !this.displayTitleImage
      document.getElementById('btn-toggle-image').textContent = this.displayTitleImage ? '🖼' : '⬜'
      document.getElementById('btn-toggle-image').title = this.displayTitleImage ? 'hide image' : 'hint image'
    },
    //#endregion Menu interactions

    //#region Utils
    getCookieValue: function(name) {
      const m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')
      return m ? m.pop()||'' : '4'
    },
    toMajorLang: function(lang, isSpeaking) {
      const MAJOR_LANG = {
        'nl': ['fy', 'frr', 'af', 'nds-nl', 'li', 'vls'],
        'de': ['lb', 'bar', 'als', 'nds', 'stq', 'pdc', 'got'],
        'es': ['an','ast', 'ext'],
        'pt': ['mwl'],
        'fr': ['oc', 'co', 'wa', 'nrm', 'pcd', 'frp', 'ht', 'gcr'],
        'it': ['sc', 'vec', 'lmo', 'scn', 'pms', 'fur', 'nap', 'lij'],
        'ru': ['be', 'ce', 'inh', 'os', 'cv', 'tt', 'crh', 'ba', 'xal', 'kk', 'ky', 'sah', 'tyv', 'tg','bxr', 'rue'],
        'hi': ['pa', 'gu', 'bh', 'mr', 'si', 'sa', 'ne', 'bn', 'kn', 'or', 'te', 'ml', 'ta'],
        'zh': ['zh-yue', 'hak', 'cdo', 'wuu', 'gan', 'zh-classical'],
        'id': ['ms', 'jv', 'su', 'mg']
      }
      if (isSpeaking) {
        MAJOR_LANG.es.push('ca', 'eu')
        MAJOR_LANG.pt.push('gl')
        MAJOR_LANG.it.push('eo','la')
        MAJOR_LANG.ru.push('uk', 'bg', 'sr')
        MAJOR_LANG.pl = ['cs', 'sk', 'sl', 'hr', 'bs']
        MAJOR_LANG.zh = []
        MAJOR_LANG['zh-CN'] = ['zh', 'wuu', 'gan', 'zh-classical']
        MAJOR_LANG['zh-HK'] = ['zh-yue', 'hak']
        MAJOR_LANG['zh-TW'] = ['zh-min-nan', 'cdo']
        const voiceLangs = new Set(speechSynthesis.getVoices().map(v => v.lang.slice(0,2)))
        for (let k of Object.keys(MAJOR_LANG)){
          MAJOR_LANG[k] = MAJOR_LANG[k].filter(l => !voiceLangs.has(l))
        } 
      }
      for (let e of Object.entries(MAJOR_LANG)){
        if (e[1].indexOf(lang) >= 0) return e[0]
      }
      return lang || 'en'
    },
    transLangCode: function(lang) {
      // resolve diff b/w WMF & IETF
      const TRANS = {
        'be-x-old': 'be-tarask',
        'bh': 'bho',
        'cbk-sam': 'cbk',
        'fiu-vro': 'vro',
        'zh-min-nan': 'nan',
        'zh-yue': 'yue',
      }
      return TRANS[lang] || lang
    },
    getSpeechSynthesisVoices: function(lang) {
      const sliceLen = lang.startsWith('zh-') ? 5 : 2
      let langVoices = speechSynthesis.getVoices().filter(v => v.lang.slice(0,sliceLen) == lang)
      if (langVoices.length == 0) {
        langVoices = speechSynthesis.getVoices().filter(v => v.lang.slice(0,2) == 'en')
      }
      return langVoices
    },
    /** Randomize array in-place using Durstenfeld shuffle algorithm */
    shuffleArray: function(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    },
    //#endregion Utils
  },
})
