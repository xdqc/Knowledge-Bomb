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
    q_title: '',
    q_title_en: '',
    q_desc: '',
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
    displayTopQuote: true,
    displayTitleImage: true,
    displayScoreChart: false,
    displayTitleLeximap: false,
    displayHypernymTree: false,
    startBtnDisabled: false,
    progressAnimate: false,
    touchTimer: null,
    touchTimerLong: null,
    hypernyms: [],
    hypernym_list: [],
    hypernym_tree: [],
    hypernym_lang: [],
    hypernym_grid: [],
    hypernym_index: 1,
    hypernymColorHue: 0,
    hypernymGridTextIndex: 0,
    match_mode: 1,
    difficulty: 4,
    difficultyLvl: 7,
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
    ],
    leximapXWheelFactor: 1,
  },
  mounted: function() {
    ;((saveState) => {
      // Set languages based on cookie, otherwise use browser languages
      if (saveState.length >= 3) {
        this.alang = saveState[0]
        this.qlang = saveState[1]
        this.match_mode = parseInt(saveState[2])
      } else {
        let browserLangs = [...window.navigator.languages.reduce((s,a)=>{s.add(a.slice(0,2));return s},new Set())]
        this.alang = browserLangs[0] ? browserLangs[0] : ''
        this.qlang = browserLangs[1] ? browserLangs[1] : (browserLangs[0] ? browserLangs[0] : '')
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
        if (this.windowWidth>=768 && this.windowHeight>890 && saveState.length<3) {
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
        if (e.key == '.' || e.key == ',' || e.key == 'e' || e.key == 'w') this.toggleDisplayTitleLeximap()
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
      return this.match_mode !== 0 ? this.qlang_options : this.qlang_options.filter(l => l.value != this.alang)
    },
    alangOptions() {
      return this.alang_options
    },
    alangOpt() {
      return this.alang_options.find(l => l.value === this.alang) || { value: '', text: '', label_a: '', label_q: '', label_s: '', label_t: '', label_m0: '', label_m1: '', label_m2: ''}
    },
    qlangOpt() {
      return this.qlang_options.find(l => l.value === this.qlang) || { value: '', text: '', label_a: '', label_q: '', label_s: '', label_t: '', label_m0: '', label_m1: '', label_m2: ''}
    },
    qText() {
      return this.q_title || this.q_desc
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
      return this.quizStarted ? '' : this.alangOpt.label_t || this.alang_options[0].label_t
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
    quizIncorrect() {
      return Object.values(this.board).reduce((s,v) => s+v.filter(u=>u<0).length, 0)
    },
    longestLevelCount() {
      return Math.max.apply(Math, Object.values(this.board).map(v => v.length))
    },
    hyperGeoMean() {
      const total = 64
      const sqSum = this.hypernym_grid.reduce((q,h) => q+(h.count)*(h.count), 0)
      return Math.sqrt(sqSum/total)+8
    },
    qHypernymTexts() {
      // The hypernyme of current question as topics for quote search 
      // hypernym_option.texts [0]:English, [1]:<Answer Language>, [2]<Question Language>
      const hypernym = this.hypernym_list.find(h=>h.value === this.q_hypernym)
      if (hypernym) return hypernym.texts
      else return [null,null,null]
    },
    leximapXfactor() {
      return Math.max(1440/this.windowWidth, this.leximapXWheelFactor) * this.windowWidth/1440;
    },
    showBottomAlert() {
      return !this.getCookieValue('lang')
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
    titleDescFontSize() {
      const container = document.querySelector('.title-box')
      const width = container ? container.clientWidth : Math.min(800, this.windowWidth)
      const scale = /[a-zа-яα-ω]{3,}/ig.test(this.q_desc) && this.q_desc.length < 60 ? 2.4 : 1.6
      return width / Math.max(12, Math.min(18, this.q_desc.length-2)) * scale
    },
    match_mode_options() {
      return [
        { text: `👁 ${this.alangOpt.label_m0 || this.alang_options[0].label_m0 || ''} ${this.qlangOpt.text}`, value: 0 },
        { text: `👁️‍🗨️ ${this.alangOpt.label_m1 || this.alang_options[0].label_m1 || ''} ${this.qlangOpt.text}`, value: 1 },
        { text: `🧠 ${this.alangOpt.label_m2 || this.alang_options[0].label_m2 || ''} ${this.qlangOpt.text}`, value: 2 },
      ]
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
        {Key: ['.',',','E','W'], Description: `exposit lexical map`},
        {Key: ['-','D'], Description: `display image`},
        {Key: ['/','S'], Description: `say <quote> in ${this.quotelangOpt ? this.quotelangOpt.text : this.alangOpt.text }`},
        {Key: ['*','Y'], Description: `yell "${this.qText}" in ${this.qlangOpt.text}`},
        {Key: ['+','F'], Description: `find "${this.qText}" on ${this.q_title ? this.qlang+'.wikipedia.org' : 'google'}`},
        ...gt
      ]
    },
  },
  asyncComputed: {
    async titleImageUrl() {
      if (!this.displayTitleImage) return 'javascript:void(0)'

      const IMG_TYPE = ['collage','trid','schem','chem','pic','dist','locator','taxnrg','flag','logo','icon','rimg']
      const sparqlQuery = `
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
      const resp = await fetch(`https://query.wikidata.org/sparql?query=${sparqlQuery}`, {
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
      //   }, 300)
      // } else {
      //   document.getElementsByClassName('title-link')[0].click()
      //   window.open(data.results.bindings[0].item.value, '_blank')
      //   // setTimeout(() => {
      //   //   document.getElementById('choice-'+Math.floor(Math.random()*0+this.answer)%9).click()
      //   // }, 100)
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
    async titleLeximap() {
      const qid = this.q_id
      if (qid > 0) {
        const sparqlQuery = `
SELECT (lang(?label) as ?lang) ?label WHERE {
  wd:Q${qid} rdfs:label ?label.
}`
        try {
          const timeLimit = 2000
          const resp = await this.fulfillWithTimeLimit(fetch(`https://query.wikidata.org/sparql?query=${sparqlQuery}`, {
            headers: { 'Accept': 'application/json' },
          }), timeLimit, null)
          if (!resp)  {
            throw 'wikidata query timeout ' + timeLimit
          }
          const data = await resp.json()
          const res = []
          data.results.bindings.forEach(b => {
            const lang = b.lang.value
            const text = b.label.value
            const opt = this.qlang_options.find(x => this.transLangCode(x.value) == lang)
            if (opt && opt.coord_x){
              res.push ({
                text: text,
                code: opt.value,
                lang: opt.text,
                coord_x: Math.abs(opt.coord_x),
                coord_y: Math.abs(opt.coord_y),
              })
            }
          })
          return res
        } catch (error) {
          console.error('titleLeximap', qid, error)
        }
      }
      return []
    },
  },
  methods: {
    //#region Game Actions
    startGameAtDifficulty: function(df) {
      this.difficulty = df
      this.score = -1
      this.startBtnDisabled = true
      this.displayScoreChart = false
      this.displayTitleLeximap = false
      this.hypernymColorHue = Math.floor(Math.random()*64)
      this.newGame()
    },

    newGame: async function() {
      if (!this.qlang || !this.alang) {
        alert('no language selected')
      }

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
          if (this.match_mode === 0) {
            this.unpackRespData(data)
          } else if (this.match_mode === 1) {
            if (!await this.fetchQuestionDescription(data)) {
              await this.selectChoice(null, -1)
            }
          } else if (this.match_mode === 2) {
            if (!await this.fetchFuzzyAnswer(data)) {
              await this.selectChoice(null, -1)
            }
          }
          this.gameStartAction()
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
        }, 200)
      } catch (error) {
        console.error(error)
      }
    },

    // Match_mode 1&2 rely on client to fetch wikidata question desc and fuzzy answer respectively;
    // in case client cannot fulfill, request server for another qid to retry recursively.
    selectChoice: async function(e, index, depth=0) {
      if (depth >= 30/this.match_mode) {
        this.endGame()
        return
      }
      if (e) {
        // function called by click event
        e.preventDefault()
        e.target.classList.remove('btn-secondary')
        if (this.difficulty > 1) {
          e.target.classList.add(this.answer === index ? 'btn-success' : 'btn-danger')
        }
        // update hypernym grid count
        const hypernym = this.hypernym_grid.find(h => h.value === this.q_hypernym)
        hypernym.count += (this.answer === index ? 1 : -1)
      }
      document.querySelectorAll('.btn-choice').forEach(b => b.disabled = true)
      this.progressAnimate = true
      
      try {
        const qid = depth>0 ? 0 : this.q_id
        const is_correct = depth>0 || this.answer===index

        const resps = await this.fulfillWaitUntil(fetch(`${window.location.origin}/next`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(this.packPayload(this.lvl, qid, this.board, is_correct))
        }), 160, null)

        const resp = resps.find(r => r.value).value
        const data = await resp.json()
        this.lvl = data.lvl
        this.board = data.board
        if (data.score >= 0) {
          this.gameOverAction(data.score)
        } else if (this.match_mode === 0) {
          this.unpackRespData(data)
        } else if (this.match_mode === 1) {
          if (!await this.fetchQuestionDescription(data)) {
            await this.selectChoice(null, index, ++depth)
            return
          }
        } else if (this.match_mode === 2) {
          if (!await this.fetchFuzzyAnswer(data)) {
            await this.selectChoice(null, index, ++depth)
            return
          }
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
        console.info(e, index, depth, this.q_id)
        console.error(err)
      } finally {
        document.querySelectorAll('.btn-choice').forEach(b => b.disabled = false)
        this.progressAnimate = false
        if (e) {
          e.target.classList.add('btn-secondary')
          if (this.difficulty > 1) {
            e.target.classList.remove('btn-success')
            e.target.classList.remove('btn-danger')
          }
          // Desktop browser: remove focus on anchor
          // TODO: blur on iOS safari
          e.target.blur()
          e.handled = true
        }
      }
    },
    //#endregion

    //#region Wikidata Question description (mode_1)
    fetchQuestionDescription: async function(fqdata) {
      const qdesc = await this.sparqlGetDescription(fqdata.q_id, this.qlang)
      if (!!qdesc) {
        this.unpackRespData(fqdata)
        this.q_title = ''
        this.q_desc = qdesc
        return true
      }
      return false
    },
    sparqlGetDescription: async function(item, lang) {
      const sparqlQuery = `
SELECT ?desc WHERE {
  wd:Q${item} schema:description ?desc.
  FILTER ( lang(?desc) = "${lang}" )
}`
      try {
        const timeLimit = 2000
        const resp = await this.fulfillWithTimeLimit(fetch(`https://query.wikidata.org/sparql?query=${sparqlQuery}`, {
          headers: { 'Accept': 'application/json' },
        }), timeLimit, null)
        if (!resp)  {
          isFuzzy = true
          throw 'wikidata query timeout ' + timeLimit
        }
        const data = await resp.json()
        const b = data.results.bindings
        return b[0] ? b[0].desc.value : null
      } catch (error) {
        console.error('sparqlGetDescription', item, lang, error)
      }
    },
    //#endregion

    //#region Wikidata Fuzzy answer (mode_2)
    fetchFuzzyAnswer: async function(fqdata) {
      const ans = await this.queryFuzzyAnswer(fqdata.q_id, this.transLangCode(this.alang))
      if (!ans.aid || !ans.atitle) {
        return false
      }
      this.unpackRespData(fqdata)
      const capitalize = (s) => s.charAt(0).toUpperCase()+s.substring(1)
      const atitleC = capitalize(ans.atitle)
      const choicesC = fqdata.choices.map(c => capitalize(c))
      this.choices = [atitleC, ...choicesC]
      this.shuffleArray(this.choices)
      this.answer = this.choices.indexOf(atitleC)
      return true
    },

    queryFuzzyAnswer: async function(item, lang) {
      let ans = await this.sparqlGetSiblings(item, lang, '', '', true)
      if (ans.isFuzzy) return ans
      // console.info('Expand Class...', item, lang, ans)
      ans = await this.sparqlGetSiblings(item, lang, 'wdt:P31?', 'wdt:P31?')
      if (ans.isFuzzy) return ans
      // console.info('Expand SubClass...', item, lang, ans)
      ans = await this.sparqlGetSiblings(item, lang, 'wdt:P31?', 'wdt:P31?/wdt:P279')
      if (ans.isFuzzy) return ans
      // console.info('Expand SuperClass...', item, lang, ans)
      ans = await this.sparqlGetSiblings(item, lang, 'wdt:P31?/wdt:P279', 'wdt:P31?/wdt:P279?')
      if (ans.isFuzzy) return ans
      // console.info('Expand SuperSuperClass...', item, lang, ans)
      ans = await this.sparqlGetSiblings(item, lang, 'wdt:P31?/wdt:P279/wdt:P279', 'wdt:P31?/wdt:P279/wdt:P279')
      if (ans.isFuzzy) return ans
      // console.info('Expand SuperSuperSuperClass SubClasses...', item, lang, ans)
      ans = await this.sparqlGetSiblings(item, lang, 'wdt:P31?/wdt:P279/wdt:P279/wdt:P279', 'wdt:P31?/wdt:P279+')
      if (ans.isFuzzy) return ans
      // console.info('Expand scopes failure...', item, lang, ans)
      return ans
    },

    sparqlGetSiblings: async function(item, lang, upscope='wdt:P31?', downscope='wdt:P31?', related=false) {
      let aid = 0
      let atitle = ''
      let isFuzzy = false
      const sparqlQuery = related
//Possible related items P171 P361 P366 P373 P527 P1269 P1535 P1659 P2283 P4969
// Prevent only ONE directional (another wikidatapropertyitem only be the facet of this): P1269
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
    wd:Q${item} wdt:P1269 ?face_duo .
    ?sim wdt:P1269? ?face_duo .
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
LIMIT 3`
//NOTE: Because the `?` after upscope P31, directchild is also possible, so sim actually means children and their uncles
// exclude classes of concept, term, blanket terminology, technical term, Wikimedia list article, Wikidata metaclass
:`SELECT DISTINCT ?sim ?simLabelA 
WHERE
{
    wd:Q${item} ${upscope} ?class.
    FILTER (?class not in (wd:Q151885, wd:Q1969448, wd:Q4925178, wd:Q12812139, wd:Q13406463, wd:Q19361238))
    ?sim ${downscope} ?class .
    ?sim rdfs:label ?simLabelA filter (lang(?simLabelA) = '${lang}').
}
ORDER BY uuid()
LIMIT 3`
      try {
        const timeLimit = 2000
        const resp = await this.fulfillWithTimeLimit(fetch(`https://query.wikidata.org/sparql?query=${sparqlQuery}`, {
          headers: { 'Accept': 'application/json' },
        }), timeLimit, null)
        if (!resp)  {
          isFuzzy = true
          throw 'wikidata query timeout ' + timeLimit
        }
        const data = await resp.json()
        for(let b of data['results']['bindings']) {
          aid = parseInt(b['sim']['value'].split('Q')[1]) || aid
          atitle = b['simLabelA']['value'] || atitle
          if (aid != item && atitle !== '!' && atitle.indexOf(':', 1) < 0) {
            isFuzzy = true
            break
          }
        }
      } catch (err) {
        console.error('sparqlGetSiblings', item, lang, err)
      } finally {
        return { aid, atitle, isFuzzy }
      }
    },
    //#endregion

    //#region Game Actions Helper
    packPayload: function(lvl, qid, board, is_correct) {
      return {
        lvl: lvl,
        qid: qid,
        board: board,
        is_correct: is_correct,
        qlang: this.qlang,
        alang: this.alang,
        hypernym: this.hypernyms,
        difficulty: this.difficulty,
        match_mode: this.match_mode,
      }
    },
    unpackRespData: function(data) {
      this.q_desc = ''
      this.q_id = data.q_id
      this.q_hypernym = data.q_hypernym
      this.q_title = data.q_title
      this.q_title_en = data.q_title_en
      this.choices = data.choices
      this.answer = data.answer
    },

    gameStartAction: function() {
      document.getElementById('page-header').classList.add('py-0','mb-2')
      if (!this.isCollapsingBomb) { document.getElementById('btn-bomb').click() }
      this.displayTopQuote = false
      // re-place hyperyme-grid on progress row
      const $hyperGrid = document.querySelector('.hypernym-grid')
      const $progressRow = document.querySelector('#progress-row')
      $hyperGrid.classList.remove('hypernym-grid-centered')
      if (this.windowWidth > 1200) { $hyperGrid.classList.add('float-right') }
      $progressRow.parentNode.insertBefore($hyperGrid, $progressRow)
    },
    gameOverAction: function(score) {
      this.score = score
      this.choices = []
      this.answer = -1
      this.q_id = 0
      this.q_desc = ''
      this.q_title = ''
      this.q_title_en = ''
      this.q_hypernym = ''
      this.displayTopQuote = true
      document.getElementById('page-header').classList.remove('py-0', 'mb-2')
      document.getElementById('btn-bomb').click()
      // re-place hyperyme-grid on score board
      const $hyperGrid = document.querySelector('.hypernym-grid')
      const $scoreBoard = document.querySelector('.score-board')
      $hyperGrid.classList.remove('float-right')
      $hyperGrid.classList.add('hypernym-grid-centered')
      $scoreBoard.parentNode.insertBefore($hyperGrid, $scoreBoard)
      // re-calculate available difficulties
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
        let tail = arr[arr.length-1] || 0
        if (tail*next > 0) arr[arr.length-1] += Math.sign(next)
        else arr.push(Math.sign(next))
        return arr
      }, [])
    },
    //#endregion Game Scores

    //#region Question Title interactions
    speakTitle: function(e,i) {
      let lang = i >=0 ? this.alang : this.qlang
      lang = this.toMajorLang(lang, true)
      const text = i >=0 ? this.choices[i] : this.qText
      const sp = new SpeechSynthesisUtterance(text)
      const langVoices = this.getSpeechSynthesisVoices(lang)
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
        const title = this.choices[i] || this.qText
        const lang = this.choices[i] ? this.alang : this.qlang
        window.open(`https://${lang}.wikipedia.org/wiki/${title}`, '_blank')
      }, 2400)
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
        this.hypernym_tree = data.map(h => ({
          value: h.value,
          texts: h.texts,
          text: h.text,
          place: h.place,
          depth: h.depth,
        }))
        this.hypernym_list = data.map(h => ({
          value: h.value,
          texts: h.texts,
          text: h.text,
        }))
        this.hypernym_grid = data.map(h => ({
          value: h.value,
          place: h.place,
          order: h.hilbert_order,
          texts: ['', h.hexagram, h.ideogram, ...h.texts.slice(1)],
          count: 0,
        }))
        this.hypernym_grid.sort((h1,h2) => h1.order-h2.order)
        this.sortHypernymTree()
        
        if (onMount) {
          // by default fill-in all hypernyms, ?excluding language(315), disease(12136)?
          this.hypernyms = data.filter(h=>[
            // 315,
            // 12136,
          ].indexOf(h.value)<0).map(h=>h.value)
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
      }, 1)
    },
    switchHypernymLang: function() {
      // omit duplicated 'en', if one of alang or qlang is 'en'
      this.hypernym_index = (this.hypernym_index+(this.alang==='en'&&this.hypernym_index===2?2:1)) % (this.qlang==='en'?2:3)
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
      document.getElementById('btn-toggle-hypernym-tree').title = this.displayHypernymTree ? 'list view' : 'tree view'
      this.displayHypernymTree || this.sortHypernymList()
    },
    toggleHypernymGridTextIndex: function() {
      this.hypernymGridTextIndex = (this.hypernymGridTextIndex+1) % 5
    },
    //#endregion Hypernym options
    
    //#region Menu interactions
    toggleDisplayQuote: function() {
      this.displayTopQuote = !this.displayTopQuote
    },

    toggleCollapseBomb: function() {
      this.isCollapsingBomb = !this.isCollapsingBomb
    },

    toggleDisplayTitleImg: function() {
      this.displayTitleImage = !this.displayTitleImage
    },

    toggleDisplayScoreChart: function() {
      this.displayScoreChart = !this.displayScoreChart
    },
    //#endregion Menu interactions
    
    //#region Lexical map
    onClickLeximapBtnAlang: function(e, lexi) {
      this.alang = lexi.value
      // on language selected, toggle close the leximap panel
      e.target.parentElement.previousSibling.click()
    },
    onClickLeximapBtnQlang: function(e, lexi) {
      this.qlang = lexi.value
      e.target.parentElement.previousSibling.click()
    },
    onHoverAlangSelect: function(e) {
      document.querySelector('#alang-form-group button').focus()
    },
    onHoverQlangSelect: function(e) {
      document.querySelector('#qlang-form-group button').focus()
    },
    onShowLeximapQlang: function(e) {
      console(e.target, e.target.nextElementSibling)
      this.leximapDragToScroll(null, e.target.nextElementSibling)
    },

    toggleDisplayTitleLeximap: function() {
      this.displayTitleLeximap = !this.displayTitleLeximap
      if (this.displayTitleLeximap) {
        this.leximapDragToScroll('.title-leximap')
      }
    },

    leximapDragToScroll: function(containerClass, containerElem) {      
      this.leximapXWheelFactor = 1
      let pos = { left:0, top:0, x:0, y:0 }
      const leximapWheelScrollHandler = (e) => {
        e.preventDefault()
        this.leximapXWheelFactor = Math.max(1440/this.windowWidth, this.leximapXWheelFactor * Math.exp(e.wheelDelta/(1200*this.leximapXWheelFactor)))
      }
      const leximapMouseMoveHandler = (e) => {
        e.preventDefault()
        e.target.scrollLeft = pos.left + pos.x - e.clientX;
        e.target.scrollTop = pos.top + pos.y - e.clientY;
      }
      const leximapMouseUpHandler = (e) => {
        e.preventDefault()
        e.target.classList.remove('grabbing')
        e.target.removeEventListener('mousemove', leximapMouseMoveHandler)
        e.target.removeEventListener('mouseup', leximapMouseUpHandler)
      }
      const leximapMouseDownHandler = (e) => {
        e.preventDefault()
        e.target.classList.add('grabbing')
        pos = {
          left: e.target.scrollLeft,
          top: e.target.scrollTop,
          x: e.clientX,
          y: e.clientY,
        }
        e.target.addEventListener('mousemove', leximapMouseMoveHandler)
        e.target.addEventListener('mouseup', leximapMouseUpHandler)
      }
      let checkExist = setInterval(() => {
        //wait every 1ms to check the container fully loaded
        const container = containerClass ? document.querySelector(containerClass) : containerElem
        if (container) {
          clearInterval(checkExist)
          container.scrollLeft = 100;
          container.addEventListener('wheel', leximapWheelScrollHandler, {passive: false})
          container.addEventListener('mousedown', leximapMouseDownHandler)
        }
      }, 1);
    },
    //#endregion Language picker

    //#region Utils
    getCookieValue: function(name) {
      const m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')
      return m ? (m.pop()||'') : '7'
    },
    getSpeechSynthesisVoices: function(lang) {
      const sliceLen = lang.startsWith('zh-') ? 5 : 2
      let langVoices = speechSynthesis.getVoices().filter(v => v.lang.slice(0,sliceLen) == lang)
      if (langVoices.length == 0) {
        langVoices = speechSynthesis.getVoices().filter(v => v.lang.slice(0,2) == 'en')
      }
      return langVoices
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
        const voiceLangs = new Set(speechSynthesis.getVoices().map(v => v.lang.slice(0,2)))
        for (let k of Object.keys(MAJOR_LANG)){
          MAJOR_LANG[k] = MAJOR_LANG[k].filter(l => !voiceLangs.has(l))
        } 
        MAJOR_LANG['zh-CN'] = ['zh', 'wuu', 'gan', 'zh-classical']
        MAJOR_LANG['zh-HK'] = ['zh-yue', 'hak']
        MAJOR_LANG['zh-TW'] = ['zh-min-nan', 'cdo']
      }
      for (let e of Object.entries(MAJOR_LANG)){
        if (e[1].indexOf(lang) >= 0) return e[0]
      }
      return lang || 'en'
    },
    // Resolve diff b/w WMF & IETF
    transLangCode: function(lang) {
      const TRANS = {
        'be-x-old': 'be-tarask',
        'bh': 'bho',
        'cbk-sam': 'cbk',
        'fiu-vro': 'vro',
        'no': 'nb',
        'zh-classical': 'zh-hant',
        'zh-min-nan': 'nan',
        'zh-yue': 'yue',
      }
      return TRANS[lang] || lang
    },
    // Randomize array in-place using Durstenfeld shuffle algorithm
    shuffleArray: function(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
      }
    },
    hsv2hex: function(h, s, v) {
      let r, g, b
      const i = Math.floor(h * 6)
      const f = h * 6 - i
      const p = v * (1 - s)
      const q = v * (1 - f * s)
      const t = v * (1 - (1 - f) * s)
      switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
      }
      const toHex = (c) => {
        const hex = Math.floor(c).toString(16)
        return hex.length == 1 ? '0' + hex : hex
      }      
      return '#'+toHex(r)+toHex(g)+toHex(b)
    },
    shareImage: function() {
      html2canvas(document.querySelector('#hilbert-grid'), {
        scale: 4
      }).then(canvas => {
        const image = canvas.toDataURL();
        const aDownloadLink = document.createElement('a');
        aDownloadLink.download = `!tweet_share_my_result_${this.labelPageTitle}_${this.qlangOpt.text}-${this.alangOpt.text}
_${[this.alangOpt.label_m0, this.alangOpt.label_m1, this.alangOpt.label_m2][this.match_mode]}
_D${this.difficulty}_Lv${this.levelPlayed}_${this.quizCorrect}(${this.quizIncorrect})_score=${this.score}
_knb.wiki_${new Date().toLocaleString()}.png`;
        aDownloadLink.href = image;
        aDownloadLink.click();
      });
    },
    fulfillWithTimeLimit: async function(task, timeLimit, failureValue){
      let timeout
      const timeoutPromise = new Promise((resolve, reject) => {
        timeout = setTimeout(() => {
          resolve(failureValue)
        }, timeLimit)
      })
      const response = await Promise.race([task, timeoutPromise])
      if (timeout) {
        clearTimeout(timeout)
      }
      return response
    },
    fulfillWaitUntil: async function(task, timeUntil, rejectReason){
      let timeout
      const timeoutPromise = new Promise((resolve, reject) => {
        timeout = setTimeout(() => {
          reject(rejectReason)
        }, timeUntil)
      })
      const responses = await Promise.allSettled([task, timeoutPromise])
      if (timeout) {
        clearTimeout(timeout)
      }
      return responses
    },
    //#endregion Utils
  },
})
