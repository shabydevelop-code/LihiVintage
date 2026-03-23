const STORAGE_KEYS = {
  items: "lihi-market-items",
  orders: "lihi-market-orders",
  settings: "lihi-market-settings",
  cart: "lihi-market-cart",
  consent: "lihi-market-cookie-consent",
};

const defaultSettings = {
  sellerPhone: "050-123-4567",
  pickupAddress: "14 HaGefen Street, Haifa",
  pickupInstructions:
    "Please arrive during pickup hours and show your confirmation name and payment status.",
};

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureSeedData() {
  if (!readJson(STORAGE_KEYS.items)) {
    writeJson(STORAGE_KEYS.items, []);
  }

  if (!readJson(STORAGE_KEYS.orders)) {
    writeJson(STORAGE_KEYS.orders, []);
  }

  if (!readJson(STORAGE_KEYS.settings)) {
    writeJson(STORAGE_KEYS.settings, defaultSettings);
  }

  if (!readJson(STORAGE_KEYS.cart)) {
    writeJson(STORAGE_KEYS.cart, []);
  }
}

function hasGoogleSheetSource() {
  return Boolean(window.LihiSheetData?.hasSource?.());
}

function mergeSheetItemsWithLocalState(sheetItems) {
  const existingItems = readJson(STORAGE_KEYS.items, []);
  const existingById = new Map(existingItems.map((item) => [item.id, item]));

  return sheetItems.map((item) => {
    const existingItem = existingById.get(item.id);
    if (!existingItem) {
      return item;
    }

    return {
      ...item,
      status: existingItem.status || item.status,
      quantity: existingItem.quantity || item.quantity,
    };
  });
}

async function syncItemsFromGoogleSheet() {
  if (!hasGoogleSheetSource()) {
    saveItems([]);
    return false;
  }

  try {
    const sheetItems = await window.LihiSheetData.loadItems();
    if (!Array.isArray(sheetItems)) {
      return false;
    }

    saveItems(mergeSheetItemsWithLocalState(sheetItems));
    return true;
  } catch (error) {
    console.error(error);
    saveItems([]);
    return false;
  }
}

function getItems() {
  return readJson(STORAGE_KEYS.items, []);
}

function getOrders() {
  return readJson(STORAGE_KEYS.orders, []);
}

function getSettings() {
  return readJson(STORAGE_KEYS.settings, defaultSettings);
}

function getCart() {
  return readJson(STORAGE_KEYS.cart, []);
}

function saveItems(items) {
  writeJson(STORAGE_KEYS.items, items);
}

function saveOrders(orders) {
  writeJson(STORAGE_KEYS.orders, orders);
}

function saveCart(cart) {
  writeJson(STORAGE_KEYS.cart, cart);
}

function getConsentChoice() {
  return readJson(STORAGE_KEYS.consent, null);
}

function saveConsentChoice(choice) {
  try {
    writeJson(STORAGE_KEYS.consent, {
      choice,
      updatedAt: new Date().toISOString(),
    });
  } catch {}
}

function currency(value) {
  const amount = new Intl.NumberFormat("he-IL", {
    maximumFractionDigits: 0,
  }).format(value);
  return `₪ ${amount}`;
}

function translateCondition(value) {
  const map = {
    Excellent: "מצוין",
    "Very Good": "טוב מאוד",
    Good: "טוב",
    "Worn In": "משומש היטב",
  };

  return map[value] || value;
}

function uniqueValues(items, field) {
  return [...new Set(items.map((item) => item[field]).filter(Boolean))].sort();
}

function makeOption(value) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  return option;
}

function renderFilters(items) {
  const sizeFilter = document.getElementById("size-filter");
  const categoryFilter = document.getElementById("category-filter");
  const eraFilter = document.getElementById("era-filter");

  uniqueValues(items, "size").forEach((size) => sizeFilter.appendChild(makeOption(size)));
  uniqueValues(items, "category").forEach((category) => categoryFilter.appendChild(makeOption(category)));
  uniqueValues(items, "era").forEach((era) => eraFilter.appendChild(makeOption(era)));
}

