import { getAllProjects, getFeaturedProjects, getProjectBySlug } from './src/js/api/projects.js';

// Global error handler for image fallbacks provided by API
window.handleImageError = function (img) {
    const fallback = img.getAttribute('data-fallback');
    if (fallback && img.src !== fallback) {
        img.src = fallback;
    }
}

document.addEventListener('DOMContentLoaded', async () => {

    // --- Mobile Menu Toggle ---
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            menuToggle.classList.toggle('active');
        });
    }

    // --- Header Scroll Effect ---
    const header = document.getElementById('site-header');

    if (header) {
        if (!header.classList.contains('scrolled') || window.location.pathname.includes('project-details') || window.location.pathname.includes('about') || window.location.pathname.includes('contact')) {
            // some pages have scrolled by default, let's keep the logic
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    // Only remove if it's not supposed to be permanently scrolled
                    if (!document.querySelector('.page-header') && !document.querySelector('.project-hero') && !document.querySelector('.about-hero') && !document.querySelector('.contact-page-grid')) {
                        header.classList.remove('scrolled');
                    }
                }
            });
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            }
        }
    }

    // Helper to generate project card HTML
    function createProjectCard(project, isFeatured = false) {
        // category to lowercase for data-category filter if needed
        const categorySlug = project.category ? project.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'all';
        return `
            <a href="project-details.html?slug=${project.slug}" class="project-card reveal active" data-category="${categorySlug}">
                <img src="${project.thumbnail}" alt="Project Thumbnail" ${project.thumbnailFallback ? `data-fallback="${project.thumbnailFallback}"` : ''} class="project-img" loading="lazy" onerror="handleImageError(this)">
                <div class="project-overlay">
                    <span class="project-category">${project.category || 'Project'}</span>
                    <div class="play-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
            </a>
        `;
    }

    // --- Dynamic Homepage Featured Projects ---
    const homeCarousel = document.getElementById('home-carousel');
    if (homeCarousel && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/')) {
        try {
            const featured = await getFeaturedProjects(6);
            if (featured.length > 0) {
                homeCarousel.innerHTML = featured.map(p => createProjectCard(p, true)).join('');
            } else {
                homeCarousel.innerHTML = '<p style="color: var(--text-secondary); text-align: center; width: 100%;">No featured projects available.</p>';
            }
        } catch (error) {
            console.error(error);
        }
        
        // Carousel Drag Logic
        let isDown = false;
        let startX;
        let scrollLeft;

        homeCarousel.addEventListener('mousedown', (e) => {
            isDown = true;
            homeCarousel.classList.add('active');
            startX = e.pageX - homeCarousel.offsetLeft;
            scrollLeft = homeCarousel.scrollLeft;
        });
        homeCarousel.addEventListener('mouseleave', () => {
            isDown = false;
            homeCarousel.classList.remove('active');
        });
        homeCarousel.addEventListener('mouseup', () => {
            isDown = false;
            homeCarousel.classList.remove('active');
        });
        homeCarousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - homeCarousel.offsetLeft;
            const walk = (x - startX) * 2; // scroll-fast
            homeCarousel.scrollLeft = scrollLeft - walk;
        });
        
        // Desktop Arrows
        const btnPrev = document.getElementById('carousel-prev');
        const btnNext = document.getElementById('carousel-next');
        if (btnPrev && btnNext) {
            btnPrev.addEventListener('click', () => {
                homeCarousel.scrollBy({ left: -600, behavior: 'smooth' });
            });
            btnNext.addEventListener('click', () => {
                homeCarousel.scrollBy({ left: 600, behavior: 'smooth' });
            });
        }

        // Auto Scroll
        let autoScrollInterval;
        const startAutoScroll = () => {
            autoScrollInterval = setInterval(() => {
                if (homeCarousel.scrollLeft + homeCarousel.clientWidth >= homeCarousel.scrollWidth - 10) {
                    homeCarousel.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    homeCarousel.scrollBy({ left: 600, behavior: 'smooth' });
                }
            }, 3000);
        };
        const stopAutoScroll = () => clearInterval(autoScrollInterval);

        startAutoScroll();

        // Pause on interaction
        homeCarousel.addEventListener('mouseenter', stopAutoScroll);
        homeCarousel.addEventListener('mouseleave', startAutoScroll);
        homeCarousel.addEventListener('touchstart', stopAutoScroll, {passive: true});
        homeCarousel.addEventListener('touchend', startAutoScroll, {passive: true});
    }

    // --- Dynamic Projects Page ---
    const portfolioGrid = document.getElementById('portfolio-grid');
    if (portfolioGrid) {
        try {
            const allProjects = await getAllProjects();
            if (allProjects.length > 0) {
                portfolioGrid.innerHTML = allProjects.map(p => createProjectCard(p)).join('');
            } else {
                portfolioGrid.innerHTML = '<p style="color: var(--text-secondary); text-align: center; width: 100%; grid-column: 1 / -1;">No projects available.</p>';
            }
        } catch (error) {
            console.error(error);
        }
    }

    // --- Dynamic Project Details Page ---
    if (window.location.pathname.includes('project-details.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');

        if (slug) {
            try {
                const project = await getProjectBySlug(slug);
                if (project) {
                    // Update page title
                    document.title = `${project.title} - Pillarthree Productions`;

                    // Update hero
                    const heroImg = document.getElementById('hero-thumbnail');
                    if (heroImg) {
                        heroImg.src = project.thumbnail;
                        heroImg.alt = project.title;
                        if (project.thumbnailFallback) {
                            heroImg.setAttribute('data-fallback', project.thumbnailFallback);
                        }
                        heroImg.setAttribute('onerror', 'handleImageError(this)');
                    }

                    // Update meta details
                    const metaGrid = document.querySelector('.project-meta-grid');
                    if (metaGrid) {
                        metaGrid.innerHTML = `
                            <div class="meta-box"><span class="meta-title">Client</span><span>${project.client}</span></div>
                            <div class="meta-box"><span class="meta-title">Category</span><span>${project.category}</span></div>
                            <div class="meta-box"><span class="meta-title">Director</span><span>${project.director}</span></div>
                            <div class="meta-box"><span class="meta-title">Agency</span><span>${project.agency}</span></div>
                        `;
                    }

                    // Update body
                    const titleEl = document.querySelector('.project-body .section-title');
                    if (titleEl) titleEl.textContent = project.title;

                    const descEl = document.querySelector('.project-body p');
                    if (descEl) descEl.textContent = project.description || '';

                    const heroContainer = document.getElementById('hero-media-container');
                    const playButton = document.getElementById('hero-play-button');
                    const videoWrapper = document.getElementById('hero-video-wrapper');
                    const imageWrapper = document.getElementById('hero-image-wrapper');

                    if (heroContainer && project.youtubeId) {
                        const loadVideo = () => {
                            imageWrapper.style.opacity = '0';
                            videoWrapper.style.display = 'block';

                            const createPlayer = () => {
                                videoWrapper.innerHTML = '<div id="yt-player-embed" style="position:absolute; top:0; left:0; width:100%; height:100%;"></div>';
                                new window.YT.Player('yt-player-embed', {
                                    videoId: project.youtubeId,
                                    playerVars: { 'autoplay': 1, 'rel': 0 },
                                    events: {
                                        'onReady': (event) => event.target.playVideo(),
                                        'onError': (event) => {
                                            // Embedding disabled or video unavailable, open in new tab
                                            window.open(project.youtube, '_blank');

                                            // Revert hero to image state
                                            imageWrapper.style.opacity = '1';
                                            videoWrapper.style.display = 'none';
                                            imageWrapper.style.display = 'block';

                                            // Allow user to click again to open link directly
                                            heroContainer.addEventListener('click', () => window.open(project.youtube, '_blank'), { once: true });
                                        }
                                    }
                                });
                            };

                            if (window.YT && window.YT.Player) {
                                createPlayer();
                            } else {
                                // Load YouTube IFrame API
                                const tag = document.createElement('script');
                                tag.src = "https://www.youtube.com/iframe_api";
                                const firstScriptTag = document.getElementsByTagName('script')[0];
                                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                                window.onYouTubeIframeAPIReady = createPlayer;
                            }

                            setTimeout(() => {
                                videoWrapper.style.opacity = '1';
                                imageWrapper.style.display = 'none';
                            }, 400); // Wait for transition

                            heroContainer.removeEventListener('click', loadVideo);
                            heroContainer.removeEventListener('keydown', handleKeydown);
                            heroContainer.style.cursor = 'default';
                        };

                        const handleKeydown = (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                loadVideo();
                            }
                        };

                        heroContainer.addEventListener('click', loadVideo);
                        heroContainer.addEventListener('keydown', handleKeydown);

                    } else if (heroContainer) {
                        // Hide play button if no video
                        if (playButton) playButton.style.display = 'none';
                        heroContainer.style.cursor = 'default';
                        heroContainer.removeAttribute('tabindex');
                        heroContainer.removeAttribute('role');
                        heroContainer.removeAttribute('aria-label');
                    }

                    // Hide gallery on dynamic pages since we don't have gallery columns in sheet
                    const gallery = document.querySelector('.project-gallery');
                    if (gallery) gallery.style.display = 'none';

                    // --- Navigation Logic ---
                    const allProjects = await getAllProjects();
                    if (allProjects && allProjects.length > 0) {
                        const currentIndex = allProjects.findIndex(p => p.slug === slug);
                        if (currentIndex !== -1) {
                            const prevIndex = (currentIndex - 1 + allProjects.length) % allProjects.length;
                            const nextIndex = (currentIndex + 1) % allProjects.length;

                            const prevProject = allProjects[prevIndex];
                            const nextProject = allProjects[nextIndex];

                            const prevLink = document.getElementById('btn-prev');
                            const nextLink = document.getElementById('btn-next');

                            if (prevLink) {
                                prevLink.href = `project-details.html?slug=${prevProject.slug}`;
                            }
                            if (nextLink) {
                                nextLink.href = `project-details.html?slug=${nextProject.slug}`;
                            }
                        }
                    }

                } else {
                    document.querySelector('.project-body').innerHTML = '<h2>Project Not Found</h2>';
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            // No slug provided
            document.querySelector('.project-body').innerHTML = '<h2>Project Not Found</h2>';
        }
    }

    // --- Projects Filtering (on projects.html) ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    if (filterBtns.length > 0 && portfolioGrid) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');
                const projectCards = document.querySelectorAll('#portfolio-grid .project-card');

                projectCards.forEach(card => {
                    if (filterValue === 'all') {
                        card.style.display = 'block';
                        setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 50);
                    } else {
                        if (card.getAttribute('data-category') === filterValue) {
                            card.style.display = 'block';
                            setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 50);
                        } else {
                            card.style.opacity = '0';
                            card.style.transform = 'scale(0.95)';
                            setTimeout(() => { card.style.display = 'none'; }, 300);
                        }
                    }
                });
            });
        });
    }

    // Manual trigger of reveals for elements already in DOM
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { root: null, threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        revealElements.forEach(el => revealObserver.observe(el));
    }

    // --- Web3Forms Contact Form Integration ---
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('formMessage');

    if (contactForm && submitBtn && formMessage) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Validate form
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !message) {
                formMessage.style.display = 'block';
                formMessage.style.color = '#ef4444'; // Red error
                formMessage.textContent = 'Please fill out all required fields.';
                return;
            }

            // Disable button, show loading
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            submitBtn.style.opacity = '0.7';
            submitBtn.style.cursor = 'not-allowed';
            formMessage.style.display = 'none';

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        access_key: '644fd65e-43ef-45a2-9570-44aa888afc46',
                        name: name,
                        email: email,
                        message: message,
                        redirect: false
                    })
                });

                const json = await response.json();

                if (response.status === 200) {
                    // Success
                    formMessage.style.display = 'block';
                    formMessage.style.color = '#10b981'; // Green success
                    formMessage.textContent = "Thank you! Your message has been sent successfully. We'll get back to you soon.";
                    contactForm.reset();
                } else {
                    // API Error
                    formMessage.style.display = 'block';
                    formMessage.style.color = '#ef4444'; // Red error
                    formMessage.textContent = json.message || "Something went wrong. Please try again later.";
                }
            } catch (error) {
                // Network Error
                console.error(error);
                formMessage.style.display = 'block';
                formMessage.style.color = '#ef4444'; // Red error
                formMessage.textContent = "Network error. Please check your connection and try again.";
            } finally {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Inquiry';
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = 'pointer';
            }
        });
    }
});
