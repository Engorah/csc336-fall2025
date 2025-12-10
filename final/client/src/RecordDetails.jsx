import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "./apiConfig";
import "./RecordDetails.css";

export default function RecordDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchRecord() {
      try {
        setLoading(true);
        setLoadError("");
        const res = await axios.get(`${API_BASE_URL}/api/items/${id}`);
        setRecord(res.data);
      } catch (err) {
        console.error("Error loading record:", err);
        setLoadError("Could not load this record. It may have been removed.");
      } finally {
        setLoading(false);
      }
    }

    fetchRecord();
  }, [id]);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this record from your collection?"
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      setActionMessage("");
      await axios.delete(`${API_BASE_URL}/api/items/${id}`);
      navigate("/collection");
    } catch (err) {
      console.error("Error deleting record:", err);
      setActionMessage("Failed to delete record. Please try again.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="record-page container">
        <p className="record-status">Loading record…</p>
      </div>
    );
  }

  if (loadError || !record) {
    return (
      <div className="record-page container">
        <p className="record-status">{loadError || "Record not found."}</p>
        <p className="record-status">
          <Link to="/collection">Back to collection</Link>
        </p>
      </div>
    );
  }

  const {
    artist,
    title,
    year,
    format,
    notes,
    favorite,
    catalogNumber,
    matrixInfo,
    condition,
    discogsId,
    discogsUrl,
    thumb
  } = record;

  return (
    <div className="record-page container">
      <div className="record-layout">
        <section className="card record-card">
          {/* Header: title + actions */}
          <div className="record-header">
            <div className="record-title-block">
              <h2 className="record-title">
                {artist} — {title}
              </h2>
              <p className="record-subtitle">
                {year ? `${year}` : "Year unknown"}
                {format ? ` • ${format}` : ""}
              </p>
              {favorite && (
                <span className="record-favorite">
                  <span>★</span> Favorite
                </span>
              )}
            </div>

            <div className="record-actions">
              <div className="record-actions-main">
                <Link
                  to={`/record/${id}/edit`}
                  className="record-button-secondary"
                >
                  Edit record
                </Link>
                <button
                  type="button"
                  className="record-button-secondary record-button-danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
              <Link to="/collection" className="record-button-secondary">
                Back to collection
              </Link>
            </div>
          </div>

          {/* Main two-column layout */}
          <div className="record-main-grid">
            {/* Left side: core info + notes */}
            <div className="record-info-section">
              <div className="record-details-list">
                <div className="record-details-label">Artist</div>
                <div className="record-details-value">{artist || "—"}</div>

                <div className="record-details-label">Title</div>
                <div className="record-details-value">{title || "—"}</div>

                <div className="record-details-label">Year</div>
                <div className="record-details-value">
                  {year != null ? year : "—"}
                </div>

                <div className="record-details-label">Format</div>
                <div className="record-details-value">{format || "—"}</div>

                <div className="record-details-label">Catalog number</div>
                <div className="record-details-value">
                  {catalogNumber || "—"}
                </div>

                <div className="record-details-label">Condition</div>
                <div className="record-details-value">
                  {condition || "—"}
                </div>
              </div>

              {(matrixInfo || notes) && (
                <div className="record-notes-block">
                  {matrixInfo && (
                    <>
                      <p className="record-notes-title">Matrix / runout</p>
                      <p className="record-notes-text">{matrixInfo}</p>
                    </>
                  )}

                  {notes && (
                    <>
                      <p className="record-notes-title">Notes</p>
                      <p className="record-notes-text">{notes}</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Right side: discogs + thumb */}
            <div className="record-meta-section">
              {thumb && (
                <div className="record-thumb-wrapper">
                  <img
                    src={thumb}
                    alt={`${artist} — ${title}`}
                    className="record-thumb"
                  />
                </div>
              )}

              {(discogsUrl || discogsId) && (
                <div className="record-discogs-card">
                  <p className="record-discogs-title">Discogs</p>
                  <p className="record-discogs-text">
                    This record is linked to a Discogs release for more detailed
                    metadata.
                  </p>
                  <div className="record-discogs-link">
                    {discogsUrl ? (
                      <a href={discogsUrl} target="_blank" rel="noreferrer">
                        View on Discogs
                      </a>
                    ) : (
                      <span>Release ID: {discogsId}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer meta */}
          <div className="record-meta-footer">
            <span>ID: {record.id}</span>
            {discogsId && <span>Discogs ID: {discogsId}</span>}
          </div>

          {actionMessage && (
            <p className="record-status" style={{ marginTop: "0.75rem" }}>
              {actionMessage}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
