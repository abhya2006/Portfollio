const data = window.PORTFOLIO_DATA;
const motionChoice = localStorage.getItem('portfolio-motion') || 'on';
document.documentElement.dataset.motion = motionChoice;
const reduceMotion = motionChoice === 'off' || (window.matchMedia('(prefers-reduced-motion: reduce)').matches && motionChoice !== 'on');
const email = 'abhaykumarpathak6200@gmail.com';
const MOTION = Object.freeze({ revealDistance: 20, staggerMs: 65, projectStaggerMs: 105, modalMs: 190 });
document.documentElement.style.setProperty('--motion-distance', `${MOTION.revealDistance}px`);

// Brief entrance, released on the next frame instead of waiting for every asset.
requestAnimationFrame(() => document.querySelector('.preloader')?.classList.add('is-done'));
document.querySelector('#current-year').textContent = new Date().getFullYear();
const motionToggle = document.querySelector('.motion-toggle');
if (motionToggle) {
  const motionEnabled = !reduceMotion;
  motionToggle.textContent = motionEnabled ? 'MOTION ON' : 'MOTION OFF';
  motionToggle.setAttribute('aria-pressed', String(motionEnabled));
  motionToggle.setAttribute('aria-label', motionEnabled ? 'Pause website motion' : 'Enable website motion');
  motionToggle.addEventListener('click', () => {
    localStorage.setItem('portfolio-motion', motionEnabled ? 'off' : 'on');
    window.location.reload();
  });
}


// Type the hero copy on entry; accessible labels retain the complete text.
const heroTitle = document.querySelector('#hero-title');
const heroStatement = document.querySelector('.hero-statement');
const heroLines = [...document.querySelectorAll('.hero-type-line')];
if (heroTitle && heroStatement && heroLines.length && !reduceMotion) {
  const nameParts = [...heroTitle.querySelectorAll(':scope > span')].map((element) => {
    const outlined = element.classList.contains('title-outline');
    const target = outlined ? [...element.childNodes].find((node) => node.nodeType === Node.TEXT_NODE) : element;
    return { element, target, text: outlined ? 'PATHAK' : element.textContent.trim() };
  });
  const fullName = `${nameParts.map((part) => part.text).join(' ')}.`;
  const fullLines = heroLines.map((line) => line.textContent);
  nameParts.forEach(({element,target}) => { if (target?.nodeType === Node.TEXT_NODE) target.data = ''; else element.textContent = ''; });
  heroLines.forEach((line) => { line.textContent = ''; });
  heroTitle.setAttribute('aria-label', fullName);
  heroTitle.classList.add('is-typing');
  heroStatement.classList.add('is-typing');
  const typeText = (target, text, interval, complete) => {
    let position = 0;
    const next = () => {
      if (target.nodeType === Node.TEXT_NODE) target.data = text.slice(0, ++position);
      else target.textContent = text.slice(0, ++position);
      if (position < text.length) window.setTimeout(next, interval);
      else complete();
    };
    next();
  };
  const typeSequence = (step) => {
    if (step < nameParts.length) {
      const part = nameParts[step];
      part.element.classList.add('typing-active');
      typeText(part.target, part.text, 85, () => {
        part.element.classList.remove('typing-active');
        window.setTimeout(() => typeSequence(step + 1), 120);
      });
      return;
    }
    const lineIndex = step - nameParts.length;
    if (lineIndex < fullLines.length) {
      const line = heroLines[lineIndex];
      line.classList.add('typing-active');
      typeText(line, fullLines[lineIndex], 30, () => {
        line.classList.remove('typing-active');
        window.setTimeout(() => typeSequence(step + 1), 220);
      });
      return;
    }
    heroTitle.classList.remove('is-typing');
    heroStatement.classList.remove('is-typing');
  };
  window.setTimeout(() => typeSequence(0), 180);
}


// One passive, frame-coalesced scroll read drives header state and progress only.
const header = document.querySelector('.site-header');
const progress = document.querySelector('.scroll-progress > span');
const scrollRocket = document.querySelector('.scroll-rocket');
const scrollInfinity = document.querySelector('.scroll-infinity');
let scrollTick = 0;
function updateScrollChrome() {
  scrollTick = 0;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const amount = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  header?.classList.toggle('is-scrolled', window.scrollY > 16);
  progress?.style.setProperty('--scroll-scale', String(Math.min(1, Math.max(0, amount))));
  const travel = Math.min(1, Math.max(0, amount));
  if (scrollRocket) scrollRocket.style.top = `${12 + travel * 70}vh`;
  if (scrollInfinity) scrollInfinity.style.top = `${25 + (1 - travel) * 53}vh`;
}
window.addEventListener('scroll', () => {
  if (!scrollTick) scrollTick = requestAnimationFrame(updateScrollChrome);
}, {passive:true});
window.addEventListener('resize', updateScrollChrome, {passive:true});
updateScrollChrome();

