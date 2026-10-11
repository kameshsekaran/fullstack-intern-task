import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API = "http://localhost:5000/api";

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await axios.get(`${API}/templates`);
      setTemplates(response.data);

      if (token) {
        try {
          const favResponse = await axios.get(`${API}/favorites`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          setFavorites(favResponse.data.map((item) => item.id));
        } catch {
          setFavorites([]);
        }
      }
    } catch {
      setError("Unable to load templates. Check whether the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (id) => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    setMessage("");

    try {
      await axios.post(
        `${API}/favorites/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setFavorites((previous) =>
        previous.includes(id) ? previous : [...previous, id]
      );

      setMessage("Template added to your favorites!");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Unable to add favorite."
      );
    }
  };

  const categories = [
    "All",
    ...new Set(templates.map((item) => item.category))
  ];

  const filteredTemplates = templates.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || item.category === category;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="loading">Loading templates...</div>;
  }

  return (
    <main className="page-container">
      <section className="hero">
        <span className="eyebrow">YOUR NEXT PROJECT STARTS HERE</span>
        <h1>Discover templates.<br />Build something amazing.</h1>
        <p>
          Explore ready-to-use website templates for your next big idea.
        </p>

        <div className="hero-actions">
          <a href="#template-list" className="primary-button hero-button">
            Explore Templates
          </a>

          <Link to="/favorites" className="secondary-button">
            My Favorites ♥
          </Link>
        </div>
      </section>

      <section id="template-list" className="template-section">
        <div className="section-heading">
          <div>
            <h2>Explore Templates</h2>
            <p className="muted">
              Find the perfect starting point for your project.
            </p>
          </div>

          <span className="count-badge">
            {filteredTemplates.length} templates
          </span>
        </div>

        <div className="filters">
          <input
            className="search-input"
            type="search"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Categories" : item}
              </option>
            ))}
          </select>
        </div>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="template-grid">
          {filteredTemplates.map((template) => {
            const isFavorite = favorites.includes(template.id);

            return (
              <article className="template-card" key={template.id}>
                <div className="template-image-wrapper">
                  <img
                    src={template.thumbnail_url}
                    alt={template.name}
                    className="template-image"
                    loading="lazy"
                  />

                  <span className="category-badge">
                    {template.category}
                  </span>
                </div>

                <div className="template-content">
                  <h3>{template.name}</h3>
                  <p>{template.description}</p>

                  <button
                    className={
                      isFavorite
                        ? "favorite-button favorited"
                        : "favorite-button"
                    }
                    onClick={() => addFavorite(template.id)}
                  >
                    {isFavorite ? "♥ Favorited" : "♡ Add to Favorites"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="empty-state">
            <h3>No templates found</h3>
            <p>Try another search term or category.</p>
          </div>
        )}
      </section>
    </main>
  );
}
