import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer-main-container">
      <div className="footer-content-grid">
        
        {/* Section 1: Brand Info */}
        <div className="footer-section-item">
          <h2 className="footer-brand">MULTI COURIER</h2>
          <p>Connecting India with cutting-edge technology and customer-focused shipping solutions.</p>
        </div>

        {/* Section 2: Useful Links */}
        <div className="footer-section-item">
          <h3 className="footer-heading">Useful Links</h3>
          <ul className="footer-links-list">
            <li>About Us</li>
            <li>Support</li>
            <li>Domestic</li>
            <li>International</li>
            <li>Gallery</li>
          </ul>
        </div>

        {/* Section 3: Contact (Updated India Details) */}
        <div className="footer-section-item">
          <h3 className="footer-heading">Contact</h3>
          <p>📍 Head Office: A-64, Naraina Industrial Area, Phase-1, New Delhi - 110028</p>
          <p>✉️ <span className="contact-blue">customercare@multicourier.in</span></p>
          <p>📞 +91 11-4559 3500</p>
        </div>

        {/* Section 4: Follow Us (Circular Icons) */}
        <div className="footer-section-item">
          <h3 className="footer-heading">Follow us on</h3>
          <div className="social-icons-row">
            <span className="social-circle">in</span>
            <span className="social-circle">f</span>
            <span className="social-circle">ig</span>
            <span className="social-circle">yt</span>
          </div>
        </div>

      </div>

      <div className="footer-copyright-bar">
        <p>© 2026 Copyright Multi Courier Tracking System. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;