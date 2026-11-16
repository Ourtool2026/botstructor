/* Code dictionary: every piece of Arduino syntax the course uses, explained simply in English and Bangla,
   plus a live explainer that reads one line of the learner's code and says what it does. */
(function(){
const D=[
 {k:'setup',g:'Structure',sig:'void setup() { … }',en:'Runs ONCE when the board turns on. Put pin jobs and Serial.begin here.',bn:'বোর্ড চালু হলে একবার চলে। পিনের কাজ আর Serial.begin এখানে লেখো।',ex:'void setup() {\n  pinMode(23, OUTPUT);\n}'},
 {k:'loop',g:'Structure',sig:'void loop() { … }',en:'Runs again and again, forever. Put what should keep happening here.',bn:'বারবার চলতেই থাকে। যা চলতে থাকবে তা এখানে লেখো।',ex:'void loop() {\n  digitalWrite(23, HIGH);\n}'},
 {k:'braces',g:'Structure',sig:'{  }',en:'Curly brackets hold a group of instructions together, like a box. Every { needs a }.',bn:'কোঁকড়া বন্ধনী কয়েকটা নির্দেশ একসাথে রাখে, একটা বাক্সের মতো। প্রতিটা { এর একটা } লাগে।',ex:'if (x == 1) {\n  …\n}'},
 {k:'semicolon',g:'Structure',sig:';',en:'Ends one instruction, like a full stop ends a sentence. Forgetting it is the most common error.',bn:'একটা নির্দেশ শেষ করে, যেমন দাঁড়ি বাক্য শেষ করে। এটা ভুলে যাওয়াই সবচেয়ে সাধারণ ভুল।',ex:'delay(500);'},
 {k:'comment',g:'Structure',sig:'// note',en:'A note for humans. The ESP32 ignores everything after // on that line.',bn:'মানুষের জন্য নোট। ESP32 // এর পরের লেখা পড়ে না।',ex:'// turn the LED on'},
 {k:'pinMode',g:'Pins',sig:'pinMode(pin, mode);',en:'Gives a pin its job: OUTPUT sends power out, INPUT listens, INPUT_PULLUP listens with a built-in pull-up.',bn:'পিনকে কাজ দেয়: OUTPUT বিদ্যুৎ পাঠায়, INPUT শোনে, INPUT_PULLUP ভেতরের pull-up দিয়ে শোনে।',ex:'pinMode(23, OUTPUT);'},
 {k:'digitalWrite',g:'Pins',sig:'digitalWrite(pin, HIGH or LOW);',en:'Turns an OUTPUT pin ON (HIGH = 3.3 V) or OFF (LOW = 0 V).',bn:'আউটপুট পিন চালু করে (HIGH = 3.3 V) বা বন্ধ করে (LOW = 0 V)।',ex:'digitalWrite(23, HIGH);'},
 {k:'HIGH',g:'Pins',sig:'HIGH  /  LOW',en:'HIGH means ON (3.3 V on ESP32). LOW means OFF (0 V).',bn:'HIGH মানে চালু (ESP32 এ 3.3 V)। LOW মানে বন্ধ (0 V)।',ex:'digitalWrite(27, LOW);'},
 {k:'digitalRead',g:'Pins',sig:'digitalRead(pin)',en:'Reads an INPUT pin right now: gives HIGH (1) or LOW (0).',bn:'ইনপুট পিন এই মুহূর্তে পড়ে: HIGH (1) বা LOW (0) দেয়।',ex:'int b = digitalRead(4);'},
 {k:'INPUT_PULLUP',g:'Pins',sig:'INPUT_PULLUP',en:'The pin reads HIGH by itself. A button to GND makes it LOW while pressed. No extra resistor needed.',bn:'পিন নিজে থেকেই HIGH পড়ে। GND এ লাগানো বাটন চাপলে LOW হয়। আলাদা রেজিস্টর লাগে না।',ex:'pinMode(4, INPUT_PULLUP);'},
 {k:'analogWrite',g:'Pins',sig:'analogWrite(pin, 0–255);',en:'Sets a level, not just on/off: 0 = off, 128 ≈ half, 255 = full. Used for motor speed and LED brightness (PWM).',bn:'শুধু চালু/বন্ধ না, মাত্রা দেয়: 0 = বন্ধ, 128 ≈ অর্ধেক, 255 = পুরো। মোটরের গতি আর LED এর উজ্জ্বলতায় ব্যবহার হয় (PWM)।',ex:'analogWrite(14, 200);'},
 {k:'analogRead',g:'Pins',sig:'analogRead(pin)',en:'Reads a voltage as a number from 0 (0 V) to 4095 (3.3 V). Used for knobs and sensors.',bn:'ভোল্টেজকে 0 (0 V) থেকে 4095 (3.3 V) সংখ্যায় পড়ে। নব আর সেন্সরের জন্য।',ex:'int light = analogRead(34);'},
 {k:'delay',g:'Time',sig:'delay(ms);',en:'Waits. The number is milliseconds: 1000 = 1 second, 500 = half a second.',bn:'অপেক্ষা করে। সংখ্যাটা মিলিসেকেন্ড: 1000 = ১ সেকেন্ড, 500 = আধা সেকেন্ড।',ex:'delay(1000);'},
 {k:'millis',g:'Time',sig:'millis()',en:'How many milliseconds since the board started. Useful to time things without stopping.',bn:'বোর্ড চালুর পর কত মিলিসেকেন্ড গেছে। না থেমে সময় মাপতে কাজে লাগে।',ex:'unsigned long t = millis();'},
 {k:'int',g:'Variables',sig:'int name = value;',en:'Makes a box called name that holds a whole number. Use it to remember things.',bn:'name নামে একটা বাক্স বানায়, যেখানে একটা পূর্ণসংখ্যা থাকে। কিছু মনে রাখতে ব্যবহার করো।',ex:'int speed = 200;'},
 {k:'char',g:'Variables',sig:"char c = 'F';",en:"Holds one letter. Letters go in single quotes: 'F'.",bn:"একটা অক্ষর রাখে। অক্ষর একক উদ্ধৃতিতে লেখো: 'F'।",ex:"char c = SerialBT.read();"},
 {k:'define',g:'Variables',sig:'#define NAME value',en:'Gives a number a name, so code is easier to read. No ; at the end.',bn:'একটা সংখ্যাকে নাম দেয়, যাতে কোড পড়তে সহজ হয়। শেষে ; লাগে না।',ex:'#define LED 23'},
 {k:'if',g:'Decisions',sig:'if (condition) { … } else { … }',en:'Makes a decision: if the condition is true, do the first block; otherwise do the else block.',bn:'সিদ্ধান্ত নেয়: শর্ত সত্য হলে প্রথম অংশ চলে, না হলে else এর অংশ।',ex:'if (digitalRead(4) == LOW) {\n  …\n} else {\n  …\n}'},
 {k:'compare',g:'Decisions',sig:'==   !=   <   >',en:'== means "is equal to" (two = signs!). != not equal, < less than, > more than.',bn:'== মানে "সমান কিনা" (দুটো = চিহ্ন!)। != সমান না, < ছোট, > বড়।',ex:'if (distance < 20) { … }'},
 {k:'and',g:'Decisions',sig:'&&   ||',en:'&& means AND (both must be true). || means OR (one is enough).',bn:'&& মানে AND (দুটোই সত্য হতে হবে)। || মানে OR (একটা হলেই চলবে)।',ex:'if (a == 1 && b == 1) { … }'},
 {k:'for',g:'Loops',sig:'for (int i = 0; i < 5; i++) { … }',en:'Repeats a block a set number of times. Here: 5 times, with i = 0, 1, 2, 3, 4.',bn:'একটা অংশ নির্দিষ্ট সংখ্যক বার চালায়। এখানে ৫ বার, i = 0, 1, 2, 3, 4।',ex:'for (int i = 0; i < 3; i++) {\n  …\n}'},
 {k:'while',g:'Loops',sig:'while (condition) { … }',en:'Repeats while the condition is true. Careful: if it never becomes false, the robot gets stuck.',bn:'শর্ত সত্য থাকা পর্যন্ত চলতে থাকে। সাবধান: কখনো মিথ্যা না হলে রোবট আটকে যায়।',ex:'while (digitalRead(4) == LOW) { }'},
 {k:'function',g:'Functions',sig:'void name() { … }',en:'Your own command. Write it once, then use it anywhere with name();',bn:'তোমার নিজের কমান্ড। একবার লেখো, তারপর যেখানে খুশি name(); দিয়ে ব্যবহার করো।',ex:'void forward() {\n  …\n}\n\nforward();'},
 {k:'Serial.begin',g:'Serial',sig:'Serial.begin(115200);',en:'Opens the Serial Monitor chat at 115200 speed (baud). Put it in setup().',bn:'115200 গতিতে (baud) সিরিয়াল মনিটর চালু করে। setup() এ রাখো।',ex:'Serial.begin(115200);'},
 {k:'Serial.println',g:'Serial',sig:'Serial.println(value);',en:'Prints a line on the Serial Monitor. Serial.print prints without a new line.',bn:'সিরিয়াল মনিটরে একটা লাইন প্রিন্ট করে। Serial.print নতুন লাইন ছাড়া প্রিন্ট করে।',ex:'Serial.println("Hello Instructor");'},
 {k:'include',g:'Libraries',sig:'#include "Library.h"',en:'Brings in ready-made code (a library), like adding a new tool to your toolbox.',bn:'তৈরি কোড (লাইব্রেরি) যোগ করে, যেমন টুলবক্সে নতুন যন্ত্র যোগ করা।',ex:'#include "BluetoothSerial.h"'},
 {k:'SerialBT',g:'Libraries',sig:'SerialBT.begin("MyRobot");',en:'Starts Bluetooth with a name your phone can see. SerialBT.available() says if a letter arrived; SerialBT.read() reads it.',bn:'একটা নাম দিয়ে Bluetooth চালু করে, যেটা ফোন দেখতে পায়। SerialBT.available() বলে অক্ষর এসেছে কিনা; SerialBT.read() সেটা পড়ে।',ex:'if (SerialBT.available()) {\n  char c = SerialBT.read();\n}'},
 {k:'Servo',g:'Libraries',sig:'myservo.write(angle);',en:'Turns a servo to an angle from 0 to 180. First: Servo myservo; and myservo.attach(pin);',bn:'সার্ভোকে 0 থেকে 180 ডিগ্রি কোণে ঘোরায়। আগে: Servo myservo; আর myservo.attach(pin);',ex:'myservo.attach(18);\nmyservo.write(90);'},
 {k:'pulseIn',g:'Sensors',sig:'pulseIn(pin, HIGH)',en:'Measures how long a pin stays HIGH, in microseconds. With the sonar: distance cm = time / 58.',bn:'একটা পিন কতক্ষণ HIGH থাকে মাইক্রোসেকেন্ডে মাপে। সোনারে: দূরত্ব সেমি = সময় / 58।',ex:'long t = pulseIn(18, HIGH);\nlong cm = t / 58;'}];
const BY=Object.fromEntries(D.map(e=>[e.k,e]));

/* explain one line of code in plain words, using the real numbers in it */
function explain(line,lang){
  const bn=lang==='bn', s=line.trim(); if(!s)return null;
  const P=(en,b)=>bn?b:en; let m;
  const pv=v=>/^HIGH$/.test(v)?P('ON (3.3 V)','চালু (3.3 V)'):/^LOW$/.test(v)?P('OFF (0 V)','বন্ধ (0 V)'):v;
  if(/^\/\//.test(s))return P('A note for humans: the ESP32 skips it.','মানুষের জন্য নোট: ESP32 এটা পড়ে না।');
  if(/^void\s+setup/.test(s))return P('Start of setup(): what is inside runs once, when the board turns on.','setup() শুরু: ভেতরের লেখা একবার চলে, বোর্ড চালু হলে।');
  if(/^void\s+loop/.test(s))return P('Start of loop(): what is inside repeats forever.','loop() শুরু: ভেতরের লেখা সারাজীবন বারবার চলে।');
  if((m=/^void\s+(\w+)\s*\(/.exec(s)))return P(`Creates your own command called ${m[1]}(). Use it later with ${m[1]}();`,`${m[1]}() নামে তোমার নিজের কমান্ড বানায়। পরে ${m[1]}(); লিখে ব্যবহার করো।`);
  if(/^\}\s*else/.test(s))return P('Otherwise (if the condition was false), do the next block.','না হলে (শর্ত মিথ্যা হলে), পরের অংশ চালাও।');
  if(/^\}$/.test(s))return P('Closes the block that started with {.','{ দিয়ে শুরু হওয়া অংশ শেষ করে।');
  if((m=/pinMode\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/.exec(s)))return ({OUTPUT:P(`Pin ${m[1]} becomes an OUTPUT: it can send power out.`,`পিন ${m[1]} আউটপুট হলো: বিদ্যুৎ পাঠাতে পারবে।`),INPUT:P(`Pin ${m[1]} becomes an INPUT: it listens.`,`পিন ${m[1]} ইনপুট হলো: শুনবে।`),INPUT_PULLUP:P(`Pin ${m[1]} listens, and reads HIGH until a button pulls it to GND.`,`পিন ${m[1]} শুনবে, আর বাটন GND এ না টানা পর্যন্ত HIGH পড়বে।`)})[m[2]]||P(`Sets the job of pin ${m[1]}.`,`পিন ${m[1]} এর কাজ ঠিক করে।`)+(s.endsWith(';')?'':P(' ⚠ add ; at the end',' ⚠ শেষে ; দাও'));
  if((m=/digitalWrite\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/.exec(s)))return P(`Turns pin ${m[1]} ${pv(m[2])}.`,`পিন ${m[1]} ${pv(m[2])} করে।`)+(s.endsWith(';')?'':P(' ⚠ add ; at the end',' ⚠ শেষে ; দাও'));
  if((m=/analogWrite\s*\(\s*(\w+)\s*,\s*(\d+)\s*\)/.exec(s))){const p=Math.round(+m[2]/255*100); return P(`Sets pin ${m[1]} to level ${m[2]} of 255, about ${p}% (speed or brightness).`,`পিন ${m[1]} কে 255 এর মধ্যে ${m[2]} মাত্রায় রাখে, প্রায় ${p}% (গতি বা উজ্জ্বলতা)।`)}
  if((m=/delay\s*\(\s*(\d+)\s*\)/.exec(s)))return P(`Waits ${m[1]} ms = ${(+m[1]/1000)} second${+m[1]===1000?'':'s'}.`,`${m[1]} মিলিসেকেন্ড = ${(+m[1]/1000)} সেকেন্ড অপেক্ষা করে।`);
  if((m=/if\s*\((.*)\)/.exec(s))){let c=m[1].replace(/digitalRead\s*\(\s*(\w+)\s*\)/g,P('pin $1','পিন $1')).replace(/==/g,P(' is ',' হলে ')).replace(/!=/g,P(' is not ',' না হলে ')).replace(/&&/g,P(' and ',' এবং ')).replace(/\|\|/g,P(' or ',' অথবা ')); return P(`Checks: if ${c}, then do the block below.`,`যাচাই করে: ${c}, তাহলে নিচের অংশ চালাও।`)}
  if((m=/Serial\.print(ln)?\s*\((.*)\)/.exec(s)))return P(`Prints ${m[2]} on the Serial Monitor${m[1]?' and moves to a new line':''}.`,`সিরিয়াল মনিটরে ${m[2]} প্রিন্ট করে${m[1]?' আর নতুন লাইনে যায়':''}।`);
  if((m=/digitalRead\s*\(\s*(\w+)\s*\)/.exec(s)))return P(`Reads pin ${m[1]} right now (HIGH or LOW).`,`পিন ${m[1]} এখনই পড়ে (HIGH বা LOW)।`);
  if((m=/analogRead\s*\(\s*(\w+)\s*\)/.exec(s)))return P(`Reads pin ${m[1]} as a number from 0 to 4095.`,`পিন ${m[1]} কে 0 থেকে 4095 সংখ্যায় পড়ে।`);
  if((m=/Serial\.begin\s*\(\s*(\d+)/.exec(s)))return P(`Opens the Serial Monitor at ${m[1]} baud. Set the monitor to ${m[1]} too.`,`${m[1]} baud এ সিরিয়াল মনিটর চালু করে। মনিটরেও ${m[1]} দাও।`);
  if((m=/SerialBT\.begin\s*\((.*)\)/.exec(s)))return P(`Starts Bluetooth with the name ${m[1]}. Your phone will see this name.`,`${m[1]} নামে Bluetooth চালু করে। ফোন এই নাম দেখবে।`);
  if(/SerialBT\.available/.test(s))return P('Checks if a letter has arrived from the phone.','ফোন থেকে কোনো অক্ষর এসেছে কিনা দেখে।');
  if((m=/(\w+)\s*=\s*SerialBT\.read/.exec(s)))return P(`Reads one letter from the phone into ${m[1]}.`,`ফোন থেকে একটা অক্ষর ${m[1]} তে পড়ে।`);
  if(/#include/.test(s))return P('Adds a library: ready-made code you can use.','একটা লাইব্রেরি যোগ করে: তৈরি কোড যা ব্যবহার করা যায়।');
  if((m=/#define\s+(\w+)\s+(\S+)/.exec(s)))return P(`From now on, ${m[1]} means ${m[2]}.`,`এখন থেকে ${m[1]} মানে ${m[2]}।`);
  if((m=/^for\s*\(/.exec(s)))return P('Repeats the block below a set number of times.','নিচের অংশ নির্দিষ্ট সংখ্যক বার চালায়।');
  if(/^while\s*\(/.test(s))return P('Repeats the block below while the condition is true.','শর্ত সত্য থাকা পর্যন্ত নিচের অংশ চালাতে থাকে।');
  if((m=/(\w+)\.attach\s*\(\s*(\w+)\s*\)/.exec(s)))return P(`Connects the servo ${m[1]} to pin ${m[2]}.`,`সার্ভো ${m[1]} কে পিন ${m[2]} এ যুক্ত করে।`);
  if((m=/(\w+)\.write\s*\(\s*(\w+)\s*\)/.exec(s)))return P(`Turns the servo ${m[1]} to ${m[2]}°.`,`সার্ভো ${m[1]} কে ${m[2]}° তে ঘোরায়।`);
  if((m=/pulseIn\s*\(\s*(\w+)/.exec(s)))return P(`Times the echo on pin ${m[1]} in microseconds. Divide by 58 for cm.`,`পিন ${m[1]} এ প্রতিধ্বনির সময় মাইক্রোসেকেন্ডে মাপে। সেমি পেতে 58 দিয়ে ভাগ করো।`);
  if((m=/^(?:int|long|float|char|bool|byte|unsigned long|const int)\s+(\w+)\s*=\s*(.+);?$/.exec(s)))return P(`Makes a box called ${m[1]} and puts ${m[2].replace(/;$/,'')} in it.`,`${m[1]} নামে একটা বাক্স বানায় আর তাতে ${m[2].replace(/;$/,'')} রাখে।`);
  if((m=/^(\w+)\s*\(\s*\)\s*;/.exec(s)))return P(`Runs your command ${m[1]}().`,`তোমার কমান্ড ${m[1]}() চালায়।`);
  if((m=/^(\w+)\s*=\s*(.+);/.exec(s)))return P(`Changes ${m[1]} to ${m[2]}.`,`${m[1]} কে ${m[2]} করে।`);
  return null;
}
window.TookieSyntax={D,BY,explain};
})();
