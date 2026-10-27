const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const events = {};
const attributes = new Map();
const location = { hash: '' };
const scroller = {
  scrollHeight: 2000, clientHeight: 500, scrollTop: 0,
  getBoundingClientRect: () => ({ top: 0 }),
  scrollTo({ top }) { this.scrollTop = top; },
  addEventListener(name, fn) { events[name] = fn; },
};
const sections = ['portfolio-top', 'section-about', 'section-experience', 'section-toy', 'section-skills']
  .map((id, i) => ({
    id,
    getBoundingClientRect: () => ({ top: i * 400 - scroller.scrollTop }),
    scrollIntoView() { scroller.scrollTop = i * 400; },
  }));
scroller.contains = target => sections.includes(target);
const links = sections.map(section => ({
  dataset: { section: section.id },
  classList: { toggle() {} },
  setAttribute(name, value) { this[name] = value; },
  removeAttribute(name) { delete this[name]; },
}));
const fill = { style: {} };
const nodes = new Map(sections.map(section => [section.id, section]));
nodes.set('screenScroll', scroller);
nodes.set('bottomNav', { querySelectorAll: () => links });
nodes.set('scrollProgress', { setAttribute: (name, value) => attributes.set(name, value) });
nodes.set('scrollProgressFill', fill);
const history = {};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/portfolio.js'), 'utf8'), {
  document: {
    getElementById: id => nodes.get(id),
    querySelector: () => ({ offsetHeight: 40 }),
    querySelectorAll: () => [],
  },
  window: { addEventListener: (name, fn) => { events[name] = fn; } },
  getComputedStyle: () => ({ scrollPaddingTop: '40' }),
  requestAnimationFrame: fn => { events.frame = fn; },
  setInterval() {}, location, history,
});
const flush = () => events.frame?.();
assert.equal(links[0]['aria-current'], 'location');
scroller.scrollTop = 1500;
events.scroll(); flush();
assert.equal(links[4]['aria-current'], 'location', 'Last section stays selected at scroll end');
assert.equal(attributes.get('aria-valuenow'), '100');
location.hash = '#section-experience';
events.hashchange(); flush();
assert.equal(scroller.scrollTop, 800, 'History restores the nested scroller');
assert.equal(links[2]['aria-current'], 'location');
location.hash = '#missing';
events.hashchange(); flush();
assert.equal(scroller.scrollTop, 800, 'Unknown fragments leave content in place');
location.hash = '';
events.hashchange(); flush();
assert.equal(scroller.scrollTop, 0);
assert.equal(links[0]['aria-current'], 'location');
assert.equal(attributes.get('aria-valuenow'), '0');
console.log('PASS: navigation, scroll end, progress, history, unknown fragment, home');
