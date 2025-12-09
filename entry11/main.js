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
  "egg+fire":     {type:"sunnyside"},
  "chicken+fire": {type:"fried"},
  "clock+egg":    {type:"chick"},
  "chick+clock":  {type:"chicken"}
};
const keyFor = (a,b)=>[a,b].sort().join("+");

/* ---------- helpers ---------- */
function overlaps($a, $b){
  const a = $a.offset(), aw = $a.outerWidth(), ah = $a.outerHeight();
  const b = $b.offset(), bw = $b.outerWidth(), bh = $b.outerHeight();
  return !(a.left+aw < b.left || a.left > b.left+bw || a.top+ah < b.top || a.top > b.top+bh);
}
function uid(prefix){ return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`; }
function rand(min,max){ return Math.random()*(max-min)+min; }

/* ---------- spawn piece ---------- */
function spawn(type, x=null, y=null){
  const id = uid(type);
  const $img = $(`<img class="piece pop" data-id="${id}" data-type="${type}" alt="${type}">`)
    .attr("src", SRC[type]);

  // 위치 지정 없으면 화면 중앙 근처 랜덤
  const W = $(window).width(), H = $(window).height();
  const left = (x ?? rand(W*0.35, W*0.6)) - 80;
  const top  = (y ?? rand(H*0.35, H*0.6)) - 80;
  $img.css({left, top});

  $(".stage").append($img);
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
        if(overlaps($me, $o)){
          const tOther = $o.data("type");
          const recipe = RECIPES[keyFor(tMe, tOther)];
          if(recipe){
            // spawn result at midpoint
            const a = $me.offset(), b = $o.offset();
            const cx = a.left + ($me.width()/2 + b.left + $o.width()/2 - a.left)/2;
            const cy = a.top  + ($me.height()/2 + b.top  + $o.height()/2 - a.top )/2;

            $me.fadeOut(120, ()=> $me.remove());
            $o.fadeOut(120, ()=> $o.remove());
            spawn(recipe.type, cx, cy);
          }
          break;
        }
      }
    }
  });
}

/* ---------- init ---------- */
$(function(){
  // 기존 두 개(HTML에 이미 있음)도 드래그 가능하게
  $(".piece").each(function(){ makeDraggable($(this)); });

  // 왼쪽 툴바: egg/clock 스폰
  $(".btn.add").on("click", function(){
    const type = $(this).data("spawn");
    // 버튼에서 살짝 오른쪽으로
    const off = $(this).offset();
    spawn(type, off.left + $(this).outerWidth() + 60, off.top + 10);
  });

  // Reset: egg + clock만 남기고 전부 제거/재배치
  $("#reset").on("click", function(){
    $(".piece").remove();
    const $egg   = $(`<img class="piece" data-type="egg" src="${SRC.egg}"   alt="egg">`).css({left:"18vw", top:"18vh"});
    const $clock = $(`<img class="piece" data-type="clock" src="${SRC.clock}" alt="clock">`).css({left:"62vw", top:"54vh"});
    const $fire = $(`<img class="piece" data-type="clock" src="${SRC.fire}" alt="clock">`).css({left:"30vw", top:"60vh"});
    $(".stage").append($egg, $clock, $fire);
    makeDraggable($egg); makeDraggable($clock); makeDraggable($fire);
  });
});
