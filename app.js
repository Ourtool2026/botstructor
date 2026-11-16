/* Botstructor: AI project simulator + AI robotics tutor. App shell, lessons, workspace, projects, library, code dictionary, Ask Instructor. */
(function(){
const {Sim,Runner,LIB,ESP_L,ESP_R,gpioOf}=window.TookieSim;
const {COURSE,QUIZ,ESP_FACTS,presetLED,presetCar}=window.TookieCourse;
const {D:SYN,BY:SYNBY,explain}=window.TookieSyntax;
const PARTS=window.TookieParts.ALL; const PROJ=window.TookieProjects; const projDone=id=>!!(P.projDone||{})[id];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const inl=s=>esc(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>');

/* ---------- state ---------- */
const KEY='tookie.v4';
let P={lang:'en',voice:false,done:{},times:{},fails:{},sims:{},codes:{},motorDir:1,quizLevel:null,media:{},checks:{sim:0,code:0,real:0},project:null,side:true};
try{Object.assign(P,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(P))}catch(e){}};
const L=x=>x==null?'':typeof x==='string'?x:(x[P.lang]??x.en);
const T={next:{en:'Next',bn:'পরের ধাপ'},back:{en:'Back',bn:'আগের ধাপ'},check:{en:'Check my work',bn:'যাচাই করো'},listen:{en:'Listen',bn:'শুনুন'},stop:{en:'Stop',bn:'থামাও'},
 lesson:{en:'Lesson',bn:'লেসন'},step:{en:'Step',bn:'ধাপ'},home:{en:'Home',bn:'হোম'}};
const t=k=>L(T[k]);
const BN=()=>P.lang==='bn';
let S={view:'home',li:0,si:0,sim:null,runner:null,stepStart:Date.now(),sample:null,tts:null,imgs:false};

/* ---------- icons (lucide-style strokes) ---------- */
const I=(d,s=16)=>`<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const IC={search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',book:'<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 21.5A2.5 2.5 0 0 1 6.5 19H20"/>',
 cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',plus:'<path d="M12 5v14M5 12h14"/>',box:'<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',code:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13 5l-2 14"/>',
 panel:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',chev:'<path d="m9 6 6 6-6 6"/>',mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',vol:'<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',bot:'<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9 17h6"/>',play:'<path d="m7 4 13 8-13 8z"/>',sq:'<rect x="6" y="6" width="12" height="12" rx="1"/>',
 spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',check:'<path d="M20 6 9 17l-5-5"/>',bulb:'<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V16h8v-1.3A7 7 0 0 0 12 2z"/>',lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'};

/* ---------- AI ---------- */
function langLine(){return BN()?'Reply in simple Bangla (Bengali script). Keep code, pin names and part names in English.':'Reply in simple English.'}
const RULES=()=>`You are the Botstructor instructor, a friendly AI robotics tutor inside the Botstructor app for beginners (children and first-timers) in Bangladesh.
Never write the learner's whole program for them. Guide with tiny steps ("you can do this, then this"), questions that make them think, and syntax patterns. At most one line of code at a time. Keep answers short and spoken-style. ${langLine()}
Kit wiring: ESP32 DevKit (30-pin). LED lesson: D23 → 220Ω → LED, LED → GND; push button D4 → GND (INPUT_PULLUP). Car: L298N ENA=14 IN1=27 IN2=26 IN3=25 IN4=33 ENB=32, OUT1/OUT2 left motor, OUT3/OUT4 right motor, 7.4 V battery to 12V, common GND, L298N 5V → ESP32 VIN. Code is Arduino C++ (Arduino IDE, ESP32 core).
${ESP_FACTS}`;
async function askText(prompt,opts={}){if(!S.sample)throw new Error('offline'); const r=await S.sample([{role:'user',content:prompt}],{modelTier:'quick',cache:false,...opts}); return (r.text||'').trim()}
async function askJSON(prompt,opts={}){if(!S.sample)throw new Error('offline');
  if(opts.images){const r=await S.sample([{role:'user',content:prompt}],{modelTier:'default',cache:false,...opts}); const m=(r.text||'').match(/\{[\s\S]*\}/); if(!m)throw new Error('bad json'); return JSON.parse(m[0])}
  return await S.sample.json([{role:'user',content:prompt}],{modelTier:'default',cache:false,...opts})}

/* ---------- voice ---------- */
let speakingEl=null, speakId=0, VOICES=[];
function loadVoices(){try{VOICES=speechSynthesis.getVoices()||[]}catch(e){VOICES=[]}}
try{loadVoices(); speechSynthesis.addEventListener('voiceschanged',loadVoices)}catch(e){}
/* Rank the device's voices so a natural-sounding one wins over the old robotic defaults. */
function voiceScore(v,bn){
  const n=((v.name||'')+' '+(v.voiceURI||'')).toLowerCase(), l=(v.lang||'').toLowerCase().replace('_','-');
  if(!l.startsWith(bn?'bn':'en'))return -1;
  let s=1;
  if(/natural|neural|online/.test(n))s+=60;          // Edge / Windows 11 neural voices
  if(/premium|enhanced|siri/.test(n))s+=45;          // Apple high-quality voices
  if(/google/.test(n))s+=30;                         // Chrome / Android network voices
  if(/samantha|ava|allison|susan|serena|karen|daniel|moira|tessa|aria|jenny|guy|sonia|libby|emma|brian|andrew|nabanita|pradeep|tanishaa|bashkar/.test(n))s+=15;
  if(/espeak|robot|zarvox|trinoids|whisper|bad news|good news|bells|boing|bubbles|cellos|albert|fred|junior|ralph|jester|organ|superstar|wobble|grandma|grandpa|eddy|flo\b|reed|rocko|sandy|shelley/.test(n))s-=80;
  if(/microsoft (david|zira|mark|hazel|george|heera|ravi)\b/.test(n)&&!/online|natural/.test(n))s-=10; // old Windows voices
  if(bn?l==='bn-bd':l==='en-us')s+=8; else if(!bn&&/en-(gb|au|ca|in|ie|nz)/.test(l))s+=4;
  if(v.localService===false)s+=5;
  return s}
function bestVoice(bn){if(!VOICES.length)loadVoices(); let b=null,bs=0; for(const v of VOICES){const s=voiceScore(v,bn); if(s>bs){bs=s;b=v}} return b}
/* Speak sentence by sentence: natural pauses, and Chrome's network voices don't cut off on long text. */
function chunks(text){const out=[]; for(const p of text.split(/(?<=[.!?।…])\s+|\n+/)){let s=p.trim(); while(s.length>220){let k=s.lastIndexOf(', ',220); if(k<80)k=s.lastIndexOf(' ',220); if(k<1)k=220; out.push(s.slice(0,k+1).trim()); s=s.slice(k+1).trim()} if(s)out.push(s)} return out}
/* Natural cloud voice (Azure Speech via /api/tts). The first sentence is sent alone so speech starts fast;
   the rest is fetched in bigger pieces while the previous one plays. */
let curAudio=null, curDone=null;
async function ttsFetch(text,bn){const r=await fetch('/api/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,lang:bn?'bn':'en'})}); if(!r.ok)throw new Error('tts '+r.status); return URL.createObjectURL(await r.blob())}
function ttsGroups(parts,max=450){if(!parts.length)return []; const out=[parts[0]]; let cur=''; for(const p of parts.slice(1)){if(cur&&(cur+' '+p).length>max){out.push(cur); cur=p} else cur=cur?cur+' '+p:p} if(cur)out.push(cur); return out}
function playUrl(url){return new Promise(r=>{const a=new Audio(url); curAudio={stop:()=>{a.pause(); r('stopped')}}; a.onended=()=>r('ended'); a.onerror=()=>r('error'); a.play().catch(()=>r('error'))})}
/* Free natural English voice: Kokoro-82M (Apache-2.0) running inside the visitor's browser. No key, no server.
   Loaded once (~90 MB, then cached) on computers; phones, data-saver and slow connections keep the device voice. */
const KOK={w:null,state:'off',n:0,wait:{}};
function kokoroOK(){try{const c=navigator.connection||{}; if(c.saveData||/2g|3g/.test(c.effectiveType||''))return false;
  if(matchMedia('(pointer:coarse)').matches)return false; if((navigator.deviceMemory||8)<4||(navigator.hardwareConcurrency||4)<4)return false;
  return typeof Worker!=='undefined'&&typeof WebAssembly!=='undefined'}catch(e){return false}}
function kokoroFail(){KOK.state='failed'; for(const k in KOK.wait)KOK.wait[k].no(new Error('kokoro')); KOK.wait={}; try{KOK.w&&KOK.w.terminate()}catch(e){} KOK.w=null}
function kokoroStart(){if(KOK.state!=='off'||!kokoroOK())return; KOK.state='loading';
  try{const w=new Worker('vendor/kokoro-worker.js',{type:'module'}); KOK.w=w;
    w.onmessage=e=>{const m=e.data||{};
      if(m.type==='ready'){KOK.state='ready'; toast(BN()?'স্বাভাবিক ইংরেজি ভয়েস তৈরি':'Natural voice ready')}
      else if(m.type==='error')kokoroFail();
      else if(m.type==='audio'){const p=KOK.wait[m.id]; delete KOK.wait[m.id]; if(p)m.error?p.no(new Error(m.error)):p.ok(URL.createObjectURL(new Blob([m.wav],{type:'audio/wav'})))}};
    w.onerror=kokoroFail; w.postMessage({type:'load'});
    toast(BN()?'বিনামূল্যে স্বাভাবিক ভয়েস নামানো হচ্ছে (একবার, প্রায় ৯০ MB)…':'Getting a free natural voice ready (one-time download, about 90 MB)…')
  }catch(e){kokoroFail()}}
function kokoroFetch(text){return new Promise((ok,no)=>{if(!KOK.w)return no(new Error('kokoro')); const id=++KOK.n; KOK.wait[id]={ok,no}; KOK.w.postMessage({type:'speak',id,text,voice:'af_heart'})})}
/* Returns true if it spoke (or was stopped), false if nothing could be played so the caller should fall back. */
async function cloudSpeak(parts,bn,id,get=ttsFetch){
  const groups=ttsGroups(parts); let next=get(groups[0],bn), played=false;
  for(let i=0;i<groups.length;i++){
    let url; try{url=await next}catch(e){return played}
    if(id!==speakId){URL.revokeObjectURL(url); return true}
    next=i+1<groups.length?get(groups[i+1],bn):null; if(next)next.catch(()=>{});
    const how=await playUrl(url); curAudio=null; URL.revokeObjectURL(url);
    if(how==='stopped'||id!==speakId)return true;
    if(how==='error')return played;
    played=true}
  return true}
function speak(text,btn){return new Promise(res=>speak0(text,btn,res))}
async function speak0(text,btn,res){
  if(btn&&speakingEl===btn){stopSpeak();res();return}
  stopSpeak(); speakingEl=btn||null; if(btn){btn.classList.add('play'); btn._l=btn.innerHTML; btn.innerHTML=I(IC.sq,13)+' '+t('stop')}
  $('#agent').classList.add('speaking');
  const id=++speakId;
  const done=()=>{if(curDone===done)curDone=null; res&&res(); res=null; if(id!==speakId)return; $('#agent').classList.remove('speaking'); if(btn&&speakingEl===btn){btn.classList.remove('play'); btn.innerHTML=btn._l; speakingEl=null}};
  curDone=done;
  const clean=String(text).replace(/[`*#•]/g,'').replace(/→/g,BN()?' তারপর ':' to ').slice(0,1800);
  try{ if(S.tts){await S.tts.speak(clean,{language:BN()?'bn':'en'}); done(); return} }catch(e){ if(e&&/stop/.test(e.code||''))return done() }
  const bn=BN(), parts=chunks(clean.replace(/https?:\/\/\S+/g,'').replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu,''));
  if(!parts.length)return done();
  if(S.cloudTts){ if(await cloudSpeak(parts,bn,id))return done(); if(id!==speakId)return done() }
  else if(!bn){ kokoroStart(); if(KOK.state==='ready'){ if(await cloudSpeak(parts,bn,id,kokoroFetch))return done(); if(id!==speakId)return done() } }
  try{ const v=bestVoice(bn);
    parts.forEach((p,i)=>{const u=new SpeechSynthesisUtterance(p); u.lang=v?v.lang:(bn?'bn-BD':'en-US'); if(v)u.voice=v; u.rate=bn?0.95:1; u.pitch=1;
      const fin=()=>{if(id===speakId)done()}; if(i===parts.length-1)u.onend=fin; u.onerror=e=>{if(!e||e.error!=='interrupted')fin()}; speechSynthesis.speak(u)})
  }catch(e){done()}
}
function stopSpeak(){speakId++; try{curAudio&&curAudio.stop()}catch(e){} curAudio=null; const d=curDone; curDone=null; try{d&&d()}catch(e){}
  try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}try{S.tts&&S.tts.stop()}catch(e){} try{speechSynthesis.cancel()}catch(e){} $('#agent').classList.remove('speaking'); if(speakingEl){speakingEl.classList.remove('play'); speakingEl.innerHTML=speakingEl._l||I(IC.vol,13)+' '+t('listen'); speakingEl=null}}
function toast(m){const e=$('#toast'); e.textContent=m; e.classList.add('show'); clearTimeout(e._t); e._t=setTimeout(()=>e.classList.remove('show'),2600)}
const listenBtn=(id)=>`<button class="pill-btn" id="${id}">${I(IC.vol,13)} ${t('listen')}</button>`;

/* ---------- Ask Instructor agent ---------- */
function bubble(text,who='bot',kind=''){const d=document.createElement('div'); d.className=`bub ${who} ${kind}`; d.innerHTML=who==='me'?esc(text):inl(text).replace(/\n/g,'<br>'); if(who==='bot'){const b=document.createElement('button'); b.className='say'; b.innerHTML=I(IC.vol,12); b.onclick=()=>speak(text); d.appendChild(b)} $('#agLog').appendChild(d); $('#agLog').scrollTop=1e6; return d}
function tookieSays(text,kind='',voice=true){bubble(text,'bot',kind); if(!document.body.classList.contains('agent-open')&&!document.body.classList.contains('ws'))$('#agFab')?.classList.add('unread'); if(VC.on){vcSay(text)} else if(voice&&P.voice)speak(text)}
function curStep(){return S.view==='lesson'?visibleSteps(COURSE[S.li])[S.si]:null}
function context(){
  if(S.view==='project'){const pr=P.project||{}; return `The learner is making their own project: "${pr.goal||'not chosen yet'}". ${pr.plan?'Plan parts: '+(pr.plan.parts||[]).map(p=>p.id).join(', ')+'.':''}${S.sim?'\nTheir circuit:\n'+S.sim.describe():''}${$('#code')?'\nTheir code:\n'+$('#code').value:''}`}
  if(S.view==='lab')return `The learner is in the free Circuit Lab.${S.sim?'\nTheir circuit:\n'+S.sim.describe():''}`;
  if(S.view!=='lesson')return `The learner is on the ${S.view} screen.`;
  const les=COURSE[S.li], st=curStep(); let c=`Lesson ${S.li+1} "${les.title.en}", step "${st.title.en}" (${st.type}). Step text: ${st.body.en}`;
  if(S.sim)c+=`\nTheir circuit right now:\n${S.sim.describe()}`;
  if(st.type==='code'){c+=`\nTheir code:\n${$('#code')?$('#code').value:''}`; if(S.runner&&S.runner.err)c+=`\nError: ${S.runner.err}`}
  if(S.lastCheck)c+=`\nLast automatic check said: ${L(S.lastCheck.msg)}`;
  return c;
}
const FAQ=[[/high|low/i,{en:'HIGH means the pin is ON (3.3 V). LOW means OFF (0 V).',bn:'HIGH মানে পিন চালু (3.3 V)। LOW মানে বন্ধ (0 V)।'}],
 [/setup|loop/i,{en:'setup() runs once when the board starts: set pin jobs there. loop() repeats forever: put what keeps happening there.',bn:'setup() বোর্ড চালু হলে একবার চলে: পিনের কাজ ঠিক করো। loop() বারবার চলে: যা চলতে থাকবে তা লেখো।'}],
 [/switch|সুইচ/i,{en:'A switch opens or closes the loop. Closed (ON) = current flows. Open (OFF) = it stops.',bn:'সুইচ লুপ খোলে বা বন্ধ করে। বন্ধ (ON) = কারেন্ট চলে। খোলা (OFF) = থেমে যায়।'}],
 [/led|লেড|leg|পা/i,{en:'The LED’s long leg is + and goes toward the pin (through the resistor). The short leg is − and goes to GND.',bn:'LED এর লম্বা পা +, রেজিস্টর হয়ে পিনের দিকে যায়। ছোট পা −, GND তে যায়।'}],
 [/breadboard|ব্রেড|hole|গর্ত/i,{en:'In a breadboard, the 5 holes of one column (a–e) are connected. The long + and − rails are connected along the edge.',bn:'ব্রেডবোর্ডে এক কলামের ৫টা গর্ত (a–e) ভেতরে জোড়া। কিনারের লম্বা + আর − লাইন পুরোটা জোড়া।'}],
 [/delay/i,{en:'delay(500) makes the ESP32 wait half a second. 1000 = one second.',bn:'delay(500) মানে আধা সেকেন্ড অপেক্ষা। 1000 = এক সেকেন্ড।'}],
 [/battery|ব্যাটারি/i,{en:'The battery’s + is the red lead, − is the black one. Current leaves from + and must come back to −.',bn:'ব্যাটারির + হলো লাল তার, − কালো। কারেন্ট + থেকে বের হয়ে − তে ফিরে আসে।'}],
 [/pwm|speed|analog|গতি/i,{en:'analogWrite(pin, 0–255) sets speed: 0 = stop, 255 = full.',bn:'analogWrite(pin, 0–255) দিয়ে গতি: 0 = থামা, 255 = পুরো গতি।'}]];
async function ask(q){if(!document.body.classList.contains('ws')&&window.openAgent)openAgent();
  q=(q||'').trim(); if(!q)return; bubble(q,'me'); $('#agText').value='';
  const wait=bubble('…','bot'); let a;
  try{a=await askText(`${RULES()}\n\nWhat the learner is doing:\n${context()}\n\nThe learner asks: """${q}"""\nAnswer in at most 4 short sentences. If they ask you to write the code, don't: tell them what to do first and next, and ask a question that helps them think. One line of syntax is OK.`)}
  catch(e){const f=FAQ.find(([re])=>re.test(q)); const k=SYN.find(x=>q.toLowerCase().includes(x.k.toLowerCase())); const st=curStep();
    a=f?L(f[1]):k?`${k.sig} : ${L(k)}`:(st?(BN()?'চলো এই ধাপটা ছোট করে করি: ':'Let’s do this step in small pieces: ')+L(st.body).split('\n')[0]:(BN()?'বলো কী বানাতে চাও, আমি ধাপগুলো সাজিয়ে দেবো।':'Tell me what you want to build and I will plan the steps with you.'))}
  wait.remove(); bubble(a,'bot'); if(VC.on)vcSay(a); else speak(a);
}
let rec=null;
function mic(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR){toast(BN()?'এই ব্রাউজারে ভয়েস ইনপুট নেই, লিখে প্রশ্ন করো':'Voice input is not available here: type your question'); $('#agText').focus(); return}
  if(rec){rec.stop();return} stopSpeak(); rec=new SR(); rec.lang=BN()?'bn-BD':'en-US'; rec.interimResults=true;
  rec.onresult=e=>{const tx=[...e.results].map(r=>r[0].transcript).join(''); $('#agText').value=tx; if(e.results[e.results.length-1].isFinal)ask(tx)};
  rec.onerror=()=>toast(BN()?'শুনতে পাইনি, আবার চেষ্টা করো':'I could not hear you, try again'); rec.onend=()=>{$('#agMic').classList.remove('on');rec=null};
  $('#agMic').classList.add('on'); try{rec.start()}catch(e){$('#agMic').classList.remove('on');rec=null}}
function quick(list){$('#agQuick').innerHTML=(list||[]).map(q=>`<button>${esc(q)}</button>`).join(''); $$('#agQuick button').forEach(b=>b.onclick=()=>ask(b.textContent))}
function dockAgent(slot){const a=$('#agent'); if(slot){slot.appendChild(a); a.classList.add('inset')} else {$('#agentHome').appendChild(a); a.classList.remove('inset')}}

/* ---------- adaptive pace ---------- */
function pace(){const r=Object.entries(P.times).slice(-6).map(([id,s])=>{const st=findStep(id); return st&&st.est?Math.min(3,s/st.est):1});
  const fails=Object.values(P.fails).slice(-4).reduce((a,b)=>a+b,0);
  if(fails>=3)return 'careful'; if(!r.length)return 'steady'; const avg=r.reduce((a,b)=>a+b,0)/r.length; return avg<0.5?'fast':avg>1.6?'careful':'steady'}
function findStep(id){for(const l of COURSE)for(const s of l.steps)if(s.id===id)return s}
function visibleSteps(les){const p=pace(); return les.steps.filter(s=>P.done[s.id]||(s.extra?p==='careful':s.basic?p!=='fast':true))}
const paceName=p=>({fast:BN()?'দ্রুত':'Fast',steady:BN()?'স্থির':'Steady',careful:BN()?'যত্নে':'Careful'})[p];
function renderPace(){const p=pace(); const c=$('#paceChip'); c.className='pace '+p; $('#paceTxt').textContent=paceName(p)}
function markDone(st){if(!P.done[st.id]){const s=Math.round((Date.now()-S.stepStart)/1000); P.times[st.id]=Math.min(s,(st.est||60)*3); P.done[st.id]=true;
  if(st.type==='sim')P.checks.sim++; if(st.type==='code')P.checks.code++; if((st.type==='photo'||st.type==='video')&&P.media[st.id]&&P.media[st.id].ok)P.checks.real++; logAct('steps'); logAct('secs',P.times[st.id]); save(); renderPace(); renderNav();
  const les=COURSE[S.li]; const n=visibleSteps(les).length; if(S.lastCount&&n!==S.lastCount){tookieSays(n>S.lastCount?(BN()?`তোমার জন্য ${n-S.lastCount}টা ছোট ধাপ যোগ করলাম, যাতে সহজ হয়।`:`I added ${n-S.lastCount} smaller step${n-S.lastCount>1?'s':''} to make this easier for you.`):(BN()?`তুমি দ্রুত শিখছ! ${S.lastCount-n}টা ধাপ বাদ দিলাম।`:`You are fast! I skipped ${S.lastCount-n} step${S.lastCount-n>1?'s':''} you don’t need.`),'ok',false)}
  S.lastCount=n}
  updateNav()}
function fail(st){P.fails[st.id]=(P.fails[st.id]||0)+1; save(); renderPace(); const n=P.fails[st.id];
  if(n===2)tookieSays(BN()?'কোনো সমস্যা নেই! চলো ছোট ছোট করে করি। আটকে গেলে আমাকে জিজ্ঞেস করো।':'No problem! Let’s go in smaller steps. Ask me anything you are unsure about.','warn')}

