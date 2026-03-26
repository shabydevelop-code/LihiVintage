// Product Data
const products = [
    {
        id: 1,
        title: "מעיל טרנץ' וינטג' משנות ה-70",
        category: "women",
        sub: "outerwear",
        categoryName: "נשים",
        subName: "מעילים",
        price: 320,
        image: "images/photo-1591047139829-d91aecb6caea.jpg",
        size: "M"
    },
    {
        id: 2,
        title: "צעיף משי קלאסי - הדפס זהב",
        category: "accessories",
        sub: "tops",
        categoryName: "אביזרים",
        subName: "חולצות/אביזרים",
        price: 85,
        image: "images/photo-1601924994987-69e26d50dc26.jpg",
        size: "One Size"
    },
    {
        id: 3,
        title: "מכנסי קורדרוי רטרו",
        category: "men",
        sub: "bottoms",
        categoryName: "גברים",
        subName: "מכנסיים",
        price: 180,
        image: "images/photo-1594633312681-425c7b97ccd1.jpg",
        size: "32"
    },
    {
        id: 4,
        title: "ז'קט דנים וינטג'",
        category: "men",
        sub: "outerwear",
        categoryName: "גברים",
        subName: "מעילים",
        price: 240,
        image: "images/photo-1551028719-00167b16eac5.jpg",
        size: "L"
    },
    {
        id: 5,
        title: "חולצת תחרה ויקטוריאנית - שמנת",
        category: "women",
        sub: "tops",
        categoryName: "נשים",
        subName: "חולצות",
        price: 125,
        image: "images/photo-1515886657613-9f3515b0c78f.jpg",
        size: "S"
    },
    {
        id: 6,
        title: "חצאית משובצת גזרה גבוהה",
        category: "women",
        sub: "bottoms",
        categoryName: "נשים",
        subName: "מכנסיים/חצאיות",
        price: 95,
        image: "images/photo-1583337130417-3346a1be7dee.jpg",
        size: "S/M"
    },
    {
        id: 7,
        title: "תיק סאטשל מעור",
        category: "accessories",
        sub: "bottoms",
        categoryName: "אביזרים",
        subName: "תיקים",
        price: 210,
        image: "images/photo-1548036328-c9fa89d128fa.jpg",
        size: "L"
    },
    {
        id: 8,
        title: "סוודר סרוג רטרו",
        category: "men",
        sub: "tops",
        categoryName: "גברים",
        subName: "חולצות",
        price: 155,
        image: "images/photo-1434389677669-e08b4cac3105.jpg",
        size: "L"
    },
    {
        id: 9,
        title: "שמלת מקסי פרחונית בוהו",
        category: "women",
        sub: "tops",
        categoryName: "נשים",
        subName: "שמלות",
        price: 245,
        image: "images/photo-1617339847948-7b36b2008611.jpg",
        size: "S"
    },
    {
        id: 10,
        title: "מכנס דנים קצר גזרה גבוהה",
        category: "women",
        sub: "bottoms",
        categoryName: "נשים",
        subName: "מכנסיים",
        price: 120,
        image: "images/photo-1591195853828-11db59a44f6b.jpg",
        size: "S"
    },
    {
        id: 11,
        title: "חולצה רטרו עם דפוס",
        category: "men",
        sub: "tops",
        categoryName: "גברים",
        subName: "חולצות",
        price: 165,
        image: "images/photo-1633972659388-6ab963e95f3d.jpg",
        size: "L"
    },
    {
        id: 12,
        title: "ז'קט שדה קנבס",
        category: "men",
        sub: "outerwear",
        categoryName: "גברים",
        subName: "מעילים",
        price: 310,
        image: "images/photo-1659539954675-c780f120b11a.jpg",
        size: "XL"
    },
    {
        id: 13,
        title: "שרשרת חוליות מוזהבת",
        category: "accessories",
        sub: "tops",
        categoryName: "אביזרים",
        subName: "תכשיטים",
        price: 75,
        image: "images/photo-1599643478518-a784e5dc4c8f.jpg",
        size: "One Size"
    },
    {
        id: 14,
        title: "כומתת צמר וינטג'",
        category: "accessories",
        sub: "tops",
        categoryName: "אביזרים",
        subName: "כובעים",
        price: 90,
        image: "images/photo-1699795877766-9caea1e4a01c.jpg",
        size: "One Size"
    }
];

