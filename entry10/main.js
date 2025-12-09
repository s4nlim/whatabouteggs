const cloudEl   = document.getElementById('cloud');
const shuffleEl = document.getElementById('shuffle');

/* ── 계란 관련 어휘 풀 ── */
const WORD_BANK = [
  // 핵심
  'egg','yolk','shell','white','albumen','chalaza','air cell','membrane','protein',
  // 조리법
  'omelet','scramble','sunny-side','over-easy','over-medium','over-hard',
  'poach','steam','coddled','soft-boiled','hard-boiled','deviled',
  'frittata','quiche','shakshuka','tamago','ramen egg','ajitama',
  // 소스/에멀전
  'hollandaise','mayonnaise','aioli','carbonara','custard','curdle','temper','emulsify',
  // 질감/상태
  'runny','jammy','set','silky','fluffy','foamy','stiff peaks','meringue','soufflé',
  // 곁들임
  'bacon','ham','spinach','mushroom','cheese','truffle','avocado','toast',
  // 조미/재료
  'salt','pepper','paprika','chives','butter','cream','milk','garlic','onion',
  // 생산/등급
  'farm','free-range','cage-free','organic','pasture','grade A','carton','dozen','hen','chicken','duck','quail','nest','coop',
  // 다국어
  '계란','달걀','卵','たまご','蛋','ไข่','trứng','itlog','telur','uovo','ovo','huevo','oeuf','ei',
  // 행사/장식
  'easter','dye','paint','decorate','pastel','hunt','basket',
];

/* ── 단어 가방 생성: 큰·중간·작은 단어 비율을 통해 크기 차이 확대 ── */
function makeBag() {
  const pick = (n) => Array.from({length:n}, () => WORD_BANK[Math.floor(Math.random()*WORD_BANK.length)]);
  const BIG    = ['egg','yolk','shell','omelet','scramble','sunny-side','benedict','poach'];
  const bag = [];
  // BIG 단어는 많이 반복 → 크게
  for (const w of BIG) for (let i=0;i<Math.floor(24+Math.random()*18);i++) bag.push(w);
  // MID 단어들
  for (const w of pick(60))  for (let i=0;i<Math.floor(6+Math.random()*7);i++) bag.push(w);
  // SMALL 단어들
  for (const w of pick(140)) for (let i=0;i<Math.floor(1+Math.random()*3);i++) bag.push(w);
  return bag;
}

/* ── 카운트 → [{text,size}] ── */
function tokens(wordsArray){
  const m = new Map();
  for (const w of wordsArray) m.set(w, (m.get(w)||0)+1);
  return Array.from(m, ([text,size])=>({text,size}));
}

/* ── 노란색 팔레트: hue 42~58, sat 75~95%, light 38~62% ── */
function yellowColor(text){
  let h=0; for (let i=0;i<text.length;i++) h=(h*31 + text.charCodeAt(i))>>>0;
  const hue = 42 + (h % 17);                 // 42..58
  const sat = 75 + (h % 21);                 // 75..95
  const lit = 38 + (Math.floor(h/7) % 25);   // 38..62
  return `hsl(${hue} ${sat}% ${lit}%)`;
}

/* ── 0° 또는 90° 회전 ── */
const rotate = () => (Math.random() < 0.5 ? 0 : 90);

/* ── 렌더 ── */
function build(shuffle=false){
  // 레이아웃 크기(화면 가득)
  const rect = cloudEl.getBoundingClientRect();
  let width  = Math.floor(rect.width || window.innerWidth);
  let height = Math.floor(rect.height || (window.innerHeight - (document.querySelector('.bar')?.offsetHeight||0)));

  // 단어 데이터(유니크 약 120개로 제한)
  let data = tokens(makeBag())
    .sort((a,b)=> d3.descending(a.size,b.size))
    .slice(0, 120);
  if (shuffle) data = data.sort(()=>Math.random()-0.5);

  // 크기 스케일: 큰 단어는 훨씬 크게, 작은 단어도 너무 작지 않게
  const counts = data.map(d => d.size);
  const shorter = Math.min(width, height);
  const MAX = Math.max(64, Math.round(shorter * 0.25));   // 크게
  const MIN = Math.max(20, Math.round(MAX * 0.28));       // 하한
  const sizeScale = d3.scalePow()
    .exponent(0.43)                                      // 변동폭 크게
    .domain([d3.min(counts), d3.max(counts)])
    .range([MIN, MAX]);

  const layout = d3.layout.cloud()
    .size([width, height])
    .words(data)
    .padding(1)
    .rotate(rotate)
    .font("Hanken Grotesk")
    .fontSize(d => sizeScale(d.size));

  layout.on("end", words => {
    cloudEl.innerHTML = "";
    const svg = d3.create("svg")
      .attr("viewBox", [0,0,width,height])
      .attr("font-family", "Hanken Grotesk")
      .attr("text-anchor", "middle")
      .attr("width", width)
      .attr("height", height)
      .style("display","block");

    svg.append("g")
      .attr("transform", `translate(${width/2},${height/2})`)
      .selectAll("text")
      .data(words)
      .enter().append("text")
        .attr("font-size", d => d.size)
        .attr("fill", d => yellowColor(d.text))
        .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
        .text(d => d.text);

    cloudEl.appendChild(svg.node());
  });

  layout.start();
}

/* ── UI ── */
shuffleEl.addEventListener('click', ()=> build(true));
window.addEventListener('load', build);
window.addEventListener('resize', ()=> build(true));