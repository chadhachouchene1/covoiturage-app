import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TripContext } from "../context/TripContext";
import "./PublishTrip.css";

export default function PublishTrip() {
  const { createTrip } = useContext(TripContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    departure: "", destination: "", date: "", time: "",
    licensePlate: "", price: "", seats: "1",
    luggage: false, description: "",
  });
  const [carImage, setCarImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCarImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.departure || !form.destination || !form.date || !form.time || !form.licensePlate || !form.price || !form.seats) {
      return setError("Veuillez remplir tous les champs obligatoires");
    }
    if (new Date(form.date) < new Date()) {
      return setError("La date ne peut pas être dans le passé");
    }
    if (Number(form.price) < 0) {
      return setError("Le prix doit être positif");
    }

    setLoading(true);
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (carImage) data.append("carImage", carImage);

    const result = await createTrip(data);
    setLoading(false);

    if (result.error) return setError(result.message);
    navigate("/"); // Retour à l'accueil
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="publish-page">
      <div className="publish-bg" />
      <div className="publish-overlay" />

      <div className="publish-card">
        <div className="publish-header">
          <h1 className="publish-title">🚗 Publier un trajet</h1>
          <p className="publish-sub">Partagez votre route et économisez ensemble</p>
        </div>

        <form onSubmit={handleSubmit} className="publish-form">

          {/* ── Route ── */}
          <div className="section-label">📍 Itinéraire</div>
          <div className="form-row">
            <div className="form-field">
              <label>Ville de départ <span className="required">*</span></label>
              <input name="departure" value={form.departure}
                onChange={handleChange} placeholder="Ex: Tunis" required />
            </div>
            <div className="form-field">
              <label>Destination <span className="required">*</span></label>
              <input name="destination" value={form.destination}
                onChange={handleChange} placeholder="Ex: Sfax" required />
            </div>
          </div>

          {/* ── Date & Heure ── */}
          <div className="section-label">📅 Date & Heure</div>
          <div className="form-row">
            <div className="form-field">
              <label>Date du trajet <span className="required">*</span></label>
              <input type="date" name="date" value={form.date} min={today}
                onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>Heure de départ <span className="required">*</span></label>
              <input type="time" name="time" value={form.time}
                onChange={handleChange} required />
            </div>
          </div>

          {/* ── Voiture ── */}
          <div className="section-label">🚗 Voiture</div>
          <div className="form-row">
            <div className="form-field">
              <label>Plaque d'immatriculation <span className="required">*</span></label>
              <input name="licensePlate" value={form.licensePlate}
                onChange={handleChange} placeholder="Ex: 123 TN 4567"
                style={{ textTransform: "uppercase" }} required />
            </div>
            <div className="form-field">
              <label>Photo de la voiture</label>
              <label className="car-image-upload" htmlFor="carImage">
                {preview
                  ? <img src={preview} alt="voiture" className="car-preview" />
                  : <div className="car-upload-placeholder">
                      <span>📷</span>
                      <span>Ajouter une photo</span>
                    </div>}
              </label>
              <input id="carImage" type="file" accept="image/*"
                onChange={handleImage} style={{ display: "none" }} />
            </div>
          </div>

          {/* ── Prix & Places ── */}
          <div className="section-label">💰 Tarif & Capacité</div>
          <div className="form-row">
            <div className="form-field">
              <label>Prix par personne (DT) <span className="required">*</span></label>
              <div className="input-with-unit">
                <input type="number" name="price" value={form.price} min="0"
                  onChange={handleChange} placeholder="0" required />
                <span className="unit">DT</span>
              </div>
            </div>
            <div className="form-field">
              <label>Nombre de places <span className="required">*</span></label>
              <div className="seats-row">
                {[1,2,3,4,5,6,7,8].map((n) => (
                  <button key={n} type="button"
                    className={`seat-btn ${form.seats === String(n) ? "seat-btn-active" : ""}`}
                    onClick={() => setForm((p) => ({ ...p, seats: String(n) }))}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Options ── */}
          <div className="section-label">⚙️ Options</div>
          <label className="luggage-toggle">
            <div className={`toggle-track ${form.luggage ? "toggle-on" : ""}`}
              onClick={() => setForm((p) => ({ ...p, luggage: !p.luggage }))}>
              <div className="toggle-thumb" />
            </div>
            <span>
              <strong>Bagages acceptés</strong>
              <small>{form.luggage ? " — Les passagers peuvent apporter des bagages" : " — Bagages non autorisés"}</small>
            </span>
          </label>

          {/* ── Description ── */}
          <div className="form-field">
            <label>Description <span style={{ color:"#94a3b8",fontWeight:400 }}>(facultatif)</span></label>
            <textarea name="description" value={form.description}
              onChange={handleChange} rows={3} maxLength={500}
              placeholder="Ex: Départ depuis la station métro, climatisation disponible..."
              className="form-textarea" />
            <span className="char-count">{form.description.length}/500</span>
          </div>

          {error && <div className="publish-error">⚠️ {error}</div>}

          {/* ── Récap avant soumission ── */}
          {form.departure && form.destination && form.date && form.price && (
            <div className="publish-recap">
              <strong>Récapitulatif :</strong>
              {form.departure} → {form.destination} · {new Date(form.date).toLocaleDateString("fr-FR")} à {form.time} · {form.seats} place{form.seats > 1 ? "s" : ""} · {form.price} DT/personne
            </div>
          )}

          <button type="submit" className="btn-publish" disabled={loading}>
            {loading ? "Publication en cours..." : "📢 Publier le trajet"}
          </button>
        </form>
      </div>
    </div>
  );
}
