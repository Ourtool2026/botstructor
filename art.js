/* Botstructor part art v2: closer to the real modules (still original drawings).
   Same size and pins as before; only the picture changes. Live states (LEDs, motion,
   distance, angle, relay click, spinning rotor) are kept. */
(function(){
const {LIB,el}=window.TookieSim;
const E=(t,a,p)=>el(t,a,p);
const MONO='Geist Mono,ui-monospace,monospace';
const T=(g,x,y,s,o={})=>{const t=E('text',{x,y,'font-size':o.size||8,'font-weight':o.w||700,fill:o.fill||'#fff','text-anchor':o.a||'middle','font-family':o.mono?MONO:'Geist,Inter,sans-serif','letter-spacing':o.ls||0},g); t.textContent=s; return t};
let uid=0;
function defs(g){const svg=g.ownerSVGElement; if(!svg)return; if(svg.querySelector('#bsMetal'))return; const d=E('defs',{},svg);
  const lg=(id,stops,x2=0,y2=1)=>{const l=E('linearGradient',{id,x1:0,y1:0,x2,y2},d); stops.forEach(([o,c,op])=>E('stop',{offset:o,'stop-color':c,'stop-opacity':op??1},l))};
  lg('bsMetal',[[0,'#F4F6F8'],[.45,'#BFC5CD'],[.55,'#AEB5BE'],[1,'#E3E7EB']],1,1);
  lg('bsMetalV',[[0,'#EEF1F4'],[.5,'#B5BCC5'],[1,'#8E96A1']]);
  lg('bsGloss',[[0,'#fff',.22],[.5,'#fff',0],[1,'#000',.18]]);
  lg('bsBlue',[[0,'#2F7BEF'],[1,'#1450B8']]);
  lg('bsRed',[[0,'#E53935'],[1,'#B71C1C']]);
  lg('bsBlack',[[0,'#2A2E35'],[1,'#121418']]);
  lg('bsYellow',[[0,'#FFD54A'],[1,'#E0A800']]);
  lg('bsServo',[[0,'#3D8BFF'],[1,'#1F5FCC']]);
  const p=E('pattern',{id:'bsMesh',width:4,height:4,patternUnits:'userSpaceOnUse'},d); E('rect',{width:4,height:4,fill:'#5C636D'},p); E('circle',{cx:2,cy:2,r:1.1,fill:'#2A2E35'},p);
  if(!svg.querySelector('#blur')){const f=E('filter',{id:'blur',x:'-50%',y:'-50%',width:'200%',height:'200%'},d); E('feGaussianBlur',{stdDeviation:3},f)}}
// a PCB with thickness, soft shadow, silkscreen border, mounting holes
function board(g,x,y,w,h,fill,o={}){const r=o.r??5;
  E('rect',{x:x+1,y:y+5,width:w,height:h,rx:r,fill:'#000',opacity:.35,filter:'url(#blur)'},g);
  E('rect',{x,y:y+2.5,width:w,height:h,rx:r,fill,filter:'brightness(.55)'},g); E('rect',{x,y:y+2.5,width:w,height:h,rx:r,fill:'#000',opacity:.4},g);
  E('rect',{x,y,width:w,height:h,rx:r,fill},g); E('rect',{x:x+.5,y:y+.5,width:w-1,height:h-1,rx:r,fill:'url(#bsGloss)',stroke:'#ffffff26'},g);
  if(o.silk!==false)E('rect',{x:x+3,y:y+3,width:w-6,height:h-6,rx:Math.max(1,r-2),fill:'none',stroke:'#ffffff30','stroke-width':.6},g);
  if(o.holes)[[x+5,y+5],[x+w-5,y+5],[x+5,y+h-5],[x+w-5,y+h-5]].forEach(([a,b])=>{E('circle',{cx:a,cy:b,r:3,fill:'#D9B44A'},g);E('circle',{cx:a,cy:b,r:1.7,fill:'#111'},g)})}
function smd(g,x,y,w=5,h=2.6,c='#2A2E35'){E('rect',{x,y,width:w,height:h,rx:.4,fill:c},g); E('rect',{x,y,width:1,height:h,fill:'#C9CED6'},g); E('rect',{x:x+w-1,y,width:1,height:h,fill:'#C9CED6'},g)}
function led(g,x,y,col,on,r=2.4){if(on)E('circle',{cx:x,cy:y,r:r*3,fill:col,opacity:.55,filter:'url(#blur)'},g); E('rect',{x:x-r,y:y-r*.7,width:r*2,height:r*1.4,rx:.6,fill:on?col:'#3A3F48',stroke:'#00000055'},g)}
// male header pins along the bottom, to the pin coordinates, with gold tips + labels
function headerB(g,s,labels=true){const pins=Object.entries(s.pins); const ys=pins.map(([,p])=>p[1]); const by=Math.min(...ys);
  pins.forEach(([n,[x,y]])=>{E('rect',{x:x-3,y:s.h-1,width:6,height:5,fill:'#15171B'},g); E('rect',{x:x-1.1,y:s.h+3,width:2.2,height:y-s.h-3,fill:'url(#bsMetalV)'},g); if(labels)T(g,x,s.h-4,n.replace(/_.*/,''),{size:5.6,mono:1,fill:'#ffffffd0'})})}
function legsSide(g,s,side){for(const [n,[x,y]] of Object.entries(s.pins)){if(side==='l'&&x<0){E('rect',{x:x+2,y:y-1.1,width:-x-2,height:2.2,fill:'url(#bsMetal)'},g)} if(side==='r'&&x>s.w){E('rect',{x:s.w,y:y-1.1,width:x-s.w-2,height:2.2,fill:'url(#bsMetal)'},g)}}}
function wireLeads(g,list){list.forEach(([x1,y1,x2,y2,c])=>{E('path',{d:`M${x1} ${y1} L${x2} ${y2}`,stroke:'#0006','stroke-width':3.6,'stroke-linecap':'round'},g); E('path',{d:`M${x1} ${y1} L${x2} ${y2}`,stroke:c,'stroke-width':2.6,'stroke-linecap':'round'},g)})}
const set=(id,fn)=>{if(!LIB[id])return; LIB[id].draw=(c,g)=>{defs(g); fn(c,g,LIB[id])}};

/* ESP32 DevKit V1 (30 pin) */
set('esp32',(c,g,s)=>{const W=150,H=338;
  board(g,0,0,W,H,'#1B1E24',{r:7,silk:false});
  for(let i=0;i<15;i++){[[8,34+i*20],[142,34+i*20]].forEach(([x,y])=>{E('circle',{cx:x,cy:y,r:4,fill:'#C9A227'},g);E('circle',{cx:x,cy:y,r:2,fill:'#0b0b0c'},g)})}
  // WROOM module: PCB antenna + metal shield
  E('rect',{x:30,y:8,width:90,height:150,rx:3,fill:'#20242C',stroke:'#0b0b0c'},g);
  E('path',{d:'M38 16 h10 v14 h8 v-14 h8 v14 h8 v-14 h8 v14 h8 v-14 h10 v18 h-62 z',fill:'none',stroke:'#C9A227','stroke-width':2},g);
  E('rect',{x:34,y:44,width:82,height:108,rx:3,fill:'url(#bsMetal)',stroke:'#7D8591'},g);
  E('rect',{x:34,y:44,width:82,height:108,rx:3,fill:'url(#bsGloss)'},g);
  T(g,75,82,'ESP32',{size:14,fill:'#2B3038',w:800}); T(g,75,96,'ESP-WROOM-32',{size:6.5,fill:'#4A515C',mono:1}); T(g,75,110,'Wi-Fi + Bluetooth',{size:6.5,fill:'#4A515C'});
  E('rect',{x:62,y:122,width:26,height:14,rx:1,fill:'none',stroke:'#7D859199'},g); T(g,75,132,'FCC',{size:6,fill:'#6A717C',mono:1});
  // regulator, chips, buttons, LEDs, USB
  E('rect',{x:94,y:196,width:24,height:16,rx:1.5,fill:'#2A2E35'},g); E('rect',{x:98,y:212,width:16,height:4,fill:'#C9CED6'},g); T(g,106,207,'AMS',{size:5,mono:1,fill:'#9AA1AC'});
  E('rect',{x:36,y:226,width:30,height:30,rx:2,fill:'#16181C'},g); T(g,51,244,'CP2102',{size:5,mono:1,fill:'#8A919E'});
  [[36,286],[96,286]].forEach(([x,y])=>{E('rect',{x,y,width:18,height:14,rx:2,fill:'url(#bsMetal)'},g);E('circle',{cx:x+9,cy:y+7,r:4,fill:'#1A1D23'},g)}); T(g,45,310,'EN',{size:5.5,mono:1,fill:'#AEB4BF'}); T(g,105,310,'BOOT',{size:5.5,mono:1,fill:'#AEB4BF'});
  smd(g,80,232); smd(g,80,240); smd(g,80,248); smd(g,40,200,6,3,'#B87333'); smd(g,52,200,6,3,'#B87333');
  led(g,118,300,'#FF4D4D',true,2.2); E('circle',{cx:75,cy:180,r:6,fill:'none',stroke:'#ffffff22'},g); led(g,75,180,'#3DA8FF',!!c.gpioLed,2.6);
  E('rect',{x:57,y:318,width:36,height:22,rx:3,fill:'url(#bsMetal)',stroke:'#7D8591'},g); E('rect',{x:63,y:330,width:24,height:5,rx:1.5,fill:'#3A3F48'},g);
  const pl=(arr,x,a)=>arr.forEach((p,i)=>T(g,x,34+i*20+2.6,p==='GND2'?'GND':p,{size:7.5,mono:1,fill:'#C8CDD5',a,w:600}));
  const {ESP_L,ESP_R}=window.TookieSim; pl(ESP_L,14,'start'); pl(ESP_R,136,'end');
});

/* HC-SR04 */
set('hcsr04',(c,g,s)=>{board(g,0,0,s.w,s.h,'url(#bsBlue)',{holes:true});
  [[30,30],[90,30]].forEach(([x,y],i)=>{E('circle',{cx:x,cy:y+2,r:24,fill:'#0006',filter:'url(#blur)'},g); E('circle',{cx:x,cy:y,r:23,fill:'url(#bsMetal)',stroke:'#6E7682'},g); E('circle',{cx:x,cy:y,r:18,fill:'#3E444D'},g); E('circle',{cx:x,cy:y,r:17,fill:'url(#bsMesh)'},g); E('circle',{cx:x,cy:y,r:17,fill:'url(#bsGloss)'},g); T(g,x,y+33,i?'R':'T',{size:6,mono:1,fill:'#ffffffb0'})});
  E('rect',{x:52,y:5,width:16,height:7,rx:3.5,fill:'url(#bsMetal)',stroke:'#7D8591'},g); T(g,60,22,'HC-SR04',{size:5.4,mono:1,fill:'#ffffffd0'});
  smd(g,55,40); smd(g,55,46); headerB(g,s,false); ['VCC','Trig','Echo','Gnd'].forEach((n,i)=>T(g,[39,53,67,81][i],s.h-4,n,{size:5,mono:1,fill:'#ffffffd0'}));
  if(!c.pal)T(g,60,-7,(c.dist??30)+' cm',{size:9,mono:1,fill:'#D7FF3A'})});

/* L298N */
set('l298n',(c,g,s)=>{board(g,0,0,170,156,'url(#bsRed)',{r:6,holes:true});
  // heatsink
  E('rect',{x:48,y:-12,width:74,height:66,rx:3,fill:'#0006',filter:'url(#blur)'},g); E('rect',{x:48,y:-14,width:74,height:64,rx:3,fill:'url(#bsBlack)'},g);
  for(let i=0;i<8;i++)E('rect',{x:52+i*8.7,y:-12,width:5,height:58,rx:1.5,fill:'#3B414B'},g); E('rect',{x:48,y:-14,width:74,height:64,rx:3,fill:'url(#bsGloss)'},g);
  E('rect',{x:62,y:52,width:46,height:12,rx:1,fill:'#16181C'},g); T(g,85,61,'L298N',{size:7,mono:1,fill:'#C8CDD5'});
  // screw terminals (blue) for outputs and power
  const term=(x,y,w,h,n)=>{E('rect',{x,y,width:w,height:h,rx:2,fill:'#1E6FD9',stroke:'#0E3F99'},g); for(let i=0;i<n;i++){const cx=x+w/2, cy=y+(h/n)*(i+.5); E('circle',{cx,cy,r:4.2,fill:'url(#bsMetal)',stroke:'#6E7682'},g); E('path',{d:`M${cx-3} ${cy} h6`,stroke:'#555',ws:1},g)}};
  term(2,32,18,54,2); term(150,32,18,54,2); term(10,118,58,20,1); E('rect',{x:10,y:118,width:58,height:20,rx:2,fill:'#1E6FD9',stroke:'#0E3F99'},g); [18,38,58].forEach(x=>{E('circle',{cx:x,cy:128,r:4.2,fill:'url(#bsMetal)',stroke:'#6E7682'},g)});
  // capacitors + jumpers + logic header
  [[40,86],[130,86]].forEach(([x,y])=>{E('circle',{cx:x,cy:y,r:9,fill:'#14161A',stroke:'#2A2E35'},g); E('path',{d:`M${x-9} ${y} a9 9 0 0 0 18 0`,fill:'#3A3F48'},g); E('circle',{cx:x,cy:y,r:9,fill:'url(#bsGloss)'},g)});
  E('rect',{x:80,y:118,width:84,height:14,rx:1.5,fill:'#15171B'},g); [86,156].forEach(x=>E('rect',{x:x-4,y:116,width:8,height:10,rx:1,fill:'#1A1D23',stroke:'#C9A227'},g));
  led(g,108,86,'#FF4D4D',true,2.2); T(g,24,64,'OUT1',{size:6,mono:1,fill:'#ffffffcc',a:'start'}); T(g,24,78,'OUT2',{size:6,mono:1,fill:'#ffffffcc',a:'start'}); T(g,146,64,'OUT3',{size:6,mono:1,fill:'#ffffffcc',a:'end'}); T(g,146,78,'OUT4',{size:6,mono:1,fill:'#ffffffcc',a:'end'});
  for(const [n,[x,y]] of Object.entries(s.pins)){if(y>156){E('rect',{x:x-1.1,y:150,width:2.2,height:y-150,fill:'url(#bsMetalV)'},g); T(g,x,148,n,{size:5.4,mono:1,fill:'#fff'})}}
  for(const [n,[x,y]] of Object.entries(s.pins)){if(x<0)E('rect',{x:x,y:y-1.1,width:-x+4,height:2.2,fill:'url(#bsMetal)'},g); if(x>170)E('rect',{x:166,y:y-1.1,width:x-166,height:2.2,fill:'url(#bsMetal)'},g)}});

/* SG90 servo */
set('servo',(c,g,s)=>{const a=(c.servoAngle??90)-90;
  E('rect',{x:-2,y:10,width:92,height:30,rx:4,fill:'#0006',filter:'url(#blur)'},g);
  E('rect',{x:-6,y:14,width:96,height:14,rx:3,fill:'url(#bsServo)',opacity:.9},g); [[-1,21],[85,21]].forEach(([x,y])=>{E('circle',{cx:x,cy:y,r:2.6,fill:'#0b2a66'},g)});
  E('rect',{x:4,y:4,width:76,height:36,rx:4,fill:'url(#bsServo)',stroke:'#123E8F'},g); E('rect',{x:4,y:4,width:76,height:36,rx:4,fill:'url(#bsGloss)'},g);
  E('rect',{x:34,y:12,width:40,height:20,rx:2,fill:'#ffffff1f'},g); T(g,54,21,'TowerPro',{size:5,fill:'#ffffffcc'}); T(g,54,29,'SG90',{size:7,fill:'#fff',w:800});
  E('circle',{cx:22,cy:22,r:12,fill:'#2C67D8',stroke:'#123E8F'},g);
  const h=E('g',{transform:`rotate(${a} 22 22)`},g); E('path',{d:'M18 22 L19.5 -12 Q22 -16 24.5 -12 L26 22 Z',fill:'#F2F3F5',stroke:'#C9CED6'},h); [-6,0,6,12].forEach(y=>E('circle',{cx:22,cy:y,r:1,fill:'#9AA1AC'},h)); E('circle',{cx:22,cy:22,r:7,fill:'#F2F3F5',stroke:'#C9CED6'},h); E('circle',{cx:22,cy:22,r:2.2,fill:'#8A919E'},h);
  wireLeads(g,[[4,12,-10,12,'#6B3A1E'],[4,22,-10,22,'#FF3B30'],[4,32,-10,32,'#FF8A2A']]);
  if(!c.pal)T(g,54,-6,(c.servoAngle??90)+'°',{size:9,mono:1,fill:'#D7FF3A'})});

/* 1-channel relay module */
set('relay',(c,g,s)=>{board(g,0,0,s.w,s.h,'url(#bsBlue)',{holes:true});
  E('rect',{x:26,y:8,width:50,height:44,rx:3,fill:'#0006',filter:'url(#blur)'},g); E('rect',{x:24,y:6,width:50,height:44,rx:3,fill:'#2B6CDB',stroke:'#173E85'},g); E('rect',{x:24,y:6,width:50,height:44,rx:3,fill:'url(#bsGloss)'},g);
  T(g,49,18,'SONGLE',{size:6,fill:'#fff',w:800}); T(g,49,27,'SRD-05VDC-SL-C',{size:4,mono:1,fill:'#ffffffd0'}); T(g,49,35,'10A 250VAC',{size:4,mono:1,fill:'#ffffffb0'}); T(g,49,42,'10A 30VDC',{size:4,mono:1,fill:'#ffffffb0'});
  E('rect',{x:84,y:6,width:22,height:56,rx:2,fill:'#1E7F4F',stroke:'#0E4D2E'},g); [16,33,50].forEach((y,i)=>{E('circle',{cx:95,cy:y,r:5,fill:'url(#bsMetal)',stroke:'#6E7682'},g); E('path',{d:`M${92} ${y} h6`,stroke:'#555'},g); T(g,80,y+2,['COM','NO','NC'][i],{size:4.5,mono:1,fill:'#ffffffcc',a:'end'})});
  led(g,14,58,'#FF4D4D',!!c.relayOn,2.2); led(g,14,8,'#FF4D4D',true,1.8); smd(g,8,26); smd(g,8,38);
  [['VCC',16],['GND',33],['IN',50]].forEach(([n,y])=>T(g,6,y+2,n,{size:5,mono:1,fill:'#ffffffd0',a:'start'})); legsSide(g,s,'l'); legsSide(g,s,'r');
  if(c.relayOn&&!c.pal)T(g,49,-6,'click!',{size:8,mono:1,fill:'#D7FF3A'})});

/* PIR HC-SR501 */
set('pir',(c,g,s)=>{board(g,0,0,s.w,s.h,'#1F7A3A',{holes:false});
  E('circle',{cx:35,cy:34,r:30,fill:'#0005',filter:'url(#blur)'},g);
  E('circle',{cx:35,cy:32,r:29,fill:'#F7F8FA',stroke:'#D5D9DF'},g);
  for(let r=0;r<3;r++)for(let i=0;i<8;i++){const ang=i*45+r*22, rr=8+r*8; const x=35+Math.cos(ang*Math.PI/180)*rr, y=32+Math.sin(ang*Math.PI/180)*rr; E('rect',{x:x-3.4,y:y-3.4,width:6.8,height:6.8,rx:1.2,fill:'#E6E9EE',stroke:'#D0D5DC','stroke-width':.6,transform:`rotate(${ang} ${x} ${y})`},g)}
  E('ellipse',{cx:27,cy:20,rx:12,ry:7,fill:'#fff',opacity:.7},g);
  headerB(g,s); if(c.motion&&!c.pal)T(g,35,-6,'motion!',{size:9,fill:'#D7FF3A'})});

/* TT gear motor (yellow gearbox, white double-D shaft) */
set('tt_motor',(c,g,s)=>{E('rect',{x:2,y:8,width:108,height:42,rx:6,fill:'#0005',filter:'url(#blur)'},g);
  E('rect',{x:0,y:4,width:78,height:42,rx:5,fill:'url(#bsYellow)',stroke:'#B07F00'},g); E('rect',{x:0,y:4,width:78,height:42,rx:5,fill:'url(#bsGloss)'},g);
  [[8,12],[8,38],[70,12],[70,38]].forEach(([x,y])=>E('circle',{cx:x,cy:y,r:2,fill:'#B07F00'},g));
  E('rect',{x:76,y:10,width:34,height:30,rx:12,fill:'url(#bsMetal)',stroke:'#7D8591'},g); E('rect',{x:104,y:18,width:6,height:14,rx:2,fill:'#7D8591'},g);
  E('rect',{x:86,y:40,width:6,height:8,fill:'#C9A227'},g); E('rect',{x:100,y:40,width:6,height:8,fill:'#C9A227'},g);
  const r=E('g',{class:'rotor',transform:`rotate(${c.angle||0} 30 25)`,'data-cx':30,'data-cy':25},g); E('circle',{cx:30,cy:25,r:9,fill:'#F2F3F5',stroke:'#C9CED6'},r); E('rect',{x:26.5,y:14,width:7,height:22,rx:1.5,fill:'#fff',stroke:'#C9CED6'},r);
  T(g,50,40,'1:48',{size:6,mono:1,fill:'#7A5600'});
  wireLeads(g,[[89,46,90,58,'#FF3B30'],[103,46,104,58,'#1A1D23']])});

/* DC motor (130 size), seen from the shaft end so you can watch it spin */
set('motor',(c,g,s)=>{E('circle',{cx:42,cy:46,r:42,fill:'#0005',filter:'url(#blur)'},g);
  E('circle',{cx:42,cy:42,r:40,fill:'url(#bsMetal)',stroke:'#6E7682','stroke-width':1.5},g); E('circle',{cx:42,cy:42,r:34,fill:'none',stroke:'#ffffff66'},g);
  E('circle',{cx:42,cy:42,r:13,fill:'#2A2E35'},g);
  const r=E('g',{class:'rotor',transform:`rotate(${c.angle||0} 42 42)`},g); E('circle',{cx:42,cy:42,r:30,fill:'none',stroke:'#00000000'},r); E('path',{d:'M42 16 L48 42 L42 68 L36 42 Z',fill:'#FF7A1A',opacity:.95},r); E('circle',{cx:42,cy:42,r:5,fill:'#ECEEF2'},r);
  [[18,78,'#FF3B30'],[54,78,'#3A3F48']].forEach(([x,y,col])=>{E('rect',{x:x+2,y,width:12,height:8,rx:1,fill:col},g)});
  E('path',{d:'M28 84 V98 M56 84 V98',stroke:'url(#bsMetalV)','stroke-width':3},g);
  if(c.spinning&&!c.pal)T(g,42,-6,'spinning',{size:8.5,mono:1,fill:'#D7FF3A'})});

/* Battery holders */
const cell=(g,x,y,w,h,label)=>{E('rect',{x,y,width:w,height:h,rx:h/2,fill:'url(#bsMetal)'},g); E('rect',{x:x+6,y,width:w-16,height:h,fill:label==='18650'?'#2F7BEF':'#E0A800'},g); E('rect',{x:x+6,y,width:w-16,height:h,fill:'url(#bsGloss)'},g); T(g,x+w/2-4,y+h/2+2.5,label,{size:6.5,mono:1,fill:label==='18650'?'#fff':'#3A2A00'})};
['battery','battery74'].forEach(id=>set(id,(c,g,s)=>{const w=s.w; E('rect',{x:1,y:5,width:w,height:56,rx:8,fill:'#0005',filter:'url(#blur)'},g);
  E('rect',{x:0,y:0,width:w,height:56,rx:8,fill:'url(#bsBlack)',stroke:'#3A3F4A'},g);
  if(id==='battery'){cell(g,8,8,w-16,18,'AA 1.5V'); cell(g,8,31,w-16,18,'AA 1.5V')} else {cell(g,8,8,w-16,18,'18650'); cell(g,8,31,w-16,18,'18650')}
  wireLeads(g,[[w-2,16,w+12,16,'#FF3B30'],[w-2,40,w+12,40,'#1A1D23']]); T(g,w-8,13,'+',{size:9,fill:'#FF5A4E',w:900}); T(g,w-8,47,'−',{size:9,fill:'#9AA1AC',w:900});
  T(g,w/2,70,id==='battery'?'2 × AA = 3 V':'2 × 18650 = 7.4 V',{size:9,fill:'#8A919E',w:600})}));

/* Active buzzer */
set('buzzer',(c,g,s)=>{E('circle',{cx:20,cy:23,r:19,fill:'#0005',filter:'url(#blur)'},g); E('circle',{cx:20,cy:20,r:19,fill:'url(#bsBlack)',stroke:'#3A3F48'},g); E('circle',{cx:20,cy:20,r:15,fill:'none',stroke:'#ffffff14'},g);
  E('circle',{cx:20,cy:20,r:3.5,fill:'#0b0b0c'},g); E('rect',{x:9,y:6,width:22,height:7,rx:2,fill:'#F2F3F5',opacity:.9},g); T(g,20,11.5,'REMOVE',{size:3.6,mono:1,fill:'#333'}); T(g,7,30,'+',{size:8,fill:'#FF5A4E'});
  if(c.active)[0,1,2].forEach(i=>E('path',{d:`M${42+i*6} ${8-i*3} a${14+i*6} ${14+i*6} 0 0 1 0 ${24+i*6}`,stroke:'#D7FF3A','stroke-width':2,fill:'none',opacity:1-i*.25},g));
  E('path',{d:'M13 38 V49 M27 38 V45',stroke:'url(#bsMetalV)','stroke-width':2.2},g)});

/* IR obstacle sensor */
set('ir_obstacle',(c,g,s)=>{board(g,0,0,s.w,s.h,'#1A1D23',{holes:false});
  E('rect',{x:7,y:-14,width:12,height:22,rx:6,fill:'#F2F3F5',stroke:'#C9CED6'},g); E('rect',{x:27,y:-14,width:12,height:22,rx:6,fill:'#22252B',stroke:'#3A3F48'},g);
  E('circle',{cx:23,cy:38,r:8,fill:'#1E6FD9',stroke:'#0E3F99'},g); E('path',{d:'M23 31 v14 M17 38 h12',stroke:'#F2F3F5','stroke-width':2},g); T(g,23,56,'LM393',{size:5,mono:1,fill:'#8A919E'});
  led(g,12,66,'#3DF58A',!!c.detect,2); led(g,34,66,'#FF4D4D',true,2); headerB(g,s);
  if(c.detect&&!c.pal){E('rect',{x:-4,y:-42,width:54,height:16,rx:3,fill:'#FF7A1A'},g); T(g,23,-31,'object',{size:7,fill:'#1a0d00'})}});

/* DHT11 */
set('dht11',(c,g,s)=>{E('rect',{x:1,y:4,width:40,height:56,rx:4,fill:'#0005',filter:'url(#blur)'},g); E('rect',{x:0,y:0,width:40,height:56,rx:4,fill:'#4FB3FF',stroke:'#1E6FD9'},g);
  for(let i=0;i<6;i++)for(let j=0;j<3;j++)E('rect',{x:6+j*10.5,y:5+i*7.5,width:7,height:4.5,rx:1,fill:'#1E5BB8'},g); E('rect',{x:0,y:0,width:40,height:56,rx:4,fill:'url(#bsGloss)'},g);
  for(const [n,[x,y]] of Object.entries(s.pins)){E('rect',{x:x-1.1,y:52,width:2.2,height:y-52,fill:'url(#bsMetalV)'},g)}
  T(g,6,63,'+',{size:6,fill:'#FF5A4E'}); if(!c.pal)T(g,20,-6,(c.temp??30)+'°C · '+(c.hum??60)+'%',{size:8,mono:1,fill:'#D7FF3A'})});
})();
