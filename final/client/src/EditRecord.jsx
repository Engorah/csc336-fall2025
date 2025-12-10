import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "./apiConfig";
import "./EditRecord.css";

const ALLOWED_FORMATS = ["LP", "EP", "Single", "CD", "Cassette", "Digital", "Other"];

function validate({ artist, title, year, format }) {
  const newErrors = {};

  if (!artist || artist.trim() === "") {
    newErrors.artist = "Artist is required.";
  }

  if (!title || title.trim() === "") {
    newErrors.title = "Title is required. Please enter the name of the album or record.";
  }

  if (year !== "" && year !== null && year !== undefined) {
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

export default function EditRecord() {
  const { id } = useParams();
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
  const [discogsId, setDiscogsId] = useState(null);
  const [discogsUrl, setDiscogsUrl] = useState("");
  const [thumb, setThumb] = useState("");

  // UI state
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [errors, setErrors] = useState({});
  const [formMessage, setFormMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch existing record
  useEffect(() => {
    async function fetchRecord() {
      try {
        setLoading(true);
        setLoadError("");
        const res = await axios.get(`${API_BASE_URL}/api/items/${id}`);
        const item = res.data;

        setArtist(item.artist || "");
        setTitle(item.title || "");
        setYear(item.year != null ? String(item.year) : "");
        setFormat(item.format || "LP");
        setNotes(item.notes || "");
        setFavorite(Boolean(item.favorite));

        setCatalogNumber(item.catalogNumber || "");
        setMatrixInfo(item.matrixInfo || "");
        setCondition(item.condition || "");

        setDiscogsId(item.discogsId || null);
        setDiscogsUrl(item.discogsUrl || "");
        setThumb(item.thumb || "");
      } catch (err) {
        console.error("Error loading record:", err);
        setLoadError("Could not load this record. It may have been removed.");
      } finally {
        setLoading(false);
      }
    }

    fetchRecord();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormMessage("");
    setErrors({});

    const validationErrors = validate({ artist, title, year, format });
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setFormMessage("Please fix the errors below before saving.");
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
      await axios.put(`${API_BASE_URL}/api/items/${id}`, payload);
      setFormMessage("Changes saved.");

      // Navigate back to details page after a brief pause, or immediately
      navigate(`/record/${id}`);
    } catch (err) {
      console.error("Error updating record:", err);
      setFormMessage("Failed to save changes. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleResetToOriginal() {
    // Re-fetch from server to reset to stored version
    setFormMessage("");
    setErrors({});
    setLoadError("");

    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/items/${id}`);
        const item = res.data;

        setArtist(item.artist || "");
        setTitle(item.title || "");
        setYear(item.year != null ? String(item.year) : "");
        setFormat(item.format || "LP");
        setNotes(item.notes || "");
        setFavorite(Boolean(item.favorite));

        setCatalogNumber(item.catalogNumber || "");
        setMatrixInfo(item.matrixInfo || "");
        setCondition(item.condition || "");

        setDiscogsId(item.discogsId || null);
        setDiscogsUrl(item.discogsUrl || "");
        setThumb(item.thumb || "");
        setFormMessage("Changes reset to the saved version.");
      } catch (err) {
        console.error("Error reloading record:", err);
        setFormMessage("Could not reset; please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }

  if (loading) {
    return (
      <div className="edit-page container">
        <p className="edit-status">Loading record…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="edit-page container">
        <p className="edit-status">{loadError}</p>
        <p className="edit-status">
          <Link to="/collection">Back to collection</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="edit-page container">
      <div className="edit-layout">
        <section className="card edit-form-card">
          <div className="edit-form-header">
            <h2 className="edit-form-title">Edit record</h2>
            <p className="edit-form-subtitle">
              Update details for this record. You can adjust artist, title, year,
              pressing info, and more.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="edit-form-body" noValidate>
            {/* Artist */}
            <div className="edit-field">
              <div className="edit-field-header">
                <label htmlFor="artist" className="edit-field-label">
                  Artist <span style={{ color: "#dc2626" }}>*</span>
                </label>
                {errors.artist && (
                  <span className="edit-error">{errors.artist}</span>
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
            <div className="edit-field">
              <div className="edit-field-header">
                <label htmlFor="title" className="edit-field-label">
                  Title <span style={{ color: "#dc2626" }}>*</span>
                </label>
                {errors.title && (
                  <span className="edit-error">{errors.title}</span>
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
            <div className="edit-field-row">
              <div className="edit-field">
                <div className="edit-field-header">
                  <label htmlFor="year" className="edit-field-label">
                    Year
                  </label>
                  {errors.year && (
                    <span className="edit-error">{errors.year}</span>
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

              <div className="edit-field">
                <div className="edit-field-header">
                  <label htmlFor="format" className="edit-field-label">
                    Format
                  </label>
                  {errors.format && (
                    <span className="edit-error">{errors.format}</span>
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

            {/* Catalog / Condition */}
            <div className="edit-field-row">
              <div className="edit-field">
                <div className="edit-field-header">
                  <label htmlFor="catalogNumber" className="edit-field-label">
                    Catalog number
                  </label>
                  <span className="edit-field-hint">Optional</span>
                </div>
                <input
                  id="catalogNumber"
                  type="text"
                  value={catalogNumber}
                  onChange={(e) => setCatalogNumber(e.target.value)}
                />
              </div>

              <div className="edit-field">
                <div className="edit-field-header">
                  <label htmlFor="condition" className="edit-field-label">
                    Condition
                  </label>
                  <span className="edit-field-hint">e.g. VG+, NM</span>
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
            <div className="edit-field edit-matrix">
              <div className="edit-field-header">
                <label htmlFor="matrixInfo" className="edit-field-label">
                  Matrix / runout
                </label>
                <span className="edit-field-hint">Optional</span>
              </div>
              <textarea
                id="matrixInfo"
                value={matrixInfo}
                onChange={(e) => setMatrixInfo(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="edit-field edit-notes">
              <div className="edit-field-header">
                <label htmlFor="notes" className="edit-field-label">
                  Notes
                </label>
                <span className="edit-field-hint">
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
            <div className="edit-checkbox-row">
              <input
                id="favorite"
                type="checkbox"
                checked={favorite}
                onChange={(e) => setFavorite(e.target.checked)}
              />
              <label htmlFor="favorite">Mark this record as a favorite</label>
            </div>

            {/* Discogs meta (if present) */}
            {(discogsUrl || discogsId) && (
              <p className="edit-discogs-meta">
                Linked Discogs release:{" "}
                {discogsUrl ? (
                  <a href={discogsUrl} target="_blank" rel="noreferrer">
                    View on Discogs
                  </a>
                ) : (
                  <span>Release ID: {discogsId}</span>
                )}
              </p>
            )}

            {/* Footer buttons */}
            <div className="edit-form-footer">
              <button type="submit" disabled={submitting}>
                {submitting ? "Saving…" : "Save changes"}
              </button>

              {formMessage && (
                <p className="edit-form-message">{formMessage}</p>
              )}
            </div>

            {/* Secondary actions */}
            <div className="edit-secondary-actions">
              <button
                type="button"
                className="edit-secondary-button"
                onClick={handleResetToOriginal}
              >
                Reset to saved version
              </button>
              <Link to={`/record/${id}`} className="edit-secondary-button">
                Cancel and go back
              </Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}