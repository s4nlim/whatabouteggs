let flock;

function setup() {
  createCanvas(windowWidth, windowHeight);   // 풀스크린
  flock = new Flock();

  // 초기 보이드
  for (let i = 0; i < 100; i++) {
    flock.addBoid(new Boid(width/2, height/2));
  }
}

function draw() {
  // 살짝 그레인 있는 느낌의 어두운 배경
  background(8, 8, 12);
  flock.run();
}

// 창 크기 변경 시 캔버스 꽉 채우기 유지
function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}

// 드래그로 병아리 추가
function mouseDragged() {
  flock.addBoid(new Boid(mouseX, mouseY));
}

/* ============= Flock ============= */
class Flock{
  constructor(){ this.boids = []; }
  run(){ for (const b of this.boids) b.run(this.boids); }
  addBoid(b){ this.boids.push(b); }
}

/* ============= Boid ============= */
class Boid{
  constructor(x, y){
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.position = createVector(x, y);

    // 사이즈/물리 파라미터
    this.base = 15;                 // 기본 크기 스케일
    this.scale = random(0.85, 1.25);
    this.maxSpeed = 3;
    this.maxForce = 0.05;
  }

  run(boids){
    this.flock(boids);
    this.update();
    this.borders();
    this.renderChickTop();
  }

  applyForce(f){ this.acceleration.add(f); }

  flock(boids){
    const sep = this.separate(boids).mult(1.5);
    const ali = this.align(boids).mult(1.0);
    const coh = this.cohesion(boids).mult(1.0);
    this.applyForce(sep); this.applyForce(ali); this.applyForce(coh);
  }

  update(){
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  seek(target){
    const desired = p5.Vector.sub(target, this.position).normalize().mult(this.maxSpeed);
    const steer = p5.Vector.sub(desired, this.velocity).limit(this.maxForce);
    return steer;
  }

  // 화면 래핑
  borders(){
    const s = this.base;
    if (this.position.x < -s) this.position.x = width + s;
    if (this.position.y < -s) this.position.y = height + s;
    if (this.position.x > width + s) this.position.x = -s;
    if (this.position.y > height + s) this.position.y = -s;
  }

  // Separation
  separate(boids){
    const desired = 25, steer = createVector(0,0); let count = 0;
    for (const o of boids){
      const d = p5.Vector.dist(this.position, o.position);
      if (d > 0 && d < desired){
        const diff = p5.Vector.sub(this.position, o.position).normalize().div(d);
        steer.add(diff); count++;
      }
    }
    if (count > 0) steer.div(count);
    if (steer.mag() > 0){
      steer.normalize().mult(this.maxSpeed).sub(this.velocity).limit(this.maxForce);
    }
    return steer;
  }

  // Alignment
  align(boids){
    const nd = 50; let sum = createVector(0,0), count = 0;
    for (const o of boids){
      const d = p5.Vector.dist(this.position, o.position);
      if (d > 0 && d < nd){ sum.add(o.velocity); count++; }
    }
    if (count > 0){
      sum.div(count).normalize().mult(this.maxSpeed);
      return p5.Vector.sub(sum, this.velocity).limit(this.maxForce);
    }
    return createVector(0,0);
  }

  // Cohesion
  cohesion(boids){
    const nd = 50; let sum = createVector(0,0), count = 0;
    for (const o of boids){
      const d = p5.Vector.dist(this.position, o.position);
      if (d > 0 && d < nd){ sum.add(o.position); count++; }
    }
    if (count > 0){ sum.div(count); return this.seek(sum); }
    return createVector(0,0);
  }

  // ===== 병아리(탑뷰) 렌더 =====
  renderChickTop(){
    // 이동 방향으로 회전 (위쪽이 전방)
    const heading = this.velocity.heading() + HALF_PI;
    const r = this.base * this.scale;        // 몸통 반지름
    const body = color(255, 220, 70);        // 노란 바디
    const wing = color(255, 235, 120);       // 살짝 밝은 날개
    const beak = color(255, 156, 32);        // 주황 부리
    const eye  = color(30);                  // 검정 눈

    push();
    translate(this.position.x, this.position.y);
    rotate(heading);
    noStroke();

    // 바닥 그림자
    fill(0, 40);
    ellipse(0, r*0.35, r*1.4, r*0.6);

    // 날개 (좌우 타원)
    fill(wing);
    ellipse(-r*0.6, 0, r*0.9, r*0.55);
    ellipse( r*0.6, 0, r*0.9, r*0.55);

    // 몸통
    fill(body);
    circle(0, 0, r*2);

    // 부리 (전방 삼각형)
    fill(beak);
    triangle(0, -r*1.05,  -r*0.18, -r*0.55,  r*0.18, -r*0.55);

    // 눈 (전방 근처 작은 점)
    fill(eye);
    circle(-r*0.28, -r*0.55, r*0.18);
    circle( r*0.28, -r*0.55, r*0.18);

    pop();
  }
}
