/* ════════════════════════════════════════════════════════════
   THE FARM STORIES · main.js
   Intro book · hero morph · flipbook · plot explorer · journal
════════════════════════════════════════════════════════════ */
(function(){
'use strict';
var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var isTouch = window.matchMedia('(pointer: coarse)').matches;
var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
var lenis = null;

/* ───────── toast ───────── */
var toastEl = document.getElementById('toast'), toastT;
function toast(msg){
  toastEl.textContent = msg; toastEl.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('show'); }, 3200);
}

/* ───────── smooth scroll (Lenis + GSAP) ───────── */
if (!reduced && typeof window.Lenis !== 'undefined'){
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
  if (hasGsap){
    gsap.registerPlugin(ScrollTrigger);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function(time){ lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  } else {
    (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })(0);
  }
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -70, duration: 1.4 });
    });
  });
}
if (hasGsap){
  gsap.registerPlugin(ScrollTrigger);
  window.addEventListener('load', function(){ ScrollTrigger.refresh(); });
}

/* ════════════ INTRO · THE BOOK OPENS ════════════ */
(function intro(){
  var intro = document.getElementById('intro');
  var tome = document.getElementById('tome');
  var skip = document.getElementById('skipBtn');
  var hint = document.getElementById('openHint');
  function unlock(){ document.body.classList.remove('locked'); }
  function dismiss(fast){
    if (!intro) return;
    unlock();
    if (fast){ intro.style.display = 'none'; return; }
    intro.classList.add('away');
    setTimeout(function(){ intro.style.display = 'none'; }, 1250);
  }
  if (reduced || !intro){ unlock(); if (intro) intro.style.display = 'none'; return; }
  if (sessionStorage.getItem('tfs-book-opened')){ dismiss(true); return; }

  var dust = intro.querySelector('.dust');
  for (var i = 0; i < 16; i++){
    var m = document.createElement('span'); m.className = 'mote';
    m.style.left = (4 + Math.random() * 92) + '%';
    m.style.animationDelay = (Math.random() * 9) + 's';
    m.style.animationDuration = (7 + Math.random() * 6) + 's';
    m.style.width = m.style.height = (2.5 + Math.random() * 3) + 'px';
    dust.appendChild(m);
  }

  // leaves to turn, outermost first: cover, then pages 1..3
  var leaves = [tome.querySelector('.tome-cover')]
    .concat([].slice.call(tome.querySelectorAll('.tome-page.leaf')).sort(function(a,b){
      return (+a.dataset.leaf) - (+b.dataset.leaf);
    }));
  var turned = 0, finished = false;
  var hints = ['', 'Turn the page', 'Once more…', 'One last page'];

  function turnNext(){
    if (finished) return;
    if (turned >= leaves.length){ finish(); return; }
    var leaf = leaves[turned];
    leaf.classList.add('turned');
    turned++;
    hint.textContent = hints[turned] || '';
    if (turned >= leaves.length - 1){
      // after the 3rd visible turn, drift into the site
      finished = true;
      hint.textContent = '';
      setTimeout(function(){
        if (leaves[turned]) leaves[turned].classList.add('turned');
        sessionStorage.setItem('tfs-book-opened', '1');
        setTimeout(function(){ dismiss(false); }, 900);
      }, 850);
    }
  }
  tome.addEventListener('click', turnNext);
  tome.addEventListener('keydown', function(e){
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight'){ e.preventDefault(); turnNext(); }
  });
  // swipe
  var sx = null;
  tome.addEventListener('touchstart', function(e){ sx = e.touches[0].clientX; }, { passive: true });
  tome.addEventListener('touchend', function(e){
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (dx < -34) turnNext();
    sx = null;
  }, { passive: true });
  skip.addEventListener('click', function(){
    sessionStorage.setItem('tfs-book-opened', '1'); dismiss(true);
  });
  function finish(){
    if (finished) return; finished = true;
    sessionStorage.setItem('tfs-book-opened', '1'); dismiss(false);
  }
})();

/* ════════════ SPLIT HEADINGS ════════════ */
document.querySelectorAll('h2.split').forEach(function(h){
  var words = h.textContent.trim().split(/\s+/);
  h.textContent = '';
  words.forEach(function(w, i){
    var s = document.createElement('span'); s.className = 'w';
    s.style.transitionDelay = (i * 70) + 'ms';
    s.textContent = w;
    h.appendChild(s);
    if (i < words.length - 1) h.appendChild(document.createTextNode(' '));
  });
});

/* ════════════ REVEAL ════════════ */
(function(){
  var els = document.querySelectorAll('.reveal, .split');
  if (reduced){ els.forEach(function(e){ e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function(e){ io.observe(e); });
})();

/* ════════════ NAV · PROGRESS · STREAM ════════════ */
(function(){
  var links = document.querySelectorAll('nav.chapters a');
  ['beginning','stories','orchard','library','gatherings','journal'].forEach(function(id){
    var s = document.getElementById(id); if (!s) return;
    new IntersectionObserver(function(es){
      es.forEach(function(en){
        if (en.isIntersecting) links.forEach(function(l){ l.classList.toggle('active', l.dataset.chapter === id); });
      });
    }, { rootMargin: '-35% 0px -55% 0px' }).observe(s);
  });
  var prog = document.getElementById('progress');
  var path = document.getElementById('streamPath'), len = 0;
  if (path){
    len = path.getTotalLength();
    if (!reduced){ path.style.strokeDasharray = len; path.style.strokeDashoffset = len; }
  }
  var sticky = document.getElementById('stickyCta');
  function onScroll(){
    var d = document.documentElement;
    var top = d.scrollTop || document.body.scrollTop;
    var p = top / ((d.scrollHeight - d.clientHeight) || 1);
    prog.style.width = (p * 100) + '%';
    if (path && !reduced) path.style.strokeDashoffset = String(len * (1 - Math.min(1, p * 1.15)));
    if (sticky) sticky.classList.toggle('show', top > window.innerHeight * .9 && p < .92);
  }
  window.addEventListener('scroll', function(){ requestAnimationFrame(onScroll); }, { passive: true });
  onScroll();
})();

/* ════════════ HERO · INK BECOMES ORCHARD ════════════ */
(function(){
  var hero = document.getElementById('hero');
  var pin = document.getElementById('heroPin');
  var ink = document.getElementById('heroInk');
  var real = document.getElementById('heroReal');
  var video = document.getElementById('heroVideo');
  if (!hero) return;
  var layers = [].slice.call(ink.querySelectorAll('.layer'));

  // mouse parallax on the ink world
  var mx = 0, my = 0;
  if (!reduced && !isTouch){
    pin.addEventListener('mousemove', function(e){
      var r = pin.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - .5) * 2;
      my = ((e.clientY - r.top) / r.height - .5) * 2;
      layers.forEach(function(l){
        var d = parseFloat(l.dataset.depth);
        l.style.translate = (mx * d * 60) + 'px ' + (my * d * 40) + 'px';
      });
    });
    pin.addEventListener('mouseleave', function(){
      layers.forEach(function(l){ l.style.translate = '0px 0px'; });
    });
  }

  var videoStarted = false;
  function startVideo(){
    if (videoStarted || !video) return; videoStarted = true;
    var src = video.querySelector('source');
    if (src && src.dataset.src && !src.src){ src.src = src.dataset.src; video.load(); }
    var p = video.play();
    if (p) p.then(function(){ video.classList.add('playing'); }).catch(function(){ /* poster stays */ });
    video.addEventListener('error', function(){ video.style.display = 'none'; }, true);
  }

  if (hasGsap && !reduced){
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero, start: 'top top', end: '+=180%',
        scrub: 0.6, pin: pin,
        onUpdate: function(self){
          hero.classList.toggle('lit', self.progress > .45);
          if (self.progress > .2) startVideo();
        }
      }
    });
    // reality breathes in beneath the ink
    tl.fromTo(real, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, ease: 'none', duration: 1 }, 0);
    // the sketch dissolves, nearest strokes first — tree by tree, mountain by mountain
    layers.slice().sort(function(a, b){ return (+a.dataset.morph) - (+b.dataset.morph); })
      .forEach(function(l, i){
        tl.to(l, { opacity: 0, y: -30 - i * 14, filter: 'blur(2.5px)', ease: 'none', duration: .42 }, .12 + i * .17);
      });
    tl.to('.scroll-cue', { opacity: 0, duration: .2 }, .25);
  } else {
    // graceful: static ink hero; play video softly behind after load
    hero.classList.remove('lit');
    if (!reduced) setTimeout(startVideo, 2500);
    if (reduced && video) video.remove();
  }
})();

