// src/pages/Auth/Register.jsx (ou équivalent)
import React, { useState, useEffect } from "react";
import { FiX } from 'react-icons/fi'
import { register } from "../../utils/auth";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import Swal from "sweetalert2";
import logoImage from "../../assets/logo.jpeg";
import "./login.css";

function Register() {
  const [full_name, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  // ✅ NEW: gestion modal + consentement politique
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      navigate("/");
    }
  }, []);

  const resetForm = () => {
    setFullname("");
    setEmail("");
    setMobile("");
    setPassword("");
    setPassword2("");
    // ✅ NEW
    setAcceptPrivacy(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ NEW: bloquer si pas accepté
    if (!acceptPrivacy) {
      Swal.fire({
        icon: "warning",
        title: "Confirmation requise",
        text: "Veuillez accepter la Politique de confidentialité pour continuer.",
        position: "center",
        confirmButtonText: "OK",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await register(full_name, email, phone, password, password2);

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: error,
        position: "center",
        confirmButtonText: "OK",
      });
      setIsLoading(false);
    } else {
      // login() est appelé en interne dans register(), le store est déjà mis à jour
      Swal.fire({
        icon: "success",
        title: "Inscription réussie",
        text: "Votre compte a bien été créé, vous êtes connecté !",
        position: "center",
        confirmButtonText: "OK",
      });

      navigate("/");
      setIsLoading(false);
      resetForm();
    }
  };

  // ✅ contenu politique de confidentialité Mix&Match Frip
  const PrivacyContent = () => (
    <div style={{ lineHeight: 1.5, fontSize: 14 }}>
      <p style={{ marginTop: 0 }}>
        <strong>Politique de Confidentialité & de Sécurité — Mix&Match Frip</strong>
        <br />
        <span style={{ opacity: 0.8 }}>Dernière mise à jour : avril 2026</span>
      </p>

      <p>
        Mix&Match Frip collecte et utilise certaines informations (nom, email, téléphone, commandes, données
        techniques) afin de fournir le service, sécuriser la plateforme, traiter les paiements et vous assister en
        cas de problème. Ces données ne sont jamais revendues à des tiers.
      </p>

      <p>
        <strong>Paiements (Paystack)</strong> : les paiements sont traités de manière sécurisée via Paystack.
        Mix&Match Frip ne stocke pas vos informations de carte bancaire. Seules des références de transaction
        (ID, statut, montant, date) sont conservées à des fins de support et de prévention de la fraude.
      </p>

      <p>
        <strong>Commandes & retours</strong> : chaque article vendu sur Mix&Match Frip est décrit avec soin
        (photos, état, taille, description). En cas de non-conformité avérée entre l’article reçu et l’annonce,
        un retour ou remboursement peut être accordé dans les 48h suivant la réception, sur présentation de
        preuves (photos). Les frais de port retour sont à la charge du client sauf erreur de notre part.
      </p>

      <p>
        <strong>Livraison</strong> : les frais et délais de livraison sont calculés via Postes Canada et affichés
        avant la validation de la commande. Mix&Match Frip n’est pas responsable des retards imputables au
        transporteur une fois le colis remis.
      </p>

      <p>
        <strong>Sécurité du compte</strong> : vous êtes responsable de la confidentialité de vos identifiants.
        Signalez toute activité suspecte à notre support dans les plus brefs délais.
      </p>

      <p>
        <strong>Vos droits</strong> : vous pouvez demander l’accès, la rectification ou la suppression de vos
        données en nous contactant : <strong>support@mixmatchfrip.com</strong>.
      </p>
    </div>
  );

  return (
    <div className="login-container">
      <div className="login-logo">
        <img src={logoImage} alt="Mix&Match Frip" />
      </div>

      <div className="login-box">
        <h2>Créer un compte</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="full_name" className="form-label">
              Nom et prénoms
            </label>
            <input
              type="text"
              id="full_name"
              placeholder="Nom et prénoms"
              value={full_name}
              onChange={(e) => setFullname(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Numéro de téléphone
            </label>
            <input
              type="number"
              id="phone"
              placeholder="Numéro"
              value={phone}
              onChange={(e) => setMobile(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password2" className="form-label">
              Confirmez votre mot de passe
            </label>
            <input
              type="password"
              id="password2"
              placeholder="Confirmez votre mot de passe"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="input-field"
            />
          </div>

          {/* ✅ NEW: consentement + ouverture du modal */}
          <div className="form-group" style={{ marginTop: 6 }}>
            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={acceptPrivacy}
                onChange={(e) => setAcceptPrivacy(e.target.checked)}
                style={{ marginTop: 3 }}
              />
              <span style={{ fontSize: 13, lineHeight: 1.4 }}>
                En créant un compte, vous confirmez avoir lu et accepté notre{" "}
                <button
                  type="button"
                  onClick={() => setShowPrivacy(true)}
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    color: "inherit",
                    textDecoration: "underline",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Politique de confidentialité & de sécurité
                </button>
                .
              </span>
            </label>
          </div>
  <div style={{ marginTop: 10, fontSize: 12.5, lineHeight: 1.4, opacity: 0.9 }}>
            <strong>Sécurité paiement :</strong> Tous les paiements doivent être effectués exclusivement sur{" "}
            <strong>Mix&Match Frip</strong>. N’effectuez aucun paiement en dehors de la plateforme,
            car nous ne pourrions pas garantir ni rembourser une transaction externe.
          </div>
          
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? "Chargement..." : "Créer un compte"}
          </button>

          {/* ✅ NEW: message sécurité paiement (juste sous le bouton) */}
        
        </form>

        <div className="sign-up-prompt">
          Vous avez déjà un compte ? <Link to="/login">Connectez-vous</Link>
        </div>
      </div>

      {/* ✅ NEW: Modal Politique de confidentialité */}
      {showPrivacy && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowPrivacy(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 720,
              background: "#fff",
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ fontWeight: 800 }}>Politique de confidentialité</div>
              <button
                type="button"
                onClick={() => setShowPrivacy(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 18,
                  lineHeight: 1,
                }}
                aria-label="Fermer"
                title="Fermer"
              >
                <FiX size={18}/>
              </button>
            </div>

            <div style={{ padding: 16, maxHeight: "70vh", overflowY: "auto" }}>
              <PrivacyContent />
            </div>

            <div
              style={{
                padding: 16,
                borderTop: "1px solid rgba(0,0,0,0.08)",
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => setShowPrivacy(false)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.2)",
                  background: "#fff",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Fermer
              </button>

              {/* ✅ NEW: bouton "J'accepte" pour cocher automatiquement */}
              <button
                type="button"
                onClick={() => {
                  setAcceptPrivacy(true);
                  setShowPrivacy(false);
                }}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "none",
                  background: "#111",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                J’accepte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;