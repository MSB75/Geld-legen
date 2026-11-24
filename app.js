"use strict";
const levels=[
 {id:"A",name:"Euro",desc:"Ganze Euro-Beträge",color:"#fff4b9",border:"#d6c475",e:true},
 {id:"B",name:"Zehner-Cent",desc:"10, 20, 30 … Cent",color:"#ffdeb3",border:"#d9a56d",t:true},
 {id:"C",name:"Einer-Cent",desc:"1, 2, 3 … Cent",color:"#f9cce3",border:"#d49aba",o:true},
 {id:"D",name:"Zehner- und Einer-Cent",desc:"Cent ohne Übergang",color:"#cfe8fa",border:"#94b6d0",t:true,o:true},
 {id:"E",name:"Euro und Zehner-Cent",desc:"Euro und 10er-Cent",color:"#d9efc0",border:"#98bd77",e:true,t:true},
 {id:"F",name:"Euro und Cent",desc:"Ohne Übergang",color:"#ffda42",border:"#baa01f",e:true,t:true,o:true},
 {id:"G",name:"Euro und Cent",desc:"Übergang: Einer → Zehner",color:"#b95212",border:"#87370b",dark:true,e:true,t:true,o:true,cross10:true},
 {id:"H",name:"Euro und Cent",desc:"Übergang: Cent → Euro",color:"#c43539",border:"#9c2225",dark:true,e:true,t:true,o:true,cross100:true},
 {id:"I",name:"Euro und Cent",desc:"Alle Übergänge",color:"#21558e",border:"#153d69",dark:true,e:true,t:true,o:true,cross10:true,cross100:true},
 {id:"K",name:"Euro bis 100 und Cent",desc:"Alle Geldbeträge",color:"#257b50",border:"#145936",dark:true,e:true,t:true,o:true,cross10:true,cross100:true}
];
const euro=[100,200,500,1000,2000,5000], tens=[10,20,50], ones=[1,2,5];
const app=document.querySelector("#app");
let s={level:null,mode:"ziel",range:100,difficulty:"leicht",reverse:false,targetE:null,targetC:null,items:[],message:"",kind:"",highlight:false,page:null,unit:"e",dismissedExchange:null};
let exchangeSession=null;
const fmt=(v)=>v<100?v+" Ct":v%100===0?(v/100)+" €":(v/100).toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2})+" €";
const spoken=(v)=>{const e=Math.floor(v/100),c=v%100;return [e?e+" Euro":"",c?c+" Cent":""].filter(Boolean).join(" und ")||"null Euro"};
const file=v=>v>=100?(v/100)+"-euro.png":v+"-cent.png";
const img=(v,alt="")=>'<img src="assets/'+file(v)+'" alt="'+alt+'" draggable="false">';
let speechEnabled=true;
try{speechEnabled=localStorage.getItem("geld-legen-speech")!=="off"}catch{}
function updateSpeechToggle(){
 const b=document.querySelector("#speechToggle");
 b.setAttribute("aria-pressed",String(speechEnabled));
 document.querySelector("#speechIcon").textContent=speechEnabled?"🔊":"🔇";
 document.querySelector("#speechLabel").textContent=speechEnabled?"Sprache an":"Sprache aus"
}
function toggleSpeech(){
 speechEnabled=!speechEnabled;
 try{localStorage.setItem("geld-legen-speech",speechEnabled?"on":"off")}catch{}
 if(!speechEnabled&&"speechSynthesis" in window){try{speechSynthesis.cancel()}catch{}}
 updateSpeechToggle();
}
function speak(msg){if(speechEnabled&&"speechSynthesis" in window){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(msg);u.lang="de-DE";u.rate=.84;const voices=speechSynthesis.getVoices();const voice=voices.find(v=>v.lang==="de-DE"&&v.localService)||voices.find(v=>v.lang.startsWith("de"));if(voice)u.voice=voice;speechSynthesis.speak(u)}catch{}}}
function levelStyle(l){return '--level:'+l.color+';--level-border:'+l.border+';--level-ink:'+(l.dark?'#fff':'#243340')}
function allowed(){return [...(s.level.e?euro:[]),...(s.level.t?tens:[]),...(s.level.o?ones:[])]}
function total(){return s.items.reduce((a,v)=>a+v,0)}
function centTotal(){return s.items.filter(v=>v<100).reduce((a,v)=>a+v,0)}
function target(){return (s.targetE||0)*100+(s.targetC||0)}
function hasTarget(){return s.targetE!==null||s.targetC!==null}
function mixed(){return s.level.e&&(s.level.t||s.level.o)}
function setMessage(m,kind=""){s.message=m;s.kind=kind}
function chooseLevel(id){const level=levels.find(x=>x.id===id);s={...s,level,mode:"ziel",targetE:null,targetC:null,items:[],message:"",kind:"",highlight:false,page:null,unit:level.e?"e":"c",dismissedExchange:null};render();window.scrollTo(0,0)}
function home(){s.level=null;render();window.scrollTo(0,0)}
function chooseMode(mode){
 if(!["ziel","frei"].includes(mode)||s.mode===mode)return;
 s.mode=mode;s.targetE=null;s.targetC=null;s.items=[];s.highlight=false;s.page=null;s.dismissedExchange=null;
 setMessage("");render()
}
function clearExercise(){s.targetE=null;s.targetC=null;s.items=[];s.highlight=false;s.page=null;s.dismissedExchange=null;setMessage("");render()}
function resetMoney(){s.items=[];s.page=null;s.highlight=false;s.dismissedExchange=null;setMessage(s.mode==="frei"?"Zähle dein Geld noch einmal.":"Lege den Betrag noch einmal.");render()}
function homeView(){app.innerHTML='<section class="home-wrap"><div class="home-heading"><div><h1>Wähle deine Stufe.</h1><p>Mit Geldbildern rechnen und Beträge legen.</p></div><button class="listen" data-act="home-speak" aria-label="Aufgabe anhören">🔊</button></div><div class="levels">'+levels.map(l=>'<button class="level" style="'+levelStyle(l)+'" data-level="'+l.id+'" aria-label="Stufe '+l.id+': '+l.name+', '+l.desc+'"><span class="level-letter">'+l.id+'</span><span class="level-money">'+(l.e?img(100):'')+(l.t?img(10):'')+(l.o?img(1):'')+'</span><span class="level-name">'+l.name+'</span><span class="level-desc">'+l.desc+'</span></button>').join('')+'</div><div class="home-tip"><span aria-hidden="true" style="font-size:1.55rem">☝️</span> Tippe auf eine Farbe. Dann beginnt deine Übung.</div></section>'}
function digits(n,unit){const chars=String(n).split("");return chars.map((d,i)=>'<span class="'+(unit==="c"&&n===100?"eur-one":(unit==="e"?"eur":"cent")+'-'+(i===chars.length-1&&!(unit==="c"&&n%10===0)?"one":"ten"))+'">'+d+'</span>').join("")}
function moneyPieces(){let e=0,c=0;const ep=[],cp=[];s.items.forEach((v,i)=>{if(v>=100){const size=v/100;ep.push({start:e+1,end:e+size,v,i});e+=size}else{const old=c;c+=v;cp.push({start:old+1,end:c,v,i});if(mixed()&&s.level.cross100){for(let j=Math.floor(old/100)+1;j<=Math.floor(c/100);j++){ep.push({start:e+1,end:e+1,v:100,i,carry:true});e++}}}});return {e:ep,c:cp}}
// Find a true minimum-piece representation. Each pool respects the
// denomination and transition rules of the selected learning level.
function minimumPieces(sum,pool){
 if(sum===0)return [];
 if(!pool.length||sum<0)return null;
 const coins=[...pool].sort((a,b)=>b-a),step=coins[coins.length-1];
 if(sum%step)return null;
 const n=sum/step,inf=n+1,dp=new Int32Array(n+1).fill(inf),pick=new Int32Array(n+1);
 dp[0]=0;
 for(let i=1;i<=n;i++)for(const v of coins){const k=v/step;if(k<=i&&dp[i-k]+1<dp[i]){dp[i]=dp[i-k]+1;pick[i]=v}}
 if(dp[n]===inf)return null;
 const result=[];for(let i=n;i>0;){const v=pick[i];result.push(v);i-=v/step}
 return result.sort((a,b)=>b-a)
}
function exchangePools(){
 const l=s.level,groups=[];
 if(l.e&&l.cross100){groups.push([...euro,...(l.t?tens:[]),...(l.o&&l.cross10?ones:[])]);if(l.o&&!l.cross10)groups.push(ones)}
 else{if(l.e)groups.push(euro);if(l.t&&l.o&&l.cross10)groups.push([...tens,...ones]);else{if(l.t)groups.push(tens);if(l.o)groups.push(ones)}}
 return groups
}
function findExchange(){
 let candidates=[];
 for(const pool of exchangePools()){
  const all=s.items.map((v,i)=>pool.includes(v)?i:-1).filter(i=>i>=0);if(all.length<2)continue;
  const sum=all.reduce((a,i)=>a+s.items[i],0),best=minimumPieces(sum,pool);if(!best||best.length>=all.length)continue;
  // Keep already optimal money untouched; mark only the redundant group.
  const keep=new Map();for(const v of best)keep.set(v,(keep.get(v)||0)+1);
  const ids=[];for(const i of all){const v=s.items[i];if(keep.get(v)>0)keep.set(v,keep.get(v)-1);else ids.push(i)}
  const plan=[];for(const v of [...pool].sort((a,b)=>b-a))for(let k=0;k<(keep.get(v)||0);k++)plan.push(v);
  if(!plan.length||plan.length>=ids.length)continue;
  const old=ids.map(i=>s.items[i]),value=old.reduce((a,v)=>a+v,0);
  // All selections can be made in any order, provided their final count is minimal.
  candidates.push({ids,old,sum:value,plan,pool:[...pool],unit:old.some(v=>v>=100)?"e":"c",key:ids.map(i=>i+":"+s.items[i]).join(",")});
 }
 candidates.sort((a,b)=>(b.ids.length-b.plan.length)-(a.ids.length-a.plan.length)||b.sum-a.sum);
 return candidates[0]||null
}
const exchangeAmount=ex=>ex.old.every(v=>v<100)?ex.sum+" Cent":spoken(ex.sum);
const exchangeQuestion=ex=>"Kannst du die "+exchangeAmount(ex)+" auch anders legen?";
function correctChoice(ex,remaining,v){
 if(!ex.pool.includes(v)||v>remaining)return false;
 const before=minimumPieces(remaining,ex.pool),after=minimumPieces(remaining-v,ex.pool);
 return !!before&&!!after&&after.length===before.length-1
}
function board(unit,pieces,exchange){const isE=unit==="e", base=isE?0:((s.page??Math.max(0,Math.ceil(centTotal()/100)-1))*100);const realRange=isE?s.range:Math.max(s.range,Math.min(100,Math.ceil(Math.max(0,centTotal()-base)/10)*10),base>0?100:0);const range=Math.min(realRange,100);const rows=Math.ceil(range/10);const currentTarget=isE?s.targetE:s.targetC;const boardPieces=pieces.filter(p=>p.end>base&&p.start<=base+range);let cells="",overlays="";
 const rowOf=n=>s.reverse?rows-Math.ceil(n/10)+1:Math.ceil(n/10);
 const groupFor=n=>boardPieces.find(p=>p.start<=n+base&&p.end>=n+base);
 for(let n=1;n<=range;n++){const p=groupFor(n);const selected=currentTarget===n&&(isE||base===0)&&(!mixed()||isE||n!==100);const visible=s.difficulty==="leicht"||(s.difficulty==="mittel"&&n%5===0)||(s.difficulty==="schwer"&&n%10===0);const valid=(isE||s.level.o||n%10===0)&&(!mixed()||isE||n<=99)&&n<=s.range&&base===0;const mark=s.highlight&&exchange&&p&&exchange.ids.includes(p.i);const canSelect=s.mode!=="frei"&&valid;const label=n+(isE?" Euro":" Cent");const color=p?(p.i%2?"#d7e9f7":"#d7f1eb"):"";cells+='<button class="cell '+(canSelect?"selectable":s.mode==="frei"?"counting":"locked")+(selected?" target-cell":"")+(p?" covered":"")+(mark?" highlight":"")+(rowOf(n)===rows?" last-row":"")+'" style="grid-row:'+rowOf(n)+';grid-column:'+((n-1)%10+1)+(color?";--fill:"+color:"")+'" data-cell="'+unit+':'+n+'" '+(!canSelect?'aria-disabled="true"':'')+' aria-label="'+(visible||selected||p?label:"Feld in Zeile "+Math.ceil(n/10)+", Spalte "+((n-1)%10+1))+(selected?", Ziel":"")+(p?", abgedeckt":"")+'"><span class="num">'+(visible||selected?digits(n,unit):"")+'</span></button>'}
 for(const p of boardPieces){let start=Math.max(p.start-base,1),end=Math.min(p.end-base,range);if(start>end)continue;if(p.start<base+1)continue;let segments=[];for(let k=start;k<=end;){const last=Math.min(end,Math.ceil(k/10)*10);segments.push([k,last]);k=last+1}const [a,b]=segments.sort((x,y)=>(y[1]-y[0])-(x[1]-x[0]))[0];const c=(a-1)%10+1,span=b-a+1;overlays+='<div class="money-overlay '+(span===1?"single":"")+'" style="grid-row:'+rowOf(a)+';grid-column:'+c+' / span '+span+'" aria-hidden="true">'+img(p.v)+(p.carry?'<span class="carry">100 Ct</span>':"")+'</div>'}
 const pages=Math.max(1,Math.ceil(centTotal()/100));let foot=!isE&&pages>1?'<div class="board-footer"><button class="soft" data-act="prev-page" '+(base===0?"disabled":"")+'>◀</button> Cent-Tafel '+(base/100+1)+' / '+pages+' <button class="soft" data-act="next-page" '+(base/100>=pages-1?"disabled":"")+'>▶</button></div>':"";
 if(!isE&&mixed()&&s.level.cross100&&centTotal()>=100)foot+='<div class="board-footer"><span>✓ '+Math.floor(centTotal()/100)+' × 100 Ct = '+Math.floor(centTotal()/100)+' €</span><span>Auf der Euro-Tafel sichtbar.</span></div>';
 return '<section class="board-card" data-board="'+unit+'" '+(mixed()&&s.unit!==unit?'hidden':'')+'><div class="board-head"><h2>'+img(isE?100:1)+(isE?"Euro-Tafel":"Cent-Tafel")+'</h2>'+(mixed()&&s.mode!=="frei"?'<button class="outline zero" data-zero="'+unit+'">0 '+(isE?"€":"Ct")+'</button>':'')+'<span class="board-note">'+(s.mode==="frei"?"Die Tafel zählt mit.":isE?"Tippe auf deine Zahl.":!s.level.o?"Tippe auf einen Zehner.":"Tippe auf deine Zahl.")+'</span></div><div class="table-slot"><div class="table" style="--rows:'+rows+'" role="group" aria-label="'+(isE?"Euro":"Cent")+'-Tafel bis '+range+'">'+cells+overlays+'</div></div>'+foot+'</section>'}