/* ════════════ TILT CARDS ════════════ */
if (!reduced && !isTouch){
  document.querySelectorAll('.tilt').forEach(function(card){
    card.addEventListener('mousemove', function(e){
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = 'perspective(900px) rotateX(' + (-y * 5) + 'deg) rotateY(' + (x * 6) + 'deg) translateY(-3px)';
    });
    card.addEventListener('mouseleave', function(){ card.style.transform = ''; });
  });
}

/* ════════════════════════════════════════════════
   THE BOOK READER · Story One as a flipbook
════════════════════════════════════════════════ */
var PLOTS; // declared below, used by reserve page
function plotsLeft(){
  var n = 0; PLOTS.forEach(function(p){ if (p.status === 'available') n++; });
  return n;
}

var readerCtl = (function(){
  var reader = document.getElementById('reader');
  var fb = document.getElementById('flipbook');
  var prevB = document.getElementById('pgPrev'), nextB = document.getElementById('pgNext');
  var count = document.getElementById('pgCount');
  var openBtn = document.getElementById('openStoryOne');
  var pages = null, spread = 0, turning = false, lastFocus = null;

  var IMG = {
    orchard: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700&q=80',
    hills: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=700&q=80',
    forest: 'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=700&q=80',
    valley: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1000&q=80'
  };

  function buildPages(){
    return [
      // 0 · inside cover
      '<div class="fbp-art" style="text-align:center">' +
        '<p class="fbp-kicker" style="margin-top:20px">Ex libris · The Farm Stories</p>' +
        '<div style="font-size:44px;color:var(--yellow);margin:26px 0">❦</div>' +
        '<p class="fbp-title" style="font-size:clamp(19px,2vw,26px)">Story No. 001</p>' +
        '<p class="fbp-body" style="font-family:var(--serif);font-style:italic">Set down as witnessed at Agali,<br>in the foothills of the Nilgiris.</p>' +
      '</div><span class="fbp-no">inside cover</span>',
      // 1 · introduction
      '<p class="fbp-kicker">Page one · Introduction</p>' +
      '<h3 class="fbp-title">Mango <em>Meadows</em></h3>' +
      '<div class="fbp-body"><p class="dropcap">Seven acres of thirty-year-old mango orchard on a gentle slope, kept by a stream and looked over by the blue line of the Nilgiris. Twenty-six families share it — never more.</p>' +
      '<p>This is not a promise of an orchard. The orchard is already here, already in harvest. What we sell is a place in its story.</p></div>' +
      '<ul class="fbp-list"><li><span class="k">The land</span><span class="v">7 acres, mature orchard</span></li>' +
      '<li><span class="k">The circle</span><span class="v">26 families, boutique by design</span></li>' +
      '<li><span class="k">The trees</span><span class="v">300+, three decades old</span></li></ul>' +
      '<span class="fbp-no">1</span>',
      // 2 · location
      '<p class="fbp-kicker">Page two · Where the story is set</p>' +
      '<h3 class="fbp-title">Agali, <em>Nilgiris foothills</em></h3>' +
      '<div class="fbp-art"><svg viewBox="0 0 340 150"><g class="plan-ink" stroke-width="2">' +
        '<path d="M18,120 q60,-6 110,-24 q70,-26 120,-30 q40,-3 74,-8" stroke-dasharray="5 6"/>' +
        '<path d="M226,52 l12,-16 l12,16 M256,44 l10,-14 l10,14 M288,52 l11,-15 l11,15"/>' +
        '<circle cx="20" cy="120" r="5" fill="#1C1C1A"/>' +
        '<circle cx="316" cy="60" r="6" fill="#E8B23A" stroke="#1C1C1A"/></g>' +
        '<text x="14" y="140" class="plan-label small">Coimbatore</text>' +
        '<text x="284" y="82" class="plan-label small">Agali</text>' +
        '<text x="120" y="86" class="plan-label small" font-style="italic">45 km · under two hours</text></svg></div>' +
      '<ul class="fbp-list"><li><span class="k">From Coimbatore</span><span class="v">45 km · 75–90 min</span></li>' +
      '<li><span class="k">The air</span><span class="v">Attappadi valley, foothill climate</span></li>' +
      '<li><span class="k">The view</span><span class="v">Nilgiris on the horizon</span></li>' +
      '<li><span class="k">Close enough</span><span class="v">to feel spontaneous</span></li>' +
      '<li><span class="k">Far enough</span><span class="v">to feel free</span></li></ul>' +
      '<span class="fbp-no">2</span>',
      // 3 · gallery
      '<p class="fbp-kicker">Page three · Plates</p>' +
      '<h3 class="fbp-title">The orchard, <em>as found</em></h3>' +
      '<div class="fbp-gallery">' +
        '<figure><img loading="lazy" src="' + IMG.orchard + '" alt="Mature mango orchard rows"><figcaption>the west rows, in fruit</figcaption></figure>' +
        '<figure><img loading="lazy" src="' + IMG.hills + '" alt="Nilgiris hills at dawn"><figcaption>the Nilgiris, from plot 4</figcaption></figure>' +
        '<figure class="wide"><img loading="lazy" src="' + IMG.valley + '" alt="Valley panorama in morning light"><figcaption>morning, over the valley</figcaption></figure>' +
      '</div>' +
      '<p class="fbp-fold">Photographs from the estate record — never renders.</p>' +
      '<span class="fbp-no">3</span>',
      // 4 · masterplan
      '<p class="fbp-kicker">Page four · The endpaper map</p>' +
      '<h3 class="fbp-title">The <em>masterplan</em></h3>' +
      '<div class="fbp-art"><svg viewBox="0 0 340 190"><g class="plan-ink" stroke-width="1.8">' +
        '<path d="M24,26 Q170,8 318,30 Q334,96 316,168 Q170,186 26,164 Q8,94 24,26 Z"/>' +
        '<ellipse cx="170" cy="96" rx="86" ry="52" stroke-dasharray="6 5"/>' +
        '<path d="M170,186 L170,148"/>' +
        '<circle cx="170" cy="96" r="9"/><path d="M60,30 q-12,40 6,70 q14,26 2,58" opacity=".6"/>' +
        '<circle cx="286" cy="52" r="14" opacity=".7"/></g>' +
        '<text x="152" y="128" class="plan-label small">pavilion</text>' +
        '<text x="270" y="84" class="plan-label small">lake</text>' +
        '<text x="42" y="120" class="plan-label small">stream</text>' +
        '<text x="178" y="172" class="plan-label small">entrance</text></svg></div>' +
      '<div class="fbp-body"><p>Twenty-six plots of 20–30 cents, folded between the orchard blocks along a 22-foot loop road. Every plot keeps its trees.</p></div>' +
      '<div class="fbp-cta"><button class="btn btn-ink" data-goto="#library">Open the full map</button></div>' +
      '<span class="fbp-no">4</span>',
      // 5 · ownership
      '<p class="fbp-kicker">Page five · The record of ownership</p>' +
      '<h3 class="fbp-title">Documentation <em>first</em></h3>' +
      '<div class="fbp-body"><p>Before any conversation about money, the papers go on the table. Every claim on this page has a document behind it.</p></div>' +
      '<ul class="fbp-list">' +
        '<li><span class="k">Patta &amp; chitta</span><span class="v">verified, on file</span></li>' +
        '<li><span class="k">Encumbrance certificate</span><span class="v">30 years, clean</span></li>' +
        '<li><span class="k">Layout</span><span class="v">registered &amp; approved</span></li>' +
        '<li><span class="k">Sale deed</span><span class="v">CA-reviewed template</span></li>' +
        '<li><span class="k">After you sign</span><span class="v">monthly reports, forever</span></li></ul>' +
      '<p class="fbp-fold">Buying through an advisor? Ask for the CA documentation kit — we hand it over at first contact.</p>' +
      '<span class="fbp-no">5</span>',
      // 6 · amenities
      '<p class="fbp-kicker">Page six · The keeping of the place</p>' +
      '<h3 class="fbp-title">What the estate <em>holds</em></h3>' +
      '<ul class="fbp-list">' +
        '<li><span class="k">The orchard</span><span class="v">300+ mature trees, retained</span></li>' +
        '<li><span class="k">The roads</span><span class="v">22-ft internal loop</span></li>' +
        '<li><span class="k">The pavilion</span><span class="v">amphitheatre &amp; long table</span></li>' +
        '<li><span class="k">The walks</span><span class="v">orchard trails &amp; sunset decks</span></li>' +
        '<li><span class="k">The edge</span><span class="v">secured perimeter, lit lanes</span></li>' +
        '<li><span class="k">The arch</span><span class="v">a quiet, natural entrance</span></li></ul>' +
      '<p class="fbp-fold">Nothing here is rendered. Come and stand in it.</p>' +
      '<span class="fbp-no">6</span>',
      // 7 · reserve
      '<p class="fbp-kicker">Page seven · Reserve</p>' +
      '<h3 class="fbp-title">Join the <em>story</em></h3>' +
      '<div class="fbp-body"><p>Of the twenty-six places in this book, <strong>' + plotsLeftText() + '</strong> remain unwritten. We admit families slowly, and always after a morning at the farm.</p>' +
      '<p>Come out with us. Walk the rows, read the papers, meet a family or two. If the land speaks to you, you’ll know.</p></div>' +
      '<div class="fbp-cta"><button class="btn btn-ink" data-goto="#chapter">Plan a visit</button>' +
      '<a class="btn btn-ghost" style="border-color:var(--ink);color:var(--ink);background:transparent" href="https://wa.me/919003746953" target="_blank" rel="noopener">WhatsApp us</a></div>' +
      '<p class="fbp-fold">We would rather lose a sale than lose your trust.</p>' +
      '<span class="fbp-no">7</span>'
    ];
  }
  function plotsLeftText(){
    var n = plotsLeft();
    return n + (n === 1 ? ' plot' : ' plots');
  }

  var mobile = function(){ return window.innerWidth < 760; };
  function spreadsCount(){ return mobile() ? pages.length : Math.ceil(pages.length / 2); }

  function render(){
    fb.innerHTML = '<div class="fb-base"></div>';
    var sp = document.createElement('div'); sp.className = 'fb-spread';
    if (mobile()){
      sp.innerHTML = '<div class="fb-page right">' + pages[spread] + '</div>';
    } else {
      sp.innerHTML =
        '<div class="fb-page left">' + (pages[spread * 2] || '') + '</div>' +
        '<div class="fb-page right">' + (pages[spread * 2 + 1] || '') + '</div>';
    }
    fb.appendChild(sp);
    var total = spreadsCount();
    count.textContent = mobile()
      ? 'page ' + (spread + 1) + ' of ' + total
      : 'spread ' + (spread + 1) + ' of ' + total;
    prevB.disabled = spread === 0;
    nextB.disabled = spread >= total - 1;
    fb.querySelectorAll('[data-goto]').forEach(function(b){
      b.addEventListener('click', function(){
        close();
        var t = document.querySelector(b.dataset.goto);
        if (t){
          if (lenis) lenis.scrollTo(t, { offset: -70 });
          else t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
        }
      });
    });
  }

  function turn(dir){
    if (turning) return;
    var total = spreadsCount();
    var target = spread + dir;
    if (target < 0 || target > total - 1) return;
    if (reduced || mobile()){ spread = target; render(); return; }
    turning = true;
    // the leaf that lifts: front = current right page, back = next left page
    var leaf = document.createElement('div'); leaf.className = 'fb-leaf';
    if (dir > 0){
      leaf.innerHTML = '<div class="lf front">' + (pages[spread * 2 + 1] || '') + '</div>' +
                       '<div class="lf back">' + (pages[target * 2] || '') + '</div>';
      fb.appendChild(leaf);
      var sp = fb.querySelector('.fb-spread');
      sp.querySelector('.fb-page.right').innerHTML = pages[target * 2 + 1] || '';
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ leaf.classList.add('turn'); }); });
      setTimeout(function(){ spread = target; turning = false; render(); }, 1080);
    } else {
      leaf.innerHTML = '<div class="lf front">' + (pages[target * 2 + 1] || '') + '</div>' +
                       '<div class="lf back">' + (pages[spread * 2] || '') + '</div>';
      leaf.classList.add('turn');
      leaf.style.transition = 'none';
      fb.appendChild(leaf);
      var sp2 = fb.querySelector('.fb-spread');
      sp2.querySelector('.fb-page.left').innerHTML = pages[target * 2] || '';
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        leaf.style.transition = ''; leaf.classList.remove('turn');
      }); });
      setTimeout(function(){ spread = target; turning = false; render(); }, 1080);
    }
  }

  function open(){
    pages = buildPages();
    spread = 0; turning = false;
    lastFocus = document.activeElement;
    reader.hidden = false;
    requestAnimationFrame(function(){ reader.classList.add('open'); });
    document.body.classList.add('locked');
    if (lenis) lenis.stop();
    render();
    prevB.focus();
  }
  function close(){
    reader.classList.remove('open');
    document.body.classList.remove('locked');
    if (lenis) lenis.start();
    setTimeout(function(){ reader.hidden = true; }, 450);
    if (lastFocus) lastFocus.focus();
  }
  if (openBtn) openBtn.addEventListener('click', open);
  prevB.addEventListener('click', function(){ turn(-1); });
  nextB.addEventListener('click', function(){ turn(1); });
  reader.querySelectorAll('[data-close]').forEach(function(el){ el.addEventListener('click', close); });
  document.addEventListener('keydown', function(e){
    if (reader.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') turn(1);
    if (e.key === 'ArrowLeft') turn(-1);
  });
  // click page edges to turn
  fb.addEventListener('click', function(e){
    if (e.target.closest('[data-goto], a, button')) return;
    var r = fb.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width;
    if (x > .62) turn(1); else if (x < .38) turn(-1);
  });
  // swipe
  var tx = null;
  fb.addEventListener('touchstart', function(e){ tx = e.touches[0].clientX; }, { passive: true });
  fb.addEventListener('touchend', function(e){
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx;
    if (dx < -40) turn(1); else if (dx > 40) turn(-1);
    tx = null;
  }, { passive: true });
  window.addEventListener('resize', function(){ if (!reader.hidden){ spread = 0; render(); } });
  return { open: open, close: close };
})();