// Accessible mobile navigation, including Escape and focus restoration.
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
function closeMenu(restoreFocus = false) {
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Open menu');
  nav?.classList.remove('is-open');
  document.body.classList.remove('menu-open');
  if (restoreFocus) menuButton?.focus();
}
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  nav?.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
  if (open) nav?.querySelector('a')?.focus();
});
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') closeMenu(true); });

// Highlight the current section in the compact navigation.
const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle('is-current', link.hash === `#${entry.target.id}`));
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));
}

// Gentle reveals, with a complete static fallback.
const revealItems = document.querySelectorAll('.about-copy,.about-visual,.about-foot,.section-heading,.skill-categories,.skill-detail,.architecture,.learning-grid,.contact-grid,.education-institution-banner,.education-roadmap,.education-experience,.timeline,.timeline-row,.credential-row,.learning-topic,.site-footer');
if ('IntersectionObserver' in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries, observer) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.12 });
  revealItems.forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${(index % 4) * MOTION.staggerMs}ms`);
    item.classList.add('reveal'); revealObserver.observe(item);
  });
} else revealItems.forEach((item) => item.classList.add('is-visible'));
const ambientSections=document.querySelectorAll('.section-pad[id]:not(.hero)');
if('IntersectionObserver'in window){
  const ambientObserver=new IntersectionObserver((entries)=>entries.forEach((entry)=>entry.target.classList.toggle('motion-visible',entry.isIntersecting)),{rootMargin:'100px'});
  ambientSections.forEach((section)=>ambientObserver.observe(section));
}else ambientSections.forEach((section)=>section.classList.add('motion-visible'));
const educationRoadmap=document.querySelector('.education-roadmap');
const educationRoadmapSvg=educationRoadmap?.querySelector('svg');
const avatarApproach=educationRoadmapSvg?.querySelector('#avatar-approach');
const avatarInfinityLoop=educationRoadmapSvg?.querySelector('#avatar-infinity-loop');
const roadAvatar=educationRoadmapSvg?.querySelector('.road-student');
const roadLights=[...(educationRoadmapSvg?.querySelectorAll('.road-light[data-path-offset]')||[])];
if(educationRoadmap&&avatarApproach&&avatarInfinityLoop&&roadAvatar){
  let approachLength=0,infinityLoopLength=0,travelled=0,roadFrame=0,lastRoadTime=0,roadActive=false;
  try{approachLength=avatarApproach.getTotalLength();infinityLoopLength=avatarInfinityLoop.getTotalLength();}catch{}
  const roadPoint=(distance)=>{
    if(distance<approachLength){
      const d=Math.max(0,distance);
      return {path:avatarApproach,length:approachLength,distance:d};
    }
    const d=infinityLoopLength>0?(distance-approachLength)%infinityLoopLength:0;
    return {path:avatarInfinityLoop,length:infinityLoopLength,distance:d};
  };
  const placeOnJourney=(element,distance,rotate=true)=>{
    const current=roadPoint(distance);
    if(!current.length)return;
    const next=roadPoint(distance+1);
    const a=current.path.getPointAtLength(Math.min(current.length,current.distance));
    const b=next.path.getPointAtLength(Math.min(next.length,next.distance));
    const angle=rotate?Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI:0;
    element.setAttribute('transform',`translate(${a.x.toFixed(2)} ${a.y.toFixed(2)}) rotate(${angle.toFixed(2)})`);
  };
  const placeRoadParty=()=>{
    placeOnJourney(roadAvatar,travelled);
    roadLights.forEach((light)=>{placeOnJourney(light,travelled+Number(light.dataset.pathOffset||0),false);light.classList.add('is-live');});
  };
  const stopRoadMotion=()=>{roadActive=false;lastRoadTime=0;if(roadFrame)cancelAnimationFrame(roadFrame);roadFrame=0;educationRoadmap.classList.remove('is-motion-active');};
  const animateRoad=(time)=>{
    if(!roadActive)return;
    if(!lastRoadTime)lastRoadTime=time;
    const elapsed=Math.min(40,time-lastRoadTime);lastRoadTime=time;
    travelled+=elapsed*.018; // 18 viewBox units per second: a calm, readable walk.
    placeRoadParty();
    roadFrame=requestAnimationFrame(animateRoad);
  };
  const startRoadMotion=()=>{
    if(reduceMotion||roadActive||approachLength<=0||infinityLoopLength<=0)return;
    roadActive=true;lastRoadTime=0;educationRoadmap.classList.add('is-motion-active');
    roadFrame=requestAnimationFrame(animateRoad);
  };
  placeRoadParty(); // The avatar starts on milestone 3, B.Tech.
  if(reduceMotion){educationRoadmap.classList.remove('is-motion-active');}
  else if('IntersectionObserver'in window){
    const roadMotionObserver=new IntersectionObserver((entries)=>entries.forEach((entry)=>entry.isIntersecting?startRoadMotion():stopRoadMotion()),{rootMargin:'90px',threshold:.02});
    roadMotionObserver.observe(educationRoadmap);
  }else startRoadMotion();
}
nav?.querySelectorAll('a').forEach((link,index)=>link.style.setProperty('--nav-index',index));

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

// Project art is generated locally; no fabricated screenshots or live metrics.
function projectArtwork(project) {
  const art = {
    shield: `<div class="dash-art"><div class="dash-top mono"><span>BHARATSHIELD</span><i>DEMO VIEW</i><b>●</b></div><div class="risk-row"><div class="risk-ring"><strong>RISK</strong><small>REVIEW</small></div><div class="risk-copy"><b>Transaction context</b><span>Decision flow · illustrative only</span><i>ALLOW <em>CHALLENGE</em> BLOCK</i></div></div><div class="entity-map"><span>ACCOUNT</span><i></i><span>DEVICE</span><i></i><span>EVENT</span></div><div class="stream-row mono"><i></i> SYNTHETIC EVENT STREAM <b>NO LIVE DATA</b></div></div>`,
    tasks: `<div class="task-art"><div class="task-top mono"><span>WORKSPACE / API</span><span>SPRING BOOT</span></div><div class="task-columns"><div><small>TO DO</small><b>API response design</b><span>MINI-014</span></div><div><small>IN PROGRESS</small><b>Persistence layer</b><span>MINI-021</span></div><div><small>DONE</small><b>Task model</b><span>MINI-008</span></div></div><div class="api-call mono">GET /api/tasks <i>→ 200 OK</i></div></div>`,
    findx: `<div class="match-art"><div class="match-top mono">FINDX AI <span>ILLUSTRATIVE MATCH</span></div><div class="match-items"><div class="item-visual lost"><small>LOST REPORT</small><b>Blue notebook</b><i>Library · Monday</i></div><div class="match-score"><span>?</span><small>POTENTIAL<br>MATCH</small></div><div class="item-visual found"><small>FOUND REPORT</small><b>Notebook, blue</b><i>Reading hall · Mon</i></div></div><div class="match-note mono">SYNTHETIC EXAMPLE · MATCHING STATUS TO VERIFY</div></div>`,
    network: `<div class="network-art"><div class="network-label mono">EDGE ROUTING STUDY <span>CONCEPT</span></div><svg viewBox="0 0 560 230" role="img" aria-label="Illustrative edge routing network"><g class="network-lines"><path d="M75 115 195 55M75 115 195 175M195 55 345 90M195 175 345 140M345 90 480 115M345 140 480 115"/><path class="route-path" d="M75 115 195 55 345 90 480 115"/></g><g class="network-nodes"><circle cx="75" cy="115" r="13"/><circle cx="195" cy="55" r="11"/><circle cx="195" cy="175" r="11"/><circle cx="345" cy="90" r="11"/><circle cx="345" cy="140" r="11"/><circle cx="480" cy="115" r="14"/></g><g class="network-text mono"><text x="46" y="151">CLIENT</text><text x="166" y="32">EDGE A</text><text x="165" y="205">EDGE B</text><text x="315" y="66">CACHE</text><text x="310" y="169">ROUTE</text><text x="440" y="151">SERVICE</text></g></svg><p class="mono">REQUEST FLOW · ILLUSTRATIVE ONLY</p></div>`,
    attendance: `<div class="attendance-art"><div class="attendance-head mono">SCHOOL / ATTENDANCE <span>WORKFLOW CONCEPT</span></div><div class="attendance-calendar"><div class="calendar-title">Daily register <b>MON · 12</b></div><div class="attendance-row"><i>01</i><span>Student record</span><b>PRESENT</b></div><div class="attendance-row"><i>02</i><span>Student record</span><b>PRESENT</b></div><div class="attendance-row"><i>03</i><span>Student record</span><em>REVIEW</em></div></div><div class="attendance-foot mono">PYTHON PROJECT · DETAILS TO VERIFY</div></div>`,
    satellite: `<div class="satellite-art"><div class="satellite-head mono">IMAGE PROCESSING <span>ILLUSTRATIVE PIPELINE</span></div><div class="satellite-grid"><div class="sat-view"><span>INPUT</span><i>◌</i></div><b>→</b><div class="sat-view enhanced"><span>ENHANCEMENT</span><i>◉</i></div><b>→</b><div class="sat-view"><span>REVIEW</span><i>⌖</i></div></div><p class="mono">NO BENCHMARK OR ACCURACY CLAIMS</p></div>`
  };
  return art[project.visual] || '';
}

const projectList = document.querySelector('#project-list');
projectList.innerHTML = data.projects.map((project, index) => `<article class="project-row ${index % 2 ? 'project-reverse' : ''}" data-project-row="${project.id}"><button class="project-open" type="button" data-project="${project.id}" aria-label="Open ${escapeHtml(project.name)} case study"><span class="project-visual project-visual-${project.visual}">${projectArtwork(project)}<span class="project-visual-index mono">${project.number} / 06</span><span class="project-open-icon">↗</span></span></button><div class="project-copy"><div class="project-meta mono"><span>${project.number} / 06</span><span>${escapeHtml(project.category)}</span></div><h3>${escapeHtml(project.name)}</h3><p>${escapeHtml(project.description)}</p><div class="project-status mono"><i></i>${escapeHtml(project.status)}</div><div class="tech-tags">${project.stack.slice(0,5).map((tech) => `<span>${escapeHtml(tech)}</span>`).join('')}</div><button class="case-link" type="button" data-project="${project.id}">EXPLORE CASE STUDY <span>↗</span></button></div></article>`).join('');
if ('IntersectionObserver' in window && !reduceMotion) {
  const projectObserver = new IntersectionObserver((entries, observer) => entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
  }), {threshold:.1});
  projectList.querySelectorAll('.project-row').forEach((row, index) => {
    row.style.setProperty('--reveal-delay', `${index % 2 * MOTION.projectStaggerMs}ms`); row.style.setProperty('--project-motion-order', String(index));
    row.classList.add('reveal'); projectObserver.observe(row);
  });
}

if(matchMedia('(pointer:fine)').matches&&!reduceMotion){
  projectList.querySelectorAll('.project-open').forEach((button)=>{
    const visual=button.querySelector('.project-visual');let rect;
    button.addEventListener('pointerenter',()=>{rect=visual.getBoundingClientRect();});
    button.addEventListener('pointermove',(event)=>{
      if(!rect)return;
      const x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;
      visual.style.setProperty('--tilt-x',`${-y*2.2}deg`);visual.style.setProperty('--tilt-y',`${x*2.8}deg`);
    },{passive:true});
    button.addEventListener('pointerleave',()=>{visual.style.setProperty('--tilt-x','0deg');visual.style.setProperty('--tilt-y','0deg');});
  });
}

const dialog = document.querySelector('#case-dialog');
const dialogContent = document.querySelector('#dialog-content');
let previousFocus = null;
function openProject(id) {
  const project = data.projects.find((item) => item.id === id);
  if (!project) return;
  previousFocus = document.activeElement;
  dialogContent.innerHTML = `<p class="eyebrow">${project.number} / CASE STUDY · ${escapeHtml(project.category)}</p><h2 id="case-title">${escapeHtml(project.name)}</h2><p class="dialog-status mono">${escapeHtml(project.status)}</p><p class="dialog-lead">${escapeHtml(project.description)}</p><div class="case-grid"><section><h3>Problem</h3><p>${escapeHtml(project.problem)}</p></section><section><h3>Solution</h3><p>${escapeHtml(project.solution)}</p></section><section><h3>Contribution</h3><p>${escapeHtml(project.contribution)}</p></section><section><h3>Lessons & decisions</h3><p>${escapeHtml(project.lessons)}</p>${project.decisions.map((decision) => `<p class="decision-line">${escapeHtml(decision)}</p>`).join('')}</section></div><div class="case-architecture"><h3>Architecture outline</h3><div>${project.architecture.map((part, i) => `<span>${escapeHtml(part)}</span>${i < project.architecture.length-1 ? '<b>→</b>' : ''}`).join('')}</div></div><div class="case-tech"><h3>Technology context</h3><div class="tech-tags">${project.stack.map((tech) => `<span>${escapeHtml(tech)}</span>`).join('')}</div></div><div class="case-links">${project.repos.length ? project.repos.map((repo) => `<a href="${escapeHtml(repo.url)}" target="_blank" rel="noreferrer">${escapeHtml(repo.label)} ↗</a>`).join('') : '<span class="mono">REPOSITORY / DEMO LINK TO ADD WHEN AVAILABLE</span>'}</div>`;
  dialog.showModal();
  dialog.querySelector('.dialog-close').focus();
}
let dialogCloseTimer = 0;
function closeProject() {
  if (!dialog.open || dialog.classList.contains('is-closing')) return;
  dialog.classList.add('is-closing');
  window.clearTimeout(dialogCloseTimer);
  dialogCloseTimer = window.setTimeout(() => { dialog.classList.remove('is-closing'); dialog.close(); }, reduceMotion ? 0 : MOTION.modalMs);
}
projectList.addEventListener('click', (event) => { const button = event.target.closest('[data-project]'); if (button) openProject(button.dataset.project); });
dialog.querySelector('.dialog-close').addEventListener('click', closeProject);
dialog.addEventListener('click', (event) => { if (event.target === dialog) closeProject(); });
dialog.addEventListener('cancel', (event) => { event.preventDefault(); closeProject(); });
dialog.addEventListener('close', () => previousFocus?.focus());

// Skill categories and project relationships.
const skillTabs = [...document.querySelectorAll('.skill-tab')];
const chipContainer = document.querySelector('#skill-chips');
function showSkillCategory(key) {
  const category = data.skills[key]; if (!category) return;
  const skillDetail=document.querySelector('.skill-detail');
  skillDetail.classList.remove('is-switching');requestAnimationFrame(()=>skillDetail.classList.add('is-switching'));
  skillTabs.forEach((tab) => { const active = tab.dataset.category === key; tab.classList.toggle('is-active', active); tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
  document.querySelector('#skill-category-title').textContent = category.title;
  document.querySelector('#skill-count').textContent = `${String(skillTabs.findIndex((tab) => tab.dataset.category === key)+1).padStart(2,'0')} — ${category.level}`;
  chipContainer.innerHTML = category.items.map(([name]) => `<button class="skill-chip" type="button" data-skill="${escapeHtml(name)}">${escapeHtml(name)} <span>+</span></button>`).join('');
  document.querySelector('#skill-description').textContent = 'Select a technology to see how it supports practical software engineering.';
  document.querySelector('#skill-project-links').innerHTML = '';
  chipContainer.querySelectorAll('.skill-chip').forEach((button, index) => {
    button.style.setProperty('--chip-index', index);
    button.addEventListener('click', () => {
    const item = category.items.find(([name]) => name === button.dataset.skill); if (!item) return;
    chipContainer.querySelectorAll('.skill-chip').forEach((chip) => chip.classList.toggle('is-selected', chip === button));
    document.querySelector('#skill-description').textContent = item[1];
    const related = data.projects.filter((project) => item[2].includes(project.id));
    document.querySelector('#skill-project-links').innerHTML = related.length ? `RELATED PROJECTS ${related.map((project) => `<button type="button" data-project="${project.id}">${escapeHtml(project.name)} ↗</button>`).join('')}` : 'RELATED PROJECTS · EXPLORATION';
    document.querySelectorAll('#skill-project-links [data-project]').forEach((link) => link.addEventListener('click', () => openProject(link.dataset.project)));
    });
  });
  chipContainer.querySelector('.skill-chip')?.click();
}
skillTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => showSkillCategory(tab.dataset.category));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowDown','ArrowUp','ArrowRight','ArrowLeft'].includes(event.key)) return;
    event.preventDefault(); const delta = ['ArrowDown','ArrowRight'].includes(event.key) ? 1 : -1;
    const next = skillTabs[(index + delta + skillTabs.length) % skillTabs.length]; next.focus(); next.click();
  });
});
showSkillCategory('programming');

// System design lab component exploration.
let archIndex = 0;
const archNodes = [...document.querySelectorAll('.arch-node')];
function showArchitecture(index) {
  archIndex = (index + data.architecture.length) % data.architecture.length;
  const component = data.architecture[archIndex];
  const panel=document.querySelector('.architecture-info');panel.classList.remove('is-updating');requestAnimationFrame(()=>panel.classList.add('is-updating'));
  document.querySelector('#architecture-label').textContent = component.label;
  document.querySelector('#architecture-name').textContent = component.name;
  document.querySelector('#architecture-description').textContent = component.description;
  document.querySelector('#architecture-tradeoff').textContent = component.tradeoff;
  document.querySelector('#architecture-step').textContent = `${String(archIndex+1).padStart(2,'0')} / ${String(data.architecture.length).padStart(2,'0')}`;
  archNodes.forEach((node) => node.classList.toggle('is-selected', node.dataset.node === ['client','gateway','service','database','cache','events'][archIndex]));
  document.querySelector('.architecture-diagram').style.setProperty('--flow-step', archIndex);
}
archNodes.forEach((node) => node.addEventListener('click', () => showArchitecture(['client','gateway','service','database','cache','events'].indexOf(node.dataset.node))));
document.querySelector('.arch-prev').addEventListener('click', () => showArchitecture(archIndex-1));
document.querySelector('.arch-next').addEventListener('click', () => showArchitecture(archIndex+1));

// Timeline, credentials, learning topics from centralized data.
document.querySelector('#timeline').innerHTML = data.journey.map((item) => `<article class="timeline-row"><span class="timeline-date mono">${escapeHtml(item.date)}</span><span class="timeline-node"></span><div class="timeline-copy"><span class="timeline-tag mono">${escapeHtml(item.tag)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></div></article>`).join('');
document.querySelector('#credential-list').innerHTML = data.credentials.map((name, index) => `<article class="credential-row"><span class="credential-number mono">${String(index+1).padStart(2,'0')}</span><h3>${escapeHtml(name)}</h3><span class="credential-status mono">REPORTED · VERIFICATION DETAILS TO ADD</span><span class="credential-mark">↗</span></article>`).join('');
document.querySelector('#learning-topics').innerHTML = data.learning.map((topic, index) => `<div class="learning-topic"><span class="mono">${String(index+1).padStart(2,'0')}</span><b>${escapeHtml(topic)}</b><i>↗</i></div>`).join('');

// Copy email with a truthful, accessible fallback if clipboard access is denied.
document.querySelector('#copy-email').addEventListener('click', async (event) => {
  const button = event.currentTarget; const feedback = document.querySelector('#copy-feedback');
  try { await navigator.clipboard.writeText(button.dataset.email); feedback.textContent = 'Email copied.'; }
  catch { feedback.textContent = `Email: ${button.dataset.email}`; }
  window.setTimeout(() => { feedback.textContent = ''; }, 3500);
});
document.querySelectorAll('[data-placeholder="true"]').forEach((link) => link.addEventListener('click', (event) => { event.preventDefault(); document.querySelector('#copy-feedback').textContent = 'GitHub profile URL is ready to add.'; }));

// Lightweight technical constellation; static and inexpensive on small/reduced-motion devices.
const canvas = document.querySelector('.network-canvas');
const context = canvas?.getContext('2d');
let points = []; let animationFrame = 0; let heroVisible = false;
const lowMotionDevice = Boolean(navigator.deviceMemory && navigator.deviceMemory <= 4);
function stopNetwork(){if(animationFrame){cancelAnimationFrame(animationFrame);animationFrame=0;}}
function startNetwork(){
  if(!heroVisible||reduceMotion||lowMotionDevice||!canvas||animationFrame||canvas.clientWidth<600)return;
  const render=(time)=>{drawNetwork(time);animationFrame=requestAnimationFrame(render);};
  animationFrame=requestAnimationFrame(render);
}
function setupNetwork() {
  if (!canvas || !context) return;
  const rect = canvas.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; context.setTransform(dpr,0,0,dpr,0,0);
  points = Array.from({length: Math.max(15, Math.min(36, Math.floor(rect.width/32)))}, (_, i) => ({x:(i*173%Math.max(rect.width,1)),y:(i*97%Math.max(rect.height,1)),phase:i*.7}));
  stopNetwork();
  if (reduceMotion || lowMotionDevice || rect.width < 600) { drawNetwork(0); return; }
  startNetwork();
}
function drawNetwork(time) {
  if (!context || !canvas) return;
  const width = canvas.clientWidth, height = canvas.clientHeight; context.clearRect(0,0,width,height);
  const nodes = points.map((p) => ({x:p.x + Math.sin(time*.00022+p.phase)*8,y:p.y+Math.cos(time*.0002+p.phase)*8}));
  context.lineWidth = .65;
  for (let i=0;i<nodes.length;i++) for (let j=i+1;j<nodes.length;j++) { const dx=nodes[i].x-nodes[j].x,dy=nodes[i].y-nodes[j].y,d=Math.hypot(dx,dy); if(d<145){context.strokeStyle=`rgba(0,123,255,${(1-d/145)*.16})`;context.beginPath();context.moveTo(nodes[i].x,nodes[i].y);context.lineTo(nodes[j].x,nodes[j].y);context.stroke();} }
  nodes.forEach((p,i)=>{context.fillStyle=i%5===0?'rgba(255,45,149,.58)':'rgba(0,123,255,.58)';context.beginPath();context.arc(p.x,p.y,i%5===0?1.8:1.1,0,Math.PI*2);context.fill();});
}
setupNetwork();
if('IntersectionObserver'in window){
  const heroMotionObserver=new IntersectionObserver((entries)=>entries.forEach((entry)=>{
    heroVisible=entry.isIntersecting;
    if(heroVisible)startNetwork();else stopNetwork();
  }),{threshold:.02});
  heroMotionObserver.observe(document.querySelector('.hero'));
}else{heroVisible=true;startNetwork();}
let resizeTimer; window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(setupNetwork, 150); });

// Education tower: pointer drag, touch, keyboard and buttons all control the same 3D view.
const campusStage = document.querySelector('#campus-stage');
const campusBuilding = document.querySelector('#campus-building');
let campusRotation = {x:-12,y:-28};
let campusDrag = null;
let activeEducation = 2;
const educationStages = [
  {name:'10th Standard - G High School',copy:'School: G High School. Completed Class 10 in 2021.',program:'CLASS 10',specialization:'SCHOOL MILESTONE',institution:'G HIGH SCHOOL'},
  {name:"12th Standard - St. Xavier's College",copy:"School: St. Xavier's College. Completed Class 12 in 2023.",program:'CLASS 12',specialization:'HIGHER SECONDARY',institution:"ST. XAVIER'S COLLEGE"},
  {name:'B.Tech - Computer Science',copy:'LNCT Group of Colleges, Bhopal, Madhya Pradesh. B.Tech in Computer Science, specializing in Data Science; completion expected in 2027.',program:'B.TECH - CSE',specialization:'DATA SCIENCE',institution:'LNCT GROUP OF COLLEGES'}
];
let campusLastInteraction=0;
function setCampusRotation(x,y,animate=false,automatic=false){
  if(!automatic)campusLastInteraction=performance.now();
  campusRotation={x:Math.max(-58,Math.min(48,x)),y};
  if(!campusBuilding)return;
  campusBuilding.classList.toggle('is-settling',animate&&!reduceMotion);
  campusBuilding.style.setProperty('--campus-x',`${campusRotation.x}deg`);
  campusBuilding.style.setProperty('--campus-y',`${campusRotation.y}deg`);
  if(animate&&!reduceMotion) window.setTimeout(()=>campusBuilding.classList.remove('is-settling'),650);
}
function showEducationStage(index){
  activeEducation=(index+educationStages.length)%educationStages.length;
  const stage=educationStages[activeEducation];
  document.querySelector('#education-level').textContent=`LEVEL ${String(activeEducation+1).padStart(2,'0')} / 03`;
  document.querySelector('#education-stage-title').textContent=stage.name;
  document.querySelector('#education-stage-copy').textContent=stage.copy;
  document.querySelector('#education-program').textContent=stage.program;
  document.querySelector('#education-specialization').textContent=stage.specialization;
  document.querySelector('#education-institution').textContent=stage.institution;
  document.querySelectorAll('[data-education-stage]').forEach((button)=>button.setAttribute('aria-pressed',String(Number(button.dataset.educationStage)===activeEducation)));
  setCampusRotation([-24,-16,-9][activeEducation],[-38,-28,-20][activeEducation],true);
}
if(campusStage&&campusBuilding){
  showEducationStage(2);
  let campusVisible=false,campusFrame=0,campusLastFrame=0;
  campusLastInteraction=performance.now()-3200;
  const campusMotion=(time)=>{
    if(!campusVisible||reduceMotion)return;
    if(!document.hidden&&time-campusLastFrame>16&&time-campusLastInteraction>2600&&!campusDrag){
      const elapsed=campusLastFrame?Math.min(time-campusLastFrame,34):16;
      setCampusRotation(campusRotation.x,campusRotation.y+elapsed*.012,false,true);
      campusLastFrame=time;
    }
    campusFrame=requestAnimationFrame(campusMotion);
  };
  if('IntersectionObserver'in window){
    const campusObserver=new IntersectionObserver((entries)=>entries.forEach((entry)=>{
      campusVisible=entry.isIntersecting;
      if(campusVisible&&!campusFrame)campusFrame=requestAnimationFrame(campusMotion);
      if(!campusVisible&&campusFrame){cancelAnimationFrame(campusFrame);campusFrame=0;campusLastFrame=0;}
    }),{threshold:.12});
    campusObserver.observe(campusStage);
  }else{campusVisible=true;campusFrame=requestAnimationFrame(campusMotion);}
  campusStage.addEventListener('pointerdown',(event)=>{
    if(event.target.closest('button'))return;
    campusDrag={pointerId:event.pointerId,x:event.clientX,y:event.clientY,rotation:{...campusRotation}};
    campusStage.setPointerCapture(event.pointerId);campusStage.classList.add('is-dragging');
  });
  campusStage.addEventListener('pointermove',(event)=>{
    if(!campusDrag||campusDrag.pointerId!==event.pointerId)return;
    const scale=Math.min(1.1,720/Math.max(campusStage.clientWidth,1));
    setCampusRotation(campusDrag.rotation.x+(event.clientY-campusDrag.y)*scale*.42,campusDrag.rotation.y+(event.clientX-campusDrag.x)*scale*.55);
  });
  const releaseCampus=(event)=>{if(campusDrag&&campusDrag.pointerId===event.pointerId){campusDrag=null;campusStage.classList.remove('is-dragging');}};
  campusStage.addEventListener('pointerup',releaseCampus);campusStage.addEventListener('pointercancel',releaseCampus);
  campusStage.addEventListener('keydown',(event)=>{
    const step=event.shiftKey?18:9;let{x,y}=campusRotation;
    if(event.key==='ArrowLeft')y-=step;else if(event.key==='ArrowRight')y+=step;else if(event.key==='ArrowUp')x-=step;else if(event.key==='ArrowDown')x+=step;else if(event.key==='Home'){event.preventDefault();showEducationStage(2);return;}else return;
    event.preventDefault();setCampusRotation(x,y);
  });
}
document.querySelector('#campus-left')?.addEventListener('click',()=>setCampusRotation(campusRotation.x,campusRotation.y-28,true));
document.querySelector('#campus-right')?.addEventListener('click',()=>setCampusRotation(campusRotation.x,campusRotation.y+28,true));
document.querySelector('#campus-reset')?.addEventListener('click',()=>showEducationStage(2));
document.querySelectorAll('[data-education-stage]').forEach((button)=>button.addEventListener('click',()=>showEducationStage(Number(button.dataset.educationStage))));

// The contact portrait reacts gently to pointer movement without a continuous render loop.
const contactPortrait=document.querySelector('.contact-portrait');
if(contactPortrait&&!reduceMotion&&window.matchMedia('(hover: hover) and (pointer: fine)').matches){
  contactPortrait.addEventListener('pointermove',(event)=>{
    const rect=contactPortrait.getBoundingClientRect();
    const x=(event.clientX-rect.left)/rect.width-.5;
    const y=(event.clientY-rect.top)/rect.height-.5;
    contactPortrait.style.setProperty('--portrait-tilt-x',`${-y*9}deg`);
    contactPortrait.style.setProperty('--portrait-tilt-y',`${x*10}deg`);
    contactPortrait.style.setProperty('--portrait-light-x',`${(x+.5)*100}%`);
    contactPortrait.style.setProperty('--portrait-light-y',`${(y+.5)*100}%`);
  },{passive:true});
  contactPortrait.addEventListener('pointerleave',()=>{
    contactPortrait.style.setProperty('--portrait-tilt-x','0deg');
    contactPortrait.style.setProperty('--portrait-tilt-y','0deg');
    contactPortrait.style.setProperty('--portrait-light-x','50%');
    contactPortrait.style.setProperty('--portrait-light-y','35%');
  });
}

// Optional desktop cursor, leaving the native cursor intact and all keyboard paths available.
const cursor = document.querySelector('.cursor-dot');
const pointerLight=document.querySelector('.pointer-light');
const ambientField=document.querySelector('.ambient-field');
if (cursor && matchMedia('(pointer:fine)').matches && !reduceMotion) {
  let hitTimer=0;
  document.addEventListener('pointermove', (event) => {
    cursor.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;cursor.classList.add('is-visible');
    pointerLight?.style.setProperty('--pointer-x',`${event.clientX}px`);pointerLight?.style.setProperty('--pointer-y',`${event.clientY}px`);pointerLight?.classList.add('is-visible');
    ambientField?.style.setProperty('--ambient-shift-x',`${(event.clientX/window.innerWidth-.5)*8}px`);ambientField?.style.setProperty('--ambient-shift-y',`${(event.clientY/window.innerHeight-.5)*8}px`);
  },{passive:true});
  document.addEventListener('pointerdown',(event)=>{
    if(event.button!==0)return;
    cursor.classList.remove('is-hit');pointerLight?.classList.remove('is-hit');
    requestAnimationFrame(()=>{cursor.classList.add('is-hit');pointerLight?.classList.add('is-hit');});
    window.clearTimeout(hitTimer);hitTimer=window.setTimeout(()=>{cursor.classList.remove('is-hit');pointerLight?.classList.remove('is-hit');},580);
  });
  document.documentElement.addEventListener('pointerleave',()=>{cursor.classList.remove('is-visible');pointerLight?.classList.remove('is-visible');ambientField?.style.setProperty('--ambient-shift-x','0px');ambientField?.style.setProperty('--ambient-shift-y','0px');});
  document.querySelectorAll('a,button').forEach((element) => { element.addEventListener('pointerenter', () => cursor.classList.add('is-hover')); element.addEventListener('pointerleave', () => cursor.classList.remove('is-hover')); });
}

// Low-distance hero parallax and cached-rect magnetic feedback on the primary CTA.
const heroSection=document.querySelector('.hero');
const heroPortrait=document.querySelector('.hero-portrait');
if(heroSection&&heroPortrait&&matchMedia('(pointer:fine)').matches&&!reduceMotion){
  let pointerFrame=0,lastPointer=null;
  heroSection.addEventListener('pointermove',(event)=>{
    lastPointer=event;
    if(pointerFrame)return;
    pointerFrame=requestAnimationFrame(()=>{
      pointerFrame=0;if(!lastPointer)return;
      const rect=heroSection.getBoundingClientRect();
      const x=(lastPointer.clientX-rect.left)/rect.width-.5,y=(lastPointer.clientY-rect.top)/rect.height-.5;
      heroPortrait.style.setProperty('--hero-shift-x',`${x*5}px`);heroPortrait.style.setProperty('--hero-shift-y',`${y*5}px`);
    });
  },{passive:true});
  heroSection.addEventListener('pointerleave',()=>{heroPortrait.style.setProperty('--hero-shift-x','0px');heroPortrait.style.setProperty('--hero-shift-y','0px');});
  document.querySelectorAll('.magnetic').forEach((button)=>{
    let box;
    button.addEventListener('pointerenter',()=>{box=button.getBoundingClientRect();});
    button.addEventListener('pointermove',(event)=>{if(!box)return;button.style.setProperty('--magnetic-x',`${(event.clientX-box.left-box.width/2)*.12}px`);button.style.setProperty('--magnetic-y',`${(event.clientY-box.top-box.height/2)*.12}px`);},{passive:true});
    button.addEventListener('pointerleave',()=>{button.style.setProperty('--magnetic-x','0px');button.style.setProperty('--magnetic-y','0px');});
  });
}
