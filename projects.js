/* Instructor project catalog: guided builds from "how a motor works" to an RC car.
   Each project: story, parts, wiring, flowchart, steps, think-questions, 3 levelled hints,
   a starter skeleton with TODOs (never the full answer) and an auto-check that runs the
   learner's real circuit + code in the simulator with scripted sensor changes. */
(function(){
const {Runner,LIB}=window.TookieSim;

/* ---------- generic checker ---------- */
const OUT={
  buzzer:e=>e.loads.some(l=>l.type==='buzzer'&&l.on),
  pump:e=>e.loads.some(l=>l.type==='pump'&&l.on)||e.motors.some(d=>d!==0),
  led:e=>e.leds.some(Boolean),
  motor:e=>e.motors.some(d=>d!==0),
  alarm:e=>e.loads.some(l=>l.type==='buzzer'&&l.on)||e.leds.some(Boolean),
  servoOpen:e=>e.servo.some(a=>a>=60),
};
const NAME={buzzer:{en:'the buzzer',bn:'বাজার'},pump:{en:'the pump',bn:'পাম্প'},led:{en:'the LED',bn:'LED'},motor:{en:'the motors',bn:'মোটর'},alarm:{en:'the alarm (buzzer or LED)',bn:'অ্যালার্ম (বাজার বা LED)'},servoOpen:{en:'the servo (door open)',bn:'সার্ভো (দরজা খোলা)'}};
const msig=e=>e.motors.join(',');
function setProps(sim,set){if(!set)return; for(const s of [].concat(set)){const cs=sim.comps.filter(c=>c.type===s.type); cs.forEach((c,i)=>{const v=s.vals?s.vals[i]:s.val; if(v===undefined)return; if(s.prop==='pressed')c.pressed=v; else c[s.prop]=v})}}
function runCheck(pr,sim,code){
  const ck=pr.check, miss=(ck.need||[]).filter(n=>!sim.comps.some(c=>c.type===n));
  if(miss.length)return {ok:false,msg:{en:`Bring ${miss.map(m=>LIB[m].name).join(', ')} from the part library first.`,bn:`আগে লাইব্রেরি থেকে আনো: ${miss.map(m=>LIB[m].name).join(', ')}।`}};
  if(ck.kind==='circuit')return ck.test(sim);
  const sends=(ck.bt||[]).map(x=>({...x,sent:0}));
  const hook=(t,s,run)=>{for(const ph of ck.phases)if(t>=ph.t[0]&&t<ph.t[1])setProps(s,ph.set); for(const b of sends)if(t>=b.at&&!b.sent){b.sent=1; run.btQueue.push(b.c)}};
  const r=Runner.test(sim,code,ck.ms,hook); if(r.error)return {ok:false,msg:{en:r.error,bn:r.error}};
  const win=ph=>r.trace.filter(e=>e.t>=ph.t[0]+250&&e.t<ph.t[1]);
  const sigs=[];
  for(let i=0;i<ck.phases.length;i++){const ph=ck.phases[i], w=win(ph); const last=w[w.length-1]||r.trace[r.trace.length-1]; sigs.push(w.length?msig(w[Math.floor(w.length/2)]):'');
    if(!last)return {ok:false,msg:{en:'Your loop() never ran. Is there a loop() function?',bn:'loop() একবারও চলেনি। loop() ফাংশন আছে তো?'}};
    const e=ph.expect;
    if(e.out){const f=OUT[e.out]; const got=e.on?w.some(f):!f(last);
      if(!got)return {ok:false,msg:{en:`${ph.say.en}: I expected ${NAME[e.out].en} to be ${e.on?'ON':'OFF'}, but it was ${e.on?'off':'on'}. ${pr.check.tip?.en||''}`,bn:`${ph.say.bn}: ${NAME[e.out].bn} ${e.on?'চালু':'বন্ধ'} হওয়ার কথা, কিন্তু হয়নি। ${pr.check.tip?.bn||''}`}}}
    if(e.moving&&!w.some(OUT.motor))return {ok:false,msg:{en:`${ph.say.en}: the motors should be turning.`,bn:`${ph.say.bn}: মোটর ঘোরার কথা।`}};
    if(e.differs!=null&&sigs[i]===sigs[e.differs])return {ok:false,msg:{en:`${ph.say.en}: the motors did the same thing as before. Your robot must react differently here.`,bn:`${ph.say.bn}: মোটর আগের মতোই চলছে। এখানে রোবটকে অন্যভাবে সাড়া দিতে হবে।`}};
  }
  if(ck.serial&&!r.serial.trim())return {ok:false,msg:{en:'It works! Now also print the sensor value with Serial.println so you can see it.',bn:'কাজ করছে! এবার Serial.println দিয়ে সেন্সরের মান প্রিন্ট করো।'}};
  return {ok:true,msg:pr.check.win};
}

/* ---------- catalog ---------- */
const P=(o)=>o;
const LIST=[
P({id:'motor',cat:'Basics',level:1,mins:10,hero:'motor',color:'copper',
  title:{en:'How a motor works',bn:'মোটর কীভাবে কাজ করে'},tag:{en:'Spin it, flip it, understand it.',bn:'ঘোরাও, উল্টাও, বোঝো।'},
  story:{en:'A DC motor turns electricity into spinning. Current through a coil makes a magnet that pushes against fixed magnets. Swap the wires and it spins the other way. No code yet: just a battery, a switch and a motor.',bn:'DC মোটর বিদ্যুৎকে ঘূর্ণনে বদলায়। কয়েলে কারেন্ট গেলে চুম্বক তৈরি হয়, যা স্থির চুম্বককে ঠেলে। তার উল্টালে উল্টো দিকে ঘোরে। এখনো কোড নেই।'},
  learn:['Circuit loop','Current direction','Switch'],parts:[['battery',1],['switch',1],['motor',1]],code:false,
  wiring:['Battery + → switch','Switch → motor a','Motor b → battery −'],
  flow:[['start','Battery gives energy'],['action','Switch closes the loop'],['action','Current flows through the coil'],['decision','Current direction?','Spins clockwise','Spins the other way'],['loop','Open the switch: it stops']],
  steps:['Place the battery, the switch and the motor.','Wire a full loop: + → switch → motor → −.','Click the switch: the motor spins.','Swap the two motor wires and switch on again. Which way does it spin now?'],
  questions:['Why does the motor stop when the loop is open?','What changes when you swap the wires?','Where would a robot car use this?'],
  hints:['Electricity needs a full circle back to the battery.','Start at +, go through the switch, through the motor, end at −.','Battery + → switch a, switch b → motor a, motor b → battery −. Then click the switch.'],
  check:{kind:'circuit',need:['battery','motor'],test:sim=>{const r=sim.solve(); return r.motors.some(m=>m.dir)?{ok:true,msg:{en:'Your motor spins. You just built the heart of every robot car.',bn:'মোটর ঘুরছে। প্রতিটা রোবট গাড়ির হৃদয় তুমি বানিয়ে ফেললে।'}}:{ok:false,msg:{en:'The motor is not spinning. Is the loop closed and the switch ON?',bn:'মোটর ঘুরছে না। লুপ পুরো হয়েছে আর সুইচ চালু?'}}}}}),

P({id:'traffic',cat:'Basics',level:1,mins:15,hero:'led_green',color:'green',
  title:{en:'Traffic light',bn:'ট্রাফিক লাইট'},tag:{en:'Your first program with three LEDs.',bn:'তিনটা LED দিয়ে প্রথম প্রোগ্রাম।'},
  story:{en:'Red, yellow, green, repeat. You control time with delay() and turn LEDs on and off with digitalWrite(). Every LED needs a 220 Ω resistor so it does not burn.',bn:'লাল, হলুদ, সবুজ, আবার। delay() দিয়ে সময় আর digitalWrite() দিয়ে LED চালু-বন্ধ।'},
  learn:['pinMode','digitalWrite','delay'],parts:[['esp32',1],['led',1],['led_green',1],['led_blue',1],['resistor',3]],
  wiring:['Red LED long leg → 220 Ω → D23','Second LED → 220 Ω → D22','Third LED → 220 Ω → D21','All short legs → GND'],
  flow:[['start','Start'],['action','Red ON for 3 s'],['action','Yellow ON for 1 s'],['action','Green ON for 3 s'],['loop','Repeat forever']],
  steps:['Place the ESP32, three LEDs and three resistors.','Wire each LED through a resistor to its pin, short legs to GND.','In setup(): make all three pins OUTPUT.','In loop(): one light on, the others off, then delay. Do it three times.'],
  questions:['What happens if two lights are on together?','How would you add a pedestrian button?'],
  hints:['Each light is just: on, wait, off.','Use digitalWrite(pin, HIGH) to turn one on and LOW for the others.','digitalWrite(23, HIGH); digitalWrite(22, LOW); digitalWrite(21, LOW); delay(3000); … then the next colour.'],
  starter:'// Traffic light\n#define RED 23\n#define YELLOW 22\n#define GREEN 21\n\nvoid setup() {\n  // TODO 1: make RED, YELLOW and GREEN outputs\n}\n\nvoid loop() {\n  // TODO 2: red on (others off), wait 3 seconds\n  // TODO 3: yellow on, wait 1 second\n  // TODO 4: green on, wait 3 seconds\n}\n',
  check:{kind:'io',need:['esp32','led'],ms:8000,phases:[{t:[0,8000],expect:{},say:{en:'Run',bn:'চালানো'}}],win:{en:'Your traffic light runs on its own. That is a real embedded program.',bn:'তোমার ট্রাফিক লাইট নিজে নিজে চলছে।'},custom:'pattern'}}),

P({id:'nightlight',cat:'Home',level:1,mins:20,hero:'ldr',color:'blue',
  title:{en:'Automatic night light',bn:'অটো নাইট লাইট'},tag:{en:'Dark outside? Light on.',bn:'অন্ধকার? আলো জ্বলবে।'},
  story:{en:'An LDR changes its resistance with light. Put it with a 10 kΩ resistor and the ESP32 can read a number with analogRead(). Small number = dark.',bn:'LDR আলোর সাথে রেজিস্ট্যান্স বদলায়। 10 kΩ এর সাথে লাগালে analogRead() দিয়ে সংখ্যা পড়া যায়।'},
  learn:['analogRead','if / else','Voltage divider'],parts:[['esp32',1],['ldr',1],['resistor10k',1],['led',1],['resistor',1]],
  wiring:['3V3 → LDR → D34','D34 → 10 kΩ → GND','LED + 220 Ω on D23'],
  flow:[['start','Start'],['action','Read the light level on pin 34'],['decision','Is the number below your "dark" limit?','LED on','LED off'],['loop','Repeat']],
  steps:['Build the LDR + 10 kΩ divider into D34.','Wire the LED to D23 with a resistor.','Print analogRead(34) and move the Light slider to see dark vs bright numbers.','Pick a "dark" number and switch the LED with if / else.'],
  questions:['Why do we need the 10 kΩ resistor?','What if the light flickers around your number?'],
  hints:['First just print the number. Watch it while you move the slider.','int light = analogRead(34); then compare it with a number like 1500.','if (light < 1500) { LED HIGH } else { LED LOW }'],
  starter:'// Night light\n#define LDR_PIN 34\n#define LED_PIN 23\n\nvoid setup() {\n  Serial.begin(115200);\n  // TODO 1: LED_PIN is an output\n}\n\nvoid loop() {\n  // TODO 2: read the light level and print it\n  // TODO 3: if it is dark, turn the LED on, else off\n  delay(200);\n}\n',
  check:{kind:'io',need:['esp32','ldr','led'],ms:4000,phases:[{t:[0,2000],set:{type:'ldr',prop:'light',val:95},expect:{out:'led',on:false},say:{en:'Bright room',bn:'উজ্জ্বল ঘর'}},{t:[2000,4000],set:{type:'ldr',prop:'light',val:5},expect:{out:'led',on:true},say:{en:'Dark room',bn:'অন্ধকার ঘর'}}],
    tip:{en:'Print analogRead(34) to see the numbers first.',bn:'আগে analogRead(34) প্রিন্ট করে দেখো।'},win:{en:'Bright: off. Dark: on. Your light thinks for itself.',bn:'উজ্জ্বলে বন্ধ, অন্ধকারে চালু। তোমার আলো নিজে ভাবে।'}}}),

P({id:'antitheft',cat:'Safety',level:1,mins:20,hero:'pir',color:'pink',
  title:{en:'Anti-theft alarm',bn:'চোর ধরার অ্যালার্ম'},tag:{en:'Someone moves, it screams.',bn:'কেউ নড়লেই বাজবে।'},
  story:{en:'A PIR sensor feels body heat moving. Its OUT pin goes HIGH when someone walks by. Your code reads it and sounds a buzzer.',bn:'PIR সেন্সর শরীরের তাপ নড়াচড়া টের পায়। কেউ গেলে OUT HIGH হয়। কোড পড়ে বাজার বাজায়।'},
  learn:['digitalRead','INPUT','Buzzer'],parts:[['esp32',1],['pir',1],['buzzer',1]],
  wiring:['PIR VCC → VIN (5 V), GND → GND, OUT → D13','Buzzer + → D23, − → GND'],
  flow:[['start','Start'],['action','Read the PIR on pin 13'],['decision','Motion (HIGH)?','Buzzer on','Buzzer off'],['loop','Repeat']],
  steps:['Place the PIR and the buzzer next to the ESP32.','Wire PIR OUT → D13, buzzer + → D23.','Code: read pin 13 and print it. Click the PIR to "wave".','Code: if motion, buzzer on; else off.'],
  questions:['How could you stop the alarm with a secret button?','Should the alarm keep ringing after the thief leaves?'],
  hints:['The PIR is a digital sensor: it is only HIGH or LOW.','int motion = digitalRead(13);','if (motion == HIGH) { digitalWrite(23, HIGH); } else { … }'],
  starter:'// Anti-theft alarm\n#define PIR_PIN 13\n#define BUZZER_PIN 23\n\nvoid setup() {\n  // TODO 1: PIR_PIN is an input, BUZZER_PIN is an output\n}\n\nvoid loop() {\n  // TODO 2: read the PIR\n  // TODO 3: motion → buzzer on, no motion → buzzer off\n}\n',
  check:{kind:'io',need:['esp32','pir','buzzer'],ms:3000,phases:[{t:[0,1500],set:{type:'pir',prop:'motion',val:false},expect:{out:'buzzer',on:false},say:{en:'Empty room',bn:'খালি ঘর'}},{t:[1500,3000],set:{type:'pir',prop:'motion',val:true},expect:{out:'buzzer',on:true},say:{en:'Someone walks in',bn:'কেউ ঢুকলো'}}],
    win:{en:'Quiet when empty, loud when someone moves. Your house is guarded.',bn:'খালি থাকলে চুপ, কেউ নড়লে বাজে। তোমার বাড়ি পাহারায়।'}}}),

P({id:'tank',cat:'Water',level:2,mins:25,hero:'water_level',color:'blue',
  title:{en:'Water tank overflow alarm',bn:'পানির ট্যাংক অ্যালার্ম'},tag:{en:'Beeps before the roof tank spills.',bn:'ট্যাংক ভরার আগেই বাজবে।'},
  story:{en:'Roof tanks in Bangladesh overflow every day and waste water. A water level sensor gives a bigger number as water climbs. When it passes your limit, the buzzer warns you to switch the pump off.',bn:'ছাদের ট্যাংক রোজ উপচে পানি নষ্ট হয়। পানি যত ওঠে, সেন্সরের সংখ্যা তত বাড়ে। সীমা পার হলে বাজার বাজবে।'},
  learn:['analogRead','Threshold','Serial.println'],parts:[['esp32',1],['water_level',1],['buzzer',1],['led_blue',1],['resistor',1]],
  wiring:['Sensor VCC → 3V3, GND → GND, S → D34','Buzzer + → D23, − → GND','Optional: blue LED on D22 = "tank filling"'],
  flow:[['start','Start'],['action','Read the water level on pin 34'],['decision','Above the "full" limit?','Beep the buzzer','Stay quiet'],['loop','Check again']],
  steps:['Place the water level sensor and the buzzer.','Wire S → D34 (an analog pin).','Print analogRead(34) and drag the Water level slider.','Choose your "almost full" number and sound the buzzer above it.'],
  questions:['Where should the sensor sit inside the tank?','How could Instructor switch the pump off by itself? (hint: relay)'],
  hints:['Analog sensors give 0 to 4095. Watch the number change.','int level = analogRead(34); Serial.println(level);','if (level > 3000) { buzzer on } else { buzzer off }'],
  starter:'// Water tank overflow alarm\n#define LEVEL_PIN 34\n#define BUZZER_PIN 23\n\nvoid setup() {\n  Serial.begin(115200);\n  // TODO 1: BUZZER_PIN is an output\n}\n\nvoid loop() {\n  // TODO 2: read the water level and print it\n  // TODO 3: if the tank is almost full, beep\n  delay(300);\n}\n',
  check:{kind:'io',need:['esp32','water_level','buzzer'],ms:4000,serial:true,phases:[{t:[0,2000],set:{type:'water_level',prop:'level',val:20},expect:{out:'buzzer',on:false},say:{en:'Tank 20% full',bn:'ট্যাংক ২০%'}},{t:[2000,4000],set:{type:'water_level',prop:'level',val:95},expect:{out:'buzzer',on:true},say:{en:'Tank 95% full',bn:'ট্যাংক ৯৫%'}}],
    win:{en:'No more overflowing tanks. This one could save your building thousands of litres.',bn:'আর ট্যাংক উপচাবে না। হাজার লিটার পানি বাঁচবে।'}}}),

P({id:'irrigation',cat:'Water',level:2,mins:30,hero:'soil',color:'green',
  title:{en:'Smart irrigation',bn:'স্মার্ট সেচ'},tag:{en:'Waters the plant only when the soil is dry.',bn:'মাটি শুকনো হলেই পানি দেবে।'},
  story:{en:'A soil sensor tells dry from wet. The ESP32 cannot power a pump from a pin, so it flips a relay, and the relay connects the pump to a battery. Same idea farmers use for drip irrigation.',bn:'সয়েল সেন্সর শুকনো-ভেজা বোঝে। পিন থেকে পাম্প চলে না, তাই রিলে দিয়ে ব্যাটারির সাথে জোড়া লাগে।'},
  learn:['Relay','analogRead','Power vs signal'],parts:[['esp32',1],['soil',1],['relay',1],['pump',1],['battery9v',1]],
  wiring:['Soil VCC → 3V3, GND → GND, AO → D34','Relay VCC → VIN, GND → GND, IN → D26','Battery + → relay COM, relay NO → pump +, pump − → battery −'],
  flow:[['start','Start'],['action','Read soil moisture on pin 34'],['decision','Soil dry (big number)?','Relay ON: pump runs','Relay OFF: pump stops'],['action','Wait a little'],['loop','Repeat']],
  steps:['Wire the soil sensor AO → D34.','Wire the relay signal IN → D26 and power it.','Wire the pump through the relay: battery + → COM, NO → pump.','Code: print the soil number, then switch the relay with digitalWrite.'],
  questions:['Why can’t the pump connect straight to a GPIO pin?','How long should the pump run each time?'],
  hints:['Dry soil gives a BIG number on this sensor.','int soil = analogRead(34); compare it with ~2500.','if (soil > 2500) digitalWrite(26, HIGH); else digitalWrite(26, LOW);'],
  starter:'// Smart irrigation\n#define SOIL_PIN 34\n#define RELAY_PIN 26\n\nvoid setup() {\n  Serial.begin(115200);\n  // TODO 1: RELAY_PIN is an output\n}\n\nvoid loop() {\n  // TODO 2: read the soil and print it\n  // TODO 3: dry → relay on (pump runs), wet → relay off\n  delay(500);\n}\n',
  check:{kind:'io',need:['esp32','soil','relay','pump'],ms:4000,phases:[{t:[0,2000],set:{type:'soil',prop:'moist',val:85},expect:{out:'pump',on:false},say:{en:'Wet soil',bn:'ভেজা মাটি'}},{t:[2000,4000],set:{type:'soil',prop:'moist',val:5},expect:{out:'pump',on:true},say:{en:'Dry soil',bn:'শুকনো মাটি'}}],
    tip:{en:'Check the pump loop: battery + → COM, NO → pump, pump − → battery −.',bn:'পাম্পের লুপ দেখো: ব্যাটারি + → COM, NO → পাম্প, পাম্প − → ব্যাটারি −।'},win:{en:'Your plant gets water only when it needs it.',bn:'গাছ পানি পাবে শুধু দরকার হলে।'}}}),

P({id:'gas',cat:'Safety',level:2,mins:20,hero:'mq2',color:'copper',
  title:{en:'Gas leak alarm',bn:'গ্যাস লিক অ্যালার্ম'},tag:{en:'Smells LPG in the kitchen and warns you.',bn:'রান্নাঘরে গ্যাস টের পেলে সতর্ক করবে।'},
  story:{en:'Gas cylinder leaks are dangerous. The MQ-2 senses gas and smoke: its AO number rises with gas. Above your limit, flash the LED and sound the buzzer.',bn:'সিলিন্ডার লিক বিপজ্জনক। MQ-2 গ্যাস টের পায়, AO সংখ্যা বাড়ে। সীমা পার হলে বাজার আর LED।'},
  learn:['analogRead','Thresholds','Safety design'],parts:[['esp32',1],['mq2',1],['buzzer',1],['led',1],['resistor',1]],
  wiring:['MQ-2 VCC → VIN, GND → GND, AO → D35','Buzzer + → D23','Red LED + 220 Ω → D22'],
  flow:[['start','Start'],['action','Read gas level on pin 35'],['decision','Gas above the safe limit?','Buzzer + red LED on','All quiet'],['loop','Repeat']],
  steps:['Wire the MQ-2 AO → D35.','Wire the buzzer and the red LED.','Print the gas number and drag the Gas slider.','Sound the alarm above your limit.'],
  questions:['Why is it better to warn early than late?','What else could the ESP32 do? (call, send a message…)'],
  hints:['Gas sensors work like the light sensor: read a number.','int gas = analogRead(35);','if (gas > 2000) { alarm on } else { alarm off }'],
  starter:'// Gas leak alarm\n#define GAS_PIN 35\n#define BUZZER_PIN 23\n#define LED_PIN 22\n\nvoid setup() {\n  Serial.begin(115200);\n  // TODO 1: outputs for the buzzer and LED\n}\n\nvoid loop() {\n  // TODO 2: read the gas level and print it\n  // TODO 3: too much gas → alarm on\n  delay(200);\n}\n',
  check:{kind:'io',need:['esp32','mq2','buzzer'],ms:4000,phases:[{t:[0,2000],set:{type:'mq2',prop:'gas',val:5},expect:{out:'buzzer',on:false},say:{en:'Clean air',bn:'পরিষ্কার বাতাস'}},{t:[2000,4000],set:{type:'mq2',prop:'gas',val:90},expect:{out:'buzzer',on:true},say:{en:'Gas leak',bn:'গ্যাস লিক'}}],
    win:{en:'Your kitchen guard works. Real alarms use exactly this logic.',bn:'রান্নাঘরের পাহারাদার তৈরি।'}}}),

P({id:'parking',cat:'Robots',level:2,mins:25,hero:'hcsr04',color:'blue',
  title:{en:'Parking sensor',bn:'পার্কিং সেন্সর'},tag:{en:'Beeps when the wall gets close.',bn:'দেয়াল কাছে এলে বিপ।'},
  story:{en:'The HC-SR04 shouts a sound you can’t hear and times the echo. Time ÷ 58 = distance in cm. Cars use the same trick when you reverse.',bn:'HC-SR04 শব্দ পাঠিয়ে প্রতিধ্বনির সময় মাপে। সময় ÷ 58 = সেন্টিমিটার।'},
  learn:['pulseIn','Math','Serial.println'],parts:[['esp32',1],['hcsr04',1],['buzzer',1]],
  wiring:['Sonar VCC → VIN, GND → GND, TRIG → D5, ECHO → D18','Buzzer + → D23'],
  flow:[['start','Start'],['action','Send a 10 µs pulse on TRIG'],['action','Measure the echo with pulseIn, ÷ 58'],['decision','Closer than 20 cm?','Beep','Silent'],['loop','Repeat']],
  steps:['Wire the sonar: TRIG → D5, ECHO → D18.','Code: send a trigger pulse and print the distance.','Drag the Distance slider and watch the number.','Beep when it is closer than 20 cm.'],
  questions:['How could the beeps get faster as the wall gets closer?','Why do we divide by 58?'],
  hints:['TRIG HIGH, delayMicroseconds(10), TRIG LOW.','long cm = pulseIn(18, HIGH) / 58;','if (cm < 20) buzzer on, else off.'],
  starter:'// Parking sensor\n#define TRIG 5\n#define ECHO 18\n#define BUZZER 23\n\nvoid setup() {\n  Serial.begin(115200);\n  // TODO 1: TRIG and BUZZER are outputs, ECHO is an input\n}\n\nvoid loop() {\n  // TODO 2: send a 10 microsecond pulse on TRIG\n  // TODO 3: measure the echo and turn it into cm, print it\n  // TODO 4: closer than 20 cm → beep\n  delay(100);\n}\n',
  check:{kind:'io',need:['esp32','hcsr04','buzzer'],ms:3000,phases:[{t:[0,1500],set:{type:'hcsr04',prop:'dist',val:120},expect:{out:'buzzer',on:false},say:{en:'Wall far away',bn:'দেয়াল দূরে'}},{t:[1500,3000],set:{type:'hcsr04',prop:'dist',val:8},expect:{out:'buzzer',on:true},say:{en:'Wall 8 cm away',bn:'দেয়াল ৮ সেমি'}}],
    win:{en:'Beep, beep: you just built the sensor every modern car has.',bn:'বিপ বিপ: আধুনিক গাড়ির সেন্সর তুমি বানালে।'}}}),

P({id:'fan',cat:'Home',level:2,mins:25,hero:'dht11',color:'pink',
  title:{en:'Temperature-controlled fan',bn:'তাপমাত্রায় চলা ফ্যান'},tag:{en:'Gets hot? The fan starts by itself.',bn:'গরম লাগলে ফ্যান নিজে চলবে।'},
  story:{en:'The DHT11 measures temperature and humidity. With the DHT library you get degrees directly. Above 30 °C, a relay switches the fan motor on.',bn:'DHT11 তাপমাত্রা মাপে। ৩০ °C এর বেশি হলে রিলে ফ্যান চালু করবে।'},
  learn:['Libraries','float','Relay'],parts:[['esp32',1],['dht11',1],['relay',1],['motor',1],['battery9v',1]],
  wiring:['DHT11 VCC → 3V3, DATA → D4, GND → GND','Relay IN → D26 (power from VIN/GND)','Battery + → COM, NO → motor, motor → battery −'],
  flow:[['start','Start'],['action','Read the temperature'],['decision','Hotter than 30 °C?','Fan on','Fan off'],['action','Wait 2 s (DHT11 is slow)'],['loop','Repeat']],
  steps:['Wire the DHT11 DATA → D4.','Wire the relay and the fan motor loop.','Code: #include <DHT.h>, make a DHT object, print readTemperature().','Turn the relay on above 30 °C.'],
  questions:['What if the temperature jumps between 29.9 and 30.1?','How would you add a "fan speed"?'],
  hints:['#include <DHT.h> then DHT dht(4, DHT11); and dht.begin(); in setup.','float temp = dht.readTemperature();','if (temp > 30) relay HIGH else LOW.'],
  starter:'// Temperature fan\n#include <DHT.h>\nDHT dht(4, DHT11);\n#define RELAY 26\n\nvoid setup() {\n  Serial.begin(115200);\n  dht.begin();\n  // TODO 1: RELAY is an output\n}\n\nvoid loop() {\n  // TODO 2: read the temperature and print it\n  // TODO 3: hotter than 30 → fan on, else off\n  delay(2000);\n}\n',
  check:{kind:'io',need:['esp32','dht11','relay'],ms:9000,phases:[{t:[0,4500],set:{type:'dht11',prop:'temp',val:24},expect:{out:'pump',on:false},say:{en:'24 °C',bn:'২৪ °C'}},{t:[4500,9000],set:{type:'dht11',prop:'temp',val:38},expect:{out:'pump',on:true},say:{en:'38 °C',bn:'৩৮ °C'}}],
    win:{en:'Cool when it’s cool, fan when it’s hot. Smart home unlocked.',bn:'ঠান্ডায় বন্ধ, গরমে চালু। স্মার্ট হোম!'}}}),

P({id:'door',cat:'Home',level:2,mins:20,hero:'servo',color:'copper',
  title:{en:'Smart door',bn:'স্মার্ট দরজা'},tag:{en:'Press the button, the servo opens the door.',bn:'বাটন চাপলে সার্ভো দরজা খোলে।'},
  story:{en:'A servo turns to an exact angle you choose: 0° closed, 90° open. Add a button and a beep and you have a door that opens on command.',bn:'সার্ভো ঠিক কোণে ঘোরে: ০° বন্ধ, ৯০° খোলা।'},
  learn:['Servo library','INPUT_PULLUP','Angles'],parts:[['esp32',1],['servo',1],['button',1],['buzzer',1]],
  wiring:['Servo SIG → D18, VCC → VIN, GND → GND','Button between D4 and GND','Buzzer + → D23'],
  flow:[['start','Start'],['action','Read the button (LOW = pressed)'],['decision','Pressed?','Servo 90°, short beep','Servo 0°'],['loop','Repeat']],
  steps:['Wire the servo signal → D18.','Wire the button D4 ↔ GND.','Code: Servo door; door.attach(18);','Write 90 when pressed, 0 when not.'],
  questions:['How long should the door stay open?','How could you add a secret knock?'],
  hints:['With INPUT_PULLUP a pressed button reads LOW.','door.write(90); opens, door.write(0); closes.','if (digitalRead(4) == LOW) door.write(90); else door.write(0);'],
  starter:'// Smart door\n#include <ESP32Servo.h>\nServo door;\n\nvoid setup() {\n  // TODO 1: attach the servo to pin 18\n  // TODO 2: button on pin 4 with INPUT_PULLUP\n}\n\nvoid loop() {\n  // TODO 3: pressed → open (90), else closed (0)\n}\n',
  check:{kind:'io',need:['esp32','servo','button'],ms:3000,phases:[{t:[0,1500],set:{type:'button',prop:'pressed',val:false},expect:{out:'servoOpen',on:false},say:{en:'Nobody presses',bn:'কেউ চাপেনি'}},{t:[1500,3000],set:{type:'button',prop:'pressed',val:true},expect:{out:'servoOpen',on:true},say:{en:'Button pressed',bn:'বাটন চাপা'}}],
    win:{en:'Open sesame! Your door listens to you.',bn:'দরজা তোমার কথা শোনে!'}}}),

P({id:'pet',cat:'Robots',level:1,mins:15,hero:'touch',color:'pink',
  title:{en:'Touch pet robot',bn:'টাচ পোষা রোবট'},tag:{en:'Pat it and it gets happy.',bn:'আদর করলে খুশি হয়।'},
  story:{en:'Robots show feelings with lights and sounds. A touch sensor goes HIGH under your finger. Make Instructor chirp and glow when you pat it.',bn:'আলো আর শব্দে রোবট অনুভূতি দেখায়। টাচ করলে চিঁ চিঁ করে আর জ্বলে।'},
  learn:['digitalRead','Outputs','Behaviour design'],parts:[['esp32',1],['touch',1],['buzzer',1],['led_green',1],['resistor',1]],
  wiring:['Touch VCC → 3V3, GND → GND, SIG → D4','Buzzer + → D23','Green LED + 220 Ω → D22'],
  flow:[['start','Start'],['action','Read the touch pad'],['decision','Touched?','Chirp + green light','Calm, lights off'],['loop','Repeat']],
  steps:['Wire the touch sensor SIG → D4.','Wire the buzzer and the green LED.','Code: read pin 4. Hold the pad with the mouse.','React when touched.'],
  questions:['How can a robot look "sad" or "sleepy"?','What if you touch it ten times quickly?'],
  hints:['The touch sensor is HIGH while touched.','if (digitalRead(4) == HIGH) { … }','Inside: buzzer HIGH, LED HIGH; else both LOW.'],
  starter:'// Touch pet\n#define TOUCH 4\n#define BUZZER 23\n#define LED 22\n\nvoid setup() {\n  // TODO 1: set the pin modes\n}\n\nvoid loop() {\n  // TODO 2: touched → chirp and glow, else calm\n}\n',
  check:{kind:'io',need:['esp32','touch'],ms:3000,phases:[{t:[0,1500],set:{type:'touch',prop:'pressed',val:false},expect:{out:'alarm',on:false},say:{en:'Nobody touches',bn:'কেউ ছোঁয়নি'}},{t:[1500,3000],set:{type:'touch',prop:'pressed',val:true},expect:{out:'alarm',on:true},say:{en:'You pat it',bn:'তুমি ছুঁলে'}}],
    win:{en:'Your robot has a personality now.',bn:'তোমার রোবটের এখন ব্যক্তিত্ব আছে।'}}}),

P({id:'obstacle',cat:'Robots',level:3,mins:45,hero:'l298n',color:'green',
  title:{en:'Obstacle-avoiding car',bn:'বাধা এড়ানো গাড়ি'},tag:{en:'Drives itself and dodges walls.',bn:'নিজে চলে, দেয়াল এড়ায়।'},
  story:{en:'Put the parking sensor on wheels. The L298N lets the ESP32 drive two motors forward, back or apart. Far away: drive. Too close: stop and turn.',bn:'পার্কিং সেন্সরকে চাকায় বসাও। L298N দিয়ে দুইটা মোটর চালাও। দূরে: চলো। কাছে: থামো আর ঘোরো।'},
  learn:['L298N','Functions','Decisions'],parts:[['esp32',1],['l298n',1],['tt_motor',2],['hcsr04',1],['battery74',1]],
  wiring:['L298N: ENA 14, IN1 27, IN2 26, IN3 25, IN4 33, ENB 32','Battery 7.4 V → L298N 12V/GND; L298N GND ↔ ESP32 GND','Motors on OUT1/OUT2 and OUT3/OUT4','Sonar TRIG → D5, ECHO → D18'],
  flow:[['start','Start'],['action','Measure the distance'],['decision','Closer than 20 cm?','Stop and turn right','Drive forward'],['loop','Repeat forever']],
  steps:['Wire the L298N like in Lesson 4.','Write forward(), stopCar() and turnRight() functions.','Add the sonar and print the distance.','Decide with if: close → turn, far → forward.'],
  questions:['What if the wall is very close and the car is fast?','How long should it turn before driving again?'],
  hints:['Make small functions first: forward() sets IN1..IN4.','long cm = pulseIn(18, HIGH) / 58;','if (cm < 20) turnRight(); else forward();'],
  starter:'// Obstacle-avoiding car\n#define TRIG 5\n#define ECHO 18\n\nvoid forward() {\n  // TODO: both wheels forward\n}\n\nvoid turnRight() {\n  // TODO: left wheel forward, right wheel back\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  // TODO: pin modes for IN1..IN4, TRIG, ECHO; ENA/ENB full speed\n}\n\nvoid loop() {\n  // TODO: measure distance, then turn or go forward\n  delay(60);\n}\n',
  check:{kind:'io',need:['esp32','l298n','hcsr04'],ms:3000,phases:[{t:[0,1500],set:{type:'hcsr04',prop:'dist',val:150},expect:{moving:true},say:{en:'Open road',bn:'খোলা রাস্তা'}},{t:[1500,3000],set:{type:'hcsr04',prop:'dist',val:8},expect:{differs:0},say:{en:'Wall ahead',bn:'সামনে দেয়াল'}}],
    win:{en:'Your car drives itself and dodges walls. That’s autonomy.',bn:'গাড়ি নিজে চলে আর দেয়াল এড়ায়। এটাই অটোনমি।'}}}),

P({id:'linefollow',cat:'Robots',level:3,mins:45,hero:'line_sensor',color:'blue',
  title:{en:'Line-following robot',bn:'লাইন ফলোয়ার রোবট'},tag:{en:'Follows a black line on the floor.',bn:'মেঝের কালো লাইন ধরে চলে।'},
  story:{en:'Two IR line sensors look at the floor. If the left one sees black, the line is to the left: turn left. Right sees black: turn right. This is the classic robotics competition robot.',bn:'দুইটা সেন্সর মেঝে দেখে। বামেরটা কালো দেখলে বামে ঘোরো, ডানেরটা দেখলে ডানে।'},
  learn:['Two inputs','else if','Motor control'],parts:[['esp32',1],['l298n',1],['tt_motor',2],['line_sensor',2],['battery74',1]],
  wiring:['L298N like the obstacle car','Left sensor DO → D34, right sensor DO → D35','Both sensors VCC → 3V3, GND → GND'],
  flow:[['start','Start'],['action','Read left and right sensors'],['decision','Left on the line?','Turn left','Check the right'],['decision','Right on the line?','Turn right','Go straight'],['loop','Repeat']],
  steps:['Wire the motors like the obstacle car.','Wire two line sensors to D34 and D35.','Print both sensor values; click each sensor to put it on the line.','Use if / else if / else to steer.'],
  questions:['What should happen if both see the line?','Should the turn be fast or slow?'],
  hints:['A sensor on black reads HIGH.','int L = digitalRead(34); int R = digitalRead(35);','if (L) left(); else if (R) right(); else forward();'],
  starter:'// Line follower\n#define LEFT_S 34\n#define RIGHT_S 35\n\nvoid forward() { /* TODO */ }\nvoid left()    { /* TODO */ }\nvoid right()   { /* TODO */ }\n\nvoid setup() {\n  // TODO: motor pins + sensor pins\n}\n\nvoid loop() {\n  // TODO: read both sensors and steer\n}\n',
  check:{kind:'io',need:['esp32','l298n','line_sensor'],ms:3000,phases:[{t:[0,1500],set:{type:'line_sensor',prop:'onLine',vals:[true,false]},expect:{moving:true},say:{en:'Line on the left',bn:'লাইন বামে'}},{t:[1500,3000],set:{type:'line_sensor',prop:'onLine',vals:[false,true]},expect:{moving:true,differs:0},say:{en:'Line on the right',bn:'লাইন ডানে'}}],
    win:{en:'Your robot follows the line. Ready for a competition track!',bn:'রোবট লাইন ধরে চলছে। প্রতিযোগিতার জন্য তৈরি!'}}}),

P({id:'rc',cat:'Robots',level:3,mins:40,hero:'esp32',color:'pink',
  title:{en:'Bluetooth RC car',bn:'ব্লুটুথ RC কার'},tag:{en:'Drive it from your phone.',bn:'ফোন দিয়ে চালাও।'},
  story:{en:'The ESP32 has Bluetooth built in. Your phone sends a letter: F, B, L, R or S. The car reads it and drives. No remote to buy.',bn:'ESP32 এ ব্লুটুথ আছে। ফোন F, B, L, R, S পাঠায়, গাড়ি পড়ে চলে।'},
  learn:['BluetoothSerial','char','switch / if'],parts:[['esp32',1],['l298n',1],['tt_motor',2],['battery74',1]],
  wiring:['L298N like the obstacle car','No extra wires: Bluetooth is inside the ESP32'],
  flow:[['start','Start Bluetooth "MyRobot"'],['action','Wait for a letter from the phone'],['decision','Which letter?','F/B/L/R: drive that way','S: stop'],['loop','Repeat']],
  steps:['Wire the L298N and both motors.','#include <BluetoothSerial.h>, SerialBT.begin("MyRobot");','Read one letter with SerialBT.read().','Drive for F, B, L, R and stop for S. Test with the virtual phone.'],
  questions:['What should the car do if the phone disconnects?','How could you add a speed button?'],
  hints:['if (SerialBT.available()) { char c = SerialBT.read(); }','Compare letters with single quotes: c == \'F\'.','if (c == \'F\') forward(); else if (c == \'S\') stopCar(); …'],
  starter:'// Bluetooth RC car\n#include <BluetoothSerial.h>\nBluetoothSerial SerialBT;\n\nvoid forward() { /* TODO */ }\nvoid stopCar() { /* TODO */ }\n\nvoid setup() {\n  SerialBT.begin("MyRobot");\n  // TODO: motor pins\n}\n\nvoid loop() {\n  // TODO: if a letter arrived, read it and drive\n}\n',
  check:{kind:'io',need:['esp32','l298n'],ms:2400,bt:[{at:0,c:'F'},{at:1200,c:'S'}],phases:[{t:[0,1200],expect:{moving:true},say:{en:'Phone sends F',bn:'ফোন F পাঠালো'}},{t:[1200,2400],expect:{out:'motor',on:false},say:{en:'Phone sends S',bn:'ফোন S পাঠালো'}}],
    win:{en:'Your phone is the remote. That’s a real RC car.',bn:'তোমার ফোনই রিমোট। আসল RC কার!'}}}),
];
// traffic-light pattern check
const _run=runCheck;
function check(pr,sim,code){if(pr.check.custom==='pattern'){const miss=pr.check.need.filter(n=>!sim.comps.some(c=>c.type===n)); if(miss.length)return _run(pr,sim,code);
  if(sim.comps.filter(c=>/^led/.test(c.type)).length<3)return {ok:false,msg:{en:'A traffic light needs three LEDs.',bn:'ট্রাফিক লাইটে তিনটা LED লাগে।'}};
  const r=Runner.test(sim,code,8000); if(r.error)return {ok:false,msg:{en:r.error,bn:r.error}};
  const pats=new Set(r.trace.filter(e=>e.leds.some(Boolean)).map(e=>e.leds.map(Number).join('')));
  if(pats.size<3)return {ok:false,msg:{en:`I saw only ${pats.size} different light pattern(s). A traffic light needs three: red, yellow, green.`,bn:`মাত্র ${pats.size}টা আলাদা প্যাটার্ন দেখলাম। তিনটা লাগবে।`}};
  return {ok:true,msg:pr.check.win}} return _run(pr,sim,code)}

/* ---------- how each component works (shown in the library) ---------- */
const HOW={
 esp32:{en:'The brain. It runs your code, reads sensors on its pins and switches outputs. 3.3 V logic, Wi-Fi and Bluetooth inside. Pins 34–39 can only read (inputs).',bn:'মস্তিষ্ক। কোড চালায়, সেন্সর পড়ে, আউটপুট চালায়। ৩.৩ V, ভেতরে Wi-Fi আর ব্লুটুথ।',code:'pinMode(23, OUTPUT);'},
 led:{en:'A light that only works one way: current flows from the long leg (+) to the short leg (−). Always add a 220 Ω resistor or it burns.',bn:'এক দিকে চলা আলো: লম্বা পা + থেকে ছোট পা −। সবসময় ২২০ Ω লাগাও।',code:'digitalWrite(23, HIGH);'},
 resistor:{en:'Slows the current down, like a narrow pipe slows water. Bigger number of ohms = less current.',bn:'কারেন্ট কমায়, সরু পাইপের মতো।',code:''},
 button:{en:'Connects two legs while pressed. With INPUT_PULLUP the pin reads HIGH normally and LOW when pressed.',bn:'চাপলে দুই পা জোড়া লাগে। INPUT_PULLUP এ চাপলে LOW।',code:'pinMode(4, INPUT_PULLUP);'},
 motor:{en:'Turns electricity into spinning. Current through a coil makes a magnet that pushes on fixed magnets. Swap wires → spins the other way.',bn:'বিদ্যুৎকে ঘূর্ণনে বদলায়। তার উল্টালে উল্টো ঘোরে।',code:''},
 tt_motor:{en:'A DC motor with a gearbox: slower but much stronger, perfect for wheels. Needs a driver like the L298N.',bn:'গিয়ারবক্সসহ মোটর: ধীর কিন্তু শক্তিশালী। L298N দিয়ে চালাও।',code:''},
 l298n:{en:'A motor driver: the ESP32 sends tiny signals (IN1–IN4) and the L298N switches the big battery current to the motors. ENA/ENB set the speed with PWM.',bn:'ছোট সিগন্যাল দিয়ে বড় কারেন্ট চালায়। ENA/ENB দিয়ে গতি।',code:'digitalWrite(27, HIGH); digitalWrite(26, LOW);'},
 servo:{en:'A motor that turns to an exact angle (0–180°). Inside: a motor, gears and a position sensor. You just say the angle.',bn:'নির্দিষ্ট কোণে ঘোরে (০–১৮০°)।',code:'myservo.write(90);'},
 hcsr04:{en:'Sends a 40 kHz sound pulse and times the echo. Echo time in µs ÷ 58 = distance in cm. Works from 2 cm to 4 m.',bn:'শব্দ পাঠিয়ে প্রতিধ্বনির সময় মাপে। সময় ÷ ৫৮ = সেমি।',code:'long cm = pulseIn(18, HIGH) / 58;'},
 pir:{en:'Feels infrared (body heat) moving across its dome. OUT goes HIGH for a few seconds when someone moves.',bn:'শরীরের তাপ নড়লে OUT HIGH হয়।',code:'if (digitalRead(13) == HIGH) { … }'},
 ldr:{en:'Its resistance drops in bright light. Pair it with a 10 kΩ resistor to make a voltage the ESP32 can read.',bn:'আলোতে রেজিস্ট্যান্স কমে। ১০ kΩ এর সাথে লাগাও।',code:'int light = analogRead(34);'},
 soil:{en:'Two metal prongs measure how easily current passes through soil. Wet soil conducts better.',bn:'ভেজা মাটিতে কারেন্ট সহজে যায়।',code:'int soil = analogRead(34);'},
 water_level:{en:'Exposed copper strips: more water covering them = more current = higher signal.',bn:'পানি যত বেশি স্ট্রিপ ঢাকে, সিগন্যাল তত বেশি।',code:'int level = analogRead(34);'},
 relay:{en:'An electric switch. A small signal on IN pulls a magnet that clicks COM to NO, so a weak ESP32 can switch a pump or a lamp.',bn:'ছোট সিগন্যালে ভেতরের চুম্বক সুইচ চাপে।',code:'digitalWrite(26, HIGH);'},
 buzzer:{en:'An active buzzer has its own oscillator: give it power and it beeps.',bn:'পাওয়ার দিলেই বাজে।',code:'digitalWrite(23, HIGH);'},
 dht11:{en:'A tiny sensor with its own chip that measures temperature and humidity and sends them as digital data on one wire.',bn:'তাপমাত্রা আর আর্দ্রতা এক তারে পাঠায়।',code:'float t = dht.readTemperature();'},
 mq2:{en:'A heated element whose resistance changes when gas or smoke touches it. Needs a minute to warm up in real life.',bn:'গ্যাস লাগলে গরম উপাদানের রেজিস্ট্যান্স বদলায়।',code:'int gas = analogRead(35);'},
 line_sensor:{en:'An IR LED shines down and a receiver looks for the reflection. White reflects, black absorbs.',bn:'IR আলো নিচে ফেলে। সাদা ফেরত দেয়, কালো শোষে।',code:'int onLine = digitalRead(34);'},
 pump:{en:'A tiny DC motor with an impeller that pushes water. Draws too much current for a pin: use a relay or MOSFET.',bn:'পানি ঠেলার মোটর। রিলে দিয়ে চালাও।',code:''},
 battery:{en:'Stores chemical energy and pushes current from + to −. Volts = how hard it pushes.',bn:'রাসায়নিক শক্তি জমা রাখে। ভোল্ট = কত জোরে ঠেলে।',code:''},
 switch:{en:'Opens or closes the loop by hand. An open loop means no current.',bn:'হাতে লুপ খোলে বা বন্ধ করে।',code:''},
};
window.TookieProjects={LIST,check,HOW};
})();
