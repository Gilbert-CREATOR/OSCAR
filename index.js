const header = document.querySelector('.site-header');
const animatedElements = document.querySelectorAll(
    '.hero-copy, .hero-visual, .hero-quote, .service-card, .portrait-panel, .content-panel, .locations-grid article, .testimonial-card, .contact-card'
);

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
            behavior: 'smooth'
        });
    });
});
