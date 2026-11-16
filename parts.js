/* Instructor part library: 50 robotics components with original illustrations, pins and simple behaviours.
   sim: 'full' = simulated electrically, 'plan' = wire it to plan a project (not simulated yet). */
(function(){
const {LIB,el}=window.TookieSim;
const E=(t,a,p)=>el(t,a,p);
const MONO='Geist Mono,ui-monospace,monospace';
function T(g,x,y,s,o={}){const t=E('text',{x,y,'font-size':o.size||9,'font-weight':o.w||700,fill:o.fill||'#fff','text-anchor':o.a||'middle','font-family':o.mono?MONO:'Geist,Inter,sans-serif'},g); t.textContent=s; return t}
function pcb(g,w,h,fill,o={}){const r=o.r??6; E('rect',{x:1,y:4,width:w,height:h,rx:r,fill:'#000',opacity:.28,filter:'url(#blur)'},g); E('rect',{x:0,y:2.5,width:w,height:h,rx:r,fill},g); E('rect',{x:0,y:2.5,width:w,height:h,rx:r,fill:'#000',opacity:.38},g); E('rect',{x:0,y:0,width:w,height:h,rx:r,fill,stroke:o.stroke||'#00000066'},g); E('rect',{x:.5,y:.5,width:w-1,height:h-1,rx:r,fill:'url(#tkGloss)',stroke:'#ffffff22'},g); if(o.holes!==false)[[6,6],[w-6,6],[6,h-6],[w-6,h-6]].forEach(([x,y])=>E('circle',{cx:x,cy:y,r:2.6,fill:'#0000004d',stroke:'#C9A22777'},g))}
// header pins along an edge: returns pins map. side 'b' bottom, 't' top, 'l' left, 'r' right
function hdr(names,w,h,side='b',start,step=14){const P={}; const n=names.length; const span=(n-1)*step;
  names.forEach((nm,i)=>{const off=(start??((side==='b'||side==='t'?w:h)-span)/2)+i*step; if(side==='b')P[nm]=[off,h+9]; if(side==='t')P[nm]=[off,-9]; if(side==='l')P[nm]=[-9,off]; if(side==='r')P[nm]=[w+9,off]}); return P}
function legs(g,spec,labels=true,inside=true){const {w,h,pins}=spec; for(const [nm,[x,y]] of Object.entries(pins)){let d; if(y>h)d=`M${x} ${h} V${y}`; else if(y<0)d=`M${x} 0 V${y}`; else if(x<0)d=`M0 ${y} H${x}`; else if(x>w)d=`M${w} ${y} H${x}`; if(d)E('path',{d,stroke:'#C9CED6','stroke-width':2.2},g);
    if(labels){let lx=x,ly=y,a='middle'; if(y>h){ly=h-5} else if(y<0){ly=9} else if(x<0){lx=5;ly=y+3;a='start'} else if(x>w){lx=w-5;ly=y+3;a='end'} if(inside)T(g,lx,ly,nm.replace(/_.*/,''),{size:6.5,mono:1,fill:'#ffffffcc',a})}}}
function can(g,cx,cy,r){E('circle',{cx,cy,r,fill:'#C9CED6',stroke:'#8A919E'},g); E('circle',{cx,cy,r:r*.82,fill:'#3E434C'},g); E('circle',{cx,cy,r:r*.82,fill:'url(#tkMesh)',opacity:.6},g)}
function ensureDefs(g){const svg=g.ownerSVGElement; if(!svg||svg.querySelector('#tkMesh'))return; const d=E('defs',{},svg); const lg=E('linearGradient',{id:'tkGloss',x1:0,y1:0,x2:0,y2:1},d); E('stop',{offset:0,'stop-color':'#fff','stop-opacity':.16},lg); E('stop',{offset:.45,'stop-color':'#fff','stop-opacity':0},lg); E('stop',{offset:1,'stop-color':'#000','stop-opacity':.12},lg); if(!svg.querySelector('#blur')){const f=E('filter',{id:'blur',x:'-50%',y:'-50%',width:'200%',height:'200%'},d); E('feGaussianBlur',{stdDeviation:3},f)} const p=E('pattern',{id:'tkMesh',width:5,height:5,patternUnits:'userSpaceOnUse'},d); E('circle',{cx:2.5,cy:2.5,r:1.1,fill:'#9AA3B2'},p)}
const dip=(g,x,y,w,h,label)=>{E('rect',{x,y,width:w,height:h,rx:2,fill:'#1A1D23'},g); for(let i=0;i<Math.floor(w/7);i++){E('rect',{x:x+3+i*7,y:y-3,width:3,height:3,fill:'#C9CED6'},g);E('rect',{x:x+3+i*7,y:y+h,width:3,height:3,fill:'#C9CED6'},g)} if(label)T(g,x+w/2,y+h/2+3,label,{size:6,mono:1,fill:'#AEB4BF'})};
const usb=(g,x,y,w=22,h=16)=>{E('rect',{x,y,width:w,height:h,rx:2,fill:'#B8BEC7',stroke:'#7D8591'},g)};
const powered=(ctx,vcc,gnd,min=2.7)=>{const a=ctx.V(vcc), b=ctx.V(gnd); return a!=null&&b!=null&&a-b>=min?a-b:0};
const glow=(g,cx,cy,r,col,on)=>{if(on)E('circle',{cx,cy,r:r*2.4,fill:col,opacity:.35,filter:'url(#blur)'},g); E('circle',{cx,cy,r,fill:on?col:'#3A3F48'},g)};

function add(id,spec){
  if(spec.pinsFn)spec.pins=spec.pinsFn(spec);
  const base=LIB[id]||{}; LIB[id]=Object.assign(base,spec);
  if(spec.draw){const d=spec.draw; LIB[id].draw=(c,g)=>{ensureDefs(g); d(c,g,LIB[id])}}
}
/* --- core parts already simulated in sim.js: add category, description, search tags --- */
const META={
 esp32:['Boards','The brain: dual-core microcontroller with Wi-Fi and Bluetooth. Runs your code.','microcontroller wifi bluetooth brain','full'],
 battery:['Power','2 × AA cells in series = 3 V. Good for small motors and LEDs.','aa cell power','full'],
 battery74:['Power','2 × 18650 Li-ion = 7.4 V. Powers motors through the L298N.','lithium 18650 lipo power','full'],
 switch:['Basic','Slide switch: opens or closes a circuit.','toggle on off','full'],
 button:['Basic','Tactile push button: connects only while pressed.','tactile push','full'],
 resistor:['Basic','220 Ω resistor: protects LEDs from too much current.','ohm resistance','full'],
 led:['Basic','Red LED: lights when current flows from long leg (+) to short leg (−).','light diode red','full'],
 motor:['Actuators','DC motor: spins when current flows. Swap wires to reverse.','dc spin','full'],
 breadboard:['Basic','Breadboard: each column of 5 holes is connected; rails run along the edges.','prototype board','full'],
 l298n:['Drivers','Dual H-bridge: lets the ESP32 drive two motors in both directions with speed control.','h-bridge motor driver','full']};
for(const [k,[cat,desc,tags,sim]] of Object.entries(META))Object.assign(LIB[k],{cat,desc,tags,sim});
LIB.button.hold=true; LIB.switch.toggle='on';

/* ================= BOARDS ================= */
add('arduino_uno',{name:'Arduino Uno',cat:'Boards',sim:'plan',tags:'atmega328 arduino 5v',desc:'Classic 5 V beginner board (ATmega328P). Great for learning, no Wi-Fi.',w:210,h:150,
  pinsFn:s=>({...hdr(['D13','D12','D11','D10','D9','D8','D7','D6','D5','D4','D3','D2'],s.w,s.h,'t',52),...hdr(['3V3','5V','GND','VIN','A0','A1','A2','A3','A4','A5'],s.w,s.h,'b',60)}),
  draw:(c,g,s)=>{pcb(g,s.w,s.h,'#00878F'); usb(g,-6,20,30,26); E('rect',{x:-4,y:96,width:26,height:30,rx:3,fill:'#1A1D23'},g); dip(g,96,82,92,22,'ATMEGA328P'); T(g,120,60,'UNO',{size:20,w:900,fill:'#ffffffdd'}); T(g,120,40,'ARDUINO',{size:8,fill:'#ffffffaa'}); legs(g,s)}});
add('arduino_nano',{name:'Arduino Nano',cat:'Boards',sim:'plan',tags:'atmega328 small 5v',desc:'Tiny Uno that plugs into a breadboard.',w:170,h:56,
  pinsFn:s=>({...hdr(['D2','D3','D4','D5','D6','D7','D8','D9','D10','D11'],s.w,s.h,'t'),...hdr(['A0','A1','A2','A3','5V','GND','VIN'],s.w,s.h,'b')}),
  draw:(c,g,s)=>{pcb(g,s.w,s.h,'#1C5BA8'); usb(g,-8,20,18,16); E('rect',{x:70,y:18,width:22,height:22,rx:2,fill:'#1A1D23',transform:'rotate(45 81 29)'},g); T(g,135,32,'NANO',{size:11,w:800}); legs(g,s)}});
add('pico',{name:'Raspberry Pi Pico',cat:'Boards',sim:'plan',tags:'rp2040 micropython',desc:'RP2040 board, 3.3 V, popular with MicroPython.',w:170,h:60,
  pinsFn:s=>({...hdr(['GP0','GP1','GND','GP2','GP3','GP4','GP5','GND2','GP6','GP7'],s.w,s.h,'t'),...hdr(['VBUS','VSYS','GND3','3V3','GP26','GP27','GP28'],s.w,s.h,'b')}),
  draw:(c,g,s)=>{pcb(g,s.w,s.h,'#2E7D32'); usb(g,-8,22,16,16); E('rect',{x:70,y:16,width:28,height:28,rx:2,fill:'#1A1D23'},g); T(g,84,33,'RP2040',{size:5.5,mono:1,fill:'#AEB4BF'}); T(g,135,34,'PICO',{size:11,w:800}); legs(g,s)}});
add('nodemcu',{name:'NodeMCU ESP8266',cat:'Boards',sim:'plan',tags:'esp8266 wifi',desc:'Wi-Fi board (ESP8266). Cheaper cousin of the ESP32, no Bluetooth.',w:170,h:70,
  pinsFn:s=>({...hdr(['D0','D1','D2','D3','D4','3V3','GND','D5','D6','D7','D8'],s.w,s.h,'t'),...hdr(['A0','GND2','VIN','3V3_2'],s.w,s.h,'b')}),
  draw:(c,g,s)=>{pcb(g,s.w,s.h,'#1A1D23'); usb(g,-8,26,16,16); E('rect',{x:110,y:14,width:48,height:42,rx:3,fill:'#B9BFC8'},g); T(g,134,38,'ESP8266',{size:7,fill:'#2C3138'}); T(g,60,40,'NodeMCU',{size:10,w:800}); legs(g,s)}});

/* ================= POWER ================= */
add('battery9v',{name:'9V battery',cat:'Power',sim:'full',tags:'9 volt pp3',desc:'9 V battery. Use a regulator or buck converter before the ESP32.',w:64,h:100,pins:{'+':[72,20],'-':[72,44]},
  draw:(c,g,s)=>{E('rect',{x:0,y:8,width:64,height:92,rx:6,fill:'#2B2F38'},g); E('rect',{x:0,y:8,width:64,height:30,rx:6,fill:'#FF7A1A'},g); E('rect',{x:10,y:0,width:16,height:10,rx:2,fill:'#C9CED6'},g); E('rect',{x:36,y:0,width:18,height:10,rx:2,fill:'#C9CED6'},g); T(g,32,76,'9V',{size:20,w:900}); E('path',{d:'M64 20 H72',stroke:'#FF5A4E','stroke-width':3},g); E('path',{d:'M64 44 H72',stroke:'#555B66','stroke-width':3},g)},
  stamp:(c,ctx)=>{ctx.src(ctx.nn('+'),ctx.nn('-'),9,1)}});
add('usb_power',{name:'USB 5V power',cat:'Power',sim:'full',tags:'usb charger 5v power bank',desc:'5 V from a USB charger or power bank.',w:86,h:46,pins:{'5V':[94,14],GND:[94,32]},
  draw:(c,g,s)=>{E('rect',{x:0,y:0,width:70,height:46,rx:10,fill:'#ECEEF1'},g); E('rect',{x:70,y:12,width:14,height:22,rx:2,fill:'#9AA1AC'},g); T(g,35,27,'USB 5V',{size:9,fill:'#2C3138'}); E('path',{d:'M84 14 H94',stroke:'#FF5A4E','stroke-width':2.5},g); E('path',{d:'M84 32 H94',stroke:'#555B66','stroke-width':2.5},g)},
  stamp:(c,ctx)=>{ctx.src(ctx.nn('5V'),ctx.nn('GND'),5,0.2)}});
add('solar',{name:'Solar panel',cat:'Power',sim:'full',tags:'sun light energy',desc:'6 V solar panel. Output follows the light level.',w:120,h:80,pins:{'+':[46,89],'-':[74,89]},props:[{k:'light',label:'Sunlight',type:'range',min:0,max:100,def:80,unit:'%'}],
  draw:(c,g,s)=>{E('rect',{x:0,y:0,width:120,height:80,rx:4,fill:'#C9CED6'},g); for(let i=0;i<4;i++)for(let j=0;j<3;j++)E('rect',{x:5+i*28.5,y:5+j*24,width:26,height:22,fill:'#1E3A8A',stroke:'#3B82F6','stroke-width':.6},g); legs(g,s,false); T(g,46,74,'+',{size:9,fill:'#FF5A4E'})},
  stamp:(c,ctx)=>{ctx.src(ctx.nn('+'),ctx.nn('-'),6*(c.light??80)/100,25)}});
add('buck',{name:'Buck converter',cat:'Power',sim:'full',stage2:true,tags:'lm2596 step down regulator',desc:'LM2596 step-down: turns 7–24 V into a steady 5 V.',w:120,h:62,pins:{'IN+':[-9,18],'IN-':[-9,44],'OUT+':[129,18],'OUT-':[129,44]},
  draw:(c,g,s)=>{pcb(g,s.w,s.h,'#1E5BB8'); E('circle',{cx:40,cy:31,r:15,fill:'#2B2F38'},g); E('circle',{cx:40,cy:31,r:9,fill:'#555B66'},g); E('rect',{x:66,y:12,width:22,height:24,rx:2,fill:'#1A1D23'},g); E('rect',{x:92,y:40,width:14,height:12,rx:2,fill:'#3B82F6'},g); E('circle',{cx:99,cy:46,r:3,fill:'#FFD23F'},g); T(g,77,50,'5V OUT',{size:6.5,mono:1}); legs(g,s)},
  stamp:(c,ctx)=>{ctx.cond(ctx.nn('IN-'),ctx.nn('OUT-'),100); if(powered(ctx,'IN+','IN-',6.5))ctx.src(ctx.nn('OUT+'),ctx.nn('OUT-'),5,0.2)}});

/* ================= BASIC ================= */
add('resistor10k',{name:'Resistor 10kΩ',cat:'Basic',sim:'full',tags:'pull up pull down ohm',desc:'10 kΩ: used as a pull-up or pull-down and in voltage dividers.',w:56,h:16,pins:{a:[0,8],b:[56,8]},
  draw:(c,g)=>{E('path',{d:'M0 8 H56',stroke:'#B8BEC7','stroke-width':2.5},g); E('rect',{x:12,y:1,width:32,height:14,rx:6,fill:'#9EC9E8'},g); [['#6B3A1E',18],['#111',24],['#FF7A1A',30],['#C9A227',38]].forEach(([f,x])=>E('rect',{x,y:1,width:3.5,height:14,fill:f},g))},
  stamp:(c,ctx)=>{ctx.cond(ctx.nn('a'),ctx.nn('b'),1/10000)}});
add('potentiometer',{name:'Potentiometer',cat:'Basic',sim:'full',tags:'knob variable resistor dial',desc:'10 kΩ knob. The middle pin (wiper) gives a voltage you can read with analogRead.',w:42,h:42,pins:{A:[7,51],W:[21,51],B:[35,51]},props:[{k:'pos',label:'Knob',type:'range',min:0,max:100,def:50,unit:'%'}],
  draw:(c,g,s)=>{E('rect',{x:0,y:4,width:42,height:38,rx:5,fill:'#1E5BB8'},g); E('circle',{cx:21,cy:21,r:15,fill:'#C9CED6'},g); const a=-135+(c.pos??50)*2.7; E('rect',{x:19.5,y:8,width:3,height:13,rx:1.5,fill:'#2C3138',transform:`rotate(${a} 21 21)`},g); legs(g,s,false)},
  stamp:(c,ctx)=>{const p=(c.pos??50)/100; ctx.cond(ctx.nn('A'),ctx.nn('W'),1/Math.max(1,10000*p)); ctx.cond(ctx.nn('W'),ctx.nn('B'),1/Math.max(1,10000*(1-p)))}});
add('capacitor',{name:'Capacitor',cat:'Basic',sim:'plan',tags:'electrolytic smoothing',desc:'Electrolytic capacitor: smooths power for motors and sensors. Mind the − stripe.',w:28,h:46,pins:{'+':[7,55],'-':[21,55]},
  draw:(c,g,s)=>{E('rect',{x:2,y:0,width:24,height:46,rx:7,fill:'#1E3A8A'},g); E('rect',{x:18,y:0,width:6,height:46,fill:'#9EC9E8'},g); T(g,14,26,'100µF',{size:5.5,mono:1}); legs(g,s,false)}});
add('diode',{name:'Diode 1N4007',cat:'Basic',sim:'full',tags:'rectifier flyback',desc:'Lets current flow one way only (stripe = −). Protects circuits.',w:56,h:16,pins:{A:[0,8],K:[56,8]},
  draw:(c,g)=>{E('path',{d:'M0 8 H56',stroke:'#B8BEC7','stroke-width':2.5},g); E('rect',{x:14,y:2,width:28,height:12,rx:3,fill:'#1A1D23'},g); E('rect',{x:35,y:2,width:4,height:12,fill:'#C9CED6'},g)},
  stamp:(c,ctx)=>{ctx.diode(c.id,ctx.nn('A'),ctx.nn('K'),0.7,false)}});
const ledDraw=(col,dark)=>(c,g)=>{const lit=c.lit||0; E('path',{d:'M7 40 V58',stroke:'#B8BEC7','stroke-width':2.5},g); E('path',{d:'M21 40 V58',stroke:'#B8BEC7','stroke-width':2.5},g);
  if(lit>0.02)E('circle',{cx:14,cy:18,r:20+lit*8,fill:col,opacity:.35+lit*.3,filter:'url(#blur)'},g);
  E('path',{d:'M1 40 V16 a13 13 0 0 1 26 0 V40 z',fill:lit>0.02?col:dark,stroke:col,opacity:lit>0.02?1:.9},g); E('rect',{x:-2,y:38,width:32,height:5,rx:2,fill:dark},g); T(g,-5,54,'+',{size:10,fill:'#FF5A4E',w:800})};
add('led_green',{name:'LED green',cat:'Basic',sim:'full',tags:'light diode',desc:'Green LED (about 2 V).',w:28,h:58,pins:{A:[7,58],K:[21,58]},draw:ledDraw('#3DF58A','#1D5C3A'),stamp:(c,ctx)=>ctx.diode(c.id,ctx.nn('A'),ctx.nn('K'),2.0,true)});
add('led_blue',{name:'LED blue',cat:'Basic',sim:'full',tags:'light diode',desc:'Blue LED (about 2.8 V).',w:28,h:58,pins:{A:[7,58],K:[21,58]},draw:ledDraw('#3DA8FF','#1D3A5C'),stamp:(c,ctx)=>ctx.diode(c.id,ctx.nn('A'),ctx.nn('K'),2.8,true)});
add('rgb_led',{name:'RGB LED',cat:'Basic',sim:'full',tags:'colour light common cathode',desc:'Three LEDs in one (common cathode). Mix red, green and blue.',w:48,h:58,pins:{R:[3,66],K:[17,66],G:[31,66],B:[45,66]},
  draw:(c,g,s)=>{const m=c.litMap||{}, r=m[c.id+'R']||0, gg=m[c.id+'G']||0, b=m[c.id+'B']||0, any=r+gg+b>0.05; const col=`rgb(${Math.round(80+175*r)},${Math.round(80+175*gg)},${Math.round(80+175*b)})`;
    Object.values(s.pins).forEach(([x])=>E('path',{d:`M${x} 40 V66`,stroke:'#B8BEC7','stroke-width':2.2},g)); if(any)E('circle',{cx:24,cy:18,r:30,fill:col,opacity:.4,filter:'url(#blur)'},g);
    E('path',{d:'M8 42 V18 a16 16 0 0 1 32 0 V42 z',fill:any?col:'#E7E9EE',opacity:.95},g); E('rect',{x:5,y:40,width:38,height:5,rx:2,fill:'#C9CED6'},g); ['R','K','G','B'].forEach((k,i)=>T(g,[3,17,31,45][i],54,k,{size:6.5,mono:1,fill:['#FF5A4E','#AEB4BF','#3DF58A','#3DA8FF'][i]}))},
  stamp:(c,ctx)=>{const k=ctx.nn('K'); ctx.diode(c.id+'R',ctx.nn('R'),k,1.9,true); ctx.diode(c.id+'G',ctx.nn('G'),k,2.0,true); ctx.diode(c.id+'B',ctx.nn('B'),k,2.8,true)}});
add('npn',{name:'NPN transistor',cat:'Basic',sim:'full',stage2:true,tags:'bc547 2n2222 switch',desc:'BC547: a tiny electronic switch. A small base current lets a bigger current flow C → E.',w:30,h:40,pins:{E:[1,50],B:[15,50],C:[29,50]},
  draw:(c,g,s)=>{E('path',{d:'M0 40 V14 a15 15 0 0 1 30 0 V40 z',fill:'#1A1D23'},g); T(g,15,30,'BC547',{size:5.5,mono:1,fill:'#AEB4BF'}); legs(g,s,false); ['E','B','C'].forEach((k,i)=>T(g,[1,15,29][i],38,k,{size:6,mono:1}))},
  stamp:(c,ctx)=>{ctx.diode(c.id+'be',ctx.nn('B'),ctx.nn('E'),0.65,false); const vb=ctx.V('B'), ve=ctx.V('E'); if(vb!=null&&vb-ve>0.6)ctx.cond(ctx.nn('C'),ctx.nn('E'),2)}});
add('mosfet',{name:'MOSFET',cat:'Basic',sim:'full',stage2:true,tags:'irlz44n power switch',desc:'Logic-level MOSFET (IRLZ44N): switches big currents for motors, strips and pumps.',w:42,h:60,pins:{G:[7,70],D:[21,70],S:[35,70]},
  draw:(c,g,s)=>{E('rect',{x:3,y:0,width:36,height:22,rx:3,fill:'#C9CED6'},g); E('circle',{cx:21,cy:10,r:5,fill:'#8A919E'},g); E('rect',{x:0,y:20,width:42,height:40,rx:3,fill:'#1A1D23'},g); T(g,21,44,'IRLZ44N',{size:6,mono:1,fill:'#AEB4BF'}); legs(g,s,false); ['G','D','S'].forEach((k,i)=>T(g,[7,21,35][i],56,k,{size:6,mono:1}))},
  stamp:(c,ctx)=>{const vg=ctx.V('G'), vs=ctx.V('S'); if(vg!=null&&vg-vs>2)ctx.cond(ctx.nn('D'),ctx.nn('S'),20)}});
add('reed_switch',{name:'Reed switch',cat:'Basic',sim:'full',toggle:'on',tags:'magnet door sensor',desc:'Closes when a magnet is near. Click it to bring the magnet.',w:70,h:18,pins:{a:[-9,9],b:[79,9]},
  draw:(c,g,s)=>{E('path',{d:'M-9 9 H79',stroke:'#C9CED6','stroke-width':2},g); E('rect',{x:6,y:2,width:58,height:14,rx:7,fill:'#BFE7FF',opacity:.5,stroke:'#9EC9E8'},g); E('path',{d:c.on?'M14 9 H56':'M14 9 H33 M37 7 H56',stroke:'#C9A227','stroke-width':2.4},g); if(c.on){E('rect',{x:20,y:-16,width:30,height:12,rx:3,fill:'#E5383B'},g); T(g,35,-7,'N   S',{size:7})}},
  stamp:(c,ctx)=>{if(c.on)ctx.cond(ctx.nn('a'),ctx.nn('b'),20)}});
add('limit_switch',{name:'Limit switch',cat:'Basic',sim:'full',hold:true,tags:'micro switch bumper end stop',desc:'Micro switch with a lever: COM connects to NO while pressed. Great as a bumper.',w:56,h:34,pins:{COM:[7,43],NO:[21,43],NC:[35,43]},
  draw:(c,g,s)=>{E('rect',{x:0,y:8,width:56,height:26,rx:3,fill:'#1A1D23'},g); E('path',{d:c.pressed?'M6 8 L52 4':'M6 8 L50 -8',stroke:'#C9CED6','stroke-width':3},g); E('circle',{cx:c.pressed?52:50,cy:c.pressed?4:-8,r:3.5,fill:'#C9CED6'},g); E('rect',{x:20,y:4,width:8,height:5,fill:'#E5383B'},g); legs(g,s)},
  stamp:(c,ctx)=>{if(ctx.pressed(c))ctx.cond(ctx.nn('COM'),ctx.nn('NO'),20); else ctx.cond(ctx.nn('COM'),ctx.nn('NC'),20)}});

/* ================= ACTUATORS ================= */
add('tt_motor',{name:'TT gear motor',cat:'Actuators',sim:'full',tags:'yellow gearbox wheel robot car',desc:'Yellow 1:48 gear motor used in robot cars. Strong and slow.',w:110,h:50,pins:{a:[90,58],b:[104,58]},
  draw:(c,g,s)=>{E('rect',{x:0,y:4,width:76,height:42,rx:6,fill:'#F2C230'},g); E('rect',{x:74,y:10,width:34,height:30,rx:10,fill:'#C9CED6'},g); const r=E('g',{class:'rotor',transform:`rotate(${c.angle||0} 30 25)`,'data-cx':30,'data-cy':25},g); E('rect',{x:24,y:19,width:12,height:12,rx:2,fill:'#fff'},r); E('rect',{x:28,y:12,width:4,height:26,fill:'#fff'},r); E('rect',{x:84,y:40,width:8,height:6,fill:'#FF5A4E'},g); E('rect',{x:98,y:40,width:8,height:6,fill:'#555B66'},g); legs(g,s,false)},
  stamp:(c,ctx)=>ctx.motor(ctx.nn('a'),ctx.nn('b'),8)});
add('vibration_motor',{name:'Vibration motor',cat:'Actuators',sim:'full',tags:'haptic buzz coin',desc:'Coin motor that buzzes: give your robot a "feeling".',w:40,h:40,pins:{a:[13,49],b:[27,49]},
  draw:(c,g,s)=>{const on=c.spinning; E('circle',{cx:20,cy:20,r:18,fill:'#C9CED6',stroke:'#8A919E'},g); E('circle',{cx:20,cy:20,r:9,fill:'#8A919E'},g); if(on)[-1,1].forEach(k=>E('path',{d:`M${20+k*24} 8 q${k*4} 6 0 12 q${-k*4} 6 0 12`,stroke:'#D7FF3A','stroke-width':2,fill:'none'},g)); E('path',{d:'M13 38 V49',stroke:'#FF5A4E','stroke-width':2},g); E('path',{d:'M27 38 V49',stroke:'#2B2F38','stroke-width':2},g)},
  stamp:(c,ctx)=>ctx.motor(ctx.nn('a'),ctx.nn('b'),30)});
add('servo',{name:'Servo SG90',cat:'Actuators',sim:'full',tags:'angle arm 180 degree',desc:'Turns to an angle (0–180°). Use the Servo library: myservo.write(90);',w:84,h:44,pins:{GND:[-10,12],VCC:[-10,22],SIG:[-10,32]},
  dyn:(c,sim)=>{const gp=sim.espPinFor(c,'SIG'); const st=gp!=null&&sim.gpio['S'+gp]; c.servoAngle=st?st.angle:90},
  draw:(c,g,s)=>{E('rect',{x:0,y:6,width:84,height:32,rx:3,fill:'#1E6FD9'},g); E('rect',{x:-6,y:14,width:96,height:16,rx:2,fill:'#1E6FD9',opacity:.8},g); T(g,52,26,'SG90',{size:8});
    E('circle',{cx:22,cy:22,r:9,fill:'#ECEEF1'},g); const a=(c.servoAngle??90)-90; E('path',{d:'M22 22 L22 -10',stroke:'#ECEEF1','stroke-width':7,'stroke-linecap':'round',transform:`rotate(${a} 22 22)`},g); E('circle',{cx:22,cy:22,r:3,fill:'#8A919E'},g);
    [['#6B3A1E',12],['#FF5A4E',22],['#FF8A2A',32]].forEach(([col,y])=>E('path',{d:`M0 ${y} H-10`,stroke:col,'stroke-width':3},g)); if(!c.pal)T(g,42,-4,(c.servoAngle??90)+'°',{size:9,mono:1,fill:'#D7FF3A'})},
  stamp:(c,ctx)=>ctx.cond(ctx.nn('VCC'),ctx.nn('GND'),1/200)});
add('stepper',{name:'Stepper 28BYJ-48',cat:'Actuators',sim:'plan',tags:'step precise uln2003',desc:'Moves in exact small steps. Drive it with the ULN2003 board.',w:80,h:80,pins:hdr(['A','B','C','D','5V'],80,80,'b'),
  draw:(c,g,s)=>{E('circle',{cx:40,cy:40,r:38,fill:'#C9CED6',stroke:'#8A919E'},g); E('circle',{cx:40,cy:40,r:12,fill:'#F2C230'},g); E('rect',{x:37,y:24,width:6,height:12,fill:'#ECEEF1'},g); E('rect',{x:-4,y:30,width:12,height:20,rx:3,fill:'#8A919E'},g); E('rect',{x:72,y:30,width:12,height:20,rx:3,fill:'#8A919E'},g); legs(g,s,false)}});
add('buzzer',{name:'Buzzer',cat:'Actuators',sim:'full',tags:'beep sound alarm',desc:'Active buzzer: beeps when powered. Long leg is +.',w:40,h:40,pins:{'+':[13,49],'-':[27,49]},
  draw:(c,g,s)=>{E('circle',{cx:20,cy:20,r:19,fill:'#1A1D23'},g); E('circle',{cx:20,cy:20,r:4,fill:'#3A3F48'},g); T(g,8,14,'+',{size:8,fill:'#FF5A4E'}); if(c.active)[0,1,2].forEach(i=>E('path',{d:`M${42+i*6} ${8-i*3} a${14+i*6} ${14+i*6} 0 0 1 0 ${24+i*6}`,stroke:'#D7FF3A','stroke-width':2,fill:'none',opacity:1-i*.25},g)); legs(g,s,false)},
  stamp:(c,ctx)=>ctx.load(ctx.nn('+'),ctx.nn('-'),120,2)});
add('relay',{name:'Relay module',cat:'Actuators',sim:'full',stage2:true,tags:'switch high voltage pump lamp',desc:'A switch the ESP32 can flip: IN HIGH connects COM to NO. Use it for pumps and lamps.',w:110,h:66,pins:{VCC:[-9,16],GND:[-9,33],IN:[-9,50],COM:[119,16],NO:[119,33],NC:[119,50]},
  draw:(c,g,s)=>{pcb(g,s.w,s.h,'#1E5BB8'); E('rect',{x:24,y:10,width:48,height:46,rx:3,fill:'#1E6FD9',stroke:'#0E3F99'},g); T(g,48,30,'RELAY',{size:7}); T(g,48,42,'5V',{size:7,mono:1}); [16,33,50].forEach(y=>E('rect',{x:90,y:y-8,width:18,height:16,rx:2,fill:'#1E6FD9',stroke:'#0E3F99'},g)); glow(g,14,58,3,'#FF5A4E',c.relayOn); legs(g,s)},
  stamp:(c,ctx)=>{const pw=powered(ctx,'VCC','GND',3); const vi=ctx.V('IN'), vg=ctx.V('GND'); c.relayOn=!!(pw&&vi!=null&&vi-vg>1.5); ctx.cond(ctx.nn('VCC'),ctx.nn('GND'),1/400); ctx.cond(ctx.nn('IN'),ctx.nn('GND'),1/5000); if(c.relayOn)ctx.cond(ctx.nn('COM'),ctx.nn('NO'),20); else ctx.cond(ctx.nn('COM'),ctx.nn('NC'),20)}});

/* ================= DRIVERS ================= */
add('uln2003',{name:'ULN2003 driver',cat:'Drivers',sim:'plan',tags:'stepper driver darlington',desc:'Driver board for the 28BYJ-48 stepper: 4 inputs, 4 LEDs show the steps.',w:90,h:70,pins:{IN1:[-9,14],IN2:[-9,28],IN3:[-9,42],IN4:[-9,56],'5V':[99,20],GND:[99,40]},
  draw:(c,g,s)=>{pcb(g,s.w,s.h,'#2E7D32'); dip(g,22,24,40,18,'ULN2003'); [0,1,2,3].forEach(i=>glow(g,22+i*11,58,3,'#FF5A4E',false)); E('rect',{x:66,y:6,width:20,height:28,rx:2,fill:'#ECEEF1'},g); legs(g,s)}});

/* ================= SENSORS ================= */
add('hcsr04',{name:'HC-SR04 sonar',cat:'Sensors',sim:'full',tags:'ultrasonic distance obstacle',desc:'Measures distance with sound. pulseIn(ECHO, HIGH) / 58 = cm. Drag "Distance" to move the wall.',w:120,h:64,pinsFn:s=>hdr(['VCC','TRIG','ECHO','GND'],s.w,s.h,'b'),props:[{k:'dist',label:'Distance',type:'range',min:2,max:300,def:30,unit:' cm'}],
  draw:(c,g,s)=>{pcb(g,s.w,s.h,'#1565C0'); can(g,32,30,22); can(g,88,30,22); E('rect',{x:52,y:6,width:16,height:8,rx:3,fill:'#C9CED6'},g); T(g,60,10,'HC-SR04',{size:6.5,mono:1}); if(!c.pal){T(g,60,-6,(c.dist??30)+' cm',{size:9,mono:1,fill:'#D7FF3A'})} legs(g,s)},
  stamp:(c,ctx)=>ctx.cond(ctx.nn('VCC'),ctx.nn('GND'),1/500)});
const digitalSensor=(id,name,tags,desc,w,h,pinNames,draw,prop,label,activeLow)=>add(id,{name,cat:'Sensors',sim:'full',stage2:true,tags,desc,w,h,pinsFn:s=>hdr(pinNames,s.w,s.h,'b'),props:[{k:prop,label,type:'toggle',def:false}],toggle:prop,draw,
  stamp:(c,ctx)=>{const out=pinNames.find(p=>/OUT|DO|SIG/.test(p)); const pw=powered(ctx,'VCC','GND'); ctx.cond(ctx.nn('VCC'),ctx.nn('GND'),1/2000); if(pw){const on=!!c[prop]; ctx.src(ctx.nn(out),ctx.nn('GND'),(activeLow?!on:on)?pw:0,100)}}});
digitalSensor('ir_obstacle','IR obstacle sensor','infrared avoid object detect','Sees nearby objects with infrared. OUT goes LOW when something is in front. Click it to place an object.',46,84,['VCC','GND','OUT'],
  (c,g,s)=>{pcb(g,s.w,s.h,'#1A1D23',{holes:false}); E('rect',{x:6,y:-10,width:14,height:18,rx:4,fill:'#ECEEF1'},g); E('rect',{x:26,y:-10,width:14,height:18,rx:4,fill:'#2B2F38'},g); E('circle',{cx:23,cy:36,r:8,fill:'#1E6FD9'},g); E('rect',{x:21,y:30,width:4,height:12,fill:'#ECEEF1'},g); glow(g,13,64,3,'#3DF58A',c.detect); if(c.detect&&!c.pal)E('rect',{x:-4,y:-40,width:54,height:18,rx:4,fill:'#FF7A1A'},g); legs(g,s)},'detect','Object in front',true);
digitalSensor('line_sensor','Line sensor TCRT5000','line follower black white','Sees a black line under the robot. DO goes HIGH on black. Click to put it over the line.',46,76,['VCC','GND','DO'],
  (c,g,s)=>{pcb(g,s.w,s.h,'#1E5BB8',{holes:false}); E('rect',{x:9,y:6,width:28,height:16,rx:3,fill:'#1A1D23'},g); E('circle',{cx:17,cy:14,r:4,fill:'#3DA8FF'},g); E('circle',{cx:29,cy:14,r:4,fill:'#2B2F38'},g); E('circle',{cx:23,cy:42,r:7,fill:'#1E6FD9'},g); glow(g,13,62,3,'#FF5A4E',c.onLine); legs(g,s)},'onLine','Over the black line',false);
digitalSensor('pir','PIR motion sensor','hc-sr501 human movement','Notices people moving (body heat). OUT goes HIGH on motion. Click to wave.',70,70,['VCC','OUT','GND'],
  (c,g,s)=>{pcb(g,s.w,s.h,'#2E7D32',{holes:false}); E('path',{d:'M8 50 V30 a27 27 0 0 1 54 0 V50 z',fill:'#F4F5F7'},g); for(let i=0;i<4;i++)E('path',{d:`M${14+i*12} 50 V24`,stroke:'#D9DDE2'},g); if(c.motion&&!c.pal)T(g,35,-6,'motion!',{size:9,fill:'#D7FF3A'}); legs(g,s)},'motion','Someone moves',false);
add('touch',{name:'Touch sensor TTP223',cat:'Sensors',sim:'full',stage2:true,hold:true,tags:'capacitive touch pad finger',desc:'Feels your finger. SIG goes HIGH while touched. Hold it with the mouse.',w:42,h:46,pinsFn:s=>hdr(['VCC','SIG','GND'],s.w,s.h,'b'),
  draw:(c,g,s)=>{pcb(g,s.w,s.h,'#C62828',{holes:false}); E('circle',{cx:21,cy:20,r:13,fill:c.pressed?'#FFB3B3':'#E57373',stroke:'#fff'},g); T(g,21,24,'☝',{size:11,fill:'#fff'}); legs(g,s)},
  stamp:(c,ctx)=>{const pw=powered(ctx,'VCC','GND'); ctx.cond(ctx.nn('VCC'),ctx.nn('GND'),1/3000); if(pw)ctx.src(ctx.nn('SIG'),ctx.nn('GND'),ctx.pressed(c)?pw:0,100)}});
add('ldr',{name:'Light sensor LDR',cat:'Sensors',sim:'full',tags:'photoresistor light dark night',desc:'Resistance drops in bright light. Use it with a 10 kΩ resistor and analogRead.',w:30,h:34,pins:{a:[8,43],b:[22,43]},props:[{k:'light',label:'Light',type:'range',min:0,max:100,def:60,unit:'%'}],
  draw:(c,g,s)=>{E('circle',{cx:15,cy:15,r:14,fill:'#F2C230'},g); E('path',{d:'M6 10 H24 M6 15 H24 M6 20 H24',stroke:'#B5651D','stroke-width':1.6,'stroke-dasharray':'3 2'},g); E('circle',{cx:15,cy:15,r:14,fill:'none',stroke:'#C9CED6'},g); legs(g,s,false)},
  stamp:(c,ctx)=>{const l=(c.light??60)/100; ctx.cond(ctx.nn('a'),ctx.nn('b'),1/(1000+100000*Math.pow(1-l,2)))}});
const analogSensor=(id,name,tags,desc,w,h,pinNames,draw,props,outFn)=>add(id,{name,cat:'Sensors',sim:'full',stage2:true,tags,desc,w,h,pinsFn:s=>hdr(pinNames,s.w,s.h,'b'),props,draw,
  stamp:(c,ctx)=>{const pw=powered(ctx,'VCC','GND'); ctx.cond(ctx.nn('VCC'),ctx.nn('GND'),1/3000); if(pw){const o=outFn(c,pw); for(const k in o)ctx.src(ctx.nn(k),ctx.nn('GND'),o[k],100)}}});
analogSensor('soil','Soil moisture sensor','plant water garden','Tells how wet the soil is. AO is high when dry, low when wet.',48,110,['VCC','GND','AO'],
  (c,g,s)=>{pcb(g,s.w,30,'#1E5BB8',{holes:false}); E('path',{d:'M6 30 V100 L12 108 L18 100 V30 Z M30 30 V100 L36 108 L42 100 V30 Z',fill:'#C9A227'},g); E('rect',{x:4,y:62,width:40,height:46,fill:'#6B3A1E',opacity:(c.moist??30)/100*.8+.1},g); legs(g,{...s,h:s.h})},[{k:'moist',label:'Moisture',type:'range',min:0,max:100,def:30,unit:'%'}],(c,v)=>({AO:v*(1-(c.moist??30)/100)}));
analogSensor('mq2','Gas sensor MQ-2','smoke lpg gas leak','Smells smoke and gas. AO rises with gas; DO goes LOW above the limit.',60,64,['VCC','GND','DO','AO'],
  (c,g,s)=>{pcb(g,s.w,s.h,'#1E5BB8',{holes:false}); E('circle',{cx:30,cy:30,r:22,fill:'#C9CED6'},g); E('circle',{cx:30,cy:30,r:17,fill:'url(#tkMesh)',stroke:'#8A919E'},g); if((c.gas??10)>50&&!c.pal)T(g,30,-6,'gas!',{size:9,fill:'#FF7A1A'}); legs(g,s)},[{k:'gas',label:'Gas level',type:'range',min:0,max:100,def:10,unit:'%'}],(c,v)=>({AO:v*(c.gas??10)/100,DO:(c.gas??10)>50?0:v}));
add('dht11',{name:'DHT11 temp + humidity',cat:'Sensors',sim:'full',tags:'temperature humidity weather',desc:'Measures temperature and humidity. Use the DHT library: dht.readTemperature().',w:40,h:56,pinsFn:s=>hdr(['VCC','DATA','GND'],s.w,s.h,'b'),props:[{k:'temp',label:'Temperature',type:'range',min:0,max:50,def:30,unit:'°C'},{k:'hum',label:'Humidity',type:'range',min:10,max:95,def:60,unit:'%'}],
  draw:(c,g,s)=>{E('rect',{x:0,y:0,width:40,height:56,rx:4,fill:'#3DA8FF'},g); for(let i=0;i<5;i++)for(let j=0;j<3;j++)E('rect',{x:6+j*11,y:6+i*9,width:7,height:5,rx:1,fill:'#1E5BB8'},g); if(!c.pal)T(g,20,-6,(c.temp??30)+'°C',{size:9,mono:1,fill:'#D7FF3A'}); legs(g,s,true,false)},
  stamp:(c,ctx)=>ctx.cond(ctx.nn('VCC'),ctx.nn('GND'),1/3000)});
add('mpu6050',{name:'MPU-6050 gyro',cat:'Sensors',sim:'plan',tags:'imu accelerometer gyroscope tilt balance',desc:'Senses tilt and turning (6-axis IMU). Talks over I2C (SDA/SCL).',w:70,h:50,pinsFn:s=>hdr(['VCC','GND','SCL','SDA'],s.w,s.h,'b'),
  draw:(c,g,s)=>{pcb(g,s.w,s.h,'#5B2C83'); E('rect',{x:25,y:13,width:20,height:20,rx:2,fill:'#1A1D23'},g); E('path',{d:'M10 40 h12 M16 34 v12',stroke:'#fff','stroke-width':1.2},g); T(g,58,12,'XYZ',{size:6,mono:1}); legs(g,s)}});
add('joystick',{name:'Joystick',cat:'Sensors',sim:'full',stage2:true,hold:true,tags:'thumbstick controller game',desc:'Two knobs in one: VRx and VRy give 0–4095 with analogRead; SW is a button (hold it).',w:80,h:80,pinsFn:s=>hdr(['GND','VCC','VRx','VRy','SW'],s.w,s.h,'b'),props:[{k:'jx',label:'X',type:'range',min:0,max:100,def:50,unit:'%'},{k:'jy',label:'Y',type:'range',min:0,max:100,def:50,unit:'%'}],
  draw:(c,g,s)=>{pcb(g,s.w,s.h,'#1A1D23'); E('circle',{cx:40,cy:38,r:28,fill:'#2B2F38'},g); const dx=((c.jx??50)-50)/50*12, dy=((c.jy??50)-50)/50*12; E('circle',{cx:40+dx,cy:38+dy,r:16,fill:c.pressed?'#FF7A1A':'#4A4F57',stroke:'#8A919E'},g); legs(g,s)},
  stamp:(c,ctx)=>{const pw=powered(ctx,'VCC','GND'); ctx.cond(ctx.nn('VCC'),ctx.nn('GND'),1/5000); if(pw){ctx.src(ctx.nn('VRx'),ctx.nn('GND'),pw*(c.jx??50)/100,1000); ctx.src(ctx.nn('VRy'),ctx.nn('GND'),pw*(c.jy??50)/100,1000)} if(ctx.pressed(c))ctx.cond(ctx.nn('SW'),ctx.nn('GND'),20)}});

/* ================= DISPLAYS + COMMS ================= */
add('lcd1602',{name:'LCD 16×2 (I2C)',cat:'Displays',sim:'plan',tags:'screen text display i2c',desc:'Shows 2 lines of 16 letters. With the I2C backpack it needs only 4 wires.',w:190,h:72,pins:{GND:[-9,14],VCC:[-9,28],SDA:[-9,42],SCL:[-9,56]},
  draw:(c,g,s)=>{pcb(g,s.w,s.h,'#2E7D32'); E('rect',{x:16,y:12,width:158,height:48,rx:3,fill:'#1A1D23'},g); E('rect',{x:22,y:18,width:146,height:36,fill:'#9BE15D'},g); T(g,26,33,'HELLO, ROBOT!',{size:10,mono:1,fill:'#1D3A0F',a:'start'}); T(g,26,48,'DIST: 24 cm',{size:10,mono:1,fill:'#1D3A0F',a:'start'}); legs(g,s)}});
add('oled',{name:'OLED 0.96"',cat:'Displays',sim:'plan',tags:'screen display ssd1306 i2c',desc:'Tiny sharp screen (128×64, SSD1306). Draw text, faces and graphs over I2C.',w:70,h:64,pinsFn:s=>hdr(['GND','VCC','SCL','SDA'],s.w,s.h,'t'),
  draw:(c,g,s)=>{pcb(g,s.w,s.h,'#1E3A8A'); E('rect',{x:6,y:12,width:58,height:42,rx:2,fill:'#05070A'},g); E('circle',{cx:24,cy:30,r:5,fill:'#3DDCFF'},g); E('circle',{cx:46,cy:30,r:5,fill:'#3DDCFF'},g); E('path',{d:'M26 42 q9 7 18 0',stroke:'#3DDCFF','stroke-width':2,fill:'none'},g); legs(g,s)}});
add('hc05',{name:'Bluetooth HC-05',cat:'Comms',sim:'plan',tags:'bluetooth serial wireless uart',desc:'Adds Bluetooth to boards without it (like the Uno). The ESP32 already has Bluetooth built in.',w:50,h:86,pinsFn:s=>hdr(['VCC','GND','TXD','RXD'],s.w,s.h,'b'),
  draw:(c,g,s)=>{pcb(g,s.w,s.h,'#1E5BB8',{holes:false}); E('rect',{x:6,y:6,width:38,height:52,rx:2,fill:'#1A8A5B'},g); E('path',{d:'M14 14 h8 v-6 h8 v6 h8',stroke:'#C9A227','stroke-width':2,fill:'none'},g); T(g,25,40,'HC-05',{size:7}); glow(g,25,70,3,'#FF5A4E',false); legs(g,s)}});


/* water projects */
analogSensor('water_level','Water level sensor','tank overflow rain flood liquid','Measures how high the water is. S (signal) rises as the water climbs up the strips.',44,96,['S','VCC','GND'],
  (c,g,s)=>{pcb(g,s.w,s.h,'#C62828',{holes:false}); for(let i=0;i<5;i++)E('rect',{x:8+i*6,y:8,width:3,height:62,fill:'#C9A227'},g); const lv=(c.level??20)/100; E('rect',{x:4,y:70-62*lv,width:36,height:62*lv,fill:'#3DA8FF',opacity:.55},g); if(!c.pal)T(g,22,-6,Math.round(lv*100)+'%',{size:9,mono:1,fill:'#3DDCFF'}); legs(g,s)},[{k:'level',label:'Water level',type:'range',min:0,max:100,def:20,unit:'%'}],(c,v)=>({S:v*(c.level??20)/100}));
add('pump',{name:'Mini water pump',cat:'Actuators',sim:'full',tags:'water pump irrigation plant 5v dc',desc:'A small DC pump that pushes water through a tube. Too hungry for a GPIO pin: switch it with a relay or MOSFET.',w:70,h:48,pins:{'+':[-9,16],'-':[-9,34]},
  draw:(c,g,s)=>{E('rect',{x:0,y:6,width:50,height:36,rx:14,fill:'#2B6CDB',stroke:'#173E85'},g); E('rect',{x:4,y:10,width:42,height:10,rx:5,fill:'#ffffff2a'},g); E('rect',{x:50,y:16,width:16,height:8,rx:2,fill:'#B8BEC7'},g); E('rect',{x:50,y:28,width:12,height:6,rx:2,fill:'#B8BEC7'},g); T(g,25,30,'PUMP',{size:7,mono:1}); if(c.active)[0,1,2].forEach(i=>E('circle',{cx:70+i*7,cy:20-i*4,r:2.4-i*.5,fill:'#3DDCFF'},g)); legs(g,s,false)},
  stamp:(c,ctx)=>ctx.load(ctx.nn('+'),ctx.nn('-'),40,3)});
LIB.order=['esp32','arduino_uno','arduino_nano','pico','nodemcu','battery','battery74','battery9v','usb_power','solar','buck','breadboard','resistor','resistor10k','potentiometer','capacitor','diode','led','led_green','led_blue','rgb_led','npn','mosfet','switch','button','reed_switch','limit_switch','motor','tt_motor','vibration_motor','servo','stepper','buzzer','pump','relay','l298n','uln2003','hcsr04','ir_obstacle','line_sensor','pir','touch','ldr','soil','water_level','mq2','dht11','mpu6050','joystick','lcd1602','oled','hc05'];
Object.defineProperty(LIB,'order',{enumerable:false,value:LIB.order});
window.TookieParts={ALL:LIB.order};
})();
