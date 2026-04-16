import React from "react";
import { FiX } from ‘react-icons/fi’
import Login from "./Login"; // ton composant Login existant
import "./loginmodal.css";   // un petit style pour l’overlay et la boîte

function LoginModal({ show, onClose }) {
  if (!show) return null; // ne rien afficher si pas actif

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>
          <FiX size={18}/>
        </button>
        <Login /> 
      </div>
    </div>
  );
}

export default LoginModal;
