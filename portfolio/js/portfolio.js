(function () {
    var scrollEl = document.getElementById('screenScroll') || document.querySelector('.screen-scroll');
    var fab = document.getElementById('scrollHintFab');
    var phoneScreen = document.getElementById('phoneScreen');
    var launchOverlay = document.getElementById('launchOverlay');
    var launchBtn = document.getElementById('launchAppBtn');
    var bottomNav = document.getElementById('bottomNav');
    var progressFill = document.getElementById('scrollProgressFill');
    var progressEl = document.getElementById('scrollProgress');
    var sectionOrder = ['portfolio-top', 'section-about', 'section-experience', 'section-toy', 'section-skills'];

    function prefersReducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function tickClock() {
        var label = new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        document.querySelectorAll('.js-status-clock').forEach(function (node) {
            node.textContent = label;
        });
    }

    function updateProgress() {
        if (!scrollEl || !progressFill || !progressEl) return;
        var max = scrollEl.scrollHeight - scrollEl.clientHeight;
        var pct = max <= 0 ? 0 : Math.round((scrollEl.scrollTop / max) * 100);
        progressFill.style.width = pct + '%';
        progressEl.setAttribute('aria-valuenow', String(pct));
    }

    function updateNavActive() {
        if (!scrollEl || !bottomNav) return;
        var pad = 56;
        var st = scrollEl.scrollTop;
        var activeId = sectionOrder[0];
        for (var i = 0; i < sectionOrder.length; i++) {
            var el = document.getElementById(sectionOrder[i]);
            if (!el) continue;
            var top = el.getBoundingClientRect().top - scrollEl.getBoundingClientRect().top + scrollEl.scrollTop;
            if (top <= st + pad) {
                activeId = sectionOrder[i];
            }
        }
        bottomNav.querySelectorAll('.bottom-nav__btn').forEach(function (btn) {
            var sec = btn.getAttribute('data-section');
            var on = sec === activeId;
            btn.classList.toggle('is-active', on);
            if (on) {
                btn.setAttribute('aria-current', 'page');
            } else {
                btn.removeAttribute('aria-current');
            }
        });
    }

    function scrollToSection(sectionId) {
        var el = document.getElementById(sectionId);
        if (!el) return;
        var smooth = !prefersReducedMotion();
        el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    }

    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text);
            return;
        }
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
        } catch (e) { /* ignore */ }
        document.body.removeChild(ta);
    }

    function onScrollUi() {
        updateFab();
        updateProgress();
        updateNavActive();
    }

    function updateFab() {
        if (!scrollEl || !fab) return;
        var threshold = 32;
        var atBottom = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight <= threshold;
        var noOverflow = scrollEl.scrollHeight <= scrollEl.clientHeight + 1;
        fab.classList.toggle('scroll-hint-fab--hidden', atBottom || noOverflow);
    }

    function finishLaunchOverlay() {
        if (!launchOverlay) return;
        launchOverlay.classList.add('launch-overlay--done');
        launchOverlay.setAttribute('aria-hidden', 'true');
        launchOverlay.removeAttribute('role');
        launchOverlay.removeAttribute('aria-modal');
    }

    function runLaunch() {
        if (!phoneScreen || phoneScreen.classList.contains('is-launched')) return;
        phoneScreen.classList.add('is-launched');
        if (launchOverlay) {
            var reduced = prefersReducedMotion();
            if (reduced) {
                finishLaunchOverlay();
            } else {
                launchOverlay.addEventListener('animationend', function onLaunchAnimEnd(ev) {
                    if (ev.target !== launchOverlay) return;
                    launchOverlay.removeEventListener('animationend', onLaunchAnimEnd);
                    finishLaunchOverlay();
                });
            }
        }
        onScrollUi();
    }

    if (scrollEl && fab) {
        scrollEl.addEventListener('scroll', onScrollUi, { passive: true });
        window.addEventListener('resize', onScrollUi);
        fab.addEventListener('click', function () {
            var step = Math.min(scrollEl.clientHeight * 0.85, scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight);
            if (step < 8) return;
            scrollEl.scrollBy({ top: step, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        });
    }

    if (bottomNav) {
        bottomNav.querySelectorAll('.bottom-nav__btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var id = btn.getAttribute('data-section');
                if (id) scrollToSection(id);
            });
        });
    }

    document.querySelectorAll('.copy-btn[data-copy]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var text = btn.getAttribute('data-copy');
            if (text) copyText(text);
        });
    });

    tickClock();
    setInterval(tickClock, 1000);

    if (launchBtn && phoneScreen) {
        launchBtn.addEventListener('click', runLaunch);
    } else if (phoneScreen) {
        phoneScreen.classList.add('is-launched');
        finishLaunchOverlay();
    }

    onScrollUi();
})();
