import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "./apiConfig";
import "./AddToList.css";

const ALLOWED_FORMATS = ["LP", "EP", "Single", "CD", "Cassette", "Digital", "Other"];

function validate({ artist, title, year, format }) {
  const newErrors = {};

  if (!artist || artist.trim() === "") {
    newErrors.artist = "Artist is required.";
  }

  if (!title || title.trim() === "") {
    newErrors.title = "Title is required. Please enter the name of the album or record.";
  }

  if (year !== "") {
    const parsedYear = Number(year);
    const currentYear = new Date().getFullYear();

    if (!Number.isInteger(parsedYear)) {
      newErrors.year = "Year must be a whole number (e.g. 1984).";
    } else if (parsedYear < 1880 || parsedYear > currentYear + 1) {
      newErrors.year = `Year must be between 1880 and ${currentYear + 1}.`;
    }
  }

  if (format && !ALLOWED_FORMATS.includes(format)) {
    newErrors.format = `Format must be one of: ${ALLOWED_FORMATS.join(", ")}`;
  }

  return newErrors;
}

export default function AddToList() {
  const navigate = useNavigate();

  // Core fields
  const [artist, setArtist] = useState("");
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [format, setFormat] = useState("LP");
  const [notes, setNotes] = useState("");
  const [favorite, setFavorite] = useState(false);

  // Extra metadata
  const [catalogNumber, setCatalogNumber] = useState("");
  const [matrixInfo, setMatrixInfo] = useState("");
  const [condition, setCondition] = useState("");

  // Discogs-related
  const [discogsArtist, setDiscogsArtist] = useState("");
  const [discogsTitle, setDiscogsTitle] = useState("");
  const [discogsResults, setDiscogsResults] = useState([]);
  const [discogsLoading, setDiscogsLoading] = useState(false);
  const [discogsError, setDiscogsError] = useState("");
  const [discogsId, setDiscogsId] = useState(null);
  const [discogsUrl, setDiscogsUrl] = useState("");
  const [thumb, setThumb] = useState("");

  // UI state
  const [errors, setErrors] = useState({});
  const [formMessage, setFormMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormMessage("");
    setErrors({});

    const validationErrors = validate({ artist, title, year, format });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setFormMessage("Please fix the errors below before submitting.");
      return;
    }

    const payload = {
      artist: artist.trim(),
      title: title.trim(),
      year: year === "" ? null : Number(year),
      format,
      notes,
      favorite,
      catalogNumber,
      matrixInfo,
      condition,
      discogsId,
      discogsUrl,
      thumb
    };

    try {
      setSubmitting(true);
      await axios.post(`${API_BASE_URL}/api/items`, payload);
      setFormMessage("Record added to your collection.");

      // clear form (but leave Discogs search intact)
      setArtist("");
      setTitle("");
      setYear("");
      setFormat("LP");
      setNotes("");
      setFavorite(false);
      setCatalogNumber("");
      setMatrixInfo("");
      setCondition("");
      setDiscogsId(null);
      setDiscogsUrl("");
      setThumb("");

    } catch (err) {
      console.error("Error adding record:", err);
      setFormMessage("Failed to add record. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDiscogsSearch(e) {
    e.preventDefault();
    setDiscogsError("");
    setDiscogsResults([]);

    const queryArtist = discogsArtist.trim();
    const queryTitle = discogsTitle.trim() || title.trim();

    if (!queryArtist && !queryTitle) {
      setDiscogsError("Enter a title and/or artist to search Discogs.");
      return;
    }

    try {
      setDiscogsLoading(true);
      const params = new URLSearchParams();
      if (queryArtist) params.append("artist", queryArtist);
      if (queryTitle) params.append("title", queryTitle);

      const res = await fetch(`${API_BASE_URL}/api/discogs/search?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }
      const data = await res.json();

      const results = Array.isArray(data) ? data : data.results || [];
      setDiscogsResults(results);
      if (results.length === 0) {
        setDiscogsError("No results found. Try adjusting your search.");
      }
    } catch (err) {
      console.error("Discogs search error:", err);
      setDiscogsError("There was a problem searching Discogs.");
    } finally {
      setDiscogsLoading(false);
    }
  }

  function applyDiscogsResult(result) {
    // Preserve any fields the user has already typed
    if (result.artist && !artist) setArtist(result.artist);
    if (result.title && !title) setTitle(result.title);
    if (result.year && !year) setYear(String(result.year));

    if (result.catalogNumber && !catalogNumber) {
      setCatalogNumber(result.catalogNumber);
    }
    if (result.matrixInfo && !matrixInfo) {
      setMatrixInfo(result.matrixInfo);
    }

    if (result.url) setDiscogsUrl(result.url);
    if (result.discogsUrl) setDiscogsUrl(result.discogsUrl);
    if (result.thumb) setThumb(result.thumb);

    if (result.id) setDiscogsId(result.id);

    setFormMessage("Discogs data applied. You can review and adjust before saving.");
  }

  return (
    <div className="add-page container">
      <div className="add-layout">
        {/* MAIN FORM */}
        <section className="card add-form-card">
          <div className="add-form-header">
            <h2 className="add-form-title">Add a new record</h2>
            <p className="add-form-subtitle">
              Fill in as much as you know. You can also use Discogs search to
              help populate the details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="add-form-body" noValidate>
            {/* Artist */}
            <div className="add-field">
              <div className="add-field-header">
                <label htmlFor="artist" className="add-field-label">
                  Artist <span style={{ color: "#dc2626" }}>*</span>
                </label>
                {errors.artist && (
                  <span className="add-error">{errors.artist}</span>
                )}
              </div>
              <input
                id="artist"
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
              />
            </div>

            {/* Title */}
            <div className="add-field">
              <div className="add-field-header">
                <label htmlFor="title" className="add-field-label">
                  Title <span style={{ color: "#dc2626" }}>*</span>
                </label>
                {errors.title && (
                  <span className="add-error">{errors.title}</span>
                )}
              </div>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Year + Format */}
            <div className="add-field-row">
              <div className="add-field">
                <div className="add-field-header">
                  <label htmlFor="year" className="add-field-label">
                    Year
                  </label>
                  {errors.year && (
                    <span className="add-error">{errors.year}</span>
                  )}
                </div>
                <input
                  id="year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g. 1979"
                />
              </div>

              <div className="add-field">
                <div className="add-field-header">
                  <label htmlFor="format" className="add-field-label">
                    Format
                  </label>
                  {errors.format && (
                    <span className="add-error">{errors.format}</span>
                  )}
                </div>
                <select
                  id="format"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  {ALLOWED_FORMATS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Catalog / Matrix */}
            <div className="add-field-row">
              <div className="add-field">
                <div className="add-field-header">
                  <label htmlFor="catalogNumber" className="add-field-label">
                    Catalog number
                  </label>
                  <span className="add-field-hint">Optional</span>
                </div>
                <input
                  id="catalogNumber"
                  type="text"
                  value={catalogNumber}
                  onChange={(e) => setCatalogNumber(e.target.value)}
                />
              </div>

              <div className="add-field">
                <div className="add-field-header">
                  <label htmlFor="condition" className="add-field-label">
                    Condition
                  </label>
                  <span className="add-field-hint">e.g. VG+, NM</span>
                </div>
                <input
                  id="condition"
                  type="text"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                />
              </div>
            </div>

            {/* Matrix / runout */}
            <div className="add-field add-notes">
              <div className="add-field-header">
                <label htmlFor="matrixInfo" className="add-field-label">
                  Matrix / runout
                </label>
                <span className="add-field-hint">Optional</span>
              </div>
              <textarea
                id="matrixInfo"
                value={matrixInfo}
                onChange={(e) => setMatrixInfo(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="add-field add-notes">
              <div className="add-field-header">
                <label htmlFor="notes" className="add-field-label">
                  Notes
                </label>
                <span className="add-field-hint">
                  Pressing info, condition notes, where you bought it, etc.
                </span>
              </div>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Favorite */}
            <div className="add-checkbox-row">
              <input
                id="favorite"
                type="checkbox"
                checked={favorite}
                onChange={(e) => setFavorite(e.target.checked)}
              />
              <label htmlFor="favorite">
                Mark this record as a favorite
              </label>
            </div>

            {/* Submit + message */}
            <div className="add-form-footer">
              <button type="submit" disabled={submitting}>
                {submitting ? "Saving…" : "Add record"}
              </button>
              {formMessage && (
                <p className="add-form-message">{formMessage}</p>
              )}
            </div>
          </form>
        </section>

        {/* SIDE PANEL: Discogs search */}
        <aside className="card add-side-card">
          <h3 className="add-side-title">Discogs lookup</h3>
          <p className="add-side-subtitle">
            Search Discogs to help fill in release details. You can still edit
            anything before saving.
          </p>

          <form className="add-discogs-form" onSubmit={handleDiscogsSearch}>
            <div className="add-field">
              <label htmlFor="discogsArtist" className="add-field-label">
                Artist (optional)
              </label>
              <input
                id="discogsArtist"
                type="text"
                value={discogsArtist}
                onChange={(e) => setDiscogsArtist(e.target.value)}
                placeholder="e.g. David Bowie"
              />
            </div>

            <div className="add-field">
              <label htmlFor="discogsTitle" className="add-field-label">
                Title (optional)
              </label>
              <input
                id="discogsTitle"
                type="text"
                value={discogsTitle}
                onChange={(e) => setDiscogsTitle(e.target.value)}
                placeholder="e.g. Heroes"
              />
            </div>

            <div className="add-discogs-actions">
              <button type="submit" disabled={discogsLoading}>
                {discogsLoading ? "Searching…" : "Search Discogs"}
              </button>
            </div>
          </form>

          {discogsError && <p className="add-error">{discogsError}</p>}

          <p className="add-discogs-info">
            If you leave these blank, the search will try using the artist/title
            from your form above.
          </p>

          {discogsResults.length > 0 && (
            <div className="add-discogs-results">
              <p className="add-discogs-results-title">Results</p>
              <ul className="add-discogs-list">
                {discogsResults.map((r) => (
                  <li key={r.id || r.discogsId || r.key} className="add-discogs-item">
                    <div className="add-discogs-main">
                      <span className="add-discogs-title-line">
                        {r.artist ? `${r.artist} — ` : ""}
                        {r.title}
                      </span>
                      <span className="add-discogs-meta">
                        {r.year && `Year: ${r.year} `}{" "}
                        {r.format && `• ${r.format}`}{" "}
                        {r.catalogNumber && `• Cat#: ${r.catalogNumber}`}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="add-discogs-apply"
                      onClick={() => applyDiscogsResult(r)}
                    >
                      Use this
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}