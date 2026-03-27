// Product Data is now loaded from products.js

// App State
let cart = [];
let currentCategory = 'all';
let currentSubCategory = 'all';

// DOM Elements
let productsGrid, cartBadge, cartItemsContainer, cartTotal, cartOverlay, cartTrigger, 
    closeCart, checkoutBtn, checkoutModal, closeModal, checkoutForm, 
    menuTrigger, mobileNavOverlay, closeMobileNav;
let lastFocusedElement;

// Initialize

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize DOM Elements
    productsGrid = document.getElementById('productsGrid');
    cartBadge = document.getElementById('cartBadge');
    cartItemsContainer = document.getElementById('cartItems');
    cartTotal = document.getElementById('cartTotal');
    cartOverlay = document.getElementById('cartOverlay');
    cartTrigger = document.getElementById('cartTrigger');
    closeCart = document.getElementById('closeCart');
    checkoutBtn = document.getElementById('checkoutBtn');
    checkoutModal = document.getElementById('checkoutModal');
    closeModal = document.getElementById('closeModal');
    checkoutForm = document.getElementById('checkoutForm');
    menuTrigger = document.getElementById('menuTrigger');
    mobileNavOverlay = document.getElementById('mobileNavOverlay');
    closeMobileNav = document.getElementById('closeMobileNav');

    // 2. Load and Display
    loadCart(); // Restore cart from local storage
    displayProducts();
    setupEventListeners();
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


// Functions
function displayProducts() {
    let filteredProducts = products.filter(p => p.active !== false); // Hide inactive items

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
    showToast(`${product.title} נוסף לסל הקניות!`, 'success');
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
            updateActiveCategoryLabel();
            displayProducts();
            toggleMobileNav(false); // Close mobile nav if open
        });
    });

    updateActiveCategoryLabel(); // Initial call to show initial category

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
    mobileNavOverlay.addEventListener('click', (e) => {
        if (e.target === mobileNavOverlay) toggleMobileNav(false);
    });

    // Checkout Modal
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showToast("הסל שלכם ריק!", "error");
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
            showToast('נא להזין מספר טלפון נייד תקין (10 ספרות, למשל 0521234567)', 'error');
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

function updateActiveCategoryLabel() {
    const label = document.getElementById('activeCategoryName');
    if (!label) return;
    
    const categoryMap = {
        'all': 'כל הפריטים',
        'women': 'נשים',
        'men': 'גברים',
        'accessories': 'אביזרים'
    };
    
    label.innerText = categoryMap[currentCategory] || 'כל הפריטים';
}

/**
 * Custom elegant Toast notification system
 * @param {string} message - The message to display
 * @param {string} type - 'success', 'error', 'info', 'warning'
 * @param {number} duration - Milliseconds to show the toast
 */
function showToast(message, type = 'info', duration = 3000) {
    // 1. Ensure container exists
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // 2. Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Select icon based on type
    let iconClass = 'fa-circle-info';
    if (type === 'success') iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-exclamation';
    if (type === 'warning') iconClass = 'fa-triangle-exclamation';

    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <div class="toast-message">${message}</div>
    `;

    // 3. Add to container
    container.appendChild(toast);

    // 4. Auto-remove
    const removeToast = () => {
        if (toast.classList.contains('fade-out')) return; 
        toast.classList.add('fade-out');
        setTimeout(() => {
            toast.remove();
            if (container.childNodes.length === 0) {
                container.remove();
            }
        }, 500); // Wait for fade-out animation
    };

    const timeoutId = setTimeout(removeToast, duration);

    // Allow user to click to dismiss
    toast.addEventListener('click', () => {
        clearTimeout(timeoutId);
        removeToast();
    });
}