function getFilterValues() {
  return {
    search: document.getElementById("search-input").value.trim().toLowerCase(),
    size: document.getElementById("size-filter").value,
    category: document.getElementById("category-filter").value,
    era: document.getElementById("era-filter").value,
    minPrice: Number(document.getElementById("min-price-filter").value || 0),
    maxPrice: Number(document.getElementById("max-price-filter").value || Infinity),
  };
}

function filterItems(items, filters) {
  return items.filter((item) => {
    if (item.status !== "available") {
      return false;
    }

    const haystack = [item.title, item.category, item.era, item.description].join(" ").toLowerCase();
    const matchesSearch = !filters.search || haystack.includes(filters.search);
    const matchesSize = !filters.size || item.size === filters.size;
    const matchesCategory = !filters.category || item.category === filters.category;
    const matchesEra = !filters.era || item.era === filters.era;
    const matchesMinPrice = item.price >= filters.minPrice;
    const matchesMaxPrice = item.price <= filters.maxPrice;

    return (
      matchesSearch &&
      matchesSize &&
      matchesCategory &&
      matchesEra &&
      matchesMinPrice &&
      matchesMaxPrice
    );
  });
}

function findItemById(id) {
  return getItems().find((item) => item.id === id);
}

function getCartItems() {
  const cartIds = getCart();
  const itemMap = new Map(getItems().map((item) => [item.id, item]));
  return cartIds.map((id) => itemMap.get(id)).filter((item) => item && item.status === "available");
}

function basketTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

function productCard(item) {
  const article = document.createElement("article");
  const inCart = getCart().includes(item.id);
  article.className = "product-card";
  article.innerHTML = `
    <img src="${item.image}" alt="${item.title}, vintage ${item.category} piece from the ${item.era} era">
    <div class="product-card-body">
      <div>
        <p class="section-kicker">${item.era} / ${item.category}</p>
        <h3>${item.title}</h3>
        <p class="product-meta">${item.description}</p>
      </div>
      <dl class="meta-list">
        <div>
          <dt>מידה</dt>
          <dd>${item.size}</dd>
        </div>
        <div>
          <dt>מצב</dt>
          <dd>${translateCondition(item.condition)}</dd>
        </div>
        <div>
          <dt>מחיר</dt>
          <dd class="price-tag">${currency(item.price)}</dd>
        </div>
      </dl>
      <button class="button button-primary" type="button" data-item-id="${item.id}" ${inCart ? "disabled" : ""}>
        ${inCart ? "כבר בסל" : "הוספה לסל"}
      </button>
    </div>
  `;

  return article;
}

function renderCatalog() {
  const items = getItems();
  const filtered = filterItems(items, getFilterValues());
  const grid = document.getElementById("product-grid");
  const emptyState = document.getElementById("empty-state");
  const summary = document.getElementById("results-summary");

  grid.innerHTML = "";
  filtered.forEach((item) => grid.appendChild(productCard(item)));

  emptyState.hidden = filtered.length > 0;
  summary.textContent = `${filtered.length} פריטים זמינים`;
}

function renderBasket() {
  const cartItems = getCartItems();
  const basketItems = document.getElementById("basket-items");
  const basketEmptyState = document.getElementById("basket-empty-state");
  const count = document.getElementById("basket-count");
  const footerTotal = document.getElementById("basket-footer-total");
  const totalItems = document.getElementById("basket-total-items");
  const totalPrice = document.getElementById("basket-total-price");

  basketItems.innerHTML = "";
  basketEmptyState.hidden = cartItems.length > 0;

  cartItems.forEach((item) => {
    const row = document.createElement("article");
    row.className = "basket-row";
    row.innerHTML = `
      <img src="${item.image}" alt="${item.title}, added to basket">
      <div>
        <h3>${item.title}</h3>
        <p>${item.category} ֲ· ${item.era}</p>
        <p>מידה ${item.size} · ${translateCondition(item.condition)}</p>
        <p class="price-tag">${currency(item.price)}</p>
      </div>
      <button class="button button-secondary" type="button" data-remove-id="${item.id}">הסרה</button>
    `;
    basketItems.appendChild(row);
  });

  const total = basketTotal(cartItems);
  count.textContent = String(cartItems.length);
  footerTotal.textContent = currency(total);
  totalItems.textContent = String(cartItems.length);
  totalPrice.textContent = currency(total);
}

