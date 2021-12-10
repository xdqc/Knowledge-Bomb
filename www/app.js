new Vue({
  el: '#app',
  data: {
    qlang: '',
    alang: '',
    qlang_options: [{ value: '', text: '(Question Language)' }],
    alang_options: [{ value: '', text: '(Answers Language)' }],
    aLeximap: [],
    qLeximap: [],
    q_title: '',
    q_title_en: '',
    q_id: 0,
    lvl: 1,
    board: {},
    choices: [],
    answer: -1,
    score: -1,
    windowWidth: window.innerWidth,
    displayTitleImage: true,
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
    qlang: function() {
      if (!!this.qlang)
      this.fetchLeadQuote()
    } 
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
      return this.alang_options.find(l => l.value == this.alang).label_q || this.alang_options[0].label_q
    },
    labelAnswer() {
      return this.alang_options.find(l => l.value == this.alang).label_a || this.alang_options[0].label_a
    },
    quizPlayed() {
      return Object.values(this.board).reduce((s,v) => s+v.length, 0)
    },
    quizCorrect() {
      return Object.values(this.board).reduce((s,v) => s+v.filter(u=>u>0).length, 0)
    },
    choiceHeight() {
      this.windowWidth
      let row = document.getElementsByClassName('choices')[0]
      let width =  window.getComputedStyle(row).width.slice(0, -2)
      return width / 3
    },
  },
  asyncComputed: {
    async titleImage() {
      if (!this.displayTitleImage) return '#'

      let sparqalQuery = `
SELECT ?item ?pic ?flag ?chem ?logo ?taxnrg ?locator ?dist ?collage ?icon ?trid ?schem ?rimg {
VALUES (?item) {(wd:Q${this.q_id})}
OPTIONAL { ?item wdt:P18 ?pic }
OPTIONAL { ?item wdt:P41 ?flag }
OPTIONAL { ?item wdt:P117 ?chem }
OPTIONAL { ?item wdt:P154 ?logo }
OPTIONAL { ?item wdt:P181 ?taxnrg }
OPTIONAL { ?item wdt:P242 ?locator }
OPTIONAL { ?item wdt:P1846 ?dist }
OPTIONAL { ?item wdt:P2716 ?collage }
OPTIONAL { ?item wdt:P2910 ?icon }
OPTIONAL { ?item wdt:P4896 ?trid }
OPTIONAL { ?item wdt:P5555 ?schem }
OPTIONAL { ?item wdt:P6802 ?rimg }
}`
      let resp = await fetch(`https://query.wikidata.org/sparql?query=${sparqalQuery}`, {
        headers: {'Accept':'application/json'},
      })
      let data = await resp.json()
      const IMG_TYPE = ['collage','trid','schem','chem','pic','dist','locator','taxnrg','flag','logo','icon','rimg']
      let imgUrls = IMG_TYPE.map(i => {
        let t = data.results.bindings.filter(b => b[i])
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
    async startBtnTxt() {
      const txt = 'start'
      const resp = await fetch("https://translate.mentality.rip/translate", {
        method: "POST",
        body: JSON.stringify({
          q: txt,
          source: "en",
          target: this.alang,
          format: "text"
        }),
        headers: { "Content-Type": "application/json" }
      })
      return ((await resp.json()).translatedText || txt).toUpperCase()
    },
  },
  methods: {
    /** Basic Game Actions BEGIN */
    newGame: function() {
      if (!this.qlang || !this.alang) {
        alert('no language selected')
      }
      this.gameStart()
      fetch(`${window.location.origin}/next`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          lvl: -1,
          board: {},
          qlang: this.qlang,
          alang: this.alang,
          hypernym: this.hypernyms,
          qid: 0,
          is_correct: true,
        })
      })
      .then(resp => resp.json())
      .then(data => {
        this.lvl = data.lvl
        this.q_id = data.q_id
        this.q_title = data.q_title
        this.q_title_en = data.q_title_en
        this.choices = data.choices
        this.answer = data.answer
        this.board = data.board
      })
      .then(() => { this.popHypernym() })
      .finally(() => { this.startBtnDisabled = false })
      this.score = -1
    },

    endGame: function() {
      fetch(`${window.location.origin}/next`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          lvl: 0,
          board: this.board,
          qlang: this.qlang,
          alang: this.alang,
          hypernym: this.hypernyms,
          qid: 0,
          is_correct: false,
        })
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
      e.target.classList.remove('btn-secondary')
      e.target.classList.add('disabled')
      if (this.answer == index) {
        e.target.classList.add('btn-success')
      } else {
        e.target.classList.add('btn-danger')
      }
      this.progressAnimate = true
      let flag = 0
      setTimeout(() => {
        flag = 1
      }, 150);
      fetch(`${window.location.origin}/next`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          lvl: this.lvl,
          board: this.board,
          qid: this.q_id,
          qlang: this.qlang,
          alang: this.alang,
          hypernym: this.hypernyms,
          is_correct: this.answer == index,
        })
      })
      .then(resp => resp.json())
      .then(data => {
        this.lvl = data.lvl
        this.board = data.board
        if (data.score >= 0) {
          this.gameOver(data.score)
        } else {
          let interval = setInterval(() => {
            if(flag == 1) {
              this.q_id = data.q_id
              this.q_title = data.q_title
              this.q_title_en = data.q_title_en
              this.choices = data.choices
              this.answer = data.answer
              setTimeout(() => {
                window.scrollTo(0,document.body.scrollHeight)
                // Update wikiquote foreach question
                const en_hypernym = this.hypernym_options.find(h=>h.value===data.q_hypernym).texts[0]
                this.fetchLeadQuote([].concat(data.q_title_en, en_hypernym))
              }, 0);
              clearInterval(interval)
            }
          }, 5);
        }
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        let interval = setInterval(() => {
          if(flag == 1) {
            e.target.classList.add('btn-secondary')
            e.target.classList.remove('btn-success')
            e.target.classList.remove('btn-danger')
            e.target.classList.remove('disabled')
            e.target.blur()
            e.handled = true
            this.progressAnimate = false
            clearInterval(interval)
          }
        }, 5);
      })
    },

    gameStart: function () {
      this.startBtnDisabled = true
      document.getElementsByClassName('jumbotron')[0].classList.add('py-0','mb-0')
      document.getElementsByClassName('wikiquote')[0].classList.remove('justify-content-center')
    },
    gameOver: function (score) {
      this.score = score
      this.choices = []
      this.q_title = ''
      document.getElementsByClassName('jumbotron')[0].classList.remove('py-0', 'mb-0')
      document.getElementsByClassName('wikiquote')[0].classList.add('justify-content-center')

      this.fetchLeadQuote()
    },
    /** Basic Game Actions END */

    /** Game Scores BEGIN */
    scoreBar: function (v) {
      return JSON.parse(JSON.stringify(v)).reduce((a,u) => {
        let e = a[a.length-1] || 0
        if (e*u > 0) a[a.length-1] += Math.sign(u)
        else a.push(Math.sign(u))
        return a
      }, [])
    },
    /** Game Scores END */

    
    /** Language picker BEGIN */
    onClickLeximapBtnAlang: function(e, lexi, setLang) {
      this.alang = lexi.value
      e.target.parentElement.previousSibling.click()
    },
    onClickLeximapBtnQlang: function(e, lexi, setLang) {
      this.qlang = lexi.value
      e.target.parentElement.previousSibling.click()
    },
    /** Language picker END */

    /** Question Title interactions BEGIN */
    speakTitle: function (e,i) {
      let text = i >=0 ? this.choices[i] : this.q_title
      let lang = i >=0 ? this.alang : this.qlang
      let langVoices = speechSynthesis.getVoices().filter(v => v.lang.slice(0,2) == lang)
      if (langVoices.length == 0) {
        langVoices = speechSynthesis.getVoices().filter(v => v.lang.slice(0,2) == 'en')
      }
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
          .sort((h1,h2) => h1.text.localeCompare(h2.text, this.alang))
        if (onMount) {
          // by default fill-in all hypernyms, excluding language==315
          this.hypernyms = data.filter(h=>h.value!==315).map(h=>h.value)
        }
      })
    },
    switchHypernymLang: function() {
      this.hypernym_index = (this.hypernym_index+1)%3
      this.hypernym_options.forEach(h => h.text=h.texts[this.hypernym_index])
      this.hypernym_options.sort((h1,h2) => h1.text.localeCompare(h2.text, (this.hypernym_index==2?this.qlang:this.alang)))
    },
    reverseHypernymSelect: function() {
      this.hypernyms = this.hypernym_options
        .map(h => h.value)
        .filter(v => this.hypernyms.indexOf(v)<0)
    },
    /** Hypernym options END */

    /** Wikiquote START */
    fetchLeadQuote: function (topics, isMatch) {
      let quoteLang = topics && topics.length > 0 ? 'en' : this.alang
      let depth = 0
      const resolve = (q, depth) => {
        depth++
        if (!q.quote) {
          Wikiquote(quoteLang).getRandomQuote((depth<10?topics:[]), resolve, error)
        } else {
          document.getElementById('quote-quote').innerHTML = q.quote
          document.getElementById('quote-title').innerHTML = '—— '+q.titles
        }
      }
      const error = (err) => {
        console.log(err)
        if (err.code != 'nosuchsection') {
          quoteLang = 
          // {
          //   'zh-yue': 'zh',
          //   'zh-min-nan': 'zh',
          //   'wuu': 'zh',
          //   'hak': 'zh',
          //   'cdo': 'zh',
          //   'oc': 'fr',
          //   'co': 'fr',
          // }[this.alang] ||
           'en'
        }
        Wikiquote(quoteLang).getRandomQuote([], resolve, error)
      }
      Wikiquote(quoteLang).getRandomQuote(topics, resolve, error, isMatch)
    },
    speakQuote: function(e) {
      let langVoices = speechSynthesis.getVoices().filter(v => v.lang.slice(0,2) == 'en')
      let sp = new SpeechSynthesisUtterance(e.target.innerText)
      sp.voice = langVoices[Math.floor(Math.random()*langVoices.length)]
      speechSynthesis.cancel()
      speechSynthesis.speak(sp)
    },
    /** Wikiquote END */
  },
})