/* ---------- design helpers (bento) ---------- */
const GR={blue:['#b9a6ff','#2e43ff','#6d7dff','#05082a'],graph:['#9a9aa8','#3a3a44','#55555f','#060608'],pink:['#ffb3d6','#ff2a85','#ff6aa8','#3a031c'],copper:['#f6bf96','#c2683a','#dc8a5c','#1d0b05'],green:['#a6e8c8','#36956f','#58b58c','#061d15'],lime:['#f4ffb8','#a3c400','#c9e03a','#121700'],violet:['#d9c2ff','#6b3df5','#8f6bff','#12052e']};
const bg=k=>{const [a,b,c,d]=GR[k]; return `<div class="g" style="background:radial-gradient(90% 55% at 100% 0%,${b}38,transparent 70%),radial-gradient(70% 45% at 0% 100%,${c}26,transparent 70%),linear-gradient(180deg,#0e0f12,#08090b)"></div><div class="core tone" style="background:${b}"></div><div class="edge" style="background:linear-gradient(90deg,transparent,${a}aa,transparent)"></div>`};
const LCOL=['blue','graph','copper','pink','green','violet'];
const ticks=(f,n=40,h=12,col='#E8FF1F')=>{let s=`<svg class="tickbar" viewBox="0 0 ${n*6} ${h}" preserveAspectRatio="none" height="${h}">`; for(let i=0;i<n;i++){const on=i/(n-1)<=f&&f>0; s+=`<line x1="${i*6+1}" x2="${i*6+1}" y1="${i%8===0?0:4}" y2="${h}" stroke="${on?col:'rgba(255,255,255,.28)'}" stroke-width="1.6" stroke-linecap="round"/>`} return s+'</svg>'};
const DOT={'0':['01110','10001','10011','10101','11001','10001','01110'],'1':['00100','01100','00100','00100','00100','00100','01110'],'2':['01110','10001','00001','00010','00100','01000','11111'],'3':['11111','00010','00100','00010','00001','10001','01110'],'4':['00010','00110','01010','10010','11111','00010','00010'],'5':['11111','10000','11110','00001','00001','10001','01110'],'6':['00110','01000','10000','11110','10001','10001','01110'],'7':['11111','00001','00010','00100','01000','01000','01000'],'8':['01110','10001','10001','01110','10001','10001','01110'],'9':['01110','10001','10001','01111','00001','00010','01100'],'/':['00001','00010','00010','00100','01000','01000','10000'],'%':['11001','11010','00010','00100','01000','01011','10011'],' ':['00','00','00','00','00','00','00']};
function dotNum(str,pitch=7,col='#fff'){let x=0,cells='';for(const ch of str){const g=DOT[ch]||DOT[' '];const w=g[0].length;for(let r=0;r<7;r++)for(let k=0;k<w;k++){const on=g[r][k]==='1'; cells+=`<circle cx="${(x+k)*pitch+pitch/2}" cy="${r*pitch+pitch/2}" r="${pitch*.36}" fill="${col}" opacity="${on?1:.08}"/>`} x+=w+1}
  const W=(x-1)*pitch; return `<svg class="dots" width="${W}" height="${7*pitch}" viewBox="0 0 ${W} ${7*pitch}">${cells}</svg>`}
function gauge(fr,cols){const n=56; let s='';
  for(let i=0;i<=n;i++){const f=i/n,a=180+f*180; let c='rgba(255,255,255,.18)'; let acc=0; for(const [w,col] of cols){acc+=w; if(f<=acc+1e-9){c=col;break}}
    const r1=136,r2=i%7===0?112:118, p=(r,a)=>[r*Math.cos(a*Math.PI/180),r*Math.sin(a*Math.PI/180)]; const [x1,y1]=p(r1,a),[x2,y2]=p(r2,a);
    s+=`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${c}" stroke-width="3.2" stroke-linecap="round" style="opacity:0;animation:tk .4s ${i*12}ms forwards"/>`}
  return s}
function partThumb(id,size=56){const L0=LIB[id]; if(!L0)return ''; const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.setAttribute('viewBox',`-14 -16 ${L0.w+30} ${L0.h+34}`); svg.setAttribute('width',size); svg.setAttribute('height',size);
  const g=window.TookieSim.el('g',{},svg); const c={type:id,on:true,pal:true}; if(L0.draw)L0.draw(c,g); else window.TookieSim.drawBody(c,g); return svg.outerHTML}

/* ---------- shell: sidebar nav + ⌘K ---------- */
function lessonProgress(les){const n=les.steps.filter(s=>!s.extra).length; const d=les.steps.filter(s=>!s.extra&&P.done[s.id]).length; return {d,n,pct:Math.round(d/n*100),done:les.steps.filter(s=>s.type==='done').every(s=>P.done[s.id])}}
function unlocked(i){return i===0||lessonProgress(COURSE[i-1]).done||Object.keys(P.done).some(id=>COURSE[i].steps.some(s=>s.id===id))||P.unlockAll}
function curLesson(){for(let i=0;i<COURSE.length;i++)if(!lessonProgress(COURSE[i]).done)return i; return COURSE.length-1}
let lessonsOpen=true;
function renderNav(){
  const bn=BN(); const item=(id,icon,title,extra='',active=false)=>`<div class="ni ${active?'on':''}" data-go="${id}">${I(icon)}<span>${title}</span>${extra}</div>`;
  const cl=curLesson();
  $('#nav').innerHTML=`<div class="ng">${item('search',IC.search,bn?'খুঁজুন':'Search','<kbd>⌘K</kbd>')}${item('home',IC.home,t('home'),'',S.view==='home')}</div>
   <div class="ng"><span class="nh">${bn?'শেখো':'Learn'}</span>
    <div class="ni ${S.view==='lesson'?'on':''}" data-go="lessons">${I(IC.book)}<span>${bn?'লেসন':'Lessons'}</span><span class="badge">${COURSE.filter(l=>lessonProgress(l).done).length}/6</span>${I(IC.chev,14).replace('<svg','<svg class="chev '+(lessonsOpen?'open':'')+'"')}</div>
    <div class="sub ${lessonsOpen?'open':''}"><div>${COURSE.map((l,i)=>{const p=lessonProgress(l),lock=!unlocked(i); return `<div class="ni child ${S.view==='lesson'&&S.li===i?'on':''} ${lock?'locked':''}" data-go="L${i}"><i class="dot ${p.done?'done':i===cl?'cur':''}"></i><span>${esc(L(l.title))}</span><span class="mono dim">${p.done?'✓':p.d+'/'+p.n}</span></div>`}).join('')}</div></div></div>
   <div class="ng"><span class="nh">${bn?'বানাও':'Build'}</span>${item('projects',IC.spark,bn?'প্রজেক্ট':'Projects',`<span class="badge">${PROJ.LIST.filter(p=>projDone(p.id)).length}/${PROJ.LIST.length}</span>`,S.view==='projects'||(S.view==='project'&&P.project&&P.project.cat))}${item('lab',IC.cpu,'Circuit Lab','',S.view==='lab')}${item('project',IC.plus,bn?'নিজের আইডিয়া':'Your own idea','',S.view==='project'&&!(P.project&&P.project.cat))}${item('library',IC.box,bn?'পার্টস লাইব্রেরি':'Part library',`<span class="badge">${PARTS.length}</span>`,S.view==='library')}</div>
   <div class="ng"><span class="nh">${bn?'কোড':'Code'}</span>${item('dict',IC.code,bn?'কোড ডিকশনারি':'Code dictionary',`<span class="badge">${SYN.length}</span>`,S.view==='dict')}</div>`;
  $$('#nav [data-go]').forEach(n=>n.onclick=()=>{const g=n.dataset.go;
    if(g==='search')return openK(); if(g==='project'&&P.project&&P.project.cat){P.projects={...(P.projects||{}),[P.project.cat]:P.project}; P.project=P.customProj||{}; save()} if(g==='lessons'){lessonsOpen=!lessonsOpen; return renderNav()}
    if(g[0]==='L'){const i=+g.slice(1); if(!unlocked(i))return toast(bn?'আগের লেসন শেষ করো':'Finish the previous lesson first'); return go('lesson',i)}
    go(g)});
}
function openK(){const k=$('#kpal'); k.classList.remove('hidden'); const inp=$('#kq'); inp.value=''; drawK(''); setTimeout(()=>inp.focus(),20)}
function closeK(){$('#kpal').classList.add('hidden')}
let kSel=0, kItems=[];
function drawK(q){const ql=q.toLowerCase(); const bn=BN(); const R=[];
  COURSE.forEach((l,li)=>{if(!ql||L(l.title).toLowerCase().includes(ql))R.push({g:bn?'লেসন':'Lessons',t:L(l.title),s:L(l.sub),go:()=>go('lesson',li)}); l.steps.forEach(st=>{if(ql&&L(st.title).toLowerCase().includes(ql))R.push({g:bn?'ধাপ':'Steps',t:L(st.title),s:`${t('lesson')} ${li+1}`,go:()=>{const vs=visibleSteps(l); const i=vs.indexOf(st); go('lesson',li,i<0?0:i)}})})});
  PARTS.forEach(id=>{const p=LIB[id]; if(ql&&(p.name+' '+(p.tags||'')+' '+(p.desc||'')).toLowerCase().includes(ql))R.push({g:bn?'পার্টস':'Parts',t:p.name,s:p.cat,ic:partThumb(id,28),go:()=>{go('library'); setTimeout(()=>{const i=$('#libq'); if(i){i.value=p.name; i.dispatchEvent(new Event('input'))}},30)}})});
  PROJ.LIST.forEach(p=>{if(!ql||(L(p.title)+' '+p.cat+' '+L(p.tag)).toLowerCase().includes(ql))R.push({g:bn?'প্রজেক্ট':'Projects',t:L(p.title),s:L(p.tag),ic:partThumb(p.hero,28),go:()=>openProject(p.id)})});
  SYN.forEach(e=>{if(ql&&(e.k+' '+e.sig+' '+L(e)).toLowerCase().includes(ql))R.push({g:bn?'কোড':'Code',t:e.sig,s:L(e).slice(0,70)+'…',go:()=>{go('dict'); setTimeout(()=>{const i=$('#dictq'); if(i){i.value=e.k; i.dispatchEvent(new Event('input'))}},30)}})});
  [[bn?'প্রজেক্ট':'Projects','projects'],['Circuit Lab','lab'],[bn?'নতুন প্রজেক্ট':'New project','project'],[bn?'পার্টস লাইব্রেরি':'Part library','library'],[bn?'কোড ডিকশনারি':'Code dictionary','dict']].forEach(([n,v])=>{if(!ql||n.toLowerCase().includes(ql))R.push({g:bn?'যাও':'Go to',t:n,go:()=>go(v)})});
  kItems=R.slice(0,40); kSel=0; let last='';
  $('#kres').innerHTML=kItems.length?kItems.map((r,i)=>{const h=r.g!==last?`<div class="kh">${r.g}</div>`:''; last=r.g; return h+`<div class="kr ${i===0?'on':''}" data-i="${i}">${r.ic||''}<div><b>${esc(r.t)}</b>${r.s?`<small>${esc(r.s)}</small>`:''}</div></div>`}).join(''):`<div class="kempty">${I(IC.search,22)}<p>${bn?'কিছু পাওয়া যায়নি':'Nothing found. Try “sonar”, “delay” or “motor”.'}</p></div>`;
  $$('#kres .kr').forEach(r=>{r.onclick=()=>{closeK(); kItems[+r.dataset.i].go()}})}

/* ---------- router ---------- */
function setCrumbs(){const c=$('#crumbs'); const bn=BN(); const map={projects:bn?'প্রজেক্ট':'Projects',home:t('home'),lab:'Circuit Lab',project:(P.project&&P.project.cat)?(bn?'প্রজেক্ট':'Project'):(bn?'নিজের আইডিয়া':'Your own idea'),library:bn?'পার্টস লাইব্রেরি':'Part library',dict:bn?'কোড ডিকশনারি':'Code dictionary'};
  if(S.view==='lesson'){const les=COURSE[S.li]; c.innerHTML=`<span>${t('lesson')} ${S.li+1}</span><span class="sl">/</span><b>${esc(L(les.title))}</b>`} else c.innerHTML=`<span>Botstructor</span><span class="sl">/</span><b>${map[S.view]}</b>`}
function go(view,li,si){stopSpeak(); if(S.sim){S.sim.destroy(); S.sim=null} if(S.runner){S.runner.stop(); S.runner=null}
  dockAgent(null);
  S.view=view; if(view==='lesson'){S.li=li; const vs=visibleSteps(COURSE[li]); S.si=si??Math.max(0,vs.findIndex(s=>!P.done[s.id])); if(S.si<0)S.si=0; S.lastCount=vs.length}
  render(); window.scrollTo({top:0})}
function render(){document.body.classList.toggle('lang-bn',BN()); document.body.classList.toggle('side-off',!P.side);
  $$('#langSeg button').forEach(x=>x.classList.toggle('on',x.dataset.l===P.lang)); $('#voiceTgl').classList.toggle('on',P.voice);
  $('#agSub').textContent=S.sample?(BN()?'অনলাইন · কথা শুনি আর ছবি দেখি':'Online · hears you and sees photos'):(BN()?'অফলাইন মোড · তবুও সাহায্য করবো':'Offline mode · built-in help');
  setCrumbs(); renderPace(); renderNav(); document.body.classList.remove('ws','side-on'); document.body.classList.toggle('focus',S.view==='lesson');
  ({projects:renderProjects,home:renderHome,lesson:renderLesson,lab:renderLab,project:renderProject,library:renderLibrary,dict:renderDict})[S.view]();
  const ap=$('#app'); ap.classList.remove('in'); void ap.offsetWidth; requestAnimationFrame(()=>ap.classList.add('in'))}


/* ---------- activity log (streak, KPIs) ---------- */
const day=(d=new Date())=>d.toISOString().slice(0,10);
function logAct(k,v=1){P.log=P.log||{}; const d=day(); P.log[d]=P.log[d]||{steps:0,secs:0,checks:0}; P.log[d][k]+=v; save()}
function series(k,n=21){const out=[],lab=[]; for(let i=n-1;i>=0;i--){const d=new Date(Date.now()-i*864e5), key=day(d); const v=((P.log||{})[key]||{})[k]||0; out.push(k==='secs'?Math.round(v/60):v); lab.push(d.toLocaleDateString(BN()?'bn-BD':'en-US',{month:'short',day:'numeric'}))} return {v:out,l:lab}}
function streak(){let s=0; for(let i=0;i<400;i++){const key=day(new Date(Date.now()-i*864e5)); const a=(P.log||{})[key]; if(a&&a.steps>0)s++; else if(i===0)continue; else break} return s}
const sum=a=>a.reduce((x,y)=>x+y,0);

/* ---------- sign in + onboarding ---------- */
function renderAuth(){
  const bn=BN(); document.body.classList.add('auth'); const u=P.user||{}; let step=S.authStep||0;
  const steps=[
   {k:'welcome',html:()=>`<div class="au-hero">${bg('blue')}<div class="in-c"><div class="au-orbit" aria-hidden="true"><i></i><i></i>${['esp32','servo','hcsr04','l298n','pir','tt_motor','relay','soil'].map((id,i)=>`<span style="--i:${i}">${partThumb(id,52)}</span>`).join('')}</div><div class="kick">BOTSTRUCTOR · AI ROBOTICS TUTOR</div><h1>${bn?'যেকোনো রোবট বানাও, AI টিউটরের সাথে':'Build any robot. Your AI tutor shows you how.'}</h1><p>${bn?'তোমার নিজের AI এজেন্টের সাথে রোবটিক্স শেখো।':'Learn robotics with your personalised AI agent.'}</p><div class="au-feats">${(bn?[['১৪','গাইডেড প্রজেক্ট'],['৫২','সিমুলেটেড পার্টস'],['২৯','কোড শব্দ'],['AI','টিউটর, কোড লেখে না']]:[['14','guided projects'],['52','parts to simulate'],['29','code words explained'],['AI','tutor that never writes it for you']]).map(([n,t])=>`<div><b>${n}</b><span>${t}</span></div>`).join('')}</div></div><div class="rim"></div></div>
     <div class="au-form"><h2>${bn?'সাইন ইন':'Sign in'}</h2><p class="muted">${bn?'তোমার প্রোগ্রেস এই ডিভাইসে সেভ থাকবে।':'Your progress is saved on this device.'}</p>
      <label class="fl">${bn?'তোমার নাম':'Your name'}<input id="auName" value="${esc(u.name||'')}" placeholder="${bn?'যেমন: রাফি':'e.g. Rafi'}"></label>
      <label class="fl">${bn?'ইমেইল বা ফোন':'Email or phone'}<input id="auId" value="${esc(u.id||'')}" placeholder="name@email.com / 01XXXXXXXXX"></label>
      <label class="fl">${bn?'কিট কোড (বাক্সের ভেতরে)':'Kit code (inside the box)'}<input id="auKit" value="${esc(u.kit||'')}" placeholder="TK-0000 (${bn?'ঐচ্ছিক':'optional'})"></label>
      <button class="btn-w full" id="auGo">${bn?'চালিয়ে যাও':'Continue'} →</button>
      <div class="sep-or"><span>${bn?'অথবা':'or'}</span></div><button class="btn-o full" id="auGuest">${bn?'অতিথি হিসেবে দেখো':'Try as a guest'}</button>
      <div class="seg mt" id="auLang"><button data-l="en" class="${!bn?'on':''}">English</button><button data-l="bn" class="${bn?'on':''}">বাংলা</button></div></div>`,
    bind:()=>{$('#auGo').onclick=()=>{const n=$('#auName').value.trim(); if(!n){$('#auName').focus(); return toast(bn?'তোমার নাম লেখো':'Please write your name')} P.user={...u,name:n,id:$('#auId').value.trim(),kit:$('#auKit').value.trim()}; save(); next()};
      $('#auGuest').onclick=()=>{P.user={...u,name:bn?'অতিথি':'Guest',guest:true}; save(); next()};
      $$('#auLang button').forEach(b=>b.onclick=()=>{P.lang=b.dataset.l; save(); renderAuth()})}},
   {k:'age',q:bn?'তোমার বয়স কত?':'How old are you?',sub:bn?'ইন্সট্রাক্টর সেই অনুযায়ী সহজ বা বিস্তারিত বলবে।':'Instructor explains things at the right level.',opts:[['8-10','8–10',bn?'খুব সহজ ভাষা':'very simple words'],['11-14','11–14',bn?'সহজ, নতুন শব্দের মানে সহ':'simple, new words explained'],['15-18','15–18',bn?'আরও বিস্তারিত':'more detail'],['18+','18+',bn?'প্রাপ্তবয়স্ক / শিক্ষক':'adult or teacher']],field:'age'},
   {k:'level',q:bn?'রোবটিক্স বা কোড কতটা জানো?':'How much do you know already?',sub:bn?'ঠিক নেই ভুল নেই, শুরু করার জায়গা ঠিক করতে।':'No wrong answer: this sets your starting point.',opts:[['zero',bn?'কিছুই না':'Nothing yet',bn?'একদম শুরু থেকে':'start from zero'],['little',bn?'একটু':'A little',bn?'সার্কিট বা কোড দেখেছি':'seen circuits or code'],['coded',bn?'কোড লিখেছি':'I have coded',bn?'রোবটিক্স নতুন':'robotics is new']],field:'level'},
   {k:'goal',q:bn?'প্রথমে কী বানাতে চাও?':'What do you want to build first?',sub:bn?'পরে যেকোনো সময় বদলাতে পারো।':'You can change this any time.',opts:[['rc',bn?'RC কার':'RC car','Bluetooth / Wi-Fi'],['avoid',bn?'বাধা এড়ানো রোবট':'Obstacle-avoiding robot',bn?'সোনার দিয়ে':'with sonar'],['touch',bn?'টাচে সাড়া দেয় রোবট':'Touch-reactive robot',bn?'ছুঁলে সাড়া দেয়':'reacts when touched'],['own',bn?'নিজের আইডিয়া':'My own idea',bn?'ইন্সট্রাক্টর প্ল্যান করে দেবে':'Instructor will plan it']],field:'goal'},
   {k:'kit',q:bn?'তোমার কাছে রোবট কিট আছে?':'Do you have the robot kit?',sub:bn?'না থাকলেও সিমুলেটরে সব শিখতে পারবে।':'No kit? You can still learn everything in the simulator.',opts:[['yes',bn?'হ্যাঁ, আছে':'Yes, I have it',bn?'বাস্তবে বানাবো':'I will build for real'],['soon',bn?'শীঘ্রই আসবে':'It is on its way',bn?'আগে সিমুলেটর':'simulator first'],['no',bn?'না':'Not yet',bn?'শুধু সিমুলেটর':'simulator only']],field:'kit2'},
   {k:'plan',html:()=>{const u2=P.user; const n={zero:8,little:6,coded:5}[u2.level]||8; const g={rc:bn?'RC কার':'RC car',avoid:bn?'বাধা এড়ানো রোবট':'Obstacle-avoiding robot',touch:bn?'টাচ রোবট':'Touch-reactive robot',own:bn?'তোমার নিজের প্রজেক্ট':'your own project'}[u2.goal]||'RC car';
     return `<div class="au-plan"><div class="kick">${bn?'তোমার প্ল্যান তৈরি':'Your plan is ready'}</div><h1>${bn?`হাই ${esc(u2.name)}! চলো ${g} বানাই।`:`Hi ${esc(u2.name)}! Let’s build ${g==='your own project'?g:'a '+g}.`}</h1>
      <div class="au-grid">${[[bn?'শুরু':'Start',bn?'লেসন ১: মোটর ঘোরাও':'Lesson 1: make a motor spin'],[bn?'গতি':'Pace',u2.level==='coded'?(bn?'দ্রুত: সহজ কার্ড বাদ':'Fast: basic cards skipped'):u2.level==='zero'?(bn?'ধীরে, ছোট ধাপে':'Gentle, small steps'):(bn?'স্বাভাবিক':'Steady')],[bn?'ভাষা':'Language',bn?'বাংলা + ভয়েস':'English + voice'],[bn?'কিট':'Kit',u2.kit2==='yes'?(bn?'বাস্তবে বানাবে, ছবি যাচাই':'Build for real, photo checks'):(bn?'আগে সিমুলেটর':'Simulator first')]].map(([k,v])=>`<div class="au-c"><span class="cap">${k}</span><b>${v}</b></div>`).join('')}</div>
      <p class="muted" style="max-width:520px">${bn?'ইন্সট্রাক্টর কখনো পুরো কোড লিখে দেবে না। সে তোমাকে ধাপ, সিনট্যাক্স আর প্রশ্ন দেবে, যাতে তুমি নিজে ভাবো।':'Instructor will never write your whole code. It gives you steps, syntax and questions so you do the thinking.'}</p>
      <button class="btn-w" id="auDone">${bn?'ড্যাশবোর্ডে যাও':'Go to my dashboard'} →</button></div>`},
    bind:()=>{$('#auDone').onclick=()=>{P.user.onboarded=true; if(P.user.level==='coded')P.times={...P.times}; P.voice=P.user.age==='8-10'; save(); document.body.classList.remove('auth'); S.authStep=0; go('home'); tookieSays(BN()?`স্বাগতম, ${P.user.name}! আমি তোমার AI ইন্সট্রাক্টর। যেকোনো সময় এখানে প্রশ্ন করো।`:`Welcome, ${P.user.name}! I’m your AI instructor. Ask me anything here, any time.`,'ok')}}}];
  function next(){S.authStep=step+1; renderAuth()}
  const st=steps[step];
  const prog=`<div class="au-prog">${steps.map((_,i)=>`<i class="${i<=step?'on':''}"></i>`).join('')}</div>`;
  let body;
  if(st.html)body=st.html();
  else body=`<div class="au-q"><button class="ghost-btn" id="auBack">← ${t('back')}</button><h1>${st.q}</h1><p class="muted">${st.sub}</p><div class="au-opts">${st.opts.map(([v,a,b])=>`<button class="au-o ${(P.user||{})[st.field]===v?'on':''}" data-v="${v}"><b>${a}</b><span>${b}</span></button>`).join('')}</div></div>`;
  $('#auth').innerHTML=`<div class="au-top"><div class="brand2"><span class="logo bmark">B</span><b>Botstructor</b></div>${step?prog:''}</div><div class="au-body au-${st.k}">${body}</div>`;
  if(st.bind)st.bind();
  if(st.opts){$$('.au-o').forEach(b=>b.onclick=()=>{P.user[st.field]=b.dataset.v; save(); next()}); $('#auBack').onclick=()=>{S.authStep=step-1; renderAuth()}}
}
function logout(){if(!confirm(BN()?'লগ আউট করবে? এই ডিভাইসের প্রোগ্রেস থাকবে।':'Log out? Progress stays on this device.'))return; P.user={...P.user,onboarded:false}; save(); S.authStep=0; renderAuth()}
function loadDemo(){const ids=COURSE.slice(0,3).flatMap(l=>l.steps).slice(0,17).map(s=>s.id); ids.forEach(id=>{P.done[id]=true; P.times[id]=(findStep(id).est||60)*(.6+Math.random()*.6)});
  P.log={}; for(let i=20;i>=0;i--){if(Math.random()<.22&&i>2)continue; const d=day(new Date(Date.now()-i*864e5)); P.log[d]={steps:1+Math.round(Math.random()*5+(20-i)/6),secs:Math.round((8+Math.random()*30)*60),checks:Math.round(Math.random()*3)}}
  P.checks={sim:3,code:2,real:1}; P.quizScore=0.75; P.demo=true; save(); render(); toast(BN()?'ডেমো ডেটা লোড হয়েছে':'Demo learner loaded')}

