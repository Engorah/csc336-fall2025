import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "./apiConfig";
import "./List.css";

const FORMAT_OPTIONS = ["All", "LP", "EP", "Single", "CD", "Cassette", "Digital", "Other"];

export default function List() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("artist"); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [formatFilter, setFormatFilter] = useState("All");
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");

  const [undoItem, setUndoItem] = useState(null);

  const [importMessage, setImportMessage] = useState("");
  const [importError, setImportError] = useState("");

  async function loadItems() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (search.trim() !== "") params.append("search", search.trim());

      const url =
        params.toString() === ""
          ? `${API_BASE_URL}/api/items`
          : `${API_BASE_URL}/api/items?${params.toString()}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Error loading items:", err);
      setError("Failed to load collection. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  function applyFiltersAndSort() {
    let filtered = [...items];

    if (showOnlyFavorites) {
      filtered = filtered.filter((item) => Boolean(item.favorite));
    }

    if (formatFilter !== "All") {
      filtered = filtered.filter(
        (item) => (item.format || "").toLowerCase() === formatFilter.toLowerCase()
      );
    }

    if (minYear !== "") {
      const min = Number(minYear);
      filtered = filtered.filter(
        (item) => item.year == null || item.year >= min
      );
    }

    if (maxYear !== "") {
      const max = Number(maxYear);
      filtered = filtered.filter(
        (item) => item.year == null || item.year <= max
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === "year") {
        return (a.year || 0) - (b.year || 0);
      }
      if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      return (a.artist || "").localeCompare(b.artist || "");
    });

    return filtered;
  }

  const visibleItems = applyFiltersAndSort();

  const totalCount = items.length;
  const favoriteCount = items.filter((i) => i.favorite).length;
  const formatCounts = FORMAT_OPTIONS.reduce((acc, f) => {
    if (f === "All") return acc;
    acc[f] = items.filter(
      (item) => (item.format || "").toLowerCase() === f.toLowerCase()
    ).length;
    return acc;
  }, {});

  const years = items.map((i) => i.year).filter((y) => y != null);
  const minCollectionYear = years.length ? Math.min(...years) : null;
  const maxCollectionYear = years.length ? Math.max(...years) : null;

  async function handleDelete(id) {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (!window.confirm("Delete this record?")) return;

    const toReAdd = {
      artist: item.artist,
      title: item.title,
      year: item.year,
      format: item.format,
      notes: item.notes,
      discogsId: item.discogsId,
      discogsUrl: item.discogsUrl,
      thumb: item.thumb
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/items/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        throw new Error(`Delete failed with status ${res.status}`);
      }
      setItems((prev) => prev.filter((i) => i.id !== id));
      setUndoItem(toReAdd);
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete item.");
    }
  }

  async function handleUndoDelete() {
    if (!undoItem) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(undoItem)
      });
      if (!res.ok) {
        throw new Error(`Undo failed with status ${res.status}`);
      }
      const created = await res.json();
      setItems((prev) => [...prev, created]);
      setUndoItem(null);
    } catch (err) {
      console.error("Error undoing delete:", err);
      alert("Failed to undo delete.");
    }
  }

  async function handleToggleFavorite(item) {
    try {
      const updated = { favorite: !item.favorite };
      const res = await fetch(`${API_BASE_URL}/api/items/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (!res.ok) {
        throw new Error(`Favorite toggle failed with status ${res.status}`);
      }
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, favorite: !i.favorite } : i
        )
      );
    } catch (err) {
      console.error("Error toggling favorite:", err);
      alert("Failed to toggle favorite.");
    }
  }

  async function handleExport() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/items`);
      if (!res.ok) {
        throw new Error(`Export failed with status ${res.status}`);
      }
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "vinyl-collection.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting collection:", err);
      alert("Failed to export collection.");
    }
  }

  function handleImportFileChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    setImportMessage("");
    setImportError("");

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const parsed = JSON.parse(text);

        let records;
        if (Array.isArray(parsed)) {
          records = parsed;
        } else if (Array.isArray(parsed.items)) {
          records = parsed.items;
        } else {
          throw new Error(
            "JSON must be an array of records or an object with an 'items' array."
          );
        }

        if (records.length === 0) {
          setImportError("No records found in the import file.");
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/items/bulk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(records)
        });

        if (!res.ok) {
          throw new Error(`Server responded with status ${res.status}`);
        }

        const data = await res.json();
        setItems((prev) => [...prev, ...(data.items || [])]);
        setImportMessage(`Imported ${data.importedCount} records successfully.`);
      } catch (err) {
        console.error("Import error:", err);
        setImportError("Failed to import collection. Please check the file format.");
      } finally {
        event.target.value = "";
      }
    };

    reader.onerror = () => {
      setImportError("Failed to read the file.");
    };

    reader.readAsText(file);
  }

  return (
    <div className="list-page container">
      <div className="list-layout">
        {/* HEADER + STATS + FILTERS */}
        <section className="card list-header-card">
          <div className="list-header-top">
            <h2 className="list-title">Your collection</h2>
            <div className="list-count">
              Total: {totalCount} &middot; Favorites: {favoriteCount}
              {minCollectionYear && maxCollectionYear && (
                <> &middot; Year range: {minCollectionYear} – {maxCollectionYear}</>
              )}
            </div>
          </div>

          <p className="list-stats-extra">
            By format:&nbsp;
            {Object.entries(formatCounts)
              .map(([fmt, count]) => `${fmt}: ${count}`)
              .join("  |  ")}
          </p>

          {/* Toolbar */}
          <div className="list-toolbar">
            <div className="list-toolbar-row">
              {/* Search */}
              <div className="list-search">
                <span className="list-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search artist, title, or notes…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button type="button" className="list-secondary-button" onClick={loadItems}>
                Search / Refresh
              </button>
            </div>

            <div className="list-toolbar-row">
              {/* Sort */}
              <div className="list-select">
                <label>
                  Sort by:&nbsp;
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="artist">Artist</option>
                    <option value="title">Title</option>
                    <option value="year">Year</option>
                  </select>
                </label>
              </div>

              {/* Format & year filters */}
              <div className="list-select">
                <label>
                  Format:&nbsp;
                  <select
                    value={formatFilter}
                    onChange={(e) => setFormatFilter(e.target.value)}
                  >
                    {FORMAT_OPTIONS.map((fmt) => (
                      <option key={fmt} value={fmt}>
                        {fmt}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="list-select">
                <label>
                  Min year:&nbsp;
                  <input
                    type="number"
                    value={minYear}
                    onChange={(e) => setMinYear(e.target.value)}
                    style={{ width: "5rem" }}
                  />
                </label>
              </div>

              <div className="list-select">
                <label>
                  Max year:&nbsp;
                  <input
                    type="number"
                    value={maxYear}
                    onChange={(e) => setMaxYear(e.target.value)}
                    style={{ width: "5rem" }}
                  />
                </label>
              </div>

              {/* Favorites only */}
              <label className="list-fav-toggle">
                <input
                  type="checkbox"
                  checked={showOnlyFavorites}
                  onChange={(e) => setShowOnlyFavorites(e.target.checked)}
                />
                <span>Only favorites</span>
              </label>
            </div>

            <div className="list-toolbar-row">
              {/* Export */}
              <button type="button" className="list-secondary-button" onClick={handleExport}>
                Export JSON
              </button>

              {/* Import */}
              <label className="list-secondary-button" style={{ cursor: "pointer" }}>
                Import JSON
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleImportFileChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>

          {/* Undo + messages */}
          {undoItem && (
            <div className="list-undo-banner">
              <span>
                Record deleted.
              </span>
              <button type="button" className="list-row-button" onClick={handleUndoDelete}>
                Undo
              </button>
            </div>
          )}

          {importMessage && <p className="list-status">{importMessage}</p>}
          {importError && (
            <p className="list-status" style={{ color: "#dc2626" }}>
              {importError}
            </p>
          )}
          {error && (
            <p className="list-status" style={{ color: "#dc2626" }}>
              {error}
            </p>
          )}
          {loading && <p className="list-status">Loading…</p>}
        </section>

        {/* MAIN TABLE WITH ALBUM ART */}
        <section className="card list-table-card">
          {!loading && !error && visibleItems.length === 0 && (
            <p className="list-empty">No records found.</p>
          )}

          {visibleItems.length > 0 && (
            <>
              <div className="list-table-header">
                <div>Art</div>
                <div>Record</div>
                <div>Fav</div>
                <div>Format</div>
                <div>Year</div>
                <div>Actions</div>
              </div>

              {visibleItems.map((item) => (
                <div key={item.id} className="list-row">
                  {/* Album art */}
                  <div className="list-cell-art">
                    {item.thumb ? (
                      <img
                        src={item.thumb}
                        alt={item.title}
                        className="list-thumb"
                      />
                    ) : (
                      <div className="list-thumb list-thumb-placeholder">
                        ♫
                      </div>
                    )}
                  </div>

                  {/* Main text */}
                  <div className="list-cell-main">
                    <span className="list-cell-primary">
                      <Link to={`/record/${item.id}`}>
                        {item.artist} — {item.title}
                      </Link>
                    </span>
                    <span className="list-cell-secondary">
                      ID: {item.id}
                      {item.discogsUrl && (
                        <>
                          {" "}
                          ·{" "}
                          <a
                            href={item.discogsUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Discogs
                          </a>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Favorite star */}
                  <div className="list-cell-favorite">
                    <button
                      type="button"
                      className={
                        "list-fav-button " +
                        (item.favorite ? "list-fav-button-on" : "list-fav-button-off")
                      }
                      onClick={() => handleToggleFavorite(item)}
                    >
                      ★
                    </button>
                  </div>

                  {/* Format */}
                  <div className="list-cell-format">
                    {item.format || "—"}
                  </div>

                  {/* Year */}
                  <div className="list-cell-year">
                    {item.year != null ? item.year : "—"}
                  </div>

                  {/* Actions */}
                  <div className="list-cell-actions">
                    <Link
                      to={`/record/${item.id}`}
                      className="list-row-button"
                    >
                      Details
                    </Link>
                    <button
                      type="button"
                      className="list-row-button list-row-button-danger"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