function syncBodyScrollLock() {
  const basketOpen = document.querySelector(".basket-drawer").dataset.open === "true";
  const checkoutOpen = document.getElementById("checkout-dialog").open;
  const confirmationOpen = document.getElementById("confirmation-dialog").open;
  document.body.classList.toggle("modal-open", basketOpen || checkoutOpen || confirmationOpen);
}

function toggleBasket(open) {
  document.querySelector(".basket-drawer").dataset.open = open ? "true" : "false";
  document.getElementById("basket-backdrop").hidden = !open;
  syncBodyScrollLock();
}

function addToCart(itemId) {
  const item = findItemById(itemId);
  if (!item || item.status !== "available") {
    renderCatalog();
    renderBasket();
    return;
  }

  const cart = getCart();
  if (!cart.includes(itemId)) {
    cart.push(itemId);
    saveCart(cart);
  }

  renderCatalog();
  renderBasket();
  toggleBasket(true);
}

function removeFromCart(itemId) {
  saveCart(getCart().filter((id) => id !== itemId));
  renderCatalog();
  renderBasket();
}

function clearCart() {
  saveCart([]);
  renderCatalog();
  renderBasket();
}

function openCheckout() {
  const cartItems = getCartItems();
  if (cartItems.length === 0) {
    toggleBasket(true);
    return;
  }

  const settings = getSettings();
  const dialog = document.getElementById("checkout-dialog");
  const card = document.getElementById("checkout-item-card");
  document.getElementById("bit-phone").textContent = settings.sellerPhone;
  card.innerHTML = `
    <div class="basket-line-items">
      ${cartItems
        .map(
          (item) => `
            <article class="basket-row">
              <img src="${item.image}" alt="${item.title}, selected for checkout">
              <div>
                <h4>${item.title}</h4>
                <p>${item.category} · ${item.era}</p>
                <p>מידה ${item.size} · ${translateCondition(item.condition)}</p>
                <p class="price-tag">${currency(item.price)}</p>
              </div>
              <button class="button button-secondary" type="button" data-remove-id="${item.id}">הסרה</button>
            </article>
          `,
        )
        .join("")}
    </div>
  `;

  document.getElementById("basket-total-items").textContent = String(cartItems.length);
  document.getElementById("basket-total-price").textContent = currency(basketTotal(cartItems));
  document.getElementById("checkout-form").reset();
  dialog.showModal();
  syncBodyScrollLock();
}

function closeDialog(id) {
  const dialog = document.getElementById(id);
  if (dialog.open) {
    dialog.close();
  }
  syncBodyScrollLock();
}

function confirmOrder(formData) {
  const cartIds = getCart();
  const items = getItems();
  const cartItems = cartIds
    .map((id) => items.find((item) => item.id === id))
    .filter(Boolean);

  if (cartItems.length === 0) {
    throw new Error("הסל שלך ריק.");
  }

  const unavailable = cartItems.find((item) => item.status !== "available");
  if (unavailable) {
    throw new Error("אחד או יותר מהפריטים בסל כבר לא זמינים.");
  }

  const soldIds = new Set(cartItems.map((item) => item.id));
  const updatedItems = items.map((item) =>
    soldIds.has(item.id)
      ? {
          ...item,
          status: "sold",
        }
      : item,
  );

  const order = {
    id: `ord-${Date.now()}`,
    itemIds: cartItems.map((item) => item.id),
    itemTitles: cartItems.map((item) => item.title),
    price: basketTotal(cartItems),
    buyerName: formData.get("buyerName"),
    buyerPhone: formData.get("buyerPhone"),
    buyerEmail: formData.get("buyerEmail"),
    pickupNotes: formData.get("pickupNotes"),
    paymentMethod: formData.get("paymentMethod"),
    status: formData.get("paymentMethod") === "bit" ? "awaiting_payment" : "awaiting_pickup",
    createdAt: new Date().toISOString(),
  };

  const orders = getOrders();
  orders.unshift(order);

  saveItems(updatedItems);
  saveOrders(orders);
  saveCart([]);

  return order;
}

