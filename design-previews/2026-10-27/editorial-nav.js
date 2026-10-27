// Links work without JavaScript; highlight only the section currently being read.
const links = Array.from(document.querySelectorAll('.nav-links a'));
const sections = links.map(link => document.querySelector(link.getAttribute('href')));
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting);
        if (!visible.length) return;
        const id = visible[0].target.id;
        links.forEach(link => {
            if (link.getAttribute('href') === '#' + id) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    }, { rootMargin: '-90px 0px -60% 0px' });
    sections.forEach(section => { if (section) observer.observe(section); });
}
