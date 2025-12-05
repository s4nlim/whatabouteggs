/* ===== config ===== */
const GRID = 15;          // 그리드 크기(정사각)
const FPS = 9;           // 속도
const START_LEN = 5;      // 시작 길이
const EGG_R = 0.4;        // 알 반지름(그리드 단위)
const SNAKE_W = 0.65;     // 뱀 두께(그리드 단위)

/* ===== state ===== */
let started = false;
let dir = 'right', nextDir = 'right';
let seg = [];             // 뱀 몸통(벡터 배열)
let fruit;                // 과일 위치(벡터)
let score = 0, high = 0;

/* ===== DOM ===== */
const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const highEl  = document.getElementById('high');
function hud(){ scoreEl.textContent = score; highEl.textContent = high; }
function css(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
function opp(a,b){ return (a==='left'&&b==='right')||(a==='right'&&b==='left')||(a==='up'&&b==='down')||(a==='down'&&b==='up'); }

/* ===== p5 ===== */
function setup(){
  const side = boardEl.clientWidth;
  createCanvas(side, side).parent('board');
  frameRate(FPS);

  try { high = +localStorage.getItem('snakeHigh') || 0; } catch {}
  hud();
  noLoop();               // 클릭/키 입력 전까지 정지
}

function windowResized(){
  const side = boardEl.clientWidth;
  resizeCanvas(side, side);
  if(!started) redraw();
}


function draw(){
  background(0);

  // 그리드 좌표계
  const unit = width / GRID;
  scale(unit, unit);
  translate(0.5, 0.5);

  // 아직 시작 전이면 안내 텍스트만 그리고 종료
  if (!started) {
    textFont('Hanken Grotesk');
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(0.9);      // 그리드 단위
    textLeading(1.3);
    text('Click to play.\nUse arrow keys to move.', GRID/2, GRID/2);
    noLoop();
    return;
  }

  // 과일(작게)
  stroke(180); strokeWeight(0.4); 
  fill(css('--egg') || '#ffe16b'); 
  circle(fruit.x, fruit.y, EGG_R * 2);

  // 뱀
  noFill();
  stroke(css('--snake') || '#4CAF50');
  strokeCap(ROUND);
  strokeWeight(SNAKE_W);
  beginShape(); for (const v of seg) vertex(v.x, v.y); endShape();

  // 한 칸 이동
  if(!opp(dir, nextDir)) dir = nextDir;
  seg.pop();
  const h = seg[0].copy();
  seg.unshift(h);
  if (dir==='right') h.x++; else if (dir==='left') h.x--;
  else if (dir==='up') h.y--; else h.y++;

  // 충돌
const head = seg[0];
if (
  head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID ||
  seg.slice(1).some(v => v.equals(head))
){
  gameOver();
  return;
}

  // 먹음
  if (head.equals(fruit)){
    score++; hud();
    seg.push(seg[seg.length-1].copy());
    placeFruit();
  }
}

function startGame(){
  // 가운데 줄에서 오른쪽을 향해 시작
  seg = [];
  const y = Math.floor(GRID/2);
  for(let x=2; x<2+START_LEN; x++) seg.unshift(createVector(x, y));
  dir = nextDir = 'right';
  score = 0; hud();
  placeFruit();
  started = true;
  loop();
}

function placeFruit(){
  let v;
  do { v = createVector(Math.floor(random(GRID)), Math.floor(random(GRID))); }
  while (seg.some(s=>s.equals(v)));
  fruit = v;
}

function gameOver(){
  high = Math.max(high, score);
  try { localStorage.setItem('snakeHigh', String(high)); } catch {}
  hud();
  textFont('Hanken Grotesk');
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(0.9);
  textLeading(1.3);
  text(`GAME OVER
Your score: ${score}
High score: ${high}
Click to play again.`, GRID/2, GRID/2);

  started = false;
  noLoop();
}

/* ===== controls ===== */
// 클릭으로 시작
function mousePressed(){ if(!started) startGame(); }

// 화살표 키
window.addEventListener('keydown', e=>{
  const m = {ArrowLeft:'left', ArrowRight:'right', ArrowUp:'up', ArrowDown:'down'};
  if (m[e.key]){
    e.preventDefault();
    nextDir = m[e.key];
    if(!started) startGame();
  }
});

// 모바일 D-pad
document.querySelectorAll('[data-dir]').forEach(btn=>{
  const d = btn.dataset.dir;
  const go = ev => { ev.preventDefault(); nextDir = d; if(!started) startGame(); loop(); };
  btn.addEventListener('click', go);
  btn.addEventListener('touchstart', go, {passive:false});
});

