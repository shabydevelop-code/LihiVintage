(function () {
  function getSheetConfig() {
    return window.LIHI_SHEET_CONFIG || { csvUrl: "" };
  }

  function hasSource() {
    return Boolean(getSheetConfig().csvUrl);
  }

  function parseCsv(text) {
    const rows = [];
    let current = "";
    let row = [];
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const next = text[index + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === "," && !inQuotes) {
        row.push(current);
        current = "";
        continue;
      }

      if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") {
          index += 1;
        }

        row.push(current);
        if (row.some((cell) => cell.trim() !== "")) {
          rows.push(row);
        }
        row = [];
        current = "";
        continue;
      }

      current += char;
    }

    row.push(current);
    if (row.some((cell) => cell.trim() !== "")) {
      rows.push(row);
    }

    return rows;
  }

  function normalizeHeader(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function toRecord(headers, values) {
    return headers.reduce((record, header, index) => {
      record[header] = (values[index] || "").trim();
      return record;
    }, {});
  }

  function normalizeItem(row, index) {
    const id = row.id || row.item_id || `sheet-item-${index + 1}`;
    const status = (row.status || "available").toLowerCase();
    const quantityValue = Number(row.quantity || 1);

    return {
      id,
      title: row.title || "",
      category: row.category || "",
      era: row.era || row.style_era || "",
      size: row.size || "",
      condition: row.condition || "",
      price: Number(row.price || 0),
      description: row.description || "",
      image: row.image || row.image_url || "",
      status: status === "sold" ? "sold" : "available",
      quantity: Number.isFinite(quantityValue) && quantityValue > 0 ? quantityValue : 1,
    };
  }

  async function loadItems() {
    const { csvUrl } = getSheetConfig();
    if (!csvUrl) {
      return null;
    }

    const response = await fetch(csvUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to load Google Sheet: ${response.status}`);
    }

    const csvText = await response.text();
    const rows = parseCsv(csvText);
    if (!rows.length) {
      return [];
    }

    const headers = rows[0].map(normalizeHeader);
    return rows.slice(1).map((values, index) => normalizeItem(toRecord(headers, values), index));
  }

  window.LihiSheetData = {
    hasSource,
    loadItems,
  };
})();
