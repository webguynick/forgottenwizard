/**
 * FORGOTTEN WIZARD — Main JS
 * UI interactions: nav, quotes rotator, scroll effects, cursor glow, counter
 */

(function () {
  'use strict';

  // ─── Mobile nav ────────────────────────────────────────────────────
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks = document.querySelector('.nav__links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', navLinks.classList.contains('open'));
    });

    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => navLinks.classList.remove('open'));
    });
  }

  // ─── Cursor glow ───────────────────────────────────────────────────
  const cursorGlow = document.getElementById('cursor-glow');
  let glowX = 0, glowY = 0, curX = 0, curY = 0;

  window.addEventListener('mousemove', e => {
    glowX = e.clientX;
    glowY = e.clientY;
  });

  function animateCursor() {
    curX += (glowX - curX) * 0.08;
    curY += (glowY - curY) * 0.08;
    if (cursorGlow) {
      cursorGlow.style.left = curX + 'px';
      cursorGlow.style.top = curY + 'px';
    }
    requestAnimationFrame(animateCursor);
  }
  requestAnimationFrame(animateCursor);

  // ─── Quote rotator ─────────────────────────────────────────────────
  const quotes = [
    {
      text: "The present is theirs; the future, for which I really worked, is mine.",
      attr: "Nikola Tesla"
    },
    {
      text: "If you only knew the magnificence of the 3, 6 and 9, then you would have a key to the universe.",
      attr: "Nikola Tesla"
    },
    {
      text: "My brain is only a receiver. In the Universe there is a core from which we obtain knowledge, strength, inspiration.",
      attr: "Nikola Tesla"
    },
    {
      text: "The day science begins to study non-physical phenomena, it will make more progress in one decade than in all previous centuries.",
      attr: "Nikola Tesla"
    },
    {
      text: "I do not think there is any thrill that can go through the human heart like that felt by the inventor when he sees some creation of the brain unfolding to success.",
      attr: "Nikola Tesla"
    }
  ];

  let currentQuote = 0;
  const quoteText = document.getElementById('quote-text');
  const quoteDots = document.querySelectorAll('.quote__dot');

  function setQuote(idx) {
    if (!quoteText) return;
    currentQuote = idx;
    quoteText.style.opacity = '0';
    setTimeout(() => {
      quoteText.textContent = `"${quotes[idx].text}"`;
      quoteText.style.opacity = '1';
    }, 300);

    quoteDots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  quoteDots.forEach((dot, i) => {
    dot.addEventListener('click', () => setQuote(i));
  });

  setQuote(0);
  setInterval(() => {
    setQuote((currentQuote + 1) % quotes.length);
  }, 6000);

  if (quoteText) {
    quoteText.style.transition = 'opacity 0.3s ease';
  }

  // ─── Animated stat counters ────────────────────────────────────────
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = Math.floor(ease * target);
      el.textContent = val.toLocaleString() + (el.dataset.suffix || '');
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  // ─── Newsletter form ───────────────────────────────────────────────
  const form = document.querySelector('.newsletter__form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input.value.includes('@')) {
        input.style.borderColor = 'rgba(255,80,80,0.6)';
        return;
      }
      const btn = form.querySelector('button');
      if (btn) {
        btn.textContent = 'Welcome to the Lab! ⚡';
        btn.disabled = true;
        btn.style.opacity = '0.7';
      }
      input.value = '';
    });
  }

  // ─── Nav scroll state ──────────────────────────────────────────────
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    if (nav) {
      nav.style.background = window.scrollY > 50
        ? 'rgba(5,5,8,0.97)'
        : 'linear-gradient(to bottom, rgba(5,5,8,0.95), rgba(5,5,8,0))';
    }
  });

  // ─── Canvas resize on scroll height change ────────────────────────
  let prevHeight = document.documentElement.scrollHeight;
  setInterval(() => {
    const h = document.documentElement.scrollHeight;
    if (h !== prevHeight) {
      prevHeight = h;
      const lc = document.getElementById('lightning-canvas');
      if (lc) {
        lc.height = h;
        lc.style.height = h + 'px';
      }
    }
  }, 500);

})();

