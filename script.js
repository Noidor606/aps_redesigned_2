// --- ОСНОВНОЙ КОД САЙТА ---
document.addEventListener('DOMContentLoaded', () => {

    // ===================================================================
    // === ФОН НА CANVAS ===
    // ===================================================================
    function setupCanvasBackground() {
        // ... твой код для фона ...
        const canvas = document.getElementById('dynamic-canvas-background');
        if (!canvas) { return; }
        const iconFiles = [ 'icon1.png', 'icon2.png', 'icon3.png', 'icon4.png', 'icon5.png', 'icon6.png', 'icon7.png', 'icon8.png', 'icon9.png', 'icon10.png', 'icon11.png', 'icon12.png', 'icon14.png', 'icon15.png', 'icon16.png', 'icon17.png' ];
        let iconImages = [];
        let iconsLoaded = false;
        let resizeTimer;
        function preloadIcons(callback) {
            let loadedCount = 0;
            iconFiles.forEach(src => {
                const img = new Image();
                img.src = src;
                img.onload = () => { loadedCount++; if (loadedCount === iconFiles.length) { iconsLoaded = true; callback(); } };
                iconImages.push(img);
            });
        }
        function drawIcons() {
            if (!iconsLoaded) return;
            const ctx = canvas.getContext('2d');
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            ctx.globalAlpha = 0.075;
            ctx.filter = 'grayscale(1) brightness(1.5) contrast(0.5)';
            ctx.clearRect(0, 0, rect.width, rect.height);
            const cellSize = 55;
            const cols = Math.floor(rect.width / cellSize);
            const rows = Math.floor(rect.height / cellSize);
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const randomIconImage = iconImages[Math.floor(Math.random() * iconImages.length)];
                    if (!randomIconImage || !randomIconImage.complete) continue;
                    const maxSize = 38;
                    const aspectRatio = randomIconImage.naturalWidth / randomIconImage.naturalHeight;
                    let newWidth, newHeight;
                    if (aspectRatio > 1) { newWidth = maxSize; newHeight = maxSize / aspectRatio; } 
                    else { newHeight = maxSize; newWidth = maxSize * aspectRatio; }
                    const x = c * cellSize + (cellSize - newWidth) / 2;
                    const y = r * cellSize + (cellSize - newHeight) / 2;
                    const randomAngle = (Math.random() * 30 - 15) * Math.PI / 180;
                    ctx.save();
                    ctx.translate(x + newWidth / 2, y + newHeight / 2);
                    ctx.rotate(randomAngle);
                    ctx.drawImage(randomIconImage, -newWidth / 2, -newHeight / 2, newWidth, newHeight);
                    ctx.restore();
                }
            }
        }
        function handleResize() { clearTimeout(resizeTimer); resizeTimer = setTimeout(drawIcons, 250); }
        if (window.innerWidth > 992) { preloadIcons(drawIcons); window.addEventListener('resize', handleResize); }
    }
    setupCanvasBackground();

    // --- ОСТАЛЬНОЙ КОД БЕЗ ИЗМЕНЕНИЙ ---
    if (history.scrollRestoration) { history.scrollRestoration = 'manual'; }
    else { window.onbeforeunload = function () { window.scrollTo(0, 0); } }
    window.scrollTo(0, 0);

    const header = document.querySelector('.site-header');
    if (header) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    header.classList.toggle('header-scrolled', !entry.isIntersecting);
                });
            }, { rootMargin: `-80px 0px 0px 0px` }
        );
        const heroSection = document.querySelector('#hero');
        if (heroSection) { observer.observe(heroSection); }
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.getAttribute('href') === '#contact' && (this.closest('.hero-section') || this.closest('.pricing-section') || this.closest('.site-header'))) { return; }
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                let headerOffset = document.querySelector('.site-header')?.offsetHeight || 0;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: "smooth" });
            }
        });
    });

    // --- БУРГЕР-МЕНЮ (ОРИГИНАЛЬНАЯ, РАБОЧАЯ ВЕРСИЯ) ---
    const burger = document.querySelector('.burger-menu');
    const nav = document.querySelector('.nav-links');
    if (burger && nav) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('open');
            burger.classList.toggle('open');
            document.body.classList.toggle('no-scroll'); 
        });
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (nav.classList.contains('open')) {
                    nav.classList.remove('open');
                    burger.classList.remove('open');
                    document.body.classList.remove('no-scroll');
                }
            });
        });
    }

    // --- АНИМАЦИЯ ЭЛЕМЕНТОВ ПРИ СКРОЛЛЕ ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        animatedElements.forEach(el => observer.observe(el));
    }

    // --- ЛОГИКА ЛАЙТБОКСА ДЛЯ ГАЛЕРЕИ ---
    const galleryItems = document.querySelectorAll('.gallery-grid .gallery-item');
    const lightbox = document.getElementById('lightbox');
    if (galleryItems.length > 0 && lightbox) {
        const lightboxImage = lightbox.querySelector('.lightbox-image');
        const lightboxClose = lightbox.querySelector('.lightbox-close');
        let isZoomed = false;
        const resetImageState = () => { isZoomed = false; lightboxImage.classList.remove('zoomed'); lightboxImage.style.transform = 'scale(1)'; lightboxImage.style.transformOrigin = 'center center'; };
        const openLightbox = (imageUrl) => { resetImageState(); lightboxImage.setAttribute('src', imageUrl); lightbox.classList.add('active'); document.body.style.overflow = 'hidden'; };
        const closeLightbox = () => { lightbox.classList.remove('active'); document.body.style.overflow = 'auto'; };
        lightboxImage.addEventListener('click', e => {
            if (e.target !== lightboxImage) return;
            if (!isZoomed) { isZoomed = true; const rect = lightboxImage.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top; lightboxImage.style.transformOrigin = `${x}px ${y}px`; lightboxImage.style.transform = 'scale(1.75)'; lightboxImage.classList.add('zoomed'); } 
            else { isZoomed = false; lightboxImage.style.transform = 'scale(1)'; lightboxImage.classList.remove('zoomed'); }
        });
        lightboxImage.addEventListener('transitionend', () => { if (!isZoomed) { lightboxImage.style.transformOrigin = 'center center'; } });
        galleryItems.forEach(item => { item.addEventListener('click', e => { e.preventDefault(); openLightbox(item.getAttribute('href')); }); });
        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', e => { if (e.target === lightbox) { closeLightbox(); } });
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && lightbox.classList.contains('active')) { closeLightbox(); } });
    }

    // --- ЛОГИКА МОДАЛЬНОГО ОКНА ЗАЯВКИ ---
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        const openModalButtons = document.querySelectorAll('a[href="#contact"].btn.btn-primary, .header-cta'); 
        const contactForm = document.getElementById('contact-form');
        const openModal = () => {
            modalContainer.classList.add('active'); document.body.style.overflow = 'hidden';
            if(contactForm){
                const formStatus = contactForm.querySelector('#form-status');
                if (formStatus && formStatus.classList.contains('success')) { formStatus.style.display = 'none'; formStatus.className = ''; contactForm.reset(); }
            }
        };
        const closeModal = () => { modalContainer.classList.remove('active'); document.body.style.overflow = 'auto'; };
        openModalButtons.forEach(btn => { btn.addEventListener('click', e => { e.preventDefault(); openModal(); }); });
        modalContainer.addEventListener('click', e => { if (e.target.matches('.modal-overlay, .modal-close, .btn-cancel')) { closeModal(); } });
        if (contactForm) {
            contactForm.addEventListener('submit', function (e) {
                e.preventDefault();
                // ... твой код отправки формы ...
            });
        }
    }
});