/* ---------- HOME ---------- */
function spark(v,w=80,h=28){const mx=Math.max(1,...v); const pts=v.map((y,i)=>[i/(v.length-1)*(w-4)+2,h-3-y/mx*(h-6)]); return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="M${pts.map(p=>p.join(' ')).join(' L')}" fill="none" stroke="#E8FF1F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
function kpi(label,value,delta,period,trend,ic){const up=delta>=0; return `<div class="kc"><div class="kc-h"><span>${label}</span>${ic?`<i>${I(ic,14)}</i>`:''}</div><div class="kc-v"><b>${value}</b>${trend?spark(trend):''}</div>${delta!=null?`<div class="kc-d"><span class="${up?'good':'bad'}">${up?'↗':'↘'} ${Math.abs(delta)}%</span> <span class="muted">${period}</span></div>`:`<div class="kc-d muted">${period||'&nbsp;'}</div>`}</div>`}
function streakCard(){
  const bn=BN(); const M=[{k:'steps',label:bn?'ধাপ':'Steps',fmt:v=>Math.round(v)},{k:'secs',label:bn?'মিনিট':'Minutes',fmt:v=>Math.round(v)},{k:'checks',label:bn?'যাচাই':'Checks',fmt:v=>Math.round(v)}];
  const html=`<div class="cct" id="cct"><div class="cct-head"><div><div class="cct-title">${I(IC.spark,16)} ${bn?'শেখার ধারাবাহিকতা':'Learning streak'}</div><div class="cct-cap">${bn?'গত ২১ দিন':'Last 21 days'} · <b>${streak()} ${bn?'দিন টানা':'day streak'}</b> 🔥</div></div><span class="cct-badge" id="cctBadge"></span></div>
    <div class="cct-chart"><div class="cct-y" id="cctY"></div><div class="cct-plot" id="cctPlot"></div><div class="cct-x" id="cctX"></div></div>
    <div class="cct-tabs" style="--n:${M.length}"><span class="cct-ind"></span>${M.map((m,i)=>{const s=series(m.k); const a=sum(s.v.slice(-7)), b=sum(s.v.slice(-14,-7)); const d=b?Math.round((a-b)/b*100):a?100:0; return `<button class="cct-tab" data-i="${i}" aria-selected="${i===0}"><div class="cct-tl"><span class="cct-ic">${I(['<path d="M4 18l5-6 4 3 7-9"/>','<path d="M12 8v5l3 2"/><circle cx="12" cy="12" r="9"/>','<path d="M20 6 9 17l-5-5"/>'][i],13)}</span>${m.label}</div><div class="cct-tv">${a}</div><div class="cct-td"><span class="${d>=0?'good':'bad'}">${d>=0?'+':''}${d}%</span> ${bn?'আগের সপ্তাহের তুলনায়':'vs last week'}</div></button>`}).join('')}</div></div>`;
  return {html,mount:()=>{let k=0; const rows=10;
    const draw=()=>{const m=M[k], s=series(m.k), v=s.v; const mx=Math.max(1,...v); const top=[1,2,4,5,6,8,10,12,15,20,25,30,40,50,60,80,100,120,150,200].find(x=>x>=mx)||mx;
      $('#cctBadge').textContent=m.label; $('#cctY').innerHTML=[1,.75,.5,.25].map(f=>`<span style="top:${(1-f)*100}%">${m.fmt(top*f)}</span>`).join('');
      $('#cctPlot').innerHTML=[.25,.5,.75,1].map(f=>`<span class="cct-grid" style="top:${(1-f)*100}%"></span>`).join('')+v.map((x,c)=>{const lv=x<=0?0:Math.min(rows,Math.max(1,Math.round(x/top*rows))); return `<div class="cct-col" data-c="${c}">${Array.from({length:rows},(_,r)=>`<span class="cct-cell ${r<lv?'on':''} ${r===lv-1&&lv<rows?'cap1':''}" style="--c:${c};--r:${r};--flip:${k%2?'cct-b':'cct-a'}"></span>`).join('')}</div>`}).join('')+`<span class="cct-line"></span><div class="cct-tip"><div class="d"></div><div class="v"><i></i><b></b></div></div>`;
      $('#cctX').innerHTML=[0,7,14,20].map(i=>`<span style="left:${(i+.5)/v.length*100}%">${s.l[i]}</span>`).join('');
      const plot=$('#cctPlot'), root=$('#cct');
      $$('#cctPlot .cct-col').forEach(col=>col.onpointerenter=()=>{const c=+col.dataset.c; $$('#cctPlot .cct-col').forEach(x=>x.classList.toggle('act',x===col)); root.classList.add('hot'); const pct=(c+.5)/v.length*100; const lv=Math.round(Math.min(1,v[c]/top)*100);
        plot.querySelector('.cct-line').style.left=pct+'%'; const tip=plot.querySelector('.cct-tip'); tip.style.left=pct+'%'; tip.style.top=`clamp(26px,${100-lv}%,calc(100% - 26px))`; tip.classList.toggle('flip',pct>66); tip.querySelector('.d').textContent=s.l[c]; tip.querySelector('b').textContent=m.fmt(v[c])+' '+m.label.toLowerCase()});
      plot.onpointerleave=()=>{root.classList.remove('hot'); $$('#cctPlot .cct-col').forEach(x=>x.classList.remove('act'))};
      $('.cct-tabs').style.setProperty('--k',k); $$('.cct-tab').forEach((b,i)=>b.setAttribute('aria-selected',i===k))};
    $$('.cct-tab').forEach(b=>b.onclick=()=>{k=+b.dataset.i; draw()}); draw()}};
}
function orbitRings(rings){
  const R=93, LAP=2*Math.PI*R;
  const html=`<ul class="ors">${rings.map((g,i)=>{const p=Math.max(0,Math.min(1,g.value/(g.max||100))); const words=(g.orbit||g.label).toUpperCase(); const reps=Math.max(1,Math.round(LAP/((words.length+3)*5.4))); const lap=Array.from({length:reps},()=>words+' · ').join('');
    const reel=String(g.value).split('').map(c=>/\d/.test(c)?`<span class="reel" style="--d:${c}"><span class="strip">${'0123456789'.split('').map(d=>`<span>${d}</span>`).join('')}</span></span>`:`<span>${c}</span>`).join('');
    return `<li class="ors-i" style="--v:${p};--i:${i};--c1:${g.c1};--c2:${g.c2}"><div class="ors-dial"><svg class="ors-orbit" viewBox="0 0 200 200"><defs><path id="orb${i}" d="M100 ${100-R} a${R} ${R} 0 1 1 0 ${2*R} a${R} ${R} 0 1 1 0 ${-2*R}"/></defs><g class="ors-spin" data-i="${i}"><text><textPath href="#orb${i}" textLength="${LAP-1}" lengthAdjust="spacing">${esc(lap)}</textPath></text></g></svg>
      <span class="ors-track"></span><span class="ors-arcw"><span class="ors-arc"></span></span><span class="ors-face"><span class="num">${reel}<small>${g.unit||''}</small></span></span></div><p class="ors-l">${esc(g.label)}</p><p class="ors-n">${esc(g.note||'')}</p></li>`}).join('')}</ul>`;
  return {html,mount:(host)=>{requestAnimationFrame(()=>requestAnimationFrame(()=>host.classList.add('on')));
    const spins=[...host.querySelectorAll('.ors-spin')], ang=spins.map((_,i)=>i*47), vel=spins.map(()=>7); let hot=-1,last=0;
    host.querySelectorAll('.ors-i').forEach((li,i)=>{li.onpointerenter=()=>hot=i; li.onpointerleave=()=>hot=-1});
    const tick=tt=>{if(!host.isConnected)return; const dt=last?Math.min(.05,(tt-last)/1000):0; last=tt; spins.forEach((g,i)=>{vel[i]+=((hot===i?.8:7)-vel[i])*Math.min(1,dt*4); ang[i]=(ang[i]+vel[i]*dt)%360; g.setAttribute('transform',`rotate(${ang[i].toFixed(2)} 100 100)`)}); requestAnimationFrame(tick)}; requestAnimationFrame(tick)}};
}
function renderHome(){
  const bn=BN(); const cl=curLesson(); const total=COURSE.reduce((a,l)=>a+l.steps.filter(s=>!s.extra).length,0); const doneSteps=COURSE.reduce((a,l)=>a+lessonProgress(l).d,0);
  const pct=Math.round(doneSteps/total*100); const p=pace(); const les=COURSE[cl]; const vs=visibleSteps(les); const nextSt=vs.find(s=>!P.done[s.id])||vs[0];
  const doneL=COURSE.filter(l=>lessonProgress(l).done).length; const u=P.user||{};
  const st=series('steps',14), mi=series('secs',14), ch=series('checks',14);
  const dd=(s)=>{const a=sum(s.v.slice(-7)), b=sum(s.v.slice(-14,-7)); return b?Math.round((a-b)/b*100):(a?100:0)};
  const tried=COURSE.flatMap(l=>l.steps).filter(s=>['sim','code'].includes(s.type)&&(P.done[s.id]||P.fails[s.id]));
  const first=tried.length?Math.round(tried.filter(s=>P.done[s.id]&&!P.fails[s.id]).length/tried.length*100):0;
  const media=Object.values(P.media||{}); const real=media.length?Math.round(media.filter(m=>m.ok).length/media.length*100):0;
  const quiz=Math.round((P.quizScore||0)*100);
  const SC=streakCard(), OR=orbitRings([
    {label:bn?'কোর্স শেষ':'Course complete',value:pct,unit:'%',note:`${doneSteps} / ${total} ${bn?'ধাপ':'steps'}`,orbit:bn?'Course progress · goal 100%':'Course progress · goal 100%',c1:'#E8FF1F',c2:'#7CFFB2'},
    {label:bn?'প্রথম চেষ্টায় ঠিক':'Right first try',value:first,unit:'%',note:bn?'সার্কিট আর কোড':'circuits and code',orbit:'First-try checks · goal 70%',c1:'#A9B2FF',c2:'#2e43ff'},
    {label:bn?'কুইজ স্কোর':'Quiz score',value:quiz,unit:'%',note:bn?'ESP32 পিন':'ESP32 pins',orbit:'Adaptive quiz · goal 75%',c1:'#FFB37A',c2:'#ff2a85'},
    {label:bn?'বাস্তবে যাচাই':'Real builds verified',value:real,unit:'%',note:`${media.filter(m=>m.ok).length} ${bn?'ছবি/ভিডিও':'photos / videos'}`,orbit:'AI verified builds · goal 100%',c1:'#7CFFB2',c2:'#36956f'}]);
  $('#app').className='page in'; $('#app').innerHTML=`
  <div class="ph"><div><div class="ph-k">${new Date().toLocaleDateString(bn?'bn-BD':'en-US',{weekday:'long',month:'long',day:'numeric'})}</div><h1>${bn?`হাই ${esc(u.name||'')} 👋`:`Hi ${esc(u.name||'there')} 👋`}</h1><p class="muted">${bn?'আজ একটা ছোট ধাপ এগিয়ে যাই।':'Let’s take one small step today.'}</p></div><div class="row" style="gap:8px">${P.demo?'<span class="chip ghost">Demo data</span>':''}<button class="btn-o" id="goLab">${I(IC.cpu,15)} Circuit Lab</button><button class="btn-w" id="goCont">${doneSteps?(bn?'চালিয়ে যাও':'Continue learning'):(bn?'শুরু করো':'Start lesson 1')} →</button></div></div>
  <div class="bento">
   <section class="card h1" id="hero">${bg('blue')}<div class="in-c hero-grid"><div class="hl">
     <div class="row sb"><div class="ttl">${bn?'আজ আমরা একটা রোবট বানাবো':'Today we build a robot'}</div><span class="chip">${t('lesson')} ${cl+1}</span></div>
     <div class="row" style="margin-top:18px;align-items:flex-end;gap:18px">${dotNum(String(doneSteps).padStart(2,'0')+'/'+total,7)}<div style="padding-bottom:4px"><div class="delta">${pct}% ${bn?'শেষ':'done'}</div><div class="muted">${bn?'ধাপ শেষ হয়েছে':'steps completed'}</div></div></div>
     <div class="nextbox" id="knext"><span class="cap">${bn?'পরের ধাপ':'Next up'}</span><b>${esc(L(nextSt.title))}</b><span class="muted">${esc(L(les.title))} · ${lessonProgress(les).d}/${lessonProgress(les).n}</span></div>
     <div class="hsteps">${(bn?['বানাও','সিমুলেট','কোড','বাস্তবে']:['Build','Simulate','Code','Make it real']).map((x,i)=>`<span><b>0${i+1}</b>${x}</span>`).join('<em></em>')}</div></div>
     <div class="orb" aria-hidden="true"><i class="o1"></i><i class="o2"></i><i class="o3"></i>${['esp32','hcsr04','servo','tt_motor'].map((id,i)=>`<span class="ot ot${i}">${partThumb(id,46)}</span>`).join('')}</div>
     </div><div class="rim"></div></section>
   <section class="card h1" id="prog">${bg('graph')}<div class="in-c">
     <div class="row sb"><div class="ttl">${bn?'কোর্সের অগ্রগতি':'Course progress'}</div><span class="chip ghost">${doneL}/6 ${bn?'লেসন':'lessons'}</span></div>
     <svg class="gauge" width="300" height="168" viewBox="-150 -150 300 168"><style>@keyframes tk{to{opacity:1}}</style>${gauge(doneSteps/total,[[doneSteps/total,'#E8FF1F']])}<text y="-22" text-anchor="middle" font-weight="200" font-size="52" fill="#fff" letter-spacing="-2">${pct}<tspan font-size="17" dy="-24" fill="rgba(255,255,255,.56)">%</tspan></text><text y="0" text-anchor="middle" font-size="12" font-weight="500" fill="rgba(255,255,255,.38)">${bn?'শেষ':'complete'}</text></svg>
     <div class="rows">${[[bn?'শেষ লেসন':'Lessons done',doneL+' / 6','#E8FF1F'],[bn?'তোমার গতি':'Your pace',paceName(p),'#fff'],[bn?'বাকি ধাপ':'Steps left',String(total-doneSteps),'rgba(255,255,255,.35)']].map(([k,v,c],i)=>`<div class="r ${i?'bt':''}"><i style="background:${c}"></i><span>${k}</span><b class="mono">${v}</b></div>`).join('')}</div></div><div class="rim"></div></section>
   <div class="kgrid">${kpi(bn?'এই সপ্তাহে ধাপ':'Steps this week',sum(st.v.slice(-7)),dd(st),bn?'আগের সপ্তাহ':'vs last week',st.v,IC.book)}${kpi(bn?'শেখার সময়':'Minutes learning',sum(mi.v.slice(-7)),dd(mi),bn?'আগের সপ্তাহ':'vs last week',mi.v,IC.spark)}${kpi(bn?'যাচাই পাস':'Checks passed',P.checks.sim+P.checks.code+P.checks.real,null,bn?'সার্কিট, কোড, বাস্তব':'circuits · code · real builds',ch.v,IC.check)}${kpi(bn?'টানা দিন':'Day streak',streak()+' 🔥',null,bn?'প্রতিদিন একটু শেখো':'learn a little every day',null,IC.bulb)}</div>
   <section class="scard span8">${SC.html}</section>
   <section class="card h3x" id="lessons">${bg('pink')}<div class="in-c"><div class="row sb"><div><div class="ttl">${bn?'তোমার পথ':'Your path'}</div><div class="muted" style="margin-top:4px">${bn?'একটা মোটর থেকে ফোন-চালিত গাড়ি':'From one motor to a phone-driven car'}</div></div><span class="chip">6</span></div>
     <div class="llist">${COURSE.map((l,i)=>{const pr=lessonProgress(l), lock=!unlocked(i); return `<div class="lr ${lock?'locked':''}" data-i="${i}"><span class="mono n">0${i+1}</span><div class="lt"><b>${esc(L(l.title))}</b>${ticks(pr.pct/100,40,8,'#fff')}</div><span class="mono st">${pr.done?'✓':lock?I(IC.lock,13):pr.d+'/'+pr.n}</span></div>`}).join('')}</div></div><div class="rim"></div></section>
   <section class="scard span12"><div class="sc-h"><div><div class="sc-t">${bn?'তোমার রিপোর্ট':'Your report'}</div><div class="muted">${bn?'ইন্সট্রাক্টর তোমার কাজ থেকে হিসাব করে':'Instructor works these out from what you did'}</div></div><span class="cct-badge">${bn?'এই পর্যন্ত':'All time'}</span></div><div id="orbHost">${OR.html}</div></section>
   <section class="scard span12"><div class="sc-h"><div><div class="sc-t">${bn?'আসল প্রজেক্ট বানাও':'Build real projects'}</div><div class="muted">${bn?'মোটর থেকে ব্লুটুথ গাড়ি: প্রতিটায় ধাপ, ফ্লোচার্ট আর অটো-চেক':'From a motor to a Bluetooth car: steps, a flowchart and an auto-check in each'}</div></div><button class="btn-o sm" id="goProjs">${bn?'সব':'All'} ${PROJ.LIST.length} →</button></div><div class="pstrip">${PROJ.LIST.slice(0,8).map(projCard).join('')}</div></section>
   <section class="card h3" id="parts">${bg('copper')}<div class="in-c"><div class="row sb"><div class="ttl">${bn?'পার্টস লাইব্রেরি':'Part library'}</div><span class="muted">${bn?'নিজের আঁকা':'illustrated'}</span></div>
     <div class="row" style="margin-top:12px;align-items:flex-end;justify-content:space-between"><span class="big">${PARTS.length}</span><span style="padding-bottom:6px"><span class="delta" style="color:#fff">${PARTS.filter(k=>LIB[k].sim==='full').length}</span><span class="muted"> ${bn?'সিমুলেটেড':'simulated'}</span></span></div>
     <div class="pgrid">${['esp32','hcsr04','servo','l298n','tt_motor','ir_obstacle','relay','rgb_led','pir','joystick'].map(id=>`<div title="${esc(LIB[id].name)}">${partThumb(id,44)}</div>`).join('')}</div>
     <button class="btn-w sm cta" id="goLib">${bn?'সব পার্টস দেখো':'Browse all parts'} →</button></div><div class="rim"></div></section>
   <section class="card h3" id="proj">${bg('green')}<div class="in-c"><div class="ttl">${bn?'নতুন প্রজেক্ট':'New project'}</div><div class="muted" style="margin-top:6px">${bn?'কী বানাতে চাও বলো। ইন্সট্রাক্টর পার্টস আর ফ্লো সাজাবে, কোড তুমি লিখবে।':'Tell Instructor what to build. It plans the parts and the flow; you write the code.'}</div>
     <textarea id="pgoal" rows="3" placeholder="${bn?'যেমন: দেয়াল দেখলে থেমে যায় এমন গাড়ি':'e.g. a car that stops before a wall'}"></textarea>
     <button class="btn-w sm cta" id="goProj">${I(IC.spark,14)} ${bn?'প্ল্যান বানাও':'Plan it with Instructor'}</button></div><div class="rim"></div></section>
   <section class="card h3 glass" id="dictc"><div class="in-c"><div class="row sb"><div class="ttl">${bn?'কোড ডিকশনারি':'Code dictionary'}</div><span class="muted">${SYN.length}</span></div>
     <div class="synmini">${['pinMode','digitalWrite','delay','if','analogWrite','Serial.println'].map(k=>`<div><code>${esc(SYNBY[k].sig)}</code><span>${esc(L(SYNBY[k]).split('.')[0])}.</span></div>`).join('')}</div>
     <button class="btn-o sm cta" id="goDict">${bn?'সব শব্দ দেখো':'Open dictionary'} →</button></div></section>
  </div>`;
  SC.mount(); OR.mount($('#orbHost'));
  $('#goCont').onclick=()=>go('lesson',cl); $('#goProjs').onclick=()=>go('projects'); bindProjCards($('#app')); $('#goLab').onclick=()=>go('lab'); $('#goLib').onclick=()=>go('library'); $('#goDict').onclick=()=>go('dict');
  $('#goProj').onclick=()=>{const g=$('#pgoal').value.trim(); P.project={goal:g||'',plan:null}; save(); go('project'); if(g)setTimeout(()=>makePlan(g),50)};
  $('#knext').onclick=()=>go('lesson',cl);
  $$('#lessons .lr').forEach(r=>r.onclick=()=>{const i=+r.dataset.i; if(!unlocked(i))return toast(bn?'আগের লেসন শেষ করো':'Finish the previous lesson first'); go('lesson',i)});
  quick(bn?['রোবট বানাতে কী কী লাগে?','ESP32 কী?','সার্কিট কী?']:['What do I need to build a robot?','What is an ESP32?','What is a circuit?']);
}

/* ---------- LESSONS ---------- */
const AUTO=['card','boards','apps','syntax'];
function stepsBar(vs){return `<div class="steps">${vs.map((s,i)=>`<span class="${P.done[s.id]?'done':''} ${i===S.si?'on':''} ${s.extra?'extra':''}" data-i="${i}" title="${esc(L(s.title))}"></span>`).join('')}</div>`}
function typeName(tp){const bn=BN(); return {card:bn?'শেখো':'Learn',sim:bn?'সিমুলেট':'Simulate',photo:bn?'বাস্তবে বানাও':'Build for real',video:bn?'ভিডিও যাচাই':'Video check',code:bn?'কোড':'Code',quiz:bn?'কুইজ':'Quiz',ide:bn?'আপলোড':'Upload',boards:bn?'শেখো':'Learn',pins:bn?'এক্সপ্লোর':'Explore',apps:bn?'শেখো':'Learn',done:bn?'শেষ':'Done',syntax:bn?'কোডের শব্দ':'Code words'}[tp]}
function chipsRow(st,vs,les){const p=pace(); const skipped=les.steps.filter(s=>s.basic&&!vs.includes(s)).length, added=vs.filter(s=>s.extra).length;
  return `<div class="shead"><span class="badge-t t-${st.type}">${typeName(st.type)}</span><span class="scount">${t('step').toUpperCase()} ${String(S.si+1).padStart(2,'0')} / ${String(vs.length).padStart(2,'0')}</span>${added?`<span class="adapt">+${added} ${BN()?'ছোট ধাপ যোগ হয়েছে':'extra step'+(added>1?'s':'')+' for you'}</span>`:''}${skipped?`<span class="adapt fast">−${skipped} ${BN()?'ধাপ বাদ: তুমি দ্রুত':'skipped: you are fast'}</span>`:''}${listenBtn('lsn')}<button class="talkbtn" data-talk>${I(IC.mic||IC.vol,13)} ${BN()?'কথা বলো':'Talk'}</button></div>`}
const navHtml=()=>`<div class="navbar"><button class="btn-o sm" id="prev">← ${t('back')}</button><span class="sp"></span><span id="navMsg" class="scount"></span><button class="btn-w" id="next">${t('next')} →</button></div>`;
function bindNav(st,les){
  const vs=visibleSteps(les);
  $$('.steps span').forEach(s=>s.onclick=()=>{const i=+s.dataset.i; if(i<=S.si||P.done[vs[i-1]?.id])go('lesson',S.li,i)});
  $('#prev').onclick=()=>{if(S.si>0)go('lesson',S.li,S.si-1); else go('home')};
  $('#next').onclick=()=>{const cur=visibleSteps(les)[S.si]; if(AUTO.includes(cur.type))markDone(cur);
    const vs2=visibleSteps(les); const i=vs2.indexOf(cur); if(cur.type==='done'){ if(S.li<COURSE.length-1)go('lesson',S.li+1); else go('home'); return}
    if(i<vs2.length-1)go('lesson',S.li,i+1)};
  $('#lsn').onclick=e=>speak(L(st.title)+'. '+L(st.body),e.currentTarget);
}
function renderLesson(){
  const les=COURSE[S.li], vs=visibleSteps(les); if(S.si>=vs.length)S.si=vs.length-1; const st=vs[S.si]; S.stepStart=Date.now(); S.lastCheck=null;
  if(st.type==='sim'||st.type==='code')return renderWorkStep(st,vs,les);
  $('#app').className='page lesson-page in';
  $('#app').innerHTML=`<div class="lhead">${stepsBar(vs)}${chipsRow(st,vs,les)}<h1 class="stitle">${esc(L(st.title))}</h1></div><div id="sbody"></div><div id="sx"></div>${navHtml()}`;
  const body=$('#sbody'), sx=$('#sx'); const bodyHtml=`<p class="sbody">${inl(L(st.body))}</p>`; const col=LCOL[S.li];
  ({card:()=>{body.innerHTML=`<div class="cardgrid"><div class="scard pad">${bodyHtml}${st.id==='m1'?`<div class="msg"><div><b>${BN()?'ইন্সট্রাক্টর বলছে':'Instructor says'}</b>${BN()?'আমি প্রতিটা ধাপে তোমার পাশে থাকবো। ডান পাশে আমাকে যেকোনো প্রশ্ন করো, লিখে বা বলে।':'I am with you at every step. Ask me anything on the right, by typing or talking.'}</div></div>`:''}</div><div class="card visual">${bg(col)}<div class="vin">${(V[st.visual]||V.tookie)()}</div><div class="rim"></div></div></div>`},
    photo:()=>{body.innerHTML=bodyHtml; renderMediaStep(st,sx,'photo')},
    video:()=>{body.innerHTML=bodyHtml; renderMediaStep(st,sx,'video')},
    quiz:()=>{body.innerHTML=bodyHtml; renderQuiz(st,sx)},
    boards:()=>{body.innerHTML=bodyHtml; renderBoards(sx)},
    pins:()=>{body.innerHTML=bodyHtml; renderPins(sx)},
    ide:()=>{body.innerHTML=bodyHtml; renderIDE(st,sx)},
    apps:()=>{body.innerHTML=bodyHtml; renderApps(sx)},
    syntax:()=>{body.innerHTML=bodyHtml; renderSyntaxStep(st,sx)},
    done:()=>{body.innerHTML=''; renderDone(st,sx)}})[st.type]();
  bindNav(st,les); updateNav();
  quick(st.ask?L(st.ask):defaultQuick(st));
  stepVoice(st);
}
function defaultQuick(st){const bn=BN(); return ({code:bn?['আমি আটকে গেছি','এই লাইনটা কী করে?','আমার কোড রিভিউ করো']:['I am stuck','What does this line do?','Review my code'],sim:bn?['আমি আটকে গেছি','আমার সার্কিট দেখো']:['I am stuck','Look at my circuit'],photo:bn?['ভালো ছবি কীভাবে তুলবো?']:['How do I take a good photo?'],quiz:bn?['একটা হিন্ট দাও']:['Give me a hint'],ide:bn?['পোর্ট দেখাচ্ছে না','Connecting... এ আটকে আছে']:['No port shows up','Stuck on Connecting...'],syntax:bn?['delay আর millis এর পার্থক্য?','; কেন লাগে?']:['Why do I need ;?','What is the difference between = and ==?']})[st.type]||(bn?['আরেকটু সহজ করে বলো','একটা উদাহরণ দাও']:['Explain it more simply','Give me an example'])}
function updateNav(){const st=curStep(); if(!st)return; const need=['sim','code','photo','video','quiz','ide','pins'].includes(st.type); const ok=!need||P.done[st.id];
  const n=$('#next'); if(!n)return; n.disabled=!ok; $('#navMsg').textContent=ok?'':(BN()?'এই ধাপ শেষ করলে পরেরটা খুলবে':'Finish this step to continue');
  if(st.type==='done'){n.textContent=S.li<COURSE.length-1?(BN()?'পরের লেসন →':'Next lesson →'):(BN()?'হোমে যাও →':'Back home →')}
  $$('.steps span').forEach((s,i)=>s.classList.toggle('done',!!P.done[visibleSteps(COURSE[S.li])[i]?.id]))}

/* syntax step: every code word explained */
function synCard(e){const bn=BN(); const lines=e.ex.split('\n').map(l=>({l,x:explain(l,P.lang)})).filter(o=>o.l.trim());
  return `<div class="syncard"><div class="row sb"><code class="sig">${esc(e.sig)}</code><button class="say2" data-say="${esc(e.sig+'. '+L(e))}">${I(IC.vol,14)}</button></div><span class="chip ghost">${e.g}</span><p>${esc(L(e))}</p><div class="ex"><div class="cap">${bn?'উদাহরণ':'Example'}</div>${lines.map(o=>`<div class="exl"><code>${esc(o.l)}</code>${o.x?`<span>→ ${esc(o.x)}</span>`:''}</div>`).join('')}</div></div>`}
function bindSay(root){root.querySelectorAll('[data-say]').forEach(b=>b.onclick=()=>speak(b.dataset.say,b))}
function renderSyntaxStep(st,host){host.innerHTML=`<div class="syngrid">${st.keys.map(k=>synCard(SYNBY[k])).join('')}</div>`; bindSay(host)}

/* ---------- workspace (big simulator, code/steps + chat on the left) ---------- */
function makeEditor(host,code,onChange,opts={}){
  const bn=BN();
  host.innerHTML=`<div class="editor"><div class="ed-bar"><div class="tabs2"><button class="on" data-t="code">${I(IC.code,13)} tookie.ino</button>${opts.syntax?`<button data-t="syn">${bn?'সিনট্যাক্স':'Syntax'}</button>`:''}</div><span class="sp"></span>${opts.hints?`<button class="tb" id="hint">${I(IC.bulb,13)} ${bn?'হিন্ট':'Hint'} <span id="hn">0/3</span></button>`:''}<button class="tb" id="review">${I(IC.bot,13)} ${bn?'রিভিউ':'Review'}</button><button class="tb run" id="run">${I(IC.play,12)} Run</button><button class="tb" id="stop">${I(IC.sq,12)}</button></div>
   <div class="ed-pane on" data-p="code"><div class="ed-wrap"><div class="gutter" id="gut"></div><textarea class="code" id="code" spellcheck="false"></textarea></div><div class="explain" id="explain"><span class="cap">${bn?'এই লাইন কী করে':'What this line does'}</span><span id="exTxt" class="muted">${bn?'কোনো লাইনে ক্লিক করো':'Click any line of your code'}</span><button class="say2" id="exSay">${I(IC.vol,13)}</button></div></div>
   ${opts.syntax?`<div class="ed-pane" data-p="syn"><div class="synlist">${opts.syntax.map(r=>{const e=SYN.find(x=>r[0].includes(x.k.replace('Serial.','Serial.'))&&r[0].includes(x.k))||null; return `<div class="syn"><code>${esc(r[0])}</code><span>${esc(r[1])}</span>${e?`<button class="tb sm" data-k="${e.k}">${bn?'আরও':'More'}</button>`:''}</div>`}).join('')}</div></div>`:''}</div>`;
  const ta=host.querySelector('#code'); ta.value=code;
  const fit=()=>{ta.style.height='auto'; ta.style.height=ta.scrollHeight+'px'; host.querySelector('#gut').textContent=ta.value.split('\n').map((_,i)=>i+1).join('\n')}; fit();
  const ex=()=>{const pos=ta.selectionStart; const before=ta.value.slice(0,pos); const ln=before.split('\n').length; const line=ta.value.split('\n')[ln-1]||''; const x=explain(line,P.lang);
    $('#exTxt').innerHTML=line.trim()?`<b class="mono">${ln}</b> <code>${esc(line.trim().slice(0,48))}</code> → ${esc(x||(bn?'এই লাইনের জন্য ইন্সট্রাক্টরকে জিজ্ঞেস করো।':'Ask Instructor about this line.'))}`:(bn?'কোনো লাইনে ক্লিক করো':'Click any line of your code'); $('#exTxt').dataset.say=x||''};
  ta.addEventListener('input',()=>{fit(); ex(); onChange&&onChange(ta.value)}); ta.addEventListener('click',ex); ta.addEventListener('keyup',e=>{if(/Arrow/.test(e.key))ex()});
  ta.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault(); const s=ta.selectionStart; ta.value=ta.value.slice(0,s)+'  '+ta.value.slice(ta.selectionEnd); ta.selectionStart=ta.selectionEnd=s+2; ta.dispatchEvent(new Event('input'))}
    if(e.key==='Enter'){const s=ta.selectionStart, line=ta.value.slice(0,s).split('\n').pop(), ind=(line.match(/^\s*/)||[''])[0]+(/\{\s*$/.test(line)?'  ':''); e.preventDefault(); ta.value=ta.value.slice(0,s)+'\n'+ind+ta.value.slice(ta.selectionEnd); ta.selectionStart=ta.selectionEnd=s+1+ind.length; ta.dispatchEvent(new Event('input'))}});
  $('#exSay').onclick=e=>{const x=$('#exTxt').dataset.say; if(x)speak(x,e.currentTarget)};
  host.querySelectorAll('.tabs2 button').forEach(b=>b.onclick=()=>{host.querySelectorAll('.tabs2 button').forEach(x=>x.classList.toggle('on',x===b)); host.querySelectorAll('.ed-pane').forEach(p=>p.classList.toggle('on',p.dataset.p===b.dataset.t))});
  host.querySelectorAll('.synlist [data-k]').forEach(b=>b.onclick=()=>{const e=SYNBY[b.dataset.k]; tookieSays(`**${e.sig}**: ${L(e)}`,'',true)});
  return ta;
}
function wireRunner(sim,ta,{serial,state,msg,bt}){const bn=BN();
  const runIt=()=>{if(S.runner)S.runner.stop(); serial.textContent=''; const r=new Runner(sim,ta.value,{onSerial:s=>{serial.textContent=s; serial.scrollTop=1e6},onError:e=>{state.textContent='error'; state.className='rs err'; msg.innerHTML=`<div class="msg bad"><div><b>${bn?'কোডে সমস্যা':'Code problem'}</b>${esc(e)}</div></div>`},onWarn:w=>tookieSays(w,'warn',false)});
    S.runner=r; if(!r.dead){state.textContent='running'; state.className='rs on'; msg.innerHTML=''}};
  const stopIt=()=>{if(S.runner)S.runner.stop(); state.textContent='stopped'; state.className='rs'; sim.setPlaying&&sim.setPlaying(false)};
  $('#run').onclick=()=>{runIt(); sim.setPlaying&&sim.setPlaying(!(S.runner&&S.runner.dead))}; $('#stop').onclick=stopIt;
  sim.onPlay=v=>{if(v)$('#run').click(); else stopIt()};
  if(bt)$$('.phone [data-k]').forEach(b=>b.onclick=()=>{if(!S.runner||S.runner.dead)runIt(); S.runner.btQueue.push(b.dataset.k)});
  return runIt;
}
async function reviewCode(goal,sim,code,checkFn){
  const bn=BN(); bubble(bn?'আমার কোড রিভিউ করো':'Review my code','me'); const wait=bubble('…','bot');
  let r=null; try{if(checkFn)r=checkFn(sim,code)}catch(e){}
  const tr=Runner.test(sim,code,2500); const seen=new Set(tr.trace.map(x=>`LED ${x.leds.map(o=>o?'on':'off').join('/')||'-'} · motors ${x.motors.join(',')||'-'}`));
  const report=`${tr.error?'Error: '+tr.error:'Runs without errors.'} States seen in 2.5 s: ${[...seen].slice(0,6).join(' | ')||'nothing changes'}. Serial: ${(tr.serial||'').slice(0,160)||'(none)'}${r?`. Automatic check: ${r.ok?'PASSED':'NOT YET'}: ${L(r.msg)}`:''}`;
  let a;
  try{a=await askText(`${RULES()}\n\nReview the learner's code. Goal: ${goal}\nSimulation report: ${report}\nTheir code:\n${code}\n\nReply in 3 parts, short: (1) Does the simulation do what the goal asks? Say yes or not yet, and what you saw. (2) What their code does, 1 line per important part. (3) The next tiny step as a question or hint. Never write the corrected program.`)}
  catch(e){const lines=code.split('\n').map(l=>[l.trim(),explain(l,P.lang)]).filter(x=>x[1]).slice(0,6);
    a=(r?(r.ok?(bn?'✓ সিমুলেশন লক্ষ্য পূরণ করছে। ':'✓ The simulation does what the task asks. '):(bn?'এখনো না: ':'Not yet: ')+L(r.msg)+' '):(tr.error?(bn?'কোডে সমস্যা: ':'There is a problem: ')+tr.error+' ':''))+'\n'+(bn?'তোমার কোড যা করে:':'What your code does:')+'\n'+lines.map(([l,x])=>`• \`${l.slice(0,40)}\` → ${x}`).join('\n')}
  wait.remove(); bubble(a,'bot',r&&r.ok?'ok':''); speak(a.replace(/[•`]/g,'').slice(0,500));
}
function renderWorkStep(st,vs,les){
  document.body.classList.add('ws'); const bn=BN();
  $('#app').className='page wspage in';
  $('#app').innerHTML=`<div class="wsg"><div class="wl"><div class="wl-top scard" id="wlTop">${stepsBar(vs)}${chipsRow(st,vs,les)}<h2 class="wtitle">${esc(L(st.title))}</h2><p class="wbody">${inl(L(st.body))}</p><div id="wlx"></div>${navHtml()}</div><div class="wl-chat" id="wsChat"></div></div>
   <div class="wr"><div id="labHost"></div><div id="wrx"></div></div></div>`;
  dockAgent($('#wsChat'));
  if(st.type==='sim')simStep(st); else codeStep(st);
  bindNav(st,les); updateNav(); quick(st.ask?L(st.ask):defaultQuick(st));
  stepVoice(st);
}
function simStep(st){
  $('#wlx').innerHTML=`<div class="row" style="gap:8px;margin-top:10px"><button class="btn-w" id="chk">${t('check')}</button><button class="btn-o sm" id="rst">${BN()?'আবার শুরু':'Start over'}</button></div><div id="simMsg"></div>`;
  const sim=new Sim($('#labHost'),{palette:st.palette}); S.sim=sim; sim.showTest(!!st.testPin);
  const saved=P.sims[st.id]||(st.from&&P.sims[st.from]); if(saved)sim.load(saved); else sim.changed();
  let tmr; sim.on(s=>{P.sims[st.id]=s.save(); save(); clearTimeout(tmr); tmr=setTimeout(()=>autoCheck(st,s),450)});
  const run=(manual)=>{if(!$('#simMsg')||S.sim!==sim)return {}; const r=st.check(sim,P); S.lastCheck=r; $('#simMsg').innerHTML=`<div class="msg ${r.ok?'ok':'bad'}"><div><b>${r.ok?(BN()?'ঠিক আছে':'Check passed'):(BN()?'ইন্সট্রাক্টরের পরামর্শ':'Instructor’s tip')}</b>${esc(L(r.msg))}</div></div>`;
    if(r.ok&&!P.done[st.id]){markDone(st); logAct('checks'); tookieSays(L(r.msg),'ok'); if(!P.voice)speak(L(r.msg))} else if(!r.ok&&manual){if(!r.soft)fail(st); tookieSays(L(r.msg),'warn')} return r};
  $('#chk').onclick=()=>run(true); $('#rst').onclick=()=>{sim.comps=[];sim.wires=[]; delete P.sims[st.id]; save(); sim.changed(); $('#simMsg').innerHTML=''};
  S.autoRun=run;
}
function autoCheck(st,sim){if(P.done[st.id]||!S.autoRun)return; const r=st.check(sim,P); if(r.ok||r.soft)S.autoRun(false)}
function codeStep(st){
  const bn=BN(); const code=P.codes[st.id]??st.starter;
  $('#wlx').innerHTML=`<div id="edHost"></div><div class="row" style="gap:8px;margin-top:10px"><button class="btn-w" id="chk">${t('check')}</button><button class="btn-o sm" id="rstc">${bn?'শুরুর কোড':'Reset code'}</button></div><div id="hintBox"></div><div id="codeMsg"></div>`;
  const ta=makeEditor($('#edHost'),code,v=>{P.codes[st.id]=v; save()},{syntax:st.syntax,hints:true});
  $('#wrx').innerHTML=`<div class="under"><div class="serial"><div class="sh"><span>Serial Monitor · 115200</span><span id="runState" class="rs">stopped</span></div><pre id="ser"></pre></div>${st.bt?`<div class="phone"><div class="pad"><span></span><button data-k="F">F</button><span></span><button data-k="L">L</button><button data-k="S">S</button><button data-k="R">R</button><span></span><button data-k="B">B</button><span></span></div><div class="muted">${bn?'ভার্চুয়াল ফোন: চাপলে Bluetooth দিয়ে অক্ষর যায়।':'Virtual phone: each tap sends a letter over Bluetooth to SerialBT.'}</div></div>`:`<div class="tipc">${I(IC.bulb,16)}<span>${bn?'ল্যাবে হলুদ বাটন চেপে ধরে পরীক্ষা করো। লাইনে ক্লিক করলে বাম পাশে তার মানে দেখবে।':'Hold the yellow button in the lab to test. Click any line of code to see what it does.'}</span></div>`}</div>`;
  const sim=new Sim($('#labHost'),{palette:[]}); S.sim=sim; $('#labHost .lab').classList.add('nopal','locked'); $('#labHost .lab-pal').remove(); sim.locked=true;
  (st.preset==='car'?presetCar:presetLED)(sim); sim.fitView();
  const runIt=wireRunner(sim,ta,{serial:$('#ser'),state:$('#runState'),msg:$('#codeMsg'),bt:st.bt});
  let hints=0; $('#hint').onclick=()=>{const H=L(st.hints)||[]; if(hints>=H.length){toast(bn?'আর হিন্ট নেই: ইন্সট্রাক্টরকে জিজ্ঞেস করো':'No more hints: ask Instructor below');return} const h=H[hints++]; $('#hn').textContent=hints+'/'+H.length;
    $('#hintBox').innerHTML=`<div class="hintbox"><b class="mono">HINT ${hints}</b> ${inl(h.includes('(')?'`'+h+'`':h)}</div>`; if(hints>=2&&!P.fails[st.id])fail(st)};
  $('#review').onclick=()=>reviewCode(st.body.en,sim,ta.value,st.check);
  $('#rstc').onclick=()=>{ta.value=st.starter; P.codes[st.id]=st.starter; save(); ta.dispatchEvent(new Event('input'))};
  $('#chk').onclick=()=>{const btn=$('#chk'); btn.disabled=true; btn.innerHTML='<span class="spin"></span>'; setTimeout(()=>{
    let r; try{r=st.check(sim,ta.value)}catch(e){r={ok:false,msg:{en:String(e.message||e),bn:String(e.message||e)}}}
    btn.disabled=false; btn.textContent=t('check'); S.lastCheck=r;
    if(r.ok){runIt(); if(!P.done[st.id]){markDone(st); logAct('steps'); logAct('checks')} tookieSays(L(r.msg),'ok'); if(!P.voice)speak(L(r.msg))} else {fail(st); tookieSays(L(r.msg),'warn')}
    $('#codeMsg').innerHTML=`<div class="msg ${r.ok?'ok':'bad'}"><div><b>${r.ok?(bn?'টেস্ট পাস':'Tests passed'):(bn?'এখনো না':'Not yet')}</b>${esc(L(r.msg))}</div></div>`},30)};
  runIt();
}

/* ---------- BUILD workspace: free lab + projects (any part, any code) ---------- */
function renderBuild(key,goalText){
  const bn=BN(); document.body.classList.add('ws');
  const store=key==='project'?(P.project=P.project||{}):(P.free=P.free||{});
  const host=$('#buildHost')||$('#app');
  host.innerHTML=`<div class="wsg"><div class="wl"><div class="wl-top scard" id="wlTop"><div class="shead"><span class="badge-t t-sim">${key==='project'?(bn?'প্রজেক্ট':'Project'):'Circuit Lab'}</span><span class="scount">${PARTS.length} ${bn?'পার্টস':'parts'} · ${bn?'যেকোনো কোড':'any code'}</span></div>
     <h2 class="wtitle">${esc(key==='project'?(store.plan?.title||store.goal||(bn?'আমার প্রজেক্ট':'My project')):(bn?'যা খুশি বানাও':'Build anything'))}</h2><p class="wbody">${bn?'বাম থেকে পার্টস টেনে আনো বা খোঁজো, তার দাও, কোড লেখো আর Run চাপো। ইন্সট্রাক্টর রিভিউ করবে, কিন্তু পুরো কোড লিখে দেবে না।':'Drag or search parts on the left of the lab, wire them, write code and press Run. Instructor reviews your work but won’t write the whole code.'}</p>
     <div id="edHost"></div><div id="codeMsg"></div></div><div class="wl-chat" id="wsChat"></div></div>
   <div class="wr"><div id="labHost"></div><div class="under"><div class="serial"><div class="sh"><span>Serial Monitor · 115200</span><span id="runState" class="rs">stopped</span></div><pre id="ser"></pre></div><div class="phone"><div class="pad"><span></span><button data-k="F">F</button><span></span><button data-k="L">L</button><button data-k="S">S</button><button data-k="R">R</button><span></span><button data-k="B">B</button><span></span></div><div class="muted">${bn?'ভার্চুয়াল ফোন (SerialBT)':'Virtual phone (SerialBT)'}</div></div></div></div></div>`;
  dockAgent($('#wsChat'));
  const CP=key==='project'&&store.cat?PROJ.LIST.find(x=>x.id===store.cat):null;
  const ta=makeEditor($('#edHost'),store.code??(CP&&CP.starter)??'void setup() {\n  \n}\n\nvoid loop() {\n  \n}\n',v=>{store.code=v; save()},{});
  if(CP){const bar=$('#edHost .ed-bar'); const hb=document.createElement('button'); hb.className='tb'; hb.id='phint'; let hn=0; hb.innerHTML=`${I(IC.bulb,13)} ${bn?'হিন্ট':'Hint'} <span>0/3</span>`; bar.insertBefore(hb,$('#review'));
    hb.onclick=()=>{if(hn>=CP.hints.length)return toast(bn?'আর হিন্ট নেই: ইন্সট্রাক্টরকে জিজ্ঞেস করো':'No more hints: ask Instructor'); const h=CP.hints[hn++]; hb.querySelector('span').textContent=hn+'/'+CP.hints.length; tookieSays((bn?'হিন্ট '+hn+': ':'Hint '+hn+': ')+h,'tip')};
    const cb=document.createElement('button'); cb.className='tb run chk'; cb.id='pchk'; cb.innerHTML=`${I(IC.check,13)} ${bn?'চেক':'Check'}`; bar.insertBefore(cb,$('#run'));
    cb.onclick=()=>{$('#codeMsg').innerHTML=`<div class="msg"><span class="spin"></span> ${bn?'ইন্সট্রাক্টর তোমার সার্কিট আর কোড টেস্ট করছে…':'Instructor is testing your circuit and code…'}</div>`;
      setTimeout(()=>{let r; try{r=PROJ.check(CP,sim,ta.value)}catch(e){r={ok:false,msg:{en:String(e.message||e),bn:String(e.message||e)}}}
        $('#codeMsg').innerHTML=`<div class="msg ${r.ok?'ok':'bad'}"><div><b>${r.ok?(bn?'প্রজেক্ট সম্পূর্ণ':'Project complete'):(bn?'এখনো না':'Not yet')}</b>${esc(L(r.msg))}</div></div>`;
        logAct('checks',r.ok?1:0); if(r.ok){const first=!projDone(CP.id); P.projDone={...(P.projDone||{}),[CP.id]:Date.now()}; P.checks.code++; save(); renderNav(); if(first)toast('🏆 '+L(CP.title)); tookieSays(L(r.msg),'ok')}},40)}}
  const sim=new Sim($('#labHost'),{palette:PARTS}); S.sim=sim; sim.showTest(true);
  if(store.sim)sim.load(store.sim); else sim.changed(); sim.on(s=>{store.sim=s.save(); save()});
  if(store.pending){const ids=store.pending; delete store.pending; let x=30,y=40,rh=0; ids.forEach(id=>{const L0=LIB[id]; if(!L0)return; if(x+L0.w>970){x=30;y+=rh+70;rh=0} sim.add(id,x,y); x+=L0.w+70; rh=Math.max(rh,L0.h)}); sim.changed(); save()}
  wireRunner(sim,ta,{serial:$('#ser'),state:$('#runState'),msg:$('#codeMsg'),bt:true});
  $('#review').onclick=()=>reviewCode(key==='project'?(store.plan?store.plan.summary||store.goal:store.goal||'my project'):'free build',sim,ta.value,null);
  quick(bn?['এই পার্টটা কীভাবে লাগাবো?','আমার সার্কিট দেখো','এরপর কী করবো?']:['How do I wire this part?','Look at my circuit','What should I do next?']);
}
function renderLab(){$('#app').className='page wspage in'; $('#app').innerHTML='<div id="buildHost"></div>'; renderBuild('free')}

/* ---------- PROJECTS: AI plans the flow, the learner builds ---------- */
const TEMPLATES=[
 {re:/obstacle|wall|avoid|দেয়াল|বাধা|sonar/i,title:'Obstacle-avoiding car',parts:[['esp32',1],['l298n',1],['tt_motor',2],['hcsr04',1],['battery74',1]],
  flow:[['start','Start'],['action','Set up motor pins and the sonar pins'],['action','Measure the distance with the sonar'],['decision','Is the wall closer than 20 cm?','Stop, back up a little, turn right','Drive forward'],['loop','Repeat forever']],
  steps:['Place the ESP32, L298N, two TT motors, the sonar and the 7.4 V battery.','Wire the L298N like in Lesson 4 (ENA 14, IN1 27, IN2 26, IN3 25, IN4 33, ENB 32).','Wire the sonar: VCC 5V, TRIG → D5, ECHO → D18, GND.','Code: make the car drive forward first.','Code: read the distance with pulseIn and print it on the Serial Monitor.','Code: add the if: closer than 20 cm → stop and turn.','Test in the lab by dragging the sonar distance slider.'],
  q:['What should the car do if the wall is very close but the motors are still running?','How long should it turn before driving again?','Which number will you change to make it more careful?']},
 {re:/line|follow|লাইন/i,title:'Line-following robot',parts:[['esp32',1],['l298n',1],['tt_motor',2],['line_sensor',2],['battery74',1]],
  flow:[['start','Start'],['action','Read the left and right line sensors'],['decision','Left sensor on the line?','Turn left a little','Check the right sensor'],['decision','Right sensor on the line?','Turn right a little','Drive straight'],['loop','Repeat forever']],
  steps:['Place two line sensors at the front, left and right.','Wire each sensor: VCC, GND, DO → a GPIO pin.','Code: read both sensors with digitalRead and print them.','Code: decide left / right / straight with if and else.','Test by clicking each sensor to put it over the line.'],q:['What happens if both sensors see the line?','Should the turn be fast or slow? Why?']},
 {re:/plant|water|soil|গাছ|পানি/i,title:'Plant-watering helper',parts:[['esp32',1],['soil',1],['relay',1],['motor',1],['battery9v',1],['led_blue',1],['resistor',1]],
  flow:[['start','Start'],['action','Read the soil moisture'],['decision','Is the soil dry?','Turn the pump on for 3 seconds','Keep the pump off'],['action','Wait 10 seconds'],['loop','Repeat forever']],
  steps:['Place the soil sensor and wire AO → D34 (an analog pin).','Wire the relay: VCC, GND, IN → D26. The pump (motor) and 9 V battery go through COM and NO.','Code: print analogRead(34) to see dry vs wet numbers.','Code: choose a "dry" number and switch the relay with digitalWrite.','Test with the moisture slider.'],q:['What number means "dry" for your soil?','Why do we wait between checks?']},
 {re:/light|night|dark|ldr|আলো|রাত/i,title:'Automatic night light',parts:[['esp32',1],['ldr',1],['resistor10k',1],['led',1],['resistor',1],['breadboard',1]],
  flow:[['start','Start'],['action','Read the light level'],['decision','Is it dark?','Turn the LED on','Turn the LED off'],['loop','Repeat forever']],
  steps:['Make a voltage divider: 3V3 → LDR → D34 → 10 kΩ → GND.','LED with 220 Ω on D23.','Code: print analogRead(34) and move the light slider.','Code: pick a "dark" number and switch the LED.'],q:['Why do we need the 10 kΩ resistor with the LDR?','What if the light flickers around your number?']},
 {re:/touch|ছুঁ|টাচ|pet/i,title:'Touch-reactive robot',parts:[['esp32',1],['touch',1],['buzzer',1],['servo',1],['rgb_led',1],['resistor',3]],
  flow:[['start','Start'],['action','Read the touch sensor'],['decision','Touched?','Beep, wave the servo, light up green','Stay calm: blue light'],['loop','Repeat forever']],
  steps:['Wire the touch sensor: VCC, GND, SIG → D4.','Buzzer + → D23, − → GND. Servo signal → D18.','Code: print digitalRead(4) and hold the sensor.','Code: when touched, beep and move the servo with myservo.write().'],q:['How can the robot show it is "happy" without a screen?','What should happen if you keep touching it?']},
 {re:/door|lock|servo|দরজা/i,title:'Smart door with a servo',parts:[['esp32',1],['servo',1],['button',1],['buzzer',1]],
  flow:[['start','Start'],['action','Read the button'],['decision','Pressed?','Open the door: servo to 90°, beep','Keep the door closed: servo 0°'],['loop','Repeat forever']],
  steps:['Servo: brown GND, red VCC (5 V), orange SIG → D18.','Button between D4 and GND (INPUT_PULLUP).','Code: Servo myservo; myservo.attach(18); then write angles.'],q:['How long should the door stay open?','How could you add a secret knock?']}];
function templatePlan(goal){const t0=TEMPLATES.find(x=>x.re.test(goal))||{title:goal||'My robot',parts:[['esp32',1],['breadboard',1],['led',1],['resistor',1],['button',1]],flow:[['start','Start'],['action','Set up the pins'],['action','Read an input'],['decision','Did something happen?','Do the action','Wait'],['loop','Repeat forever']],steps:['List what your robot should notice (inputs) and do (outputs).','Pick the parts from the library and place them.','Wire one part at a time and test it.','Write the code for one input and one output first.'],q:['What should your robot notice?','What should it do when that happens?']};
  return {title:t0.title,summary:`${t0.title}: ${t0.flow.slice(1,-1).map(f=>f[1]).join(' → ')}.`,parts:t0.parts.map(([id,qty])=>({id,qty,why:LIB[id].desc})),steps:t0.steps,flow:t0.flow.map(([type,text,yes,no])=>({type,text,yes,no})),questions:t0.q,offline:true}}
async function makePlan(goal){
  const bn=BN(); P.project={...(P.project||{}),goal}; save(); S.ptab='plan';
  const box=$('#planBox'); if(box)box.innerHTML=`<div class="scard pad"><span class="spin"></span> ${bn?'ইন্সট্রাক্টর তোমার প্রজেক্ট প্ল্যান করছে…':'Instructor is planning your project…'}</div>`;
  let plan=null;
  try{plan=await askJSON(`${RULES()}\n\nThe learner wants to build: """${goal}""". Make a beginner project plan using ONLY these parts (id: name): ${PARTS.map(id=>id+': '+LIB[id].name).join('; ')}.\nDo NOT write any program code. Return JSON only:\n{"title":"short","summary":"1-2 sentences","parts":[{"id":"part id","qty":1,"why":"what it does here"}],"steps":["build or code task, one per line, no code"],"flow":[{"type":"start|action|decision|loop","text":"","yes":"for decisions","no":"for decisions"}],"questions":["2-3 questions that make them think"]}`);
    plan.parts=(plan.parts||[]).filter(p=>LIB[p.id]); if(!plan.parts.length||!plan.flow)throw 0}catch(e){plan=templatePlan(goal)}
  P.project.plan=plan; P.project.done={}; save(); if(S.view==='project')renderProject();
  tookieSays(bn?`প্ল্যান তৈরি: ${plan.title}। আগে পার্টস সাজাও, তারপর একটা একটা করে ধাপ করো।`:`Your plan is ready: ${plan.title}. Place the parts first, then do one step at a time.`,'ok');
}
function flowSvg(flow){const W=380; let y=16, s=''; const cx=W/2-40;
  flow.forEach((n,i)=>{const h=n.type==='decision'?74:40;
    if(n.type==='start'||n.type==='loop')s+=`<rect x="${cx-90}" y="${y}" width="180" height="${h}" rx="20" fill="${n.type==='start'?'#E8FF1F':'rgba(255,255,255,.12)'}"/><text x="${cx}" y="${y+25}" text-anchor="middle" font-size="12.5" font-weight="700" fill="${n.type==='start'?'#0b0b0c':'#fff'}">${esc(n.text)}</text>`;
    else if(n.type==='decision'){s+=`<path d="M${cx} ${y} L${cx+110} ${y+h/2} L${cx} ${y+h} L${cx-110} ${y+h/2} Z" fill="#FFB37A"/><foreignObject x="${cx-80}" y="${y+14}" width="160" height="${h-28}"><div xmlns="http://www.w3.org/1999/xhtml" class="fo">${esc(n.text)}</div></foreignObject>`;
      s+=`<path d="M${cx+110} ${y+h/2} H${cx+130}" stroke="#7CFFB2" stroke-width="2"/><text x="${cx+114}" y="${y+h/2-6}" font-size="10" fill="#7CFFB2" font-weight="700">${BN()?'হ্যাঁ':'YES'}</text><foreignObject x="${cx+132}" y="${y+h/2-22}" width="${W-cx-136}" height="44"><div xmlns="http://www.w3.org/1999/xhtml" class="fo yes">${esc(n.yes||'')}</div></foreignObject>`;
      s+=`<text x="${cx+8}" y="${y+h+13}" font-size="10" fill="rgba(255,255,255,.6)" font-weight="700">${BN()?'না':'NO'} · ${esc((n.no||'').slice(0,40))}</text>`}
    else s+=`<rect x="${cx-110}" y="${y}" width="220" height="${h}" rx="10" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.2)"/><foreignObject x="${cx-104}" y="${y+4}" width="208" height="${h-8}"><div xmlns="http://www.w3.org/1999/xhtml" class="fo w">${esc(n.text)}</div></foreignObject>`;
    y+=h; if(i<flow.length-1){s+=`<path d="M${cx} ${y} V${y+(n.type==='decision'?22:18)}" stroke="rgba(255,255,255,.5)" stroke-width="2" marker-end="url(#ar)"/>`; y+=n.type==='decision'?22:18}});
  s+=`<path d="M${cx-90} ${y-20} H18 V${16+20+18+20} H${cx-110}" stroke="rgba(255,255,255,.35)" stroke-width="1.6" fill="none" stroke-dasharray="4 4" marker-end="url(#ar)"/>`;
  return `<svg viewBox="0 0 ${W} ${y+10}" class="flow"><defs><marker id="ar" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8z" fill="rgba(255,255,255,.6)"/></marker></defs>${s}</svg>`}
