new Vue({
  el: '#app',
  data: {
    difficulty: 4,
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
    displayTitleImage: true,
    displayTopQuote: true,
    startBtnDisabled: false,
    progressAnimate: false,
    touchTimer: null,
    touchTimerLong: null,
    hypernyms: [],
    hypernym_options: [],
    hypernym_index: 1,
  },
  mounted: function() {
    (() => {
      fetch(`${window.location.origin}/language`)
      .then(resp => resp.json())
      .then(data => {
        this.alang_options = data
        let browserLangs = [...window.navigator.languages.reduce((s,a)=>{s.add(a.slice(0,2));return s},new Set())]
        this.alang = browserLangs[0] ? browserLangs[0] : ''
        this.qlang = browserLangs[1] ? browserLangs[1] : ''
        // populate language lexical map selector
        this.aLeximap = data.filter(d => d.coord_x > 0).map(d=>({
          value: d.value,
          text: d.text,
          coord_x: d.coord_x,
          coord_y: d.coord_y,
        }))
      })
      .then(() => { this.popHypernym(true) })
      .catch((err) => { console.log(err) })
    })()

    window.addEventListener('keydown', (e) => {
      const KEYMAP = {'7':0,'8':1,'9':2,'4':3,'5':4,'6':5,'1':6,'2':7,'3':8,}
      const MOVEMAP = {
        'ArrowUp': i => i-3 >= 0 ? i-3 : i-3+9,
        'ArrowDown': i => i+3 < 9 ? i+3 : i+3-9,
        'ArrowLeft': i => [0,3,6].indexOf(i) < 0 ? i-1 : i+2,
        'ArrowRight': i => [2,5,8].indexOf(i) < 0 ? i+1 : i-2,
      }
      if(this.quizStarted) {
        let c = document.getElementById('choice-'+KEYMAP[e.key])
        if (c) c.click()
        else {
          if (MOVEMAP[e.key] && document.activeElement && document.activeElement.classList.contains('btn-choice')){
            i = parseInt(document.activeElement.id.slice(-1));
            document.getElementById('choice-'+MOVEMAP[e.key](i)).focus()
          }
        }
        if (e.key == '0') this.speakTitle()
        if (e.key == '+') document.getElementsByClassName('title-link')[0].click()
        if (e.key == '.') this.displayTitleImage = !this.displayTitleImage
      }
    })

    window.onresize = () => {
      this.windowWidth = window.innerWidth
    }
    window.onbeforeunload = () => {
      if (this.quizStarted) return 'Quiz is running. Are you sure to quit?'
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
      return this.choices.length > 0
    },
    qlangOptions() {
      return this.qlang_options.filter(l => l.value != this.alang)
    },
    alangOptions() {
      return this.alang_options
    },
    labelQuestion() {
      return this.alang_options.find(l => l.value === this.alang).label_q || this.alang_options[0].label_q
    },
    labelAnswer() {
      return this.alang_options.find(l => l.value === this.alang).label_a || this.alang_options[0].label_a
    },
    labelGameStart() {
      return this.alang_options.find(l => l.value === this.alang).label_s || this.alang_options[0].label_s
    },
    gameTitle() {
      if (this.quizStarted) return ''
      return this.alang_options.find(l => l.value === this.alang).label_t || this.alang_options[0].label_t
    },
    quizPlayed() {
      return Object.values(this.board).reduce((s,v) => s+v.length, 0)
    },
    quizCorrect() {
      return Object.values(this.board).reduce((s,v) => s+v.filter(u=>u>0).length, 0)
    },
    qHypernymTexts() {
      // hypernym_option.texts [0]:English, [1]:<Answer Language>, [2]<Question Language>
      const hypernym = this.hypernym_options.find(h=>h.value === this.q_hypernym)
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
    async pageTitle() {
      if (this.quizStarted) return ''

      const title = 'Knowledge bomb'
      const resp = await fetch("https://translate.api.skitzen.com/translate", {
        method: "POST",
        body: JSON.stringify({
          q: title,
          source: "en",
          target: this.alang,
          format: "text"
        }),
        headers: { "Content-Type": "application/json" }
      })
      return (await resp.json()).translatedText || title
    },
  },
  methods: {
    /** Basic Game Actions BEGIN */
    setDifficulty: function(d) {
      this.difficulty = d
      this.newGame()
    },

    newGame: function() {
      if (!this.qlang || !this.alang) {
        alert('no language selected')
      }
      this.startBtnDisabled = true
      fetch(`${window.location.origin}/next`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(this.packPayload(-1, 0, {}, true))
      })
      .then(resp => resp.json())
      .then(data => {
        this.lvl = data.lvl
        this.board = data.board
        this.unpackRespData(data)
      })
      .then(() => { 
        this.gameStart()
        this.popHypernym()
      })
      .finally(() => { this.startBtnDisabled = false })
      this.score = -1
    },

    endGame: function() {
      fetch(`${window.location.origin}/next`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(this.packPayload(0, 0, this.board, false))
      })
      .then(resp => resp.json())
      .then(data => {
        setTimeout(() => {
          this.board = data.board
          this.gameOver(data.score)
        }, 200);
      })
    },

    selectChoice: function(e, index) {
      e.preventDefault()
      e.target.classList.remove('btn-secondary')
      e.target.classList.add('disabled')
      if (this.difficulty > 1) {
        e.target.classList.add(this.answer === index ? 'btn-success' : 'btn-danger')
      }

      this.progressAnimate = true
      // wait short period of time showing green/red for user choice correctness
      let waitflag = 0
      setTimeout(() => {
        waitflag = 1
      }, 100);

      fetch(`${window.location.origin}/next`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(this.packPayload(this.lvl, this.q_id, this.board, this.answer===index))
      })
      .then(resp => resp.json())
      .then(data => {
        this.lvl = data.lvl
        this.board = data.board
        if (data.score >= 0) {
          this.gameOver(data.score)
        } else {
          let interval = setInterval(() => {
            if(waitflag == 1) {
              this.unpackRespData(data)
              setTimeout(() => {
                let scrollingElement = (document.scrollingElement || document.body);
                scrollingElement.scrollTop = scrollingElement.scrollHeight;
              }, 0);
              clearInterval(interval)
            }
          }, 10);
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
      })
      .catch((err) => { console.log(err) })
      .finally(() => {
        let interval = setInterval(() => {
          if(waitflag == 1) {
            e.target.classList.add('btn-secondary')
            e.target.classList.remove('disabled')
            if (this.difficulty > 1) {
              e.target.classList.remove('btn-success')
              e.target.classList.remove('btn-danger')
            }
            e.target.blur() // Desktop browser: remove focus on anchor; TODO: blur on iOS safari
            e.handled = true
            this.progressAnimate = false
            clearInterval(interval)
          }
        }, 10);
      })
    },

    packPayload: function(lvl, qid, board, is_correct) {
      return {
        lvl: lvl,
        board: board,
        qid: qid,
        qlang: this.qlang,
        alang: this.alang,
        hypernym: this.hypernyms,
        is_correct: is_correct,
        difficulty: this.difficulty,
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

    gameStart: function() {
      if (this.windowWidth <= 576) {
        document.getElementById('btn-toggle-display-quote').click()
      }
      document.getElementsByClassName('jumbotron')[0].classList.add('py-0','mb-0')
      document.getElementsByClassName('wikiquote')[0].classList.remove('justify-content-center')
    },
    gameOver: function(score) {
      this.score = score
      this.choices = []
      this.q_id = 0
      this.q_title = ''
      this.q_title_en = ''
      this.q_hypernym = ''
      document.getElementsByClassName('jumbotron')[0].classList.remove('py-0', 'mb-0')
      document.getElementsByClassName('wikiquote')[0].classList.add('justify-content-center')
      this.displayTopQuote = true
    },
    /** Basic Game Actions END */

    /** Game Scores BEGIN */
    scoreBar: function(v) {
      // fold list of int to subgroup of consecutive pos/neg count
      return JSON.parse(JSON.stringify(v)).reduce((arr,next) => {
        let end = arr[arr.length-1] || 0
        if (end*next > 0) arr[arr.length-1] += Math.sign(next)
        else arr.push(Math.sign(next))
        return arr
      }, [])
    },
    /** Game Scores END */

    /** Language picker BEGIN */
    onClickLeximapBtnAlang: function(e, lexi) {
      this.alang = lexi.value
      e.target.parentElement.previousSibling.click()
    },
    onClickLeximapBtnQlang: function(e, lexi) {
      this.qlang = lexi.value
      e.target.parentElement.previousSibling.click()
    },
    /** Language picker END */

    /** Question Title interactions BEGIN */
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
    
    toggleDisplayTitleImg: function() {
      this.displayTitleImage = !this.displayTitleImage
    },
    /** Question Title interactions END */

    /** Hypernym options BEGIN */
    popHypernym: function(onMount) {
      fetch(`${window.location.origin}/hypernym?ql=${this.qlang}&al=${this.alang}`)
      .then(resp => resp.json())
      .then(data => {
        this.hypernym_options = data
          .filter(h => h.texts[0])
          .map(h => ({
            value: h.value,
            texts: h.texts.map(t => t ? t : h.texts[0]).map(t => t.replace(/ *\([^)]*\) */g, '')),
          }))
          .map(h => ({
            value: h.value,
            texts: h.texts,
            text: h.texts[this.hypernym_index]
          }))
          .sort((h1,h2) => h1.text.localeCompare(h2.text, this.toMajorLang(this.alang)))
        if (onMount) {
          // by default fill-in all hypernyms, excluding language==315
          this.hypernyms = data.filter(h=>h.value!==315).map(h=>h.value)
        }
      })
    },
    switchHypernymLang: function() {
      this.hypernym_index = (this.hypernym_index+1)%3
      this.hypernym_options.forEach(h => h.text=h.texts[this.hypernym_index])
      this.hypernym_options.sort((h1,h2) => h1.text.localeCompare(h2.text, this.toMajorLang(this.hypernym_index==2?this.qlang:this.alang)))
    },
    reverseHypernymSelect: function() {
      this.hypernyms = this.hypernym_options
        .map(h => h.value)
        .filter(v => this.hypernyms.indexOf(v)<0)
    },
    /** Hypernym options END */

    /** Wikiquote START */
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

    toggleDisplayQuote: function(e) {
      this.displayTopQuote = !this.displayTopQuote
      e.target.textContent = this.displayTopQuote ? '🧙💬' : '🧙🔇'
      e.target.title = this.displayTopQuote ? 'Mute me, improve your performance (less network traffic, less laggy)' : "I'll be back"
    },

    speakQuote: function(e) {
      const sp = new SpeechSynthesisUtterance(e.target.innerText)
      const lang = this.toMajorLang(this.quoteLang=='en'?'en':this.alang, true)
      const langVoices = this.getSpeechSynthesisVoices(lang)
      sp.voice = langVoices[Math.floor(Math.random()*langVoices.length)]
      speechSynthesis.cancel()
      speechSynthesis.speak(sp)
    },
    getSpeechSynthesisVoices: function(lang) {
      const sliceLen = lang.startsWith('zh-') ? 5 : 2
      let langVoices = speechSynthesis.getVoices().filter(v => v.lang.slice(0,sliceLen) == lang)
      if (langVoices.length == 0) {
        langVoices = speechSynthesis.getVoices().filter(v => v.lang.slice(0,2) == 'en')
      }
      return langVoices
    },
    // stripHtml: function(html) {
    //   let tmp = document.createElement("div");
    //   tmp.innerHTML = html;
    //   return tmp.textContent || tmp.innerText || "";
    // },
    toMajorLang: function(lang, isSpeaking) {
      const MAJOR_LANG = {
        'es': ['an','ast'],
        'pt': ['mwl'],
        'fr': ['oc', 'co', 'wa', 'nrm', 'pcd', 'frp', 'ht'],
        'it': ['sc', 'vec', 'lmo', 'scn', 'pms', 'fur', 'nap'],
        'nl': ['fy', 'af', 'nds-nl', 'li'],
        'de': ['lb', 'bar', 'als', 'nds', 'stq', 'pdc'],
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
      }
      for (let e of Object.entries(MAJOR_LANG)){
        if (e[1].indexOf(lang) >= 0) return e[0]
      }
      return lang
    },
    /** Wikiquote END */
  },
})
