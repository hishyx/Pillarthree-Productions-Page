document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Mobile Menu Drawer Navigation
    // ----------------------------------------------------
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // ----------------------------------------------------
    // 2. Hero Background Slideshow Crossfade
    // ----------------------------------------------------
    const slides = document.querySelectorAll('.hero-slideshow .slide');
    let currentSlideIndex = 0;
    const slideIntervalTime = 5000; // 5 seconds per slide

    const nextSlide = () => {
        if (slides.length > 0) {
            slides[currentSlideIndex].classList.remove('active');
            currentSlideIndex = (currentSlideIndex + 1) % slides.length;
            slides[currentSlideIndex].classList.add('active');
        }
    };

    if (slides.length > 1) {
        setInterval(nextSlide, slideIntervalTime);
    }

    // ----------------------------------------------------
    // 3. Navigation Header Scroll Effect & Active States
    // ----------------------------------------------------
    const siteHeader = document.getElementById('site-header');
    const sections = document.querySelectorAll('section');

    const handleScroll = () => {
        if (window.scrollY > 50) {
            siteHeader.classList.add('scrolled');
        } else {
            siteHeader.classList.remove('scrolled');
        }

        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    // ----------------------------------------------------
    // 4. Horizontal Drag-to-Scroll for BTS Gallery
    // ----------------------------------------------------
    const btsTrack = document.querySelector('.bts-horizontal-track');
    let isDown = false;
    let startX;
    let scrollLeft;

    if (btsTrack) {
        btsTrack.addEventListener('mousedown', (e) => {
            isDown = true;
            btsTrack.classList.add('active');
            startX = e.pageX - btsTrack.offsetLeft;
            scrollLeft = btsTrack.scrollLeft;
        });

        btsTrack.addEventListener('mouseleave', () => {
            isDown = false;
            btsTrack.classList.remove('active');
        });

        btsTrack.addEventListener('mouseup', () => {
            isDown = false;
            btsTrack.classList.remove('active');
        });

        btsTrack.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - btsTrack.offsetLeft;
            const walk = (x - startX) * 2; // scroll speed multiplier
            btsTrack.scrollLeft = scrollLeft - walk;
        });

        // Prevent default browser dragging on images inside track to avoid breaks
        const trackImages = btsTrack.querySelectorAll('img');
        trackImages.forEach(img => {
            img.addEventListener('dragstart', (e) => e.preventDefault());
        });
    }

    // ----------------------------------------------------
    // 5. Scroll Entrance Reveal (Intersection Observer)
    // ----------------------------------------------------
    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    } else {
        revealElements.forEach(element => {
            element.classList.add('revealed');
        });
    }

    // ----------------------------------------------------
    // 6. Showreel Video Modal Controller
    // ----------------------------------------------------
    const showreelModal = document.getElementById('showreel-modal');
    const showreelIframe = document.getElementById('showreel-iframe');
    const closeShowreelBtn = document.getElementById('modal-close');
    const playShowreelBtns = document.querySelectorAll('.play-showreel-btn');

    if (showreelModal && showreelIframe && closeShowreelBtn) {
        playShowreelBtns.forEach(button => {
            button.addEventListener('click', () => {
                const videoId = button.getAttribute('data-video-id');
                if (videoId) {
                    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
                    showreelIframe.setAttribute('src', embedUrl);
                    showreelModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        const closeShowreelModal = () => {
            showreelModal.classList.remove('active');
            showreelIframe.setAttribute('src', '');
            document.body.style.overflow = 'auto';
        };

        closeShowreelBtn.addEventListener('click', closeShowreelModal);
        showreelModal.querySelector('.modal-backdrop').addEventListener('click', closeShowreelModal);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && showreelModal.classList.contains('active')) {
                closeShowreelModal();
            }
        });
    }

    // ----------------------------------------------------
    // 7. Behind the Scenes Lightbox Modal Controller
    // ----------------------------------------------------
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeLightboxBtn = document.getElementById('lightbox-close');
    const btsCards = document.querySelectorAll('.bts-card-horizontal');

    if (lightboxModal && lightboxImg && lightboxCaption && closeLightboxBtn) {
        btsCards.forEach(card => {
            card.addEventListener('click', () => {
                const imgSource = card.getAttribute('data-img-src');
                const captionText = card.getAttribute('data-caption');
                
                if (imgSource) {
                    lightboxImg.setAttribute('src', imgSource);
                    lightboxCaption.textContent = captionText || '';
                    lightboxModal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        const closeLightbox = () => {
            lightboxModal.classList.remove('active');
            lightboxImg.setAttribute('src', '');
            document.body.style.overflow = 'auto';
        };

        closeLightboxBtn.addEventListener('click', closeLightbox);
        lightboxModal.querySelector('.modal-backdrop').addEventListener('click', closeLightbox);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
                closeLightbox();
            }
        });
    }
});