// App State
let cart = [];
let currentCategory = 'all';
let currentSubCategory = 'all';

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const cartBadge = document.getElementById('cartBadge');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartOverlay = document.getElementById('cartOverlay');
const cartTrigger = document.getElementById('cartTrigger');
const closeCart = document.getElementById('closeCart');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeModal = document.getElementById('closeModal');
const checkoutForm = document.getElementById('checkoutForm');
const menuTrigger = document.getElementById('menuTrigger');
const mobileNavOverlay = document.getElementById('mobileNavOverlay');
const closeMobileNav = document.getElementById('closeMobileNav');
const themeToggle = document.getElementById('themeToggle');
let lastFocusedElement;

// Initialize
setupTheme();

document.addEventListener('DOMContentLoaded', () => {
    loadCart(); // Restore cart from local storage
    displayProducts();
    setupEventListeners();
    initThemeIcon();
});

function saveCart() {
    localStorage.setItem('lihi-cart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('lihi-cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

function setupTheme() {
    const savedTheme = localStorage.getItem('lihi-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function initThemeIcon() {
    if (themeToggle) {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        updateThemeIcon(currentTheme);
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('lihi-theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

function updateThemeIcon(theme) {
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fa-solid fa-sun';
    } else {
        icon.className = 'fa-solid fa-moon';
    }
}

// Functions
function displayProducts() {
    let filteredProducts = products;

    if (currentCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === currentCategory);
    }

    if (currentSubCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.sub === currentSubCategory);
    }

    productsGrid.innerHTML = filteredProducts.map(product => {
        const isInCart = cart.some(item => item.id === product.id);
        const btnText = isInCart ? "כבר בסל שלך" : "הוספה לסל";
        const btnClass = isInCart ? "add-to-cart-btn in-cart" : "add-to-cart-btn";
        const btnAction = isInCart ? "toggleCart(true)" : `addToCart(${product.id})`;

        return `
            <div class="product-card" tabindex="0">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.title}">
                </div>
                <div class="product-info">
                    <p class="product-category">${product.categoryName} | ${product.subName}</p>
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-size">מידה: ${product.size}</p>
                    <p class="product-price">₪${product.price.toFixed(2)}</p>
                    <button class="${btnClass}" 
                            onclick="${btnAction}" 
                            aria-label="${isInCart ? 'הפריט כבר בסל שלך' : 'הוספת ' + product.title + ' לסל הקניות'}">
                        ${btnText}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        // Just open the cart if already there
        toggleCart(true);
        return;
    } else {
        cart.push(product);
    }

    updateCartUI();
    saveCart();
    displayProducts(); // Refresh buttons to show "Already in cart"
    toggleCart(true);
}

function updateCartUI() {
    // Update Badge
    cartBadge.innerText = cart.length;

    // Update Items List
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align: center; margin-top: 4rem;">
                <p style="color: var(--text-muted); margin-bottom: 2rem; font-size: 1.1rem;">הסל שלכם עדיין ריק...</p>
                <button class="btn btn-primary" onclick="toggleCart(false)" style="padding: 0.8rem 2rem;">
                    חזרה לקטלוג
                </button>
            </div>
        `;
        cartTotal.innerText = '₪0.00';
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-info">
                    <h4>${item.title}</h4>
                    <p class="cart-item-size">מידה: ${item.size}</p>
                    <p class="cart-item-price">₪${item.price.toFixed(2)}</p>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})" aria-label="הסרת ${item.title} מהסל" title="הסרת פריט">
                    <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
                </button>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + item.price, 0);
        cartTotal.innerText = `₪${total.toFixed(2)}`;
    }
}

function updateQty(id, change) {
    const item = cart.find(item => item.id === id);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(id);
    } else {
        updateCartUI();
        saveCart();
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
    saveCart();
    displayProducts();
}

function toggleCart(isOpen, fromPopState = false) {
    if (isOpen) {
        lastFocusedElement = document.activeElement;
        cartOverlay.classList.add('open');
        document.body.classList.add('drawer-open');
        if (!fromPopState) pushModalState();
        setTimeout(() => {
            closeCart.focus();
        }, 100);
    } else {
        cartOverlay.classList.remove('open');
        document.body.classList.remove('drawer-open');
        if (!fromPopState && history.state?.modalOpen) history.back();
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    }
}

function toggleMobileNav(isOpen, fromPopState = false) {
    if (isOpen) {
        mobileNavOverlay.classList.add('open');
        document.body.classList.add('drawer-open');
        if (!fromPopState) pushModalState();
    } else {
        mobileNavOverlay.classList.remove('open');
        document.body.classList.remove('drawer-open');
        if (!fromPopState && history.state?.modalOpen) history.back();
    }
}

function pushModalState() {
    history.pushState({ modalOpen: true }, '');
}

window.addEventListener('popstate', (e) => {
    // Close everything when back is pressed
    if (cartOverlay.classList.contains('open')) toggleCart(false, true);
    if (mobileNavOverlay.classList.contains('open')) toggleMobileNav(false, true);
    if (checkoutModal.style.display === 'flex') {
        checkoutModal.style.display = 'none';
        document.body.classList.remove('drawer-open');
    }
    // Also trigger accessibility bar close if open
    window.dispatchEvent(new CustomEvent('closeAccessibilitySidebar'));
});

function setupEventListeners() {
    // Navigation Links
    document.querySelectorAll('.filter-link, .mobile-filter-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.dataset.category;
            
            // Sync all links (desktop and mobile)
            document.querySelectorAll('.filter-link, .mobile-filter-link').forEach(l => {
                if (l.dataset.category === category) {
                    l.classList.add('active');
                } else {
                    l.classList.remove('active');
                }
            });
            
            currentCategory = category;
            displayProducts();
            toggleMobileNav(false); // Close mobile nav if open
        });
    });

    // Sub-category Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            currentSubCategory = btn.dataset.sub;
            displayProducts();
        });
    });

    // Cart Interactions
    cartTrigger.addEventListener('click', () => toggleCart(true));
    closeCart.addEventListener('click', () => toggleCart(false));
    cartOverlay.addEventListener('click', (e) => {
        if (e.target === cartOverlay) toggleCart(false);
    });

    // Mobile Menu Interactions
    menuTrigger.addEventListener('click', () => toggleMobileNav(true));
    closeMobileNav.addEventListener('click', () => toggleMobileNav(false));

    // Checkout Modal
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("הסל שלכם ריק!");
            return;
        }
        lastFocusedElement = document.activeElement;
        toggleCart(false, true); // Close cart without adding to history (we are about to add one for checkout)
        pushModalState();
        checkoutModal.style.display = 'flex';
        document.body.classList.add('drawer-open');
        setTimeout(() => {
            closeModal.focus();
        }, 100);
    });

    closeModal.addEventListener('click', () => {
        checkoutModal.style.display = 'none';
        document.body.classList.remove('drawer-open');
        if (history.state?.modalOpen) history.back();
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        }
    });

    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            checkoutModal.style.display = 'none';
            document.body.classList.remove('drawer-open');
            if (history.state?.modalOpen) history.back();
            if (lastFocusedElement) lastFocusedElement.focus();
        }
    });

    // Form Submission
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value;
        const phone = document.getElementById('phone').value.replace(/[-\s]/g, ''); // Remove hyphens/spaces
        const notes = document.getElementById('orderNotes').value;
        
        // Simple Israeli Mobile Validation
        const phoneRegex = /^05\d{8}$/;
        if (!phoneRegex.test(phone)) {
            alert('נא להזין מספר טלפון נייד תקין (10 ספרות, למשל 0521234567)');
            return;
        }

        sendToWhatsApp(fullName, phone, notes);
    });
}

function sendToWhatsApp(name, phone, notes) {
    const sellerNumber = "972522436758"; // Lihi Vintage WhatsApp
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    let itemsText = cart.map(item => `- ${item.title} | מידה: ${item.size} | ₪${item.price.toFixed(2)}`).join('%0A');
    
    let message = `*הזמנה חדשה מליהי וינטג'*%0A%0A` +
                  `*לקוח/ה:* ${name}%0A` +
                  `*טלפון:* ${phone}%0A%0A` +
                  `*פרטי הזמנה:*%0A${itemsText}%0A%0A` +
                  `*מחיר כולל:* ₪${total.toFixed(2)}%0A%0A`;

    if (notes) {
        message += `*הערות להזמנה:*%0A${notes}%0A%0A`;
    }

    message += `*תשלום:* אשלם באמצעות Bit.%0A` +
               `נא לאשר זמינות לאיסוף מדיזינגוף!`;

    const whatsappUrl = `https://wa.me/${sellerNumber}?text=${message}`;
    
    cart = [];
    updateCartUI();
    saveCart();
    displayProducts(); // Reset product buttons
    checkoutModal.style.display = 'none';
    document.body.classList.remove('drawer-open');
    
    window.open(whatsappUrl, '_blank');
}
