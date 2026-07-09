/* ════════════════════════════════════════════════════════════
   THE FARM STORIES · orchard.js
   A handcrafted miniature of Mango Meadows, lazy-loaded.
   Scroll drives the camera; the light walks from dawn to noon.
════════════════════════════════════════════════════════════ */
(function(){
'use strict';

function loadThree(cb){
  if (window.THREE) return cb();
  var s = document.createElement('script');
  s.src = '/js/vendor/three.min.js';
  s.onload = cb;
  s.onerror = function(){ /* the chapter stays a written one */ };
  document.head.appendChild(s);
}

window.initOrchard = function(canvas, opts){
  opts = opts || {};
  loadThree(function(){ build(canvas, opts); });
};

function build(canvas, opts){
  var THREE = window.THREE;
  var reduced = !!opts.reduced;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xf1ead8, 0.016);

  var camera = new THREE.PerspectiveCamera(38, 2, 0.1, 400);

  /* ── light: dawn, walking toward noon ── */
  var hemi = new THREE.HemisphereLight(0xfff3dd, 0x8a7a55, 0.75);
  scene.add(hemi);
  var sun = new THREE.DirectionalLight(0xffc07a, 1.5);
  sun.position.set(-40, 18, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -40; sun.shadow.camera.right = 40;
  sun.shadow.camera.top = 40; sun.shadow.camera.bottom = -40;
  scene.add(sun);

  /* ── the diorama ── */
  var world = new THREE.Group();
  scene.add(world);

  // island base — a slab of "model" earth
  var baseGeo = new THREE.CylinderGeometry(34, 30, 5, 48, 1);
  var base = new THREE.Mesh(baseGeo, new THREE.MeshStandardMaterial({ color: 0xb59a6f, flatShading: true }));
  base.position.y = -2.6;
  world.add(base);

  // terrain — gentle hills
  var terrGeo = new THREE.CircleGeometry(34, 64, 0, Math.PI * 2);
  terrGeo.rotateX(-Math.PI / 2);
  var pos = terrGeo.attributes.position;
  for (var i = 0; i < pos.count; i++){
    var x = pos.getX(i), z = pos.getZ(i);
    var d = Math.sqrt(x * x + z * z);
    var h = Math.sin(x * .16) * Math.cos(z * .14) * 1.5
          + Math.sin(x * .05 + 2) * 1.1
          + Math.max(0, 1 - d / 34) * .4;
    // keep the heart of the estate level, soften the rim
    var flat = Math.max(0, 1 - d / 14);
    h *= (1 - flat * .82);
    h -= Math.max(0, (d - 28)) * .28;
    pos.setY(i, h);
  }
  terrGeo.computeVertexNormals();
  var terrain = new THREE.Mesh(terrGeo, new THREE.MeshStandardMaterial({ color: 0x7d9a62, flatShading: true }));
  terrain.receiveShadow = true;
  world.add(terrain);

  function groundY(x, z){
    var d = Math.sqrt(x * x + z * z);
    var h = Math.sin(x * .16) * Math.cos(z * .14) * 1.5 + Math.sin(x * .05 + 2) * 1.1
          + Math.max(0, 1 - d / 34) * .4;
    var flat = Math.max(0, 1 - d / 14);
    h *= (1 - flat * .82);
    h -= Math.max(0, (d - 28)) * .28;
    return h;
  }

  // the loop road
  var road = new THREE.Mesh(
    new THREE.TorusGeometry(13.5, 1.1, 3, 72),
    new THREE.MeshStandardMaterial({ color: 0xcfc3a4, flatShading: true })
  );
  road.rotation.x = Math.PI / 2;
  road.scale.set(1, .78, 1);
  road.position.y = .16;
  world.add(road);
  var drive = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, .2, 12),
    road.material
  );
  drive.position.set(0, .14, 16.4);
  world.add(drive);

  // the stream, west side
  var streamPts = [];
  for (var sIdx = 0; sIdx <= 20; sIdx++){
    var t = sIdx / 20;
    streamPts.push(new THREE.Vector3(
      -22 + Math.sin(t * 6.2) * 2.4,
      .12,
      -26 + t * 52
    ));
  }
  var stream = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(streamPts), 40, .9, 5, false),
    new THREE.MeshStandardMaterial({ color: 0x9fb6c0, flatShading: true })
  );
  stream.scale.y = .16;
  world.add(stream);

  // the lake, north-east
  var lake = new THREE.Mesh(
    new THREE.CircleGeometry(4.6, 26),
    new THREE.MeshStandardMaterial({ color: 0x9fb6b3, flatShading: true })
  );
  lake.rotation.x = -Math.PI / 2;
  lake.position.set(15, .34 + groundY(15, -14) * 0, -14);
  lake.position.y = groundY(15, -14) + .12;
  world.add(lake);

  // the pavilion at the heart
  var pav = new THREE.Group();
  var pavBase = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.8, .5, 8),
    new THREE.MeshStandardMaterial({ color: 0xd8cdb0, flatShading: true }));
  pavBase.position.y = .25; pavBase.castShadow = true;
  var pavRoof = new THREE.Mesh(new THREE.ConeGeometry(3, 1.7, 8),
    new THREE.MeshStandardMaterial({ color: 0x8a5a3a, flatShading: true }));
  pavRoof.position.y = 2.1; pavRoof.castShadow = true;
  var pavPosts = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, 1.4, 5),
    new THREE.MeshStandardMaterial({ color: 0x6b533a }));
  for (var pp = 0; pp < 6; pp++){
    var post = pavPosts.clone();
    post.position.set(Math.cos(pp / 6 * Math.PI * 2) * 2.2, 1, Math.sin(pp / 6 * Math.PI * 2) * 2.2);
    pav.add(post);
  }
  pav.add(pavBase); pav.add(pavRoof);
  world.add(pav);

  // homesteads along the ring
  var houseBody = new THREE.MeshStandardMaterial({ color: 0xf0e7d0, flatShading: true });
  var houseRoof = new THREE.MeshStandardMaterial({ color: 0x9a5f3c, flatShading: true });
  for (var hh = 0; hh < 8; hh++){
    var ang = hh / 8 * Math.PI * 2 + .35;
    var hx = Math.cos(ang) * 17.5, hz = Math.sin(ang) * 13.4;
    var hg = new THREE.Group();
    var b = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.1, 1.3), houseBody);
    b.position.y = .55; b.castShadow = true;
    var rGeo = new THREE.CylinderGeometry(0, 1.32, .85, 4);
    var rf = new THREE.Mesh(rGeo, houseRoof);
    rf.position.y = 1.52; rf.rotation.y = Math.PI / 4; rf.castShadow = true;
    hg.add(b); hg.add(rf);
    hg.position.set(hx, groundY(hx, hz), hz);
    hg.rotation.y = -ang;
    world.add(hg);
  }

  /* ── the orchard: instanced mango trees ── */
  var spots = [];
  var tries = 0;
  while (spots.length < 110 && tries < 900){
    tries++;
    var tx = (Math.random() * 2 - 1) * 27, tz = (Math.random() * 2 - 1) * 27;
    var td = Math.sqrt(tx * tx + tz * tz);
    if (td > 28) continue;                                     // off the island
    var er = Math.sqrt((tx * tx) / (13.5 * 13.5) + (tz * tz) / (10.6 * 10.6));
    if (er > .86 && er < 1.16) continue;                       // not on the road
    if (Math.abs(tx) < 1.8 && tz > 12) continue;               // not on the drive
    if (Math.hypot(tx - 15, tz + 14) < 6) continue;            // not in the lake
    if (Math.hypot(tx, tz) < 4) continue;                      // not in the pavilion
    if (Math.hypot(tx + 22, 0) < 2.6 && Math.abs(tx + 22) < 3) continue; // not in the stream
    spots.push([tx, tz]);
  }
  var nT = spots.length;
  var trunkGeo = new THREE.CylinderGeometry(.13, .2, 1.1, 5);
  var canGeo = new THREE.IcosahedronGeometry(1, 0);
  var trunks = new THREE.InstancedMesh(trunkGeo, new THREE.MeshStandardMaterial({ color: 0x6b533a, flatShading: true }), nT);
  var canA = new THREE.InstancedMesh(canGeo, new THREE.MeshStandardMaterial({ color: 0x5f7d48, flatShading: true }), nT);
  var canB = new THREE.InstancedMesh(canGeo, new THREE.MeshStandardMaterial({ color: 0x74915a, flatShading: true }), nT);
  trunks.castShadow = canA.castShadow = canB.castShadow = true;
  var m = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  var mangoPos = [];
  for (var ti = 0; ti < nT; ti++){
    var sx = spots[ti][0], sz = spots[ti][1];
    var gy = groundY(sx, sz);
    var scale = .75 + Math.random() * .65;
    q.setFromEuler(new THREE.Euler(0, Math.random() * Math.PI, 0));
    m.compose(v.set(sx, gy + .55 * scale, sz), q, sc.set(scale, scale, scale));
    trunks.setMatrixAt(ti, m);
    m.compose(v.set(sx, gy + (1.35 + Math.random() * .2) * scale, sz), q,
      sc.set(scale * (1 + Math.random() * .3), scale * .9, scale * (1 + Math.random() * .3)));
    canA.setMatrixAt(ti, m);
    m.compose(v.set(sx + (Math.random() - .5) * .8, gy + (1.8 + Math.random() * .3) * scale, sz + (Math.random() - .5) * .8),
      q, sc.set(scale * .7, scale * .6, scale * .7));
    canB.setMatrixAt(ti, m);
    if (ti % 3 === 0) mangoPos.push([sx + (Math.random() - .5), gy + 1.2 * scale, sz + (Math.random() - .5)]);
  }
  world.add(trunks); world.add(canA); world.add(canB);
  // hanging mangoes — tiny gold drops
  var mango = new THREE.InstancedMesh(
    new THREE.SphereGeometry(.11, 5, 4),
    new THREE.MeshStandardMaterial({ color: 0xe8b23a }),
    mangoPos.length
  );
  for (var mi = 0; mi < mangoPos.length; mi++){
    m.compose(v.set(mangoPos[mi][0], mangoPos[mi][1], mangoPos[mi][2]), q.identity(), sc.set(1, 1.25, 1));
    mango.setMatrixAt(mi, m);
  }
  world.add(mango);

  /* ── birds ── */
  var birds = [];
  var birdMat = new THREE.MeshBasicMaterial({ color: 0x3a3a34, side: THREE.DoubleSide });
  for (var bi = 0; bi < 5; bi++){
    var wingGeo = new THREE.BufferGeometry();
    wingGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
      -.55, 0, 0, 0, 0, .16, 0, 0, -.16,
       .55, 0, 0, 0, 0, .16, 0, 0, -.16
    ]), 3));
    var bird = new THREE.Mesh(wingGeo, birdMat);
    bird.userData = { r: 15 + Math.random() * 9, h: 9 + Math.random() * 4,
      sp: .12 + Math.random() * .1, ph: Math.random() * Math.PI * 2 };
    world.add(bird);
    birds.push(bird);
  }

  /* ── render loop, scroll-driven ── */
  var clock = new THREE.Clock();
  var running = true;
  new IntersectionObserver(function(es){
    es.forEach(function(en){ running = en.isIntersecting; });
  }, { rootMargin: '120px' }).observe(canvas);

  function resize(){
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    if (canvas.width !== Math.floor(w * renderer.getPixelRatio())){
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }
  window.addEventListener('resize', resize);

  var dawn = new THREE.Color(0xffc07a), noon = new THREE.Color(0xfff4e0);
  var sunCol = new THREE.Color();
  var pSmooth = 0;

  function frame(){
    requestAnimationFrame(frame);
    if (!running) return;
    resize();
    var t = clock.getElapsedTime();
    // ease toward the raw scroll value — the scene does its own scrubbing
    pSmooth += (((reduced ? .5 : window.__orchardProgress) || 0) - pSmooth) * .07;
    var p = pSmooth;

    // the model rises to meet you, then the camera walks around it
    var rise = Math.min(1, p * 5);
    world.position.y = (1 - rise) * -7;
    world.scale.setScalar(.92 + rise * .08);

    var drift = reduced ? 0 : t * .02;
    var ang = -.9 + p * Math.PI * 1.35 + drift;
    var radius = 46 - p * 12;
    var height = 26 - p * 9 + Math.sin(t * .1) * .4;
    camera.position.set(Math.cos(ang) * radius, height, Math.sin(ang) * radius);
    camera.lookAt(0, 1.5, 0);

    // dawn → noon
    sunCol.copy(dawn).lerp(noon, p);
    sun.color = sunCol;
    sun.intensity = 1.2 + p * .9;
    sun.position.set(Math.cos(-.6 + p * 2.2) * 40, 12 + p * 26, Math.sin(-.6 + p * 2.2) * 30);
    hemi.intensity = .6 + p * .35;
    scene.fog.density = .020 - p * .011;

    birds.forEach(function(b, i){
      var u = b.userData;
      var ba = t * u.sp + u.ph;
      b.position.set(Math.cos(ba) * u.r, u.h + Math.sin(t * .7 + i) * .8, Math.sin(ba) * u.r * .72);
      b.rotation.y = -ba;
      b.rotation.z = Math.sin(t * 9 + i * 2) * .55; // the flap
    });

    renderer.render(scene, camera);
  }
  resize();
  frame();
}
})();