function renderProject(){
  const bn=BN(); const pr=P.project||(P.project={}); S.ptab=S.ptab||'plan'; $('#app').className='page in';
  if(!pr.plan){
    $('#app').innerHTML=`<div class="ph"><div><div class="ph-k">${bn?'নতুন প্রজেক্ট':'New project'}</div><h1>${bn?'কী বানাতে চাও?':'What do you want to build?'}</h1><p class="muted">${bn?'ইন্সট্রাক্টর পার্টস, তারের ছক, ধাপ আর ফ্লোচার্ট বানাবে। কোড লিখবে তুমি, ইন্সট্রাক্টর শুধু পথ দেখাবে।':'Instructor plans the parts, wiring, steps and a flowchart. You write the code; Instructor only guides you.'}</p></div></div>
     <section class="card h1 wide">${bg('green')}<div class="in-c"><div class="ttl">${bn?'তোমার আইডিয়া লেখো':'Describe your idea'}</div><textarea id="pgoal2" rows="4" placeholder="${bn?'যেমন: রাতে অন্ধকার হলে আলো জ্বলবে':'e.g. a robot that waters my plant when the soil is dry'}">${esc(pr.goal||'')}</textarea>
      <div class="row wrap" style="gap:6px;margin-top:10px">${(bn?['দেয়াল দেখলে থামে এমন গাড়ি','লাইন ফলোয়ার রোবট','গাছে পানি দেওয়ার রোবট','অন্ধকারে আলো জ্বলে','ছুঁলে সাড়া দেয় রোবট','সার্ভো দিয়ে স্মার্ট দরজা']:['Car that stops before a wall','Line-following robot','Plant-watering robot','Night light that turns on in the dark','Robot that reacts to touch','Smart door with a servo']).map(x=>`<button class="chip-btn">${x}</button>`).join('')}</div>
      <div class="row cta" style="gap:8px"><button class="btn-w" id="mkPlan">${I(IC.spark,15)} ${bn?'প্ল্যান বানাও':'Plan it with Instructor'}</button><button class="btn-g" id="blank">${bn?'খালি ল্যাবে শুরু':'Start with an empty lab'}</button></div></div><div class="rim"></div></section><div id="planBox"></div>`;
    $$('.chip-btn').forEach(b=>b.onclick=()=>{$('#pgoal2').value=b.textContent});
    $('#mkPlan').onclick=()=>{const g=$('#pgoal2').value.trim(); if(!g)return toast(bn?'আগে আইডিয়া লেখো':'Write your idea first'); makePlan(g)};
    $('#blank').onclick=()=>{pr.plan={title:bn?'আমার প্রজেক্ট':'My project',summary:'',parts:[],steps:[],flow:[],questions:[]}; S.ptab='build'; save(); renderProject()};
    quick(bn?['আইডিয়া দাও','কোন পার্টস লাগবে?']:['Give me an idea','Which parts will I need?']); return}
  const pl=pr.plan; pr.done=pr.done||{};
  $('#app').innerHTML=`<div class="ph"><div><div class="ph-k">${bn?'প্রজেক্ট':'Project'}</div><h1>${esc(pl.title)}</h1><p class="muted">${esc(pl.summary||pr.goal||'')}</p></div><div class="row" style="gap:8px"><div class="seg2" id="ptabs"><button data-t="plan" class="${S.ptab==='plan'?'on':''}">${bn?'প্ল্যান':'Plan'}</button><button data-t="build" class="${S.ptab==='build'?'on':''}">${bn?'বানাও':'Build'}</button></div><button class="btn-o sm" id="newP">${pr.cat?(bn?'← সব প্রজেক্ট':'← All projects'):(bn?'নতুন আইডিয়া':'New idea')}</button></div></div><div id="buildHost"></div>`;
  $$('#ptabs button').forEach(b=>b.onclick=()=>{S.ptab=b.dataset.t; renderProject()}); $('#newP').onclick=()=>{if(pr.cat)return go('projects'); P.project={}; save(); renderProject()};
  if(S.ptab==='build'){renderBuild('project'); return}
  const nDone=pl.steps.filter((_,i)=>pr.done[i]).length; const CP=pr.cat?PROJ.LIST.find(x=>x.id===pr.cat):null;
  $('#buildHost').innerHTML=`<div class="bento">${CP?`<section class="card pstory">${bg(CP.color)}<div class="in-c"><div class="row sb"><div class="row" style="gap:6px">${lvChip(CP)}<span class="chip ghost">${CP.mins} min</span><span class="chip ghost">${esc(CP.cat)}</span>${projDone(CP.id)?'<span class="chip lime">✓ '+(bn?'শেষ':'Done')+'</span>':''}</div></div>
     <div class="ps-in"><div class="ps-t"><div class="ttl">${bn?'এটা কী আর কেন':'What & why'}</div><p>${esc(L(CP.story))}</p><div class="row wrap" style="gap:6px;margin-top:12px"><span class="muted sm">${bn?'যা শিখবে':'You’ll learn'}</span>${CP.learn.map(x=>`<span class="tag lime">${esc(x)}</span>`).join('')}</div></div><div class="ps-art">${partThumb(CP.hero,170)}</div></div></div><div class="rim"></div></section>
   <section class="scard pwire"><div class="sc-h"><div><div class="sc-t">${bn?'তারের ছক':'Wiring'}</div><div class="muted">${bn?'একটা একটা করে লাগাও':'One wire at a time'}</div></div></div><ol class="wlist">${CP.wiring.map(w=>`<li><span>${esc(w).replace(/→/g,'<i>→</i>')}</span></li>`).join('')}</ol></section>`:''}
   <section class="card plan-parts">${bg('copper')}<div class="in-c scroll"><div class="row sb"><div class="ttl">${bn?'পার্টস':'Parts'}</div><span class="chip">${pl.parts.reduce((a,p)=>a+(p.qty||1),0)}</span></div>
     <div class="plist">${pl.parts.map(p=>`<div class="pp">${partThumb(p.id,46)}<div><b>${esc(LIB[p.id].name)} ${p.qty>1?'× '+p.qty:''}</b><span>${esc(p.why||LIB[p.id].desc)}</span></div></div>`).join('')}</div>
     <button class="btn-w sm" id="addParts">${bn?'পার্টস ল্যাবে যোগ করো':'Add these parts to my lab'} →</button></div><div class="rim"></div></section>
   <section class="card plan-flow">${bg('graph')}<div class="in-c scroll"><div class="row sb"><div class="ttl">${bn?'ফ্লোচার্ট':'Flowchart'}</div><span class="muted">${bn?'প্রোগ্রাম কীভাবে ভাববে':'how the program thinks'}</span></div>${flowSvg(pl.flow||[])}</div><div class="rim"></div></section>
   <section class="scard plan-steps"><div class="sc-h"><div><div class="sc-t">${bn?'ধাপগুলো':'Steps'}</div><div class="muted">${bn?'কোড না, শুধু কী করতে হবে':'What to do, not the code'}</div></div><span class="cct-badge">${nDone}/${pl.steps.length}</span></div>
     <div class="checklist">${pl.steps.map((s,i)=>`<label class="ck ${pr.done[i]?'on':''}"><input type="checkbox" data-i="${i}" ${pr.done[i]?'checked':''}><span class="box">${I(IC.check,12)}</span><span>${esc(s)}</span><button class="say2" data-say="${esc(s)}">${I(IC.vol,13)}</button></label>`).join('')}</div>
     <button class="btn-w sm" id="toBuild" style="margin-top:12px">${bn?'বানানো শুরু করো':'Start building'} →</button></section>
   <section class="card plan-q">${bg('pink')}<div class="in-c scroll"><div class="ttl">${bn?'ভেবে দেখো':'Think about it'}</div><div class="qs">${(pl.questions||[]).map(q=>`<div class="qq2" data-q="${esc(q)}">${I(IC.bulb,15)}<span>${esc(q)}</span></div>`).join('')}</div><p class="muted">${bn?'প্রশ্নে চাপ দিলে ইন্সট্রাক্টরের সাথে আলোচনা হবে।':'Tap a question to talk it through with Tookie.'}</p></div><div class="rim"></div></section>
  </div>`;
  bindSay($('#buildHost'));
  $$('.checklist input').forEach(c=>c.onchange=()=>{pr.done[+c.dataset.i]=c.checked; save(); c.closest('.ck').classList.toggle('on',c.checked); $('.plan-steps .cct-badge').textContent=pl.steps.filter((_,i)=>pr.done[i]).length+'/'+pl.steps.length; if(c.checked)logAct('steps')});
  $('#addParts').onclick=()=>{pr.pending=pl.parts.flatMap(p=>Array(Math.min(3,p.qty||1)).fill(p.id)); pr.sim=null; S.ptab='build'; save(); renderProject()};
  $('#toBuild').onclick=()=>{S.ptab='build'; renderProject()};
  $$('.qq2').forEach(q=>q.onclick=()=>ask(q.dataset.q));
  quick(bn?['প্রথম ধাপে কী করবো?','ফ্লোচার্টটা বুঝিয়ে দাও']:['What do I do first?','Explain the flowchart']);
}



