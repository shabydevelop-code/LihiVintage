/**
 * shared-components.js
 * Centralizes Header and Footer for Lihi Vintage
 */

const HEADER_HTML = `
    <div class="container header-content">
        <div class="header-actions">
            <button id="themeToggle" class="theme-toggle" aria-label="החלפת מצב יום/לילה">
                <i class="fa-solid fa-moon"></i>
            </button>
            <button class="menu-trigger" id="menuTrigger" aria-label="פתיחת תפריט">
                <i class="fa-solid fa-bars"></i>
            </button>
            <button class="cart-trigger" id="cartTrigger" aria-label="צפייה בסל הקניות">
                <div class="cart-icon">
                    <i class="fa-solid fa-shopping-bag" aria-hidden="true"></i>
                    <span class="cart-badge" id="cartBadge" aria-live="polite">0</span>
                </div>
            </button>
        </div>
        <nav class="nav-links">
            <a href="{{HOME}}#" class="filter-link active" data-category="all">כל הפריטים</a>
            <a href="{{HOME}}#women" class="filter-link" data-category="women">נשים</a>
            <a href="{{HOME}}#men" class="filter-link" data-category="men">גברים</a>
            <a href="{{HOME}}#accessories" class="filter-link" data-category="accessories">אביזרים</a>
        </nav>
        <div class="logo serif"><a href="{{HOME}}" style="color: inherit; text-decoration: none;">Lihi Vintage</a></div>
    </div>
`;

const FOOTER_HTML = `
    <div class="container footer-content">
        <div class="footer-section">
            <h3>שירות לקוחות</h3>
            <ul class="footer-links">
                <li><a href="https://wa.me/972522436758" target="_blank" rel="noopener">צרו קשר</a></li>
                <li><a href="accessibility.html">הצהרת נגישות</a></li>
            </ul>
        </div>
        <div class="footer-section">
            <h3>נקודת איסוף</h3>
            <p><i class="fa-solid fa-location-dot"></i> דיזינגוף 101, תל אביב</p>
            <p><i class="fa-solid fa-calendar"></i> א'-ה': 10:00 - 19:00</p>
            <p><i class="fa-solid fa-calendar"></i> יום ו': 09:00 - 15:00</p>
        </div>
        <div class="footer-section">
            <h3>אמצעי תשלום</h3>
            <p><i class="fa-solid fa-mobile-screen"></i> נתמכים: Bit, מזומן באיסוף</p>
        </div>
    </div>
    <div class="container footer-bottom">
        <p>&copy; 2026 כל הזכויות שמורות.</p>
    </div>
`;

const MOBILE_NAV_HTML = `
    <div class="mobile-nav-content">
        <button class="close-mobile-nav" id="closeMobileNav" aria-label="סגירת תפריט">
            <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="mobile-logo-box">
            <div class="mobile-logo">תפריט</div>
        </div>
        <nav class="mobile-links">
            <a href="{{HOME}}#" class="mobile-filter-link active" data-category="all">כל הפריטים</a>
            <a href="{{HOME}}#women" class="mobile-filter-link" data-category="women">נשים</a>
            <a href="{{HOME}}#men" class="mobile-filter-link" data-category="men">גברים</a>
            <a href="{{HOME}}#accessories" class="mobile-filter-link" data-category="accessories">אביזרים</a>
        </nav>
    </div>
`;

const SIMPLE_HEADER_HTML = `
    <div class="container header-content">
        <div class="header-actions">
            <a href="index.html" class="back-link" style="color: var(--text-color); font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 0.5rem; white-space: nowrap;">
                <i class="fa-solid fa-chevron-right"></i> חזרה לחנות
            </a>
        </div>
        <div class="logo serif"><a href="index.html" style="color: inherit; text-decoration: none;">Lihi Vintage</a></div>
    </div>
`;

function injectSharedComponents() {
    const isIndex = window.location.pathname.endsWith('index.html') || 
                   window.location.pathname.split('/').pop() === '' || 
                   window.location.pathname.endsWith('/');
                   
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');

    if (header) {
        if (isIndex) {
            header.innerHTML = HEADER_HTML.replace(/{{HOME}}/g, '');
        } else {
            header.innerHTML = SIMPLE_HEADER_HTML;
        }
    }
    
    if (footer) {
        footer.innerHTML = FOOTER_HTML.replace(/{{HOME}}/g, isIndex ? '' : 'index.html');
    }
    
    if (mobileNavOverlay && isIndex) {
        mobileNavOverlay.innerHTML = MOBILE_NAV_HTML.replace(/{{HOME}}/g, '');
    } else if (mobileNavOverlay) {
        mobileNavOverlay.style.display = 'none'; // Ensure it doesn't exist on other pages
    }

    // Call theme setup
    setupThemeShared();
}

function setupThemeShared() {
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('lihi-theme') || 'light';
    
    // Apply theme immediately even if no toggle exists
    html.setAttribute('data-theme', savedTheme);

    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    const icon = themeToggle.querySelector('i');
    const updateIcon = (theme) => {
        if (icon) icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    };

    updateIcon(savedTheme);

    // Click handler for index page
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('lihi-theme', newTheme);
        updateIcon(newTheme);
    });
}

// Small helper to handle navigation for external pages
window.addEventListener('load', () => {
    // If we have hash in URL but we are on index.html, trigger any listeners if needed
    // (Actually script.js already does this)
});

// Run as soon as possible
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSharedComponents);
} else {
    injectSharedComponents();
}
