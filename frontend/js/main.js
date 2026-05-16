/* ── main.js — Portfolio Frontend Logic ─────────────────────────── */

const API = window.location.origin; // points to Flask backend

/* ── LOADER ─────────────────────────────────────────────────────── */
window.addEventListener('load', function () {
  setTimeout(function () {
    document.getElementById('loader').classList.add('hide');
  }, 1400);
  trackView('home');
});

/* ── STICKY NAV ─────────────────────────────────────────────────── */
window.addEventListener('scroll', function () {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 50);
});

/* ── HAMBURGER ──────────────────────────────────────────────────── */
document.getElementById('hbg').addEventListener('click', function () {
  document.getElementById('mobNav').classList.toggle('open');
});
function closeMob() {
  document.getElementById('mobNav').classList.remove('open');
}

/* ── SCROLL REVEAL ──────────────────────────────────────────────── */
var obs = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(function (el) { obs.observe(el); });

/* ── HERO GLOW FOLLOW ───────────────────────────────────────────── */
if (window.innerWidth > 900) {
  var glow = document.getElementById('heroGlow');
  var hero = document.getElementById('hero');
  hero.addEventListener('mousemove', function (e) {
    var r = hero.getBoundingClientRect();
    glow.style.left      = (e.clientX - r.left) + 'px';
    glow.style.top       = (e.clientY - r.top)  + 'px';
    glow.style.transform = 'translate(-50%, -50%)';
  });
}

/* ── CONTACT FORM ───────────────────────────────────────────────── */
document.getElementById('contactForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  clearFormErrors();

  var name    = document.getElementById('cName').value.trim();
  var email   = document.getElementById('cEmail').value.trim();
  var message = document.getElementById('cMsg').value.trim();
  var btn     = document.getElementById('sendBtn');
  var status  = document.getElementById('formStatus');

  // Client-side validation
  var ok = true;
  if (!name)           { showFieldError('cName',  'Name is required.');            ok = false; }
  if (!email)          { showFieldError('cEmail', 'Email is required.');           ok = false; }
  else if (!/\S+@\S+\.\S+/.test(email)) { showFieldError('cEmail', 'Enter a valid email.'); ok = false; }
  if (!message)        { showFieldError('cMsg',   'Message is required.');         ok = false; }

  if (!ok) return;

  // Disable button while sending
  btn.disabled       = true;
  btn.textContent    = 'Sending…';
  status.className   = 'form-status';
  status.style.display = 'none';

  try {
    var res = await fetch(API + '/api/contact', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, message })
    });
    var data = await res.json();

    if (res.ok && data.success) {
      status.textContent  = '✓  ' + data.message;
      status.className    = 'form-status success';
      document.getElementById('contactForm').reset();
    } else {
      // Server validation errors
      if (data.errors) {
        Object.keys(data.errors).forEach(function (field) {
          var idMap = { name: 'cName', email: 'cEmail', message: 'cMsg' };
          if (idMap[field]) showFieldError(idMap[field], data.errors[field]);
        });
      }
      status.textContent = data.message || 'Something went wrong. Please try again.';
      status.className   = 'form-status error';
    }
  } catch (err) {
    status.textContent = 'Network error — please email me directly at khadagtayash@gmail.com';
    status.className   = 'form-status error';
  } finally {
    btn.disabled    = false;
    btn.textContent = 'Send Message →';
  }
});

function showFieldError(fieldId, msg) {
  var field = document.getElementById(fieldId);
  field.classList.add('error');
  var err = document.createElement('p');
  err.className   = 'field-error';
  err.textContent = msg;
  field.parentNode.insertBefore(err, field.nextSibling);
}
function clearFormErrors() {
  document.querySelectorAll('.field-error').forEach(function (el) { el.remove(); });
  document.querySelectorAll('.cform input, .cform textarea').forEach(function (el) {
    el.classList.remove('error');
  });
  var status = document.getElementById('formStatus');
  status.className    = 'form-status';
  status.style.display = 'none';
}

