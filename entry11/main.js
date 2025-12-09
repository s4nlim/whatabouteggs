/* ---------- assets & recipes ---------- */
const SRC = {
  egg:        "imgs/egg.png",
  clock:      "imgs/clock.png",
  fire:       "imgs/fire.png",
  chicken:    "imgs/chicken.png",
  sunnyside:  "imgs/sunnysideup.png",
  fried:      "imgs/friedchicken.png",
  chick:      "imgs/chick.png"
};

// 순서 무관 레시피
const RECIPES = {
  "egg+fire":     { type:"sunnyside" },
  "chicken+fire": { type:"fried" },
  "clock+egg":    { type:"chick" },
  "chick+clock":  { type:"chicken" }
};
const keyFor = (a,b)=>[a,b].sort().join("+");

/* ---------- helpers ---------- */
function overlaps($a, $b){
  const a = $a.offset(), aw = $a.outerWidth(), ah = $a.outerHeight();
  const b = $b.offset(), bw = $b.outerWidth(), bh = $b.outerHeight();
  return !(a.left+aw < b.left || a.left > b.left+bw || a.top+ah < b.top || a.top > b.top+bh);
}
function center($el){
  const r = $el[0].getBoundingClientRect();
  return { x: r.left + r.width/2, y: r.top + r.height/2 };
}

/* ---------- spawn piece (좌표 미지정 시: 스테이지 정중앙) ---------- */
function spawn(type, x=null, y=null){
  const $stage = $(".stage");
  const stageRect = $stage[0].getBoundingClientRect();
  const defaultX = stageRect.left + stageRect.width / 2;
  const defaultY = stageRect.top  + stageRect.height / 2;

  const left = (x ?? defaultX) - 80;
  const top  = (y ?? defaultY) - 80;

  const $img = $(`<img class="piece pop" draggable="false" alt="${type}">`)
    .attr("src", SRC[type])
    .attr("data-type", type)
    .css({ position:'absolute', left, top, width:'140px', userSelect:'none', pointerEvents:'auto' });

  $stage.append($img);
  makeDraggable($img);
  return $img;
}

/* ---------- draggable with merge ---------- */
function makeDraggable($el){
  $el.draggable({
    containment:"window",
    scroll:false,
    stop:function(){
      const $me = $(this);
      const tMe = $me.data("type");
      const $others = $(".piece").not($me);

      for(const other of $others){
        const $o = $(other);
        if(!overlaps($me, $o)) continue;

        const tOther = $o.data("type");
        const recipe = RECIPES[keyFor(tMe, tOther)];
        if(!recipe) continue;

        // 합성 위치 = 두 이미지 중심의 평균
        const c1 = center($me), c2 = center($o);
        const cx = (c1.x + c2.x) / 2;
        const cy = (c1.y + c2.y) / 2;

        $me.fadeOut(120, ()=> $me.remove());
        $o.fadeOut(120, ()=> $o.remove());
        spawn(recipe.type, cx, cy);
        break; // 한 번만 처리
      }
    }
  });
}

/* ---------- init ---------- */
$(function(){
  // HTML에 이미 있는 조각들도 드래그 가능하게
  $(".piece").each(function(){ makeDraggable($(this)); });

  // 왼쪽 툴바: egg/clock/fire 스폰
  $(".btn.add").on("click", function(){
    const type = $(this).data("spawn");
    // 버튼 오른쪽에 살짝
    const off = $(this).offset();
    spawn(type, off.left + $(this).outerWidth() + 60, off.top + 10);
  });

  // Reset: egg + clock + fire만 남기고 재배치 (버그fix: fire의 data-type)
  $("#reset").on("click", function(){
    $(".piece").remove();
    const $stage = $(".stage");
    const rect = $stage[0].getBoundingClientRect();

    const $egg   = $(`<img class="piece" data-type="egg"    src="${SRC.egg}"    alt="egg">`)
      .css({ position:'absolute', left: rect.width*0.18, top: rect.height*0.18 });
    const $clock = $(`<img class="piece" data-type="clock"  src="${SRC.clock}"  alt="clock">`)
      .css({ position:'absolute', left: rect.width*0.62, top: rect.height*0.54 });
    const $fire  = $(`<img class="piece" data-type="fire"   src="${SRC.fire}"   alt="fire">`)
      .css({ position:'absolute', left: rect.width*0.30, top: rect.height*0.60 });

    $stage.append($egg, $clock, $fire);
    makeDraggable($egg); makeDraggable($clock); makeDraggable($fire);
  });
});

function spawn(type, x=null, y=null){
  const $stage = $(".stage");
  const rect = $stage[0].getBoundingClientRect();

  // 일단 (0,0)에 붙였다가 다음 프레임에 실제 크기로 중앙 보정
  const $img = $(`<img class="piece pop" draggable="false" alt="${type}">`)
    .attr("src", SRC[type])
    .attr("data-type", type)
    .css({ position:'absolute', left:0, top:0, userSelect:'none', pointerEvents:'auto' });

  $stage.append($img);

  // 좌표 없으면 스테이지 정중앙, 있으면 해당 좌표
  const cx = (x ?? rect.left + rect.width/2);
  const cy = (y ?? rect.top  + rect.height/2);

  // 이미지 실제 너비/높이 로드 후 중앙 보정
  requestAnimationFrame(() => {
    const w = $img.outerWidth(), h = $img.outerHeight();
    $img.css({
      left: cx - rect.left - w/2,
      top:  cy - rect.top  - h/2
    });
  });

  makeDraggable($img);
  return $img;
}


function makeDraggable($el){
  $el.draggable({
    containment:"window",
    scroll:false,
    stop:function(){
      const $me = $(this);
      const tMe = $me.data("type");
      const $others = $(".piece").not($me);

      for(const other of $others){
        const $o = $(other);
        if(!overlaps($me, $o)) continue;

        const tOther = $o.data("type");
        const recipe = RECIPES[keyFor(tMe, tOther)];
        if(!recipe) continue;

        // 합성 위치(중간점)
        const a = $me.offset(), b = $o.offset();
        const cx = (a.left + $me.width()/2 + b.left + $o.width()/2) / 2;
        const cy = (a.top  + $me.height()/2 + b.top  + $o.height()/2) / 2;

        $me.fadeOut(120, ()=> $me.remove());
        $o.fadeOut(120, ()=> $o.remove());

        // 결과 스폰 + 알림
        spawn(recipe.type, cx, cy);
        alert(`You just made a ${nameOf(recipe.type)}.`);
        break;
      }
    }
  });
}

// 보기 좋은 이름 매핑
function nameOf(t){
  const map = {
    sunnyside: "sunny-side egg",
    fried:     "fried chicken",
    chick:     "chick",
    chicken:   "chicken",
    egg:       "egg",
    clock:     "clock",
    fire:      "fire"
  };
  return map[t] || t;
}
