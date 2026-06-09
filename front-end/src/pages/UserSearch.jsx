import { useState } from "react";
import { Link } from "react-router-dom";
import { baseUrl } from "../utils/services";
import "./UserSearch.css";



export default function UserSearch() {
  const [query, setQuery]   = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`${baseUrl}/users/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("Token")}` },
      });
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  return (
    <div className="usearch-page">
      <div className="usearch-header">
        <h1 className="usearch-title">🔍 Rechercher un membre</h1>
        <p className="usearch-sub">Trouvez un conducteur ou un passager par nom</p>
      </div>

      <div className="usearch-body">
        <form className="usearch-bar" onSubmit={handleSearch}>
          <span className="usearch-icon">🔍</span>
          <input
            className="usearch-input"
            placeholder="Nom, prénom..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" className="usearch-btn" disabled={loading}>
            {loading ? "..." : "Rechercher"}
          </button>
        </form>

        {loading && (
          <div className="usearch-loading">
            <div className="usearch-spinner" />
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="usearch-empty">
            <span>😔</span>
            <p>Aucun membre trouvé pour "<strong>{query}</strong>"</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="usearch-results">
            <p className="usearch-count">{results.length} résultat{results.length > 1 ? "s" : ""}</p>
            <div className="usearch-grid">
              {results.map((u) => {
                const avatarSrc = u.image || null;
                const initials  = `${u.firstName?.[0] || ""}${u.lastName?.[0] || ""}`.toUpperCase();
                return (
                  <Link key={u._id} to={`/profile/${u._id}`} className="usearch-card">
                    <div className="usearch-avatar">
                      {avatarSrc
                        ? <img src={avatarSrc} alt={u.firstName} />
                        : <div className="usearch-avatar-init">{initials}</div>}
                    </div>
                    <div className="usearch-info">
                      <strong>{u.firstName} {u.lastName}</strong>
                      <span>🚗 Membre Tawsila</span>
                    </div>
                    <span className="usearch-arrow">→</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {!searched && (
          <div className="usearch-placeholder">
            <span>👥</span>
            <p>Cherchez un membre par son prénom ou nom</p>
          </div>
        )}
      </div>
    </div>
  );
}