/* ---------- VOICE CHAT: Instructor talks, then listens, hands-free ---------- */
const VC={on:false,state:'idle',gen:0};
function stepVoice(st){if(st.type==='done')return; const txt=L(st.title)+'. '+L(st.body);
  if(VC.on)return setTimeout(()=>vcSay(txt+' '+(BN()?'কোনো প্রশ্ন থাকলে বলো। পরের ধাপে যেতে বলো "পরের"।':'Ask me anything, or say "next" when you are done.')),300);
  if(P.voice)setTimeout(()=>speak(txt,$('#lsn')),250)}
function vcUI(state,txt){VC.state=state; let p=$('#vchat'); if(!VC.on){p&&p.remove(); document.body.classList.remove('vc-on'); return}
  if(!p){p=document.createElement('div'); p.id='vchat'; p.innerHTML=`<div class="vc-orb"><i></i><i></i><i></i><i></i><i></i></div><div class="vc-t"><b></b><span></span></div><button class="vc-talk" title="Talk now">${I(IC.mic||IC.vol,16)}</button><button class="vc-end" title="End voice chat">✕</button>`; document.body.appendChild(p);
    p.querySelector('.vc-end').onclick=()=>vcStop(); p.querySelector('.vc-talk').onclick=()=>{if(VC.state==='speaking'){stopSpeak(); vcListen()} else if(VC.state==='listening'){try{rec&&rec.stop()}catch(e){}} else vcListen()}}
  document.body.classList.add('vc-on'); p.dataset.s=state; const bn=BN();
  p.querySelector('b').textContent={speaking:bn?'ইন্সট্রাক্টর বলছে…':'Instructor is talking…',listening:bn?'শুনছি… এখন বলো':'Listening… speak now',thinking:bn?'ভাবছি…':'Thinking…',idle:bn?'কথা বলতে চাপ দাও':'Tap the mic to talk'}[state];
  p.querySelector('span').textContent=txt||(state==='speaking'?(bn?'মাঝে কথা বলতে মাইকে চাপ দাও':'Tap the mic to interrupt'):state==='listening'?(bn?'বলো "পরের", "আবার" বা প্রশ্ন করো':'Say "next", "repeat" or ask a question'):'')}
