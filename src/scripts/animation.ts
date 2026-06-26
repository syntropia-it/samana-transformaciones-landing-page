import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
    revealElements();
    revealText();
    revealGroups();
    parallaxImages();
    animateCounters();
    maskReveal();
    sectionFade();
}

export function initReveal() {
    gsap.from('[data-reveal]', {
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '[data-reveal]',
            start: 'top 85%',
        },
    });

    gsap.from('[data-reveal-text]', {
        y: 100,
        opacity: 0,
        duration: 2,
        ease: 'power4.out',
    });
}

function revealElements() {
    gsap.utils.toArray('[data-reveal]').forEach(el => {
        gsap.from(el, {
            y: 80,
            opacity: 0,
            duration: 1.6,
            ease: 'expo.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 90%', // Un poco antes para elementos pequeños
                toggleActions: 'play none none reverse', // Se revierte al subir para dar dinamismo
            },
        });
    });
}

function revealText() {
    gsap.utils.toArray('[data-reveal-text]').forEach(el => {
        gsap.from(el, {
            y: 100, // Ajustado a 100 para no ser tan exagerado
            opacity: 0,
            duration: 2, // Duración premium
            ease: 'power4.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
            },
        });
    });
}

function revealGroups() {
    gsap.utils.toArray('.reveal-group').forEach(group => {
        const items = group.children;
        gsap.from(items, {
            y: 60,
            opacity: 0,
            duration: 1.5,
            stagger: 0.2, // Efecto cascada entre el 01 y el 04
            ease: 'expo.out',
            scrollTrigger: {
                trigger: group,
                start: 'top 75%', // Espera a que la grilla esté más visible
            },
        });
    });
}

function maskReveal() {
    gsap.utils.toArray('.mask-reveal').forEach(wrapper => {
        const content = wrapper.querySelector('.mask-content');

        gsap.from(content, {
            yPercent: 100,
            duration: 1.8,
            ease: 'expo.out',
            scrollTrigger: {
                trigger: wrapper,
                start: 'top 85%',
            },
        });
    });
}

function parallaxImages() {
    gsap.utils.toArray('.parallax').forEach(el => {
        gsap.to(el, {
            y: 60,
            ease: 'none',
            scrollTrigger: {
                trigger: el,
                start: 'top bottom',
                scrub: true,
            },
        });
    });
}
function animateCounters() {
    gsap.utils.toArray('.counter').forEach(counter => {
        const target = +counter.dataset.target;

        gsap.to(counter, {
            innerText: target,
            duration: 2,
            ease: 'power1.out',
            snap: { innerText: 1 },
            scrollTrigger: {
                trigger: counter,
                start: 'top 85%',
            },
        });
    });
}
function sectionFade() {
    const sections = gsap.utils.toArray('section') as HTMLElement[];
    sections.forEach((section, index) => {
        // Skip first section (hero area) and above-the-fold content to avoid LCP degradation
        if (index === 0) return;
        gsap.fromTo(
            section,
            { opacity: 0.4 },
            {
                opacity: 1,
                scrollTrigger: {
                    trigger: section,
                    start: 'top 70%',
                    end: 'top 40%',
                    scrub: true,
                },
            }
        );
    });
}
