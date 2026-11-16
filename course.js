/* Botstructor course: short steps, English + Bangla. Every check runs the learner's real circuit or code in the simulator. */
(function(){
const {Runner}=window.TookieSim;

/* ---------- ready-made circuits for the coding steps ---------- */
function presetLED(sim,withButton=true){
  sim.comps=[];sim.wires=[];
  const bb=sim.add('breadboard',470,250,{fixed:true}), esp=sim.add('esp32',60,120,{fixed:true});
  const hx=c=>bb.x+28+(c-1)*14, ry=r=>bb.y+({a:62,b:76,c:90,d:104,e:118,f:146,g:160,h:174,i:188,j:202})[r];
  sim.add('resistor',hx(6),ry('b')-8,{fixed:true});
  sim.add('led',hx(10)-7,ry('e')-58,{fixed:true});
  sim.wire(esp,'D23',bb,'c6','#3DF58A',{fixed:true});
  sim.wire(bb,'a11',bb,'tn11','#2B2F38',{fixed:true});
  sim.wire(esp,'GND2',bb,'tn1','#2B2F38',{fixed:true});
  if(withButton){sim.add('button',hx(20)-7,ry('f')-48+0,{fixed:true});
    sim.wire(esp,'D4',bb,'j20','#FFD23F',{fixed:true}); sim.wire(bb,'j22',bb,'bn22','#2B2F38',{fixed:true}); sim.wire(bb,'tn30',bb,'bn30','#2B2F38',{fixed:true})}
  sim.changed();
}
function presetCar(sim){
  sim.comps=[];sim.wires=[];
  const esp=sim.add('esp32',540,30,{fixed:true}), drv=sim.add('l298n',250,180,{fixed:true}), bat=sim.add('battery74',230,20,{fixed:true});
  const mA=sim.add('motor',60,300,{fixed:true}), mB=sim.add('motor',420,400,{fixed:true});
  const W=(a,ap,b,bp,c)=>sim.wire(a,ap,b,bp,c,{fixed:true});
  W(bat,'+',drv,'12V','#FF5A4E'); W(bat,'-',drv,'GND','#2B2F38'); W(drv,'GND',esp,'GND2','#2B2F38'); W(drv,'5V',esp,'VIN','#FF8A2A');
  W(esp,'D14',drv,'ENA','#C77DFF'); W(esp,'D27',drv,'IN1','#3DA8FF'); W(esp,'D26',drv,'IN2','#3DF58A'); W(esp,'D25',drv,'IN3','#FFD23F'); W(esp,'D33',drv,'IN4','#FF5A4E'); W(esp,'D32',drv,'ENB','#C77DFF');
  W(drv,'OUT1',mA,'a','#FF5A4E'); W(drv,'OUT2',mA,'b','#2B2F38'); W(drv,'OUT3',mB,'a','#FF5A4E'); W(drv,'OUT4',mB,'b','#2B2F38');
  sim.changed();
}

/* ---------- checks ---------- */
const has=(sim,t)=>sim.comps.some(c=>c.type===t);
function allSw(sim,v){const o={}; sim.comps.filter(c=>c.type==='switch').forEach(c=>o[c.id]=v); return o}
function checkMotorLoop(sim){
  if(!has(sim,'battery'))return {ok:false,msg:{en:'Bring a battery from Components.',bn:'Components থেকে একটা ব্যাটারি আনো।'}};
  if(!has(sim,'motor'))return {ok:false,msg:{en:'Bring a motor from Components.',bn:'Components থেকে একটা মোটর আনো।'}};
  if(!has(sim,'switch'))return {ok:false,msg:{en:'Add a switch so you can turn the motor on and off.',bn:'একটা সুইচ যোগ করো, যাতে মোটর চালু-বন্ধ করা যায়।'}};
  const R=sim.result||sim.solve(); if(R.warnings.some(w=>w.type==='short'))return {ok:false,msg:{en:'Short circuit! + and − are joined with nothing in between. Fix the wires.',bn:'শর্ট সার্কিট! + আর − সরাসরি জোড়া লেগেছে। তারগুলো ঠিক করো।'}};
  const on=sim.solve({switches:allSw(sim,true)}), off=sim.solve({switches:allSw(sim,false)});
  const spinOn=on.motors.some(m=>m.spinning), spinOff=off.motors.some(m=>m.spinning);
  if(!spinOn)return {ok:false,msg:{en:'The loop is not closed yet. Current must go: battery + → switch → motor → battery −.',bn:'লুপটা এখনো বন্ধ হয়নি। কারেন্ট যাবে: ব্যাটারি + → সুইচ → মোটর → ব্যাটারি −।'}};
  if(spinOff)return {ok:false,msg:{en:'The motor runs even when the switch is OFF. Put the switch inside the loop.',bn:'সুইচ OFF থাকলেও মোটর ঘুরছে। সুইচটাকে লুপের ভেতরে বসাও।'}};
  if(!R.motors.some(m=>m.spinning))return {ok:false,soft:true,msg:{en:'Your circuit is right! Now click the switch to turn it ON.',bn:'সার্কিট ঠিক আছে! এবার সুইচে ক্লিক করে ON করো।'}};
  return {ok:true,msg:{en:'It spins! You built your first circuit.',bn:'ঘুরছে! তুমি তোমার প্রথম সার্কিট বানিয়ে ফেলেছ।'},data:{dir:R.motors.find(m=>m.spinning).dir}};
}
function checkReverse(sim,P){const r=checkMotorLoop(sim); if(!r.ok)return r; const d=r.data.dir, first=P.motorDir||1;
  if(d===first)return {ok:false,msg:{en:'Still the same direction. Swap the two wires on the motor (a ↔ b).',bn:'এখনো একই দিকে ঘুরছে। মোটরের দুটো তার অদলবদল করো।'}};
  return {ok:true,msg:{en:'Reversed! Swapping + and − flips the direction. Your robot will use this to drive backwards.',bn:'উল্টো দিকে ঘুরছে! + আর − বদলালে দিক বদলায়। রোবট পেছনে যেতে এটাই কাজে লাগাবে।'}}}
function checkLED(sim){
  if(!has(sim,'esp32'))return {ok:false,msg:{en:'Bring an ESP32 from Components.',bn:'Components থেকে একটা ESP32 আনো।'}};
  if(!has(sim,'breadboard'))return {ok:false,msg:{en:'Bring a breadboard from Components.',bn:'Components থেকে একটা ব্রেডবোর্ড আনো।'}};
  if(!has(sim,'led')||!has(sim,'resistor'))return {ok:false,msg:{en:'Put an LED and a resistor into the breadboard.',bn:'ব্রেডবোর্ডে একটা LED আর একটা রেজিস্টর বসাও।'}};
  const hi=sim.solve({gpio:{23:{mode:'OUTPUT',level:1}}}), lo=sim.solve({gpio:{23:{mode:'OUTPUT',level:0}}});
  if(lo.leds.some(l=>l.on))return {ok:false,msg:{en:'The LED is on even when D23 is off. Connect it to D23, not to 3V3.',bn:'D23 বন্ধ থাকলেও LED জ্বলছে। LED টা 3V3 তে না, D23 তে লাগাও।'}};
  if(!hi.leds.some(l=>l.on)){ if(hi.warnings.some(w=>w.type==='rev'))return {ok:false,msg:{en:'The LED is backwards. Long leg (+) toward D23, short leg (−) toward GND.',bn:'LED উল্টো বসেছে। লম্বা পা (+) D23 এর দিকে, ছোট পা (−) GND এর দিকে।'}};
    return {ok:false,msg:{en:'No current flows yet. Path: D23 → resistor → LED long leg; LED short leg → GND. Tip: holes in one column (a–e) are connected.',bn:'এখনো কারেন্ট যাচ্ছে না। পথ: D23 → রেজিস্টর → LED লম্বা পা; LED ছোট পা → GND। মনে রাখো: একই কলামের a–e গর্ত ভেতরে জোড়া।'}}}
  if(hi.warnings.some(w=>w.type==='led'))return {ok:false,msg:{en:'The LED lights, but with no resistor it would burn out. Put the resistor in the path.',bn:'LED জ্বলছে, কিন্তু রেজিস্টর ছাড়া পুড়ে যাবে। রেজিস্টরটা পথে বসাও।'}};
  return {ok:true,msg:{en:'Perfect circuit! When D23 is HIGH, the LED lights. Try the "Test D23" button.',bn:'দারুণ সার্কিট! D23 HIGH হলে LED জ্বলে। "Test D23" বাটনটা চেপে দেখো।'}};
}
const ledAt=(tr,a,b)=>tr.filter(x=>x.t>=a&&x.t<b).map(x=>x.leds[0]);
function codeErr(r){if(r.error)return {ok:false,msg:{en:r.error,bn:r.error}}; return null}
function checkBlink(sim,code){const r=Runner.test(sim,code,4000); const e=codeErr(r); if(e)return e;
  const s=r.trace.map(x=>x.leds[0]); let flips=0; for(let i=1;i<s.length;i++)if(s[i]!==s[i-1])flips++;
  if(!s.some(Boolean))return {ok:false,msg:{en:r.warned||'The LED never turns on. Did you use pin 23, pinMode(23, OUTPUT) and HIGH?',bn:r.warned||'LED একবারও জ্বলেনি। পিন 23, pinMode(23, OUTPUT) আর HIGH ব্যবহার করেছ?'}};
  if(flips<3)return {ok:false,msg:{en:'The LED turns on but does not blink. Turn it off with LOW and add a delay() after each change.',bn:'LED জ্বলে কিন্তু ব্লিংক করে না। LOW দিয়ে বন্ধ করো আর প্রতিবার পরে delay() দাও।'}};
  return {ok:true,msg:{en:'It blinks! You wrote your first program.',bn:'ব্লিংক করছে! তুমি তোমার প্রথম প্রোগ্রাম লিখে ফেললে।'}}}
function checkButton(sim,code){const press=(t,s)=>{const b=s.comps.find(c=>c.type==='button'); if(b)b.pressed=t>=700&&t<1600};
  const r=Runner.test(sim,code,2400,press); const e=codeErr(r); if(e)return e;
  const before=ledAt(r.trace,200,650), during=ledAt(r.trace,950,1550), after=ledAt(r.trace,1900,2400);
  if(!during.length||!during.every(Boolean))return {ok:false,msg:{en:r.warned||'When I hold the button, the LED does not stay on. Read the button with digitalRead(4). With INPUT_PULLUP, pressed = LOW.',bn:r.warned||'বাটন চেপে ধরলে LED জ্বলে থাকছে না। digitalRead(4) দিয়ে বাটন পড়ো। INPUT_PULLUP এ চাপলে LOW হয়।'}};
  if(before.some(Boolean)||after.some(Boolean))return {ok:false,msg:{en:'The LED stays on even when the button is not pressed. Add an else that turns it off.',bn:'বাটন না চাপলেও LED জ্বলে থাকছে। else দিয়ে বন্ধ করো।'}};
  return {ok:true,msg:{en:'Press = light, release = dark. You made the ESP32 read an input and decide!',bn:'চাপলে আলো, ছাড়লে অন্ধকার। ESP32 ইনপুট পড়ে সিদ্ধান্ত নিচ্ছে!'}}}
function checkSerial(sim,code){const press=(t,s)=>{const b=s.comps.find(c=>c.type==='button'); if(b)b.pressed=t>=800&&t<1600};
  const r=Runner.test(sim,code,2400,press); const e=codeErr(r); if(e)return e;
  if(!/Serial\.begin\s*\(\s*115200\s*\)/.test(code))return {ok:false,msg:{en:'Start the Serial Monitor first: Serial.begin(115200); in setup().',bn:'আগে Serial Monitor চালু করো: setup() এ Serial.begin(115200);'}};
  const lines=r.serial.split('\n').filter(Boolean); if(lines.length<2)return {ok:false,msg:{en:'Nothing is printed yet. Use Serial.println() inside loop() and add a small delay(200).',bn:'এখনো কিছু প্রিন্ট হচ্ছে না। loop() এ Serial.println() দাও আর delay(200) যোগ করো।'}};
  if(new Set(lines).size<2)return {ok:false,msg:{en:'You print, but the text never changes when I press the button. Print digitalRead(4) or a different message.',bn:'প্রিন্ট হচ্ছে, কিন্তু বাটন চাপলে লেখা বদলায় না। digitalRead(4) প্রিন্ট করো।'}};
  return {ok:true,msg:{en:'Your robot talks! Now you can see what is happening inside it.',bn:'তোমার রোবট কথা বলছে! এখন তুমি ভেতরে কী হচ্ছে দেখতে পারবে।'}}}
const st=(tr,a,b)=>tr.filter(x=>x.t>=a&&x.t<b).map(x=>x.motors.join(','));
function checkForward(sim,code){const r=Runner.test(sim,code,2500); const e=codeErr(r); if(e)return e;
  const s=r.trace.map(x=>x.motors.join(','));
  if(s.includes('1,1'))return {ok:true,msg:{en:'Both wheels forward: Your robot drives!',bn:'দুই চাকাই সামনে: রোবট চলছে!'}};
  if(r.trace.some(x=>x.warn.includes('weak')))return {ok:false,msg:{en:'Use the L298N pins, not the motor directly.',bn:'মোটর সরাসরি না, L298N এর পিন ব্যবহার করো।'}};
  const last=s[s.length-1]||'0,0'; return {ok:false,msg:{en:`Right now: left motor ${['back','stopped','forward'][+last.split(',')[0]+1]}, right motor ${['back','stopped','forward'][+last.split(',')[1]+1]}. Forward = IN1 HIGH, IN2 LOW, IN3 HIGH, IN4 LOW, and speed on ENA/ENB.`,bn:'সামনে যেতে: IN1 HIGH, IN2 LOW, IN3 HIGH, IN4 LOW, আর ENA/ENB তে গতি দাও।'}}}
function checkMoves(sim,code){const r=Runner.test(sim,code,9000); const e=codeErr(r); if(e)return e; const s=new Set(r.trace.map(x=>x.motors.join(',')));
  const need=[['1,1','forward','সামনে'],['-1,-1','backward','পেছনে']]; const left=s.has('-1,1')||s.has('0,1'), right=s.has('1,-1')||s.has('1,0');
  const miss=need.filter(n=>!s.has(n[0])).map(n=>n[1]); if(!left)miss.push('left'); if(!right)miss.push('right');
  if(miss.length)return {ok:false,msg:{en:'Still missing: '+miss.join(', ')+'. Left = left wheel back, right wheel forward.',bn:'এখনো বাকি: '+miss.join(', ')+'। বামে = বাম চাকা পেছনে, ডান চাকা সামনে।'}};
  return {ok:true,msg:{en:'Forward, back, left, right: you can drive a car with code!',bn:'সামনে, পেছনে, বামে, ডানে: কোড দিয়ে গাড়ি চালাতে পারো!'}}}
function checkBT(sim,code){const plan=[[0,'F'],[700,'B'],[1400,'L'],[2100,'R'],[2800,'S']];
  const hook=(t,s,run)=>{for(const p of plan)if(t>=p[0]&&!p.sent){p.sent=1;run.btQueue.push(p[1])}};
  plan.forEach(p=>p.sent=0); const r=Runner.test(sim,code,3400,hook); const e=codeErr(r); if(e)return e;
  const win=(a,b)=>st(r.trace,a,b); const okF=win(300,700).includes('1,1'), okB=win(1000,1400).includes('-1,-1'), okL=win(1700,2100).some(x=>x==='-1,1'||x==='0,1'), okR=win(2400,2800).some(x=>x==='1,-1'||x==='1,0'), okS=win(3100,3400).includes('0,0');
  const miss=[!okF&&'F',!okB&&'B',!okL&&'L',!okR&&'R',!okS&&'S'].filter(Boolean);
  if(miss.length)return {ok:false,msg:{en:`I sent F, B, L, R, S from the phone. These did not work yet: ${miss.join(', ')}. Read one letter with SerialBT.read() and use if (c == 'F') { … }.`,bn:`ফোন থেকে F, B, L, R, S পাঠালাম। এগুলো এখনো কাজ করেনি: ${miss.join(', ')}। SerialBT.read() দিয়ে অক্ষর পড়ো আর if (c == 'F') { … } লেখো।`}};
  return {ok:true,msg:{en:'Your phone drives your robot! That is a real RC car program.',bn:'তোমার ফোন দিয়ে রোবট চলছে! এটা একটা আসল RC কার প্রোগ্রাম।'}}}

/* ---------- the course ---------- */
const CAR_SYNTAX=[['pinMode(pin, OUTPUT);','Make a pin an output (in setup)'],['digitalWrite(IN1, HIGH);','Direction pins: HIGH or LOW'],['analogWrite(ENA, 255);','Speed: 0 stop … 255 full'],['delay(1000);','Keep doing it for 1 second']];
const CAR_PINS='// Robot car wiring: ENA=14 IN1=27 IN2=26 IN3=25 IN4=33 ENB=32\n';
const COURSE=[
 {id:'motor',icon:'⚙',title:{en:'Make a motor spin',bn:'মোটর ঘোরাও'},sub:{en:'Circuits, switches, motors',bn:'সার্কিট, সুইচ, মোটর'},steps:[
  {id:'m1',type:'card',est:25,visual:'tookie',title:{en:'Today we build a robot',bn:'আজ আমরা একটা রোবট বানাবো'},
   body:{en:'A robot is a machine that can move and decide. To move, our robot needs motors: one for each wheel. So let’s start with one motor.',bn:'রোবট এমন একটা যন্ত্র, যেটা নড়তে পারে আর সিদ্ধান্ত নিতে পারে। নড়তে হলে রোবটের দরকার মোটর, প্রতিটা চাকার জন্য একটা। চলো একটা মোটর দিয়ে শুরু করি।'}},
  {id:'m2',type:'card',est:30,visual:'loop',title:{en:'Electricity needs a loop',bn:'বিদ্যুতের দরকার একটা লুপ'},
   body:{en:'Current flows out of the battery’s + side, through the motor, and back into the − side. This closed loop is a circuit. Break the loop anywhere and everything stops.',bn:'কারেন্ট ব্যাটারির + দিক থেকে বের হয়, মোটরের ভেতর দিয়ে যায়, আবার − দিকে ফিরে আসে। এই বন্ধ পথটাই সার্কিট। কোথাও লুপ ভাঙলে সব থেমে যায়।'}},
  {id:'m3',type:'card',est:20,basic:true,visual:'switch',title:{en:'A switch is a gate',bn:'সুইচ হলো একটা গেট'},
   body:{en:'A switch sits inside the loop. ON closes the gate, so current flows. OFF opens it, so nothing flows.',bn:'সুইচ থাকে লুপের ভেতরে। ON করলে গেট বন্ধ হয়, কারেন্ট চলে। OFF করলে গেট খোলে, কারেন্ট থামে।'}},
  {id:'m3x',type:'card',est:30,extra:true,visual:'water',title:{en:'Think of water in a pipe',bn:'পাইপে পানির কথা ভাবো'},
   body:{en:'The battery is a pump, the wires are pipes, the motor is a water wheel and the switch is a tap. Water only turns the wheel if the pipe makes a full circle back to the pump.',bn:'ব্যাটারি হলো পাম্প, তার হলো পাইপ, মোটর হলো পানির চাকা, আর সুইচ হলো কল। পাইপ ঘুরে আবার পাম্পে ফিরলে তবেই পানি চাকা ঘোরায়।'}},
  {id:'m4',type:'sim',est:150,palette:['battery','switch','motor'],title:{en:'Build it in the Circuit Lab',bn:'সার্কিট ল্যাবে বানাও'},
   body:{en:'1. Drag a battery, a switch and a motor onto the board.\n2. Click a pin, then click another pin to add a wire.\n3. Make one loop: battery + → switch → motor → battery −.\n4. Click the switch to turn it ON.',bn:'১. একটা ব্যাটারি, একটা সুইচ আর একটা মোটর বোর্ডে টেনে আনো।\n২. একটা পিনে ক্লিক করো, তারপর আরেকটা পিনে: তার লেগে যাবে।\n৩. একটা লুপ বানাও: ব্যাটারি + → সুইচ → মোটর → ব্যাটারি −।\n৪. সুইচে ক্লিক করে ON করো।'},
   check:(sim,P)=>{const r=checkMotorLoop(sim); if(r.ok)P.motorDir=r.data.dir; return r},
   ask:{en:['Why do I need a switch?','Which pin is + on the battery?'],bn:['সুইচ কেন লাগে?','ব্যাটারির + কোনটা?']}},
  {id:'m5',type:'sim',est:60,from:'m4',palette:['battery','switch','motor'],title:{en:'Make it spin the other way',bn:'উল্টো দিকে ঘোরাও'},
   body:{en:'Swap the two wires on the motor. Click a wire and press Delete, then wire it again the other way round.',bn:'মোটরের দুটো তার অদলবদল করো। তারে ক্লিক করে Delete চাপো, তারপর উল্টো করে আবার লাগাও।'},check:checkReverse},
  {id:'m6',type:'photo',est:240,title:{en:'Now build it for real',bn:'এবার সত্যি সত্যি বানাও'},
   body:{en:'You built it in the simulator, so you can build it in real life too! Use the battery pack, switch and motor from your kit. Take a photo and send it to Tookie.',bn:'সিমুলেটরে বানাতে পেরেছ, তাই বাস্তবেও পারবে! কিটের ব্যাটারি, সুইচ আর মোটর দিয়ে বানাও। একটা ছবি তুলে ইন্সট্রাক্টরকে পাঠাও।'},
   expect:'A battery pack, a switch and a small DC or TT gear motor connected in one loop with wires.',checklist:['Battery pack','Switch in the loop','Both motor wires connected']},
  {id:'m7',type:'done',title:{en:'Lesson 1 complete',bn:'লেসন ১ শেষ'},body:{en:'You know what a circuit is, how a switch controls it, and how to reverse a motor.',bn:'তুমি জানো সার্কিট কী, সুইচ কীভাবে নিয়ন্ত্রণ করে, আর মোটর কীভাবে উল্টো ঘোরাতে হয়।'}}]},

 {id:'brain',icon:'◆',title:{en:'Meet the brain',bn:'রোবটের মস্তিষ্ক'},sub:{en:'Microcontrollers and the ESP32',bn:'মাইক্রোকন্ট্রোলার আর ESP32'},steps:[
  {id:'b1',type:'card',est:25,visual:'phone',title:{en:'A switch is not enough',bn:'শুধু সুইচ দিয়ে হবে না'},
   body:{en:'With a switch, you have to press it yourself. We want to drive our robot from a phone, and later let it decide by itself. For that it needs a brain that follows instructions: a program.',bn:'সুইচ তো তোমাকে নিজে চাপতে হয়। আমরা চাই ফোন দিয়ে রোবট চালাতে, আর পরে রোবট নিজেই সিদ্ধান্ত নিক। তার জন্য দরকার একটা মস্তিষ্ক, যে নির্দেশ মেনে চলে: একটা প্রোগ্রাম।'}},
  {id:'b2',type:'card',est:25,visual:'chip',title:{en:'The brain is a microcontroller',bn:'মস্তিষ্কটা হলো মাইক্রোকন্ট্রোলার'},
   body:{en:'A microcontroller is a tiny computer on one chip. You write code, upload it, and it does that job again and again: read a button, blink a light, spin a motor.',bn:'মাইক্রোকন্ট্রোলার হলো একটা চিপে ছোট্ট একটা কম্পিউটার। তুমি কোড লেখো, আপলোড করো, আর সে কাজটা বারবার করে: বাটন পড়া, লাইট জ্বালানো, মোটর ঘোরানো।'}},
  {id:'b3',type:'boards',est:35,title:{en:'There are many microcontrollers',bn:'অনেক রকম মাইক্রোকন্ট্রোলার আছে'},
   body:{en:'Here are four you will see a lot. They all run code; they differ in size, speed and what is built in.',bn:'এই চারটা তুমি অনেক দেখবে। সবাই কোড চালায়; পার্থক্য আকার, গতি আর ভেতরে কী আছে তাতে।'}},
  {id:'b4',type:'card',est:30,visual:'esp32chips',title:{en:'We use the ESP32',bn:'আমরা ব্যবহার করি ESP32'},
   body:{en:'ESP32 is a microcontroller with Wi-Fi and Bluetooth built in. Give it code for one dedicated task, and it will do that task. Bluetooth lets your phone talk to it: perfect for an RC car.',bn:'ESP32 এমন একটা মাইক্রোকন্ট্রোলার, যার ভেতরেই Wi-Fi আর Bluetooth আছে। কোড দিয়ে একটা নির্দিষ্ট কাজ দিলে সে সেটাই করবে। Bluetooth থাকায় ফোন ওর সাথে কথা বলতে পারে: RC কারের জন্য একদম ঠিক।'}},
  {id:'b5',type:'pins',est:90,title:{en:'Look at the ESP32’s pins',bn:'ESP32 এর পিনগুলো দেখো'},
   body:{en:'Pins are the metal legs. Each one has jobs. Tap a type to see where those pins are.',bn:'পিন হলো ধাতুর পা। প্রতিটার কিছু কাজ আছে। একটা ধরন চাপো, দেখো সেই পিনগুলো কোথায়।'}},
  {id:'b5x',type:'card',est:30,extra:true,visual:'digital',title:{en:'Digital vs analog',bn:'ডিজিটাল আর অ্যানালগ'},
   body:{en:'Digital is like a light switch: only ON (HIGH) or OFF (LOW). Analog is like a volume knob: many values in between. ESP32 reads analog as a number from 0 to 4095.',bn:'ডিজিটাল হলো লাইটের সুইচের মতো: শুধু ON (HIGH) বা OFF (LOW)। অ্যানালগ হলো ভলিউম নবের মতো: মাঝখানে অনেক মান। ESP32 অ্যানালগকে 0 থেকে 4095 সংখ্যায় পড়ে।'}},
  {id:'b6',type:'quiz',est:90,title:{en:'Quick check: ESP32 pins',bn:'ছোট্ট কুইজ: ESP32 এর পিন'},
   body:{en:'Instructor picks the questions based on how you have been learning so far.',bn:'তুমি এ পর্যন্ত কীভাবে শিখেছ, সেটা দেখে ইন্সট্রাক্টর প্রশ্ন বেছে নেয়।'}},
  {id:'b7',type:'done',title:{en:'Lesson 2 complete',bn:'লেসন ২ শেষ'},body:{en:'You know what a microcontroller is, why we chose the ESP32, and which pins do what.',bn:'তুমি জানো মাইক্রোকন্ট্রোলার কী, কেন ESP32 বেছেছি, আর কোন পিন কী করে।'}}]},

 {id:'led',icon:'✦',title:{en:'Light an LED with code',bn:'কোড দিয়ে LED জ্বালাও'},sub:{en:'Breadboard, setup(), loop(), upload',bn:'ব্রেডবোর্ড, setup(), loop(), আপলোড'},steps:[
  {id:'l1',type:'card',est:20,visual:'parts',title:{en:'Your first ESP32 project',bn:'তোমার প্রথম ESP32 প্রজেক্ট'},
   body:{en:'We will make the ESP32 switch a light on and off. You need: ESP32, breadboard, LED, 220 Ω resistor and jumper wires.',bn:'আমরা ESP32 দিয়ে একটা লাইট জ্বালাবো-নেভাবো। লাগবে: ESP32, ব্রেডবোর্ড, LED, 220 Ω রেজিস্টর আর জাম্পার তার।'}},
  {id:'l2',type:'card',est:30,visual:'breadboard',title:{en:'How a breadboard works',bn:'ব্রেডবোর্ড কীভাবে কাজ করে'},
   body:{en:'A breadboard connects parts without soldering. The 5 holes in each column (a–e) are joined inside. The long + and − rails along the edges are joined along their length.',bn:'ব্রেডবোর্ডে ঝালাই ছাড়াই পার্টস জোড়া যায়। প্রতিটা কলামের ৫টা গর্ত (a–e) ভেতরে জোড়া। কিনারের লম্বা + আর − লাইন পুরোটা জুড়ে জোড়া।'}},
  {id:'l3',type:'card',est:20,basic:true,visual:'ledleg',title:{en:'LED and resistor',bn:'LED আর রেজিস্টর'},
   body:{en:'An LED has a long leg (+) and a short leg (−). It only works one way round. The resistor protects it from too much current.',bn:'LED এর একটা লম্বা পা (+) আর একটা ছোট পা (−)। এটা শুধু এক দিকেই কাজ করে। রেজিস্টর ওকে বেশি কারেন্ট থেকে বাঁচায়।'}},
  {id:'l4',type:'sim',est:240,palette:['esp32','breadboard','led','resistor'],testPin:true,title:{en:'Build the circuit',bn:'সার্কিটটা বানাও'},
   body:{en:'1. Bring an ESP32 and a breadboard from Components.\n2. Drop the LED and the resistor into the breadboard holes.\n3. Wire: ESP32 D23 → resistor → LED long leg (+).\n4. LED short leg (−) → ESP32 GND.\n5. Press “Test D23” to send power from the pin.',bn:'১. Components থেকে ESP32 আর ব্রেডবোর্ড আনো।\n২. LED আর রেজিস্টর ব্রেডবোর্ডের গর্তে বসাও।\n৩. তার দাও: ESP32 D23 → রেজিস্টর → LED লম্বা পা (+)।\n৪. LED ছোট পা (−) → ESP32 GND।\n৫. “Test D23” চেপে পিন থেকে বিদ্যুৎ পাঠাও।'},
   check:checkLED,ask:{en:['Which leg of the LED is +?','How are the breadboard holes connected?'],bn:['LED এর কোন পা +?','ব্রেডবোর্ডের গর্তগুলো কীভাবে জোড়া?']}},
  {id:'l5',type:'photo',est:300,title:{en:'Build it for real and send a photo',bn:'বাস্তবে বানাও আর ছবি পাঠাও'},
   body:{en:'Build the same circuit on your real breadboard. Take a clear photo from above so Instructor can see the LED legs and the wires.',bn:'একই সার্কিট আসল ব্রেডবোর্ডে বানাও। উপর থেকে পরিষ্কার একটা ছবি তোলো, যাতে ইন্সট্রাক্টর LED এর পা আর তারগুলো দেখতে পায়।'},
   expect:'An ESP32 board, a breadboard, one LED and one resistor in series, with a wire from an ESP32 GPIO pin to the resistor and a wire from the LED to GND.',checklist:['ESP32 and breadboard','LED and resistor in series','Wire to GND']},
  {id:'l6',type:'card',est:35,visual:'setuploop',title:{en:'How ESP32 code works',bn:'ESP32 এর কোড কীভাবে চলে'},
   body:{en:'Every program has two parts.\nvoid setup() { } runs once when the board turns on. Here you tell each pin its job.\nvoid loop() { } runs again and again, forever. Here you write what keeps happening.',bn:'প্রতিটা প্রোগ্রামের দুটো অংশ।\nvoid setup() { } বোর্ড চালু হলে একবার চলে। এখানে বলো কোন পিন কী কাজ করবে।\nvoid loop() { } বারবার চলতেই থাকে। এখানে লেখো যা চলতে থাকবে।'}},
  {id:'l6s',type:'syntax',est:108,keys:['setup', 'loop', 'braces', 'semicolon', 'comment', 'pinMode', 'digitalWrite', 'HIGH', 'delay'],title:{en:'Code words: what each one does',bn:'কোডের শব্দ: কোনটা কী করে'},body:{en:'Before you write code, meet the words you will use. Tap 🔊 on any card to hear it.',bn:'কোড লেখার আগে যে শব্দগুলো ব্যবহার করবে সেগুলো চিনে নাও। যেকোনো কার্ডে 🔊 চাপো।'}},
  {id:'l7',type:'code',est:240,preset:'led',title:{en:'Code: make it blink',bn:'কোড: ব্লিংক করাও'},
   body:{en:'Make the LED on D23 turn on for half a second, then off for half a second, forever.',bn:'D23 এর LED আধা সেকেন্ড জ্বলবে, আধা সেকেন্ড নিভবে, সারাজীবন।'},
   syntax:[['pinMode(pin, OUTPUT);','In setup(): this pin sends power out'],['digitalWrite(pin, HIGH);','Pin ON'],['digitalWrite(pin, LOW);','Pin OFF'],['delay(ms);','Wait. 500 = half a second']],
   starter:'void setup() {\n  \n}\n\nvoid loop() {\n  \n}\n',check:checkBlink,
   hints:{en:['setup(): pinMode(23, OUTPUT);','loop(): turn on, wait, turn off, wait.','digitalWrite(23, HIGH); delay(500); digitalWrite(23, LOW); delay(500);'],bn:['setup(): pinMode(23, OUTPUT);','loop(): জ্বালাও, অপেক্ষা, নেভাও, অপেক্ষা।','digitalWrite(23, HIGH); delay(500); digitalWrite(23, LOW); delay(500);']}},
  {id:'l7s',type:'syntax',est:48,keys:['digitalRead', 'INPUT_PULLUP', 'if', 'compare'],title:{en:'New code words: reading a button',bn:'নতুন কোডের শব্দ: বাটন পড়া'},body:{en:'To react to a button, the ESP32 has to read a pin and decide.',bn:'বাটনে সাড়া দিতে ESP32 কে পিন পড়ে সিদ্ধান্ত নিতে হয়।'}},
  {id:'l8',type:'code',est:300,preset:'led',title:{en:'Code: light only while the button is held',bn:'কোড: বাটন চেপে ধরলেই আলো'},
   body:{en:'A push button is wired between D4 and GND. With INPUT_PULLUP the pin reads HIGH normally, and LOW while you press. Make the LED light only while the button is held. Hold the yellow button in the lab to test.',bn:'D4 আর GND এর মাঝে একটা পুশ বাটন লাগানো। INPUT_PULLUP দিলে পিন সাধারণত HIGH পড়ে, আর চাপলে LOW। বাটন চেপে ধরলেই যেন LED জ্বলে। ল্যাবের হলুদ বাটন চেপে ধরে পরীক্ষা করো।'},
   syntax:[['pinMode(4, INPUT_PULLUP);','Button pin listens (HIGH when not pressed)'],['digitalRead(4)','HIGH or LOW right now'],['if (condition) { } else { }','Choose what to do'],['==','“is equal to”']],
   starter:'void setup() {\n  pinMode(23, OUTPUT);\n  \n}\n\nvoid loop() {\n  \n}\n',check:checkButton,
   hints:{en:['In setup(): pinMode(4, INPUT_PULLUP);','In loop(): if (digitalRead(4) == LOW) { … } else { … }','if (digitalRead(4) == LOW) { digitalWrite(23, HIGH); } else { digitalWrite(23, LOW); }'],bn:['setup() এ: pinMode(4, INPUT_PULLUP);','loop() এ: if (digitalRead(4) == LOW) { … } else { … }','if (digitalRead(4) == LOW) { digitalWrite(23, HIGH); } else { digitalWrite(23, LOW); }']}},
  {id:'l9',type:'ide',est:420,title:{en:'Upload it to your real ESP32',bn:'আসল ESP32 এ আপলোড করো'},
   body:{en:'We use the free Arduino IDE to send your code into the ESP32. Do each step and tick it.',bn:'ফ্রি Arduino IDE দিয়ে তোমার কোড ESP32 এ পাঠাবো। প্রতিটা ধাপ করো আর টিক দাও।'}},
  {id:'l10',type:'video',est:300,title:{en:'Show it working: send a video',bn:'কাজ করছে দেখাও: ভিডিও পাঠাও'},
   body:{en:'Record a short video (5–15 s) of your real LED turning on while you hold the button. Instructor will watch it and check.',bn:'৫–১৫ সেকেন্ডের একটা ছোট ভিডিও করো: বাটন চেপে ধরলে আসল LED জ্বলছে। ইন্সট্রাক্টর দেখে যাচাই করবে।'},
   expect:'A real LED on a breadboard wired to an ESP32. The LED is off at first and lights up while a finger holds a push button (or it blinks).',checklist:['ESP32 powered by USB','LED changes from off to on','Button is pressed when it lights']},
  {id:'l11',type:'done',title:{en:'Lesson 3 complete',bn:'লেসন ৩ শেষ'},body:{en:'You used pins, setup(), loop(), digitalWrite and digitalRead, and uploaded real code. That is real embedded programming.',bn:'তুমি পিন, setup(), loop(), digitalWrite, digitalRead ব্যবহার করেছ আর আসল কোড আপলোড করেছ। এটাই আসল এমবেডেড প্রোগ্রামিং।'}}]},

 {id:'driver',icon:'▲',title:{en:'Motor driver: drive the car',bn:'মোটর ড্রাইভার: গাড়ি চালাও'},sub:{en:'L298N, direction, speed',bn:'L298N, দিক, গতি'},steps:[
  {id:'d1',type:'card',est:25,visual:'weak',title:{en:'Why a motor driver?',bn:'মোটর ড্রাইভার কেন?'},
   body:{en:'An ESP32 pin gives only a tiny current: too weak for a motor. The L298N takes power from the big battery and passes it to the motors, following the ESP32’s orders.',bn:'ESP32 এর পিন খুব কম কারেন্ট দেয়: মোটরের জন্য খুব দুর্বল। L298N বড় ব্যাটারি থেকে শক্তি নিয়ে ESP32 এর নির্দেশমতো মোটরে দেয়।'}},
  {id:'d2',type:'card',est:40,visual:'truth',title:{en:'Two pins choose the direction',bn:'দুটো পিন দিক ঠিক করে'},
   body:{en:'For each motor, two pins choose the direction and one pin sets the speed. Left motor: IN1, IN2 and ENA. Right motor: IN3, IN4 and ENB.',bn:'প্রতিটা মোটরের জন্য দুটো পিন দিক ঠিক করে, আর একটা পিন গতি। বাম মোটর: IN1, IN2, ENA। ডান মোটর: IN3, IN4, ENB।'}},
  {id:'d2s',type:'syntax',est:48,keys:['analogWrite', 'int', 'define', 'function'],title:{en:'Code words for motors',bn:'মোটরের কোডের শব্দ'},body:{en:'Speed, names for pins, and your own commands.',bn:'গতি, পিনের নাম, আর তোমার নিজের কমান্ড।'}},
  {id:'d3',type:'code',est:240,preset:'car',title:{en:'Code: drive forward',bn:'কোড: সামনে চালাও'},
   body:{en:'Make both wheels spin forward at full speed.',bn:'দুই চাকাই পুরো গতিতে সামনে ঘোরাও।'},syntax:CAR_SYNTAX,
   starter:CAR_PINS+'void setup() {\n  \n}\n\nvoid loop() {\n  \n}\n',check:checkForward,
   hints:{en:['setup(): make 14, 27, 26, 25, 33, 32 outputs.','Forward: IN1 HIGH, IN2 LOW, IN3 HIGH, IN4 LOW.','analogWrite(14, 255); analogWrite(32, 255);'],bn:['setup(): 14, 27, 26, 25, 33, 32 আউটপুট করো।','সামনে: IN1 HIGH, IN2 LOW, IN3 HIGH, IN4 LOW।','analogWrite(14, 255); analogWrite(32, 255);']}},
  {id:'d4',type:'code',est:360,preset:'car',title:{en:'Code: forward, back, left, right',bn:'কোড: সামনে, পেছনে, বামে, ডানে'},
   body:{en:'Drive forward, backward, turn left and turn right, 1 second each. Tip: write a function for each move, like void forward() { … }.',bn:'সামনে, পেছনে, বামে আর ডানে, প্রতিটা ১ সেকেন্ড করে। টিপ: প্রতিটা চলার জন্য একটা ফাংশন লেখো, যেমন void forward() { … }।'},syntax:[...CAR_SYNTAX,['void forward() { … }','Your own command you can call: forward();']],
   starter:CAR_PINS+'void setup() {\n  \n}\n\nvoid loop() {\n  \n}\n',check:checkMoves,
   hints:{en:['Back = swap HIGH and LOW on both motors.','Left = left wheel back, right wheel forward.','loop(): forward(); delay(1000); back(); delay(1000); left(); delay(1000); right(); delay(1000);'],bn:['পেছনে = দুই মোটরেই HIGH আর LOW বদলাও।','বামে = বাম চাকা পেছনে, ডান চাকা সামনে।','loop(): forward(); delay(1000); back(); delay(1000); left(); delay(1000); right(); delay(1000);']}},
  {id:'d5',type:'done',title:{en:'Lesson 4 complete',bn:'লেসন ৪ শেষ'},body:{en:'You can drive two motors in any direction with code.',bn:'কোড দিয়ে দুটো মোটর যেকোনো দিকে চালাতে পারো।'}}]},

 {id:'serial',icon:'≡',title:{en:'Serial Monitor',bn:'সিরিয়াল মনিটর'},sub:{en:'Let the robot talk to you',bn:'রোবট তোমার সাথে কথা বলুক'},steps:[
  {id:'s1',type:'card',est:30,visual:'serial',title:{en:'A chat window to your robot',bn:'রোবটের সাথে চ্যাট উইন্ডো'},
   body:{en:'The Serial Monitor shows messages from the ESP32 on your computer. Serial.begin(115200) opens it. Serial.println("text") sends a line. Set the monitor to 115200 baud too.',bn:'সিরিয়াল মনিটর ESP32 এর মেসেজ তোমার কম্পিউটারে দেখায়। Serial.begin(115200) দিয়ে চালু হয়। Serial.println("text") একটা লাইন পাঠায়। মনিটরও 115200 baud এ রাখো।'}},
  {id:'s1s',type:'syntax',est:24,keys:['Serial.begin', 'Serial.println'],title:{en:'Code words for the Serial Monitor',bn:'সিরিয়াল মনিটরের কোডের শব্দ'},body:{en:'Two lines let your robot talk to you.',bn:'দুটো লাইন দিয়েই রোবট তোমার সাথে কথা বলে।'}},
  {id:'s2',type:'code',est:240,preset:'led',title:{en:'Code: print the button',bn:'কোড: বাটনের অবস্থা প্রিন্ট করো'},
   body:{en:'Print the button’s state every 200 ms. Hold the button and watch the numbers change.',bn:'প্রতি ২০০ মিলিসেকেন্ডে বাটনের অবস্থা প্রিন্ট করো। বাটন চেপে ধরো আর সংখ্যা বদলাতে দেখো।'},
   syntax:[['Serial.begin(115200);','In setup(): open the monitor'],['Serial.println(value);','Print a line'],['digitalRead(4)','1 or 0'],['delay(200);','Wait a little']],
   starter:'void setup() {\n  pinMode(4, INPUT_PULLUP);\n  \n}\n\nvoid loop() {\n  \n}\n',check:checkSerial,
   hints:{en:['setup(): Serial.begin(115200);','loop(): print digitalRead(4).','Serial.println(digitalRead(4)); delay(200);'],bn:['setup(): Serial.begin(115200);','loop(): digitalRead(4) প্রিন্ট করো।','Serial.println(digitalRead(4)); delay(200);']}},
  {id:'s3',type:'done',title:{en:'Lesson 5 complete',bn:'লেসন ৫ শেষ'},body:{en:'Your robot can now tell you what it sees. Use this whenever something does not work.',bn:'রোবট এখন যা দেখে তা তোমাকে বলতে পারে। কিছু কাজ না করলে এটাই ব্যবহার করবে।'}}]},

 {id:'phone',icon:'◎',title:{en:'Control it from your phone',bn:'ফোন দিয়ে চালাও'},sub:{en:'Bluetooth, apps, final drive',bn:'Bluetooth, অ্যাপ, ফাইনাল ড্রাইভ'},steps:[
  {id:'p1',type:'card',est:30,visual:'btwifi',title:{en:'Bluetooth or Wi-Fi?',bn:'Bluetooth নাকি Wi-Fi?'},
   body:{en:'Bluetooth: the phone talks straight to the ESP32. Simple, about 10 m. Wi-Fi: control it from a web page or an app, with longer range.',bn:'Bluetooth: ফোন সরাসরি ESP32 এর সাথে কথা বলে। সহজ, প্রায় ১০ মিটার। Wi-Fi: ওয়েব পেজ বা অ্যাপ থেকে চালাও, দূর থেকেও।'}},
  {id:'p2',type:'apps',est:40,title:{en:'Apps you can use',bn:'যেসব অ্যাপ ব্যবহার করা যায়'},
   body:{en:'Your phone sends letters like F, B, L, R, S. The ESP32 reads each letter and moves.',bn:'তোমার ফোন F, B, L, R, S এর মতো অক্ষর পাঠায়। ESP32 প্রতিটা অক্ষর পড়ে আর চলে।'}},
  {id:'p2s',type:'syntax',est:48,keys:['include', 'SerialBT', 'char', 'and'],title:{en:'Code words for Bluetooth',bn:'Bluetooth এর কোডের শব্দ'},body:{en:'A library, a name, and reading one letter at a time.',bn:'একটা লাইব্রেরি, একটা নাম, আর একবারে একটা অক্ষর পড়া।'}},
  {id:'p3',type:'code',est:420,preset:'car',bt:true,title:{en:'Code: drive with letters from the phone',bn:'কোড: ফোনের অক্ষর দিয়ে চালাও'},
   body:{en:'F = forward, B = back, L = left, R = right, S = stop. Use the virtual phone below the lab to test.',bn:'F = সামনে, B = পেছনে, L = বামে, R = ডানে, S = থামো। ল্যাবের নিচের ভার্চুয়াল ফোন দিয়ে পরীক্ষা করো।'},
   syntax:[['#include "BluetoothSerial.h"','Bluetooth library (top of file)'],['BluetoothSerial SerialBT;','Create the Bluetooth link'],['SerialBT.begin("MyRobot");','In setup(): start with a name'],['if (SerialBT.available()) { }','Did a letter arrive?'],['char c = SerialBT.read();','Read one letter'],['if (c == \'F\') { forward(); }','Act on it']],
   starter:'#include "BluetoothSerial.h"\nBluetoothSerial SerialBT;\n'+CAR_PINS+'\nvoid setup() {\n  \n}\n\nvoid loop() {\n  \n}\n',check:checkBT,
   hints:{en:['setup(): SerialBT.begin("MyRobot"); and the pinModes.','loop(): if (SerialBT.available()) { char c = SerialBT.read(); … }','if (c == \'F\') forward(); if (c == \'S\') stopAll();'],bn:['setup(): SerialBT.begin("MyRobot"); আর pinMode গুলো।','loop(): if (SerialBT.available()) { char c = SerialBT.read(); … }','if (c == \'F\') forward(); if (c == \'S\') stopAll();']}},
  {id:'p4',type:'video',est:600,title:{en:'Final: drive your real robot',bn:'ফাইনাল: আসল ইন্সট্রাক্টর চালাও'},
   body:{en:'Upload your code, pair your phone with “MyRobot”, and drive! Send a short video. Instructor will check it and give you your certificate.',bn:'কোড আপলোড করো, ফোনকে “MyRobot” এর সাথে পেয়ার করো, আর চালাও! একটা ছোট ভিডিও পাঠাও। ইন্সট্রাক্টর দেখে তোমাকে সার্টিফিকেট দেবে।'},
   expect:'A small two-wheeled robot car driving on the floor or a table, moving forward and turning, ideally with a phone visible as the controller.',checklist:['Robot car is visible','It moves by itself','It turns or changes direction']},
  {id:'p5',type:'done',final:true,title:{en:'You built a robot!',bn:'তুমি একটা রোবট বানিয়েছ!'},body:{en:'From a single motor to a phone-controlled car. Next: add the sonar so your robot avoids walls by itself.',bn:'একটা মোটর থেকে ফোন-নিয়ন্ত্রিত গাড়ি পর্যন্ত। এরপর: সোনার যোগ করো, যাতে ইন্সট্রাক্টর নিজেই দেয়াল এড়িয়ে চলে।'}}]}
];

/* ---------- quiz bank (facts for the 30-pin ESP32 DevKit) ---------- */
const QUIZ={
 easy:[
  {q:{en:'How many GND pins does our ESP32 board have?',bn:'আমাদের ESP32 বোর্ডে কয়টা GND পিন আছে?'},o:['1','2','4','6'],a:1,why:{en:'One on each side: 2 GND pins.',bn:'দুই পাশে একটা করে: মোট ২টা GND পিন।'}},
  {q:{en:'Which pin gives out 3.3 V?',bn:'কোন পিন 3.3 V দেয়?'},o:['VIN','3V3','GND','D23'],a:1,why:{en:'3V3 is the 3.3 V output.',bn:'3V3 হলো 3.3 V আউটপুট।'}},
  {q:{en:'Which pin takes 5 V in to power the board?',bn:'কোন পিন দিয়ে বোর্ডে 5 V দেওয়া যায়?'},o:['VIN','3V3','EN','D2'],a:0,why:{en:'VIN is the 5 V input. There is 1 VIN pin.',bn:'VIN হলো 5 V ইনপুট। VIN পিন ১টা।'}},
  {q:{en:'A digital pin can be…',bn:'একটা ডিজিটাল পিন হতে পারে…'},o:['Only HIGH or LOW','Any number 0–4095','Only 5 V','Only GND'],a:0,why:{en:'Digital means two states: HIGH (on) or LOW (off).',bn:'ডিজিটাল মানে দুই অবস্থা: HIGH (চালু) বা LOW (বন্ধ)।'}},
  {q:{en:'Which pin has the built-in blue LED?',bn:'বোর্ডের নীল LED কোন পিনে?'},o:['D2','D23','D4','VIN'],a:0,why:{en:'GPIO 2 drives the small blue LED.',bn:'GPIO 2 ছোট নীল LED চালায়।'}}],
 medium:[
  {q:{en:'How many pins on our ESP32 board can read analog (ADC)?',bn:'আমাদের ESP32 বোর্ডে কয়টা পিন অ্যানালগ (ADC) পড়তে পারে?'},o:['6','10','15','30'],a:2,why:{en:'15: VP, VN, 34, 35, 32, 33, 25, 26, 27, 14, 12, 13, 4, 2, 15.',bn:'১৫টা: VP, VN, 34, 35, 32, 33, 25, 26, 27, 14, 12, 13, 4, 2, 15।'}},
  {q:{en:'What is the biggest number analogRead() gives on ESP32?',bn:'ESP32 এ analogRead() সর্বোচ্চ কত দেয়?'},o:['255','1023','4095','65535'],a:2,why:{en:'12-bit: 0 to 4095.',bn:'১২-বিট: 0 থেকে 4095।'}},
  {q:{en:'Which pins can ONLY be inputs?',bn:'কোন পিনগুলো শুধু ইনপুট হতে পারে?'},o:['34, 35, VP, VN','23, 22, 21, 19','2, 4, 15','3V3, VIN'],a:0,why:{en:'GPIO 34, 35, 36 (VP) and 39 (VN) are input-only: 4 pins.',bn:'GPIO 34, 35, 36 (VP) আর 39 (VN) শুধু ইনপুট: ৪টা পিন।'}},
  {q:{en:'Which function sets a motor speed from 0 to 255?',bn:'কোন ফাংশন দিয়ে মোটরের গতি 0–255 দেওয়া হয়?'},o:['digitalWrite','analogWrite','pinMode','delay'],a:1,why:{en:'analogWrite sends PWM: 0 = stop, 255 = full.',bn:'analogWrite PWM পাঠায়: 0 = থামা, 255 = পুরো গতি।'}},
  {q:{en:'ESP32 GPIO pins work at…',bn:'ESP32 এর GPIO পিন কাজ করে…'},o:['3.3 V','5 V','9 V','12 V'],a:0,why:{en:'3.3 V logic. Never feed 5 V into a GPIO.',bn:'3.3 V লজিক। GPIO তে কখনো 5 V দিও না।'}}],
 hard:[
  {q:{en:'Which ADC pins stop working when Wi-Fi is on?',bn:'Wi-Fi চালু থাকলে কোন ADC পিন কাজ করে না?'},o:['ADC1 pins (32–39)','ADC2 pins (like 25, 26, 27, 14)','All ADC pins','None'],a:1,why:{en:'ADC2 is shared with the Wi-Fi radio. Use ADC1 pins (32–39) for sensors with Wi-Fi.',bn:'ADC2 Wi-Fi এর সাথে শেয়ার করা। Wi-Fi চালু থাকলে সেন্সরের জন্য ADC1 (32–39) ব্যবহার করো।'}},
  {q:{en:'Which two pins have a real analog output (DAC)?',bn:'কোন দুটো পিনে আসল অ্যানালগ আউটপুট (DAC) আছে?'},o:['25 and 26','2 and 4','34 and 35','TX0 and RX0'],a:0,why:{en:'GPIO 25 and 26 have 8-bit DACs.',bn:'GPIO 25 আর 26 এ ৮-বিট DAC আছে।'}},
  {q:{en:'Why should you avoid TX0 and RX0 in projects?',bn:'প্রজেক্টে TX0 আর RX0 এড়িয়ে চলা উচিত কেন?'},o:['They are used for USB upload and Serial','They are only 1.8 V','They are GND','They are input-only'],a:0,why:{en:'GPIO 1 and 3 carry the USB serial used to upload and for the Serial Monitor.',bn:'GPIO 1 আর 3 দিয়ে USB সিরিয়াল চলে: আপলোড আর সিরিয়াল মনিটর।'}},
  {q:{en:'With INPUT_PULLUP and a button to GND, what does digitalRead give while pressed?',bn:'INPUT_PULLUP আর GND তে বাটন থাকলে, চাপা অবস্থায় digitalRead কী দেয়?'},o:['HIGH','LOW','4095','It depends on Wi-Fi'],a:1,why:{en:'Pressing connects the pin to GND, so it reads LOW.',bn:'চাপলে পিন GND তে লাগে, তাই LOW পড়ে।'}},
  {q:{en:'How many pins on our board can sense touch?',bn:'আমাদের বোর্ডে কয়টা পিন স্পর্শ বুঝতে পারে?'},o:['3','9','15','0'],a:1,why:{en:'9 touch pins: 4, 2, 15, 13, 12, 14, 27, 33, 32.',bn:'৯টা টাচ পিন: 4, 2, 15, 13, 12, 14, 27, 33, 32।'}}]};
const ESP_FACTS='ESP32 DevKit 30-pin facts: GND pins: 2. 3V3 output: 1. VIN (5 V input): 1. EN (reset): 1. Analog/ADC pins: 15 (ADC1: VP/36, VN/39, 34, 35, 32, 33; ADC2: 25, 26, 27, 14, 12, 13, 4, 2, 15). ADC2 cannot be used while Wi-Fi is on. analogRead range 0-4095 (12-bit). Input-only pins: 34, 35, 36, 39. DAC: 25, 26. Touch: 4, 2, 15, 13, 12, 14, 27, 33, 32. Built-in LED: GPIO 2. TX0/RX0 = GPIO 1/3 used for USB serial. GPIO logic is 3.3 V. PWM (analogWrite 0-255) works on all output-capable GPIO. Wi-Fi + Bluetooth built in, dual-core 240 MHz.';

window.TookieCourse={COURSE,QUIZ,ESP_FACTS,presetLED,presetCar};
})();