// ─── Scroll Progress Bar ────────────────────────────────────────────
(function() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  function updateProgress() {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
})();

// ─── IntersectionObserver for .fade-in elements ─────────────────────
(function() {
  if (!('IntersectionObserver' in window)) return;
  const fadeEls = document.querySelectorAll('.fade-in');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  fadeEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    obs.observe(el);
  });
})();

// ─── FAQ smooth open animation ──────────────────────────────────────
document.querySelectorAll('.faq-item').forEach(item => {
  item.addEventListener('toggle', () => {
    if (item.open) {
      const a = item.querySelector('.faq-item__a');
      if (a) {
        a.style.animation = 'faq-open 0.3s ease forwards';
      }
    }
  });
});

// ─── Mini Embedded Game (homepage section) ──────────────────────────
(function() {
  const miniCanvas = document.getElementById('mini-game-canvas');
  if (!miniCanvas) return;
  const mctx = miniCanvas.getContext('2d');
  const hint = document.getElementById('game-hint');
  let mBolts = [], mSparks = [];
  let mMouse = { x: 0, y: 0, active: false };
  let mLastTime = 0, mAmbient = 0, mHintShown = true;

  function resizeMini() {
    const wrap = miniCanvas.parentElement;
    miniCanvas.width = wrap.offsetWidth;
    miniCanvas.height = wrap.offsetHeight;
  }
  resizeMini();
  window.addEventListener('resize', resizeMini);

  miniCanvas.addEventListener('mousemove', e => {
    const r = miniCanvas.getBoundingClientRect();
    mMouse.x = (e.clientX - r.left) * (miniCanvas.width / r.width);
    mMouse.y = (e.clientY - r.top) * (miniCanvas.height / r.height);
    mMouse.active = true;
    if (mHintShown) { hint.style.opacity = '0'; mHintShown = false; }
  });
  miniCanvas.addEventListener('mouseleave', () => { mMouse.active = false; });

  miniCanvas.addEventListener('click', () => fireMini());
  miniCanvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.touches[0];
    const r = miniCanvas.getBoundingClientRect();
    mMouse.x = (t.clientX - r.left) * (miniCanvas.width / r.width);
    mMouse.y = (t.clientY - r.top) * (miniCanvas.height / r.height);
    mMouse.active = true;
    hint.style.opacity = '0'; mHintShown = false;
    fireMini();
  }, { passive: false });

  function genBolt(x1,y1,x2,y2,r=0.45,d=0){
    if(d>7)return[{x:x1,y:y1},{x:x2,y:y2}];
    const mx=(x1+x2)/2,my=(y1+y2)/2,dx=x2-x1,dy=y2-y1;
    const len=Math.sqrt(dx*dx+dy*dy);
    const off=(Math.random()-0.5)*len*r;
    const nx=-dy/len,ny=dx/len;
    return [...genBolt(x1,y1,mx+nx*off,my+ny*off,r*0.65,d+1),
            ...genBolt(mx+nx*off,my+ny*off,x2,y2,r*0.65,d+1)];
  }

  function fireMini() {
    const W=miniCanvas.width, H=miniCanvas.height;
    const cx=W/2, coilY=H*0.75;
    const tx = mMouse.active ? mMouse.x : cx+(Math.random()-0.5)*W*0.6;
    const ty = mMouse.active ? mMouse.y : H*0.1+Math.random()*H*0.4;
    const pts = genBolt(cx,coilY,tx,ty);
    mBolts.push({pts,life:1,decay:0.05+Math.random()*0.04,w:1.5+Math.random()});
    for(let i=0;i<6;i++) {
      const a=Math.random()*Math.PI*2, s=1+Math.random()*4;
      mSparks.push({x:tx,y:ty,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2,life:0.8,decay:0.03+Math.random()*0.04,sz:1+Math.random()*2});
    }
  }

  function drawMiniCoil(ts) {
    const W=miniCanvas.width, H=miniCanvas.height;
    const cx=W/2, baseY=H*0.88, topY=H*0.55;
    const toroidRx=W*0.06, toroidRy=toroidRx*0.3;
    const toroidY=topY-toroidRy;

    // Grid
    mctx.strokeStyle='rgba(0,80,120,0.1)';
    mctx.lineWidth=1;
    const sp=50;
    for(let x=0;x<W;x+=sp){mctx.beginPath();mctx.moveTo(x,0);mctx.lineTo(x,H);mctx.stroke();}
    for(let y=0;y<H;y+=sp){mctx.beginPath();mctx.moveTo(0,y);mctx.lineTo(W,y);mctx.stroke();}

    // Primary coil
    mctx.save();
    mctx.strokeStyle='rgba(240,192,64,0.5)';
    mctx.lineWidth=1.5;
    for(let i=0;i<4;i++){
      mctx.beginPath();
      mctx.ellipse(cx, baseY-4-i*6, W*0.06*(0.5+i*0.12), W*0.015, 0, 0, Math.PI*2);
      mctx.stroke();
    }
    mctx.restore();

    // Secondary coil
    mctx.save();
    mctx.strokeStyle=`rgba(0,180,255,0.5)`;
    mctx.lineWidth=1;
    const secH=baseY-14-topY;
    const turns=20;
    for(let i=0;i<turns;i++){
      const y=baseY-14-(i/turns)*secH;
      const r=W*0.025*(1-i/turns*0.3);
      mctx.beginPath();
      mctx.ellipse(cx,y,r,r*0.2,0,0,Math.PI*2);
      mctx.stroke();
    }
    mctx.restore();

    // Toroid
    mctx.save();
    mctx.shadowBlur=16;
    mctx.shadowColor='rgba(0,200,255,0.8)';
    mctx.strokeStyle=`rgba(0,220,255,${0.6+0.25*Math.sin(ts*0.003)})`;
    mctx.lineWidth=2.5;
    mctx.beginPath();
    mctx.ellipse(cx, toroidY, toroidRx, toroidRy, 0, 0, Math.PI*2);
    mctx.stroke();
    mctx.restore();

    // Ambient arc
    if(Math.random()<0.3){
      const a=Math.random()*Math.PI*2;
      const sx=cx+Math.cos(a)*toroidRx, sy=toroidY+Math.sin(a)*toroidRy;
      const pts=genBolt(sx,sy,sx+(Math.random()-0.5)*40,sy-10-Math.random()*25,0.6,0);
      mBolts.push({pts,life:0.35+Math.random()*0.2,decay:0.1,w:0.5});
    }

    // Label
    mctx.save();
    mctx.fillStyle='rgba(0,180,255,0.25)';
    mctx.font=`600 ${Math.max(10,W*0.018)}px JetBrains Mono,monospace`;
    mctx.textAlign='left';
    mctx.fillText('TESLA COIL — LIVE', 14, H-14);
    mctx.textAlign='right';
    mctx.fillText('Click anywhere to fire ⚡', W-14, H-14);
    mctx.restore();
  }

  function miniLoop(ts) {
    requestAnimationFrame(miniLoop);
    const W=miniCanvas.width, H=miniCanvas.height;
    mctx.clearRect(0,0,W,H);
    mctx.fillStyle='#020408';
    mctx.fillRect(0,0,W,H);
    drawMiniCoil(ts);

    for(let i=mBolts.length-1;i>=0;i--){
      const b=mBolts[i];
      if(b.pts.length<2){mBolts.splice(i,1);continue;}
      mctx.save();
      mctx.globalAlpha=b.life*0.35;
      mctx.shadowBlur=16; mctx.shadowColor='rgba(0,200,255,1)';
      mctx.strokeStyle=`rgba(0,210,255,0.4)`;
      mctx.lineWidth=b.w*3.5;
      mctx.lineCap='round';
      mctx.beginPath(); mctx.moveTo(b.pts[0].x,b.pts[0].y);
      b.pts.forEach(p=>mctx.lineTo(p.x,p.y)); mctx.stroke();
      mctx.globalAlpha=b.life;
      mctx.shadowBlur=6; mctx.strokeStyle=`rgba(0,220,255,${b.life})`;
      mctx.lineWidth=b.w;
      mctx.beginPath(); mctx.moveTo(b.pts[0].x,b.pts[0].y);
      b.pts.forEach(p=>mctx.lineTo(p.x,p.y)); mctx.stroke();
      mctx.restore();
      b.life-=b.decay;
      if(b.life<=0) mBolts.splice(i,1);
    }

    for(let i=mSparks.length-1;i>=0;i--){
      const s=mSparks[i];
      mctx.save();
      mctx.globalAlpha=s.life;
      mctx.shadowBlur=6; mctx.shadowColor='rgba(0,200,255,1)';
      mctx.fillStyle=`rgba(0,210,255,${s.life})`;
      mctx.beginPath(); mctx.arc(s.x,s.y,s.sz,0,Math.PI*2); mctx.fill();
      mctx.restore();
      s.x+=s.vx; s.y+=s.vy; s.vy+=0.15; s.vx*=0.94; s.life-=s.decay;
      if(s.life<=0) mSparks.splice(i,1);
    }

    if(mMouse.active){
      const g=mctx.createRadialGradient(mMouse.x,mMouse.y,0,mMouse.x,mMouse.y,40);
      g.addColorStop(0,'rgba(0,200,255,0.08)');
      g.addColorStop(1,'rgba(0,0,0,0)');
      mctx.fillStyle=g;
      mctx.beginPath(); mctx.arc(mMouse.x,mMouse.y,40,0,Math.PI*2); mctx.fill();
    }
  }
  requestAnimationFrame(miniLoop);

  // Coil card preview animation
  const previewCanvas = document.getElementById('coil-preview-canvas');
  if(previewCanvas) {
    const pctx = previewCanvas.getContext('2d');
    let pBolts = [];
    function previewLoop(ts) {
      requestAnimationFrame(previewLoop);
      const W=previewCanvas.width, H=previewCanvas.height;
      pctx.clearRect(0,0,W,H);
      pctx.fillStyle='#020408'; pctx.fillRect(0,0,W,H);
      // mini grid
      pctx.strokeStyle='rgba(0,80,120,0.1)'; pctx.lineWidth=1;
      for(let x=0;x<W;x+=40){pctx.beginPath();pctx.moveTo(x,0);pctx.lineTo(x,H);pctx.stroke();}
      for(let y=0;y<H;y+=40){pctx.beginPath();pctx.moveTo(0,y);pctx.lineTo(W,y);pctx.stroke();}
      const cx=W/2, cy=H*0.6;
      // toroid
      pctx.save();
      pctx.shadowBlur=16; pctx.shadowColor='rgba(0,200,255,0.8)';
      pctx.strokeStyle=`rgba(0,220,255,${0.6+0.25*Math.sin(ts*0.003)})`;
      pctx.lineWidth=2;
      pctx.beginPath(); pctx.ellipse(cx,cy-H*0.2,W*0.12,W*0.04,0,0,Math.PI*2); pctx.stroke();
      pctx.restore();
      // coil body
      pctx.save();
      pctx.strokeStyle='rgba(0,180,255,0.45)'; pctx.lineWidth=1;
      for(let i=0;i<12;i++){
        const y=cy-H*0.18+i*(H*0.22/12);
        pctx.beginPath(); pctx.ellipse(cx,y,W*0.04*(1-i*0.015),W*0.01,0,0,Math.PI*2); pctx.stroke();
      }
      pctx.restore();
      // random arcs
      if(Math.random()<0.08){
        const a=Math.random()*Math.PI*2;
        const sx=cx+Math.cos(a)*W*0.12, sy=cy-H*0.2+Math.sin(a)*W*0.04;
        const pts=genBolt(sx,sy,sx+(Math.random()-0.5)*W*0.4,sy-H*0.1-Math.random()*H*0.3,0.5,0);
        pBolts.push({pts,life:0.7+Math.random()*0.3,decay:0.06,w:1});
      }
      for(let i=pBolts.length-1;i>=0;i--){
        const b=pBolts[i];
        if(!b.pts||b.pts.length<2){pBolts.splice(i,1);continue;}
        pctx.save();
        pctx.globalAlpha=b.life; pctx.shadowBlur=8; pctx.shadowColor='rgba(0,200,255,1)';
        pctx.strokeStyle=`rgba(0,220,255,${b.life})`; pctx.lineWidth=b.w; pctx.lineCap='round';
        pctx.beginPath(); pctx.moveTo(b.pts[0].x,b.pts[0].y);
        b.pts.forEach(p=>pctx.lineTo(p.x,p.y)); pctx.stroke();
        pctx.restore();
        b.life-=b.decay; if(b.life<=0) pBolts.splice(i,1);
      }
      // label
      pctx.save();
      pctx.fillStyle='rgba(0,180,255,0.4)';
      pctx.font=`600 11px JetBrains Mono,monospace`;
      pctx.textAlign='left';
      pctx.fillText('COIL BUILDER', 10, H-10);
      pctx.restore();
    }
    requestAnimationFrame(previewLoop);
  }

  // Motor card preview animation
  const motorPreview = document.getElementById('motor-preview-canvas');
  if(motorPreview) {
    const mpc = motorPreview.getContext('2d');
    let motorAngle = 0;
    function motorLoop(ts) {
      requestAnimationFrame(motorLoop);
      const W=motorPreview.width, H=motorPreview.height;
      mpc.clearRect(0,0,W,H);
      mpc.fillStyle='#030508'; mpc.fillRect(0,0,W,H);
      const cx=W/2, cy=H/2, R=Math.min(W,H)*0.35;
      // grid
      mpc.strokeStyle='rgba(0,60,100,0.12)'; mpc.lineWidth=1;
      for(let x=0;x<W;x+=40){mpc.beginPath();mpc.moveTo(x,0);mpc.lineTo(x,H);mpc.stroke();}
      for(let y=0;y<H;y+=40){mpc.beginPath();mpc.moveTo(0,y);mpc.lineTo(W,y);mpc.stroke();}
      // stator
      mpc.save();
      mpc.strokeStyle='rgba(60,80,140,0.5)'; mpc.lineWidth=10;
      mpc.beginPath(); mpc.arc(cx,cy,R,0,Math.PI*2); mpc.stroke();
      mpc.restore();
      // poles
      for(let i=0;i<6;i++){
        const a=(i/6)*Math.PI*2;
        const ph=ts*0.002+(i/6)*Math.PI*2;
        const inten=0.3+0.7*((Math.sin(ph)*0.5+0.5));
        const hue=i%2===0?'0,180,255':'155,89,245';
        mpc.save();
        mpc.translate(cx+Math.cos(a)*R*0.75,cy+Math.sin(a)*R*0.75);
        mpc.rotate(a);
        mpc.shadowBlur=8*inten; mpc.shadowColor=`rgba(${hue},${inten})`;
        mpc.fillStyle=`rgba(${hue},${inten*0.8})`;
        mpc.fillRect(-5,-14,10,28);
        mpc.restore();
      }
      // rotor
      motorAngle += 0.025;
      mpc.save();
      mpc.translate(cx,cy);
      mpc.rotate(motorAngle);
      for(let i=0;i<8;i++){
        const a=(i/8)*Math.PI*2;
        mpc.save(); mpc.rotate(a);
        mpc.fillStyle=i%2===0?'rgba(0,160,255,0.7)':'rgba(155,89,245,0.5)';
        mpc.fillRect(-3,-R*0.28,6,R*0.28);
        mpc.restore();
      }
      mpc.beginPath(); mpc.arc(0,0,R*0.08,0,Math.PI*2);
      mpc.fillStyle='rgba(80,120,200,0.9)'; mpc.shadowBlur=10; mpc.shadowColor='rgba(0,180,255,0.6)';
      mpc.fill();
      mpc.restore();
      // label
      mpc.save();
      mpc.fillStyle='rgba(155,89,245,0.45)';
      mpc.font='600 11px JetBrains Mono,monospace';
      mpc.textAlign='left';
      mpc.fillText('AC MOTOR — COMING SOON', 10, H-10);
      mpc.restore();
    }
    requestAnimationFrame(motorLoop);
  }

})();
