const header = document.querySelector('.site-header');
const brandIntro = document.getElementById('brandIntro');
const introSkip = document.getElementById('introSkip');
const pageRegions = document.querySelectorAll('.site-header, main, footer');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function closeBrandIntro() {
    if (!brandIntro || brandIntro.classList.contains('is-leaving')) {
        return;
    }

    brandIntro.classList.add('is-leaving');
    document.body.classList.remove('intro-active');
    pageRegions.forEach((region) => region.removeAttribute('inert'));

    window.setTimeout(() => {
        brandIntro.remove();
    }, reduceMotion ? 0 : 950);
}

if (brandIntro) {
    document.body.classList.add('intro-active');
    pageRegions.forEach((region) => region.setAttribute('inert', ''));
    introSkip.addEventListener('click', closeBrandIntro);

    if (reduceMotion) {
        closeBrandIntro();
    } else {
        introSkip.focus();
        window.setTimeout(closeBrandIntro, 4900);
    }
}

const animatedElements = document.querySelectorAll(
    '.hero-copy, .hero-visual, .hero-quote, .service-card, .portrait-panel, .content-panel, .locations-grid article, .testimonial-card, .contact-card'
);

if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    animatedElements.forEach((element, index) => {
        element.classList.add('fade-in');
        element.style.transitionDelay = `${Math.min(index * 60, 240)}ms`;
        observer.observe(element);
    });
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
        const target = document.querySelector(anchor.getAttribute('href'));

        if (!target) {
            return;
        }

        event.preventDefault();

        const headerOffset = header ? header.offsetHeight + 14 : 0;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;

        window.scrollTo({
            top: targetTop,
            behavior: reduceMotion ? 'auto' : 'smooth'
        });
    });
});