/* ── CERT MODAL ─────────────────────────────────────────────────── */
var DRIVE = 'https://drive.google.com/drive/folders/1_VOZtPOdk5Zqh_ZkbSvErZkquZ4Ts1rG';
var CERTS = {
  oracle:         { icon:'☁️',  title:'Oracle Cloud Infrastructure – Certified Generative AI Professional', org:'Oracle · 2025',      desc:'Industry-recognized certification validating expertise in Generative AI on Oracle Cloud Infrastructure. Covers LLMs, prompt engineering, vector databases, OCI AI services, and responsible AI practices.' },
  gcp:            { icon:'📊',  title:'Google Cloud Launchpad – Data Analytics Track',                       org:'Google Cloud',        desc:'Completion of Google Cloud\'s Data Analytics learning path covering BigQuery, Looker Studio, data pipelines, and cloud-native analytics tooling. Demonstrates practical skills processing large datasets on GCP.' },
  'nptel-python': { icon:'🐍',  title:'Python for Data Science & Computing',                                 org:'NPTEL · IIT Madras',  desc:'NPTEL certification from IIT Madras on Python fundamentals, NumPy, Pandas, and scientific computing. A rigorous 12-week course with proctored examination.' },
  'nptel-c':      { icon:'💻',  title:'Programming in C',                                                    org:'NPTEL · IIT Madras',  desc:'NPTEL course on C programming — covering pointers, memory management, file I/O, and low-level system concepts. Builds a strong foundation in systems programming.' },
  'nptel-cpp':    { icon:'⚙️',  title:'Modern C++',                                                          org:'NPTEL · IIT Madras',  desc:'Advanced C++ certification covering C++11/14/17 features: move semantics, smart pointers, templates, STL, and object-oriented design patterns.' },
  'nptel-dsa':    { icon:'🧮',  title:'Data Structures & Algorithms in Java',                                org:'NPTEL · IIT Madras',  desc:'Comprehensive DSA certification using Java. Covers arrays, linked lists, trees, graphs, sorting/searching, dynamic programming, and complexity analysis.' },
  'nptel-hack':   { icon:'🔐',  title:'Ethical Hacking',                                                     org:'NPTEL · IIT Madras',  desc:'Certification on ethical hacking and penetration testing. Covers vulnerability assessment, network security, web application attacks, and defensive strategies.' },
  'nptel-entre':  { icon:'🚀',  title:'Entrepreneurship',                                                    org:'NPTEL · IIT Madras',  desc:'Course on entrepreneurship and new venture creation. Covers ideation, business models, market validation, funding strategies, and the startup ecosystem.' },
  mnit:           { icon:'🎓',  title:'MNIT Project Expo – Project Presenter',                               org:'MNIT Jaipur',         desc:'Certificate for presenting ML projects to faculty and industry experts at MNIT Jaipur\'s Technical Exhibition — one of India\'s premier NIT institutions.' },
  dcgc:           { icon:'💡',  title:'DCGC Hackathon 2.0 – Participant',                                    org:'DCGC',                desc:'Certificate of participation in DCGC Hackathon 2.0. Demonstrated problem-solving and technical depth under time-constrained competitive conditions.' }
};

function openCert(key) {
  var c = CERTS[key];
  if (!c) return;
  document.getElementById('mIcon').textContent  = c.icon;
  document.getElementById('mTitle').textContent = c.title;
  document.getElementById('mOrg').textContent   = c.org;
  document.getElementById('mDesc').textContent  = c.desc;
  document.getElementById('mLink').href         = DRIVE;
  document.getElementById('certModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCert() {
  document.getElementById('certModal').classList.remove('open');
  document.body.style.overflow = '';
}
function overlayClose(e) {
  if (e.target === document.getElementById('certModal')) closeCert();
}
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeCert();
});

/* ── PAGE VIEW TRACKING ─────────────────────────────────────────── */
function trackView(page) {
  fetch(API + '/api/track', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ page: page })
  }).catch(function () { /* silent fail */ });
}
