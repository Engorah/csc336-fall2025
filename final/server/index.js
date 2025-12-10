require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

const DATA_FILE = path.join(__dirname, "data.json");

// Middleware
app.use(cors());
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Helper to read items
async function readItems() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      // If file doesn't exist yet, start with empty array
      return [];
    } else {
      throw err;
    }
  }
}

// Helper to write items
async function writeItems(items) {
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
}

// Return all items
app.get("/api/items", async (req, res) => {
  const { search } = req.query;

  try {
    let items = await readItems();

    if (search) {
      const s = search.toLowerCase();
      items = items.filter((item) => {
        return (
          (item.artist && item.artist.toLowerCase().includes(s)) ||
          (item.title && item.title.toLowerCase().includes(s)) ||
          (item.notes && item.notes.toLowerCase().includes(s))
        );
      });
    }

    res.json(items);
  } catch (err) {
    console.error("Error reading items:", err);
    res.status(500).json({ error: "Failed to read items" });
  }
});


// Get single item by ID
app.get("/api/items/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const items = await readItems();
    const item = items.find((it) => it.id === id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
  } catch (err) {
    console.error("Error reading single item:", err);
    res.status(500).json({ error: "Failed to read item" });
  }
});

// Add a new item
app.post("/api/items", async (req, res) => {
  const {
    artist,
    title,
    year,
    format,
    notes,
    discogsId,
    discogsUrl,
    thumb,
    catalogNumber,
    matrixInfo,
    condition
  } = req.body;

  const errors = {};

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const items = await readItems();
    const maxID = items.length > 0 ? Math.max(...items.map((i) => i.id)) : 0;

    const newItem = {
      id: maxID + 1,
      artist: artist.trim(),
      title: title.trim(),
      year: year ? Number(year) : null,
      format: format || "LP",
      notes: notes || "",
      discogsId: discogsId || null,
      discogsUrl: discogsUrl || null,
      thumb: thumb || null,
      catalogNumber: catalogNumber || "",
      matrixInfo: matrixInfo || "",
      condition: condition || "",
      favorite: false
    };

    items.push(newItem);
    await writeItems(items);

    res.status(201).json(newItem);
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).json({ error: "Failed to add item" });
  }
});

// Bulk import items from JSON array
app.post("/api/items/bulk", async (req, res) => {
  const incoming = req.body;

  if (!Array.isArray(incoming)) {
    return res.status(400).json({
      error: "Bulk import expects an array of items in the request body."
    });
  }

  try {
    const items = await readItems();
    let maxID = items.length > 0 ? Math.max(...items.map((i) => i.id)) : 0;

    const added = [];

    for (const raw of incoming) {
      // Minimal validation: require artist + title
      if (!raw.artist || !raw.title) {
        continue; // skip invalid entries instead of failing whole import
      }

      const newItem = {
        id: ++maxID,
        artist: String(raw.artist).trim(),
        title: String(raw.title).trim(),
        year:
          raw.year === null || raw.year === undefined || raw.year === ""
            ? null
            : Number(raw.year),
        format: raw.format || "LP",
        notes: raw.notes || "",
        discogsId: raw.discogsId || null,
        discogsUrl: raw.discogsUrl || null,
        thumb: raw.thumb || null,
        catalogNumber: raw.catalogNumber || "",
        matrixInfo: raw.matrixInfo || "",
        condition: raw.condition || "",
        favorite: Boolean(raw.favorite)
      };

      items.push(newItem);
      added.push(newItem);
    }

    await writeItems(items);

    res.status(201).json({
      importedCount: added.length,
      items: added
    });
  } catch (err) {
    console.error("Bulk import error:", err);
    res.status(500).json({ error: "Failed to import items" });
  }
});

// Discogs search proxy
app.get("/api/discogs/search", async (req, res) => {
  const { artist, title } = req.query;

  if (!artist && !title) {
    return res.status(400).json({
      error: "At least one of 'artist' or 'title' query parameters is required."
    });
  }

  const token = process.env.DISCOGS_TOKEN;
  if (!token) {
    return res.status(500).json({
      error: "Discogs token not configured on server."
    });
  }

  const params = new URLSearchParams();
  if (artist) params.append("artist", artist);
  if (title) params.append("release_title", title);
  params.append("type", "release");
  params.append("per_page", "5");
  params.append("page", "1");
  params.append("token", token);

  const url = `https://api.discogs.com/database/search?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "VinylCollectionApp/1.0 +https://example.com"
      }
    });

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: `Discogs API error: ${response.status}` });
    }

    const data = await response.json();

    // Normalize to a simpler shape for the frontend
    const results = (data.results || []).map((item) => ({
      id: item.id,
      title: item.title,
      year: item.year || null,
      country: item.country || null,
      label: item.label ? item.label.join(", ") : null,
      format: item.format ? item.format.join(", ") : null,
      thumb: item.thumb || null,
      discogsUrl: item.uri ? `https://www.discogs.com${item.uri}` : null
    }));

    res.json({ results });
  } catch (err) {
    console.error("Discogs fetch error:", err);
    res.status(500).json({ error: "Failed to contact Discogs API." });
  }
});

// Update an item
app.put("/api/items/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const items = await readItems();
    const index = items.findIndex((it) => it.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Item not found" });
    }

    const existing = items[index];

    // Merge existing with whatever comes in req.body.
    const updated = {
      ...existing,
      ...req.body,
      id: existing.id // never change id
    };

    items[index] = updated;
    await writeItems(items);

    res.json(updated);
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ error: "Failed to update item" });
  }
});


// Delete an item
app.delete("/api/items/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const items = await readItems();
    const index = items.findIndex((it) => it.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Item not found" });
    }

    const [removed] = items.splice(index, 1);
    await writeItems(items);

    res.json({ success: true, removed });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});


// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});