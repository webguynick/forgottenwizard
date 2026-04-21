/**
 * FORGOTTEN WIZARD — Tesla Lightning Engine
 * Realistic branching lightning that follows the mouse cursor
 * Canvas overlays the entire page
 */

(function () {
  'use strict';

  // ─── Canvas setup ────────────────────────────────────────────────
  const canvas = document.getElementById('lightning-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = window.innerWidth;
  let H = window.innerHeight;
  let scrollY = 0;

  function resize() {
    W = window.innerWidth;
    H = document.documentElement.scrollHeight;
    canvas.width = W;
    canvas.height = H;
    canvas.style.height = H + 'px';
  }
  resize();

  window.addEventListener('resize', () => {
    clearTimeout(window._rto);
    window._rto = setTimeout(resize, 150);
  });

  // ─── Mouse / touch tracking ───────────────────────────────────────
  let mouse = { x: W / 2, y: H / 2, active: false };

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY + window.scrollY;
    mouse.active = true;
  });

  window.addEventListener('touchmove', e => {
    const t = e.touches[0];
    mouse.x = t.clientX;
    mouse.y = t.clientY + window.scrollY;
    mouse.active = true;
  }, { passive: true });

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  // ─── Tesla Coil nodes ─────────────────────────────────────────────
  // These are the "source" terminals on the page (fixed positions)
  const coilNodes = [
    { x: W * 0.5, y: 0 },  // top center
  ];

  function updateCoilNodes() {
    coilNodes[0] = { x: W * 0.5, y: scrollY };
  }

  // ─── Lightning bolt generator ─────────────────────────────────────
  /**
   * Generate a jagged lightning path from (x1,y1) to (x2,y2)
   * Returns array of {x, y} points
   */
  function generateBolt(x1, y1, x2, y2, roughness = 0.45, depth = 0) {
    if (depth > 7) return [{ x: x1, y: y1 }, { x: x2, y: y2 }];

    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);

    // Perpendicular offset
    const offset = (Math.random() - 0.5) * len * roughness;
    const nx = -dy / len;
    const ny = dx / len;

    const midX = mx + nx * offset;
    const midY = my + ny * offset;

    const left = generateBolt(x1, y1, midX, midY, roughness * 0.65, depth + 1);
    const right = generateBolt(midX, midY, x2, y2, roughness * 0.65, depth + 1);

    return [...left, ...right];
  }

  // ─── Active bolts ─────────────────────────────────────────────────
  const bolts = [];
  let lastBoltTime = 0;
  let boltInterval = 80; // ms between new bolts

  class Bolt {
    constructor(sx, sy, tx, ty, options = {}) {
      this.points = generateBolt(sx, sy, tx, ty, options.roughness || 0.5);
      this.life = options.life || 1.0;
      this.decay = options.decay || (0.04 + Math.random() * 0.06);
      this.width = options.width || (1 + Math.random() * 1.5);
      this.color = options.color || 'rgba(100,200,255,';
      this.hasBranch = options.hasBranch !== false && Math.random() < 0.4;
      this.branches = [];

      if (this.hasBranch && this.points.length > 4) {
        const branchIdx = Math.floor(this.points.length * (0.3 + Math.random() * 0.4));
        const bp = this.points[branchIdx];
        const endX = bp.x + (Math.random() - 0.5) * 200;
        const endY = bp.y + Math.random() * 150;
        this.branches.push(new Bolt(bp.x, bp.y, endX, endY, {
          roughness: 0.6,
          life: this.life * 0.7,
          decay: this.decay * 1.4,
          width: this.width * 0.5,
          color: 'rgba(180,120,255,',
          hasBranch: false,
        }));
      }
    }

    draw(ctx) {
      if (this.life <= 0) return;

      // Glow pass
      ctx.save();
      ctx.globalAlpha = this.life * 0.4;
      ctx.shadowBlur = 18;
      ctx.shadowColor = `${this.color}1)`;
      ctx.strokeStyle = `${this.color}${this.life * 0.3})`;
      ctx.lineWidth = this.width * 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      this._drawPath(ctx);
      ctx.restore();

      // Core pass
      ctx.save();
      ctx.globalAlpha = this.life;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `${this.color}1)`;
      ctx.strokeStyle = `${this.color}${Math.min(1, this.life * 1.5)})`;
      ctx.lineWidth = this.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      this._drawPath(ctx);
      ctx.restore();

      // Hot white core
      ctx.save();
      ctx.globalAlpha = this.life * 0.8;
      ctx.strokeStyle = `rgba(255,255,255,${this.life * 0.6})`;
      ctx.lineWidth = this.width * 0.3;
      ctx.lineCap = 'round';
      this._drawPath(ctx);
      ctx.restore();

      this.branches.forEach(b => b.draw(ctx));
    }

    _drawPath(ctx) {
      if (this.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);
      for (let i = 1; i < this.points.length; i++) {
        ctx.lineTo(this.points[i].x, this.points[i].y);
      }
      ctx.stroke();
    }

    update() {
      this.life -= this.decay;
      this.branches.forEach(b => b.update());
    }

    isDead() {
      return this.life <= 0;
    }
  }

  // ─── Spark particles ──────────────────────────────────────────────
  const sparks = [];

  class Spark {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 2;
      this.life = 0.8 + Math.random() * 0.4;
      this.decay = 0.03 + Math.random() * 0.05;
      this.size = 1 + Math.random() * 2;
      this.color = Math.random() < 0.7 ? '100,200,255' : '180,120,255';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.15; // gravity
      this.vx *= 0.95;
      this.life -= this.decay;
    }

    draw(ctx) {
      if (this.life <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.life;
      ctx.shadowBlur = 6;
      ctx.shadowColor = `rgba(${this.color},1)`;
      ctx.fillStyle = `rgba(${this.color},${this.life})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    isDead() { return this.life <= 0; }
  }

  // ─── Ambient background arcs ──────────────────────────────────────
  // These fire periodically even without mouse movement
  function spawnAmbientBolt() {
    const sx = Math.random() * W;
    const sy = scrollY + Math.random() * H * 0.3;
    const tx = sx + (Math.random() - 0.5) * 300;
    const ty = sy + 80 + Math.random() * 200;
    bolts.push(new Bolt(sx, sy, tx, ty, {
      roughness: 0.6,
      life: 0.5 + Math.random() * 0.4,
      decay: 0.06 + Math.random() * 0.04,
      width: 0.5 + Math.random(),
      color: 'rgba(80,160,255,',
    }));
  }

  let ambientTimer = 0;

  // ─── Main animation loop ──────────────────────────────────────────
  let lastTime = 0;

  function animate(ts) {
    requestAnimationFrame(animate);

    const dt = ts - lastTime;
    lastTime = ts;

    updateCoilNodes();

    ctx.clearRect(0, 0, W, H);

    // Subtle full-canvas ambient pulse
    const ambientAlpha = 0.02 + 0.01 * Math.sin(ts * 0.001);
    ctx.fillStyle = `rgba(0,50,100,${ambientAlpha})`;
    ctx.fillRect(0, 0, W, H);

    // Spawn bolt from coil toward mouse
    if (mouse.active && ts - lastBoltTime > boltInterval) {
      lastBoltTime = ts;

      const coil = coilNodes[0];
      const dx = mouse.x - coil.x;
      const dy = mouse.y - coil.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Only shoot toward mouse if within a reasonable range
      if (dist > 60 && dist < 1800) {
        bolts.push(new Bolt(coil.x, coil.y, mouse.x, mouse.y, {
          roughness: 0.42,
          life: 0.9 + Math.random() * 0.1,
          decay: 0.05 + Math.random() * 0.04,
          width: 1.2 + Math.random() * 1.2,
          color: 'rgba(0,200,255,',
        }));

        // Spawn sparks at mouse
        if (Math.random() < 0.6) {
          for (let i = 0; i < 3 + Math.floor(Math.random() * 5); i++) {
            sparks.push(new Spark(mouse.x, mouse.y));
          }
        }
      }

      // Occasionally shoot a secondary bolt to a random nearby point
      if (Math.random() < 0.25) {
        const rx = mouse.x + (Math.random() - 0.5) * 300;
        const ry = mouse.y + (Math.random() - 0.5) * 200;
        bolts.push(new Bolt(mouse.x, mouse.y, rx, ry, {
          roughness: 0.55,
          life: 0.5 + Math.random() * 0.3,
          decay: 0.08,
          width: 0.6,
          color: 'rgba(180,100,255,',
          hasBranch: false,
        }));
      }
    }

    // Ambient bolts
    ambientTimer += dt;
    if (ambientTimer > 800 + Math.random() * 1200) {
      ambientTimer = 0;
      spawnAmbientBolt();
    }

    // Draw + update bolts
    for (let i = bolts.length - 1; i >= 0; i--) {
      bolts[i].draw(ctx);
      bolts[i].update();
      if (bolts[i].isDead()) bolts.splice(i, 1);
    }

    // Draw + update sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      sparks[i].draw(ctx);
      sparks[i].update();
      if (sparks[i].isDead()) sparks.splice(i, 1);
    }

    // Draw corona around mouse
    if (mouse.active) {
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 40);
      grad.addColorStop(0, 'rgba(0,200,255,0.12)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 40, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  requestAnimationFrame(animate);

  // ─── Hero coil mini-canvas ────────────────────────────────────────
  const heroCanvas = document.getElementById('hero-coil-canvas');
  if (heroCanvas) {
    const hctx = heroCanvas.getContext('2d');
    heroCanvas.width = 280;
    heroCanvas.height = 280;

    const heroBolts = [];
    let heroTimer = 0;
    let heroLast = 0;

    function heroAnimate(ts) {
      requestAnimationFrame(heroAnimate);
      hctx.clearRect(0, 0, 280, 280);

      const dt = ts - heroLast;
      heroLast = ts;
      heroTimer += dt;

      if (heroTimer > 120) {
        heroTimer = 0;
        const cx = 140, cy = 240; // coil base
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
        const len = 60 + Math.random() * 100;
        const tx = cx + Math.cos(angle) * len;
        const ty = cy + Math.sin(angle) * len;
        heroBolts.push(new Bolt(cx, cy, tx, ty, {
          roughness: 0.5,
          life: 0.8 + Math.random() * 0.2,
          decay: 0.07 + Math.random() * 0.05,
          width: 1.0 + Math.random(),
          color: 'rgba(0,200,255,',
        }));
      }

      for (let i = heroBolts.length - 1; i >= 0; i--) {
        heroBolts[i].draw(hctx);
        heroBolts[i].update();
        if (heroBolts[i].isDead()) heroBolts.splice(i, 1);
      }

      // Draw the coil shape
      drawTeslaCoil(hctx, 140, 280);
    }

    requestAnimationFrame(heroAnimate);
  }

  // ─── Tesla Coil SVG-style drawing ─────────────────────────────────
  function drawTeslaCoil(ctx, cx, bottom) {
    const top = 220;

    // Toroid (top ring)
    ctx.save();
    ctx.strokeStyle = 'rgba(0,200,255,0.7)';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 14;
    ctx.shadowColor = 'rgba(0,180,255,0.8)';
    ctx.beginPath();
    ctx.ellipse(cx, top - 20, 36, 12, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Secondary coil (spiral suggestion)
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 6;
    for (let i = 0; i < 8; i++) {
      const y = top + i * 6;
      const w = 8 + i * 2.5;
      ctx.beginPath();
      ctx.ellipse(cx, y, w, 3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Primary coil (base)
    ctx.strokeStyle = 'rgba(240,192,64,0.6)';
    ctx.shadowColor = 'rgba(240,192,64,0.6)';
    for (let i = 0; i < 4; i++) {
      const y = top + 50 + i * 5;
      const w = 26 + i * 3;
      ctx.beginPath();
      ctx.ellipse(cx, y, w, 4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Tower legs
    ctx.strokeStyle = 'rgba(80,120,160,0.5)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(cx - 16, top + 68);
    ctx.lineTo(cx - 24, bottom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 16, top + 68);
    ctx.lineTo(cx + 24, bottom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, top + 68);
    ctx.lineTo(cx, bottom);
    ctx.stroke();

    // Base platform
    ctx.strokeStyle = 'rgba(80,120,160,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 30, bottom - 2);
    ctx.lineTo(cx + 30, bottom - 2);
    ctx.stroke();

    ctx.restore();
  }

})();
