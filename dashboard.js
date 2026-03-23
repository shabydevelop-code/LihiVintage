const DASHBOARD_STORAGE_KEYS = {
  items: "lihi-market-items",
  orders: "lihi-market-orders",
  settings: "lihi-market-settings",
  consent: "lihi-market-cookie-consent",
};

function dashboardRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function dashboardWrite(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureDashboardSeedData() {
  if (!dashboardRead(DASHBOARD_STORAGE_KEYS.items)) {
    dashboardWrite(DASHBOARD_STORAGE_KEYS.items, []);
  }

  if (!dashboardRead(DASHBOARD_STORAGE_KEYS.orders)) {
    dashboardWrite(DASHBOARD_STORAGE_KEYS.orders, []);
  }
}

function hasDashboardGoogleSheetSource() {
  return Boolean(window.LihiSheetData?.hasSource?.());
}

function mergeDashboardSheetItemsWithLocalState(sheetItems) {
  const existingItems = dashboardRead(DASHBOARD_STORAGE_KEYS.items, []);
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

async function syncDashboardItemsFromGoogleSheet() {
  if (!hasDashboardGoogleSheetSource()) {
    saveInventory([]);
    return false;
  }

  try {
    const sheetItems = await window.LihiSheetData.loadItems();
    if (!Array.isArray(sheetItems)) {
      return false;
    }

    saveInventory(mergeDashboardSheetItemsWithLocalState(sheetItems));
    return true;
  } catch (error) {
    console.error(error);
    saveInventory([]);
    return false;
  }
}

function getInventory() {
  return dashboardRead(DASHBOARD_STORAGE_KEYS.items, []);
}

function getOrderQueue() {
  return dashboardRead(DASHBOARD_STORAGE_KEYS.orders, []);
}

function saveInventory(items) {
  dashboardWrite(DASHBOARD_STORAGE_KEYS.items, items);
}

function saveOrderQueue(orders) {
  dashboardWrite(DASHBOARD_STORAGE_KEYS.orders, orders);
}

function getDashboardConsentChoice() {
  return dashboardRead(DASHBOARD_STORAGE_KEYS.consent, null);
}

function saveDashboardConsentChoice(choice) {
  try {
    dashboardWrite(DASHBOARD_STORAGE_KEYS.consent, {
      choice,
      updatedAt: new Date().toISOString(),
    });
  } catch {}
}

function dashboardCurrency(value) {
  const amount = new Intl.NumberFormat("he-IL", {
    maximumFractionDigits: 0,
  }).format(value);
  return `₪ ${amount}`;
}

function translateConditionLabel(value) {
  const map = {
    Excellent: "מצוין",
    "Very Good": "טוב מאוד",
    Good: "טוב",
    "Worn In": "משומש היטב",
  };

  return map[value] || value;
}

function statusPill(status) {
  const map = {
    available: "זמין",
    sold: "נמכר",
    awaiting_pickup: "ממתין לאיסוף",
    awaiting_payment: "ממתין לתשלום",
    picked_up: "נאסף",
  };

  return `<span class="status-pill status-${status}">${map[status] || status.replace("_", " ")}</span>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return map[char];
  });
}

function renderInventory() {
  const items = getInventory();
  const wrapper = document.getElementById("inventory-table-wrapper");
  const sheetMode = hasDashboardGoogleSheetSource();

  wrapper.innerHTML = `
    <div class="table-card">
      ${sheetMode ? `<p class="dashboard-note">הנתונים נטענים מ־Google Sheets. כדי לערוך פריטים יש לעדכן את הגיליון עצמו.</p>` : ""}
      <p class="dashboard-note">${items.length} פריטים בסך הכל</p>
      ${
        items.length
          ? `
            <div class="inventory-grid">
              ${items
                .map(
                  (item) => `
                    <article class="inventory-card">
                      <div class="inventory-card-top">
                        <img class="inventory-card-image" src="${item.image}" alt="${item.title}">
                        <div class="inventory-card-header">
                          <p class="section-kicker">${item.category} / ${item.era}</p>
                          <h3>${item.title}</h3>
                          <div class="inventory-status">
                            ${statusPill(item.status)}
                          </div>
                        </div>
                      </div>
                      <dl class="inventory-meta">
                        <div>
                          <dt>מידה</dt>
                          <dd>${item.size}</dd>
                        </div>
                        <div>
                          <dt>מצב</dt>
                          <dd>${translateConditionLabel(item.condition)}</dd>
                        </div>
                        <div>
                          <dt>מחיר</dt>
                          <dd>${dashboardCurrency(item.price)}</dd>
                        </div>
                      </dl>
                      <p class="dashboard-note inventory-description">${item.description}</p>
                      <div class="table-actions inventory-actions">
                          <button class="button button-secondary" type="button" data-action="edit" data-item-id="${item.id}" ${sheetMode ? "disabled" : ""}>
                            עריכה
                          </button>
                          <button class="button button-secondary" type="button" data-action="toggle" data-item-id="${item.id}" ${sheetMode ? "disabled" : ""}>
                            ${item.status === "available" ? "סימון כנמכר" : "החזרה למלאי"}
                          </button>
                          <button class="button button-secondary" type="button" data-action="delete" data-item-id="${item.id}" ${sheetMode ? "disabled" : ""}>
                            מחיקה
                          </button>
                      </div>
                    </article>
                  `,
                )
                .join("")}
            </div>
          `
          : `<p>עדיין אין פריטים. אפשר להוסיף את הפריט הראשון למעלה.</p>`
      }
    </div>
  `;
}

function renderOrders() {
  const orders = getOrderQueue().filter(
    (order) => order.status === "awaiting_pickup" || order.status === "awaiting_payment",
  );
  const wrapper = document.getElementById("orders-table-wrapper");

  wrapper.innerHTML = `
    <div class="table-card">
      <table>
        <caption>${orders.length} הזמנות ממתינות לטיפול</caption>
        <thead>
          <tr>
            <th scope="col">פריט</th>
            <th scope="col">רוכשת</th>
            <th scope="col">תשלום</th>
            <th scope="col">נוצר</th>
            <th scope="col">הערות</th>
            <th scope="col">פעולה</th>
          </tr>
        </thead>
        <tbody>
          ${
            orders.length
              ? orders
                  .map(
                    (order) => {
                      const titles = Array.isArray(order.itemTitles)
                        ? order.itemTitles.join("<br>")
                        : order.itemTitle;

                      return `
                      <tr>
                        <td data-label="פריט">${titles}<br><span class="dashboard-note">${dashboardCurrency(order.price)}</span></td>
                        <td data-label="רוכשת">${order.buyerName}<br><span class="dashboard-note">${order.buyerPhone}<br>${order.buyerEmail}</span></td>
                        <td data-label="תשלום">${statusPill(order.status)}<br><span class="dashboard-note">${order.paymentMethod === "bit" ? "ביט" : "פייבוקס"}</span></td>
                        <td data-label="נוצר">${new Date(order.createdAt).toLocaleString("he-IL")}</td>
                        <td data-label="הערות">${order.pickupNotes || "ללא"}</td>
                        <td data-label="פעולה" class="table-actions">
                          ${
                            order.status === "awaiting_payment"
                              ? `
                                <button class="button button-secondary" type="button" data-action="mark-paid" data-order-id="${order.id}">
                                  סומן כשולם
                                </button>
                              `
                              : ""
                          }
                          <button class="button button-primary" type="button" data-action="picked-up" data-order-id="${order.id}">
                            סומן כנאסף
                          </button>
                        </td>
                      </tr>
                    `;
                    },
                  )
                  .join("")
              : `
                <tr>
                  <td colspan="6">כרגע אין הזמנות שממתינות לטיפול.</td>
                </tr>
              `
          }
        </tbody>
      </table>
    </div>
  `;
}

function addListing(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const items = getInventory();

  const listing = {
    id: `itm-${Date.now()}`,
    title: data.get("title").trim(),
    category: data.get("category").trim(),
    era: data.get("era").trim(),
    size: data.get("size").trim(),
    condition: data.get("condition"),
    price: Number(data.get("price")),
    image: data.get("image").trim(),
    description: data.get("description").trim(),
    status: "available",
    quantity: 1,
  };

  items.unshift(listing);
  saveInventory(items);
  form.reset();
  renderInventory();
}

function renderEditor(itemId) {
  const editor = document.getElementById("inventory-editor");
  const item = getInventory().find((entry) => entry.id === itemId);

  if (!item) {
    editor.hidden = true;
    editor.innerHTML = "";
    return;
  }

  editor.hidden = false;
  editor.innerHTML = `
    <div class="table-card editor-card">
      <div class="section-heading">
        <p class="section-kicker">עריכת פריט</p>
        <h3>${escapeHtml(item.title)}</h3>
      </div>
      <form id="edit-listing-form" class="dashboard-form" data-item-id="${item.id}">
        <label>
          <span>כותרת</span>
          <input name="title" type="text" value="${escapeHtml(item.title)}" required>
        </label>

        <label>
          <span>קטגוריה</span>
          <input name="category" type="text" value="${escapeHtml(item.category)}" required>
        </label>

        <label>
          <span>סגנון / תקופה</span>
          <input name="era" type="text" value="${escapeHtml(item.era)}" required>
        </label>

        <label>
          <span>מידה</span>
          <input name="size" type="text" value="${escapeHtml(item.size)}" required>
        </label>

        <label>
          <span>מצב</span>
          <select name="condition" required>
            <option value="Excellent" ${item.condition === "Excellent" ? "selected" : ""}>מצוין</option>
            <option value="Very Good" ${item.condition === "Very Good" ? "selected" : ""}>טוב מאוד</option>
            <option value="Good" ${item.condition === "Good" ? "selected" : ""}>טוב</option>
            <option value="Worn In" ${item.condition === "Worn In" ? "selected" : ""}>משומש היטב</option>
          </select>
        </label>

        <label>
          <span>מחיר</span>
          <input name="price" type="number" min="0" step="1" value="${item.price}" required>
        </label>

        <label>
          <span>קישור לתמונה</span>
          <input name="image" type="url" value="${escapeHtml(item.image)}" required>
        </label>

        <div class="editor-preview" aria-live="polite">
          <span>תצוגה מקדימה של התמונה</span>
          <img id="edit-image-preview" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)} preview">
        </div>

        <label class="dashboard-full-width">
          <span>תיאור</span>
          <textarea name="description" rows="4" required>${escapeHtml(item.description)}</textarea>
        </label>

        <div class="dashboard-full-width dialog-actions">
          <button class="button button-primary" type="submit">שמירת שינויים</button>
          <button class="button button-secondary" type="button" data-action="cancel-edit">ביטול</button>
        </div>
      </form>
    </div>
  `;

  editor.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => {
    const firstField = document.querySelector("#edit-listing-form input[name='title']");
    firstField?.focus();
  }, 150);
}

function clearEditor() {
  const editor = document.getElementById("inventory-editor");
  editor.hidden = true;
  editor.innerHTML = "";
}

function updateEditorPreview(url, title) {
  const preview = document.getElementById("edit-image-preview");
  if (!preview) {
    return;
  }

  preview.src = url;
  preview.alt = `${title || "פריט"} תצוגה מקדימה`;
}

function updateListing(event) {
  event.preventDefault();
  const form = event.target;
  const itemId = form.dataset.itemId;
  const data = new FormData(form);

  const items = getInventory().map((item) => {
    if (item.id !== itemId) {
      return item;
    }

    return {
      ...item,
      title: data.get("title").trim(),
      category: data.get("category").trim(),
      era: data.get("era").trim(),
      size: data.get("size").trim(),
      condition: data.get("condition"),
      price: Number(data.get("price")),
      image: data.get("image").trim(),
      description: data.get("description").trim(),
    };
  });

  saveInventory(items);
  clearEditor();
  renderInventory();
}

function toggleInventoryStatus(itemId) {
  const items = getInventory().map((item) => {
    if (item.id !== itemId) {
      return item;
    }

    return {
      ...item,
      status: item.status === "available" ? "sold" : "available",
    };
  });

  saveInventory(items);
  renderInventory();
}

function deleteListing(itemId) {
  const items = getInventory().filter((item) => item.id !== itemId);
  saveInventory(items);
  renderInventory();
}

function markPickedUp(orderId) {
  const orders = getOrderQueue().map((order) => {
    if (order.id !== orderId) {
      return order;
    }

    return {
      ...order,
      status: "picked_up",
      pickedUpAt: new Date().toISOString(),
    };
  });

  saveOrderQueue(orders);
  renderOrders();
}

function markPaid(orderId) {
  const orders = getOrderQueue().map((order) => {
    if (order.id !== orderId) {
      return order;
    }

    return {
      ...order,
      status: "awaiting_pickup",
    };
  });

  saveOrderQueue(orders);
  renderOrders();
}

function attachDashboardEvents() {
  document.getElementById("listing-form").addEventListener("submit", addListing);

  document.getElementById("inventory-table-wrapper").addEventListener("click", (event) => {
    const button = event.target.closest("[data-item-id]");
    if (!button) {
      return;
    }

    const { action, itemId } = button.dataset;
    if (action === "edit") {
      renderEditor(itemId);
    }

    if (action === "toggle") {
      toggleInventoryStatus(itemId);
    }

    if (action === "delete") {
      deleteListing(itemId);
    }
  });

  document.getElementById("orders-table-wrapper").addEventListener("click", (event) => {
    const button = event.target.closest("[data-order-id]");
    if (!button) {
      return;
    }

    if (button.dataset.action === "picked-up") {
      markPickedUp(button.dataset.orderId);
    }

    if (button.dataset.action === "mark-paid") {
      markPaid(button.dataset.orderId);
    }
  });

  document.getElementById("inventory-editor").addEventListener("submit", (event) => {
    if (event.target.id === "edit-listing-form") {
      updateListing(event);
    }
  });

  document.getElementById("inventory-editor").addEventListener("click", (event) => {
    const button = event.target.closest("[data-action='cancel-edit']");
    if (button) {
      clearEditor();
    }
  });

  document.getElementById("inventory-editor").addEventListener("input", (event) => {
    if (event.target.name === "image") {
      const form = event.target.closest("form");
      const title = form?.elements?.title?.value?.trim() || "פריט";
      updateEditorPreview(event.target.value.trim(), title);
    }

    if (event.target.name === "title") {
      const form = event.target.closest("form");
      const imageUrl = form?.elements?.image?.value?.trim() || "";
      updateEditorPreview(imageUrl, event.target.value.trim());
    }
  });
}

function applyDashboardSheetMode() {
  if (!hasDashboardGoogleSheetSource()) {
    return;
  }

  const form = document.getElementById("listing-form");
  form.querySelectorAll("input, select, textarea, button").forEach((element) => {
    element.disabled = true;
  });
}

function initDashboardConsentBanner() {
  const banner = document.getElementById("consent-banner");
  if (!banner) {
    return;
  }

  const acceptButton = document.getElementById("accept-consent");
  const rejectButton = document.getElementById("reject-consent");
  const hideBanner = () => {
    banner.hidden = true;
  };

  banner.hidden = Boolean(getDashboardConsentChoice());

  acceptButton?.addEventListener("click", (event) => {
    event.preventDefault();
    saveDashboardConsentChoice("accepted");
    hideBanner();
  });

  rejectButton?.addEventListener("click", (event) => {
    event.preventDefault();
    saveDashboardConsentChoice("rejected");
    hideBanner();
  });
}

async function initDashboard() {
  ensureDashboardSeedData();
  await syncDashboardItemsFromGoogleSheet();
  renderInventory();
  renderOrders();
  applyDashboardSheetMode();
  attachDashboardEvents();
  initDashboardConsentBanner();
}

initDashboard();

