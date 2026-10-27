(() => {
    const scroller = document.getElementById('screenScroll');
    const navigation = document.getElementById('bottomNav');
    const progress = document.getElementById('scrollProgress');
    const fill = document.getElementById('scrollProgressFill');
    if (!scroller || !navigation || !progress || !fill) return;

    const links = Array.from(navigation.querySelectorAll('[data-section]'));
    const sections = links.map(link => document.getElementById(link.dataset.section));
    let scheduled = false;

    function update() {
        scheduled = false;
        const max = scroller.scrollHeight - scroller.clientHeight;
        const ratio = max > 0 ? Math.min(1, Math.max(0, scroller.scrollTop / max)) : 0;
        fill.style.transform = `scaleX(${ratio})`;
        progress.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));

        const top = scroller.getBoundingClientRect().top;
        const chromeHeight = document.querySelector('.screen-top-chrome').offsetHeight;
        const offset = chromeHeight + parseFloat(getComputedStyle(scroller).scrollPaddingTop) + 16;
        let active = sections[0];
        sections.forEach(section => {
            if (section && section.getBoundingClientRect().top - top <= offset) active = section;
        });
        if (max > 0 && max - scroller.scrollTop <= 2) active = sections[sections.length - 1];
        links.forEach(link => {
            const selected = active && link.dataset.section === active.id;
            link.classList.toggle('is-active', selected);
            if (selected) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
    }

    function schedule() {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(update);
    }

    function alignFragment() {
        if (!location.hash) {
            scroller.scrollTo({ top: 0 });
        } else {
            const target = document.getElementById(location.hash.slice(1));
            if (target && scroller.contains(target)) target.scrollIntoView({ block: 'start' });
        }
        schedule();
    }

    function clock() {
        const time = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
        document.querySelectorAll('.js-status-clock').forEach(label => { label.textContent = time; });
    }

    scroller.addEventListener('scroll', schedule, { passive: true });
    scroller.addEventListener('load', schedule, true);
    window.addEventListener('resize', schedule);
    // Browser history does not consistently restore a nested scroller.
    history.scrollRestoration = 'manual';
    window.addEventListener('hashchange', alignFragment);
    if (document.fonts) document.fonts.ready.then(() => {
        if (location.hash) alignFragment();
        else schedule();
    });
    else if (location.hash) alignFragment();
    clock();
    setInterval(clock, 1000);
    update();
})();