function showConfirmation(order) {
  const settings = getSettings();
  const confirmation = document.getElementById("confirmation-content");
  confirmation.innerHTML = `
    <p><strong>הסל שלך נשמר.</strong> הפריטים הבאים שמורים כעת על שמך:</p>
    <ul>
      ${order.itemTitles.map((title) => `<li>${title}</li>`).join("")}
    </ul>
    <p><strong>כתובת איסוף:</strong> ${settings.pickupAddress}</p>
    <p><strong>הוראות:</strong> ${settings.pickupInstructions}</p>
    <p><strong>תשלום:</strong> ${
      order.paymentMethod === "bit"
        ? `יש להעביר ${currency(order.price)} בביט למספר ${settings.sellerPhone} לפני ההגעה.`
        : `יש להעביר ${currency(order.price)} בפייבוקס לפני ההגעה.`
    }</p>
    <p><strong>פרטי קשר שנשמרו:</strong> ${order.buyerName}, ${order.buyerPhone}, ${order.buyerEmail}</p>
  `;
  document.getElementById("confirmation-dialog").showModal();
  syncBodyScrollLock();
}

function initConsentBanner() {
  const banner = document.getElementById("consent-banner");
  if (!banner) {
    return;
  }

  const acceptButton = document.getElementById("accept-consent");
  const rejectButton = document.getElementById("reject-consent");
  const hideBanner = () => {
    banner.hidden = true;
  };

  banner.hidden = Boolean(getConsentChoice());

  acceptButton?.addEventListener("click", (event) => {
    event.preventDefault();
    saveConsentChoice("accepted");
    hideBanner();
  });

  rejectButton?.addEventListener("click", (event) => {
    event.preventDefault();
    saveConsentChoice("rejected");
    hideBanner();
  });
}

function attachEvents() {
  document.getElementById("filter-form").addEventListener("input", renderCatalog);
  document.getElementById("filter-form").addEventListener("reset", () => {
    window.setTimeout(renderCatalog, 0);
  });

  document.getElementById("product-grid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-item-id]");
    if (button) {
      addToCart(button.dataset.itemId);
    }
  });

  document.getElementById("open-basket").addEventListener("click", () => toggleBasket(true));
  document.getElementById("close-basket").addEventListener("click", () => toggleBasket(false));
  document.getElementById("basket-backdrop").addEventListener("click", () => toggleBasket(false));
  document.getElementById("clear-basket").addEventListener("click", clearCart);
  document.getElementById("basket-checkout").addEventListener("click", openCheckout);

  document.getElementById("basket-items").addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-id]");
    if (button) {
      removeFromCart(button.dataset.removeId);
    }
  });

  document.getElementById("checkout-item-card").addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-id]");
    if (button) {
      removeFromCart(button.dataset.removeId);
      closeDialog("checkout-dialog");
      openCheckout();
    }
  });

  document.getElementById("close-dialog").addEventListener("click", () => closeDialog("checkout-dialog"));
  document.getElementById("cancel-checkout").addEventListener("click", () => closeDialog("checkout-dialog"));
  document.getElementById("close-confirmation").addEventListener("click", () => closeDialog("confirmation-dialog"));
  document.getElementById("checkout-dialog").addEventListener("close", syncBodyScrollLock);
  document.getElementById("checkout-dialog").addEventListener("cancel", syncBodyScrollLock);
  document.getElementById("confirmation-dialog").addEventListener("close", syncBodyScrollLock);
  document.getElementById("confirmation-dialog").addEventListener("cancel", syncBodyScrollLock);

  document.getElementById("checkout-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = new FormData(event.currentTarget);

    try {
      const order = confirmOrder(payload);
      closeDialog("checkout-dialog");
      renderCatalog();
      renderBasket();
      toggleBasket(false);
      showConfirmation(order);
    } catch (error) {
      window.alert(error.message);
      renderCatalog();
      renderBasket();
    }
  });
}

async function initStorefront() {
  ensureSeedData();
  await syncItemsFromGoogleSheet();
  const items = getItems();
  renderFilters(items);
  renderCatalog();
  renderBasket();
  attachEvents();
  initConsentBanner();
}

initStorefront();