async function vcSay(text){if(!VC.on)return; const g=++VC.gen; vcUI('speaking',String(text).slice(0,90)); await speak(text); if(VC.on&&g===VC.gen)vcListen()}
function vcListen(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!VC.on)return;
  if(!SR){vcUI('idle',BN()?'এই ব্রাউজারে মাইক নেই: নিচে লিখে প্রশ্ন করো':'No microphone support here: type below instead'); return}
  try{rec&&rec.abort()}catch(e){} const r=new SR(); rec=r; r.lang=BN()?'bn-BD':'en-US'; r.interimResults=true; let final='', got=false;
  r.onresult=e=>{const tx=[...e.results].map(x=>x[0].transcript).join(''); vcUI('listening','“'+tx+'”'); if(e.results[e.results.length-1].isFinal){final=tx; got=true}};
  r.onerror=()=>{}; r.onend=()=>{rec=null; if(!VC.on)return; if(!got||!final.trim())return vcUI('idle'); vcHeard(final.trim())};
  vcUI('listening'); try{r.start()}catch(e){vcUI('idle')}}
function vcHeard(q){const ql=q.toLowerCase(); const bn=BN();
  if(/^(next|next step|go on|continue|done|পরের|পরেরটা|শেষ)\b/.test(ql)&&S.view==='lesson'){const b=$('#next'); if(b&&!b.disabled){b.click(); return} return vcSay(bn?'আগে এই ধাপটা শেষ করো, তারপর পরের ধাপে যাবো।':'Finish this step first, then we can go to the next one.')}
  if(/^(repeat|again|say it again|আবার|আরেকবার)\b/.test(ql)&&S.view==='lesson'){const vs=visibleSteps(COURSE[S.li]); return stepVoice(vs[S.si])}
  if(/^(stop|bye|goodbye|end|বন্ধ|বাই)\b/.test(ql))return vcStop();
  vcUI('thinking','“'+q+'”'); ask(q)}
function vcStart(){VC.on=true; P.voice=true; save(); $('#voiceTgl')&&$('#voiceTgl').classList.add('on');
  const vs=S.view==='lesson'?visibleSteps(COURSE[S.li]):null; if(vs&&vs[S.si])stepVoice(vs[S.si]); else vcSay(BN()?'হাই! আমি তোমার AI ইন্সট্রাক্টর। কী জানতে চাও, বলো।':'Hi, I am your AI instructor. What would you like to know? Just talk.')}
function vcStop(){VC.on=false; VC.gen++; stopSpeak(); try{rec&&rec.abort()}catch(e){} rec=null; vcUI('idle')}
document.addEventListener('click',e=>{const b=e.target.closest('[data-talk]'); if(b){e.preventDefault(); VC.on?vcStop():vcStart()}});
/* ---------- PROJECT CATALOG ---------- */
const LV=[null,{en:'Starter',bn:'শুরু'},{en:'Explorer',bn:'অভিযাত্রী'},{en:'Maker',bn:'মেকার'}];
function lvChip(p){return `<span class="chip lv lv${p.level}">${'●'.repeat(p.level)}${'○'.repeat(3-p.level)} ${L(LV[p.level])}</span>`}
function projCard(p){const d=projDone(p.id); return `<div class="pcard" data-proj="${p.id}">${bg(p.color)}<div class="pc-in"><div class="row sb">${lvChip(p)}${d?'<span class="chip lime">✓</span>':`<span class="chip ghost">${p.mins}′</span>`}</div><div class="pc-art">${partThumb(p.hero,96)}</div><b>${esc(L(p.title))}</b><span>${esc(L(p.tag))}</span><div class="pc-parts">${p.parts.slice(0,5).map(([id])=>`<i title="${esc(LIB[id].name)}">${partThumb(id,24)}</i>`).join('')}</div></div><div class="rim"></div></div>`}
function bindProjCards(root){root.querySelectorAll('[data-proj]').forEach(c=>c.onclick=()=>openProject(c.dataset.proj))}
function projPlan(p){return {title:L(p.title),summary:L(p.tag),parts:p.parts.map(([id,qty])=>({id,qty,why:LIB[id].desc})),steps:p.steps,flow:p.flow.map(([type,text,yes,no])=>({type,text,yes,no})),questions:p.questions}}
function openProject(id){const p=PROJ.LIST.find(x=>x.id===id); if(!p)return; const keep=P.projects&&P.projects[id];
  if(P.project&&P.project.cat){P.projects={...(P.projects||{}),[P.project.cat]:P.project}} else if(P.project&&P.project.goal)P.customProj=P.project;
  P.project=keep||{cat:id,goal:L(p.title),plan:projPlan(p),done:{}}; P.project.plan=projPlan(p); S.ptab='plan'; save(); go('project')}
function renderProjects(){
  const bn=BN(); $('#app').className='page in'; const cats=['All',...new Set(PROJ.LIST.map(p=>p.cat))]; let cat='All', lv=0;
  const done=PROJ.LIST.filter(p=>projDone(p.id)).length;
  $('#app').innerHTML=`<div class="ph"><div><div class="ph-k">${bn?'প্রজেক্ট':'Projects'}</div><h1>${bn?'আসল জিনিস বানাও':'Build real things'}</h1><p class="muted">${bn?'প্রতিটা প্রজেক্টে গল্প, পার্টস, তারের ছক, ফ্লোচার্ট, হিন্ট আর একটা অটো-চেক আছে। ইন্সট্রাক্টর পথ দেখায়, কোড লেখো তুমি।':'Each project has a story, parts, wiring, a flowchart, hints and an auto-check that tests your real circuit and code. Instructor guides; you write the code.'}</p></div>
    <div class="pmeter"><div class="dn">${String(done).padStart(2,'0')}<small>/${PROJ.LIST.length}</small></div><span class="muted">${bn?'প্রজেক্ট শেষ':'projects done'}</span>${ticks(done/PROJ.LIST.length,30,6,'#E8FF1F')}</div></div>
   <div class="row sb wrap" style="gap:10px;margin-bottom:14px"><div class="tabs3" id="pcat" style="margin:0">${cats.map(c=>`<button class="${c==='All'?'on':''}">${c}</button>`).join('')}</div><div class="seg2" id="plv">${[0,1,2,3].map(i=>`<button data-l="${i}" class="${i===0?'on':''}">${i?L(LV[i]):(bn?'সব লেভেল':'All levels')}</button>`).join('')}</div></div>
   <div class="pgrid2" id="pg"></div>
   <section class="card wide pidea">${bg('graph')}<div class="in-c"><div class="row sb wrap" style="gap:16px"><div><div class="ttl">${bn?'নিজের আইডিয়া আছে?':'Got your own idea?'}</div><p class="muted" style="margin-top:6px;max-width:520px">${bn?'লিখে ফেলো। ইন্সট্রাক্টর পার্টস, ধাপ আর ফ্লোচার্ট বানাবে, তুমি কোড লিখবে।':'Describe it. Instructor plans the parts, steps and a flowchart from the 52-part library; you write the code.'}</p></div><div class="row" style="gap:8px;flex:1;max-width:560px"><input class="inp" id="pidea" placeholder="${bn?'যেমন: দরজা খুললে মেসেজ দেবে':'e.g. a box that beeps when someone opens it'}"><button class="btn-w" id="pgo">${I(IC.spark,14)} ${bn?'প্ল্যান':'Plan it'}</button></div></div></div><div class="rim"></div></section>`;
  const draw=()=>{const L0=PROJ.LIST.filter(p=>(cat==='All'||p.cat===cat)&&(!lv||p.level===lv)); $('#pg').innerHTML=L0.map(projCard).join(''); bindProjCards($('#pg'))};
  $$('#pcat button').forEach(b=>b.onclick=()=>{cat=b.textContent; $$('#pcat button').forEach(x=>x.classList.toggle('on',x===b)); draw()});
  $$('#plv button').forEach(b=>b.onclick=()=>{lv=+b.dataset.l; $$('#plv button').forEach(x=>x.classList.toggle('on',x===b)); draw()}); draw();
  $('#pgo').onclick=()=>{const g=$('#pidea').value.trim(); if(!g)return toast(bn?'আগে আইডিয়া লেখো':'Write your idea first'); if(P.project&&P.project.cat)P.projects={...(P.projects||{}),[P.project.cat]:P.project}; P.project={goal:g,plan:null}; save(); go('project'); setTimeout(()=>makePlan(g),50)};
  quick(bn?['কোন প্রজেক্ট দিয়ে শুরু করবো?','গাড়ি বানাতে কী লাগে?']:['Which project should I start with?','What do I need for a robot car?']);
}
function partModal(id){const bn=BN(), p=LIB[id], h=PROJ.HOW[id]||{}; const used=PROJ.LIST.filter(x=>x.parts.some(([q])=>q===id)||x.hero===id);
  const m=document.createElement('div'); m.className='pmodal'; m.innerHTML=`<div class="pm-card"><button class="pm-x" aria-label="Close">×</button><div class="pm-art">${partThumb(id,260)}</div><div class="pm-b"><div class="row" style="gap:6px"><span class="chip ghost">${esc(p.cat)}</span><span class="st2 ${p.sim==='full'?'on':''}">${p.sim==='full'?(bn?'সিমুলেটেড':'Simulated'):(bn?'প্ল্যান':'Plan only')}</span></div><h2>${esc(p.name)}</h2>
    <div class="cap">${bn?'কীভাবে কাজ করে':'How it works'}</div><p>${esc(L(h.en?h:{en:p.desc,bn:p.desc}))}</p>${h.en?`<p class="muted sm">${esc(p.desc)}</p>`:''}
    <div class="cap">${bn?'পিন':'Pins'}</div><div class="row wrap" style="gap:5px">${Object.keys(p.pins||{}).slice(0,30).map(n=>`<span class="tag">${esc(n)}</span>`).join('')}</div>
    ${h.code?`<div class="cap">${bn?'কোডে':'In code'}</div><code class="pm-code">${esc(h.code)}</code><p class="muted sm">${esc(explain(h.code,P.lang)||'')}</p>`:''}
    ${used.length?`<div class="cap">${bn?'যে প্রজেক্টে লাগে':'Used in projects'}</div><div class="row wrap" style="gap:6px">${used.map(u=>`<button class="chip-btn" data-proj="${u.id}">${esc(L(u.title))}</button>`).join('')}</div>`:''}
    <div class="row" style="gap:8px;margin-top:18px"><button class="btn-w sm" data-add="${id}">${bn?'ল্যাবে চালিয়ে দেখো':'Try it in the lab'} →</button><button class="btn-o sm" data-ask="${id}">${I(IC.bot,13)} ${bn?'ইন্সট্রাক্টরকে জিজ্ঞেস':'Ask Instructor'}</button><button class="say2" data-say="${esc(L(h.en?h:{en:p.desc,bn:p.desc}))}">${I(IC.vol,14)}</button></div></div></div>`;
  document.body.appendChild(m); const close=()=>m.remove(); m.onclick=e=>{if(e.target===m)close()}; m.querySelector('.pm-x').onclick=close; bindSay(m);
  m.querySelectorAll('[data-proj]').forEach(b=>b.onclick=()=>{close(); openProject(b.dataset.proj)});
  m.querySelector('[data-add]').onclick=()=>{close(); P.free=P.free||{}; P.free.pending=[...(P.free.pending||[]),...(LIB.esp32&&id!=='esp32'&&!(P.free.sim&&P.free.sim.comps&&P.free.sim.comps.some(c=>c.type==='esp32'))?['esp32']:[]),id]; save(); go('lab'); toast(p.name+(bn?' ল্যাবে যোগ হয়েছে':' added to the lab'))};
  m.querySelector('[data-ask]').onclick=()=>{close(); ask((bn?'এটা কীভাবে কাজ করে আর ESP32 এ কীভাবে লাগাবো: ':'How does this work and how do I wire it to the ESP32: ')+p.name)};
  const k=e=>{if(e.key==='Escape'){close(); removeEventListener('keydown',k)}}; addEventListener('keydown',k)}
/* ---------- PART LIBRARY ---------- */
function renderLibrary(){
  const bn=BN(); $('#app').className='page in'; const cats=['All',...new Set(PARTS.map(id=>LIB[id].cat))]; let cat='All', q='';
  $('#app').innerHTML=`<div class="ph"><div><div class="ph-k">${bn?'পার্টস লাইব্রেরি':'Part library'}</div><h1>${PARTS.length} ${bn?'রোবটিক্স পার্টস':'robotics parts'}</h1><p class="muted">${bn?'প্রতিটা পার্টের ছবি ইন্সট্রাক্টরের নিজের আঁকা। "ল্যাবে যোগ করো" চাপলে সিমুলেটরে চলে যাবে।':'Every part is an original Botstructor illustration. "Add to lab" drops it into the simulator.'}</p></div><div class="search"><span>${I(IC.search,15)}</span><input id="libq" placeholder="${bn?'খুঁজুন: sonar, motor, light…':'Search: sonar, motor, light…'}"></div></div>
   <div class="tabs3" id="libc">${cats.map(c=>`<button class="${c==='All'?'on':''}">${c}</button>`).join('')}</div><div class="libgrid" id="libg"></div>`;
  const draw=()=>{const ql=q.toLowerCase(); const items=PARTS.filter(id=>(cat==='All'||LIB[id].cat===cat)&&(!ql||(LIB[id].name+' '+LIB[id].tags+' '+LIB[id].desc+' '+id).toLowerCase().includes(ql)));
    $('#libg').innerHTML=items.map(id=>{const p=LIB[id]; return `<div class="lcard2"><div class="lc-img" data-how="${id}" title="${bn?'কীভাবে কাজ করে':'How it works'}">${partThumb(id,120)}<span class="lc-how">${bn?'কীভাবে কাজ করে':'How it works'} →</span></div><div class="lc-b"><div class="row sb"><b>${esc(p.name)}</b><span class="st2 ${p.sim==='full'?'on':''}">${p.sim==='full'?(bn?'সিমুলেটেড':'Simulated'):(bn?'প্ল্যান':'Plan only')}</span></div><span class="muted sm">${p.cat} · ${Object.keys(p.pins).length>40?'—':Object.keys(p.pins).length+' '+(bn?'পিন':'pins')}</span><p>${esc(p.desc||'')}</p>
      <div class="row" style="gap:6px"><button class="btn-w xs" data-add="${id}">${bn?'ল্যাবে যোগ করো':'Add to lab'}</button><button class="btn-o xs" data-how="${id}">${bn?'কীভাবে কাজ করে':'How it works'}</button></div></div></div>`}).join('')||`<div class="kempty">${bn?'কিছু পাওয়া যায়নি':'No part found.'}</div>`;
    $$('[data-add]').forEach(b=>b.onclick=()=>{P.free=P.free||{}; P.free.pending=[...(P.free.pending||[]),b.dataset.add]; save(); go('lab'); toast((LIB[b.dataset.add].name)+(bn?' ল্যাবে যোগ হয়েছে':' added to the lab'))});
    $$('[data-ask]').forEach(b=>b.onclick=()=>ask((bn?'এটা কী আর কীভাবে লাগাবো: ':'What is this and how do I wire it to the ESP32: ')+LIB[b.dataset.ask].name));
    $$('#libg [data-how]').forEach(b=>b.onclick=()=>partModal(b.dataset.how))};
  $('#libq').oninput=e=>{q=e.target.value; draw()}; $$('#libc button').forEach(b=>b.onclick=()=>{cat=b.textContent; $$('#libc button').forEach(x=>x.classList.toggle('on',x===b)); draw()}); draw();
  quick(bn?['রোবট গাড়ির জন্য কোন পার্টস?','সেন্সর কী?']:['Which parts for a robot car?','What is a sensor?']);
}
/* ---------- CODE DICTIONARY ---------- */
function renderDict(){
  const bn=BN(); $('#app').className='page in'; const groups=['All',...new Set(SYN.map(e=>e.g))]; let g='All', q='';
  $('#app').innerHTML=`<div class="ph"><div><div class="ph-k">${bn?'কোড ডিকশনারি':'Code dictionary'}</div><h1>${bn?'কোন কোড কী করে':'Which code does what'}</h1><p class="muted">${bn?'প্রতিটা শব্দ সহজ ভাষায়, উদাহরণ সহ। 🔊 চাপলে শুনতে পাবে।':'Every word in plain language, with an example explained line by line. Tap 🔊 to hear it.'}</p></div><div class="search"><span>${I(IC.search,15)}</span><input id="dictq" placeholder="${bn?'খুঁজুন: delay, if, servo…':'Search: delay, if, servo…'}"></div></div>
    <div class="tabs3" id="dg">${groups.map(x=>`<button class="${x==='All'?'on':''}">${x}</button>`).join('')}</div><div class="syngrid" id="dgrid"></div>
    <div class="scard pad" style="margin-top:16px"><div class="sc-t">${bn?'নিজের কোডের লাইন বুঝে নাও':'Explain any line'}</div><p class="muted">${bn?'যেকোনো এক লাইন কোড লেখো, ইন্সট্রাক্টর বলবে সেটা কী করে।':'Type one line of code and Instructor says what it does.'}</p><input class="inp mono" id="exIn" placeholder="digitalWrite(23, HIGH);"><div id="exOut" class="msg" style="display:none"></div></div>`;
  const draw=()=>{const ql=q.toLowerCase(); $('#dgrid').innerHTML=SYN.filter(e=>(g==='All'||e.g===g)&&(!ql||(e.k+' '+e.sig+' '+L(e)).toLowerCase().includes(ql))).map(synCard).join(''); bindSay($('#dgrid'))};
  $('#dictq').oninput=e=>{q=e.target.value; draw()}; $$('#dg button').forEach(b=>b.onclick=()=>{g=b.textContent; $$('#dg button').forEach(x=>x.classList.toggle('on',x===b)); draw()}); draw();
  $('#exIn').oninput=e=>{const x=explain(e.target.value,P.lang); const o=$('#exOut'); o.style.display=e.target.value.trim()?'flex':'none'; o.innerHTML=`<div>${esc(x||(bn?'এই লাইনটা চিনতে পারিনি। ইন্সট্রাক্টরকে জিজ্ঞেস করো।':'I don’t know this line yet. Ask Instructor below.'))}</div>`};
  quick(bn?['= আর == এর পার্থক্য?','; কেন লাগে?','delay কী করে?']:['What is the difference between = and ==?','Why do I need ;?','What does delay do?']);
}
/* ---------- visuals ---------- */
const V={
 tookie:()=>`<img src="tookie.png" alt="robot" style="filter:drop-shadow(0 30px 40px #000c)">`,
 loop:()=>`<svg viewBox="0 0 420 300"><rect x="40" y="110" width="80" height="80" rx="10" fill="#1A1D23" stroke="#3A3F4A"/><rect x="52" y="128" width="56" height="44" rx="6" fill="#C9A227"/><text x="80" y="214" fill="#8A919E" font-size="12" text-anchor="middle">battery</text><text x="128" y="128" fill="#FF5A4E" font-weight="800">+</text><text x="128" y="186" fill="#AEB4BF" font-weight="800">−</text>
  <circle cx="320" cy="150" r="46" fill="#C9CED6"/><circle cx="320" cy="150" r="34" fill="#2A2E36"/><path d="M320 120 l8 30 -8 30 -8 -30z" fill="#FF7A1A"><animateTransform attributeName="transform" type="rotate" from="0 320 150" to="360 320 150" dur="1.2s" repeatCount="indefinite"/></path><text x="320" y="216" fill="#8A919E" font-size="12" text-anchor="middle">motor</text>
  <path d="M120 124 H200 V60 H320 V104" stroke="#FF5A4E" stroke-width="4" fill="none"/><path d="M320 196 V250 H200 V176 H120" stroke="#5D6470" stroke-width="4" fill="none"/>
  <path d="M120 124 H200 V60 H320 V104 M320 196 V250 H200 V176 H120" stroke="#D7FF3A" stroke-width="2" fill="none" class="dash"/><text x="210" y="50" fill="#D7FF3A" font-size="12" font-family="Geist Mono, ui-monospace, monospace">current →</text></svg>`,
 switch:()=>`<svg viewBox="0 0 420 260"><g transform="translate(40 60)"><rect width="140" height="60" rx="14" fill="#20242B" stroke="#3A3F4A"/><rect x="16" y="16" width="108" height="28" rx="14" fill="#0E1013"/><circle cx="40" cy="30" r="14" fill="#8A919E"/><text x="70" y="96" fill="#8A919E" text-anchor="middle" font-family="Geist Mono, ui-monospace, monospace" font-size="13">OFF · gate open</text></g>
  <g transform="translate(240 60)"><rect width="140" height="60" rx="14" fill="#20242B" stroke="#3A3F4A"/><rect x="16" y="16" width="108" height="28" rx="14" fill="#3DF58A33"/><circle cx="100" cy="30" r="14" fill="#3DF58A"/><text x="70" y="96" fill="#3DF58A" text-anchor="middle" font-family="Geist Mono, ui-monospace, monospace" font-size="13">ON · current flows</text></g></svg>`,
 water:()=>`<svg viewBox="0 0 420 280"><path d="M80 140 C80 60,340 60,340 140 C340 220,80 220,80 140" stroke="#3DA8FF" stroke-width="16" fill="none" opacity=".35"/><path d="M80 140 C80 60,340 60,340 140 C340 220,80 220,80 140" stroke="#3DDCFF" stroke-width="3" fill="none" class="dash"/>
  <rect x="50" y="110" width="60" height="60" rx="10" fill="#1A1D23" stroke="#3A3F4A"/><text x="80" y="146" fill="#ECEEF2" text-anchor="middle" font-size="12">pump</text><circle cx="340" cy="140" r="30" fill="#14171C" stroke="#3DDCFF"/><text x="340" y="145" fill="#ECEEF2" text-anchor="middle" font-size="12">wheel</text><rect x="196" y="66" width="28" height="22" rx="4" fill="#FF7A1A"/><text x="210" y="56" fill="#FF7A1A" text-anchor="middle" font-size="12">tap = switch</text></svg>`,
 phone:()=>`<svg viewBox="0 0 420 280"><rect x="40" y="40" width="110" height="200" rx="20" fill="#14171C" stroke="#3A3F4A"/><circle cx="95" cy="170" r="34" fill="#0A0C0F" stroke="#D7FF3A"/><path d="M95 146 l8 12 h-16z M95 194 l8 -12 h-16z M71 170 l12 -8 v16z M119 170 l-12 -8 v16z" fill="#D7FF3A"/><text x="95" y="80" fill="#8A919E" text-anchor="middle" font-size="12">your phone</text>
  <path d="M170 140 q40 -40 80 0" stroke="#3DDCFF" stroke-width="2.5" fill="none" class="dash"/><text x="210" y="112" fill="#3DDCFF" text-anchor="middle" font-family="Geist Mono, ui-monospace, monospace" font-size="11">Bluetooth</text><image href="tookie.png" x="250" y="60" width="150" height="180"/></svg>`,
 chip:()=>`<svg viewBox="0 0 420 280"><rect x="140" y="70" width="140" height="140" rx="14" fill="#1A1E25" stroke="#3A3F4A"/>${Array.from({length:7},(_,i)=>`<rect x="${152+i*18}" y="54" width="8" height="16" fill="#C9A227"/><rect x="${152+i*18}" y="210" width="8" height="16" fill="#C9A227"/><rect x="124" y="${82+i*18}" width="16" height="8" fill="#C9A227"/><rect x="280" y="${82+i*18}" width="16" height="8" fill="#C9A227"/>`).join('')}<text x="210" y="138" fill="#ECEEF2" text-anchor="middle" font-weight="800" font-size="16">CPU + memory</text><text x="210" y="160" fill="#8A919E" text-anchor="middle" font-size="12">+ pins in one chip</text><text x="210" y="260" fill="#D7FF3A" text-anchor="middle" font-family="Geist Mono, ui-monospace, monospace" font-size="12">code in → actions out</text></svg>`,
 esp32chips:()=>`<div style="padding:24px;display:flex;flex-direction:column;gap:12px;align-items:center"><img src="tookie.png" style="height:150px"><div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">${['Wi-Fi','Bluetooth','2 cores · 240 MHz','30 pins','3.3 V logic','Arduino IDE'].map(x=>`<span class="tag ${/Wi|Blue/.test(x)?'lime':''}">${x}</span>`).join('')}</div></div>`,
 digital:()=>`<svg viewBox="0 0 420 260"><text x="20" y="40" fill="#D7FF3A" font-family="Geist Mono, ui-monospace, monospace" font-size="12">DIGITAL · HIGH / LOW</text><path d="M20 110 H70 V60 H140 V110 H200 V60 H260 V110 H330 V60 H400" stroke="#D7FF3A" stroke-width="3" fill="none"/>
  <text x="20" y="160" fill="#3DDCFF" font-family="Geist Mono, ui-monospace, monospace" font-size="12">ANALOG · 0 … 4095</text><path d="M20 220 C60 170,100 170,140 210 S220 250,260 200 S340 160,400 190" stroke="#3DDCFF" stroke-width="3" fill="none"/></svg>`,
 parts:()=>`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:20px;width:100%">${[['ESP32','the brain'],['Breadboard','no soldering'],['LED','the light'],['220 Ω resistor','protects the LED'],['Jumper wires','connections'],['USB cable','power + upload']].map(([a,b])=>`<div style="border:1px solid #2A2F38;border-radius:12px;padding:12px"><b>${a}</b><div style="color:#8A919E;font-size:12.5px">${b}</div></div>`).join('')}</div>`,
 breadboard:()=>{let s=`<svg viewBox="0 0 440 260"><rect x="10" y="10" width="420" height="240" rx="10" fill="#ECEEF1"/><rect x="20" y="126" width="400" height="10" fill="#D5D9DF"/>`;
  for(let c=0;c<26;c++)for(let r=0;r<10;r++){const x=34+c*15, y=52+r*15+(r>4?16:0); const hl=c===6&&r<5; const hl2=c===14&&r>4; s+=`<rect x="${x-3}" y="${y-3}" width="6" height="6" rx="1" fill="${hl?'#3DDCFF':hl2?'#FF7A1A':'#3A3F48'}"/>`}
  for(let c=0;c<26;c++){s+=`<rect x="${31+c*15}" y="20" width="6" height="6" rx="1" fill="#FF5A4E"/><rect x="${31+c*15}" y="33" width="6" height="6" rx="1" fill="#3DA8FF"/>`}
  s+=`<rect x="${34+6*15-6}" y="44" width="12" height="76" rx="6" fill="none" stroke="#3DDCFF" stroke-width="2"/><rect x="${34+14*15-6}" y="${52+5*15+16-8}" width="12" height="76" rx="6" fill="none" stroke="#FF7A1A" stroke-width="2"/><text x="220" y="246" text-anchor="middle" fill="#5D6470" font-size="11">each highlighted column of 5 is one connection</text></svg>`; return s},
 ledleg:()=>`<svg viewBox="0 0 420 280"><path d="M160 150 V240" stroke="#B8BEC7" stroke-width="5"/><path d="M200 150 V215" stroke="#B8BEC7" stroke-width="5"/><path d="M150 150 V90 a30 30 0 0 1 60 0 V150 z" fill="#FF4D3D"/><circle cx="180" cy="95" r="70" fill="#FF4D3D22"/><rect x="144" y="146" width="72" height="10" rx="3" fill="#C0453F"/>
  <text x="120" y="246" fill="#FF5A4E" font-weight="800" text-anchor="end">long leg +</text><text x="214" y="222" fill="#AEB4BF" font-weight="800">short leg −</text><g transform="translate(270 110)"><rect width="110" height="26" rx="12" fill="#D9C7A3"/><rect x="26" width="8" height="26" fill="#E2241A"/><rect x="44" width="8" height="26" fill="#E2241A"/><rect x="62" width="8" height="26" fill="#5A3A1E"/><text x="55" y="50" fill="#8A919E" text-anchor="middle" font-size="12">220 Ω resistor</text></g></svg>`,
 setuploop:()=>`<svg viewBox="0 0 420 300"><rect x="30" y="40" width="360" height="80" rx="14" fill="#14171C" stroke="#3DDCFF"/><text x="50" y="72" fill="#3DDCFF" font-family="Geist Mono, ui-monospace, monospace" font-size="15">void setup() { }</text><text x="50" y="98" fill="#8A919E" font-size="13">runs ONCE · give every pin its job</text>
  <rect x="30" y="160" width="360" height="100" rx="14" fill="#14171C" stroke="#D7FF3A"/><text x="50" y="192" fill="#D7FF3A" font-family="Geist Mono, ui-monospace, monospace" font-size="15">void loop() { }</text><text x="50" y="218" fill="#8A919E" font-size="13">runs FOREVER · what keeps happening</text>
  <path d="M360 236 a26 26 0 1 1 0 -50" stroke="#D7FF3A" stroke-width="2.5" fill="none" class="dash"/><path d="M210 120 V158" stroke="#5D6470" stroke-width="2.5"/></svg>`,
 weak:()=>`<svg viewBox="0 0 420 280"><rect x="30" y="80" width="90" height="120" rx="10" fill="#171C24" stroke="#2C3442"/><text x="75" y="146" fill="#ECEEF2" text-anchor="middle" font-weight="800">ESP32</text><text x="75" y="226" fill="#8A919E" text-anchor="middle" font-size="12">~20 mA per pin</text>
  <rect x="160" y="90" width="110" height="100" rx="10" fill="#C62828"/><text x="215" y="146" fill="#fff" text-anchor="middle" font-weight="800">L298N</text><text x="215" y="226" fill="#8A919E" text-anchor="middle" font-size="12">up to 2 A</text>
  <circle cx="350" cy="140" r="40" fill="#C9CED6"/><circle cx="350" cy="140" r="28" fill="#2A2E36"/><path d="M350 116 l7 24 -7 24 -7 -24z" fill="#FF7A1A"><animateTransform attributeName="transform" type="rotate" from="0 350 140" to="360 350 140" dur="1s" repeatCount="indefinite"/></path>
  <path d="M120 140 H160" stroke="#3DDCFF" stroke-width="2" class="dash"/><path d="M270 140 H310" stroke="#D7FF3A" stroke-width="6"/></svg>`,
 truth:()=>`<div style="padding:22px;width:100%"><table style="width:100%;border-collapse:collapse;font-family:Geist Mono;font-size:13px">${[['IN1','IN2','left motor'],['HIGH','LOW','forward ⟳'],['LOW','HIGH','backward ⟲'],['LOW','LOW','stop'],].map((r,i)=>`<tr>${r.map(c=>`<td style="padding:10px;border-bottom:1px solid #1F232A;color:${i?'#ECEEF2':'#5D6470'}">${c}</td>`).join('')}</tr>`).join('')}</table><p style="color:#8A919E;font-size:13px;margin-top:12px">ENA = speed with <code style="color:#D7FF3A">analogWrite(ENA, 0–255)</code>. Right motor: IN3, IN4, ENB.</p></div>`,
 serial:()=>`<div style="width:100%;padding:18px"><div class="mock"><div class="mt"><i></i><i></i><i></i> Serial Monitor · 115200 baud</div><div class="mb" style="color:#3DF58A;min-height:150px">Robot is awake!<br>button: 1<br>button: 1<br>button: 0  ← pressed<br>button: 0<br>button: 1</div></div></div>`,
 btwifi:()=>`<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:20px;width:100%">${[['Bluetooth','Phone → ESP32 directly','~10 m','Simple apps'],['Wi-Fi','Web page or app','Room or house','Works with iPhone too']].map(r=>`<div style="border:1px solid #2A2F38;border-radius:14px;padding:14px"><b style="font-size:18px">${r[0]}</b>${r.slice(1).map(x=>`<div style="color:#8A919E;font-size:13px;margin-top:6px">· ${x}</div>`).join('')}</div>`).join('')}</div>`
};

