import { Link } from "react-router-dom";
import tawsilaLogo from "../assets/tawsilalogo.png";
import "./Landing.css";
import transportBg from "../assets/transport_bg.jpg";

const Landing = () => {
  return (
    <>
    

      <div className="lp-root">

        {/* ══════════════════════════════
            HERO
        ══════════════════════════════ */}
        <section className="lp-hero">

          {/* Colonne gauche */}
          <div className="lp-left">
            <div className="lp-badge">
              <span className="lp-badge-dot" />
              Plateforme active en Tunisie
            </div>

            <h1 className="lp-title">
              Vos Services de<br />
              <span className="lp-title-accent">Transport</span><br />
              Simplifiés
            </h1>

            <p className="lp-desc">
              Rejoignez des milliers de Tunisiens qui partagent la route chaque jour.
              Économisez, voyagez confortablement et réduisez votre empreinte carbone.
            </p>

            <div className="lp-cta">
              <Link to="/register" className="lp-btn-primary">
                Commencer maintenant →
              </Link>
              <Link to="/login" className="lp-btn-secondary">
                J'ai déjà un compte
              </Link>
            </div>

            <div className="lp-stats">
              <div className="lp-stat-item">
                <span className="lp-stat-num">2 400+</span>
                <span className="lp-stat-label">Trajets / mois</span>
              </div>
              <div className="lp-stat-sep" />
              <div className="lp-stat-item">
                <span className="lp-stat-num">1 800+</span>
                <span className="lp-stat-label">Membres actifs</span>
              </div>
              <div className="lp-stat-sep" />
              <div className="lp-stat-item">
                <span className="lp-stat-num">60%</span>
                <span className="lp-stat-label">d'économies</span>
              </div>
            </div>
          </div>

          {/* Colonne droite : illustration */}
          <div className="lp-right">
            <img src={transportBg} alt="Transport Tawsila" className="lp-img" />
          </div>

        </section>

        {/* ══════════════════════════════
            FEATURES BAR
        ══════════════════════════════ */}
        <div className="lp-features" id="features">
          {[
            { icon: "📍", title: "Trajet en temps réel",   desc: "Suivez votre trajet sur la carte en direct" },
            { icon: "🔒", title: "100% Sécurisé",          desc: "Profils vérifiés et paiements protégés" },
            { icon: "💸", title: "Économisez jusqu'à 60%", desc: "Partagez les frais avec d'autres voyageurs" },
            { icon: "🌱", title: "Éco-responsable",        desc: "Réduisez votre empreinte CO₂ ensemble" },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="lp-feat">
              <div className="lp-feat-icon">{icon}</div>
              <div>
                <div className="lp-feat-title">{title}</div>
                <div className="lp-feat-desc">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════
            COMMENT ÇA MARCHE
        ══════════════════════════════ */}
        <section className="lp-how" id="how">
          <p className="lp-section-label">Comment ça marche</p>
          <h2 className="lp-section-title">Simple, rapide et accessible à tous</h2>
          <div className="lp-steps">
            {[
              { n: "01", icon: "📝", title: "Créez votre compte",
                desc: "Inscrivez-vous en 3 étapes simples. Vérifiez votre email par code OTP et acceptez les conditions." },
              { n: "02", icon: "🔍", title: "Trouvez un trajet",
                desc: "Cherchez un trajet disponible près de vous ou proposez le vôtre à d'autres voyageurs." },
              { n: "03", icon: "🚗", title: "Voyagez ensemble",
                desc: "Partagez la route, économisez sur les frais et contribuez à un transport plus durable." },
            ].map(({ n, icon, title, desc }) => (
              <div key={n} className="lp-step">
                <div className="lp-step-num">{n}</div>
                <span className="lp-step-icon">{icon}</span>
                <div className="lp-step-title">{title}</div>
                <p className="lp-step-desc">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════
            CTA FINAL
        ══════════════════════════════ */}
        <section className="lp-cta-section">
          <h2 className="lp-cta-title">Prêt à rejoindre Tawsila ?</h2>
          <p className="lp-cta-sub">Rejoignez notre communauté et commencez à partager la route dès aujourd'hui.</p>
          <div className="lp-cta-btns">
            <Link to="/register" className="lp-cta-btn-main">🚗 Créer un compte gratuit</Link>
            <Link to="/login"    className="lp-cta-btn-ghost">Se connecter →</Link>
          </div>
        </section>

        {/* ══════════════════════════════
            FOOTER
        ══════════════════════════════ */}
        <footer className="lp-footer">
          <div className="lp-footer-brand">
            <img src={tawsilaLogo} alt="Tawsila" className="lp-footer-logo" />
            <span className="lp-footer-name">TAWSILA</span>
          </div>
          <span className="lp-footer-copy">© 2026 Tawsila — Your Ride, Our Pride</span>
        </footer>

      </div>
    </>
  );
};

export default Landing;
