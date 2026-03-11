import React from "react";
import "./Navbar.css";
import { useNavigate, useLocation } from "react-router-dom";

function Navbar({ onLoginClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Home ke sections par scroll karne ke liye
  const handleNavClick = (id) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // 2. Page ke ekdum upar jane ke liye
  const scrollToTop = () => {
    if (location.pathname !== "/") {
      navigate("/");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 3. Result Page se Login handle karne ke liye (Special Fix)
  const handleLoginClick = () => {
    if (location.pathname !== "/") {
      // Pehle Home page par jao
      navigate("/");
      // Thoda wait karo taaki Home load ho jaye, phir modal kholo
      setTimeout(() => {
        onLoginClick();
      }, 300);
    } else {
      // Agar Home par hi ho toh seedha modal kholo
      onLoginClick();
    }
  };

  return (
    <nav className="navbar" style={{ 
      position: "fixed", 
      top: 0, 
      left: 0,
      right: 0,
      width: "100%", 
      height: "75px", 
      zIndex: 10000,
      background: "#ffffff", 
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 4%", 
      boxSizing: "border-box",
      boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
      fontFamily: "'Poppins', 'Segoe UI', sans-serif" 
    }}>
      
      {/* Logo Section */}
      <div className="navbar-logo" onClick={scrollToTop} style={{ cursor: 'pointer' }}>
          <span style={{ fontWeight: '800', fontSize: '1.3rem', letterSpacing: '0.5px', display: 'block', color: '#000' }}>MULTI COURIER</span>
          <span style={{ fontSize: '10px', letterSpacing: '2.5px', color: '#666', display: 'block' }}>TRACKING SYSTEM</span>
      </div>
      
      {/* Navigation Links */}
      <ul className="navbar-links" style={{ 
        display: 'flex', 
        listStyle: 'none', 
        gap: '35px', 
        margin: 0, 
        padding: 0 
      }}>
        <li><span onClick={scrollToTop} style={linkStyle}>Home</span></li>
        <li><span onClick={() => handleNavClick("services-section")} style={linkStyle}>Services</span></li>
        <li><span onClick={() => handleNavClick("tracking-section")} style={linkStyle}>Tracking</span></li>
        <li><span onClick={() => handleNavClick("contact-section")} style={linkStyle}>Contact Us</span></li>
      </ul>

      {/* Buttons Section */}
      <div className="navbar-actions" style={{ display: 'flex', gap: '12px' }}>
        {/* Fix: onLoginClick ki jagah handleLoginClick use kiya */}
        <button className="nav-btn-login" onClick={handleLoginClick} style={loginBtnStyle}>Login</button>
        <button className="nav-btn-track-blue" onClick={scrollToTop} style={trackBtnStyle}>Track</button>
      </div>
    </nav>
  );
}

const linkStyle = { 
  textDecoration: 'none', 
  color: '#333', 
  fontWeight: '600', 
  cursor: 'pointer',
  fontSize: '15px',
  fontFamily: "inherit"
};

const loginBtnStyle = {
  background: "#000",
  color: "#fff",
  padding: "9px 22px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px"
};

const trackBtnStyle = {
  background: "#007bff",
  color: "#fff",
  padding: "9px 22px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "14px"
};

export default Navbar;