// the two "coming soon" books whisper instead of opening
document.querySelectorAll('.shelf-book.story-soon').forEach(function(b){
  function whisper(){
    toast(b.querySelector('.sb-kicker').textContent === 'Your Chapter'
      ? 'Tell us about your land — write to hello@thefarmstories.estate'
      : 'This story is still being read. Nothing is listed until it checks out.');
  }
  b.addEventListener('click', whisper);
  b.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); whisper(); } });
});

/* ════════════════════════════════════════════════
   PLOT EXPLORER · the endpaper map, alive
════════════════════════════════════════════════ */
PLOTS = (function(){
  // 26 plots ringed around the orchard heart. cents 20–30.
  var spec = [
    // [cents, status, traits...]
    [24,'sold','grove'],      [22,'available','grove'], [27,'reserved','grove','stream'],
    [30,'available','corner','stream'], [25,'available','stream'], [21,'sold','stream'],
    [23,'available','stream'],[28,'reserved','corner'], [20,'available'],
    [26,'available'],         [22,'reserved'],          [29,'available','corner','view'],
    [24,'sold','view'],       [21,'available','view'],  [27,'available','view'],
    [30,'reserved','corner','view'], [25,'available','view'], [23,'sold','view'],
    [20,'available'],         [26,'reserved'],          [28,'available','corner'],
    [22,'available'],         [24,'sold'],              [29,'available','grove'],
    [21,'reserved','grove'],  [25,'available','grove']
  ];
  var cx = 500, cy = 352, rx = 356, ry = 252;
  var startA = 122, endA = 418; // leave a gap at the bottom for the entrance
  var out = [];
  for (var i = 0; i < 26; i++){
    var a = (startA + (endA - startA) * (i / 25)) * Math.PI / 180;
    var jitter = ((i * 37) % 11 - 5) * 1.6;
    var px = cx + Math.cos(a) * (rx + jitter);
    var py = cy + Math.sin(a) * (ry + jitter * .7);
    var s = spec[i];
    var cents = s[0];
    var w = 62 + (cents - 20) * 2.6, h = 50 + (cents - 20) * 1.6;
    out.push({
      no: i + 1, cents: cents, status: s[1], traits: s.slice(2),
      x: px, y: py, w: w, h: h, rot: (a * 180 / Math.PI) + 90 + ((i * 13) % 7 - 3),
      trees: 8 + ((i * 7) % 9),
      frontage: 40 + ((i * 11) % 26),
      facing: ['east','south-east','south','south-west','west','north-west','north','north-east'][Math.round((((a*180/Math.PI)%360)+360)%360 / 45) % 8]
    });
  }
  return out;
})();

