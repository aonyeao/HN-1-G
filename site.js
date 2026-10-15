(() => {
'use strict';
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const animate = (node, frames, options = {}) => {
  if (reduce.matches || !node.animate) return null;
  return node.animate(frames, {duration: 520, easing: 'cubic-bezier(.22,1,.36,1)', ...options});
};
const progress = document.querySelector('.progress i');
const navGroups = [...document.querySelectorAll('header nav,.bottom-nav')];
let queued = false;
const update = () => {
  queued = false;
  const max = document.documentElement.scrollHeight - innerHeight;
  if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
  document.body.classList.toggle('is-scrolled', scrollY > 28);
  navGroups.forEach(group => {
    const links = [...group.querySelectorAll('a[href^="#"]')];
    let active = null;
    links.forEach(a => {
      const target = document.getElementById(a.hash.slice(1));
      if (target && target.getBoundingClientRect().top <= innerHeight * .38) active = a;
    });
    links.forEach(a => {
      const on = a === active;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  });
};
const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
addEventListener('scroll', schedule, {passive: true});
addEventListener('resize', schedule, {passive: true});
if (window.ResizeObserver) new ResizeObserver(schedule).observe(document.body);
update();
// Content stays visible without JavaScript or when reduced motion is requested.
if ('IntersectionObserver' in window && !reduce.matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    animate(entry.target, [{opacity: .35, transform: 'translateY(20px)'}, {opacity: 1, transform: 'none'}], {duration: 700});
    observer.unobserve(entry.target);
  }), {threshold: .12});
  document.querySelectorAll('.heading,.feature,.material-story,.silver-feature,.reasons,.services,.process-head,.care-stats,.two-images').forEach(el => observer.observe(el));
  document.querySelectorAll('.hero-copy,.hero-image').forEach((el, index) => animate(el, [{opacity: .3, transform: 'translateY(14px)'}, {opacity: 1, transform: 'none'}], {duration: 800, delay: index * 90}));
}
// Keep native details semantics and keyboard behavior; animate a measured height.
document.querySelectorAll('details').forEach((detail, index) => {
  const summary = detail.querySelector('summary');
  const label = detail.querySelector('.action-label');
  const icon = detail.querySelector('.action-icon');
  if (!summary) return;
  summary.id ||= 'detail-trigger-' + index;
  detail.setAttribute('aria-labelledby', summary.id);
  let animation = null;
  let finishTimer = null;
  let targetOpen = detail.open;
  const sync = () => {
    summary.setAttribute('aria-expanded', String(detail.open));
    if (label) label.textContent = detail.open ? '收起详情' : '查看详情';
    if (icon) { icon.textContent = '+'; icon.setAttribute('aria-hidden', 'true'); }
    schedule();
  };
  const finish = open => {
    clearTimeout(finishTimer);
    detail.open = open;
    detail.style.height = '';
    detail.style.overflow = '';
    animation = null;
    sync();
  };
  summary.addEventListener('click', event => {
    if (reduce.matches || !detail.animate) return;
    event.preventDefault();
    const from = detail.getBoundingClientRect().height;
    if (animation) animation.cancel();
    clearTimeout(finishTimer);
    targetOpen = !targetOpen;
    detail.style.height = '';
    detail.open = targetOpen;
    const to = detail.getBoundingClientRect().height;
    if (!targetOpen) detail.open = true;
    detail.style.height = from + 'px';
    detail.style.overflow = 'hidden';
    animation = animate(detail, [{height: from + 'px'}, {height: to + 'px'}], {duration: 440});
    if (animation) {
      animation.onfinish = () => finish(targetOpen);
      finishTimer = setTimeout(() => { if (animation) animation.cancel(); finish(targetOpen); }, 480);
    } else finish(targetOpen);
  });
  detail.addEventListener('toggle', () => { if (!animation) targetOpen = detail.open; sync(); });
  addEventListener('resize', () => { if (animation) { animation.cancel(); finish(targetOpen); } }, {passive: true});
  sync();
});
const viewer = document.querySelector('.viewer');
const photos = [...document.querySelectorAll('.photo')];
if (viewer && photos.length) {
  const image = viewer.querySelector('img');
  const caption = viewer.querySelector('p');
  const counter = viewer.querySelector('i');
  const closeButton = viewer.querySelector('.close');
  let index = 0, origin = null, oldOverflow = '', touchStart = null, version = 0;
  const show = (direction = 0) => {
    const token = ++version;
    const photo = photos[index];
    image.alt = photo.querySelector('img')?.alt || '空间与材质图片';
    image.src = photo.dataset.src;
    if (caption) caption.textContent = image.alt;
    if (counter) { counter.textContent = (index + 1) + ' / ' + photos.length; counter.setAttribute('aria-live', 'polite'); }
    const reveal = () => { if (token === version) animate(image, [{opacity: .35, transform: 'translateX(' + (direction * 14) + 'px) scale(.99)'}, {opacity: 1, transform: 'none'}], {duration: 380}); };
    if (image.complete) reveal(); else image.onload = reveal;
    const next = new Image(); next.src = photos[(index + 1) % photos.length].dataset.src;
  };
  const move = direction => { index = (index + direction + photos.length) % photos.length; show(direction); };
  const close = () => { viewer.close(); document.body.style.overflow = oldOverflow; origin?.focus({preventScroll: true}); };
  photos.forEach((photo, i) => {
    photo.setAttribute('aria-haspopup', 'dialog');
    photo.setAttribute('aria-label', '放大查看：' + (photo.querySelector('img')?.alt || '图片'));
    photo.addEventListener('click', () => {
      index = i; origin = photo; show(); oldOverflow = document.body.style.overflow;
      viewer.showModal(); document.body.style.overflow = 'hidden'; closeButton?.focus({preventScroll: true});
    });
  });
  closeButton?.addEventListener('click', close);
  viewer.querySelector('.prev')?.addEventListener('click', () => move(-1));
  viewer.querySelector('.next')?.addEventListener('click', () => move(1));
  viewer.addEventListener('click', event => { if (event.target === viewer) close(); });
  viewer.addEventListener('close', () => { document.body.style.overflow = oldOverflow; origin?.focus({preventScroll: true}); });
  addEventListener('keydown', event => {
    if (!viewer.open) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
  });
  viewer.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 ? {x: event.touches[0].clientX, y: event.touches[0].clientY} : null;
  }, {passive: true});
  viewer.addEventListener('touchmove', event => { if (event.touches.length !== 1) touchStart = null; }, {passive: true});
  viewer.addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (window.visualViewport && visualViewport.scale > 1.05) return;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) move(dx > 0 ? -1 : 1);
  }, {passive: true});
}
})();
