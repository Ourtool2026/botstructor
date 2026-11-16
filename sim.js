/* Instructor Circuit Lab: a small Tinkercad-style simulator.
   Components on an SVG canvas, wires between pins, a breadboard, and a DC nodal solver.
   Also runs the learner's Arduino code (transpiled to JS) against the circuit. */
(function(){
const NS='http://www.w3.org/2000/svg';
const ESP_L=['EN','VP','VN','D34','D35','D32','D33','D25','D26','D27','D14','D12','D13','GND','VIN'];
const ESP_R=['D23','D22','TX0','RX0','D21','D19','D18','D5','TX2','RX2','D4','D2','D15','GND2','3V3'];
const GPIO_OF={VP:36,VN:39,TX0:1,RX0:3,TX2:17,RX2:16};
function gpioOf(p){if(GPIO_OF[p]!==undefined)return GPIO_OF[p]; const m=/^D(\d+)$/.exec(p); return m?+m[1]:null}
const PIN_OF_GPIO={}; [...ESP_L,...ESP_R].forEach(p=>{const g=gpioOf(p); if(g!==null)PIN_OF_GPIO[g]=p});
const WIRE_COLORS=['#FF5A4E','#2B2F38','#FFD23F','#3DF58A','#3DA8FF','#FF8A2A','#C77DFF'];

/* ---------- component library ---------- */
const BB={cols:30,x0:28,dx:14,rows:{a:62,b:76,c:90,d:104,e:118,f:146,g:160,h:174,i:188,j:202},rails:{tp:18,tn:32,bn:232,bp:246}};
const LIB={
 battery:{name:'Battery 3V',w:120,h:56,pins:{'+':[132,16],'-':[132,40]},desc:'2 × AA = 3 V'},
 battery74:{name:'Battery 7.4V',w:130,h:56,pins:{'+':[142,16],'-':[142,40]},desc:'2 × 18650 = 7.4 V'},
 switch:{name:'Switch',w:72,h:40,pins:{a:[-8,26],b:[80,26]},desc:'Turns the circuit on and off'},
 motor:{name:'DC motor',w:84,h:84,pins:{a:[28,98],b:[56,98]},desc:'Spins when current flows'},
 led:{name:'LED',w:28,h:58,pins:{A:[7,58],K:[21,58]},desc:'Long leg (+) left, short leg (−) right'},
 resistor:{name:'Resistor 220Ω',w:56,h:16,pins:{a:[0,8],b:[56,8]},desc:'Limits the current'},
 button:{name:'Push button',w:42,h:42,pins:{a:[7,48],b:[35,48]},desc:'Connects while you hold it'},
 esp32:{name:'ESP32',w:150,h:338,pins:{},desc:'The brain: runs your code'},
 breadboard:{name:'Breadboard',w:450,h:264,pins:{},desc:'Holes in a column are connected'},
 l298n:{name:'L298N driver',w:170,h:156,pins:{OUT1:[-8,46],OUT2:[-8,74],OUT3:[178,46],OUT4:[178,74],'12V':[18,164],GND:[38,164],'5V':[58,164],ENA:[86,164],IN1:[100,164],IN2:[114,164],IN3:[128,164],IN4:[142,164],ENB:[156,164]},desc:'Lets the ESP32 drive big motors'}
};
ESP_L.forEach((p,i)=>LIB.esp32.pins[p]=[-8,34+i*20]); ESP_R.forEach((p,i)=>LIB.esp32.pins[p]=[158,34+i*20]);
for(let c=1;c<=BB.cols;c++){const x=BB.x0+(c-1)*BB.dx; for(const r in BB.rows) LIB.breadboard.pins[r+c]=[x,BB.rows[r]]; for(const r in BB.rails) LIB.breadboard.pins[r+c]=[x,BB.rails[r]]}
function pinLabel(type,p){
  if(type==='esp32'){const g=gpioOf(p); if(p==='GND2')return 'GND'; if(p==='3V3')return '3V3 · 3.3 V out'; if(p==='VIN')return 'VIN · 5 V in'; if(p==='EN')return 'EN · reset'; return g!==null?`${p} · GPIO ${g}`:p}
  if(type==='breadboard'){const r=p.replace(/\d+/,''), c=p.replace(/\D+/,''); return ({tp:'top + rail',tn:'top − rail',bn:'bottom − rail',bp:'bottom + rail'})[r]?({tp:'top + rail',tn:'top − rail',bn:'bottom − rail',bp:'bottom + rail'})[r]+' '+c:`hole ${r}${c}`}
  if(type==='led')return p==='A'?'LED + (long leg)':'LED − (short leg)';
  if(type==='battery'||type==='battery74')return p==='+'?'battery +':'battery −';
  return LIB[type].name+' '+p;
}

/* ---------- drawing ---------- */
function el(tag,attrs,parent){const e=document.createElementNS(NS,tag); for(const k in attrs)e.setAttribute(k,attrs[k]); if(parent)parent.appendChild(e); return e}
function drawBody(c,g){
  const t=c.type;
  if(t==='battery'||t==='battery74'){const w=LIB[t].w; el('rect',{x:0,y:0,width:w,height:56,rx:8,fill:'#1A1D23',stroke:'#3A3F4A'},g);
    if(t==='battery'){[10,62].forEach(x=>{el('rect',{x,y:12,width:48,height:32,rx:6,fill:'#C9A227'},g);el('rect',{x:x+38,y:12,width:10,height:32,fill:'#2A2D33'},g)})}
    else{[10,66].forEach(x=>{el('rect',{x,y:10,width:52,height:36,rx:8,fill:'#3B7DD8'},g)})}
    el('path',{d:`M${w} 16 H${w+12}`,stroke:'#FF5A4E','stroke-width':3},g);el('path',{d:`M${w} 40 H${w+12}`,stroke:'#555B66','stroke-width':3},g);
    const tx=el('text',{x:w/2,y:70,'text-anchor':'middle','font-size':11,fill:'#8A919E'},g);tx.textContent=t==='battery'?'2 × AA = 3 V':'2 × 18650 = 7.4 V';
    const p=el('text',{x:w-14,y:20,'font-size':12,'font-weight':800,fill:'#FF5A4E'},g);p.textContent='+';const n=el('text',{x:w-13,y:44,'font-size':12,'font-weight':800,fill:'#AEB4BF'},g);n.textContent='−';}
  else if(t==='switch'){el('path',{d:'M-8 26 H6 M66 26 H80',stroke:'#B8BEC7','stroke-width':3},g);el('rect',{x:4,y:10,width:64,height:30,rx:8,fill:'#20242B',stroke:'#3A3F4A'},g);
    el('rect',{x:12,y:17,width:48,height:16,rx:8,fill:c.on?'#3DF58A33':'#0E1013'},g);el('circle',{cx:c.on?50:22,cy:25,r:9,fill:c.on?'#3DF58A':'#8A919E',class:'knob'},g);
    const tx=el('text',{x:36,y:4,'text-anchor':'middle','font-size':11,'font-weight':700,fill:c.on?'#3DF58A':'#8A919E'},g);tx.textContent=c.on?'ON':'OFF';}
  else if(t==='motor'){el('path',{d:'M28 84 V98 M56 84 V98',stroke:'#B8BEC7','stroke-width':3},g);el('rect',{x:20,y:78,width:16,height:8,fill:'#FF5A4E'},g);el('rect',{x:48,y:78,width:16,height:8,fill:'#555B66'},g);
    el('circle',{cx:42,cy:42,r:40,fill:'#C9CED6',stroke:'#7D8591','stroke-width':2},g);const r=el('g',{class:'rotor',transform:`rotate(${c.angle||0} 42 42)`},g);
    el('circle',{cx:42,cy:42,r:30,fill:'#2A2E36'},r);el('path',{d:'M42 14 L50 42 L42 70 L34 42 Z',fill:'#FF7A1A'},r);el('circle',{cx:42,cy:42,r:6,fill:'#ECEEF2'},r);}
  else if(t==='led'){const lit=c.lit||0; el('path',{d:'M7 40 V58',stroke:'#B8BEC7','stroke-width':2.5},g);el('path',{d:'M21 40 V52 L21 58',stroke:'#B8BEC7','stroke-width':2.5},g);
    if(lit>0.02)el('circle',{cx:14,cy:18,r:20+lit*8,fill:`rgba(255,70,50,${0.18+lit*0.25})`,filter:'url(#blur)'},g);
    el('path',{d:'M1 40 V16 a13 13 0 0 1 26 0 V40 z',fill:lit>0.02?`rgb(255,${Math.round(90-lit*40)},${Math.round(70-lit*40)})`:'#7A2A28',stroke:'#C0453F'},g);el('rect',{x:-2,y:38,width:32,height:5,rx:2,fill:'#9E3A34'},g);
    const pl=el('text',{x:-6,y:54,'font-size':10,'font-weight':800,fill:'#FF5A4E'},g);pl.textContent='+';}
  else if(t==='resistor'){el('path',{d:'M0 8 H56',stroke:'#B8BEC7','stroke-width':2.5},g);el('rect',{x:12,y:1,width:32,height:14,rx:6,fill:'#D9C7A3'},g);
    [18,24,30].forEach((x,i)=>el('rect',{x,y:1,width:3.5,height:14,fill:['#E2241A','#E2241A','#5A3A1E'][i]},g));el('rect',{x:38,y:1,width:3,height:14,fill:'#C9A227'},g);}
  else if(t==='button'){el('path',{d:'M7 36 V48 M35 36 V48',stroke:'#B8BEC7','stroke-width':2.5},g);el('rect',{x:0,y:4,width:42,height:34,rx:5,fill:'#22262D',stroke:'#3A3F4A'},g);
    el('circle',{cx:21,cy:21,r:10,fill:c.pressed?'#FF7A1A':'#FFB46B',stroke:'#00000055'},g);}
  else if(t==='esp32'){el('rect',{x:0,y:0,width:150,height:338,rx:10,fill:'#171C24',stroke:'#2C3442'},g);
    el('rect',{x:34,y:10,width:82,height:26,rx:3,fill:'#232B37'},g);el('path',{d:'M42 30 h8 v-12 h8 v12 h8 v-12 h8 v12 h8 v-12 h8 v12',stroke:'#C9A227','stroke-width':2.5,fill:'none'},g);
    el('rect',{x:38,y:44,width:74,height:92,rx:4,fill:'#B9BFC8'},g);const t1=el('text',{x:75,y:88,'text-anchor':'middle','font-size':13,'font-weight':800,fill:'#2C3138'},g);t1.textContent='ESP32';
    const t2=el('text',{x:75,y:104,'text-anchor':'middle','font-size':8,fill:'#4A505A'},g);t2.textContent='WROOM-32';
    el('circle',{cx:75,cy:170,r:5,fill:c.gpioLed?'#3DA8FF':'#1D3550',class:'led2'},g);
    el('rect',{x:52,y:316,width:46,height:26,rx:4,fill:'#9AA1AC'},g);
    const pw=el('circle',{cx:118,cy:300,r:4,fill:'#FF4D4D'},g);
    [...ESP_L.map((p,i)=>[p,8,34+i*20,'start']),...ESP_R.map((p,i)=>[p,142,34+i*20,'end'])].forEach(([p,x,y,a])=>{const tx=el('text',{x,y:y+3.5,'text-anchor':a,'font-size':9,'font-family':'Geist Mono,ui-monospace,monospace',fill:'#AEB4BF'},g);tx.textContent=p==='GND2'?'GND':p});}
  else if(t==='breadboard'){el('rect',{x:0,y:0,width:450,height:264,rx:8,fill:'#ECEEF1',stroke:'#C9CED6'},g);
    el('rect',{x:10,y:126,width:430,height:12,rx:3,fill:'#D5D9DF'},g);
    el('path',{d:'M14 10 H436',stroke:'#FF5A4E','stroke-width':1.5},g);el('path',{d:'M14 40 H436',stroke:'#3DA8FF','stroke-width':1.5},g);
    el('path',{d:'M14 224 H436',stroke:'#3DA8FF','stroke-width':1.5},g);el('path',{d:'M14 254 H436',stroke:'#FF5A4E','stroke-width':1.5},g);
    [['+',4,22,'#FF5A4E'],['−',4,36,'#3DA8FF'],['−',4,236,'#3DA8FF'],['+',4,250,'#FF5A4E']].forEach(([s,x,y,f])=>{const tx=el('text',{x,y,'font-size':11,'font-weight':800,fill:f},g);tx.textContent=s});
    for(const r in BB.rows){const tx=el('text',{x:442,y:BB.rows[r]+3,'font-size':8,fill:'#8A919E','text-anchor':'end'},g);tx.textContent=r}
    for(let c2=1;c2<=BB.cols;c2+=4){const tx=el('text',{x:BB.x0+(c2-1)*BB.dx,y:54,'font-size':7,fill:'#8A919E','text-anchor':'middle'},g);tx.textContent=c2}}
  else if(t==='l298n'){el('rect',{x:0,y:0,width:170,height:156,rx:8,fill:'#C62828',stroke:'#8E1B1B'},g);
    el('rect',{x:50,y:-10,width:70,height:62,rx:4,fill:'#20232A'},g);for(let i=0;i<6;i++)el('rect',{x:56+i*10.5,y:-6,width:6,height:46,rx:2,fill:'#353A44'},g);
    const tx=el('text',{x:85,y:70,'text-anchor':'middle','font-size':12,'font-weight':800,fill:'#fff'},g);tx.textContent='L298N';
    [[0,46],[0,74],[150,46],[150,74]].forEach(([x,y])=>el('rect',{x,y:y-12,width:20,height:24,rx:3,fill:'#1E6FD9'},g));
    [['OUT1',24,50],['OUT2',24,78]].forEach(([s,x,y])=>{const q=el('text',{x,y,'font-size':8,fill:'#fff','font-weight':700},g);q.textContent=s});
    [['OUT3',146,50],['OUT4',146,78]].forEach(([s,x,y])=>{const q=el('text',{x,y,'font-size':8,fill:'#fff','font-weight':700,'text-anchor':'end'},g);q.textContent=s});
    [['12V',18],['GND',38],['5V',58],['ENA',86],['IN1',100],['IN2',114],['IN3',128],['IN4',142],['ENB',156]].forEach(([s,x])=>{const q=el('text',{x,y:148,'font-size':7,fill:'#fff','font-weight':700,'text-anchor':'middle',transform:`rotate(-90 ${x} 148)`},g);q.textContent=s; el('path',{d:`M${x} 152 V164`,stroke:'#C9A227','stroke-width':3},g)});}
}

/* ---------- Sim class ---------- */
class Sim{
  constructor(host,opts={}){
    this.host=host; this.opts=opts; this.comps=[]; this.wires=[]; this.sel=null; this.wireColor=WIRE_COLORS[0]; this.nid=1;
    this.gpio={}; this.testPins={}; this.result=null; this.listeners=[]; this.palette=opts.palette||Object.keys(LIB);
    host.innerHTML=`<div class="lab"><div class="lab-pal"></div><div class="lab-main"><div class="lab-bar"></div><div class="lab-canvas"><svg viewBox="0 0 1000 620"></svg><div class="lab-tip"></div><div class="zoomc"><button data-z="out" title="Zoom out (−)">−</button><span class="zp">100%</span><button data-z="in" title="Zoom in (+)">+</button><button data-z="fit" title="Fit all parts (0)">Fit</button><button data-z="tags" class="on" title="Show part names (N)">Names</button></div><div class="zhint">Scroll to zoom · drag empty space to move</div></div><div class="lab-status"></div></div></div>`;
    this.svg=host.querySelector('svg'); this.tip=host.querySelector('.lab-tip'); this.statusEl=host.querySelector('.lab-status');
    this.buildPalette(); this.buildBar(); this.bindZoom(); this.bindCanvas();
    this.raf=requestAnimationFrame(this.frame.bind(this)); this.last=performance.now();
  }
  on(fn){this.listeners.push(fn)} emit(){this.listeners.forEach(f=>f(this))}
  buildPalette(){
    const pal=this.host.querySelector('.lab-pal'); const many=this.palette.length>8;
    pal.innerHTML=`<div class="lab-h">Components · ${this.palette.length}</div>${many?`<input class="pal-q" placeholder="Search parts…"><div class="pal-cats"></div>`:''}<div class="pal-list"></div><div class="pal-note"><b>Wire:</b> click a pin, then click another pin.</div>`;
    const list=pal.querySelector('.pal-list'); let cat='All', q='';
    const cats=['All',...new Set(this.palette.map(t=>LIB[t].cat||'Other'))];
    const draw=()=>{list.innerHTML=''; const ql=q.toLowerCase();
      this.palette.filter(t=>(cat==='All'||(LIB[t].cat||'Other')===cat)&&(!ql||(LIB[t].name+' '+(LIB[t].desc||'')+' '+(LIB[t].tags||'')+' '+t).toLowerCase().includes(ql))).forEach(t=>{const b=document.createElement('button'); b.className='pal-item'; b.dataset.t=t; b.title=(LIB[t].desc||'')+(LIB[t].sim==='plan'?' · planning only (not simulated yet)':'');
      b.innerHTML=`<svg viewBox="-14 -14 ${LIB[t].w+42} ${LIB[t].h+42}"></svg><span>${LIB[t].name}</span>${LIB[t].sim==='plan'?'<i class="plan">plan</i>':''}`;
      const g=el('g',{},b.querySelector('svg')); const c={type:t,on:true,pal:true}; if(LIB[t].draw)LIB[t].draw(c,g); else drawBody(c,g);
      b.addEventListener('pointerdown',e=>{e.preventDefault(); this.dragFromPalette(t,e)}); list.appendChild(b)});
      if(!list.children.length)list.innerHTML='<div class="pal-note">No part found. Ask Instructor!</div>'};
    if(many){const cw=pal.querySelector('.pal-cats'); cw.innerHTML=cats.map(c=>`<button class="${c==='All'?'on':''}">${c}</button>`).join(''); cw.querySelectorAll('button').forEach(b=>b.onclick=()=>{cat=b.textContent; cw.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); draw()});
      pal.querySelector('.pal-q').oninput=e=>{q=e.target.value; draw()}}
    draw();
  }
  showProps(){const box=this.host.querySelector('.props'); if(!box)return; const c=this.sel&&this.sel.kind==='comp'?this.sel.c:null; const L=c&&LIB[c.type];
    if(!c){box.innerHTML='';return}
    let h=`<b>${L.name}</b>`+(L.sim==='plan'?'<span class="planTag">planning only</span>':'');
    for(const pr of (L.props||[])){const v=c[pr.k]??pr.def; if(pr.type==='toggle')h+=`<label class="pr"><input type="checkbox" data-k="${pr.k}" ${v?'checked':''}> ${pr.label}</label>`;
      else h+=`<label class="pr">${pr.label} <input type="range" data-k="${pr.k}" min="${pr.min}" max="${pr.max}" step="${pr.step||1}" value="${v}"><output>${v}${pr.unit||''}</output></label>`}
    if(L.hold)h+='<span class="hintx">hold it with the mouse</span>'; if(L.toggle)h+='<span class="hintx">click it to switch</span>';
    box.innerHTML=h; box.querySelectorAll('input').forEach(i=>i.oninput=()=>{const k=i.dataset.k; c[k]=i.type==='checkbox'?i.checked:+i.value; const o=i.parentNode.querySelector('output'); if(o)o.textContent=i.value+((L.props.find(p=>p.k===k)||{}).unit||''); this.changed()})}
  buildBar(){
    const bar=this.host.querySelector('.lab-bar');
    bar.innerHTML=`<button class="tb play" data-a="play" title="Run (Space)"><svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg><span>Run</span></button><span class="sep"></span><span class="lab-h">Wire colour</span><span class="wcols">${WIRE_COLORS.map((c,i)=>`<button class="wc ${i?'':'on'}" data-c="${c}" style="background:${c}"></button>`).join('')}</span>
      <span class="sep"></span><button class="tb" data-a="rot" title="Rotate (R)">⟳ Rotate</button><button class="tb" data-a="del" title="Delete (Del)">✕ Delete</button><button class="tb" data-a="clear">Clear all</button>
      <span class="sep"></span><button class="tb test hidden" data-a="test">Test D23: OFF</button><span class="live">● Simulation live</span><div class="props"></div>`;
    bar.querySelectorAll('.wc').forEach(b=>b.onclick=()=>{this.wireColor=b.dataset.c; bar.querySelectorAll('.wc').forEach(x=>x.classList.toggle('on',x===b)); if(this.sel&&this.sel.kind==='wire'){this.sel.w.color=this.wireColor; this.render()}});
    bar.querySelector('[data-a=rot]').onclick=()=>this.rotateSel(); bar.querySelector('[data-a=del]').onclick=()=>this.deleteSel();
    bar.querySelector('[data-a=clear]').onclick=()=>{if(this.locked)return; this.comps=this.comps.filter(c=>c.fixed); this.wires=this.wires.filter(w=>w.fixed); this.changed()};
    this.playBtn=bar.querySelector('[data-a=play]'); this.playing=false;
    this.setPlaying=v=>{this.playing=v; this.playBtn.classList.toggle('on',v); this.playBtn.querySelector('span').textContent=v?'Stop':'Run'; this.playBtn.querySelector('path').setAttribute('d',v?'M6 6h12v12H6z':'M7 4.5v15l13-7.5z')};
    this.playBtn.onclick=()=>{const v=!this.playing; if(this.onPlay){this.onPlay(v)} else {this.comps.filter(c=>c.type==='switch').forEach(c=>c.on=v); this.changed()} this.setPlaying(v)};
    this.testBtn=bar.querySelector('[data-a=test]'); this.testBtn.onclick=()=>{const v=!this.testPins[23]; this.testPins[23]=v; this.testBtn.textContent='Test D23: '+(v?'HIGH':'OFF'); this.testBtn.classList.toggle('on',v); this.changed()};
    this.keyH=e=>{if(!this.host.isConnected)return; if(document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;
      if(e.key==='Delete'||e.key==='Backspace'){this.deleteSel()} else if(e.key==='r'||e.key==='R'){this.rotateSel()} else if(e.key==='Escape'){this.pending=null;this.render()} else if(e.key==='+'||e.key==='='){this.zoom(1.25)} else if(e.key==='-'){this.zoom(1/1.25)} else if(e.key==='0'){this.fitView(40)} else if(e.key==='n'||e.key==='N'){this.tags=!this.tags; const b=this.host.querySelector('[data-z=tags]'); if(b)b.classList.toggle('on',this.tags); this.render()}};
    document.addEventListener('keydown',this.keyH);
  }
  fitView(pad=30){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; for(const c of this.comps){const L=LIB[c.type]; x0=Math.min(x0,c.x-12); y0=Math.min(y0,c.y-14); x1=Math.max(x1,c.x+L.w+12); y1=Math.max(y1,c.y+L.h+20)}
    if(x0>x1)return; x0-=pad;y0-=pad;x1+=pad;y1+=pad+60; let w=x1-x0,h=y1-y0; const ar=620/1000; if(h/w<ar){const nh=w*ar; y0-=(nh-h)/2; h=nh} else {const nw=h/ar; x0-=(nw-w)/2; w=nw} if(w<300){const k=300/w; x0-=(300-w)/2; y0-=(h*k-h)/2; w=300; h=h*k} this.setVB({x:x0,y:y0,w,h})}
  setVB(v){const W=1000; v.w=Math.max(180,Math.min(2600,v.w)); v.h=v.w*0.62; this.vb=v; this.svg.setAttribute('viewBox',`${v.x} ${v.y} ${v.w} ${v.h}`); const zp=this.host.querySelector('.zp'); if(zp)zp.textContent=Math.round(W/v.w*100)+'%'}
  zoom(f,cx,cy){const v=this.vb||{x:0,y:0,w:1000,h:620}; if(cx==null){cx=v.x+v.w/2; cy=v.y+v.h/2} const nw=Math.max(180,Math.min(2600,v.w/f)); const k=nw/v.w; this.setVB({x:cx-(cx-v.x)*k,y:cy-(cy-v.y)*k,w:nw,h:nw*0.62})}
  bindZoom(){const cv=this.host.querySelector('.lab-canvas'); this.vb={x:0,y:0,w:1000,h:620}; this.tags=true;
    cv.addEventListener('wheel',e=>{e.preventDefault(); const p=this.pt(e); const d=e.deltaMode===1?e.deltaY*16:e.deltaY; this.zoom(Math.exp(-d*(e.ctrlKey?0.01:0.0018)),p.x,p.y)},{passive:false});
    cv.querySelectorAll('.zoomc button').forEach(b=>b.onclick=()=>{const z=b.dataset.z; if(z==='in')this.zoom(1.25); else if(z==='out')this.zoom(1/1.25); else if(z==='fit'){this.comps.length?this.fitView(40):this.setVB({x:0,y:0,w:1000,h:620})} else {this.tags=!this.tags; b.classList.toggle('on',this.tags); this.render()}});
  }
  showTest(on){this.testBtn.classList.toggle('hidden',!on)}
  pt(e){const p=this.svg.createSVGPoint(); p.x=e.clientX; p.y=e.clientY; const r=p.matrixTransform(this.svg.getScreenCTM().inverse()); return {x:r.x,y:r.y}}
  add(type,x,y,extra={}){const c={id:'c'+(this.nid++),type,x,y,rot:0,...extra}; if(type==='switch')c.on=c.on??false; this.comps.push(c); return c}
  autoColor(ap,bp){const plus=p=>/^(\+|VCC|VIN|5V|3V3|3\.3V|12V|V\+|VBAT|BAT\+|VS|VSS?)$/i.test(p), minus=p=>/^(-|−|GND\d*|V-|BAT-|COM-)$/i.test(p);
    if(plus(ap)||plus(bp))return '#FF3B30'; if(minus(ap)||minus(bp))return '#FFD23F'; return null}
  wire(a,ap,b,bp,color,extra={}){const w={id:'w'+(this.nid++),a:{c:a.id||a,p:ap},b:{c:b.id||b,p:bp},color:color||this.autoColor(ap,bp)||this.wireColor,...extra}; this.wires.push(w); return w}
  comp(id){return this.comps.find(c=>c.id===id)}
  pinPos(c,p){const L=LIB[c.type], q=L.pins[p]; if(!q)return null; let [px,py]=q; if(c.rot){const cx=L.w/2, cy=L.h/2, a=c.rot*Math.PI/180, dx=px-cx, dy=py-cy; px=cx+dx*Math.cos(a)-dy*Math.sin(a); py=cy+dx*Math.sin(a)+dy*Math.cos(a)} return {x:c.x+px,y:c.y+py}}
  dragFromPalette(t,e){ if(this.locked)return; const L=LIB[t]; const r=this.svg.getBoundingClientRect();
    const inside=e.clientX>=r.left; const p=inside?this.pt(e):{x:120,y:120}; const c=this.add(t,Math.round(p.x-L.w/2),Math.round(p.y-L.h/2));
    if(!inside){ // dropped by click: find a free spot
      c.x=40+((this.comps.length*37)%500); c.y=40+((this.comps.length*53)%300) }
    this.sel={kind:'comp',c}; this.drag={c,ox:L.w/2,oy:L.h/2,moved:true,fromPal:true}; this.changed();
    const mv=ev=>{const q=this.pt(ev); c.x=Math.round(q.x-this.drag.ox); c.y=Math.round(q.y-this.drag.oy); this.render()};
    const up=()=>{document.removeEventListener('pointermove',mv);document.removeEventListener('pointerup',up); const br=this.svg.getBoundingClientRect(); this.clampIn(c); this.snap(c); this.drag=null; this.changed()};
    document.addEventListener('pointermove',mv); document.addEventListener('pointerup',up);
  }
  clampIn(c){const L=LIB[c.type]; c.x=Math.max(0,Math.min(1000-L.w,c.x)); c.y=Math.max(0,Math.min(620-L.h-14,c.y))}
  snap(c){ if(!['led','resistor','button'].includes(c.type))return; const bb=this.comps.find(x=>x.type==='breadboard'); if(!bb)return;
    const pins=Object.keys(LIB[c.type].pins); const p0=this.pinPos(c,pins[0]); let best=null,bd=12;
    for(const h in LIB.breadboard.pins){const hp=this.pinPos(bb,h); const d=Math.hypot(hp.x-p0.x,hp.y-p0.y); if(d<bd){bd=d;best=hp}}
    if(best){c.x+=best.x-p0.x; c.y+=best.y-p0.y}}
  rotateSel(){if(this.sel&&this.sel.kind==='comp'&&!this.sel.c.fixed){this.sel.c.rot=((this.sel.c.rot||0)+90)%360; this.snap(this.sel.c); this.changed()}}
  deleteSel(){if(!this.sel)return; if(this.sel.kind==='comp'){const c=this.sel.c; if(c.fixed)return; this.comps=this.comps.filter(x=>x!==c); this.wires=this.wires.filter(w=>w.a.c!==c.id&&w.b.c!==c.id)} else {if(this.sel.w.fixed)return; this.wires=this.wires.filter(w=>w!==this.sel.w)} this.sel=null; this.changed()}
  bindCanvas(){
    const svg=this.svg;
    svg.addEventListener('pointerdown',e=>{
      const pinEl=e.target.closest('[data-pin]'), compEl=e.target.closest('[data-comp]'), wireEl=e.target.closest('[data-wire]');
      if(pinEl){e.preventDefault(); const ref={c:pinEl.dataset.comp2,p:pinEl.dataset.pin};
        if(this.pending){ if(!(this.pending.c===ref.c&&this.pending.p===ref.p)){ this.wire(this.pending.c,this.pending.p,ref.c,ref.p,null,this.pending.pts&&this.pending.pts.length?{pts:this.pending.pts}:{}); } this.pending=null; this.changed(); return }
        ref.pts=[]; this.pending=ref; this.ptr=this.pt(e); this.render(); return}
      const hEl=e.target.closest('[data-anchor]'); if(hEl&&!this.pending){e.preventDefault(); const w=this.wires.find(x=>x.id===hEl.dataset.anchor), i=+hEl.dataset.i; this.sel={kind:'wire',w};
        const mv=ev=>{const q=this.pt(ev); w.pts[i]={x:Math.round(q.x/5)*5,y:Math.round(q.y/5)*5}; this.render()}; const up=()=>{document.removeEventListener('pointermove',mv);document.removeEventListener('pointerup',up); this.changed()}; document.addEventListener('pointermove',mv); document.addEventListener('pointerup',up); return}
      if(this.pending){e.preventDefault(); const q=this.pt(e); (this.pending.pts=this.pending.pts||[]).push({x:Math.round(q.x/5)*5,y:Math.round(q.y/5)*5}); this.render(); return}
      if(wireEl){this.sel={kind:'wire',w:this.wires.find(w=>w.id===wireEl.dataset.wire)}; this.pending=null; this.render(); return}
      if(compEl){const c=this.comp(compEl.dataset.comp); const p=this.pt(e); this.sel={kind:'comp',c}; this.pending=null;
        if(LIB[c.type].hold){c.pressed=true; this.changed(); const up=()=>{c.pressed=false; this.changed(); document.removeEventListener('pointerup',up)}; document.addEventListener('pointerup',up); return}
        const d={c,ox:p.x-c.x,oy:p.y-c.y,sx:p.x,sy:p.y,moved:false}; this.drag=d;
        const mv=ev=>{const q=this.pt(ev); if(Math.hypot(q.x-d.sx,q.y-d.sy)>3)d.moved=true; if(d.moved&&!c.fixed){c.x=Math.round(q.x-d.ox); c.y=Math.round(q.y-d.oy); this.render()}};
        const up=()=>{document.removeEventListener('pointermove',mv);document.removeEventListener('pointerup',up); if(!d.moved&&LIB[c.type].toggle){const k=LIB[c.type].toggle; c[k]=!c[k]} else if(d.moved){this.clampIn(c); this.snap(c)} this.drag=null; this.changed()};
        document.addEventListener('pointermove',mv); document.addEventListener('pointerup',up); this.render(); return}
      this.sel=null; this.pending=null; this.render();
      const st={x:e.clientX,y:e.clientY,vb:{...(this.vb||{x:0,y:0,w:1000,h:620})}}; const r=svg.getBoundingClientRect(); svg.classList.add('panning');
      const mv=ev=>{const k=st.vb.w/r.width; this.setVB({...st.vb,x:st.vb.x-(ev.clientX-st.x)*k,y:st.vb.y-(ev.clientY-st.y)*k})}; const up=()=>{svg.classList.remove('panning'); document.removeEventListener('pointermove',mv); document.removeEventListener('pointerup',up)}; document.addEventListener('pointermove',mv); document.addEventListener('pointerup',up);
    });
    svg.addEventListener('pointermove',e=>{ this.ptr=this.pt(e); if(this.pending)this.drawRubber();
      const pinEl=e.target.closest('[data-pin]'); if(pinEl){const c=this.comp(pinEl.dataset.comp2); this.tip.textContent=pinLabel(c.type,pinEl.dataset.pin); this.tip.style.opacity=1; const r=this.host.querySelector('.lab-canvas').getBoundingClientRect(); this.tip.style.left=(e.clientX-r.left+12)+'px'; this.tip.style.top=(e.clientY-r.top-28)+'px'} else this.tip.style.opacity=0 });
    svg.addEventListener('pointerleave',()=>{this.tip.style.opacity=0});
  }
  changed(){this.solve(); this.render(); this.emit()}
  /* ---------- netlist + solver ---------- */
  nets(){
    const parent={}; const f=x=>{while(parent[x]!==undefined&&parent[x]!==x){parent[x]=parent[parent[x]]??parent[x]; x=parent[x]} return x};
    const key=(c,p)=>c+':'+p; const add=k=>{if(parent[k]===undefined)parent[k]=k}; const u=(a,b)=>{add(a);add(b); const ra=f(a), rb=f(b); if(ra!==rb)parent[ra]=rb};
    for(const c of this.comps)for(const p in LIB[c.type].pins)add(key(c.id,p));
    const bb=this.comps.filter(c=>c.type==='breadboard');
    for(const b of bb){for(let c=1;c<=BB.cols;c++){'bcde'.split('').forEach(r=>u(key(b.id,'a'+c),key(b.id,r+c)));'ghij'.split('').forEach(r=>u(key(b.id,'f'+c),key(b.id,r+c)))}
      for(const r in BB.rails)for(let c=2;c<=BB.cols;c++)u(key(b.id,r+'1'),key(b.id,r+c))}
    for(const c of this.comps)if(c.type==='esp32')u(key(c.id,'GND'),key(c.id,'GND2'));
    for(const w of this.wires)u(key(w.a.c,w.a.p),key(w.b.c,w.b.p));
    // pins sitting in breadboard holes
    if(bb.length){const holes=[]; for(const b of bb)for(const h in LIB.breadboard.pins){const q=this.pinPos(b,h); holes.push([q.x,q.y,key(b.id,h)])}
      for(const c of this.comps){if(c.type==='breadboard')continue; for(const p in LIB[c.type].pins){const q=this.pinPos(c,p); for(const h of holes)if(Math.abs(h[0]-q.x)<3&&Math.abs(h[1]-q.y)<3){u(key(c.id,p),h[2]);break}}}}
    return {f:k=>f(k),key};
  }
  solve(over={}){
    const N=this.nets(), K=(c,p)=>N.f(N.key(c.id,p));
    const idx={}; let n=0; const ix=r=>idx[r]??(idx[r]=n++);
    for(const c of this.comps)for(const p in LIB[c.type].pins)ix(K(c,p));
    const gpio=over.gpio||this.effectiveGpio(); const sw=over.switches||{}; const btn=over.buttons||{};
    const build=(extra)=>{const G=Array.from({length:n},()=>new Float64Array(n)), I=new Float64Array(n);
      for(let i=0;i<n;i++)G[i][i]+=1e-9;
      const cond=(a,b,g)=>{if(a===b||a===undefined||b===undefined)return; G[a][a]+=g;G[b][b]+=g;G[a][b]-=g;G[b][a]-=g};
      const src=(p,q,V,R)=>{if(p===q||p===undefined||q===undefined)return; const g=1/R; cond(p,q,g); I[p]+=V*g; I[q]-=V*g};
      const els=[];
      const ctx={c:null,cond,src,els,gpio,prev:extra.prev,pressed:c=>btn[c.id]??c.pressed,
        nn:p=>idx[K(ctx.c,p)], V:p=>extra.prev?extra.prev[idx[K(ctx.c,p)]]:null,
        diode:(key,a,k,vf,light)=>{els.push({c:ctx.c,kind:'led',key,p:a,q:k,vf,light}); if(extra.ledOn[key]??true)src(a,k,vf,20)},
        motor:(a,b,R)=>{cond(a,b,1/R); els.push({c:ctx.c,kind:'motor',p:a,q:b})},
        load:(a,b,R,thr)=>{cond(a,b,1/R); els.push({c:ctx.c,kind:'load',p:a,q:b,R,thr})}};
      for(const c of this.comps){const t=c.type, nn=p=>idx[K(c,p)]; ctx.c=c;
        if(t==='battery'||t==='battery74'){const V=t==='battery'?3:7.4; src(nn('+'),nn('-'),V,0.3); els.push({c,kind:'bat',p:nn('+'),q:nn('-'),V,R:0.3})}
        else if(t==='switch'){if(sw[c.id]??c.on)cond(nn('a'),nn('b'),20)}
        else if(t==='button'){if(btn[c.id]??c.pressed)cond(nn('a'),nn('b'),20)}
        else if(t==='resistor'){cond(nn('a'),nn('b'),1/220)}
        else if(t==='motor'){ctx.motor(nn('a'),nn('b'),10)}
        else if(t==='led'){ctx.diode(c.id,nn('A'),nn('K'),1.9,true)}
        else if(t==='esp32'){const g=nn('GND'); src(nn('3V3'),g,3.3,1); src(nn('VIN'),g,5,3);
          els.push({c,kind:'sup',pin:'3V3',p:nn('3V3'),q:g,V:3.3,R:1},{c,kind:'sup',pin:'VIN',p:nn('VIN'),q:g,V:5,R:3});
          for(const pin of [...ESP_L,...ESP_R]){const gp=gpioOf(pin); if(gp===null)continue; const st=gpio[gp]; if(!st)continue;
            if(st.mode==='OUTPUT'){const V=st.duty!==undefined?3.3*st.duty:(st.level?3.3:0); src(nn(pin),g,V,25)} else if(st.mode==='INPUT_PULLUP')src(nn(pin),g,3.3,45000)}}
        else if(t==='l298n'){if(extra.drv&&extra.drv[c.id]){const d=extra.drv[c.id], g=nn('GND'); src(nn('5V'),g,5,2);
          [['OUT1','OUT2','A'],['OUT3','OUT4','B']].forEach(([o1,o2,ch])=>{const ch2=d[ch]; if(ch2.duty>0){src(nn(o1),g,ch2.i1?d.Vs*ch2.duty:0,1); src(nn(o2),g,ch2.i2?d.Vs*ch2.duty:0,1)}})}}
        else if(LIB[t].stamp){LIB[t].stamp(c,ctx)}}
      return {G,I,els}};
    const gauss=(G,I)=>{const m=G.length, A=G.map((r,i)=>{const a=Array.from(r); a.push(I[i]); return a});
      for(let i=0;i<m;i++){let p=i; for(let r=i+1;r<m;r++)if(Math.abs(A[r][i])>Math.abs(A[p][i]))p=r; [A[i],A[p]]=[A[p],A[i]]; const d=A[i][i]||1e-12;
        for(let r=i+1;r<m;r++){const k=A[r][i]/d; if(!k)continue; for(let c=i;c<=m;c++)A[r][c]-=k*A[i][c]}}
      const x=new Float64Array(m); for(let i=m-1;i>=0;i--){let s=A[i][m]; for(let c=i+1;c<m;c++)s-=A[i][c]*x[c]; x[i]=s/(A[i][i]||1e-12)} return x};
    const ledOn={}; let res, drv={};
    const run=(prev)=>{for(let it=0;it<8;it++){const B=build({ledOn,drv,prev}); const V=gauss(B.G,B.I); let ch=false;
        for(const e of B.els)if(e.kind==='led'){const vd=V[e.p]-V[e.q], on=ledOn[e.key]??true; if(on&&(vd-e.vf)/20<0){ledOn[e.key]=false;ch=true} else if(!on&&vd>e.vf+0.05){ledOn[e.key]=true;ch=true}}
        res={V,els:B.els}; if(!ch)break}};
    run(null);
    const passes=this.comps.some(c=>c.type==='l298n'||LIB[c.type].stage2)?2:0;
    for(let pass=0;pass<passes;pass++){
      for(const c of this.comps.filter(c=>c.type==='l298n')){const v=p=>res.V[idx[K(c,p)]]; const g=v('GND'), Vs=v('12V')-g;
        const hi=p=>v(p)-g>1.5; const duty=(p)=>{const r=K(c,p); for(const e of this.comps.filter(x=>x.type==='esp32'))for(const pin of [...ESP_L,...ESP_R]){const gp=gpioOf(pin); if(gp!==null&&K(e,pin)===r){const st=gpio[gp]; if(st&&st.mode==='OUTPUT')return st.duty!==undefined?st.duty:(st.level?1:0)}} return hi(p)?1:0};
        drv[c.id]=Vs>4.5?{Vs:Vs-1.4,A:{duty:duty('ENA'),i1:hi('IN1'),i2:hi('IN2')},B:{duty:duty('ENB'),i1:hi('IN3'),i2:hi('IN4')}}:null}
      run(res.V)}
    const out={motors:[],leds:[],loads:[],warnings:[],drv};
    for(const e of res.els){const vd=res.V[e.p]-res.V[e.q];
      if(e.kind==='bat'){const I=(e.V-vd)/e.R; if(I>3)out.warnings.push({type:'short',msg:'Short circuit! The battery + and − are connected with nothing in between. Unplug and fix it.',at:[[e.c.id,'+'],[e.c.id,'-']]})}
      if(e.kind==='sup'){const I=(e.V-vd)/e.R; if(I>1)out.warnings.push({type:'short',msg:`Short circuit! The ESP32 ${e.pin} pin is connected straight to GND. Unplug it before the board gets hot.`,at:[[e.c.id,e.pin],[e.c.id,'GND']]})}
      if(e.kind==='motor'){const spin=Math.abs(vd)>0.7; out.motors.push({id:e.c.id,v:vd,spinning:spin,dir:spin?Math.sign(vd):0})}
      if(e.kind==='load'){out.loads.push({id:e.c.id,v:vd,active:Math.abs(vd)>=e.thr})}
      if(e.kind==='led'){const on0=ledOn[e.key]??true; const I=on0?(vd-e.vf)/20:0; const on=I>0.0006; out.leds.push({id:e.c.id,key:e.key,on,I,light:e.light,reversed:!on&&vd<-1.8});
        if(e.light&&I>0.02)out.warnings.push({type:'led',msg:'Too much current through the LED: it would burn out. Add a 220 Ω resistor in series.'});
        if(e.light&&!on&&vd<-1.8)out.warnings.push({type:'rev',msg:'The LED is backwards: its long leg (+) must go toward the positive side.'})}}
    out.leds=out.leds.filter(l=>l.light);
    for(const m of out.motors){const c=this.comp(m.id); const r=K(c,'a'), r2=K(c,'b'); for(const e of this.comps.filter(x=>x.type==='esp32'))for(const pin of [...ESP_L,...ESP_R]){const gp=gpioOf(pin); if(gp!==null&&(K(e,pin)===r||K(e,pin)===r2)&&gpio[gp]&&gpio[gp].mode==='OUTPUT'){out.warnings.push({type:'weak',msg:'ESP32 pins are too weak to drive a motor directly. Use the L298N motor driver.'});break}}}
    out.V=res.V; out.netOf=(c,p)=>res.V[idx[K(c,p)]]; out.rootOf=(c,p)=>K(c,p);
    if(!over.gpio&&!over.switches&&!over.buttons)this.result=out;
    return out;
  }
  espPinFor(c,p){const r=(this.result||this.solve()).rootOf(c,p); for(const e of this.comps.filter(x=>x.type==='esp32'))for(const pin of [...ESP_L,...ESP_R]){if(this.result.rootOf(e,pin)===r)return gpioOf(pin)} return null}
  sonarEcho(gp){for(const c of this.comps.filter(x=>x.type==='hcsr04')){if(this.espPinFor(c,'ECHO')===gp){const r=this.result; const v=r.netOf(c,'VCC')-r.netOf(c,'GND'); if(v<3)return 0; return Math.round((c.dist??30)*58)}} return 0}
  dhtValue(gp,k){for(const c of this.comps.filter(x=>x.type==='dht11')){if(gp==null||this.espPinFor(c,'DATA')===gp)return k==='hum'?(c.hum??60):(c.temp??30)} return NaN}
  effectiveGpio(){const g={...this.gpio}; for(const p in this.testPins)if(this.testPins[p])g[p]={mode:'OUTPUT',level:1}; else if(!this.runner&&g[p]===undefined)g[p]={mode:'OUTPUT',level:0}; return g}
  readPin(gp){const e=this.comps.find(c=>c.type==='esp32'); if(!e)return 0; const pin=PIN_OF_GPIO[gp]; if(!pin)return 0; const r=this.result||this.solve(); const v=r.netOf(e,pin)-r.netOf(e,'GND'); const st=this.gpio[gp];
    // floating input (nothing connected): pull-up reads HIGH, plain input reads LOW
    return v>1.65?1:0}
  analogPin(gp){const e=this.comps.find(c=>c.type==='esp32'); if(!e)return 0; const pin=PIN_OF_GPIO[gp]; const r=this.result||this.solve(); return Math.max(0,Math.min(4095,Math.round((r.netOf(e,pin)-r.netOf(e,'GND'))/3.3*4095)))}
  /* ---------- render ---------- */
  render(){
    const svg=this.svg; svg.innerHTML=''; const defs=el('defs',{},svg); const f=el('filter',{id:'blur',x:'-50%',y:'-50%',width:'200%',height:'200%'},defs); el('feGaussianBlur',{stdDeviation:6},f);
    const R=this.result||{motors:[],leds:[]};
    const order=[...this.comps].sort((a,b)=>(a.type==='breadboard'?-1:0)-(b.type==='breadboard'?-1:0));
    for(const c of order){const L=LIB[c.type]; const g=el('g',{transform:`translate(${c.x} ${c.y}) rotate(${c.rot||0} ${L.w/2} ${L.h/2})`,'data-comp':c.id,class:'comp'+(this.sel&&this.sel.c===c?' sel':'')},svg);
      const ls=(R.leds||[]).filter(l=>l.id===c.id); c.litMap={}; ls.forEach(l=>c.litMap[l.key]=l.on?Math.min(1,l.I/0.012):0); if(ls.length)c.lit=c.litMap[ls[0].key];
      const ld=(R.loads||[]).find(l=>l.id===c.id); c.active=!!(ld&&ld.active); const mo=(R.motors||[]).find(m=>m.id===c.id); c.spinning=!!(mo&&mo.spinning); if(L.dyn)L.dyn(c,this);
      if(c.type==='esp32'){const st=this.effectiveGpio()[2]; c.gpioLed=st&&st.mode==='OUTPUT'&&(st.level||st.duty>0)}
      if(this.sel&&this.sel.c===c)el('rect',{x:-8,y:-8,width:L.w+16,height:L.h+16,rx:10,fill:'none',stroke:'#D7FF3A','stroke-dasharray':'5 4','stroke-width':1.5},g);
      if(L.draw)L.draw(c,g); else drawBody(c,g);
      try{const bb=g.getBBox(); c._bb={x:bb.x,y:bb.y,w:bb.width,h:bb.height}}catch(e){c._bb=null}
      const pg=el('g',{},g); for(const p in L.pins){const [px,py]=L.pins[p]; const isHole=c.type==='breadboard';
        el(isHole?'rect':'circle',isHole?{x:px-3.2,y:py-3.2,width:6.4,height:6.4,rx:1.2,fill:'#3A3F48','data-pin':p,'data-comp2':c.id,class:'pin hole'}:{cx:px,cy:py,r:5,fill:'#D7B44A',stroke:'#0008','stroke-width':1,'data-pin':p,'data-comp2':c.id,class:'pin'},pg)}}
    const wg=el('g',{},svg);
    for(const w of this.wires){const ca=this.comp(w.a.c), cb=this.comp(w.b.c); if(!ca||!cb)continue; const a=this.pinPos(ca,w.a.p), b=this.pinPos(cb,w.b.p); if(!a||!b)continue;
      const dx=Math.abs(b.x-a.x), dy=Math.abs(b.y-a.y), sag=Math.min(60,20+(dx+dy)*0.12);
      const d=w.pts&&w.pts.length?roundPath([a,...w.pts,b],10):`M${a.x} ${a.y} C ${a.x} ${a.y+sag}, ${b.x} ${b.y+sag}, ${b.x} ${b.y}`;
      const s=this.sel&&this.sel.w===w;
      el('path',{d,stroke:'#000',opacity:.35,'stroke-width':s?9:7,fill:'none'},wg);
      el('path',{d,stroke:w.color,'stroke-width':s?6:4.5,fill:'none','stroke-linecap':'round','data-wire':w.id,class:'wire'},wg);
      el('circle',{cx:a.x,cy:a.y,r:3.5,fill:w.color},wg); el('circle',{cx:b.x,cy:b.y,r:3.5,fill:w.color},wg);
      if(s&&w.pts)w.pts.forEach((p,i)=>{const h=el('circle',{cx:p.x,cy:p.y,r:6,fill:'#0b0b0c',stroke:w.color,'stroke-width':2.5,'data-anchor':w.id,'data-i':i,class:'anchor'},wg); h.addEventListener('dblclick',()=>{w.pts.splice(i,1); this.changed()})})}
    this.placeSparks(svg,R,wg);
    if(this.tags!==false){const tg=el('g',{class:'tags','pointer-events':'none'},svg); for(const c of this.comps){if(c.type==='breadboard')continue; const L=LIB[c.type]; let my=L.h; for(const p in L.pins)my=Math.max(my,L.pins[p][1]+5); if(c._bb&&!c.rot)my=Math.max(my,c._bb.y+c._bb.h); const nm=L.name.replace(/\s*\(.*\)/,''); const w=nm.length*5.6+14, x=c.x+L.w/2, y=c.y+my+6; el('rect',{x:x-w/2,y,width:w,height:15,rx:7.5,fill:'#000000cc',stroke:'#ffffff26'},tg); const t=el('text',{x,y:y+10.5,'text-anchor':'middle','font-size':9.5,'font-weight':600,fill:'#E8EAF0','font-family':'Geist,Inter,sans-serif'},tg); t.textContent=nm}}
    if(this.pending)this.drawRubber();
    this.renderStatus(); if(this._propsFor!==(this.sel&&this.sel.c)){this._propsFor=this.sel&&this.sel.c; this.showProps()}
  }
  /* ---------- short circuit: fire + sparks at the shorted pins and along the wires carrying the short ---------- */
  placeSparks(svg,R,wg){
    this.sparkPts=[]; const sh=((R&&R.warnings)||[]).filter(w=>w.type==='short'&&w.at); if(!sh.length){this.sparks=[]; return}
    const N=this.nets(), root=(cid,p)=>N.f(N.key(cid,p)), seen=new Set();
    const add=(x,y,k)=>{const key=Math.round(x/6)+','+Math.round(y/6); if(seen.has(key)||this.sparkPts.length>=10)return; seen.add(key); this.sparkPts.push({x,y,k,ph:Math.random()*6})};
    for(const w of sh){const roots=new Set();
      for(const [cid,p] of w.at){const c=this.comp(cid); if(!c)continue; const q=this.pinPos(c,p); if(q)add(q.x,q.y,1); roots.add(root(cid,p))}
      for(const wr of this.wires){if(!roots.has(root(wr.a.c,wr.a.p))||!roots.has(root(wr.b.c,wr.b.p)))continue;
        const path=wg.querySelector(`[data-wire="${wr.id}"]`); try{const L=path.getTotalLength(), m=path.getPointAtLength(L/2); add(m.x,m.y,.7)}catch(e){}}}
    el('g',{class:'sparks','pointer-events':'none'},svg); if(!this.sparks)this.sparks=[]; this.sparkTick(0,performance.now())}
  sparkTick(dt,t){const g=this.svg.querySelector('.sparks'); if(!g)return; g.innerHTML='';
    let still=false; try{still=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}
    const P=this.sparks||[];
    if(!still)for(const s of this.sparkPts){const n=(Math.random()<dt*40*s.k?1:0)+(Math.random()<dt*2.5?7:0);
      for(let i=0;i<n;i++){const a=-Math.PI/2+(Math.random()-.5)*2.8, v=70+Math.random()*190; P.push({x:s.x,y:s.y-2,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:0,max:.25+Math.random()*.5})}}
    for(const p of P){p.life+=dt; p.vy+=480*dt; p.x+=p.vx*dt; p.y+=p.vy*dt}
    this.sparks=P.filter(p=>p.life<p.max).slice(-180);
    const T=t/1000;
    for(const s of this.sparkPts){const fl=still?1:.8+.25*Math.sin(T*23+s.ph)+.15*Math.random(), k=s.k, x=s.x, y=s.y;
      el('circle',{cx:x,cy:y,r:26*k*fl,fill:'#FF4A12',opacity:.55,filter:'url(#blur)'},g);
      const sway=still?0:3*k*Math.sin(T*9+s.ph), flame=(h,w,col,op)=>el('path',{d:`M${x+sway} ${y-h} C ${x+w} ${y-h*.45}, ${x+w*.85} ${y}, ${x} ${y+2} C ${x-w*.85} ${y}, ${x-w} ${y-h*.45}, ${x+sway} ${y-h} Z`,fill:col,opacity:op},g);
      flame(34*k*fl,11.5*k,'#FF5A1F',.9); flame(22*k*fl,7.5*k,'#FFB020',.95); flame(12*k*fl,4.5*k,'#FFF3B0',1);
      el('circle',{cx:x,cy:y,r:3.2*k,fill:'#FFFFFF'},g)}
    for(const p of this.sparks){const q=p.life/p.max, col=q<.3?'#FFFBE6':q<.6?'#FFD23F':'#FF6A1A';
      el('line',{x1:p.x,y1:p.y,x2:p.x-p.vx*.03,y2:p.y-p.vy*.03,stroke:col,'stroke-width':2.4*(1-q)+.5,'stroke-linecap':'round',opacity:1-q*.6},g)}}
  drawRubber(){let r=this.svg.querySelector('.rubber'); const c=this.comp(this.pending.c); const a=this.pinPos(c,this.pending.p); if(!a||!this.ptr)return;
    if(!r){r=el('path',{class:'rubber',stroke:this.wireColor,'stroke-width':4,'stroke-dasharray':'6 5',fill:'none','pointer-events':'none'},this.svg)}
    const pts=this.pending.pts||[]; r.setAttribute('d',(pts.length?roundPath([a,...pts],10):`M${a.x} ${a.y}`)+` L${this.ptr.x} ${this.ptr.y}`);
    this.svg.querySelectorAll('.pend-a').forEach(n=>n.remove()); pts.forEach(p=>el('circle',{cx:p.x,cy:p.y,r:4,fill:this.wireColor,class:'pend-a','pointer-events':'none'},this.svg))}
  renderStatus(){const R=this.result; if(!R){this.statusEl.innerHTML='';return}
    const m=R.motors.map(x=>`<span class="st ${x.spinning?'ok':''}">Motor ${x.spinning?(x.dir>0?'spinning ⟳':'spinning ⟲'):'stopped'}</span>`).join('');
    const l=R.leds.map(x=>`<span class="st ${x.on?'ok':''}">${x.key===x.id?'LED':'LED '+x.key.slice(-1)} ${x.on?'on':'off'}</span>`).join('')+(R.loads||[]).map(x=>`<span class="st ${x.active?'ok':''}">${LIB[this.comp(x.id).type].name} ${x.active?'on':'off'}</span>`).join('');
    const w=[...new Set(R.warnings.map(x=>x.msg))].map(x=>`<span class="st warn">⚠ ${x}</span>`).join('');
    this.statusEl.innerHTML=(m+l+w)||'<span class="st">Add components from the left, then connect their pins with wires.</span>'}
  frame(t){const dt=Math.min(0.05,(t-this.last)/1000); this.last=t;
    if(this.runner)this.runner.tick(t);
    if(this.result)for(const m of this.result.motors){if(!m.spinning)continue; const c=this.comp(m.id); if(!c)continue; c.angle=((c.angle||0)+m.v*dt*180)%360; const g=this.svg.querySelector(`[data-comp="${c.id}"] .rotor`); if(g)g.setAttribute('transform',`rotate(${c.angle} ${g.dataset.cx||42} ${g.dataset.cy||42})`)}
    if(this.sparkPts&&this.sparkPts.length)this.sparkTick(dt,t);
    if(this.host.isConnected)this.raf=requestAnimationFrame(this.frame.bind(this));}
  destroy(){cancelAnimationFrame(this.raf); document.removeEventListener('keydown',this.keyH); if(this.runner)this.runner.stop()}
  load(state){this.comps=state.comps.map(c=>({...c})); this.wires=state.wires.map(w=>({...w,a:{...w.a},b:{...w.b},...(w.pts?{pts:w.pts.map(p=>({...p}))}:{})})); this.nid=1+Math.max(0,...this.comps.map(c=>+c.id.slice(1)),...this.wires.map(w=>+w.id.slice(1))); this.changed()}
  save(){return JSON.parse(JSON.stringify({comps:this.comps.map(({lit,angle,gpioLed,...c})=>c),wires:this.wires}))}
  describe(){ // plain text netlist for the AI tutor
    const N=this.nets(); const groups={};
    for(const c of this.comps){if(c.type==='breadboard')continue; for(const p in LIB[c.type].pins){const r=N.f(N.key(c.id,p)); (groups[r]=groups[r]||[]).push(`${LIB[c.type].name}(${c.id}).${p}`)}}
    const nets=Object.values(groups).filter(g=>g.length>1).map(g=>g.join(' ↔ '));
    const R=this.result||this.solve();
    return `Components: ${this.comps.map(c=>LIB[c.type].name+(c.type==='switch'?` [${c.on?'ON':'OFF'}]`:'')).join(', ')}.\nConnections: ${nets.join('; ')||'none'}.\nState: ${R.motors.map(m=>'motor '+(m.spinning?'spinning':'stopped')).concat(R.leds.map(l=>'LED '+(l.on?'on':'off'))).join(', ')||'nothing running'}. ${R.warnings.map(w=>w.msg).join(' ')}`;
  }
}

/* ---------- Arduino runtime: transpile the learner's C++ to JS and run it against the sim ---------- */
function stripComments(s){return s.replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g,' ')).replace(/\/\/[^\n]*/g,'')}
function guardLoops(js){let out='',i=0; const re=/\b(while|for)\s*\(/g; let m;
  while((m=re.exec(js))){let j=m.index+m[0].length, d=1; while(j<js.length&&d){if(js[j]==='(')d++; else if(js[j]===')')d--; j++} let k=j; while(/\s/.test(js[k]))k++;
    if(js[k]==='{'){out+=js.slice(i,k+1)+'__g();'; i=k+1; re.lastIndex=k+1} else {out+=js.slice(i,j)+'{__g();'; // single statement loop: wrap until ;
      let e=js.indexOf(';',j); out+=js.slice(j,e+1)+'}'; i=e+1; re.lastIndex=e+1}}
  return out+js.slice(i)}
function lint(src){const lines=stripComments(src).split('\n');
  for(let i=0;i<lines.length;i++){const l=lines[i].trim(); if(!l||/^(if|else|for|while|switch|do|case|default|#|\}|\{|BluetoothSerial)/.test(l))continue;
    if(/^(void|int|long|float|bool|boolean|byte|char|unsigned|String|double)\b.*\)\s*\{?\s*$/.test(l))continue;
    const stmt=/^[A-Za-z_][\w.]*\s*\(.*\)\s*$/.test(l)||/^[A-Za-z_]\w*(\[[^\]]*\])?\s*(=|\+=|-=|\+\+|--)/.test(l)||/^(const\s+)?(int|long|float|bool|byte|char|String|double|unsigned\s+long)\s+\w+\s*=/.test(l);
    if(stmt&&!/;\s*(\}\s*)?$/.test(l)&&!/[{(,]\s*$/.test(l))return `Line ${i+1}: a ; is missing at the end. Every instruction ends with ;`}
  return null}
function transpile(src){
  let s=stripComments(src);
  s=s.replace(/^\s*#include[^\n]*/gm,'');
  s=s.replace(/^\s*#define\s+(\w+)\s+([^\n]+)/gm,(m,a,b)=>`const ${a} = ${b.trim()};`);
  s=s.replace(/\bBluetoothSerial\s+\w+\s*;/g,'');
  s=s.replace(/\b(Servo|DHT)\s+(\w+)\s*(?:\(([^)]*)\))?\s*;/g,(m,c,n,a)=>`let ${n} = new ${c}(${a||''});`);
  const T='(?:unsigned\\s+long|unsigned\\s+int|long\\s+long|void|int|long|float|double|bool|boolean|byte|char|String|uint8_t|uint16_t|uint32_t|int16_t|int32_t|size_t|word)';
  s=s.replace(new RegExp('\\b'+T+'\\s+(\\w+)\\s*\\(([^)]*)\\)\\s*\\{','g'),(m,name,params)=>{const ps=params.trim()===''||params.trim()==='void'?'':params.split(',').map(p=>p.trim().split(/\s+/).pop().replace(/[*&]/g,'')).join(', '); return `function ${name}(${ps}) {`});
  s=s.replace(new RegExp('\\b(?:const\\s+|static\\s+|volatile\\s+)*'+T+'\\s+(?=[A-Za-z_]\\w*\\s*(?:=|;|,|\\[))','g'),'let ');
  s=s.replace(/\blet\s+(\w+)\s*\[\s*\d*\s*\]\s*=\s*\{([^}]*)\}/g,'let $1 = [$2]');
  s=s.replace(/\blet\s+(\w+)\s*\[\s*(\d+)\s*\]\s*;/g,'let $1 = new Array($2).fill(0);');
  s=s.replace(/\((?:int|long|float|byte|char|unsigned\s+long)\)/g,'');
  s=s.replace(/'(\\?.)'/g,'"$1"');
  return guardLoops(s);
}
function roundPath(P,r){let d=`M${P[0].x} ${P[0].y}`; for(let i=1;i<P.length-1;i++){const p=P[i-1],c=P[i],n=P[i+1]; const l1=Math.hypot(c.x-p.x,c.y-p.y)||1, l2=Math.hypot(n.x-c.x,n.y-c.y)||1, k=Math.min(r,l1/2,l2/2); d+=` L${c.x-(c.x-p.x)/l1*k} ${c.y-(c.y-p.y)/l1*k} Q${c.x} ${c.y} ${c.x+(n.x-c.x)/l2*k} ${c.y+(n.y-c.y)/l2*k}`} const e=P[P.length-1]; return d+` L${e.x} ${e.y}`}
class Runner{
  constructor(sim,src,io={}){
    this.sim=sim; this.io=io; this.headless=!!io.headless; this.serial=''; this.btQueue=[]; this.serialIn=[]; this.err=null; this.queue=[]; this.vt=0; this.base=performance.now(); this.calls=0;
    sim.gpio={}; sim.runner=this; sim.testPins={};
    const self=this, gp=p=>{if(typeof p==='string'&&/^D?\d+$/.test(p))p=+String(p).replace('D',''); return p};
    const cur={}; this.cur=cur;
    const api={HIGH:1,LOW:0,INPUT:'INPUT',OUTPUT:'OUTPUT',INPUT_PULLUP:'INPUT_PULLUP',LED_BUILTIN:2,
      pinMode(p,m){p=gp(p); cur[p]={...(cur[p]||{}),mode:m}; if(m!=='OUTPUT'){delete cur[p].level;delete cur[p].duty}},
      digitalWrite(p,v){p=gp(p); const c=cur[p]||(cur[p]={mode:'INPUT'}); c.level=v?1:0; delete c.duty; if(c.mode!=='OUTPUT')self.warn(`Pin ${p} is not set as OUTPUT yet. Add pinMode(${p}, OUTPUT); in setup().`)},
      analogWrite(p,v){p=gp(p); const c=cur[p]||(cur[p]={mode:'OUTPUT'}); c.mode='OUTPUT'; c.duty=Math.max(0,Math.min(255,+v||0))/255},
      digitalRead(p){p=gp(p); self.g(); self.sync(); return self.sim.readPin(p)},
      analogRead(p){p=gp(p); self.g(); self.sync(); return self.sim.analogPin(p)},
      delay(ms){self.g(); self.stamp(); self.vt+=Math.max(0,+ms||0)},
      delayMicroseconds(us){self.g(); self.vt+=(+us||0)/1000},
      millis(){return Math.floor(self.vt+self.loopBase)}, micros(){return Math.floor((self.vt+self.loopBase)*1000)},
      pulseIn(p){p=gp(p); self.g(); self.sync(); return self.sim.sonarEcho(p)},
      tone(p){api.digitalWrite(p,1)}, noTone(p){api.digitalWrite(p,0)}, DHT11:11, DHT22:22,
      Servo:class{attach(p){this.p=gp(p)} write(a){if(this.p!=null)cur['S'+this.p]={angle:Math.max(0,Math.min(180,+a||0))}} read(){return (cur['S'+this.p]||{}).angle||0}},
      DHT:class{constructor(p){this.p=gp(p)} begin(){} readTemperature(){self.sync(); return self.sim.dhtValue(this.p,'temp')} readHumidity(){self.sync(); return self.sim.dhtValue(this.p,'hum')}},
      map(x,a,b,c,d){return Math.round((x-a)*(d-c)/(b-a)+c)}, constrain(x,a,b){return Math.min(b,Math.max(a,x))}, abs:Math.abs, min:Math.min, max:Math.max, random(a,b){return b===undefined?Math.floor(Math.random()*a):Math.floor(a+Math.random()*(b-a))},
      Serial:{begin(b){self.baud=b}, print(x){self.out(x,false)}, println(x){self.out(x===undefined?'':x,true)}, available(){return self.serialIn.length}, read(){return self.serialIn.length?self.serialIn.shift():-1}, write(x){self.out(x,false)}},
      SerialBT:{begin(n){self.btName=n||'ESP32'}, available(){self.g(); return self.btQueue.length}, read(){return self.btQueue.length?self.btQueue.shift():-1}, print(x){self.out(x,false)}, println(x){self.out(x??'',true)}},
      String:x=>String(x), Math, __g(){self.g()}};
    try{const lerr=lint(src); if(lerr)throw {message:lerr,lint:true}; const js=transpile(src); this.js=js;
      const fn=new Function('api',`with(api){\n${js}\n;return {setup: typeof setup==='function'?setup:null, loop: typeof loop==='function'?loop:null};}`);
      this.prog=fn(api);
      if(!this.prog.setup||!this.prog.loop)throw new Error(!this.prog.setup?'I can not find void setup() { }':'I can not find void loop() { }');
    }catch(e){this.fail(e); return}
    this.loopBase=0; this.vt=0; this.vtStart=this.headless?0:performance.now(); this.calls=0;
    try{this.prog.setup()}catch(e){this.fail(e); return}
    this.stamp(); this.nextLoopAt=this.vtStart+this.vt; this.loopBase=this.vt;
  }
  g(){if(++this.calls>200000)throw new Error('Your program got stuck in a loop that never ends. Check your while() or for().')}
  warn(m){if(!this.warned){this.warned=m; this.io.onWarn&&this.io.onWarn(m)}}
  out(x,nl){let s=typeof x==='number'&&!Number.isInteger(x)?(Math.round(x*100)/100).toString():String(x); if(nl)s+='\n'; this.serial+=s; if(this.serial.length>4000)this.serial=this.serial.slice(-3000); this.io.onSerial&&this.io.onSerial(this.serial)}
  sync(){this.sim.gpio=JSON.parse(JSON.stringify(this.cur)); this.sim.solve()}
  stamp(){this.queue.push({at:(this.vtStart||0)+this.vt,out:JSON.parse(JSON.stringify(this.cur))})}
  fail(e){this.err=friendlyError(e,this.js); this.dead=true; this.io.onError&&this.io.onError(this.err)}
  tick(now){ if(this.dead||this.paused)return;
    let changed=false; while(this.queue.length&&this.queue[0].at<=now){const q=this.queue.shift(); this.sim.gpio=q.out; changed=true}
    if(changed)this.sim.changedLight();
    if(!this.queue.length&&now>=this.nextLoopAt){this.vt=0; this.vtStart=now; this.loopBase=(now-this.base); this.calls=0;
      try{this.prog.loop()}catch(e){this.fail(e); return}
      this.stamp(); this.nextLoopAt=now+Math.max(16,this.vt)}}
  stop(){this.dead=true; if(this.sim.runner===this){this.sim.runner=null; this.sim.gpio={}; this.sim.changedLight()}}
  /* headless test: run `ms` of virtual time; hooks(t, sim, runner) can press buttons or send letters; returns a trace of states */
  static test(sim,src,ms,hooks){
    const saved=sim.save(), savedG=sim.gpio, savedRunner=sim.runner, savedTest=sim.testPins;
    if(savedRunner)savedRunner.paused=true;
    const r=new Runner(sim,src,{headless:true}); const trace=[]; let t=0;
    const snap=()=>{const res=sim.solve(); trace.push({t,leds:res.leds.map(l=>l.on),motors:res.motors.map(m=>m.dir),loads:(res.loads||[]).map(l=>({type:(sim.comp(l.id)||{}).type,on:l.active})),servo:Object.keys(sim.gpio||{}).filter(k=>/^S/.test(k)).map(k=>sim.gpio[k].angle),warn:res.warnings.map(w=>w.type),serial:r.serial})};
    if(!r.dead){
      hooks&&hooks(t,sim,r); for(const q of r.queue){sim.gpio=q.out} snap();
      let guard=0;
      while(t<ms&&guard++<3000){hooks&&hooks(t,sim,r); r.vt=0; r.queue=[]; r.vtStart=0; r.loopBase=t; r.calls=0;
        try{r.prog.loop()}catch(e){r.fail(e);break}
        r.stamp(); const base=t; for(const q of r.queue){sim.gpio=q.out; t=base+q.at; snap()} t=base+Math.max(20,r.vt)}
    }
    const out={error:r.err,trace,serial:r.serial,warned:r.warned};
    sim.runner=savedRunner; if(savedRunner)savedRunner.paused=false; sim.testPins=savedTest; sim.load(saved); sim.gpio=savedG; sim.changedLight();
    return out;
  }
}
Sim.prototype.changedLight=function(){const r=this.solve(); const sig=JSON.stringify([r.leds.map(l=>l.on?Math.round(Math.min(1,l.I/0.012)*10):0),r.motors.map(m=>Math.round(m.v*4)),r.warnings.map(w=>w.type),(this.effectiveGpio()[2]||{}).level]);
  if(sig!==this._sig){this._sig=sig; this.render(); this.emit()}};
function friendlyError(e,js){const m=String(e&&e.message||e); if(e&&e.lint)return m;
  if(/Unexpected token|missing|Unexpected end|Invalid or unexpected/.test(m))return 'There is a typo in your code: check your brackets { } ( ) and that each line ends with ;';
  if(/is not defined/.test(m)){const n=m.split(' ')[0]; return `I don't know what "${n}" is. Check the spelling, or create it before you use it.`}
  if(/is not a function/.test(m))return `"${m.split(' ')[0]}" is not a command I know. Check the spelling and capital letters.`;
  return m}

window.TookieSim={Sim,Runner,LIB,el,drawBody,ESP_L,ESP_R,gpioOf,WIRE_COLORS,BB,pinLabel,transpile};
})();
