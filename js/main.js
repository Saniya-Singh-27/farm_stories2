/* ════════════════════════════════════════════════════════════
   THE FARM STORIES · main.js
   Shared across all pages — every block guards for its own
   markup, so one file serves the whole site.
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
  if (!toastEl) return;
  toastEl.textContent = msg; toastEl.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('show'); }, 3200);
}

/* ───────── smooth scroll (Lenis + GSAP) ───────── */
if (hasGsap){
  gsap.registerPlugin(ScrollTrigger);
  window.addEventListener('load', function(){ ScrollTrigger.refresh(); });
}
if (!reduced && typeof window.Lenis !== 'undefined'){
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.92, smoothWheel: true });
  if (hasGsap){
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function(time){ lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  } else {
    (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })(0);
  }
  // same-page anchors glide; cross-page links navigate normally
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

/* ════════════ INTRO · THE BOOK OPENS (home only) ════════════ */
(function intro(){
  var intro = document.getElementById('intro');
  if (!intro){ document.body.classList.remove('locked'); return; }
  var tome = document.getElementById('tome');
  var skip = document.getElementById('skipBtn');
  var hint = document.getElementById('openHint');
  function unlock(){ document.body.classList.remove('locked'); }
  function dismiss(fast){
    unlock();
    if (fast){ intro.style.display = 'none'; return; }
    intro.classList.add('away');
    setTimeout(function(){ intro.style.display = 'none'; }, 1250);
  }
  if (reduced){ unlock(); intro.style.display = 'none'; return; }
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
  var sx = null;
  tome.addEventListener('touchstart', function(e){ sx = e.touches[0].clientX; }, { passive: true });
  tome.addEventListener('touchend', function(e){
    if (sx === null) return;
    if (e.changedTouches[0].clientX - sx < -34) turnNext();
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

/* ════════════ PROGRESS · STREAM · STICKY CTA ════════════ */
(function(){
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
    if (prog) prog.style.width = (p * 100) + '%';
    if (path && !reduced) path.style.strokeDashoffset = String(len * (1 - Math.min(1, p * 1.15)));
    if (sticky) sticky.classList.toggle('show', top > window.innerHeight * .7 && p < .92);
  }
  window.addEventListener('scroll', function(){ requestAnimationFrame(onScroll); }, { passive: true });
  onScroll();
})();

/* ════════════ HERO · INK BECOMES ORCHARD (home only) ════════════ */
(function(){
  var hero = document.getElementById('hero');
  if (!hero) return;
  var pin = document.getElementById('heroPin');
  var ink = document.getElementById('heroInk');
  var real = document.getElementById('heroReal');
  var video = document.getElementById('heroVideo');
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
    // a long pin and a heavy scrub make the dissolve feel like slow breathing
    var tl = gsap.timeline({
      defaults: { ease: 'power1.inOut' },
      scrollTrigger: {
        trigger: hero, start: 'top top', end: '+=240%',
        scrub: 1.2, pin: pin,
        onUpdate: function(self){
          hero.classList.toggle('lit', self.progress > .42);
          if (self.progress > .04) startVideo();
        }
      }
    });
    // reality breathes in beneath the ink — long, gentle, overlapping
    tl.fromTo(real, { opacity: 0, scale: 1.07 }, { opacity: 1, scale: 1, duration: 1.05 }, 0);
    // the sketch dissolves nearest strokes first — tree by tree, mountain by mountain
    layers.slice().sort(function(a, b){ return (+a.dataset.morph) - (+b.dataset.morph); })
      .forEach(function(l, i){
        tl.to(l, { opacity: 0, y: -26 - i * 12, filter: 'blur(3px)', duration: .52 }, .10 + i * .16);
      });
    tl.to('.scroll-cue', { opacity: 0, duration: .2 }, .22);
  } else {
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
   (lives on the Our Projects page)
════════════════════════════════════════════════ */
(function(){
  var reader = document.getElementById('reader');
  var openBtn = document.getElementById('openStoryOne');
  // on pages without the reader, the Story One book leads to /projects
  if (!reader){
    if (openBtn) openBtn.addEventListener('click', function(){ window.location.href = '/projects'; });
    return;
  }
  var fb = document.getElementById('flipbook');
  var prevB = document.getElementById('pgPrev'), nextB = document.getElementById('pgNext');
  var count = document.getElementById('pgCount');
  var pages = null, spread = 0, turning = false, lastFocus = null;

  var IMG = {
    orchard: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700&q=80',
    hills: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=700&q=80',
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
        '<figure><img loading="lazy" decoding="async" src="' + IMG.orchard + '" alt="Mature mango orchard rows"><figcaption>the west rows, in fruit</figcaption></figure>' +
        '<figure><img loading="lazy" decoding="async" src="' + IMG.hills + '" alt="Nilgiris hills at dawn"><figcaption>the Nilgiris, from plot 4</figcaption></figure>' +
        '<figure class="wide"><img loading="lazy" decoding="async" src="' + IMG.valley + '" alt="Valley panorama in morning light"><figcaption>morning, over the valley</figcaption></figure>' +
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
      '<div class="fbp-cta"><a class="btn btn-ink" href="/portal">See every project in the Portal</a></div>' +
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
      '<div class="fbp-body"><p>Of the twenty-six places in this book, <strong>fifteen</strong> remain unwritten. We admit families slowly, and always after a morning at the farm.</p>' +
      '<p>Come out with us. Walk the rows, read the papers, meet a family or two. If the land speaks to you, you’ll know.</p></div>' +
      '<div class="fbp-cta"><a class="btn btn-ink" href="/#chapter">Plan a visit</a>' +
      '<a class="btn btn-ghost" style="border-color:var(--ink);color:var(--ink);background:transparent" href="https://wa.me/919003746953" target="_blank" rel="noopener">WhatsApp us</a></div>' +
      '<p class="fbp-fold">We would rather lose a sale than lose your trust.</p>' +
      '<span class="fbp-no">7</span>'
    ];
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
  }

  function turn(dir){
    if (turning) return;
    var total = spreadsCount();
    var target = spread + dir;
    if (target < 0 || target > total - 1) return;
    if (reduced || mobile()){ spread = target; render(); return; }
    turning = true;
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
  fb.addEventListener('click', function(e){
    if (e.target.closest('a, button')) return;
    var r = fb.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width;
    if (x > .62) turn(1); else if (x < .38) turn(-1);
  });
  var tx = null;
  fb.addEventListener('touchstart', function(e){ tx = e.touches[0].clientX; }, { passive: true });
  fb.addEventListener('touchend', function(e){
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx;
    if (dx < -40) turn(1); else if (dx > 40) turn(-1);
    tx = null;
  }, { passive: true });
  window.addEventListener('resize', function(){ if (!reader.hidden){ spread = 0; render(); } });
})();

// "coming soon" books whisper instead of opening
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
   THE PORTAL · atlas of projects (portal page)
   One marker per project — the aggregator works at
   the level of estates, not individual plots.
════════════════════════════════════════════════ */
(function atlas(){
  var svg = document.getElementById('indiaMap');
  if (!svg) return;
  var NS = 'http://www.w3.org/2000/svg';
  var mk = document.getElementById('markers');
  var tip = document.getElementById('mapTip');
  var atlasBox = document.getElementById('atlasBox');
  var note = document.getElementById('resultsNote');

  var PROJECTS = [
    { id: 'mm',    name: 'Mango Meadows · Agali',      x: 214, y: 540, cls: 'verified' },
    { id: 'coorg', name: 'Coffee Canopy · Coorg',      x: 186, y: 498, cls: 'pending' },
    { id: 'sak',   name: 'Areca Vale · Sakleshpur',    x: 182, y: 476, cls: 'pending' },
    { id: 'way',   name: 'Pepper Hollow · Wayanad',    x: 200, y: 518, cls: 'ghost' },
    { id: 'hos',   name: 'Lantern Lake · Hosur',       x: 238, y: 498, cls: 'ghost' }
  ];
  PROJECTS.forEach(function(f){
    var g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'marker ' + f.cls);
    g.dataset.id = f.id;
    var halo = document.createElementNS(NS, 'circle');
    halo.setAttribute('class', 'halo'); halo.setAttribute('cx', f.x); halo.setAttribute('cy', f.y); halo.setAttribute('r', 9);
    var dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('class', 'dot'); dot.setAttribute('cx', f.x); dot.setAttribute('cy', f.y);
    dot.setAttribute('r', f.cls === 'ghost' ? 5 : 8);
    g.appendChild(halo); g.appendChild(dot);
    if (f.cls !== 'ghost'){
      var t = document.createElementNS(NS, 'text');
      t.setAttribute('x', f.x + 14); t.setAttribute('y', f.y + 4);
      t.textContent = f.name.split('·')[1].trim();
      g.appendChild(t);
    }
    mk.appendChild(g);
    g.addEventListener('mouseenter', function(){ showTip(f, dot); });
    g.addEventListener('mouseleave', function(){ tip.classList.remove('show'); });
    if (f.cls !== 'ghost'){
      g.style.cursor = 'pointer';
      g.addEventListener('click', function(){
        var card = document.querySelector('.book[data-id="' + f.id + '"]');
        if (card){
          card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
          card.classList.add('lit'); setTimeout(function(){ card.classList.remove('lit'); }, 2200);
        }
      });
    }
  });
  function showTip(f, dot){
    var pt = svg.createSVGPoint(); pt.x = f.x; pt.y = f.y - 12;
    var sp = pt.matrixTransform(dot.getScreenCTM());
    var br = atlasBox.getBoundingClientRect();
    tip.textContent = f.name;
    tip.style.left = (sp.x - br.left) + 'px'; tip.style.top = (sp.y - br.top) + 'px';
    tip.classList.add('show');
  }
  // card hover → marker halo
  document.querySelectorAll('.book[data-id]').forEach(function(card){
    card.addEventListener('mouseenter', function(){
      var m = mk.querySelector('.marker[data-id="' + card.dataset.id + '"]'); if (m) m.classList.add('lit');
    });
    card.addEventListener('mouseleave', function(){
      var m = mk.querySelector('.marker[data-id="' + card.dataset.id + '"]'); if (m) m.classList.remove('lit');
    });
  });

  /* filters over the shelf of projects */
  var state = { status: 'all', region: 'all', crop: 'all' };
  document.querySelectorAll('.fbtns[data-filter]').forEach(function(group){
    group.addEventListener('click', function(e){
      var b = e.target.closest('.fbtn'); if (!b) return;
      group.querySelectorAll('.fbtn').forEach(function(x){ x.classList.remove('on'); });
      b.classList.add('on');
      state[group.dataset.filter] = b.dataset.v;
      applyFilters();
    });
  });
  function applyFilters(){
    var books = document.querySelectorAll('.book[data-id]');
    var shown = 0;
    books.forEach(function(bk){
      var ok = (state.status === 'all' || bk.dataset.status === state.status)
        && (state.region === 'all' || bk.dataset.region === state.region)
        && (state.crop === 'all' || bk.dataset.crop === state.crop);
      bk.classList.toggle('hiding', !ok);
      if (ok) shown++;
      var m = mk.querySelector('.marker[data-id="' + bk.dataset.id + '"]');
      if (m) m.classList.toggle('dim', !ok);
    });
    var total = document.querySelectorAll('.book[data-id]').length;
    note.textContent = shown === total ? 'Showing every story on the shelf.'
      : shown === 0 ? 'No stories match — the shelf is quiet. Loosen a filter.'
      : 'Showing ' + shown + (shown === 1 ? ' story' : ' stories') + ' on the shelf.';
  }
})();

/* ════════════ JOURNAL TABS · COUNTERS · TYPEWRITER ════════════ */
(function(){
  var tabs = document.querySelectorAll('.js-tab');
  if (!tabs.length) return;
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
    f.querySelector('.wc-submit').textContent = 'Held ✓ — we’ll write to you';
    f.querySelector('.wc-submit').disabled = true;
    toast('Thank you' + (name ? ', ' + name : '') + ' — a morning is held. We reply personally, usually within a day.');
  });
})();
(function(){
  var track = document.getElementById('tickerTrack');
  if (track) track.innerHTML += track.innerHTML;
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

/* ════════════ 3D ORCHARD · lazy (home only) ════════════ */
(function(){
  var stage = document.getElementById('orchardStage');
  var canvas = document.getElementById('orchardCanvas');
  if (!stage || !canvas) return;
  window.__orchardProgress = 0;

  var caps = [].slice.call(document.querySelectorAll('.ocap'));
  function setCaption(p){
    var idx = Math.min(3, Math.floor(p * 4));
    caps.forEach(function(c, i){ c.classList.toggle('on', i === idx); });
  }

  if (hasGsap && !reduced){
    ScrollTrigger.create({
      trigger: stage, start: 'top 70%', end: 'bottom bottom', scrub: .6,
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
        s.src = '/js/orchard.js';
        s.onload = function(){ if (window.initOrchard) window.initOrchard(canvas, { reduced: reduced }); };
        document.head.appendChild(s);
      }
    });
  }, { rootMargin: '600px' });
  io.observe(stage);
})();

})();
