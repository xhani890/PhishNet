import React from "react";
import PropTypes from "prop-types";

const LogoutModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Logout</h2>
        <p>Are you sure you want to logout?</p>
        <button onClick={onClose}>Cancel</button>
        <button onClick={() => {
          localStorage.removeItem("authToken");
          onClose();
        }}>Logout</button>
      </div>
    </div>
  );
};

// ✅ Add PropTypes validation
LogoutModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default LogoutModal;