/* ---------- ESP32 pin explorer data ---------- */
const PIN_TYPES={
 power:{c:'#FF5A4E',en:'Power: 3V3 out, VIN in',bn:'পাওয়ার: 3V3 আউট, VIN ইন',pins:['3V3','VIN'],info:{en:'3V3 gives 3.3 V out (1 pin). VIN takes 5 V in to power the board (1 pin).',bn:'3V3 থেকে 3.3 V বের হয় (১টা)। VIN দিয়ে বোর্ডে 5 V দেওয়া যায় (১টা)।'}},
 gnd:{c:'#AEB4BF',en:'Ground (GND)',bn:'গ্রাউন্ড (GND)',pins:['GND','GND2'],info:{en:'GND is the 0 V return path. 2 GND pins, one on each side. Every part shares it.',bn:'GND হলো 0 V ফেরার পথ। দুই পাশে ১টা করে, মোট ২টা। সব পার্টস এটা শেয়ার করে।'}},
 digital:{c:'#D7FF3A',en:'Digital in/out (GPIO)',bn:'ডিজিটাল ইন/আউট (GPIO)',pins:['D32','D33','D25','D26','D27','D14','D12','D13','D23','D22','D21','D19','D18','D5','TX2','RX2','D4','D2','D15'],info:{en:'HIGH or LOW: switch LEDs and motor drivers, read buttons. Use digitalWrite / digitalRead.',bn:'HIGH বা LOW: LED আর মোটর ড্রাইভার চালাও, বাটন পড়ো। digitalWrite / digitalRead।'}},
 analog:{c:'#3DDCFF',en:'Analog in (ADC)',bn:'অ্যানালগ ইন (ADC)',pins:['VP','VN','D34','D35','D32','D33','D25','D26','D27','D14','D12','D13','D4','D2','D15'],info:{en:'15 pins read a voltage as 0–4095 with analogRead(). ADC2 pins (25, 26, 27, 14, 12, 13, 4, 2, 15) do not work while Wi-Fi is on.',bn:'১৫টা পিন analogRead() দিয়ে ভোল্টেজকে 0–4095 সংখ্যায় পড়ে। Wi-Fi চালু থাকলে ADC2 পিন (25, 26, 27, 14, 12, 13, 4, 2, 15) কাজ করে না।'}},
 pwm:{c:'#A98BFF',en:'PWM (speed / brightness)',bn:'PWM (গতি / উজ্জ্বলতা)',pins:['D32','D33','D25','D26','D27','D14','D12','D13','D23','D22','D21','D19','D18','D5','TX2','RX2','D4','D2','D15'],info:{en:'analogWrite(pin, 0–255) on any output pin: dim an LED or set motor speed.',bn:'যেকোনো আউটপুট পিনে analogWrite(pin, 0–255): LED কম-বেশি জ্বালাও, মোটরের গতি দাও।'}},
 input:{c:'#FF7A1A',en:'Input only',bn:'শুধু ইনপুট',pins:['VP','VN','D34','D35'],info:{en:'34, 35, 36 (VP) and 39 (VN) can only read. 4 pins. Don’t use them for LEDs or motors.',bn:'34, 35, 36 (VP) আর 39 (VN) শুধু পড়তে পারে। ৪টা পিন। LED বা মোটরের জন্য ব্যবহার করো না।'}},
 touch:{c:'#3DF58A',en:'Touch sensing',bn:'টাচ সেন্সিং',pins:['D4','D2','D15','D13','D12','D14','D27','D33','D32'],info:{en:'9 pins can feel your finger with touchRead(). Great for a touch-reactive robot!',bn:'৯টা পিন touchRead() দিয়ে আঙুলের ছোঁয়া বোঝে। টাচ-রিঅ্যাক্টিভ রোবটের জন্য দারুণ!'}}};
function espDiagram(hl,color){
  const F='font-family="Geist Mono, ui-monospace, Menlo, monospace"';
  let s=`<svg viewBox="0 0 520 400"><rect x="150" y="10" width="220" height="380" rx="14" fill="#171C24" stroke="#2C3442"/><rect x="222" y="20" width="76" height="26" rx="4" fill="#232B37"/><path d="M228 40 h8 v-12 h8 v12 h8 v-12 h8 v12 h8 v-12 h8 v12 h8 v-12 h8 v12" stroke="#C9A227" stroke-width="2.5" fill="none"/><rect x="222" y="56" width="76" height="96" rx="5" fill="#B9BFC8"/><text x="260" y="108" text-anchor="middle" font-weight="800" fill="#2C3138" font-size="14">ESP32</text><rect x="236" y="356" width="48" height="30" rx="5" fill="#9AA1AC"/><text x="260" y="398" text-anchor="middle" fill="#5D6470" font-size="10">USB</text>`;
  const row=(arr,left)=>arr.forEach((p,i)=>{const y=40+i*22.5, on=hl.includes(p), x=left?164:356; const lab=p==='GND2'?'GND':p;
    s+=`<circle cx="${x}" cy="${y}" r="${on?6.5:4.5}" fill="${on?color:'#5D6470'}" ${on?`style="filter:drop-shadow(0 0 6px ${color})"`:''}/><text x="${left?176:344}" y="${y+4}" text-anchor="${left?'start':'end'}" ${F} font-size="11" fill="${on?'#fff':'#8A919E'}" font-weight="${on?700:400}">${lab}</text>`;
    if(on){const tx=left?144:376; const g=gpioOf(p); s+=`<text x="${tx}" y="${y+4}" text-anchor="${left?'end':'start'}" ${F} font-size="10.5" fill="${color}">${g!==null?'GPIO '+g:lab}</text>`}});
  row(ESP_L,true); row(ESP_R,false); return s+'</svg>'}

/* ---------- photo / video verification ---------- */
async function shrink(blob,max=1024){const img=await createImageBitmap(blob); const k=Math.min(1,max/Math.max(img.width,img.height)); const c=document.createElement('canvas'); c.width=Math.round(img.width*k); c.height=Math.round(img.height*k); c.getContext('2d').drawImage(img,0,0,c.width,c.height); return await new Promise(r=>c.toBlob(r,'image/jpeg',0.82))}
async function videoFrames(file,n=4){const v=document.createElement('video'); v.muted=true; v.playsInline=true; v.src=URL.createObjectURL(file);
  await new Promise((res,rej)=>{v.onloadedmetadata=res; v.onerror=()=>rej(new Error('This video format can’t be opened here. Try an MP4.'))});
  const out=[]; const d=v.duration||1; for(let i=0;i<n;i++){v.currentTime=Math.min(d-0.05,d*(0.1+0.8*i/(n-1))); await new Promise(r=>v.onseeked=r);
    const c=document.createElement('canvas'); const k=Math.min(1,768/Math.max(v.videoWidth,v.videoHeight)); c.width=Math.round(v.videoWidth*k); c.height=Math.round(v.videoHeight*k); c.getContext('2d').drawImage(v,0,0,c.width,c.height); out.push(await new Promise(r=>c.toBlob(r,'image/jpeg',0.8)))}
  return out}
function renderMediaStep(st,host,kind){
  const bn=P.lang==='bn'; const prev=P.media[st.id];
  host.innerHTML=`<div class="cardgrid"><div><label class="drop" id="drop"><input type="file" accept="${kind==='photo'?'image/*':'video/*'}" ${kind==='photo'?'capture="environment"':''} hidden id="file"><b>${kind==='photo'?(bn?'ছবি তোলো বা বেছে নাও':'Take or choose a photo'):(bn?'ভিডিও রেকর্ড করো বা বেছে নাও':'Record or choose a video')}</b>${bn?'এখানে চাপো বা ফাইল টেনে আনো':'Tap here, or drop a file'}</label>
    <div class="lab-h" style="margin:14px 0 6px">${bn?'ইন্সট্রাক্টর যা দেখবে':'What Instructor will look for'}</div><div class="checks" id="checks">${st.checklist.map(c=>`<div><i>·</i>${esc(c)}</div>`).join('')}</div>
    <div id="mres">${prev?`<div class="msg ${prev.ok?'ok':'bad'}"><div><b>${prev.ok?(bn?'যাচাই হয়েছে':'Verified'):(bn?'আগের ফলাফল':'Last result')}</b>${esc(prev.feedback)}</div></div>`:''}</div>
    <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap"><button class="cta" id="send" disabled>${bn?'ইন্সট্রাক্টরকে পাঠাও':'Send to Instructor'}</button><button class="cta ghost sm hidden" id="anyway">${bn?'পরে দেখাবো, এগিয়ে যাও':'Continue anyway'}</button></div></div>
   <div><div class="preview" id="pv" style="min-height:280px"><span style="color:var(--dim);font-family:var(--mono);font-size:12px">${kind==='photo'?'PHOTO PREVIEW':'VIDEO PREVIEW'}</span></div><div class="frames" id="frames"></div></div></div>`;
  let file=null; const pick=f=>{if(!f)return; file=f; const url=URL.createObjectURL(f); $('#pv').innerHTML=kind==='photo'?`<img src="${url}">`:`<video src="${url}" controls muted playsinline></video>`; $('#send').disabled=false; $('#frames').innerHTML=''};
  $('#file').onchange=e=>pick(e.target.files[0]);
  const drop=$('#drop'); drop.addEventListener('dragover',e=>{e.preventDefault()}); drop.addEventListener('drop',e=>{e.preventDefault(); pick(e.dataTransfer.files[0])});
  $('#anyway').onclick=()=>{markDone(st); P.media[st.id]={ok:false,feedback:bn?'জমা দেওয়া হয়েছে, শিক্ষক দেখবেন।':'Submitted for your teacher to review.'}; save(); toast(bn?'ঠিক আছে, পরে দেখাও':'OK, you can show it later')};
  $('#send').onclick=async()=>{const b=$('#send'); b.disabled=true; b.innerHTML=`<span class="spin"></span> ${bn?'ইন্সট্রাক্টর দেখছে…':'Instructor is looking…'}`;
    let imgs=[]; try{ if(kind==='photo')imgs=[await shrink(file)]; else {imgs=await videoFrames(file); $('#frames').innerHTML=imgs.map(i=>`<img src="${URL.createObjectURL(i)}">`).join('')} }catch(e){b.disabled=false; b.textContent=bn?'আবার পাঠাও':'Send again'; $('#mres').innerHTML=`<div class="msg bad"><div>${esc(e.message)}</div></div>`; return}
    let v=null;
    try{ if(!S.sample||!S.imgs)throw new Error('offline');
      v=await askJSON(`${RULES()}\n\nYou are checking a ${kind==='photo'?'photo':'video (shown as '+imgs.length+' frames in time order)'} that a beginner sent of their REAL build for the step "${st.title.en}".\nExpected: ${st.expect}\nCheck each item: ${st.checklist.map((c,i)=>(i+1)+'. '+c).join(' ')}\nBe kind but honest. If the image is not of electronics or is too blurry to judge, say so.\nReturn JSON only: {"verdict":"correct"|"almost"|"unclear","seen":"one short sentence of what you see","checks":[true/false for each item in order],"feedback":"2 short friendly sentences: what is right and the one thing to fix or the next thing to try"}`,{images:imgs});
    }catch(e){v=null}
    b.disabled=false; b.textContent=bn?'আবার পাঠাও':'Send again';
    if(!v){$('#mres').innerHTML=`<div class="msg"><div><b>${bn?'AI এখন দেখতে পারছে না':'AI check unavailable here'}</b>${bn?'তোমার ফাইল রাখা হলো। শিক্ষক দেখে দেবেন, তুমি এগিয়ে যেতে পারো।':'Your file is ready for your teacher to review. You can continue.'}</div></div>`; $('#anyway').classList.remove('hidden'); return}
    const ok=v.verdict==='correct'; $$('#checks div').forEach((d,i)=>{const y=v.checks&&v.checks[i]; d.querySelector('i').className=y?'y':'n'; d.querySelector('i').textContent=y?'✓':'✕'});
    $('#mres').innerHTML=`<div class="msg ${ok?'ok':'bad'}"><div><b>${ok?(bn?'ইন্সট্রাক্টর যাচাই করেছে ✓':'Verified by Instructor ✓'):v.verdict==='unclear'?(bn?'ভালো করে দেখা যাচ্ছে না':'Hard to see'):(bn?'প্রায় হয়ে গেছে':'Almost there')}</b>${esc(v.seen||'')} ${esc(v.feedback||'')}</div></div>`;
    P.media[st.id]={ok,feedback:(v.seen||'')+' '+(v.feedback||'')}; save(); tookieSays(v.feedback||'',ok?'ok':'warn');
    if(ok)markDone(st); else {fail(st); $('#anyway').classList.remove('hidden')}};
}

