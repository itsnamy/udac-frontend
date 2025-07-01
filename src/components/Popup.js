import React from "react";
import ReactDOM from "react-dom";

const Popup = ({ children, onClose }) => {
  return ReactDOM.createPortal(
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="popup-close" onClick={onClose}>✖</button>
        {children}
      </div>
    </div>,
    document.getElementById("popup-root")
  );
};

const styles = `
  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .popup-content {
    background: #fff;
    padding: 30px;
    border-radius: 10px;
    width: 500px;
    max-width: 90%;
    position: relative;
    animation: slideDown 0.3s ease;
  }

  .popup-close {
    position: absolute;
    top: 10px;
    right: 15px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
  }

  @keyframes slideDown {
    from { transform: translateY(-50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Popup;