(function explorer(){
  var svg = document.getElementById('planSvg');
  if (!svg) return;
  var NS = 'http://www.w3.org/2000/svg';
  var tip = document.getElementById('planTip');
  var wrap = document.getElementById('planWrap');
  var note = document.getElementById('planNote');
  var ppEmpty = document.getElementById('ppEmpty');
  var ppDetail = document.getElementById('ppDetail');
  var ppCompare = document.getElementById('ppCompare');
  var scarcity = document.getElementById('scarcityNote');
  var bookmarks = [];
  try { bookmarks = JSON.parse(localStorage.getItem('tfs-bookmarks') || '[]'); } catch(e){}
  var compare = [];
  var selected = null;

  scarcity.textContent = plotsLeft() + ' of 26 plots remain · admitted slowly';

  function el(tag, attrs, parent){
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  /* ── scenery: boundary, stream, lake, roads, pavilion, grove ── */
  var scenery = el('g', { id: 'scenery' }, svg);
  el('path', { d: 'M96,72 Q500,18 906,66 Q972,360 908,646 Q500,706 94,650 Q28,352 96,72 Z',
    'class': 'plan-ink', 'stroke-width': 3, fill: '#F6F0DE' }, scenery);
  // stream down the west
  el('path', { d: 'M150,60 Q118,180 168,290 Q214,392 158,500 Q128,570 170,648',
    'class': 'plan-ink', 'stroke-width': 5, stroke: '#5C6B70', opacity: .55 }, scenery);
  el('path', { d: 'M150,60 Q118,180 168,290 Q214,392 158,500 Q128,570 170,648',
    'class': 'plan-ink', 'stroke-width': 1.4, stroke: '#5C6B70', 'stroke-dasharray': '7 9', opacity: .8 }, scenery);
  // lake, top right
  el('ellipse', { cx: 812, cy: 150, rx: 62, ry: 40, 'class': 'plan-ink', 'stroke-width': 2.2,
    fill: '#DEE6E4' }, scenery);
  el('path', { d: 'M776,146 q10,-8 20,0 q10,-8 20,0 M790,162 q9,-7 18,0', 'class': 'plan-ink',
    'stroke-width': 1.4, stroke: '#5C6B70', opacity: .7 }, scenery);
  // loop road + entrance drive
  el('ellipse', { cx: 500, cy: 352, rx: 268, ry: 182, 'class': 'plan-ink', 'stroke-width': 8,
    stroke: '#C9BC9E', opacity: .85 }, scenery);
  el('ellipse', { cx: 500, cy: 352, rx: 268, ry: 182, 'class': 'plan-ink', 'stroke-width': 1.5,
    'stroke-dasharray': '10 12', opacity: .55 }, scenery);
  el('path', { d: 'M500,534 L500,676', 'class': 'plan-ink', 'stroke-width': 8, stroke: '#C9BC9E', opacity: .85 }, scenery);
  el('path', { d: 'M500,534 L500,676', 'class': 'plan-ink', 'stroke-width': 1.5, 'stroke-dasharray': '10 12', opacity: .55 }, scenery);
  // entrance arch
  el('path', { d: 'M478,678 q22,-26 44,0', 'class': 'plan-ink', 'stroke-width': 2.6 }, scenery);
  // pavilion at the heart
  var pav = el('g', {}, scenery);
  el('circle', { cx: 500, cy: 352, r: 34, 'class': 'plan-ink', 'stroke-width': 2.2, fill: '#F2E9D2' }, pav);
  el('path', { d: 'M478,362 l22,-26 l22,26 M486,362 l0,-12 M514,362 l0,-12', 'class': 'plan-ink', 'stroke-width': 2 }, pav);
  // orchard heart: rows of little trees
  var grove = el('g', { opacity: .8 }, scenery);
  for (var r = 0; r < 3; r++){
    for (var c = 0; c < 7; c++){
      var gx = 360 + c * 46 + (r % 2) * 20, gy = 268 + r * 62;
      if (Math.hypot(gx - 500, gy - 352) < 52) continue;
      el('circle', { cx: gx, cy: gy, r: 11, 'class': 'plan-ink', 'stroke-width': 1.6, fill: '#EDE9D2' }, grove);
      el('circle', { cx: gx + 4, cy: gy - 3, r: 1.8, fill: '#E8B23A' }, grove);
    }
  }
  // old grove, top-left
  for (var g2 = 0; g2 < 5; g2++){
    el('circle', { cx: 210 + (g2 % 3) * 40, cy: 130 + Math.floor(g2 / 3) * 44, r: 13,
      'class': 'plan-ink', 'stroke-width': 1.6, fill: '#EDE9D2' }, scenery);
  }
  // labels
  function label(x, y, t, small){
    var e = el('text', { x: x, y: y, 'class': 'plan-label' + (small ? ' small' : '') }, scenery);
    e.textContent = t;
  }
  label(468, 410, 'the pavilion', true);
  label(772, 212, 'the lake', true);
  label(186, 330, 'the stream', true);
  label(182, 108, 'old grove', true);
  label(516, 664, 'entrance', true);
  el('text', { x: 924, y: 66, 'class': 'plan-label small' }, scenery).textContent = 'N ↑';
  // sun path (hidden until toggled)
  var sun = el('g', { id: 'sunArc', opacity: 0 }, svg);
  el('path', { d: 'M120,420 Q500,60 880,420', 'class': 'plan-ink', 'stroke-width': 1.6,
    stroke: '#E8B23A', 'stroke-dasharray': '4 8' }, sun);
  [['E · sunrise', 128, 444], ['noon', 486, 118], ['W · sunset', 812, 444]].forEach(function(s){
    el('circle', { cx: s[1] + 10, cy: s[2] - 18, r: 8, fill: '#E8B23A', opacity: .85 }, sun);
    el('text', { x: s[1] - 12, y: s[2] + 4, 'class': 'plan-label small', fill: '#9A6A10' }, sun).textContent = s[0];
  });

  /* ── the plots ── */
  var plotsG = el('g', { id: 'plots' }, svg);
  PLOTS.forEach(function(p){
    var g = el('g', { 'class': 'plot ' + p.status, transform: 'rotate(' + p.rot.toFixed(1) + ' ' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')',
      tabindex: 0, role: 'button', 'aria-label': 'Plot ' + p.no + ', ' + p.cents + ' cents, ' + p.status }, plotsG);
    g.dataset.no = p.no;
    el('rect', { 'class': 'shape', x: p.x - p.w / 2, y: p.y - p.h / 2, width: p.w, height: p.h, rx: 4 }, g);
    var t = el('text', { x: p.x, y: p.y + 4, 'text-anchor': 'middle' }, g);
    t.textContent = p.no;
    // a little tree per plot
    el('circle', { cx: p.x + p.w / 2 - 13, cy: p.y - p.h / 2 + 13, r: 6.5, 'class': 'plan-ink', 'stroke-width': 1.3, fill: 'none', opacity: .6 }, g);
    if (bookmarks.indexOf(p.no) > -1) g.classList.add('bookmarked');
    p._g = g;

    g.addEventListener('mouseenter', function(e){ showTip(p); });
    g.addEventListener('mousemove', function(e){ moveTip(e); });
    g.addEventListener('mouseleave', function(){ tip.classList.remove('show'); });
    g.addEventListener('click', function(){ select(p); });
    g.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); select(p); } });
  });

  var TRAIT_NAMES = { corner: 'corner plot', stream: 'by the stream', view: 'valley view', grove: 'old grove' };
  var STATUS_NAMES = { available: 'Available', reserved: 'Reserved', sold: 'Taken' };

  function traitLine(p){
    return p.traits.length ? p.traits.map(function(t){ return TRAIT_NAMES[t]; }).join(' · ') : 'quiet middle rows';
  }
  function showTip(p){
    tip.innerHTML = '<strong>Plot ' + p.no + ' · ' + p.cents + ' cents</strong>' +
      STATUS_NAMES[p.status] + ' · ' + traitLine(p) + '<br>' + p.trees + ' mango trees · faces ' + p.facing;
    tip.classList.add('show');
  }
  function moveTip(e){
    var r = wrap.getBoundingClientRect();
    var x = e.clientX - r.left, y = e.clientY - r.top;
    tip.style.left = Math.min(x + 16, r.width - 250) + 'px';
    tip.style.top = Math.max(y - 66, 8) + 'px';
  }

  /* ── detail panel ── */
  function distTo(p, x, y){ return Math.round(Math.hypot(p.x - x, p.y - y) / 10) * 5; } // playful metres
  function select(p){
    selected = p;
    PLOTS.forEach(function(q){ q._g.classList.toggle('sel', q === p); });
    ppEmpty.hidden = true; ppCompare.hidden = true; ppDetail.hidden = false;
    var bm = bookmarks.indexOf(p.no) > -1;
    var inCmp = compare.indexOf(p.no) > -1;
    ppDetail.innerHTML =
      '<button class="pp-back" data-act="back">‹ back to the map</button>' +
      '<span class="pp-badge ' + p.status + '">' + STATUS_NAMES[p.status] + '</span>' +
      '<h3>Plot ' + p.no + '</h3>' +
      '<p class="place">' + p.cents + ' cents · ' + traitLine(p) + '</p>' +
      '<ul class="fact-list">' +
        '<li><span class="k">Mango trees</span><span class="v">' + p.trees + ', mature</span></li>' +
        '<li><span class="k">Road frontage</span><span class="v">~' + p.frontage + ' ft on the loop</span></li>' +
        '<li><span class="k">Faces</span><span class="v">' + p.facing + ' — ' + (['east','south-east','north-east'].indexOf(p.facing) > -1 ? 'morning light' : 'evening light') + '</span></li>' +
        '<li><span class="k">To the pavilion</span><span class="v">~' + distTo(p, 500, 352) + ' m</span></li>' +
        '<li><span class="k">To the stream</span><span class="v">~' + distTo(p, 168, 350) + ' m</span></li>' +
        '<li><span class="k">Papers</span><span class="v">patta · EC · layout, on file</span></li>' +
        '<li><span class="k">Price</span><span class="v">shared at the table</span></li>' +
      '</ul>' +
      '<div class="pp-actions">' +
        (p.status === 'available'
          ? '<a class="btn btn-ink" href="#chapter" data-act="visit">Visit this plot</a>' : '') +
        '<button class="btn btn-ghost" data-act="bm">' + (bm ? '★ Bookmarked' : '☆ Bookmark') + '</button>' +
        '<button class="btn btn-ghost" data-act="cmp">' + (inCmp ? 'In comparison ✓' : '⇄ Compare') + '</button>' +
      '</div>' +
      (p.status !== 'available' ? '<p class="pp-note">This page is already written — but ' + plotsLeft() + ' others are still open.</p>' : '') +
      renderTray();
    bindPanel(p);
  }
  function renderTray(){
    if (!compare.length) return '';
    var chips = compare.map(function(no){
      return '<span class="chip">Plot ' + no + '<button data-uncmp="' + no + '" aria-label="Remove plot ' + no + '">✕</button></span>';
    }).join('');
    return '<div class="compare-tray"><span style="font-weight:700">Comparing:</span>' + chips +
      (compare.length > 1 ? '<button class="btn btn-ink" style="padding:9px 14px;font-size:12px" data-act="showcmp">Read side by side</button>' : '<span style="color:var(--ink-faint)">pick one more…</span>') +
      '</div>';
  }
  function bindPanel(p){
    var panel = document.getElementById('plotPanel');
    panel.querySelectorAll('[data-act]').forEach(function(b){
      b.addEventListener('click', function(e){
        var act = b.dataset.act;
        if (act === 'back'){ clearSel(); }
        if (act === 'bm'){
          var i = bookmarks.indexOf(p.no);
          if (i > -1){ bookmarks.splice(i, 1); p._g.classList.remove('bookmarked'); }
          else { bookmarks.push(p.no); p._g.classList.add('bookmarked'); toast('Plot ' + p.no + ' pressed between the pages — bookmarked.'); }
          try { localStorage.setItem('tfs-bookmarks', JSON.stringify(bookmarks)); } catch(err){}
          select(p);
        }
        if (act === 'cmp'){
          var j = compare.indexOf(p.no);
          if (j > -1) compare.splice(j, 1);
          else {
            if (compare.length >= 3){ toast('Three pages at a time — remove one first.'); return; }
            compare.push(p.no);
          }
          select(p);
        }
        if (act === 'showcmp'){ showCompare(); }
        if (act === 'visit'){
          try { sessionStorage.setItem('tfs-plot-interest', String(p.no)); } catch(err){}
        }
      });
    });
    panel.querySelectorAll('[data-uncmp]').forEach(function(b){
      b.addEventListener('click', function(){
        compare.splice(compare.indexOf(+b.dataset.uncmp), 1);
        if (selected) select(selected);
      });
    });
  }
  function clearSel(){
    selected = null;
    PLOTS.forEach(function(q){ q._g.classList.remove('sel'); });
    ppDetail.hidden = true; ppCompare.hidden = true; ppEmpty.hidden = false;
  }
  function showCompare(){
    var ps = compare.map(function(no){ return PLOTS[no - 1]; });
    ppDetail.hidden = true; ppEmpty.hidden = true; ppCompare.hidden = false;
    var rows = [
      ['Size', function(p){ return p.cents + ' cents'; }],
      ['Status', function(p){ return STATUS_NAMES[p.status]; }],
      ['Trees', function(p){ return p.trees; }],
      ['Frontage', function(p){ return '~' + p.frontage + ' ft'; }],
      ['Faces', function(p){ return p.facing; }],
      ['To pavilion', function(p){ return '~' + distTo(p, 500, 352) + ' m'; }],
      ['To stream', function(p){ return '~' + distTo(p, 168, 350) + ' m'; }],
      ['Character', function(p){ return traitLine(p); }]
    ];
    ppCompare.innerHTML = '<button class="pp-back" data-cmpback>‹ back</button>' +
      '<p class="bookplate">Side by side</p>' +
      '<table class="compare-table"><thead><tr><th></th>' +
      ps.map(function(p){ return '<th>Plot ' + p.no + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function(r){
        return '<tr><td>' + r[0] + '</td>' + ps.map(function(p){ return '<td>' + r[1](p) + '</td>'; }).join('') + '</tr>';
      }).join('') + '</tbody></table>' +
      '<p class="pp-note">Still torn? Stand in both. The land decides these things better than tables do.</p>';
    ppCompare.querySelector('[data-cmpback]').addEventListener('click', function(){
      if (selected) select(selected); else clearSel();
    });
  }

  /* ── filters ── */
  var fstate = { status: 'all', size: 'all', trait: 'all' };
  document.querySelectorAll('[data-pfilter]').forEach(function(group){
    group.addEventListener('click', function(e){
      var b = e.target.closest('.fbtn'); if (!b) return;
      group.querySelectorAll('.fbtn').forEach(function(x){ x.classList.remove('on'); });
      b.classList.add('on');
      fstate[group.dataset.pfilter] = b.dataset.v;
      applyF();
    });
  });
  function sizeBand(c){ return c <= 23 ? 's' : c <= 27 ? 'm' : 'l'; }
  function applyF(){
    var shown = 0;
    PLOTS.forEach(function(p){
      var ok = (fstate.status === 'all' || p.status === fstate.status)
        && (fstate.size === 'all' || sizeBand(p.cents) === fstate.size)
        && (fstate.trait === 'all' || p.traits.indexOf(fstate.trait) > -1);
      p._g.classList.toggle('dim', !ok);
      if (ok) shown++;
    });
    note.textContent = shown === 26 ? 'All 26 plots on the map.'
      : shown === 0 ? 'No plot matches — loosen a filter and wander again.'
      : shown + (shown === 1 ? ' plot speaks' : ' plots speak') + ' to your filters.';
  }

  /* ── toggles ── */
  document.getElementById('sunToggle').addEventListener('click', function(){
    var on = this.getAttribute('aria-pressed') === 'true';
    this.setAttribute('aria-pressed', String(!on));
    this.classList.toggle('on', !on);
    sun.setAttribute('opacity', on ? 0 : 1);
  });
  document.getElementById('viewToggle').addEventListener('click', function(){
    var on = this.getAttribute('aria-pressed') === 'true';
    this.setAttribute('aria-pressed', String(!on));
    this.classList.toggle('on', !on);
    svg.classList.toggle('terrain', !on);
    this.textContent = !on ? '✒ Ink' : '🛰 Terrain';
  });

  /* ── zoom & pan ── */
  var vb = { x: 0, y: 0, w: 1000, h: 720 };
  function setVB(){ svg.setAttribute('viewBox', vb.x + ' ' + vb.y + ' ' + vb.w + ' ' + vb.h); }
  function zoom(factor, cx, cy){
    var nw = Math.min(1000, Math.max(220, vb.w * factor));
    var nh = nw * .72;
    cx = cx === undefined ? vb.x + vb.w / 2 : cx;
    cy = cy === undefined ? vb.y + vb.h / 2 : cy;
    var kx = (cx - vb.x) / vb.w, ky = (cy - vb.y) / vb.h;
    vb.x = cx - nw * kx; vb.y = cy - nh * ky; vb.w = nw; vb.h = nh;
    clampVB(); setVB();
  }
  function clampVB(){
    vb.x = Math.max(-60, Math.min(1060 - vb.w, vb.x));
    vb.y = Math.max(-50, Math.min(770 - vb.h, vb.y));
  }
  document.getElementById('zoomIn').addEventListener('click', function(){ zoom(.72); });
  document.getElementById('zoomOut').addEventListener('click', function(){ zoom(1.38); });
  document.getElementById('zoomReset').addEventListener('click', function(){ vb = { x: 0, y: 0, w: 1000, h: 720 }; setVB(); });
  svg.addEventListener('wheel', function(e){
    e.preventDefault();
    var pt = clientToSvg(e.clientX, e.clientY);
    zoom(e.deltaY > 0 ? 1.12 : .9, pt.x, pt.y);
  }, { passive: false });
  function clientToSvg(cx, cy){
    var r = svg.getBoundingClientRect();
    return { x: vb.x + (cx - r.left) / r.width * vb.w, y: vb.y + (cy - r.top) / r.height * vb.h };
  }
  // drag / pinch with pointer events.
  // NOTE: no pointer capture — capturing on the svg retargets the click
  // and plots would never receive their selection tap.
  var pointers = {}, panStart = null, pinchStart = null, dragDist = 0;
  svg.addEventListener('pointerdown', function(e){
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(pointers);
    dragDist = 0;
    if (ids.length === 1){ panStart = { x: e.clientX, y: e.clientY, vx: vb.x, vy: vb.y }; svg.classList.add('grabbing'); }
    if (ids.length === 2){
      var a = pointers[ids[0]], b = pointers[ids[1]];
      pinchStart = { d: Math.hypot(a.x - b.x, a.y - b.y), w: vb.w };
      panStart = null;
    }
  });
  // a genuine drag must not end in an accidental plot selection
  svg.addEventListener('click', function(e){
    if (dragDist > 7){ e.stopPropagation(); }
  }, true);
  svg.addEventListener('pointermove', function(e){
    if (!pointers[e.pointerId]) return;
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(pointers);
    if (ids.length === 1 && panStart){
      dragDist = Math.max(dragDist, Math.hypot(e.clientX - panStart.x, e.clientY - panStart.y));
      var r = svg.getBoundingClientRect();
      vb.x = panStart.vx - (e.clientX - panStart.x) / r.width * vb.w;
      vb.y = panStart.vy - (e.clientY - panStart.y) / r.height * vb.h;
      clampVB(); setVB();
    } else if (ids.length === 2 && pinchStart){
      var a = pointers[ids[0]], b = pointers[ids[1]];
      var d = Math.hypot(a.x - b.x, a.y - b.y);
      var nw = Math.min(1000, Math.max(220, pinchStart.w * pinchStart.d / d));
      zoom(nw / vb.w);
    }
  });
  function endPointer(e){
    delete pointers[e.pointerId];
    if (!Object.keys(pointers).length){ panStart = null; pinchStart = null; svg.classList.remove('grabbing'); }
  }
  svg.addEventListener('pointerup', endPointer);
  svg.addEventListener('pointercancel', endPointer);
  svg.addEventListener('dblclick', function(e){
    var pt = clientToSvg(e.clientX, e.clientY);
    zoom(.6, pt.x, pt.y);
  });
})();