/* ---------- quiz ---------- */
function renderQuiz(st,host){
  const bn=P.lang==='bn'; const p=pace(); const level=P.quizLevel||(p==='fast'?'hard':p==='careful'?'easy':'medium');
  const lessonTime=COURSE[S.li].steps.reduce((a,s)=>a+(P.times[s.id]||0),0);
  host.innerHTML=`<div class="quiz"><div class="msg"><div><b>${bn?'ইন্সট্রাক্টরের সিদ্ধান্ত':'Instructor decided'}</b>${bn?`এই লেসনে তুমি ${Math.round(lessonTime/60)||1} মিনিট দিয়েছ, তাই প্রশ্নগুলো হবে ${({easy:'সহজ',medium:'মাঝারি',hard:'কঠিন'})[level]}।`:`You spent about ${Math.round(lessonTime/60)||1} min on this lesson at a ${p} pace, so your questions are ${level}.`}</div></div><div id="qz" style="margin-top:12px"></div></div>`;
  const pickStatic=()=>{const pool=[...QUIZ[level]]; const other=QUIZ[level==='hard'?'medium':level==='easy'?'medium':'easy']; const qs=pool.sort(()=>Math.random()-.5).slice(0,3).concat(other.sort(()=>Math.random()-.5).slice(0,1));
    return qs.map(q=>({q:L(q.q),o:q.o,a:q.a,why:L(q.why)}))};
  const start=qs=>{let i=0,score=0; const qz=$('#qz');
    const show=()=>{if(i>=qs.length){const pass=score>=Math.ceil(qs.length*0.75)-0; qz.innerHTML=`<div class="qcard"><div class="qmeta"><span>${bn?'ফলাফল':'Result'}</span><span>${level}</span></div><div class="qq">${score} / ${qs.length}</div><p style="color:var(--mute)">${pass?(bn?'দারুণ! তুমি ESP32 এর পিন চেনো।':'Great! You know your ESP32 pins.'):(bn?'চলো আরেকবার দেখি, এবার একটু সহজ করে।':'Let’s look again. I’ll make it a bit easier.')}</p><button class="cta sm" id="qa">${pass?(bn?'এগিয়ে যাও':'Continue'):(bn?'আবার চেষ্টা':'Try again')}</button></div>`;
        P.quizScore=score/qs.length; save(); if(pass){markDone(st); tookieSays(bn?`${score}/${qs.length}! তুমি পিনগুলো চেনো।`:`${score}/${qs.length}! You know your pins.`,'ok')} else {fail(st); P.quizLevel=level==='hard'?'medium':'easy'; save()}
        $('#qa').onclick=()=>{if(pass)$('#next').click(); else renderQuiz(st,host)}; return}
      const q=qs[i]; qz.innerHTML=`<div class="qcard"><div class="qmeta"><span>${bn?'প্রশ্ন':'Question'} ${i+1}/${qs.length}</span><span>${level}</span></div><div class="qq">${esc(q.q)}</div><div class="qo">${q.o.map((o,j)=>`<button data-j="${j}">${esc(o)}</button>`).join('')}</div><div id="why"></div></div>`;
      $$('.qo button').forEach(b=>b.onclick=()=>{const j=+b.dataset.j; $$('.qo button').forEach(x=>x.disabled=true); b.classList.add(j===q.a?'right':'wrong'); $$('.qo button')[q.a].classList.add('right'); if(j===q.a)score++;
        $('#why').innerHTML=`<div class="msg ${j===q.a?'ok':'bad'}"><div>${esc(q.why)}</div></div><button class="cta sm" style="margin-top:10px" id="qn">${bn?'পরের প্রশ্ন':'Next question'} →</button>`; $('#qn').onclick=()=>{i++;show()}})};
    show()};
  if(S.sample){$('#qz').innerHTML=`<div class="scount"><span class="spin"></span> ${bn?'ইন্সট্রাক্টর তোমার জন্য প্রশ্ন বানাচ্ছে…':'Instructor is writing questions for you…'}</div>`;
    askJSON(`${RULES()}\n\nWrite 4 multiple-choice questions about the ESP32 DevKit pins for a beginner. Difficulty: ${level} (easy = counting GND/3V3/VIN pins and HIGH/LOW; medium = analog pin count, analogRead range, input-only pins, PWM; hard = ADC2 and Wi-Fi, DAC pins, TX0/RX0, INPUT_PULLUP logic). Use ONLY these facts: ${ESP_FACTS}\n${langLine()}\nReturn JSON only: {"questions":[{"q":"","options":["","","",""],"answer":0,"why":"one short sentence"}]}`)
     .then(v=>{const qs=(v&&v.questions||[]).filter(q=>q.options&&q.options.length>=2&&q.answer>=0&&q.answer<q.options.length).map(q=>({q:q.q,o:q.options,a:q.answer,why:q.why})); start(qs.length>=3?qs.slice(0,4):pickStatic())}).catch(()=>start(pickStatic()))}
  else start(pickStatic());
}

/* ---------- boards / pins / apps / ide / done ---------- */
function boardSvg(col,w,label,chip){return `<svg viewBox="0 0 220 110"><rect x="${110-w/2}" y="10" width="${w}" height="90" rx="8" fill="${col}"/><rect x="${110-w/2+8}" y="16" width="${w-16}" height="6" fill="#00000033"/><rect x="${110-w/2+8}" y="88" width="${w-16}" height="6" fill="#00000033"/><rect x="${110-18}" y="38" width="36" height="34" rx="3" fill="${chip}"/><text x="110" y="60" text-anchor="middle" font-size="9" fill="#fff" font-family="Geist Mono, ui-monospace, monospace">${label}</text></svg>`}
function renderBoards(host){const bn=P.lang==='bn';
  const B=[['Arduino Uno',boardSvg('#00878F',190,'328P','#1A1D23'),['5 V','14 digital','6 analog'],{en:'The classic beginner board. Big and simple, no Wi-Fi.',bn:'নতুনদের ক্লাসিক বোর্ড। বড় আর সহজ, Wi-Fi নেই।'}],
   ['Arduino Nano',boardSvg('#1C5BA8',110,'328P','#1A1D23'),['5 V','tiny','breadboard'],{en:'A small Uno that plugs into a breadboard.',bn:'ছোট্ট Uno, ব্রেডবোর্ডে বসে যায়।'}],
   ['ESP32',boardSvg('#1C222C',140,'ESP32','#B9BFC8'),['Wi-Fi','Bluetooth','240 MHz'],{en:'Fast, with Wi-Fi and Bluetooth built in. Our pick.',bn:'দ্রুত, ভেতরে Wi-Fi আর Bluetooth। আমাদের পছন্দ।'}],
   ['Raspberry Pi Pico',boardSvg('#2E7D32',130,'RP2040','#1A1D23'),['3.3 V','MicroPython','C'],{en:'Cheap and powerful. Popular with MicroPython.',bn:'সস্তা আর শক্তিশালী। MicroPython এ জনপ্রিয়।'}]];
  host.innerHTML=`<div class="boards">${B.map((b,i)=>`<div class="board ${i===2?'ours':''}">${b[1]}<h4>${b[0]} ${i===2?`<span class="tag lime">${bn?'আমরা এটা ব্যবহার করি':'we use this'}</span>`:''}</h4><div class="tags">${b[2].map(x=>`<span class="tag">${x}</span>`).join('')}</div><p>${esc(L(b[3]))}</p></div>`).join('')}</div>`}
function renderPins(host){const bn=P.lang==='bn'; let cur='digital'; const seen=new Set();
  const draw=()=>{const T=PIN_TYPES[cur]; host.innerHTML=`<div class="pinx"><div class="visual" style="min-height:420px">${espDiagram(T.pins,T.c)}</div><div><div class="filters">${Object.entries(PIN_TYPES).map(([k,v])=>`<button data-k="${k}" class="${k===cur?'on':''}" style="--c:${v.c}"><span>${esc(L(v))}</span><b>${new Set(v.pins).size}${seen.has(k)?' ✓':''}</b></button>`).join('')}</div><div class="pinfo">${esc(L(T.info))}</div></div></div>`;
    $$('.filters button').forEach(b=>b.onclick=()=>{cur=b.dataset.k; seen.add(cur); draw(); if(seen.size>=4&&!P.done[curStep().id])markDone(curStep())})};
  seen.add(cur); draw()}
function renderApps(host){const bn=P.lang==='bn'; const A=[['Serial Bluetooth Terminal','Android',{en:'Type or tap buttons that send letters like F or S. Best for testing.',bn:'অক্ষর লেখো বা বাটনে F, S পাঠাও। টেস্টের জন্য সেরা।'}],['Dabble','Android · iOS (BLE)',{en:'Gamepad screen that sends button presses. Feels like a real remote.',bn:'গেমপ্যাড স্ক্রিন, বাটন চাপলে কমান্ড যায়। আসল রিমোটের মতো।'}],['Bluetooth RC Controller','Android',{en:'Arrows send F, B, L, R, S: exactly the letters in your code.',bn:'অ্যারো চাপলে F, B, L, R, S যায়: তোমার কোডের অক্ষরগুলোই।'}],['ESP32 web page (Wi-Fi)','Any browser',{en:'The ESP32 hosts a small page with buttons. Works on iPhone too.',bn:'ESP32 নিজেই বাটনসহ একটা ছোট পেজ বানায়। iPhone এও চলে।'}],['Blynk','Android · iOS',{en:'Build a dashboard with sliders and joysticks over Wi-Fi.',bn:'Wi-Fi দিয়ে স্লাইডার আর জয়স্টিকের ড্যাশবোর্ড।'}],['Arduino IoT Remote','Android · iOS',{en:'Arduino’s own app for Wi-Fi projects.',bn:'Wi-Fi প্রজেক্টের জন্য Arduino এর নিজের অ্যাপ।'}]];
  host.innerHTML=`<div class="apps">${A.map(a=>`<div class="board"><h4>${a[0]}</h4><div class="tags"><span class="tag">${a[1]}</span></div><p>${esc(L(a[2]))}</p></div>`).join('')}</div><div class="msg" style="margin-top:12px"><div><b>iPhone</b>${bn?'iPhone ক্লাসিক Bluetooth সিরিয়াল সমর্থন করে না। iPhone হলে Wi-Fi পেজ বা BLE অ্যাপ ব্যবহার করো।':'iPhones don’t support classic Bluetooth serial. On an iPhone, use the Wi-Fi web page or a BLE app.'}</div></div>`}
function renderIDE(st,host){const bn=P.lang==='bn'; P.ide=P.ide||{};
  const steps=[
   [bn?'Arduino IDE ইনস্টল করো':'Install the Arduino IDE',bn?'arduino.cc/en/software থেকে Arduino IDE 2 নামাও আর ইনস্টল করো।':'Download Arduino IDE 2 from arduino.cc/en/software and install it.',`<div class="mock"><div class="mt"><i></i><i></i><i></i> arduino.cc/en/software</div><div class="mb"><div>Arduino IDE 2.3</div><div class="row"><span class="hl">⬇ Windows Win 10 and newer</span></div><div style="color:#5D6470">macOS · Linux</div></div></div>`],
   [bn?'ESP32 বোর্ডের লিংক যোগ করো':'Add the ESP32 boards link',bn?'File → Preferences → “Additional boards manager URLs” এ এটা পেস্ট করো:':'File → Preferences → paste this into “Additional boards manager URLs”:',`<div class="mock"><div class="mt"><i></i><i></i><i></i> Preferences</div><div class="mb"><div>Additional boards manager URLs</div><div class="hl" style="font-size:9px">https://espressif.github.io/arduino-esp32/package_esp32_index.json</div></div></div>`,'https://espressif.github.io/arduino-esp32/package_esp32_index.json'],
   [bn?'ESP32 প্যাকেজ ইনস্টল করো':'Install the ESP32 package',bn?'Tools → Board → Boards Manager → “esp32” লিখে খোঁজো → “esp32 by Espressif Systems” Install।':'Tools → Board → Boards Manager → search “esp32” → Install “esp32 by Espressif Systems”.',`<div class="mock"><div class="mt"><i></i><i></i><i></i> Boards Manager</div><div class="mb"><div class="row">🔍 esp32</div><div class="row"><b style="color:#fff">esp32</b> by Espressif Systems <span class="hl">INSTALL</span></div></div></div>`],
   [bn?'বোর্ড আর পোর্ট বেছে নাও':'Pick the board and the port',bn?'ডেটা USB কেবল দিয়ে ESP32 লাগাও। Tools → Board → “ESP32 Dev Module”। Tools → Port → COM পোর্ট (Mac এ /dev/cu.usbserial)। পোর্ট না এলে CP210x বা CH340 ড্রাইভার ইনস্টল করো।':'Plug the ESP32 in with a data USB cable. Tools → Board → “ESP32 Dev Module”. Tools → Port → the COM port (on Mac: /dev/cu.usbserial…). No port? Install the CP210x or CH340 driver.',`<div class="mock"><div class="mt"><i></i><i></i><i></i> Tools</div><div class="mb"><div>Board: <span class="hl">ESP32 Dev Module</span></div><div>Port: <span class="hl">COM3</span></div></div></div>`],
   [bn?'কোড পেস্ট করো আর আপলোড করো':'Paste your code and upload',bn?'তোমার পাস করা কোড পেস্ট করো। ✓ Verify, তারপর → Upload চাপো।':'Paste the code you passed in the lab. Click ✓ Verify, then → Upload.',`<div class="mock"><div class="mt"><span class="tbtn">✓</span><span class="tbtn hl" style="outline-offset:1px">→</span> tookie.ino</div><div class="mb"><div>void setup() {</div><div>&nbsp;&nbsp;pinMode(23, OUTPUT);</div></div></div>`],
   [bn?'“Connecting…” এ আটকে গেলে':'If it says “Connecting…”',bn?'ESP32 এর BOOT বাটন চেপে ধরো, “Writing…” দেখলে ছেড়ে দাও। শেষে “Done uploading” আসবে।':'Hold the BOOT button on the ESP32 until you see “Writing…”, then let go. You should see “Done uploading”.',`<div class="mock"><div class="mt"><i></i><i></i><i></i> Output</div><div class="mb" style="color:#3DF58A"><div>Connecting.....</div><div>Writing at 0x00010000 (100 %)</div><div class="hl">Done uploading.</div></div></div>`]];
  host.innerHTML=`<div class="ide">${steps.map((s,i)=>`<div class="ide-step ${P.ide[i]?'done':''}" data-i="${i}"><div class="n" title="${bn?'করেছি':'I did this'}">${P.ide[i]?'✓':i+1}</div><div><h4>${esc(s[0])}</h4><p>${esc(s[1])}</p>${s[3]?`<code>${esc(s[3])}</code> <button class="tb cp" data-c="${esc(s[3])}">${bn?'কপি':'Copy'}</button>`:''}<div style="margin-top:8px"><button class="tb did">${P.ide[i]?(bn?'করা হয়েছে ✓':'Done ✓'):(bn?'আমি এটা করেছি':'I did this')}</button></div></div>${s[2]}</div>`).join('')}</div>`;
  const upd=()=>{if(steps.every((_,i)=>P.ide[i])&&!P.done[st.id]){markDone(st); tookieSays(bn?'আপলোড সম্পন্ন! এবার আসল LED কাজ করছে কিনা দেখো।':'Uploaded! Now check that your real LED works.','ok')}};
  $$('.ide-step').forEach(el=>{const i=+el.dataset.i; const tog=()=>{P.ide[i]=!P.ide[i]; save(); renderIDE(st,host); upd()}; el.querySelector('.n').onclick=tog; el.querySelector('.did').onclick=tog});
  $$('.cp').forEach(b=>b.onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(b.dataset.c).then(()=>toast('Copied'),()=>{})})}
function renderDone(st,host){const bn=P.lang==='bn'; markDone(st); const les=COURSE[S.li]; const secs=les.steps.reduce((a,s)=>a+(P.times[s.id]||0),0);
  host.innerHTML=`<div class="done-wrap"><div class="badge"><div><div class="seal">${st.final?'🏆':les.icon}</div><h2 style="margin:16px 0 4px">${esc(L(st.title))}</h2><p style="color:var(--mute);max-width:380px">${esc(L(st.body))}</p></div></div>
   <div class="panel"><div class="kick">${bn?'তোমার রিপোর্ট':'Your report'}</div><div class="stats" style="margin-top:14px;padding:0"><div class="stat"><b>${Math.max(1,Math.round(secs/60))}m</b><span>${bn?'সময়':'time'}</span></div><div class="stat"><b>${les.steps.reduce((a,s)=>a+(P.fails[s.id]||0),0)}</b><span>${bn?'ভুল থেকে শেখা':'retries'}</span></div><div class="stat"><b style="text-transform:capitalize">${pace()}</b><span>${bn?'গতি':'pace'}</span></div></div>
   <p style="color:var(--mute);margin-top:16px">${bn?'পরের লেসনে ইন্সট্রাক্টর তোমার গতি অনুযায়ী ধাপ ঠিক করবে।':'In the next lesson, Instructor will size the steps to your pace.'}</p></div></div>`;
  tookieSays(L(st.title)+'! '+L(st.body),'ok')}


/* ---------- boot ---------- */
function renderUser(){const u=P.user||{}; const bn=BN();
  $('#wsw').innerHTML=`<div class="av">${esc((u.name||'T').charAt(0).toUpperCase())}</div><div class="wi"><b>${esc(u.name||'Instructor')}</b><span>${u.kit?esc(u.kit):(bn?'রোবট কিট · শিক্ষার্থী':'Botstructor · learner')}</span></div>${I('<path d="m7 10 5 5 5-5"/>',16)}`;
  $('#wmenu').innerHTML=`<div class="mi" data-a="lang">${I(IC.globe,15)}<span>${bn?'ভাষা':'Language'}</span><span class="mono dim">${bn?'বাংলা':'English'}</span></div><div class="mi" data-a="voice">${I(IC.vol,15)}<span>${bn?'ভয়েস গাইড':'Voice guide'}</span><span class="mono dim">${P.voice?'ON':'OFF'}</span></div><div class="mi" data-a="demo">${I(IC.spark,15)}<span>${bn?'ডেমো ডেটা লোড':'Load demo learner'}</span></div><div class="mi" data-a="reset">${I('<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/>',15)}<span>${bn?'প্রোগ্রেস মুছে ফেলো':'Reset progress'}</span></div><div class="sepm"></div><div class="mi" data-a="out">${I('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',15)}<span>${bn?'লগ আউট':'Log out'}</span></div>`;
  $$('#wmenu .mi').forEach(m=>m.onclick=()=>{$('#wmenu').classList.add('hidden'); const a=m.dataset.a;
    if(a==='lang'){P.lang=BN()?'en':'bn'; save(); renderUser(); render()} if(a==='voice'){P.voice=!P.voice; save(); renderUser(); render()}
    if(a==='demo')loadDemo(); if(a==='reset'&&confirm(bn?'সব প্রোগ্রেস মুছবে?':'Reset all progress?')){const u2=P.user, lang=P.lang; P={lang,voice:false,done:{},times:{},fails:{},sims:{},codes:{},motorDir:1,quizLevel:null,media:{},checks:{sim:0,code:0,real:0},project:null,side:true,user:u2,log:{}}; save(); render()}
    if(a==='out')logout()})}
function bind(){
  $('#wsw').onclick=e=>{e.stopPropagation(); $('#wmenu').classList.toggle('hidden')}; document.addEventListener('click',()=>$('#wmenu').classList.add('hidden'));
  $('#sideTgl').onclick=()=>{if(document.body.classList.contains('ws')||document.body.classList.contains('focus')){document.body.classList.toggle('side-on');return} P.side=!P.side; save(); document.body.classList.toggle('side-off',!P.side)};
  $$('#langSeg button').forEach(b=>b.onclick=()=>{P.lang=b.dataset.l; save(); stopSpeak(); renderUser(); render()});
  $('#voiceTgl').onclick=()=>{P.voice=!P.voice; save(); $('#voiceTgl').classList.toggle('on',P.voice); if(P.voice)speak(BN()?'ভয়েস গাইড চালু। আমি প্রতিটা ধাপ পড়ে শোনাবো।':'Voice guide on. I will read each step to you.'); else stopSpeak(); renderUser()};
  $('#agSend').onclick=()=>ask($('#agText').value); $('#agText').addEventListener('keydown',e=>{if(e.key==='Enter')ask($('#agText').value)});
  $('#agMic').onclick=mic; const togAg=v=>{const o=document.body.classList.toggle('agent-open',v); $('#agFab').classList.remove('unread'); if(o)setTimeout(()=>$('#agText')&&$('#agText').focus(),200)}; $('#agTgl').onclick=()=>{if(document.body.classList.contains('ws'))return document.body.classList.toggle('agent-off'); togAg()}; $('#agFab').onclick=()=>togAg(); window.openAgent=()=>togAg(true);
  document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault(); openK()} if(e.key==='Escape')closeK();
    if(!$('#kpal').classList.contains('hidden')){if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault(); kSel=Math.max(0,Math.min(kItems.length-1,kSel+(e.key==='ArrowDown'?1:-1))); $$('#kres .kr').forEach((r,i)=>r.classList.toggle('on',i===kSel)); const on=$('#kres .kr.on'); on&&on.scrollIntoView({block:'nearest'})} if(e.key==='Enter'&&kItems[kSel]){closeK(); kItems[kSel].go()}}});
  $('#kq').oninput=e=>drawK(e.target.value); $('#kpal').onclick=e=>{if(e.target.id==='kpal')closeK()};
  bubble(BN()?'হাই! আমি তোমার AI ইন্সট্রাক্টর, তোমার AI রোবটিক্স এজেন্ট। প্রতিটা ধাপে পাশে আছি: মাইক চেপে বলো বা লিখে জিজ্ঞেস করো।':"Hi! I'm your AI instructor. I'm with you at every step: tap the mic and talk, or type a question.",'bot');
}
/* Claude API via this site's own /api/claude function (Vercel). Same shape as the claude.ai `sample` capability. */
async function claudeApiSample(){
  try{const r=await fetch('/api/claude',{cache:'no-store'}); if(!r.ok)return null; const j=await r.json(); if(!j||!j.ready)return null}catch(e){return null}
  const toB64=b=>new Promise((ok,no)=>{const fr=new FileReader(); fr.onload=()=>{const s=String(fr.result); ok({media_type:s.slice(5,s.indexOf(';')),data:s.slice(s.indexOf(',')+1)})}; fr.onerror=()=>no(fr.error); fr.readAsDataURL(b)});
  const call=async(msgs,opts={})=>{
    const prompt=msgs.map(m=>typeof m.content==='string'?m.content:'').join('\n\n');
    const images=opts.images?await Promise.all(opts.images.map(toB64)):[];
    const r=await fetch('/api/claude',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,images,quick:opts.modelTier==='quick'})});
    const j=await r.json().catch(()=>({})); if(!r.ok||j.error)throw new Error(j.error||('HTTP '+r.status)); return {text:j.text||''}};
  const s=(msgs,opts)=>call(msgs,opts);
  s.json=async(msgs,opts)=>{const r=await call(msgs,opts); const m=(r.text||'').match(/\{[\s\S]*\}/); if(!m)throw new Error('bad json'); return JSON.parse(m[0])};
  s.limits=async()=>({images:true});
  return s;
}
async function boot(){
  bind(); renderUser();
  if(!(P.user&&P.user.onboarded))renderAuth(); else render();
  fetch('/api/tts',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{S.cloudTts=!!(j&&j.ready)}).catch(()=>{});
  const api=await claudeApiSample();
  if(api){S.sample=api; S.imgs=true; $('#aiState').classList.add('live'); $('#aiTxt').textContent='AI live'}
  else for(let i=0;i<40&&!(window.claude&&window.claude.use);i++)await new Promise(r=>setTimeout(r,250));
  try{if(!api&&window.claude&&window.claude.use){const [s,tt]=await Promise.all([window.claude.use('sample'),window.claude.use('tts')]); S.sample=s; S.tts=tt;
    if(s){try{const lim=await s.limits(); S.imgs=!!(lim&&lim.images)}catch(e){S.imgs=false} $('#aiState').classList.add('live'); $('#aiTxt').textContent='AI live'}}}catch(e){}
  if(!S.sample)$('#aiTxt').textContent='AI offline';
  $('#agSub').textContent=S.sample?(BN()?'অনলাইন · কথা শুনি আর ছবি দেখি':'Online · hears you and sees photos'):(BN()?'অফলাইন মোড · তবুও সাহায্য করবো':'Offline mode · built-in help');
}
window.__tookie={vcStart,vcStop,VC,openProject,PROJ,go,P,S,COURSE,visibleSteps,markDone,render,renderAuth,loadDemo,makePlan};
boot();
})();
