import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "./apiConfig";
import "./Home.css";

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE_URL}/api/items`);
        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Error loading collection on Home:", err);
        setError("Could not load collection summary.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalCount = items.length;
  const favoriteCount = items.filter((i) => i.favorite).length;

  const years = items.map((i) => i.year).filter((y) => y != null);
  const minYear = years.length ? Math.min(...years) : null;
  const maxYear = years.length ? Math.max(...years) : null;

  // Use ID as a cheap "recent" indicator
  const recentItems = [...items]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 3);

  return (
    <div className="home-page container">
      {/* Hero / intro */}
      <section className="card-strong home-hero">
        <div className="home-hero-text">
          <h2 className="home-hero-title">Vinyl Collection Manager</h2>
          <p className="home-hero-subtitle">
            Track your records, pull in data from Discogs, and keep your
            collection organized like a pro. Favorites, filters, and rich
            metadata included.
          </p>

          <div className="home-hero-actions">
            <Link to="/add" className="home-hero-primary">
              Add a new record
            </Link>
            <Link to="/collection" className="home-hero-secondary">
              View your collection
            </Link>
          </div>
        </div>

        <div className="home-hero-highlight">
          <p className="home-highlight-label">At a glance</p>
          {loading && <p className="home-highlight-value">Loading…</p>}
          {error && <p className="home-highlight-value">{error}</p>}
          {!loading && !error && (
            <>
              <p className="home-highlight-value">
                {totalCount} record{totalCount === 1 ? "" : "s"}
              </p>
              <p className="home-highlight-sub">
                {favoriteCount} favorite
                {favoriteCount === 1 ? "" : "s"} saved
              </p>
              {minYear && maxYear && (
                <p className="home-highlight-sub">
                  Years: {minYear} – {maxYear}
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {/* Stats + Recent */}
      <section className="home-main-grid">
        <div className="card home-stats-card">
          <h3>Collection stats</h3>
          {loading && <p>Loading collection summary…</p>}
          {error && <p>{error}</p>}

          {!loading && !error && totalCount === 0 && (
            <p>
              You don&apos;t have any records saved yet.{" "}
              <Link to="/add">Start by adding your first record.</Link>
            </p>
          )}

          {!loading && !error && totalCount > 0 && (
            <ul className="home-stats-list">
              <li>
                <span>Total records</span>
                <span>{totalCount}</span>
              </li>
              <li>
                <span>Favorites</span>
                <span>{favoriteCount}</span>
              </li>
              {minYear && maxYear && (
                <li>
                  <span>Year range</span>
                  <span>
                    {minYear} – {maxYear}
                  </span>
                </li>
              )}
            </ul>
          )}
        </div>

        <div className="card home-recent-card">
          <h3>Recently added</h3>
          {loading && <p>Loading recent records…</p>}
          {error && <p>{error}</p>}

          {!loading && !error && recentItems.length === 0 && (
            <p>No recent records to show yet.</p>
          )}

          {!loading && !error && recentItems.length > 0 && (
            <ul className="home-recent-list">
              {recentItems.map((item) => (
                <li key={item.id} className="home-recent-item">
                  <div className="home-recent-main">
                    <Link to={`/record/${item.id}`}>
                      {item.artist} — {item.title}
                    </Link>
                    {item.year && <span className="home-recent-year">({item.year})</span>}
                  </div>
                  {item.favorite && <span className="home-recent-star">★</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="card home-features-card">
        <h3>What you can do</h3>
        <ul className="home-features-list">
          <li>Add records with artist, title, year, format, and notes.</li>
          <li>
            Use Discogs search to autofill release information and save metadata
            like thumbnails and URLs.
          </li>
          <li>Mark records as favorites and filter by favorites.</li>
          <li>Filter and sort by format, year, and text search.</li>
          <li>Edit or delete records, with an undo option on deletions.</li>
          <li>Export your collection as JSON or bulk import from a JSON file.</li>
        </ul>
      </section>
    </div>
  );
}