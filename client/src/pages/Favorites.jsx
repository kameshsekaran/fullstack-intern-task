import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.replace("/login");
      return;
    }

    axios
      .get("http://localhost:5000/api/favorites", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((response) => {
        setFavorites(response.data);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.replace("/login");
        } else {
          setError("Unable to load your favorites.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="loading">Loading your favorites...</div>;
  }

  return (
    <main className="page-container favorites-page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">YOUR COLLECTION</span>
          <h1>My Favorites <span className="heart">♥</span></h1>
          <p className="muted">
            All your saved templates in one place.
          </p>
        </div>

        <Link to="/templates" className="secondary-button">
          Explore More
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!error && favorites.length === 0 && (
        <div className="empty-state">
          <div className="empty-heart">♡</div>
          <h2>No favorites yet</h2>
          <p>Save templates you love to find them here later.</p>

          <Link to="/templates" className="primary-button">
            Discover Templates
          </Link>
        </div>
      )}

      <div className="template-grid">
        {favorites.map((template) => (
          <article className="template-card" key={template.id}>
            <div className="template-image-wrapper">
              <img
                src={template.thumbnail_url}
                alt={template.name}
                className="template-image"
              />

              <span className="category-badge">
                {template.category}
              </span>
            </div>

            <div className="template-content">
              <h3>{template.name}</h3>
              <p>{template.description}</p>
              <span className="saved-label">♥ Saved to favorites</span>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