function workView(){const l=s.level,t=target(),p=total(),ok=hasTarget()&&t>0&&p===t,ex=findExchange(),pieces=moneyPieces(),two=mixed();const m=s.message||(s.mode==="frei"?"Tippe auf ein Geldbild. Die Tafel zählt mit.":!hasTarget()?"Tippe zuerst auf eine Zahl.":ok?"Geschafft! Genau richtig gelegt.":"Tippe auf ein Geldbild.");const kind=s.kind||(ok?"success":"");
 const buttons=(values,active,attr)=>'<div class="seg">'+values.map(([v,label])=>'<button data-'+attr+'="'+v+'" aria-pressed="'+(String(active)===String(v))+'">'+label+'</button>').join("")+'</div>';
 const amount=v=>!l.e?v+" Ct":v===0?"0 €":fmt(v);
 const tab=(u,label,value)=>'<button class="board-tab" data-unit="'+u+'" aria-pressed="'+(s.unit===u)+'">'+img(u==="e"?100:1)+'<span>'+label+'<strong>'+(value===null?"–":value+(u==="e"?" €":" Ct"))+'</strong></span></button>';
 const modeButtons='<div class="mode-switch" role="group" aria-label="Arbeitsweise"><button data-mode="ziel" aria-pressed="'+(s.mode==="ziel")+'">🎯 Betrag wählen</button><button data-mode="frei" aria-pressed="'+(s.mode==="frei")+'">🔢 Frei zählen</button></div>';
 const question='<div class="question-panel '+(ex?"ready":"")+'" role="region" aria-label="Tauschfrage"><button class="question-button" data-act="question" '+(!ex?"disabled":"")+' aria-label="Frage: Anders legen?"><span>🔊</span><b>Anders legen?</b></button><p aria-live="polite">'+(ex?'Kannst du die <strong>'+exchangeAmount(ex)+'</strong> auch anders legen?':'Hier erscheint die Tauschfrage.')+'</p><button class="swap-button" data-act="exchange" '+(!ex?"disabled":"")+'>⇄ Tauschen</button></div>';
 app.innerHTML='<section class="work"><div class="work-tools"><button class="outline" data-act="home">⌂ Stufen</button><div class="level-tag" style="'+levelStyle(l)+'"><b>'+l.id+'</b> <span>'+l.name+'</span></div>'+modeButtons+'<div class="settings"><span class="setting-label">Zahlenraum</span>'+buttons([[20,"20"],[50,"50"],[100,"100"]],s.range,"range")+'<span class="setting-label">Tafel</span>'+buttons([["leicht","Leicht"],["mittel","Mittel"],["schwer","Schwer"]],s.difficulty,"difficulty")+'<button class="outline" data-act="reverse" title="Zählrichtung ändern" aria-label="Zählrichtung ändern" aria-pressed="'+s.reverse+'">↕</button></div></div><div class="summary"><div class="mission"><button class="listen" data-act="mission" aria-label="Aufgabe anhören">🔊</button><div><h1>'+(s.mode==="frei"?"Zähle dein Geld.":!hasTarget()?"Wähle deinen Geldbetrag.":ok?"Super! Genau richtig.":"Lege deinen Geldbetrag.")+'</h1><p>'+(s.mode==="frei"?"Tippe auf Geld. Die Tafel zählt mit.":!hasTarget()?"Tippe auf eine Zahl.":ok?"✓ Dein Betrag ist fertig.":"Beginne bei 1.")+'</p></div></div><div class="stats"><div class="stat target"><span>'+(s.mode==="frei"?"Arbeitsweise":"Dein Betrag")+'</span><strong>'+(s.mode==="frei"?"Frei zählen":!hasTarget()?"–":amount(t))+'</strong></div><div class="stat"><span>Gelegt</span><strong>'+amount(p)+'</strong></div><div class="stat remaining"><span>'+(s.mode==="frei"?"Zielbetrag":"Fehlt noch")+'</span><strong>'+(s.mode==="frei"?"–":!hasTarget()?"–":amount(Math.max(0,t-p)))+'</strong></div></div></div><div class="workspace"><div class="boards '+(two?"two":"one")+'">'+(two?'<nav class="board-tabs" aria-label="Zahlentafel wählen">'+tab("e","Euro",s.mode==="frei"?Math.floor((p-centTotal())/100)+(s.level.cross100?Math.floor(centTotal()/100):0):s.targetE)+tab("c","Cent",s.mode==="frei"?centTotal():s.targetC)+'</nav>':'')+(l.e?board("e",pieces.e,ex):"")+(l.t||l.o?board("c",pieces.c,ex):"")+'</div><aside class="palette"><div class="palette-head"><h2>Dein Geld</h2><p>Tippe auf ein Geldbild.</p></div><div class="money-options">'+allowed().map(v=>'<button class="money-btn" data-money="'+v+'" aria-label="'+spoken(v)+' legen">'+img(v)+'<span>'+fmt(v)+'</span></button>').join("")+'</div>'+question+'<div class="palette-actions"><button class="soft" data-act="undo" '+(!s.items.length?"disabled":"")+'>↶ Zurück</button><button class="outline" data-act="reset" '+(!s.items.length?"disabled":"")+'>↻ Neu legen</button><button class="primary" data-act="new">'+(s.mode==="frei"?"＋ Neu zählen":"＋ Neuer Betrag")+'</button></div><div class="feedback '+kind+'" role="status" aria-live="polite">'+m+'</div></aside></div></section>';
}
function render(){const active=document.activeElement;const data=active?.dataset;const key=data&&Object.keys(data).find(k=>["cell","money","act","range","difficulty","mode"].includes(k));if(s.level)workView();else homeView();if(key&&active.matches(":focus-visible")){const next=[...app.querySelectorAll("button")].find(b=>b.dataset[key]===data[key]);next?.focus({preventScroll:true})}}
function chooseTarget(unit,n){if(s.mode==="frei")return;if(unit==="e"&&!s.level.e)return;if(unit==="c"&&(!s.level.o&&n%10!==0||mixed()&&n>=100||n>s.range))return;const old=unit==="e"?s.targetE:s.targetC;if(old===n)return;if(s.items.length){s.items=[];s.page=null;s.highlight=false;setMessage("Neuer Betrag gewählt. Lege das Geld von Anfang an.")}else setMessage("");s.dismissedExchange=null;if(unit==="e")s.targetE=n;else s.targetC=n;render()}
function addMoney(v){
 if(s.mode==="frei"){
  const c=centTotal(),e=(total()-c)/100, nextC=c+(v<100?v:0);
  const maxC=mixed()&&!s.level.cross100?Math.min(s.range,99):s.range;
  const nextE=e+(v>=100?v/100:0)+(s.level.cross100?Math.floor(nextC/100):0);
  let error="";
  if(v<100&&nextC>maxC)error="Die Cent-Tafel ist voll. Beginne neu oder wähle einen größeren Zahlenraum.";
  else if(nextE>s.range)error="Die Euro-Tafel ist voll. Beginne neu oder wähle einen größeren Zahlenraum.";
  else if(v<10&&s.level.t&&s.level.o&&!s.level.cross10&&(c%10)+v>=10)error="Wähle eine Zehner-Cent-Münze für den nächsten Zehner.";
  if(error){setMessage(error,"warn");render();return}
  s.items.push(v);s.page=null;s.highlight=false;s.unit=v>=100?"e":"c";
  setMessage("Gezählt: "+(!s.level.e?total()+" Cent":fmt(total())),"success");render();
  const ex=findExchange();if(ex&&ex.key!==s.dismissedExchange)showQuestion(ex);
  return
 }
 if(!hasTarget()||target()===0){setMessage("Wähle zuerst deinen Geldbetrag.","warn");render();return}const c=centTotal(),e=Math.floor((total()-c)/100);const desiredC=s.targetC||0,desiredE=s.targetE||0;
 let error="";
 if(total()+v>target())error="Das ist zu viel. Wähle ein kleineres Geldstück.";
 else if(v>=100&&e+v/100+(s.level.cross100?Math.floor(c/100):0)>desiredE)error="So viele Euro brauchst du nicht.";
 else if(v<100&&mixed()&&!s.level.cross100&&c+v>desiredC)error="So viele Cent brauchst du nicht.";
 else if(v<100&&!mixed()&&c+v>desiredC)error="So viele Cent brauchst du nicht.";
 else if(v<100&&mixed()&&s.level.cross100&&(e+Math.floor((c+v)/100)>desiredE))error="Das ist zu viel für die Euro-Tafel.";
 else if(v<10&&s.level.t&&s.level.o&&!s.level.cross10&&(c%10)+v>=10)error="Wähle eine Zehner-Cent-Münze für den nächsten Zehner.";
 else if(v<10&&s.level.t&&s.level.o&&!s.level.cross10&&(c%10)+v>desiredC%10)error="Für den Einer-Cent-Betrag ist das zu viel.";
 if(error){setMessage(error,"warn");render();return}
 s.items.push(v);s.page=null;s.highlight=false;s.unit=v>=100?"e":"c";const done=total()===target();if(done){setMessage("✓ Geschafft! Genau richtig gelegt.","success")}else if(v<100&&s.level.cross100&&mixed()&&Math.floor((c+v)/100)>Math.floor(c/100))setMessage("100 Cent sind 1 Euro! Schau auf die Euro-Tafel.","success");else setMessage("");render();const ex=findExchange();if(ex&&ex.key!==s.dismissedExchange)showQuestion(ex);
}
function moneyVisual(values){
 if(values.length<=12)return values.map(v=>'<span class="swap-piece">'+img(v,spoken(v))+'</span>').join("");
 const counts=new Map();for(const v of values)counts.set(v,(counts.get(v)||0)+1);
 return [...counts].map(([v,n])=>'<span class="swap-piece">'+img(v,spoken(v))+'<b>'+n+' ×</b></span>').join("")
}
function selectionSpoken(values){const counts=new Map();for(const v of values)counts.set(v,(counts.get(v)||0)+1);return [...counts].map(([v,n])=>n===1?spoken(v):n+" mal "+spoken(v)).join(" und ")}
function showQuestion(ex){
 if(!ex||exchangeSession)return;
 exchangeSession={ex,chosen:[],remaining:ex.sum,wrong:0};
 s.highlight=true;s.unit=ex.unit;if(ex.unit==="c"){const first=moneyPieces().c.find(p=>p.i===ex.ids[0]);s.page=first?Math.floor((first.start-1)/100):null}render();
 const d=document.querySelector("#questionDialog");
 d.innerHTML='<div class="swap-title"><span class="swap-step">1</span><h2 id="question-title">Anders legen?</h2><button class="listen" data-say aria-label="Frage anhören">🔊</button></div><div class="swap-amount">'+exchangeAmount(ex)+'</div><div class="swap-old" aria-label="Dieses Geld liegt auf der Tafel">'+moneyVisual(ex.old)+'</div><p class="swap-question-text">'+exchangeQuestion(ex)+'</p><p class="swap-hint">Versuche es mit weniger Geldstücken.</p><div class="swap-actions"><button class="primary" data-continue>Ja, ich versuche es</button><button class="outline" data-later>Später</button></div>';
 d.querySelector("[data-say]").onclick=()=>speak(exchangeQuestion(ex));
 d.querySelector("[data-continue]").onclick=()=>{d.close();openMoneySelection()};
 d.querySelector("[data-later]").onclick=dismissExchange;
 d.showModal();speak(exchangeQuestion(ex))
}
function dismissExchange(){
 if(exchangeSession)s.dismissedExchange=exchangeSession.ex.key;
 exchangeSession=null;s.highlight=false;
 for(const id of ["questionDialog","exchangeDialog"]){const d=document.querySelector("#"+id);if(d.open)d.close()}
 if("speechSynthesis" in window)speechSynthesis.cancel();render()
}
function exchangeDialog(){const ex=findExchange();if(ex)showQuestion(ex)}
function openMoneySelection(message="",tone=""){
 const q=exchangeSession;if(!q)return;
 const d=document.querySelector("#exchangeDialog"),ex=q.ex,open=d.open;
 const remainingLabel=q.remaining>=100?spoken(q.remaining):q.remaining+" Cent";
 const instruction=q.chosen.length?"Wähle das nächste passende Geldstück.":"Wähle das passende Geldstück.";
 d.innerHTML='<div class="swap-title"><span class="swap-step">2</span><h2 id="exchange-title">'+instruction+'</h2><button class="listen" data-say aria-label="Aufgabe anhören">🔊</button></div><div class="swap-amount-row"><div class="swap-amount-box"><span>Zu tauschen</span><strong>'+exchangeAmount(ex)+'</strong></div><div class="swap-amount-box todo"><span>Fehlt noch</span><strong>'+remainingLabel+'</strong></div></div>'+(q.chosen.length?'<div class="swap-selected" aria-label="Schon gewählt"><span>✓ Schon gewählt</span>'+moneyVisual(q.chosen)+'</div>':'')+'<div class="swap-money-grid">'+allowed().map(v=>'<button class="swap-money" data-swap-value="'+v+'" aria-label="'+spoken(v)+' wählen">'+img(v)+'<strong>'+fmt(v)+'</strong></button>').join("")+'</div><div class="swap-feedback '+tone+'" role="status" aria-live="polite">'+(message||"Wähle möglichst wenige Geldstücke.")+'</div><div class="swap-bottom"><span class="swap-attempts" aria-label="'+q.wrong+' von 3 Fehlversuchen">'+[1,2,3].map(i=>'<i class="'+(i<=q.wrong?"used":"")+'"></i>').join("")+'</span><button class="outline" data-later>Später</button></div>';
 d.querySelector("[data-say]").onclick=()=>speak(instruction+" Es fehlen "+remainingLabel+".");
 d.querySelector("[data-later]").onclick=dismissExchange;
 d.querySelectorAll("[data-swap-value]").forEach(b=>b.onclick=()=>chooseSwapMoney(Number(b.dataset.swapValue)));
 if(!open)d.showModal();
 if(!message)speak(instruction+" Versuche, möglichst wenige Geldstücke zu verwenden.")
}
function commitExchange(ex,choice){
 const value=choice.reduce((a,v)=>a+v,0);if(value!==ex.sum||choice.length>=ex.ids.length)return false;
 const ids=new Set(ex.ids),first=ex.ids[0];
 s.items=s.items.flatMap((v,i)=>i===first?choice:ids.has(i)?[]:[v]);
 s.highlight=false;s.page=null;s.dismissedExchange=null;s.unit=choice[0]>=100?"e":"c";
 setMessage("✓ Gleich viel Geld, weniger Geldstücke!","success");render();return true
}
function chooseSwapMoney(v){
 const q=exchangeSession;if(!q)return;
 if(correctChoice(q.ex,q.remaining,v)){
  q.chosen.push(v);q.remaining-=v;
  if(q.remaining===0){
   const choice=[...q.chosen].sort((a,b)=>b-a),ex=q.ex;
   commitExchange(ex,choice);exchangeSession=null;document.querySelector("#exchangeDialog").close();
   speak("Richtig! "+selectionSpoken(choice)+". Gleich viel Geld mit weniger Geldstücken.");
  }else{openMoneySelection("✓ Richtig! Wähle das nächste Geldstück.","success");speak("Richtig! Wähle das nächste Geldstück.")}
  return
 }
 q.wrong++;
 const wrong="Das ist leider falsch. Versuche es nochmal!";
 if(q.wrong<3){openMoneySelection(wrong,"warn");speak(wrong);return}
 const choice=[...q.chosen,...minimumPieces(q.remaining,q.ex.pool)].sort((a,b)=>b-a),ex=q.ex;
 commitExchange(ex,choice);exchangeSession=null;
 const d=document.querySelector("#exchangeDialog");
 d.innerHTML='<div class="swap-title"><span class="swap-step solution-step">✓</span><h2 id="exchange-title">Die richtige Lösung</h2><button class="listen" data-say aria-label="Lösung anhören">🔊</button></div><p class="swap-feedback warn">Das ist leider falsch. Versuche es nochmal!</p><div class="swap-amount">'+exchangeAmount(ex)+'</div><div class="swap-solution">'+moneyVisual(choice)+'</div><p class="swap-question-text">'+choice.length+' '+(choice.length===1?"Geldstück":"Geldstücke")+' – gleich viel Geld!</p><p class="swap-hint">Die Lösung liegt jetzt auf deiner Tafel.</p><button class="primary swap-done" data-done>✓ Weiter</button>';
 const say="Das ist leider falsch. Versuche es nochmal! Die richtige Lösung ist: "+selectionSpoken(choice)+". Ich habe das Geld auf deiner Tafel getauscht.";
 d.querySelector("[data-say]").onclick=()=>speak(say);
 d.querySelector("[data-done]").onclick=()=>d.close();speak(say)
}
app.addEventListener("click",ev=>{const b=ev.target.closest("button");if(!b||b.disabled)return;const d=b.dataset;if(d.level){chooseLevel(d.level);return}if(d.mode){chooseMode(d.mode);return}if(d.unit){s.unit=d.unit;render();return}if(d.range){if(s.range!==Number(d.range)){s.range=Number(d.range);clearExercise()}return}if(d.difficulty){s.difficulty=d.difficulty;render();return}if(d.cell){if(b.getAttribute("aria-disabled")==="true")return;const [u,n]=d.cell.split(":");chooseTarget(u,Number(n));return}if(d.zero){chooseTarget(d.zero,0);return}if(d.money){addMoney(Number(d.money));return}switch(d.act){case"home":home();break;case"home-speak":speak("Wähle deine Stufe. Tippe auf eine Farbe.");break;case"mission":speak(s.mode==="frei"?(s.items.length?"Du hast "+(!s.level.e?total()+" Cent":spoken(total()))+" gelegt.":"Tippe auf ein Geldbild. Die Zahlentafel zählt mit."):!hasTarget()?"Wähle deinen Geldbetrag. Tippe auf eine Zahl.":"Lege "+spoken(target())+".");break;case"undo":{const v=s.items.pop();if(v)s.unit=v>=100?"e":"c";s.highlight=false;s.page=null;setMessage("");render();break}case"reset":resetMoney();break;case"new":clearExercise();break;case"reverse":s.reverse=!s.reverse;render();break;case"question":{const ex=findExchange();if(ex)showQuestion(ex);break}case"exchange":exchangeDialog();break;case"prev-page":s.page=Math.max(0,(s.page??Math.max(0,Math.ceil(centTotal()/100)-1))-1);render();break;case"next-page":s.page=Math.min(Math.max(0,Math.ceil(centTotal()/100)-1),(s.page??Math.max(0,Math.ceil(centTotal()/100)-1))+1);render();break}});
document.querySelector("#home").onclick=home;
document.querySelector("#speechToggle").onclick=toggleSpeech;
updateSpeechToggle();
document.querySelector("#help").onclick=()=>document.querySelector("#helpDialog").showModal();
document.querySelector("#info").onclick=()=>document.querySelector("#infoDialog").showModal();
document.querySelector("#speakhelp").onclick=()=>speak("Wähle eine Stufe. Tippe auf deine Zahl in der Tafel. Tippe auf Geld. Die Felder werden abgedeckt. Wenn du das Geld mit weniger Geldstücken legen kannst, fragt dich die App. Wähle dann das passende Geldstück.");
document.querySelectorAll("dialog .close").forEach(b=>b.onclick=()=>b.closest("dialog").close());
for(const id of ["questionDialog","exchangeDialog"]){
 document.querySelector("#"+id).addEventListener("cancel",event=>{event.preventDefault();dismissExchange()})
}
render();
const offlineStatus=document.querySelector("#offline-status");
if("serviceWorker" in navigator && window.isSecureContext){
 navigator.serviceWorker.register("./sw.js",{updateViaCache:"none"}).then(()=>navigator.serviceWorker.ready).then(()=>{offlineStatus.textContent="✓ Offline bereit. Die Dateien sind auf dem Gerät gespeichert."}).catch(()=>{offlineStatus.textContent="Offline-Speicherung nicht verfügbar. Bitte öffne die App über HTTPS."});
}else{offlineStatus.textContent="Offline-Funktion erst nach dem Öffnen über HTTPS verfügbar."}
