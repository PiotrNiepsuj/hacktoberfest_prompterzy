(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const mini = document.getElementById("minimap");
  const mx = mini.getContext("2d");
  const W = canvas.width, H = canvas.height, TILE = 32, COLS = 40, ROWS = 30;
  const keys = new Set();
  const rand = (n) => { let x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const el = (id) => document.getElementById(id);
  const images = { market: new Image(), neptune: new Image() };
  images.market.src = "assets/mapa.jpg";
  images.neptune.src = "assets/jerzy.png";

  const areaDefs = {
    rynek: { name: "Rynek", color: "#94886a", ground: "#b5a786", safe: false },
    park: { name: "Park Chopina", color: "#426847", ground: "#548051", safe: true },
    zaulek: { name: "Podwórko cudów", color: "#83765e", ground: "#a49778", safe: false },
  };
  const areas = {};
  function makeArea(id) {
    const grid = Array.from({ length: ROWS }, (_, y) =>
      Array.from({ length: COLS }, (_, x) => {
        if (id === "park") return (x + y) % 7 === 0 ? 1 : 0;
        if (id === "zaulek") return (x * 3 + y) % 13 === 0 ? 1 : 0;
        return 0;
      }));
    return { id, ...areaDefs[id], grid, obstacles: [], props: [], npcs: [], items: [], exits: [] };
  }
  function rect(a, x, y, w, h) { a.obstacles.push({ x, y, w, h }); }
  const market = makeArea("rynek");
  // The supplied town illustration is the market floorplan; these blocks match its rooftops.
  [[125,78,156,139],[380,70,155,151],[737,75,150,145],[112,333,164,186],
    [360,536,183,112],[680,530,190,120],[100,540,170,120],[825,330,120,200],
    [745,225,85,48],[385,312,45,55],[555,312,45,55]].forEach(r => rect(market,...r));
  rect(market,1018,150,78,62);
  market.props.push({type:"fountain",x:1050,y:145,w:75,h:65});
  market.props.push({type:"bench",x:805,y:278,w:56,h:18},{type:"lamp",x:320,y:250},{type:"lamp",x:640,y:255},{type:"market",x:255,y:437});
  market.npcs.push(
    {x:332,y:316,name:"Pani Halina",color:"#d87854",line:["Słyszałam, że fontanna znowu bulgocze. Jak bulgocze, to znaczy, że ktoś wrzucił paragon.","Neptun? Ten z fontanny? Zawsze mówiłam, że ma minę urzędnika po przerwie."], quest:"market"},
    {x:500,y:385,name:"Pan Mietek",color:"#6999a1",line:["Jestem lokalnym ekspertem od skrótów. I od stania w miejscu, jak widać.","W parku zostawiłem starą monetę. Przynieś ją, a dam ci coś, co może uratować skórę."], quest:"coin"},
    {x:618,y:463,name:"Dostawca kebaba",color:"#c9a14b",line:["Dostawa pod fontannę? Tylko jeśli posąg dopłaci za sos. Nie dopłacił."], quest:"kebab"}
  );
  market.items.push({x:280,y:470,id:"rogale",name:"Rogal śląski",taken:false});
  market.exits.push({x:465,y:744,w:100,h:24,to:"park",spawn:{x:510,y:60},label:"Do parku Chopina ↓"});

  const park = makeArea("park");
  park.props.push({type:"pond",x:220,y:150,w:190,h:114},{type:"gazebo",x:680,y:135,w:100,h:90},{type:"bench",x:155,y:335,w:52,h:18},{type:"bench",x:680,y:435,w:52,h:18},{type:"sign",x:455,y:300,label:"PARK CHOPINA"});
  for (let i=0;i<36;i++){const x=45+rand(i+22)*1180,y=50+rand(i+83)*820;if(x>440&&x<590&&y<150)continue;park.props.push({type:"tree",x,y,r:13+rand(i+7)*5});rect(park,x-11,y-9,22,22);}
  park.npcs.push(
    {x:475,y:255,name:"Pan Mietek",color:"#6999a1",line:["Moneta? Wiedziałem, że grawitacja w końcu się przyda.","Weź ten gwizdek. Podobno odgania gołębie. I jednego (1) mitycznego wodnika."],quest:"coin"},
    {x:710,y:315,name:"Biegacz z Zabrza",color:"#cf725d",line:["Biegam dla zdrowia. Gdyby posąg biegł za mną, byłbym już najzdrowszym człowiekiem w Polsce."]}
  );
  park.items.push({x:320,y:325,id:"moneta",name:"Moneta Mietka",taken:false});
  park.exits.push({x:465,y:0,w:100,h:24,to:"rynek",spawn:{x:510,y:700},label:"Na rynek ↑"},{x:1210,y:350,w:24,h:100,to:"zaulek",spawn:{x:70,y:375},label:"Do podwórka →"});

  const alley = makeArea("zaulek");
  alley.props.push({type:"dumpster",x:240,y:200,w:75,h:42},{type:"bench",x:530,y:360,w:55,h:18},{type:"sign",x:385,y:165,label:"SKRÓT (PRAWIE LEGALNY)"});
  [[70,65,145,130],[350,55,130,150],[760,50,180,130],[100,495,160,170],[440,520,155,145],[835,495,140,160],[620,245,90,100]].forEach(r=>rect(alley,...r));
  alley.npcs.push({x:530,y:240,name:"Strażniczka skrótów",color:"#9384b9",line:["Za tą bramą jest droga do parku. Neptun nie lubi ciasnych przejść. Pewnie trójząb mu haczy o rynnę."],quest:"shortcut"});
  alley.items.push({x:690,y:440,id:"gwizdek",name:"Gwizdek Mietka",taken:false});
  alley.exits.push({x:0,y:350,w:24,h:100,to:"park",spawn:{x:1180,y:400},label:"Do parku ←"});
  areas.rynek=market;areas.park=park;areas.zaulek=alley;

  let player, neptune, minions, gameState="title", worldTime=0, lastFrame=0, dialog=null, attackTimer=0, dodgeTimer=0, saveTimer=0, toastTimer=0, audioCtx=null, musicTimer=null, musicBeat=0, muted=true, encounterStarted=false, finaleReady=false, wodnikDefeated=false, collected={};
  const questState={coin:false,clue:false,shortcut:false};
  const objectives=[
    {title:"Rozejrzyj się po rynku",copy:"Podejdź do fontanny. Lokalna atrakcja. Raczej bezpieczna."},
    {title:"Znajdź odpowiedzi",copy:"Porozmawiaj z mieszkańcami i sprawdź park Chopina oraz podejrzane podwórko."},
    {title:"Przygotuj się na finał",copy:"Odszukaj Mietka w parku, zabierz jego monetę i odkryj sekret klątwy."},
    {title:"Zakończ sprawę przy fontannie",copy:"Wróć na rynek i zmierz się z Neptunem. Widły są legalne. Chyba."},
  ];
  let objectiveIndex=0;
  function newPlayer(){return {x:510,y:405,r:10,hp:100,maxHp:100,stamina:100,maxStamina:100,dir:{x:0,y:1},anim:0,hidden:false,hideRequested:false,invuln:0,attack:0,dodge:0,items:[],clues:0};}
  function resetGame(){
    player=newPlayer();neptune={x:1050,y:100,hp:240,maxHp:240,state:"dormant",dir:{x:-1,y:0},target:null,search:0,attack:0,phase:0,patrol:0,water:0};
    minions=[];gameState="play";dialog=null;worldTime=0;saveTimer=0;encounterStarted=false;finaleReady=false;wodnikDefeated=false;objectiveIndex=0;Object.keys(questState).forEach(k=>questState[k]=false);Object.keys(collected).forEach(k=>delete collected[k]);
    for(const a of Object.values(areas))for(const item of a.items)item.taken=false;
    el("screen").classList.add("hidden");el("end-overlay").classList.add("hidden");el("pause-overlay").classList.add("hidden");el("dialog").classList.add("hidden");
    player.items=[];toast("Jerzy: piękny dzień na spacer. Co mogłoby pójść nie tak?");updateHud();saveGame();
  }
  function saveGame(){
    try{localStorage.setItem("gliwice-jerzy-save",JSON.stringify({area:currentArea.id,x:player.x,y:player.y,hp:player.hp,stamina:player.stamina,items:player.items,objectiveIndex,questState,clues:player.clues,encounterStarted,finaleReady,wodnikDefeated,neptuneHp:neptune.hp,neptuneState:neptune.state,collected:Object.values(areas).flatMap(a=>a.items.filter(i=>i.taken).map(i=>i.id))}));el("save-status").textContent="ZAPISANO";setTimeout(()=>{if(el("save-status"))el("save-status").textContent="ZAPIS AUTOMATYCZNY"},1200);}catch(e){el("save-status").textContent="ZAPIS NIEDOSTĘPNY";}
  }
  let currentArea=market;
  function loadGame(){
    try{const s=JSON.parse(localStorage.getItem("gliwice-jerzy-save")||"null");if(!s)return false;currentArea=areas[s.area]||market;player=newPlayer();Object.assign(player,{x:s.x??510,y:s.y??405,hp:s.hp??100,stamina:s.stamina??100,items:s.items||[],clues:s.clues||0});objectiveIndex=s.objectiveIndex||0;Object.assign(questState,s.questState||{});encounterStarted=!!s.encounterStarted;finaleReady=!!s.finaleReady;wodnikDefeated=!!s.wodnikDefeated;neptune={x:s.area==="rynek"?1050:790,y:s.area==="rynek"?100:155,hp:s.neptuneHp??240,maxHp:240,state:s.neptuneState||(encounterStarted?"chase":"dormant"),dir:{x:-1,y:0},target:null,search:3,attack:0,patrol:0,water:0};minions=currentArea.id==="zaulek"&&!wodnikDefeated?[{x:740,y:400,hp:70,maxHp:70,attack:1,dir:{x:-1,y:0}}]:[];for(const a of Object.values(areas))for(const item of a.items)if(s.collected?.includes(item.id))item.taken=true;return true;}catch{return false;}
  }
  function audio(){
    if(muted)return;
    try{audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==="suspended")audioCtx.resume();}catch{}
  }
  function tone(freq=440,dur=.08,wave="square",vol=.035){
    if(muted)return;audio();if(!audioCtx)return;const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=wave;o.frequency.value=freq;g.gain.setValueAtTime(vol,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+dur);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+dur);
  }
  function startMusic(){
    if(musicTimer)return;
    musicTimer=setInterval(()=>{
      if(muted||gameState==="title"||gameState==="pause")return;
      const tense=neptune&&(neptune.state==="chase"||neptune.state==="combat");
      const notes=tense?[196,220,196,164,196,247,220,164]:[262,330,392,330,294,349,392,330];
      const note=notes[musicBeat++%notes.length];tone(note,tense?.13:.22,tense?"sawtooth":"square",tense?.018:.012);
      if(musicBeat%4===0)tone(tense?82:131,.16,"triangle",.018);
    },280);
  }
  function toast(text){const t=el("toast");t.textContent=text;t.classList.add("visible");toastTimer=2.5;}
  function updateObjective(i){objectiveIndex=clamp(i,0,objectives.length-1);el("objective-title").textContent=objectives[objectiveIndex].title;el("objective-copy").textContent=objectives[objectiveIndex].copy;}
  function updateHud(){
    if(!player)return;
    el("health-bar").style.width=`${player.hp/player.maxHp*100}%`;el("health-text").textContent=`${Math.ceil(player.hp)} / ${player.maxHp}`;
    el("stamina-bar").style.width=`${player.stamina/player.maxStamina*100}%`;el("stamina-text").textContent=`${Math.ceil(player.stamina)} / ${player.maxStamina}`;
    const alert=neptune.state==="chase"||neptune.state==="combat";el("threat-text").textContent=alert?"ON CIĘ WIDZI. SERIO.":"NEPTUN ŚPI. CHYBA.";el("threat-state").textContent=neptune.state.toUpperCase();el("threat-text").parentElement.classList.toggle("alert",alert);
    el("location-label").textContent=currentArea.name.toUpperCase();const chips=player.items.map(i=>`<span class="item-chip">${i}</span>`).join("")||'<span class="item-chip">pusto (jak konto)</span>';el("inventory-items").innerHTML=chips;
    el("objective-title").textContent=objectives[objectiveIndex].title;el("objective-copy").textContent=objectives[objectiveIndex].copy;
    el("chapter").textContent=`ROZDZIAŁ 0${Math.max(1,objectiveIndex+1)} · ${currentArea.name.toUpperCase()}`;
    el("pause-quests").innerHTML=`<div>${questState.clue?"✓":"○"} Pogadaj z mieszkańcami i poznaj sekret klątwy</div><div>${questState.coin?"✓":"○"} Znajdź monetę Mietka w parku</div><div>${questState.shortcut?"✓":"○"} Odkryj podwórkowy skrót</div><div>${player.items.includes("Gwizdek")?"✓":"○"} Zdobądź gwizdek przeciw wodnikom</div><div>${neptune.hp<=0?"✓":"○"} Przeżyj spotkanie z Neptunem</div>`;
  }
  function obstacleAt(a,x,y,r=8){
    if(x<r||y<r||x>COLS*TILE-r||y>ROWS*TILE-r)return true;
    if(a.grid[Math.floor(y/TILE)]?.[Math.floor(x/TILE)]===1)return true;
    return a.obstacles.some(o=>x+r>o.x&&x-r<o.x+o.w&&y+r>o.y&&y-r<o.y+o.h);
  }
  function moveEntity(a,who,dx,dy,r=8){
    if(!obstacleAt(a,who.x+dx,who.y,r))who.x+=dx;
    if(!obstacleAt(a,who.x,who.y+dy,r))who.y+=dy;
  }
  function visible(a,b){
    const d=dist(a,b),steps=Math.ceil(d/12);for(let i=1;i<steps;i++){const x=a.x+(b.x-a.x)*i/steps,y=a.y+(b.y-a.y)*i/steps;if(obstacleAt(currentArea,x,y,1))return false;}return true;
  }
  function findPath(area,from,to){
    const cell=(p)=>({x:clamp(Math.floor(p.x/TILE),0,COLS-1),y:clamp(Math.floor(p.y/TILE),0,ROWS-1)});
    const s=cell(from),g=cell(to),key=(x,y)=>`${x},${y}`,q=[s],prev=new Map([[key(s.x,s.y),null]]),dirs=[[1,0],[-1,0],[0,1],[0,-1]];
    while(q.length){const p=q.shift();if(Math.abs(p.x-g.x)+Math.abs(p.y-g.y)<=1)break;
      for(const [dx,dy] of dirs){const x=p.x+dx,y=p.y+dy,k=key(x,y);if(x<0||x>=COLS||y<0||y>=ROWS||prev.has(k)||obstacleAt(area,(x+.5)*TILE,(y+.5)*TILE,8))continue;prev.set(k,key(p.x,p.y));q.push({x,y});}
    }
    let k=key(g.x,g.y);if(!prev.has(k)){let best=null,bd=1e9;for(const [candidate] of prev){const [x,y]=candidate.split(",").map(Number),d=Math.abs(x-g.x)+Math.abs(y-g.y);if(d<bd){bd=d;best=candidate;}}k=best;if(!k)return null;}
    const path=[];while(k){const [x,y]=k.split(",").map(Number);path.push({x:(x+.5)*TILE,y:(y+.5)*TILE});k=prev.get(k);}return path.reverse();
  }
  function transition(exit){
    currentArea=areas[exit.to];player.x=exit.spawn.x;player.y=exit.spawn.y;neptune.x=exit.to==="rynek"?1050:exit.to==="zaulek"?1120:830;neptune.y=exit.to==="rynek"?100:390;neptune.state=currentArea.safe?"patrol":"investigate";neptune.search=3;if(exit.to==="zaulek"&&!wodnikDefeated)minions=[{x:740,y:400,hp:70,maxHp:70,attack:1,dir:{x:-1,y:0}}];else if(exit.to!=="zaulek")minions=[];toast(exit.label);tone(500,.09,"triangle");saveGame();
  }
  function movePlayer(dt){
    let dx=(keys.has("d")||keys.has("arrowright")?1:0)-(keys.has("a")||keys.has("arrowleft")?1:0);
    let dy=(keys.has("s")||keys.has("arrowdown")?1:0)-(keys.has("w")||keys.has("arrowup")?1:0);
    const moving=dx!==0||dy!==0;if(moving){const mag=Math.hypot(dx,dy);dx/=mag;dy/=mag;player.dir={x:dx,y:dy};}
    const sprint=moving&&(keys.has("shift"))&&player.stamina>0;
    if(sprint)player.stamina=Math.max(0,player.stamina-35*dt);else player.stamina=Math.min(100,player.stamina+19*dt);
    const hidden=player.hidden;let speed=sprint?205:116;if(hidden)speed*=.52;
    if(moving){moveEntity(currentArea,player,dx*speed*dt,dy*speed*dt,8);player.anim+=dt*(sprint?13:8);}
    const cover=currentArea.props.some(p=>p.type==="tree"&&Math.hypot(player.x-p.x,player.y-(p.y+4))<29)||currentArea.props.some(p=>p.type==="dumpster"&&player.x>p.x-20&&player.x<p.x+p.w+20&&player.y>p.y-20&&player.y<p.y+p.h+20);
    player.hidden=player.hideRequested&&cover;
    if(player.hideRequested&&!cover)player.hideRequested=false;
    if(player.invuln>0)player.invuln-=dt;if(player.attack>0)player.attack-=dt;if(player.dodge>0)player.dodge-=dt;if(attackTimer>0)attackTimer-=dt;if(dodgeTimer>0)dodgeTimer-=dt;
    for(const ex of currentArea.exits){if(player.x>ex.x&&player.x<ex.x+ex.w&&player.y>ex.y&&player.y<ex.y+ex.h){transition(ex);break;}}
  }
  function triggerEncounter(){
    if(encounterStarted)return;encounterStarted=true;neptune.state="chase";neptune.hp=240;updateObjective(1);
    showDialog("NEPTUN",["JERZY. TWOJE DNI SĄ POLICZONE.","Oddałeś kiedyś paragon za zapiekankę z 2009 roku.","DŁUG WODNY NIE ULEGA PRZEDAWNIENIU."],()=>{tone(95,.3,"sawtooth",.055);});
  }
  function updateNeptune(dt){
    if(!encounterStarted&&neptune.state==="dormant"&&currentArea.id==="rynek"&&dist(player,{x:1050,y:145})<165)triggerEncounter();
    if(!encounterStarted||neptune.hp<=0)return;
    const d=dist(player,neptune),canSee=d<310&&!player.hidden&&visible(player,neptune);
    if(currentArea.safe&&neptune.state!=="combat"){if(neptune.state==="chase"){neptune.state="search";neptune.search=2;}neptune.x+=Math.sin(worldTime)*7*dt;neptune.y+=Math.cos(worldTime*.7)*5*dt;return;}
    if(canSee&&neptune.state!=="combat"){neptune.state="chase";neptune.target={x:player.x,y:player.y};neptune.search=3;}
    if(neptune.state==="chase"&&(!canSee||player.hidden)){
      neptune.search-=dt;
      if(neptune.search<=0){neptune.state="search";neptune.search=4.5;neptune.searchOrigin=neptune.target||{x:player.x,y:player.y};}
    }
    if(neptune.state==="search"){neptune.search-=dt;const angle=worldTime*2;neptune.target={x:neptune.searchOrigin.x+Math.cos(angle)*54,y:neptune.searchOrigin.y+Math.sin(angle)*54};if(neptune.search<=0)neptune.state="patrol";}
    if(neptune.state==="patrol"||neptune.state==="investigate"){
      neptune.patrol+=dt;const way=[{x:1050,y:100},{x:900,y:260},{x:600,y:260},{x:770,y:440}][Math.floor(neptune.patrol/5)%4];neptune.target=way;
      if(neptune.state==="investigate"&&neptune.search<=0)neptune.state="patrol";else neptune.search-=dt;
    }
    if(neptune.state==="chase"||neptune.state==="combat"||neptune.state==="patrol"||neptune.state==="investigate"||neptune.state==="search"){
      const target=neptune.target||player;
      neptune.pathClock=(neptune.pathClock||0)-dt;
      if(neptune.pathClock<=0||!neptune.path){neptune.path=findPath(currentArea,neptune,target);neptune.pathClock=neptune.state==="chase"?.3:.8;}
      const path=neptune.path||[],next=path.length>1&&dist(neptune,path[0])<14?path[1]:path[0],aim=next||target;
      const dir=Math.atan2(aim.y-neptune.y,aim.x-neptune.x),speed=neptune.state==="chase"?67+objectiveIndex*9:neptune.state==="combat"?48:29;
      if(dist(neptune,aim)>5){const vx=Math.cos(dir)*speed*dt,vy=Math.sin(dir)*speed*dt;moveEntity(currentArea,neptune,vx,vy,14);}
      neptune.dir={x:Math.cos(dir),y:Math.sin(dir)};
    }
    if(d<52&&neptune.state==="chase"){neptune.state="combat";neptune.attack=1.1;}
    if(neptune.state==="combat"){
      neptune.attack-=dt;
      if(neptune.windup>0){
        neptune.windup-=dt;
        if(neptune.windup<=0){
          const kind=neptune.attackKind,distNow=dist(player,neptune);
          if(kind==="szarża"){const dx=player.x-neptune.x,dy=player.y-neptune.y,len=Math.hypot(dx,dy)||1;moveEntity(currentArea,neptune,dx/len*105,dy/len*105,14);if(dist(player,neptune)<39)damagePlayer(22,"Neptun taranuje cię jak tramwaj bez rozkładu.");}
          else if(kind==="strumienie"){neptune.hazard={x:neptune.hazardX,y:neptune.hazardY,time:.8};}
          else{const radius=kind==="gniew"?180:kind==="fala"?132:82,damage=kind==="gniew"?28:kind==="fala"?13:18;neptune.water=kind==="fala"?1.3:0.65;if(distNow<radius)damagePlayer(damage,kind==="gniew"?"GNIEW GLIWICKICH WÓD!":"Fontanna oddaje z nawiązką.");}
          if(kind==="strumienie"&&dist({x:neptune.hazardX,y:neptune.hazardY},player)<39)damagePlayer(17,"Strumień wody wystrzelił cię w powietrze.");
          neptune.attack=kind==="gniew"?2.2:1.25+Math.random()*.45;neptune.attackKind=null;
        }
      }else if(neptune.attack<=0){
        const roll=Math.random();
        neptune.attackKind=neptune.hp<neptune.maxHp*.25?"gniew":neptune.hp<neptune.maxHp*.62?(roll<.45?"szarża":roll<.75?"strumienie":"fala"):(roll<.45?"trójząb":roll<.75?"fala":"szarża");
        neptune.windup=neptune.attackKind==="gniew"?1.1:.55;
        neptune.hazardX=player.x;neptune.hazardY=player.y;neptune.water=neptune.attackKind==="fala"?.5:.25;
        toast(neptune.attackKind==="gniew"?"NEPTUN: GNIEW GLIWICKICH WÓD!":`Neptun szykuje atak: ${neptune.attackKind.toUpperCase()}`);
        tone(neptune.attackKind==="gniew"?75:145,.2,"sawtooth",.045);
      }
      if(d>95)neptune.state="chase";
    }
    if(neptune.water>0)neptune.water-=dt;
    if(neptune.hazard){neptune.hazard.time-=dt;if(neptune.hazard.time<=0)neptune.hazard=null;}
    if(neptune.state==="chase"&&Math.random()<.007)tone(90,.12,"triangle",.025);
  }
  function damagePlayer(amount,text){
    if(player.invuln>0||player.dodge>0)return;
    const reduced=player.items.includes("Gwizdek")?Math.ceil(amount*.7):amount;
    player.hp=Math.max(0,player.hp-reduced);player.invuln=.8;toast(text);tone(85,.15,"square",.04);
  }
  function doAttack(){
    if(attackTimer>0||gameState!=="play"||dialog)return;player.attack=.28;attackTimer=.42;tone(250,.08,"square",.04);
    const candidates=[neptune,...minions].filter(e=>e&&e.hp>0&&dist(player,e)<60);
    for(const e of candidates){const dot=(e.x-player.x)*player.dir.x+(e.y-player.y)*player.dir.y;if(dot< -5)continue;e.hp-=e===neptune?22:45;const m=Math.atan2(e.y-player.y,e.x-player.x);moveEntity(currentArea,e,Math.cos(m)*19,Math.sin(m)*19,8);e.hit=.2;tone(380,.07,"triangle",.05);if(e===neptune){neptune.state="combat";if(neptune.hp<=0)winGame();}else if(e.hp<=0){wodnikDefeated=true;toast("Wodnik pokonany! Miejskie wody dziękują.");saveGame();}}
  }
  function updateMinions(dt){
    if(currentArea.id!=="zaulek")return;
    for(const m of minions){if(m.hp<=0)continue;m.attack-=dt;const d=dist(m,player);if(d<280){const angle=Math.atan2(player.y-m.y,player.x-m.x);if(d>24)moveEntity(currentArea,m,Math.cos(angle)*53*dt,Math.sin(angle)*53*dt,8);else if(m.attack<=0&&player.invuln<=0&&player.dodge<=0){player.hp=Math.max(0,player.hp-8);player.invuln=.65;m.attack=1.25;toast("Wodnik chlupnął cię po kostkach.");tone(120,.12,"triangle",.03);}}}
  }
  function doDodge(){
    if(dodgeTimer>0||player.stamina<20||gameState!=="play"||dialog)return;player.stamina-=20;player.dodge=.22;player.invuln=.45;dodgeTimer=.75;moveEntity(currentArea,player,player.dir.x*52,player.dir.y*52,8);tone(620,.09,"triangle",.035);
  }
  function interact(){
    if(dialog){advanceDialog();return;}
    const near=currentArea.npcs.map(n=>({obj:n,d:dist(n,player)})).filter(x=>x.d<58).sort((a,b)=>a.d-b.d)[0];
    if(near){const n=near.obj;let lines=n.line;
      if(n.quest==="coin"&&currentArea.id==="park"&&!questState.coin&&player.items.includes("Moneta Mietka")){questState.coin=true;player.items=player.items.filter(x=>x!=="Moneta Mietka");player.items.push("Gwizdek");questState.clue=true;player.clues++;updateObjective(2);lines=["No proszę, moneta! A teraz trzymaj gwizdek. Odgania gołębie i, podobno, wodne bóstwa.","Przy okazji: klątwę uruchomił stary rachunek za wodę. Neptun chce tylko, żebyś go opłacił."]; }
      if(n.quest==="market"&&!questState.clue&&encounterStarted){questState.clue=true;player.clues++;lines=["Widziałam, jak Neptun wynurzył się z fontanny! Powtarzał coś o niezapłaconym rachunku.","Na rynku leży jakiś stary papier. Może rachunek. Albo menu z 1998 roku."];updateObjective(1);}
      if(n.quest==="shortcut"){questState.shortcut=true;player.clues++;updateObjective(1);}
      if(n.quest==="kebab"&&!player.items.includes("Sos czosnkowy")){player.items.push("Sos czosnkowy");lines=["Masz, sos czosnkowy gratis. Nie pytaj, co robi z nieumarłymi."];if(!questState.clue){questState.clue=true;player.clues++;}}
      showDialog(n.name,lines);return;
    }
    const item=currentArea.items.find(i=>!i.taken&&dist(i,player)<44);
    if(item){item.taken=true;player.items.push(item.name==="Moneta Mietka"?"Moneta Mietka":item.name);toast(`Znaleziono: ${item.name}`);tone(740,.1,"triangle");if(item.id==="moneta")updateObjective(2);updateHud();return;}
    const prop=currentArea.props.find(p=>p.type==="fountain"&&dist({x:p.x,y:p.y},player)<130);
    if(prop){if(!encounterStarted)triggerEncounter();else if(neptune.hp>0&&player.items.includes("Gwizdek")){neptune.hp-=35;player.items=player.items.filter(i=>i!=="Gwizdek");toast("Gwizdek Mietka! Neptun stracił 35 HP.");tone(800,.22,"sine",.05);if(neptune.hp<=0)winGame();}else if(neptune.hp<=0)toast("Fontanna znów jest spokojna. Woda ma do ciebie szacunek.");else toast("Fontanna burczy. Spróbuj widłami i pilnuj dystansu.");}
    else toast("Tu nic nie ma. Poza miejskim klimatem.");
  }
  function showDialog(name,lines,onClose){
    const arr=Array.isArray(lines)?lines:[lines];dialog={name,lines:arr,index:0,onClose};el("dialog-name").textContent=name;el("dialog-text").textContent=arr[0];el("dialog").classList.remove("hidden");tone(420,.05,"square",.02);
  }
  function advanceDialog(){dialog.index++;if(dialog.index>=dialog.lines.length){const f=dialog.onClose;dialog=null;el("dialog").classList.add("hidden");if(f)f();updateHud();return;}el("dialog-text").textContent=dialog.lines[dialog.index];tone(440,.04,"square",.02);}
  function winGame(){neptune.hp=0;neptune.state="defeated";gameState="win";el("end-eyebrow").textContent="ZAKOŃCZENIE · DOBRZE NAWODNIONE";el("end-title").textContent="JERZY ZWYCIĘŻA.";el("end-copy").textContent=player.items.includes("Sos czosnkowy")?"Rachunek opłacony, fontanna odklęta. Sos czosnkowy okazał się zbędny. Ale pyszny. Gliwice znów należą do ludzi i jednej (1) bardzo zadowolonej mewy.":"Rachunek opłacony widłami, fontanna odklęta. Neptun wraca do kamiennej drzemki. Gliwice oddychają z ulgą. Mewa kradnie paragon.";el("end-overlay").classList.remove("hidden");saveGame();}
  function loseGame(){gameState="lose";el("end-eyebrow").textContent="KONIEC GRY · HYDRATACJA 100%";el("end-title").textContent="NEPTUN WYGRYWA.";el("end-copy").textContent="Jerzy ląduje w fontannie. Neptun każe mu zapłacić za wodę. Rachunek jest absurdalnie wysoki.";el("end-overlay").classList.remove("hidden");}
  function pause(){if(gameState==="play"&&!dialog){gameState="pause";el("pause-overlay").classList.remove("hidden");updateHud();}else if(gameState==="pause"){gameState="play";el("pause-overlay").classList.add("hidden");}}

  function drawGround(){
    const camX=clamp(player.x-W/2,0,COLS*TILE-W),camY=clamp(player.y-H/2,0,ROWS*TILE-H);
    ctx.save();ctx.translate(-Math.floor(camX),-Math.floor(camY));
    if(currentArea.id==="rynek"&&images.market.complete&&images.market.naturalWidth){
      ctx.drawImage(images.market,0,0,COLS*TILE,ROWS*TILE);
    }else{
      for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){let c=currentArea.grid[y][x];ctx.fillStyle=c?"#315a3e":currentArea.ground;ctx.fillRect(x*TILE,y*TILE,TILE,TILE);if(!c){ctx.fillStyle=rand(x+y*COLS+3)>.5?"#ffffff0b":"#1a24160b";ctx.fillRect(x*TILE+rand(x*33+y)*25,y*TILE+rand(x+y*72)*27,3,3);}else{ctx.fillStyle="#173b2b";ctx.fillRect(x*TILE,y*TILE+25,TILE,7);}}
      if(currentArea.id==="rynek"){for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){if(x<3||x>36||y<2||y>27){ctx.fillStyle="#2c5b38";ctx.fillRect(x*TILE,y*TILE,TILE,TILE);drawTree(x*TILE+16,y*TILE+18,13);}}}
    }
    if(currentArea.id!=="rynek")drawPaths();
    for(const p of currentArea.props)drawProp(p);
    for(const it of currentArea.items)if(!it.taken)drawItem(it);
    for(const n of currentArea.npcs)drawPerson(n.x,n.y,n.color,n.name[0],false);
    if(neptune.hp>0&&currentArea.id!=="park")drawNeptune();
    for(const m of minions)if(m.hp>0){drawPerson(m.x,m.y,"#af7562","W",true);ctx.fillStyle="#181b";ctx.fillRect(m.x-16,m.y-24,32,4);ctx.fillStyle="#d4765f";ctx.fillRect(m.x-15,m.y-23,30*m.hp/m.maxHp,2);}
    drawPerson(player.x,player.y,"#6a9978","J",false,true);
    for(const ex of currentArea.exits){ctx.fillStyle="#f2d37c";ctx.globalAlpha=.15+Math.sin(worldTime*4)*.07;ctx.fillRect(ex.x,ex.y,ex.w,ex.h);ctx.globalAlpha=1;ctx.fillStyle="#283324";ctx.font="10px monospace";ctx.fillText(ex.label,ex.x-20,ex.y-8);}
    if(neptune.state==="combat"){ctx.fillStyle="#111a";ctx.fillRect(player.x-38,player.y-30,76,6);ctx.fillStyle="#d75f50";ctx.fillRect(player.x-37,player.y-29,74*Math.max(0,neptune.hp/neptune.maxHp),4);}
    if(neptune.water>0){ctx.strokeStyle="#9de7e7";ctx.lineWidth=4;ctx.globalAlpha=.7;ctx.beginPath();ctx.arc(neptune.x,neptune.y,35+(1.1-neptune.water)*72,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
    if(neptune.hazard){ctx.strokeStyle="#8de8eb";ctx.lineWidth=3;ctx.globalAlpha=.65+Math.sin(worldTime*18)*.25;ctx.beginPath();ctx.arc(neptune.hazard.x,neptune.hazard.y,17+(1-neptune.hazard.time)*18,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
    ctx.restore();
    ctx.fillStyle="#1118";ctx.fillRect(12,12,207,28);ctx.fillStyle="#f5edd2";ctx.font="12px monospace";ctx.fillText(`${currentArea.name.toUpperCase()}  ·  ${Math.floor(worldTime/60)}:${String(Math.floor(worldTime%60)).padStart(2,"0")}`,20,30);
    if(encounterStarted&&neptune.hp>0){ctx.fillStyle="#142019e8";ctx.fillRect(W-226,12,214,37);ctx.strokeStyle="#c1a86e";ctx.strokeRect(W-226,12,214,37);ctx.fillStyle="#e7d9b8";ctx.font="10px monospace";ctx.fillText("NEPTUN · MIEJSKI DŁUŻNIK",W-216,25);ctx.fillStyle="#39453a";ctx.fillRect(W-216,32,194,8);ctx.fillStyle="#d76a59";ctx.fillRect(W-215,33,192*Math.max(0,neptune.hp/neptune.maxHp),6);}
    if(player.hidden){ctx.fillStyle="#d6e5a8";ctx.font="11px monospace";ctx.fillText("UKRYTY",W-90,26);}
  }
  function drawPaths(){ctx.fillStyle=currentArea.id==="park"?"#b6a782":"#c3b18a";ctx.fillRect(475,0,75,ROWS*TILE);ctx.fillRect(0,365,1200,68);if(currentArea.id==="zaulek"){ctx.fillRect(0,365,1200,65);ctx.fillRect(480,0,70,900);}}
  function drawTree(x,y,r){ctx.fillStyle="#553f32";ctx.fillRect(x-3,y+2,6,13);ctx.fillStyle="#24472d";ctx.fillRect(x-r-2,y-r+2,r*2+4,r*2);ctx.fillStyle="#568447";ctx.fillRect(x-r,y-r,r*2,r*1.35);ctx.fillStyle="#77a253";ctx.fillRect(x-r+4,y-r+3,r,5);}
  function drawProp(p){
    const x=p.x,y=p.y;
    if(p.type==="fountain"){ctx.fillStyle="#6c6251";ctx.fillRect(x-6,y+20,p.w+12,p.h-7);ctx.fillStyle="#a9a08c";ctx.fillRect(x,y+17,p.w,p.h-12);ctx.fillStyle="#7cb7bd";ctx.fillRect(x+7,y+24,p.w-14,p.h-26);ctx.fillStyle="#c7c2ad";ctx.fillRect(x+29,y-10,18,34);ctx.fillStyle="#786c53";ctx.fillRect(x+23,y-13,30,7);ctx.fillStyle="#80d6df";ctx.fillRect(x+32,y-22,12,11);ctx.fillStyle="#6384a0";ctx.fillRect(x+36,y-36,4,15);ctx.fillRect(x+29,y-34,18,3);ctx.fillStyle="#92e5ed";ctx.fillRect(x+18,y+5,4,9);ctx.fillRect(x+55,y+3,4,11);}
    if(p.type==="tree")drawTree(x,y,p.r);
    if(p.type==="pond"){ctx.fillStyle="#40553d";ctx.fillRect(x-4,y+9,p.w+8,p.h-12);ctx.fillStyle="#629ea1";ctx.fillRect(x,y+8,p.w,p.h-18);ctx.fillStyle="#a7d0c2";ctx.fillRect(x+14,y+17,45,4);ctx.fillRect(x+106,y+58,60,4);}
    if(p.type==="gazebo"){ctx.fillStyle="#594739";ctx.fillRect(x,y+25,p.w,p.h-25);ctx.fillStyle="#bea779";ctx.fillRect(x-8,y+20,p.w+16,9);ctx.fillStyle="#775b43";ctx.fillRect(x-8,y+6,p.w+16,18);ctx.fillStyle="#d9c08b";ctx.fillRect(x+10,y+37,7,24);ctx.fillRect(x+80,y+37,7,24);}
    if(p.type==="bench"){ctx.fillStyle="#553c2b";ctx.fillRect(x,y,p.w,p.h);ctx.fillStyle="#a66d42";ctx.fillRect(x,y,p.w,5);ctx.fillRect(x,y+8,p.w,5);}
    if(p.type==="lamp"){ctx.fillStyle="#34443c";ctx.fillRect(x,y,5,32);ctx.fillStyle="#e1d395";ctx.fillRect(x-3,y-5,11,9);}
    if(p.type==="market"){ctx.fillStyle="#514536";ctx.fillRect(x,y,45,35);ctx.fillStyle="#557f5b";ctx.fillRect(x-3,y,51,9);ctx.fillStyle="#dbbc71";ctx.fillRect(x+5,y+13,35,13);}
    if(p.type==="sign"){ctx.fillStyle="#6e512f";ctx.fillRect(x,y,5,30);ctx.fillStyle="#dec887";ctx.fillRect(x-32,y-8,75,18);ctx.fillStyle="#3a3524";ctx.font="7px monospace";ctx.fillText(p.label,x-28,y+4);}
    if(p.type==="dumpster"){ctx.fillStyle="#40594b";ctx.fillRect(x,y,p.w,p.h);ctx.fillStyle="#627566";ctx.fillRect(x-3,y-4,p.w+6,8);ctx.fillStyle="#26372f";ctx.fillRect(x+8,y+12,4,5);ctx.fillRect(x+50,y+12,4,5);}
  }
  function drawItem(it){ctx.fillStyle="#f3db8d";ctx.fillRect(it.x-5,it.y-5,10,10);ctx.fillStyle="#fff4bf";ctx.fillRect(it.x-2,it.y-8,4,4);ctx.fillStyle="#293122";ctx.font="9px monospace";ctx.fillText(it.name,it.x-24,it.y-12);}
  function drawPerson(x,y,color,label,hostile=false,hero=false){
    const bob=Math.sin(worldTime*8+x)*1.5;ctx.fillStyle="#15201866";ctx.fillRect(x-8,y+7,16,5);if(hero&&player.hidden)ctx.globalAlpha=.5;
    ctx.fillStyle="#d3a67b";ctx.fillRect(x-5,y-15+bob,10,9);ctx.fillStyle=hostile?"#9e6352":color;ctx.fillRect(x-7,y-6+bob,14,13);ctx.fillStyle="#34483d";ctx.fillRect(x-6,y+6+bob,5,6);ctx.fillRect(x+1,y+6+bob,5,6);
    if(hero){ctx.fillStyle="#d2d8bf";ctx.fillRect(x+7,y-8+bob,3,20);ctx.fillStyle="#d0b365";ctx.fillRect(x+4,y-11+bob,10,3);ctx.fillRect(x+12,y-12+bob,2,5);}
    if(hostile){ctx.fillStyle="#f1d7a0";ctx.fillRect(x-2,y-13+bob,4,2);}
    if(!hero){ctx.fillStyle="#f4ead0";ctx.font="9px monospace";ctx.fillText(label,x-3,y-19+bob);}
    if(hero&&player.attack>0){ctx.strokeStyle="#f8e193";ctx.lineWidth=3;ctx.beginPath();ctx.arc(x+player.dir.x*15,y+player.dir.y*15,14,-1.5,1.5);ctx.stroke();}
    ctx.globalAlpha=1;
  }
  function drawNeptune(){
    const bob=Math.sin(worldTime*3)*1.2;
    if(images.neptune.complete&&images.neptune.naturalWidth){ctx.save();ctx.globalAlpha=.96;ctx.drawImage(images.neptune,neptune.x-35,neptune.y-45+bob,70,92);ctx.restore();}
    else drawPerson(neptune.x,neptune.y,"#718b87","N",true);
    if(neptune.state==="chase"||neptune.state==="combat"){ctx.fillStyle="#e9705c";ctx.fillRect(neptune.x-3,neptune.y-24+bob,4,4);ctx.fillRect(neptune.x+5,neptune.y-24+bob,4,4);}
    if(neptune.hp<neptune.maxHp&&neptune.hp>0){ctx.fillStyle="#151a";ctx.fillRect(neptune.x-28,neptune.y-52,56,5);ctx.fillStyle="#d75f50";ctx.fillRect(neptune.x-27,neptune.y-51,54*Math.max(0,neptune.hp/neptune.maxHp),3);}
  }
  function drawMinimap(){
    mx.clearRect(0,0,mini.width,mini.height);mx.fillStyle=currentArea.id==="park"?"#416c48":"#81775f";mx.fillRect(0,0,mini.width,mini.height);
    for(const o of currentArea.obstacles){mx.fillStyle="#303c30";mx.fillRect(o.x/(COLS*TILE)*mini.width,o.y/(ROWS*TILE)*mini.height,o.w/(COLS*TILE)*mini.width,o.h/(ROWS*TILE)*mini.height);}
    for(const ex of currentArea.exits){mx.fillStyle="#ddc47a";mx.fillRect(ex.x/(COLS*TILE)*mini.width,ex.y/(ROWS*TILE)*mini.height,Math.max(3,ex.w/(COLS*TILE)*mini.width),Math.max(3,ex.h/(ROWS*TILE)*mini.height));}
    mx.fillStyle="#f0d276";mx.beginPath();mx.arc(player.x/(COLS*TILE)*mini.width,player.y/(ROWS*TILE)*mini.height,3,0,Math.PI*2);mx.fill();
    if(neptune.hp>0&&currentArea.id!=="park"){mx.fillStyle="#e36d59";mx.beginPath();mx.arc(neptune.x/(COLS*TILE)*mini.width,neptune.y/(ROWS*TILE)*mini.height,3,0,Math.PI*2);mx.fill();}
  }
  function update(dt){
    if(gameState!=="play")return;worldTime+=dt;if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)el("toast").classList.remove("visible");}
    if(dialog){saveTimer+=dt;if(saveTimer>8){saveTimer=0;saveGame();}return;}movePlayer(dt);updateNeptune(dt);updateMinions(dt);
    if(player.hp<=0){loseGame();return;}
    if(neptune.state==="chase"&&currentArea.id==="rynek")el("chapter").textContent="ROZDZIAŁ 01 · UCIEKAJ";
    if(encounterStarted&&!questState.clue&&currentArea.id==="rynek"&&player.x<350&&player.y>270){questState.clue=true;player.clues++;updateObjective(1);toast("Znalazłeś rachunek: 0,37 zł. Neptun chce odsetki.");}
    if(questState.clue&&questState.coin&&player.items.includes("Gwizdek")&&!finaleReady){finaleReady=true;updateObjective(3);toast("Masz wszystko, żeby stawić czoła Neptunowi.");}
    saveTimer+=dt;if(saveTimer>8){saveTimer=0;saveGame();}updateHud();
  }
  function frame(now){const dt=Math.min(.04,(now-lastFrame)/1000||0);lastFrame=now;update(dt);if(player){drawGround();drawMinimap();}requestAnimationFrame(frame);}
  document.addEventListener("keydown",e=>{
    const k=e.key.toLowerCase();if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(k))e.preventDefault();
    keys.add(k);
    if(e.repeat&&(["e","enter","q","h","escape"].includes(k)||(dialog&&k===" ")))return;
    if(k==="escape"){if(gameState==="play"||gameState==="pause")pause();}
    if(k===" "||k==="spacebar"){if(dialog)advanceDialog();else doAttack();}
    if(k==="e"||k==="enter")interact();
    if(k==="q")doDodge();
    if(k==="h"&&gameState==="play"){const cover=currentArea.props.some(p=>p.type==="tree"&&Math.hypot(player.x-p.x,player.y-(p.y+4))<29)||currentArea.props.some(p=>p.type==="dumpster"&&player.x>p.x-20&&player.x<p.x+p.w+20&&player.y>p.y-20&&player.y<p.y+p.h+20);if(cover){player.hideRequested=!player.hideRequested;player.hidden=player.hideRequested;toast(player.hidden?"Jerzy wtopił się w otoczenie. Geniusz.":"Jerzy wyszedł z ukrycia.");}else toast("Znajdź drzewo albo kontener, żeby się schować.");}
  });
  document.addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));
  window.addEventListener("blur",()=>keys.clear());
  window.addEventListener("beforeunload",()=>{if(player)saveGame();});
  document.getElementById("start-button").addEventListener("click",()=>{audio();if(!loadGame()){currentArea=market;resetGame();}else{gameState="play";el("screen").classList.add("hidden");updateHud();toast("Wczytano zapis. Neptun nadal ma rachunek.");}if(!encounterStarted)showDialog("JERZY",["Rynek w Gliwicach. Spokojny poranek. Pachnie kawą, kostką brukową i lekkim niepokojem.","Nagle fontanna zaczyna bulgotać. Zdecydowanie nie jest to normalne bulgotanie."],()=>{});});
  el("pause-button").addEventListener("click",pause);el("resume-button").addEventListener("click",pause);
  el("reset-button").addEventListener("click",()=>{if(confirm("Na pewno zacząć od początku? Dotychczasowy zapis zostanie zastąpiony.")){localStorage.removeItem("gliwice-jerzy-save");currentArea=market;resetGame();}});
  el("again-button").addEventListener("click",()=>{localStorage.removeItem("gliwice-jerzy-save");currentArea=market;resetGame();});
  el("sound-toggle").addEventListener("click",()=>{muted=!muted;el("sound-toggle").textContent=muted?"♫̸":"♫";el("sound-toggle").title=muted?"Włącz dźwięk":"Wyłącz dźwięk";if(!muted){audio();startMusic();tone(660,.1,"square");}});
  updateObjective(0);updateHud();requestAnimationFrame(frame);
})();
