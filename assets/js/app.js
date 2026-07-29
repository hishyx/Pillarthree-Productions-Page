import { getAllProjects, getFeaturedProjects, getProjectBySlug } from './api/projects.js';
import { getAllBlogPosts, getFeaturedBlogPosts, getBlogPostBySlug } from './api/blog.js';

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
        if (!header.classList.contains('scrolled') || window.location.pathname.includes('about') || window.location.pathname.includes('contact') || new URLSearchParams(window.location.search).has('project')) {
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
            <a href="/projects/?project=${project.slug}" class="project-card reveal active" data-category="${categorySlug}">
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

    // Helper to generate blog card HTML
    function createBlogCard(post) {
        const categorySlug = post.category ? post.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'all';
        return `
            <a href="/blog/?article=${post.slug}" class="blog-card reveal active" data-category="${categorySlug}">
                <div class="blog-card-img-wrapper">
                    <img src="${post.thumbnail}" alt="${post.title}" class="blog-card-img" loading="lazy">
                </div>
                <div class="blog-card-content">
                    <div class="blog-card-meta">
                        <span class="blog-card-category">${post.category}</span>
                        <span>${post.date}</span>
                    </div>
                    <h3 class="blog-card-title">${post.title}</h3>
                    <p class="blog-card-excerpt">${post.excerpt}</p>
                    <span class="blog-card-read-more">Read Article <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
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
                
                const pagination = document.getElementById('carousel-pagination');
                if (pagination) {
                    pagination.innerHTML = '';
                    featured.forEach((_, i) => {
                        const dot = document.createElement('div');
                        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
                        dot.addEventListener('click', () => {
                            const cardWidth = homeCarousel.querySelector('.project-card').offsetWidth;
                            const gap = parseInt(window.getComputedStyle(homeCarousel).gap) || 0;
                            homeCarousel.scrollTo({ left: i * (cardWidth + gap), behavior: 'smooth' });
                        });
                        pagination.appendChild(dot);
                    });

                    homeCarousel.addEventListener('scroll', () => {
                        const cardWidth = homeCarousel.querySelector('.project-card').offsetWidth;
                        const gap = parseInt(window.getComputedStyle(homeCarousel).gap) || 0;
                        const scrollPosition = homeCarousel.scrollLeft;
                        const activeIndex = Math.round(scrollPosition / (cardWidth + gap));
                        
                        const dots = pagination.querySelectorAll('.carousel-dot');
                        dots.forEach((dot, index) => {
                            if (index === activeIndex) {
                                dot.classList.add('active');
                            } else {
                                dot.classList.remove('active');
                            }
                        });
                    }, { passive: true });
                }
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

    // --- Dynamic Homepage Blog Section ---
    const homeBlogGrid = document.getElementById('home-blog-grid');
    if (homeBlogGrid && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/')) {
        try {
            const latestPosts = await getFeaturedBlogPosts(3);
            if (latestPosts.length > 0) {
                homeBlogGrid.innerHTML = latestPosts.map(p => createBlogCard(p)).join('');
            } else {
                homeBlogGrid.innerHTML = '<p style="color: var(--text-secondary); text-align: center; width: 100%; grid-column: 1 / -1;">No articles available.</p>';
            }
        } catch (error) {
            console.error(error);
        }
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

    // --- Dynamic Projects & Details Logic (SPA behavior on /projects/) ---
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("project");

    const gridView = document.getElementById('projects-grid-view');
    const detailsView = document.getElementById('project-details-view');
    const notFoundView = document.getElementById('project-not-found-view');

    if (slug && (gridView || detailsView || document.querySelector('.project-body'))) {
        if (gridView) gridView.style.display = 'none';
        
        try {
            const project = await getProjectBySlug(slug);
            if (project) {
                if (detailsView) detailsView.style.display = 'block';
                    // Update page title
                    document.title = `${project.title} - Pillarthree Productions`;

                    // Populate Project Meta and Info
                    const metaGrid = document.getElementById('project-meta-grid');
                    if (metaGrid) {
                        let metaHTML = '';
                        if (project.client) {
                            metaHTML += `<div class="meta-box"><span class="meta-title">Client</span><span>${project.client}</span></div>`;
                        }
                        if (project.category) {
                            metaHTML += `<div class="meta-box"><span class="meta-title">Category</span><span>${project.category}</span></div>`;
                        }
                        if (project.director) {
                            metaHTML += `<div class="meta-box"><span class="meta-title">Director</span><span>${project.director}</span></div>`;
                        }
                        if (project.year) {
                            metaHTML += `<div class="meta-box"><span class="meta-title">Year</span><span>${project.year}</span></div>`;
                        }
                        if (project.agency) {
                            metaHTML += `<div class="meta-box"><span class="meta-title">Agency</span><span>${project.agency}</span></div>`;
                        }
                        metaGrid.innerHTML = metaHTML;
                    }

                    const titleEl = document.getElementById('project-title');
                    if (titleEl) titleEl.textContent = project.title;

                    const descEl = document.getElementById('project-description');
                    if (descEl) descEl.textContent = project.description || '';

                    // Immediately load YouTube Video in hero
                    const heroContainer = document.getElementById('hero-media-container');
                    const videoWrapper = document.getElementById('hero-video-wrapper');
                    const thumbnailWrapper = document.getElementById('hero-thumbnail-wrapper');
                    const heroThumbnail = document.getElementById('hero-thumbnail');

                    if (heroContainer && project.youtubeId) {
                        // Set thumbnail while loading
                        if (heroThumbnail) {
                            heroThumbnail.src = project.thumbnail;
                            heroThumbnail.alt = project.title;
                            if (project.thumbnailFallback) {
                                heroThumbnail.setAttribute('data-fallback', project.thumbnailFallback);
                            }
                            heroThumbnail.setAttribute('onerror', 'handleImageError(this)');
                        }

                        videoWrapper.style.display = 'block';

                        const createPlayer = () => {
                            videoWrapper.innerHTML = '<div id="yt-player-embed" style="position:absolute; top:0; left:0; width:100%; height:100%;"></div>';
                            new window.YT.Player('yt-player-embed', {
                                videoId: project.youtubeId,
                                playerVars: { 'autoplay': 1, 'mute': 1, 'rel': 0, 'playsinline': 1 },
                                events: {
                                    'onReady': (event) => {
                                        event.target.playVideo();
                                        // Fade out thumbnail and spinner once player is ready
                                        if (thumbnailWrapper) {
                                            thumbnailWrapper.style.opacity = '0';
                                            setTimeout(() => {
                                                thumbnailWrapper.style.display = 'none';
                                            }, 600); // Wait for transition
                                        }
                                        videoWrapper.style.zIndex = '3';
                                    },
                                    'onError': (event) => {
                                        console.error('YouTube Player Error:', event.data);
                                        // Hide spinner if there's an error
                                        const spinner = document.querySelector('.hero-loading-spinner');
                                        if (spinner) spinner.style.display = 'none';
                                    }
                                }
                            });
                        };

                        if (window.YT && window.YT.Player) {
                            createPlayer();
                        } else {
                            const tag = document.createElement('script');
                            tag.src = "https://www.youtube.com/iframe_api";
                            const firstScriptTag = document.getElementsByTagName('script')[0];
                            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                            window.onYouTubeIframeAPIReady = createPlayer;
                        }
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
                                prevLink.href = `/projects/?project=${prevProject.slug}`;
                            }
                            if (nextLink) {
                                nextLink.href = `/projects/?project=${nextProject.slug}`;
                            }
                        }
                    }

                } else {
                    if (notFoundView) notFoundView.style.display = 'block';
                    else if (document.querySelector('.project-body')) document.querySelector('.project-body').innerHTML = '<h2>Project Not Found</h2>';
                }
            } catch (error) {
                console.error(error);
            }
        }

    // --- Dynamic Blog Page & Article Details ---
    const blogGridView = document.getElementById('blog-grid-view');
    const articleDetailsView = document.getElementById('article-details-view');
    const articleNotFoundView = document.getElementById('article-not-found-view');
    const blogPageGrid = document.getElementById('blog-page-grid');

    const articleParams = new URLSearchParams(window.location.search);
    const articleSlug = articleParams.get("article");

    if (blogPageGrid && !articleSlug) {
        try {
            const allPosts = await getAllBlogPosts();
            if (allPosts.length > 0) {
                blogPageGrid.innerHTML = allPosts.map(p => createBlogCard(p)).join('');
            } else {
                blogPageGrid.innerHTML = '<p style="color: var(--text-secondary); text-align: center; width: 100%; grid-column: 1 / -1;">No articles available.</p>';
            }
        } catch (error) {
            console.error(error);
        }
    }

    if (articleSlug && (blogGridView || articleDetailsView)) {
        if (blogGridView) blogGridView.style.display = 'none';
        
        try {
            const article = await getBlogPostBySlug(articleSlug);
            if (article) {
                if (articleDetailsView) articleDetailsView.style.display = 'block';
                document.title = `${article.title} - Pillarthree Productions`;

                const catEl = document.getElementById('article-category');
                if (catEl) catEl.textContent = article.category;
                
                const titleEl = document.getElementById('article-title');
                if (titleEl) titleEl.textContent = article.title;

                const authorEl = document.getElementById('article-author');
                if (authorEl) authorEl.textContent = article.author;

                const dateEl = document.getElementById('article-date');
                if (dateEl) dateEl.textContent = article.date;

                const timeEl = document.getElementById('article-reading-time');
                if (timeEl) timeEl.textContent = article.readingTime;

                const imgEl = document.getElementById('article-hero-img');
                if (imgEl) {
                    imgEl.src = article.thumbnail;
                    imgEl.alt = article.title;
                }

                const contentEl = document.getElementById('article-content');
                if (contentEl) {
                    if (window.marked && window.DOMPurify) {
                        const parsedHTML = window.marked.parse(article.content);
                        contentEl.innerHTML = window.DOMPurify.sanitize(parsedHTML);
                    } else {
                        contentEl.innerHTML = article.content;
                    }
                }

                // Article Navigation
                const allPosts = await getAllBlogPosts();
                if (allPosts && allPosts.length > 0) {
                    const currentIndex = allPosts.findIndex(p => p.slug === articleSlug);
                    if (currentIndex !== -1) {
                        const prevIndex = (currentIndex - 1 + allPosts.length) % allPosts.length;
                        const nextIndex = (currentIndex + 1) % allPosts.length;

                        const prevLink = document.getElementById('btn-article-prev');
                        const nextLink = document.getElementById('btn-article-next');

                        if (prevLink) prevLink.href = `/blog/?article=${allPosts[prevIndex].slug}`;
                        if (nextLink) nextLink.href = `/blog/?article=${allPosts[nextIndex].slug}`;
                    }

                    // Related Articles (filtered by category)
                    const relatedGrid = document.getElementById('related-articles-grid');
                    if (relatedGrid) {
                        let related = allPosts.filter(p => p.slug !== articleSlug && p.category === article.category);
                        if (related.length === 0) {
                            // fallback to any if no same category
                            related = allPosts.filter(p => p.slug !== articleSlug);
                        }
                        relatedGrid.innerHTML = related.slice(0, 2).map(p => createBlogCard(p)).join('');
                    }
                }

            } else {
                if (articleNotFoundView) articleNotFoundView.style.display = 'block';
            }
        } catch (error) {
            console.error(error);
        }
    }

    // --- Blog Filtering ---
    const blogFilterBtns = document.querySelectorAll('#blog-grid-view .filter-btn');
    if (blogFilterBtns.length > 0 && blogPageGrid) {
        blogFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                blogFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');
                const blogCards = document.querySelectorAll('#blog-page-grid .blog-card');

                blogCards.forEach(card => {
                    if (filterValue === 'all') {
                        card.style.display = 'flex';
                        setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 50);
                    } else {
                        if (card.getAttribute('data-category') === filterValue) {
                            card.style.display = 'flex';
                            setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 50);
                        } else {
                            card.style.opacity = '0';
                            card.style.transform = 'translateY(10px)';
                            setTimeout(() => { card.style.display = 'none'; }, 300);
                        }
                    }
                });
            });
        });
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