/* ════════════ JOURNAL TABS · COUNTERS · TYPEWRITER ════════════ */
(function(){
  var tabs = document.querySelectorAll('.js-tab');
  var pagesJ = document.querySelectorAll('.js-page');
  tabs.forEach(function(t){
    t.addEventListener('click', function(){
      tabs.forEach(function(x){ x.classList.remove('on'); x.setAttribute('aria-selected', 'false'); });
      t.classList.add('on'); t.setAttribute('aria-selected', 'true');
      pagesJ.forEach(function(p){ p.classList.toggle('on', p.dataset.jpage === t.dataset.jpage); });
      if (t.dataset.jpage === 'report') runCounters();
    });
  });
  var countersDone = false;
  function runCounters(){
    if (countersDone) return; countersDone = true;
    document.querySelectorAll('#journalSpread .count').forEach(function(c){
      var to = +c.dataset.to, t0 = null;
      if (reduced){ c.textContent = to; return; }
      function step(ts){
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / 1400);
        c.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
    var line = document.getElementById('typeline'), msg = '“A generous season.”';
    if (reduced || !line){ if (line) line.textContent = msg; return; }
    var i = 0, caret = document.createElement('span'); caret.className = 'caret';
    line.appendChild(caret);
    var iv = setInterval(function(){
      if (i < msg.length){ line.insertBefore(document.createTextNode(msg[i++]), caret); }
      else { clearInterval(iv); setTimeout(function(){ caret.remove(); }, 1500); }
    }, 55);
  }
})();

/* ════════════ EVENTS · FORMS · TICKER ════════════ */
document.querySelectorAll('.event[data-rsvp]').forEach(function(ev){
  ev.addEventListener('click', function(){
    if (ev.classList.contains('rsvpd')) return;
    ev.classList.add('rsvpd');
    ev.querySelector('.spots').textContent = 'Place held — we’ll write to you';
  });
});
document.querySelectorAll('form[data-notify]').forEach(function(f){
  f.addEventListener('submit', function(e){
    e.preventDefault();
    f.querySelector('button').textContent = 'Noted ✓';
    toast('Noted — we’ll write to you when this chapter opens.');
  });
});
(function(){
  var f = document.getElementById('visitForm');
  if (!f) return;
  f.addEventListener('submit', function(e){
    e.preventDefault();
    var name = (f.name.value || '').split(' ')[0];
    var plot = null;
    try { plot = sessionStorage.getItem('tfs-plot-interest'); } catch(err){}
    f.querySelector('.wc-submit').textContent = 'Held ✓ — we’ll write to you';
    f.querySelector('.wc-submit').disabled = true;
    toast('Thank you' + (name ? ', ' + name : '') + ' — a morning is held' + (plot ? ' (plot ' + plot + ' noted)' : '') + '. We reply personally, usually within a day.');
  });
})();
(function(){
  var track = document.getElementById('tickerTrack');
  if (track) track.innerHTML += track.innerHTML;
})();

/* ════════════ AMBIENT · leaves, pollen, a butterfly ════════════ */
(function(){
  if (reduced) return;
  var cv = document.getElementById('ambient');
  var ctx = cv.getContext('2d');
  var W, H, dpr = Math.min(window.devicePixelRatio || 1, 1.6);
  function size(){
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size(); window.addEventListener('resize', size);
  var nLeaf = isTouch ? 7 : 13, nPol = isTouch ? 10 : 20;
  var leaves = [], pollen = [];
  var LEAF_COLORS = ['#7d8a5a', '#9aa06b', '#b08d3f', '#8a7a4a'];
  function mkLeaf(top){
    return {
      x: Math.random() * W, y: top ? -30 : Math.random() * H,
      s: 7 + Math.random() * 8, a: Math.random() * Math.PI * 2,
      va: (Math.random() - .5) * .02, vy: .25 + Math.random() * .45,
      ph: Math.random() * Math.PI * 2, amp: 18 + Math.random() * 26,
      c: LEAF_COLORS[(Math.random() * LEAF_COLORS.length) | 0], o: .22 + Math.random() * .3
    };
  }
  function mkPol(){
    return { x: Math.random() * W, y: Math.random() * H, r: .8 + Math.random() * 1.6,
      vx: .06 + Math.random() * .18, ph: Math.random() * 9, o: .12 + Math.random() * .22 };
  }
  for (var i = 0; i < nLeaf; i++) leaves.push(mkLeaf(false));
  for (var j = 0; j < nPol; j++) pollen.push(mkPol());
  var fly = null, nextFly = Date.now() + 22000 + Math.random() * 30000;
  function drawLeaf(l, t){
    var sway = Math.sin(t * .0006 + l.ph) * l.amp * .015;
    ctx.save();
    ctx.translate(l.x + Math.sin(t * .0005 + l.ph) * l.amp * .06, l.y);
    ctx.rotate(l.a + sway);
    ctx.globalAlpha = l.o;
    ctx.fillStyle = l.c;
    ctx.beginPath();
    ctx.ellipse(0, 0, l.s, l.s * .34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = l.o * .8;
    ctx.strokeStyle = '#4A473F'; ctx.lineWidth = .5;
    ctx.beginPath(); ctx.moveTo(-l.s, 0); ctx.lineTo(l.s, 0); ctx.stroke();
    ctx.restore();
  }
  var hidden = false;
  document.addEventListener('visibilitychange', function(){ hidden = document.hidden; });
  function frame(t){
    requestAnimationFrame(frame);
    if (hidden) return;
    ctx.clearRect(0, 0, W, H);
    leaves.forEach(function(l){
      l.y += l.vy; l.a += l.va; l.x += Math.sin(t * .0004 + l.ph) * .3;
      if (l.y > H + 40){ Object.assign(l, mkLeaf(true)); }
      drawLeaf(l, t);
    });
    ctx.fillStyle = '#E8B23A';
    pollen.forEach(function(p){
      p.x += p.vx; p.y += Math.sin(t * .001 + p.ph) * .18;
      if (p.x > W + 10) { p.x = -10; p.y = Math.random() * H; }
      ctx.globalAlpha = p.o * (0.7 + 0.3 * Math.sin(t * .002 + p.ph));
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
    // an occasional butterfly, crossing unhurriedly
    if (!fly && Date.now() > nextFly){
      fly = { x: -30, y: H * (.25 + Math.random() * .4), vx: .9 + Math.random() * .5, ph: Math.random() * 9 };
    }
    if (fly){
      fly.x += fly.vx; fly.y += Math.sin(t * .003 + fly.ph) * .9;
      var flap = Math.abs(Math.sin(t * .02));
      ctx.save(); ctx.translate(fly.x, fly.y); ctx.globalAlpha = .5;
      ctx.fillStyle = '#B7803B';
      ctx.beginPath(); ctx.ellipse(-4, 0, 5, 3 + flap * 4, -.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(4, 0, 5, 3 + flap * 4, .5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      if (fly.x > W + 40){ fly = null; nextFly = Date.now() + 25000 + Math.random() * 40000; }
    }
  }
  requestAnimationFrame(frame);
})();

/* cursor glow */
(function(){
  var g = document.getElementById('cursorGlow');
  if (!g || isTouch || reduced) return;
  document.addEventListener('mousemove', function(e){
    g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px'; g.style.opacity = 1;
  });
  document.addEventListener('mouseleave', function(){ g.style.opacity = 0; });
})();

/* ════════════ 3D ORCHARD · lazy ════════════ */
(function(){
  var stage = document.getElementById('orchardStage');
  var canvas = document.getElementById('orchardCanvas');
  if (!stage || !canvas) return;
  window.__orchardProgress = 0;

  // captions follow scroll progress
  var caps = [].slice.call(document.querySelectorAll('.ocap'));
  function setCaption(p){
    var idx = Math.min(3, Math.floor(p * 4));
    caps.forEach(function(c, i){ c.classList.toggle('on', i === idx); });
  }

  if (hasGsap && !reduced){
    ScrollTrigger.create({
      trigger: stage, start: 'top 70%', end: 'bottom bottom', scrub: .4,
      onUpdate: function(self){
        window.__orchardProgress = self.progress;
        setCaption(self.progress);
      }
    });
  } else {
    window.addEventListener('scroll', function(){
      var r = stage.getBoundingClientRect();
      var p = Math.max(0, Math.min(1, -r.top / (r.height - window.innerHeight || 1)));
      window.__orchardProgress = p; setCaption(p);
    }, { passive: true });
  }

  var loaded = false;
  var io = new IntersectionObserver(function(es){
    es.forEach(function(en){
      if (en.isIntersecting && !loaded){
        loaded = true; io.disconnect();
        var s = document.createElement('script');
        s.src = 'js/orchard.js';
        s.onload = function(){ if (window.initOrchard) window.initOrchard(canvas, { reduced: reduced }); };
        document.head.appendChild(s);
      }
    });
  }, { rootMargin: '600px' });
  io.observe(stage);
})();

})();
