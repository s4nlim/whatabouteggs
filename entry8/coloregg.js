// DOM
const root           = document.documentElement;
const hueInput       = document.getElementById('hue');
const goBtn          = document.getElementById('go');
const againBtn       = document.getElementById('again');
const eggImg         = document.querySelector('.egg');
const resultOverlay  = document.querySelector('.result');
const colorNameSpan  = document.getElementById('colorName');

// slider → hue
const STOPS = [
  {pos: 0,   hue:   0},
  {pos: 50,  hue:  60},
  {pos: 60,  hue: 120},
  {pos: 70,  hue: 180},
  {pos: 80,  hue: 240},
  {pos: 90,  hue: 300},
  {pos: 100, hue: 360}
];

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

function mapPosToHue(p){
  p = clamp(Number(p), 0, 100);
  for (let i=0; i<STOPS.length-1; i++){
    const a = STOPS[i], b = STOPS[i+1];
    if (p >= a.pos && p <= b.pos){
      const t = (p - a.pos) / Math.max(1, (b.pos - a.pos));
      return a.hue + (b.hue - a.hue) * t;
    }
  }
  return 0;
}

function getSliderPercent(){
  const min = +(hueInput.min || 0);
  const max = +(hueInput.max || 100);
  return ((+hueInput.value - min) / Math.max(1, (max - min))) * 100;
}

function setHue(h){ root.style.setProperty('--h', h); }
function applyFromSlider(){ setHue( mapPosToHue(getSliderPercent()) ); }

applyFromSlider();
hueInput.addEventListener('input', applyFromSlider);

// hue → name 
function hueToName(h){
  h = ((Number(h) % 360) + 360) % 360;
  if (h < 15 || h >= 345) return 'red';
  if (h < 45)  return 'orange';
  if (h < 65)  return 'yellow';
  if (h < 95)  return 'lime';
  if (h < 150) return 'green';;
  if (h < 220) return 'cyan';
  if (h < 260) return 'blue';
  if (h < 300) return 'purple';
  return 'pink';
}

// Frame Sequence
const FRAME_DIR    = 'imgs/';
const FRAME_PREFIX = 'eggdrop';
const FRAME_EXT    = '.png';
const FRAME_COUNT  = 13;
const FPS          = 4;

const frameSrcs = Array.from({length: FRAME_COUNT}, (_, i) =>
  `${FRAME_DIR}${FRAME_PREFIX}${i+1}${FRAME_EXT}`
);


// 재생 컨트롤 
let playing = false;
let timerId = null;

function stop(showOverlay = false) {
  if (timerId) { clearInterval(timerId); timerId = null; }
  playing = false;
  goBtn.disabled = false;
  resultOverlay.hidden = !showOverlay;   // true면 오버레이 표시
  if (!showOverlay) eggImg.src = frameSrcs[0];
}

goBtn.addEventListener('click', () => {
  if (playing) return;
  playing = true;
  goBtn.disabled = true;

  // 현재 슬라이더 값 → hue → 이름
  colorNameSpan.textContent = hueToName( mapPosToHue( getSliderPercent() ) );

  let i = 0;
  eggImg.src = frameSrcs[0];

  timerId = setInterval(() => {
    i++;
    if (i >= FRAME_COUNT) return stop(true);  // 애니 끝 → 결과 표시
    eggImg.src = frameSrcs[i];
  }, 1000 / FPS);
});

againBtn?.addEventListener('click', () => stop(false));