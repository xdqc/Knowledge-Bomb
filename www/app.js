new Vue({el:"#app",data:{quoteLang:"",quoteQuote:"",quoteTitle:"",qlang:"",alang:"",qlang_options:[{value:"",text:"(Question Language)"}],alang_options:[{value:"",text:"(Answers Language)"}],aLeximap:[],q_title:"",q_title_en:"",q_desc:"",q_id:0,q_hypernym:0,lvl:1,board:{},choices:[],answer:-1,score:-1,gameStartTime:0,sessionHistory:{},windowWidth:window.innerWidth,windowHeight:window.innerHeight,isCollapsingBomb:!0,displayTopQuote:!0,displayTitleImage:!0,displayScoreChart:!1,displayTitleLeximap:!1,displayHypernymTree:!1,startBtnDisabled:!1,progressAnimate:!1,touchTimer:null,touchTimerLong:null,hypernyms:[],hypernym_list:[],hypernym_tree:[],hypernym_lang:[],hypernym_grid:[],hypernym_index:1,hypernymColorHue:0,hypernymGridTextIndex:0,match_mode:-1,difficulty:4,difficultyLvl:7,difficulties:[{value:1,tooltip:"1️⃣ choices",icon:"Wanderer",keymap:{7:0,8:0,9:0}},{value:2,tooltip:"2️⃣ choices",icon:"Picnic",keymap:{7:0,8:0,9:0,4:1,5:1,6:1,g:1,u:1,c:1,i:1,r:1,o:1}},{value:3,tooltip:"3️⃣ choices",icon:"Casual",keymap:{7:0,8:0,9:0,4:1,5:1,6:1,g:1,u:1,c:1,i:1,r:1,o:1,1:2,2:2,3:2,h:2,j:2,t:2,k:2,n:2,l:2}},{value:4,tooltip:"4️⃣ choices",icon:"Easy",keymap:{7:0,8:1,4:2,g:2,u:2,5:3,c:3,i:3}},{value:6,tooltip:"6️⃣ choices",icon:"Mild",keymap:{7:0,8:1,4:2,g:2,u:2,5:3,c:3,i:3,1:4,h:4,j:4,2:5,t:5,k:5}},{value:8,tooltip:"8️⃣ choices",icon:"Moderate",keymap:{7:0,8:1,4:2,g:2,u:2,5:3,c:3,i:3,1:4,h:4,j:4,2:5,t:5,k:5,0:6,m:6,".":7,w:7,",":7}},{value:9,tooltip:"9️⃣ choices",icon:"Intricate",keymap:{7:0,8:1,9:2,4:3,g:3,u:3,5:4,c:4,i:4,6:5,r:5,o:5,1:6,h:6,j:6,2:7,t:7,k:7,3:8,n:8,l:8}},{value:12,tooltip:"1️⃣2️⃣ choices",icon:"Devious",keymap:{}},{value:16,tooltip:"1️⃣6️⃣ choices",icon:"Fiendish",keymap:{}},{value:24,tooltip:"2️⃣4️⃣ choices",icon:"Mephistophelian",keymap:{}},{value:36,tooltip:"3️⃣6️⃣ choices",icon:"Diabolical",keymap:{}},{value:54,tooltip:"5️⃣4️⃣ choices",icon:"Maelstrom",keymap:{}}],leximapXWheelFactor:1},mounted:function(){var e,t;3<=(e=this.getCookieValue("l").split("+")).length?(this.alang=e[0],this.qlang=e[1],this.match_mode=parseInt(e[2])):(t=[...window.navigator.languages.reduce((t,e)=>(t.add(e.slice(0,2)),t),new Set)],this.alang=t[0]||"",this.qlang=t[1]||t[0]||""),this.alang_options.push({value:this.alang}),this.qlang_options.push({value:this.qlang}),fetch(window.location.origin+"/language").then(t=>t.json()).then(t=>{this.alang_options=t,this.aLeximap=t.filter(t=>0<t.coord_x).map(t=>({value:t.value,text:t.text,coord_x:t.coord_x,coord_y:t.coord_y})),768<=this.windowWidth&&890<this.windowHeight&&e.length<3&&document.querySelector(".dropdown-lang .dropdown-toggle").click()}).then(()=>{this.popHypernym(!0)}).catch(t=>{console.error(t)}),(t=this.getCookieValue("d"))&&(this.difficultyLvl=parseInt(t.slice(t.length-1),16)||this.difficultyLvl),window.addEventListener("keydown",t=>{if(this.quizStarted){const i=(t,e)=>this.difficulties[e].keymap[t];const s=(e=t.key,e=i(e,this.difficultyIndex-1),document.getElementById("choice-"+e));s&&s.click(),"a"!=t.key&&"Escape"!=t.key||document.getElementById("btn-bomb").click(),"*"!=t.key&&"y"!=t.key||this.speakTitle(),"/"!=t.key&&"s"!=t.key||this.speakQuote(),"-"!=t.key&&"d"!=t.key||this.toggleDisplayTitleImg(),"+"!=t.key&&"f"!=t.key||document.getElementsByClassName("title-link")[0].click(),"."!=t.key&&","!=t.key&&"e"!=t.key&&"w"!=t.key||this.toggleDisplayTitleLeximap()}var e}),window.onresize=()=>{this.windowWidth=window.innerWidth},window.onbeforeunload=()=>{if(this.quizStarted)return""}},watch:{alang:function(){this.alang&&this.fetchLeadQuote()}},computed:{showScore(){return 0<=this.score},quizStarted(){return this.choices&&0<this.choices.length&&this.score<0},qlangOptions(){return 0!==this.match_mode?this.qlang_options:this.qlang_options.filter(t=>t.value!=this.alang)},alangOptions(){return this.alang_options},alangOpt(){return this.alang_options.find(t=>t.value===this.alang)||{value:"",text:"",label_a:"",label_q:"",label_s:"",label_t:"",label_m:"",label_m0:"",label_m1:"",label_m2:""}},qlangOpt(){return this.qlang_options.find(t=>t.value===this.qlang)||{value:"",text:"",label_a:"",label_q:"",label_s:"",label_t:"",label_m:"",label_m0:"",label_m1:"",label_m2:""}},qText(){return this.q_title||this.q_desc},quotelangOpt(){return this.qlang_options.find(t=>t.value===this.quoteLang)},labelQuestion(){return this.alangOpt.label_q||this.alang_options[0].label_q},labelAnswer(){return this.alangOpt.label_a||this.alang_options[0].label_a},labelMatchmode(){return this.alangOpt.label_m||this.alang_options[0].label_m},labelGameStart(){return this.alangOpt.label_s||this.alang_options[0].label_s},labelPageTitle(){return this.quizStarted?"":this.alangOpt.label_t||this.alang_options[0].label_t},difficultyIndex(){return this.difficulties.findIndex(t=>t.value==this.difficulty)+1},levelMaxCap(){return Object.keys(this.board).length},levelPlayed(){return Object.values(this.board).filter(t=>0<t.length).length},quizPlayed(){return Object.values(this.board).reduce((t,e)=>t+e.length,0)},quizCorrect(){return Object.values(this.board).reduce((t,e)=>t+e.filter(t=>0<t).length,0)},quizIncorrect(){return Object.values(this.board).reduce((t,e)=>t+e.filter(t=>t<0).length,0)},longestLevelCount(){return Math.max.apply(Math,Object.values(this.board).map(t=>t.length))},hyperGeoMean(){var t=this.hypernym_grid.reduce((t,e)=>t+e.count*e.count,0);return Math.sqrt(t/64)+8},qHypernymTexts(){var t=this.hypernym_list.find(t=>t.value===this.q_hypernym);return t?t.texts:[null,null,null]},leximapXfactor(){return Math.max(1440/this.windowWidth,this.leximapXWheelFactor)*this.windowWidth/1440},showBottomAlert(){return!this.getCookieValue("lang")},choiceHeight(){this.windowWidth;var t=document.getElementsByClassName("choices")[0],t=window.getComputedStyle(t).width.slice(0,-2);return Math.ceil(t/this.difficulty*Math.floor(Math.sqrt(this.difficulty)))},choiceFontSize(){this.windowWidth&&this.difficulty;var t=document.getElementsByClassName("choices")[0],t=window.getComputedStyle(t).width.slice(0,-2);return Math.ceil(t/10/Math.sqrt(this.difficulty)*(1+(Math.sqrt(this.difficulty)-1)/12))},titleDescFontSize(){var t=document.querySelector(".title-box"),e=t?t.clientWidth:Math.min(800,this.windowWidth),t=/[a-zа-яα-ω]{3,}/gi.test(this.q_desc)&&this.q_desc.length<60?2.4:1.6;return e/Math.max(12,Math.min(18,this.q_desc.length-2))*t},match_mode_options(){return[{text:`👁 ${this.alangOpt.label_m0||this.alang_options[0].label_m0||""} `+this.qlangOpt.text,value:0},{text:`👁️‍🗨️ ${this.alangOpt.label_m1||this.alang_options[0].label_m1||""} `+this.qlangOpt.text,value:1},{text:`🧠 ${this.alangOpt.label_m2||this.alang_options[0].label_m2||""} `+this.qlangOpt.text,value:2}].slice(this.qlang===this.alang?1:0)},showDifficulties(){return this.difficulties.slice(0,this.difficultyLvl+1).map((t,e)=>{const i=JSON.parse(JSON.stringify(t));return e===this.difficultyLvl&&e!==this.difficulties.length&&(i.disabled=!0,i.icon="️??",i.tooltip="Reach all levels in the previous difficulty to unlock"),0===e&&this.difficultyLvl<=+this.difficulties.length&&(i.disabled=!0,i.icon="??",i.hide=this.difficultyLvl<this.difficulties.length,i.tooltip="Finish the last difficulty to unlock"),i}).sort((t,e)=>t.value-e.value)},hotkeyTable(){var i,s,t=(t=Object.entries(this.difficulties[this.difficultyIndex-1].keymap),i=1,s=t=>t[0],t.reduce((t,e)=>((t[e[i]]=t[e[i]]||[]).push(s(e)),t),{})),t=Object.entries(t).map(([t,e])=>({Key:e.map(t=>1==t.length?t.toUpperCase():t),Description:`choose "${this.choices[t]}"`}));return[{Key:["A","Esc"],Description:"toggle category selector"},{Key:[".",",","E","W"],Description:"exposit lexical map"},{Key:["-","D"],Description:"display image"},{Key:["/","S"],Description:"say <quote> in "+(this.quotelangOpt||this.alangOpt).text},{Key:["*","Y"],Description:`yell "${this.qText}" in `+this.qlangOpt.text},{Key:["+","F"],Description:`find "${this.qText}" on `+(this.q_title?this.qlang+".wikipedia.org":"google")},...t]}},asyncComputed:{async titleImageUrl(){if(!this.displayTitleImage)return"javascript:void(0)";const t=["collage","trid","schem","chem","pic","dist","locator","taxnrg","flag","logo","icon","rimg"];var e=`
SELECT ?item ${t.map(t=>"?"+t).join(" ")} {
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
}`;const i=await fetch("https://query.wikidata.org/sparql?query="+e,{headers:{Accept:"application/json"}}),s=await i.json(),a=t.map(e=>{var t=s.results.bindings.filter(t=>t[e]);return 0<t.length?t[Math.floor(t.length*Math.random())][e].value:null});return a.find(t=>t)||"#"},async qLeximap(){if(this.alang){const t=await fetch(window.location.origin+"/language?lang="+this.alang),e=await t.json();return this.qlang_options=e,e.filter(t=>0<t.coord_x)}},async titleLeximap(){var e=this.q_id;if(0<e){var t=`
SELECT (lang(?label) as ?lang) ?label WHERE {
  wd:Q${e} rdfs:label ?label.
}`;try{const i=await this.fulfillWithTimeLimit(fetch("https://query.wikidata.org/sparql?query="+t,{headers:{Accept:"application/json"}}),2e3,null);if(!i)throw"wikidata query timeout 2000";const s=await i.json(),a=[];return s.results.bindings.forEach(t=>{const e=t.lang.value;var i=t.label.value,t=this.qlang_options.find(t=>this.transLangCode(t.value)==e);t&&t.coord_x&&a.push({text:i,code:t.value,lang:t.text,coord_x:Math.abs(t.coord_x),coord_y:Math.abs(t.coord_y)})}),a}catch(t){console.error("titleLeximap",e,t)}}return[]}},methods:{startGameAtDifficulty:function(t){this.match_mode<0?alert("Choose a mode to start: 👁 | 👁️‍🗨️ | 🧠"):0!=this.match_mode||this.qlang!=this.alang?(this.difficulty=t,this.score=-1,this.startBtnDisabled=!0,this.displayScoreChart=!1,this.displayTitleLeximap=!1,this.hypernymColorHue=Math.floor(64*Math.random()),this.newGame()):alert(`Choose a language other than ${this.alangOpt.text} to ${this.alangOpt.label_m0||this.alang_options[0].label_m0} ... or choose a mode: 👁️‍🗨️ | 🧠`)},newGame:async function(){this.qlang&&this.alang||alert("no language selected");try{const e=await fetch(window.location.origin+"/next",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(this.packPayload(-1,0,{},!0))});var t=await e.json();this.lvl=t.lvl,this.board=t.board,0<=t.score?this.gameOverAction(t.score):(this.popHypernym(),0===this.match_mode?this.unpackRespData(t):1===this.match_mode?await this.fetchQuestionDescription(t)||await this.selectChoice(null,-1):2===this.match_mode&&(await this.fetchFuzzyAnswer(t)||await this.selectChoice(null,-1)),this.gameStartAction())}catch(t){console.error(t)}finally{this.startBtnDisabled=!1,fetch(window.location.origin+"/save-languages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({alang:this.alang,qlang:this.qlang,mode:this.match_mode})})}},endGame:async function(){try{const t=await fetch(window.location.origin+"/next",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(this.packPayload(0,0,this.board,!1))}),e=await t.json();setTimeout(()=>{this.board=e.board,this.gameOverAction(e.score)},200)}catch(t){console.error(t)}},selectChoice:async function(e,i,s=0){if(s>=30/this.match_mode)this.endGame();else{e&&this.gameSelectAction(e,i),document.querySelectorAll(".btn-choice").forEach(t=>t.disabled=!0),this.progressAnimate=!0;try{var t=0<s?0:this.q_id,a=0<s||this.answer===i;const l=await this.fulfillWaitUntil(fetch(window.location.origin+"/next",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(this.packPayload(this.lvl,t,this.board,a))}),160,null),o=l.find(t=>t.value).value;var n=await o.json();if(this.lvl=n.lvl,this.board=n.board,0<=n.score)this.gameOverAction(n.score);else if(0===this.match_mode)this.unpackRespData(n);else if(1===this.match_mode){if(!await this.fetchQuestionDescription(n))return void await this.selectChoice(null,i,++s)}else if(2===this.match_mode&&!await this.fetchFuzzyAnswer(n))return void await this.selectChoice(null,i,++s);this.displayTopQuote&&this.fetchLeadQuote([this.choices[this.answer],this.qHypernymTexts[1],this.q_title_en,this.qHypernymTexts[0]])}catch(t){console.info(e,i,s,this.q_id),console.error(t)}finally{document.querySelectorAll(".btn-choice").forEach(t=>t.disabled=!1),this.progressAnimate=!1,e&&(e.target.classList.add("btn-secondary"),1<this.difficulty&&(e.target.classList.remove("btn-success"),e.target.classList.remove("btn-danger")),e.target.blur(),e.handled=!0)}}},fetchQuestionDescription:async function(t){var e=await this.sparqlGetDescription(t.q_id,this.qlang);return!!e&&(this.unpackRespData(t),this.q_title="",this.q_desc=e,!0)},sparqlGetDescription:async function(e,i){var t=`
SELECT ?desc WHERE {
  wd:Q${e} schema:description ?desc.
  FILTER ( lang(?desc) = "${i}" )
}`;try{const a=await this.fulfillWithTimeLimit(fetch("https://query.wikidata.org/sparql?query="+t,{headers:{Accept:"application/json"}}),2e3,null);if(!a)throw isFuzzy=!0,"wikidata query timeout 2000";var s=(await a.json()).results.bindings;return s[0]?s[0].desc.value:null}catch(t){console.error("sparqlGetDescription",e,i,t)}},fetchFuzzyAnswer:async function(t){var e=await this.queryFuzzyAnswer(t.q_id,this.transLangCode(this.alang));if(!e.aid||!e.atitle)return!1;this.unpackRespData(t);const i=t=>t.charAt(0).toUpperCase()+t.substring(1);e=i(e.atitle),t=t.choices.map(t=>i(t));return this.choices=[e,...t],this.shuffleArray(this.choices),this.answer=this.choices.indexOf(e),!0},queryFuzzyAnswer:async function(t,e){let i=await this.sparqlGetSiblings(t,e,"","",!0);return i.isFuzzy?i:(i=await this.sparqlGetSiblings(t,e,"wdt:P31?","wdt:P31?"),i.isFuzzy?i:(i=await this.sparqlGetSiblings(t,e,"wdt:P31?","wdt:P31?/wdt:P279"),i.isFuzzy?i:(i=await this.sparqlGetSiblings(t,e,"wdt:P31?/wdt:P279","wdt:P31?/wdt:P279?"),i.isFuzzy?i:(i=await this.sparqlGetSiblings(t,e,"wdt:P31?/wdt:P279/wdt:P279","wdt:P31?/wdt:P279/wdt:P279"),i.isFuzzy?i:(i=await this.sparqlGetSiblings(t,e,"wdt:P31?/wdt:P279/wdt:P279/wdt:P279","wdt:P31?/wdt:P279+"),i.isFuzzy,i)))))},sparqlGetSiblings:async function(e,i,t="wdt:P31?",s="wdt:P31?",a=!1){let n=0,l="",o=!1;s=a?`SELECT DISTINCT * WHERE {
{
  SELECT DISTINCT
  ?sim ?simLabelA  
    WHERE {
    wd:Q${e} wdt:P361? ?whole .
    ?sim wdt:P361? ?whole .
    ?sim rdfs:label ?simLabelA filter (lang(?simLabelA) = '${i}').
    }
}
UNION
{
  SELECT DISTINCT
  ?sim ?simLabelA 
    WHERE {
    wd:Q${e} wdt:P527? ?part .
    ?sim wdt:P527? ?part .
    ?sim rdfs:label ?simLabelA filter (lang(?simLabelA) = '${i}').
    }
}
UNION
{
  SELECT DISTINCT
  ?sim ?simLabelA 
    WHERE {
    wd:Q${e} wdt:P366? ?use .
    ?sim wdt:P366? ?use .
    ?sim rdfs:label ?simLabelA filter (lang(?simLabelA) = '${i}').
    }
}
UNION
{
  SELECT DISTINCT
  ?sim ?simLabelA 
    WHERE {
    wd:Q${e} wdt:P1535? ?useby .
    ?sim wdt:P1535? ?useby .
    ?sim rdfs:label ?simLabelA filter (lang(?simLabelA) = '${i}').
    }
}
UNION
{
  SELECT DISTINCT
  ?sim ?simLabelA 
    WHERE {
    wd:Q${e} wdt:P2283? ?uses .
    ?sim wdt:P2283? ?uses .
    ?sim rdfs:label ?simLabelA filter (lang(?simLabelA) = '${i}').
    }
}
UNION
{
  SELECT DISTINCT
  ?sim ?simLabelA 
    WHERE {
    wd:Q${e} wdt:P171? ?ptax .
    ?sim wdt:P171? ?ptax .
    ?sim rdfs:label ?simLabelA filter (lang(?simLabelA) = '${i}').
    }
}
UNION
{
  SELECT DISTINCT
  ?sim ?simLabelA 
    WHERE {
    wd:Q${e} wdt:P1269 ?face_duo .
    ?sim wdt:P1269? ?face_duo .
    ?sim rdfs:label ?simLabelA filter (lang(?simLabelA) = '${i}').
    }
}
UNION
{
  SELECT DISTINCT
  ?sim ?simLabelA 
    WHERE {
    wd:Q${e} wdt:P4969? ?deriv .
    ?sim wdt:P4969? ?deriv .
    ?sim rdfs:label ?simLabelA filter (lang(?simLabelA) = '${i}').
    }
}
UNION
{
  SELECT DISTINCT
  ?sim ?simLabelA 
    WHERE {
    wd:Q${e} wdt:P1659? ?see .
    ?sim wdt:P1659? ?see .
    ?sim rdfs:label ?simLabelA filter (lang(?simLabelA) = '${i}').
    }
}
}
ORDER BY UUID() 
LIMIT 3`:`SELECT DISTINCT ?sim ?simLabelA 
WHERE
{
    wd:Q${e} ${t} ?class.
    FILTER (?class not in (wd:Q151885, wd:Q1969448, wd:Q4925178, wd:Q12812139, wd:Q13406463, wd:Q19361238))
    ?sim ${s} ?class .
    ?sim rdfs:label ?simLabelA filter (lang(?simLabelA) = '${i}').
}
ORDER BY uuid()
LIMIT 3`;try{var r;const h=await this.fulfillWithTimeLimit(fetch("https://query.wikidata.org/sparql?query="+s,{headers:{Accept:"application/json"}}),2e3,null);if(!h)throw o=!0,"wikidata query timeout 2000";for(r of(await h.json()).results.bindings)if(n=parseInt(r.sim.value.split("Q")[1])||n,l=r.simLabelA.value||l,n!=e&&"!"!==l&&l.indexOf(":",1)<0){o=!0;break}}catch(t){console.error("sparqlGetSiblings",e,i,t)}finally{return{aid:n,atitle:l,isFuzzy:o}}},packPayload:function(t,e,i,s){return{lvl:t,qid:e,board:i,is_correct:s,qlang:this.qlang,alang:this.alang,hypernym:this.hypernyms,difficulty:this.difficulty,match_mode:this.match_mode}},unpackRespData:function(t){this.q_desc="",this.q_id=t.q_id,this.q_hypernym=t.q_hypernym,this.q_title=t.q_title,this.q_title_en=t.q_title_en,this.choices=t.choices,this.answer=t.answer},gameStartAction:function(){document.getElementById("page-header").classList.add("py-0","mb-2"),this.isCollapsingBomb||document.getElementById("btn-bomb").click(),this.displayTopQuote=!1;const t=document.querySelector(".hypernym-grid"),e=document.querySelector("#progress-row");t.classList.remove("hypernym-grid-centered"),1200<this.windowWidth&&t.classList.add("float-right"),e.parentNode.insertBefore(t,e),this.gameStartTime=(new Date).getTime(),this.sessionHistory={},sessionStorage.setItem(this.gameStartTime,"{}")},gameSelectAction:function(t,i){t.preventDefault(),t.target.classList.remove("btn-secondary"),1<this.difficulty&&t.target.classList.add(this.answer===i?"btn-success":"btn-danger"),setTimeout(()=>{const t=this.hypernym_grid.find(t=>t.value===this.q_hypernym);t.count+=this.answer===i?1:-1;var e={i:this.q_id,q:this.qText,p:this.choices[i],c:this.choices,a:this.answer,r:this.answer===i,t:(new Date).getTime()};this.sessionHistory[this.lvl]?this.sessionHistory[this.lvl].push(e):this.sessionHistory[this.lvl]=[e],sessionStorage.setItem(this.gameStartTime,JSON.stringify(this.sessionHistory))},10)},gameOverAction:function(t){this.score=t,this.choices=[],this.answer=-1,this.q_id=0,this.q_desc="",this.q_title="",this.q_title_en="",this.q_hypernym="",this.displayTopQuote=!0,document.getElementById("page-header").classList.remove("py-0","mb-2"),document.getElementById("btn-bomb").click();const e=document.querySelector(".hypernym-grid"),i=document.querySelector(".score-board");e.classList.remove("float-right"),e.classList.add("hypernym-grid-centered"),i.parentNode.insertBefore(e,i),this.difficultyLvl===this.difficultyIndex&&0<this.score&&this.levelPlayed===Object.keys(this.board).length&&(this.difficultyLvl=Math.min(this.difficulties.length+1,this.difficultyLvl+1)),fetch(window.location.origin+"/save-difficulty-level",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({difficultyLvl:this.difficultyLvl})})},scoreBar:function(t){return JSON.parse(JSON.stringify(t)).reduce((t,e)=>{return 0<(t[t.length-1]||0)*e?t[t.length-1]+=Math.sign(e):t.push(Math.sign(e)),t},[])},speakTitle:function(t,e){var i=0<=e?this.alang:this.qlang,i=this.toMajorLang(i,!0),e=0<=e?this.choices[e]:this.qText;const s=new SpeechSynthesisUtterance(e);i=this.getSpeechSynthesisVoices(i);s.voice=i[Math.floor(Math.random()*i.length)],speechSynthesis.cancel(),speechSynthesis.speak(s)},touchStart:function(t,i){var e=this;this.touchTimer=setTimeout(()=>{e.speakTitle(t,i)},400),this.touchTimerLong=setTimeout(()=>{var t=this.choices[i]||this.qText,e=this.choices[i]?this.alang:this.qlang;window.open(`https://${e}.wikipedia.org/wiki/`+t,"_blank")},2400)},touchEnd:function(t){clearTimeout(this.touchTimer),clearTimeout(this.touchTimerLong)},fetchLeadQuote:function(e,t){e=e&&e.filter(t=>!!t).map(t=>t.replace(/\(/m,"|").replace(/\)/m,""));let i=t?this.quoteLang:this.toMajorLang(this.alang),s=0;const a=t=>{s++,t.quote?(this.quoteLang=i,this.quoteQuote=t.quote,this.quoteTitle="—— "+t.titles):Wikiquote(i).getRandomQuote(s<10?e:[],a,n)},n=t=>{["nosuchsection","noPageCategories","unPageCategories"].includes(t.code)||(i="en"),Wikiquote(i).getRandomQuote("queryGeneratorLinksNoAlang"!=t.code&&"queryGeneratorLinksNoResultAlang"!=t.code||"en"==this.alang?[]:e,a,n)};Wikiquote(i).getRandomQuote(e,a,n,t)},speakQuote:function(){const t=new SpeechSynthesisUtterance(this.quoteQuote);var e=this.toMajorLang("en"==this.quoteLang?"en":this.alang,!0),e=this.getSpeechSynthesisVoices(e);t.voice=e[Math.floor(Math.random()*e.length)],speechSynthesis.cancel(),speechSynthesis.speak(t)},popHypernym:function(e){fetch(`${window.location.origin}/hypernym?al=${this.alang}&ql=`+this.qlang).then(t=>t.json()).then(t=>{t.forEach(e=>{e.texts=e.texts.map(t=>t||e.texts[0]).map(t=>t.replace(/ *\([^)]*\) */g,"")),e.text=e.texts[this.hypernym_index]}),this.hypernym_lang=["en",this.alang,this.qlang],this.hypernym_tree=t.map(t=>({value:t.value,texts:t.texts,text:t.text,place:t.place,depth:t.depth})),this.hypernym_list=t.map(t=>({value:t.value,texts:t.texts,text:t.text})),this.hypernym_grid=t.map(t=>({value:t.value,place:t.place,order:t.hilbert_order,texts:["",...t.texts.slice(1),t.ideogram,t.hexagram],count:0})),this.hypernym_grid.sort((t,e)=>t.order-e.order),this.sortHypernymTree(),e?this.hypernyms=t.filter(t=>[].indexOf(t.value)<0).map(t=>t.value):this.sortHypernymList()})},sortHypernymList:function(){this.hypernym_list.sort((t,e)=>t.text.localeCompare(e.text,this.toMajorLang(2==this.hypernym_index?this.qlang:this.alang)))},sortHypernymTree:function(){this.hypernym_tree.sort((t,e)=>t.place-e.place),setTimeout(()=>{this.hypernym_tree.forEach(t=>{const e=document.querySelector(`.tree-hypernyms input[value="${t.value}"]`);e.parentElement.style["margin-left"]=+t.depth+"rem"})},1)},switchHypernymLang:function(){this.hypernym_index=(this.hypernym_index+("en"===this.alang&&2===this.hypernym_index?2:1))%("en"===this.qlang?2:3),this.hypernym_list.forEach(t=>t.text=t.texts[this.hypernym_index]),this.hypernym_tree.forEach(t=>t.text=t.texts[this.hypernym_index]),this.quizStarted||this.hypernym_lang[1]==this.alang&&this.hypernym_lang[2]==this.qlang?this.displayHypernymTree||this.sortHypernymList():this.popHypernym()},reverseHypernymSelect:function(){this.hypernyms=this.hypernym_list.map(t=>t.value).filter(t=>this.hypernyms.indexOf(t)<0)},toggleDisplayHypernymTree:function(){this.displayHypernymTree=!this.displayHypernymTree,document.getElementById("btn-toggle-hypernym-tree").textContent=this.displayHypernymTree?"🎄":"🌲",document.getElementById("btn-toggle-hypernym-tree").title=this.displayHypernymTree?"list view":"tree view",this.displayHypernymTree||this.sortHypernymList()},toggleHypernymGridTextIndex:function(){this.hypernymGridTextIndex=(this.hypernymGridTextIndex+1)%5},toggleDisplayQuote:function(){this.displayTopQuote=!this.displayTopQuote},toggleCollapseBomb:function(){this.isCollapsingBomb=!this.isCollapsingBomb},toggleDisplayTitleImg:function(){this.displayTitleImage=!this.displayTitleImage},toggleDisplayScoreChart:function(){this.displayScoreChart=!this.displayScoreChart},onClickLeximapBtnAlang:function(t,e){this.alang=e.value,t.target.parentElement.previousSibling.click()},onClickLeximapBtnQlang:function(t,e){this.qlang=e.value,t.target.parentElement.previousSibling.click()},onHoverAlangSelect:function(t){document.querySelector("#alang-form-group button").focus()},onHoverQlangSelect:function(t){document.querySelector("#qlang-form-group button").focus()},onShowLeximapQlang:function(t){console(t.target,t.target.nextElementSibling),this.leximapDragToScroll(null,t.target.nextElementSibling)},toggleDisplayTitleLeximap:function(){this.displayTitleLeximap=!this.displayTitleLeximap,this.displayTitleLeximap&&this.leximapDragToScroll(".title-leximap")},leximapDragToScroll:function(e,i){this.leximapXWheelFactor=1;let s={left:0,top:0,x:0,y:0};const a=t=>{t.preventDefault(),this.leximapXWheelFactor=Math.max(1440/this.windowWidth,this.leximapXWheelFactor*Math.exp(t.wheelDelta/(1200*this.leximapXWheelFactor)))},n=t=>{t.preventDefault(),t.target.scrollLeft=s.left+s.x-t.clientX,t.target.scrollTop=s.top+s.y-t.clientY},l=t=>{t.preventDefault(),t.target.classList.remove("grabbing"),t.target.removeEventListener("mousemove",n),t.target.removeEventListener("mouseup",l)},o=t=>{t.preventDefault(),t.target.classList.add("grabbing"),s={left:t.target.scrollLeft,top:t.target.scrollTop,x:t.clientX,y:t.clientY},t.target.addEventListener("mousemove",n),t.target.addEventListener("mouseup",l)};let r=setInterval(()=>{const t=e?document.querySelector(e):i;t&&(clearInterval(r),t.scrollLeft=100,t.addEventListener("wheel",a,{passive:!1}),t.addEventListener("mousedown",o))},1)},getCookieValue:function(t){const e=document.cookie.match("(^|;)\\s*"+t+"\\s*=\\s*([^;]+)");return e?e.pop()||"":"7"},getSpeechSynthesisVoices:function(e){const i=e.startsWith("zh-")?5:2;let t=speechSynthesis.getVoices().filter(t=>t.lang.slice(0,i)==e);return 0==t.length&&(t=speechSynthesis.getVoices().filter(t=>"en"==t.lang.slice(0,2))),t},toMajorLang:function(t,e){const i={nl:["fy","frr","af","nds-nl","li","vls"],de:["lb","bar","als","nds","stq","pdc","got"],es:["an","ast","ext"],pt:["mwl"],fr:["oc","co","wa","nrm","pcd","frp","ht","gcr"],it:["sc","vec","lmo","scn","pms","fur","nap","lij"],ru:["be","ce","inh","os","cv","tt","crh","ba","xal","kk","ky","sah","tyv","tg","bxr","rue"],hi:["pa","gu","bh","mr","si","sa","ne","bn","kn","or","te","ml","ta"],zh:["zh-yue","hak","cdo","wuu","gan","zh-classical"],id:["ms","jv","su","mg"]};if(e){i.es.push("ca","eu"),i.pt.push("gl"),i.it.push("eo","la"),i.ru.push("uk","bg","sr"),i.pl=["cs","sk","sl","hr","bs"],i.zh=[];const n=new Set(speechSynthesis.getVoices().map(t=>t.lang.slice(0,2)));for(var s of Object.keys(i))i[s]=i[s].filter(t=>!n.has(t));i["zh-CN"]=["zh","wuu","gan","zh-classical"],i["zh-HK"]=["zh-yue","hak"],i["zh-TW"]=["zh-min-nan","cdo"]}for(var a of Object.entries(i))if(0<=a[1].indexOf(t))return a[0];return t||"en"},transLangCode:function(t){return{"be-x-old":"be-tarask",bh:"bho","cbk-sam":"cbk","fiu-vro":"vro",no:"nb","zh-classical":"zh-hant","zh-min-nan":"nan","zh-yue":"yue"}[t]||t},shuffleArray:function(e){for(let t=e.length-1;0<t;t--){var i=Math.floor(Math.random()*(t+1));[e[t],e[i]]=[e[i],e[t]]}},hsv2hex:function(t,e,i){let s,a,n;var l=Math.floor(6*t),t=6*t-l,o=i*(1-e),r=i*(1-t*e),h=i*(1-(1-t)*e);switch(l%6){case 0:s=i,a=h,n=o;break;case 1:s=r,a=i,n=o;break;case 2:s=o,a=i,n=h;break;case 3:s=o,a=r,n=i;break;case 4:s=h,a=o,n=i;break;case 5:s=i,a=o,n=r}l=t=>{t=Math.floor(t).toString(16);return 1==t.length?"0"+t:t};return"#"+l(s)+l(a)+l(n)},shareImage:function(){html2canvas(document.querySelector("#hilbert-grid"),{scale:4}).then(t=>{t=t.toDataURL();const e=document.createElement("a");e.download=`!tweet_share_my_result_${this.labelPageTitle}_${this.qlangOpt.text}-${this.alangOpt.text}
_${[this.alangOpt.label_m0,this.alangOpt.label_m1,this.alangOpt.label_m2][this.match_mode]}
_D${this.difficulty}_Lv${this.levelPlayed}_${this.quizCorrect}(${this.quizIncorrect})_score=${this.score}
_knb.wiki_${(new Date).toLocaleString()}.png`,e.href=t,e.click()})},fulfillWithTimeLimit:async function(t,i,s){let a;var e=new Promise((t,e)=>{a=setTimeout(()=>{t(s)},i)}),e=await Promise.race([t,e]);return a&&clearTimeout(a),e},fulfillWaitUntil:async function(t,i,s){let a;var e=new Promise((t,e)=>{a=setTimeout(()=>{e(s)},i)}),e=await Promise.allSettled([t,e]);return a&&clearTimeout(a),e}}});
