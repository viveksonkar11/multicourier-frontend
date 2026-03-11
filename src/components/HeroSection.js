import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";

function HeroSection() {
  const [tracking, setTracking] = useState("");
  const [isMulti, setIsMulti] = useState(false);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Session start par purani history load karega
    const saved = JSON.parse(sessionStorage.getItem("recentSearches") || "[]");
    setHistory(saved.slice(0, 1));
  }, []);

  const handleTrack = async (idToTrack = tracking) => {
    const finalId = typeof idToTrack === 'string' ? idToTrack : tracking;
    
    if (!finalId.trim()) {
      alert("Please enter tracking number");
      return;
    }

    // --- LOGIC: GET THE LAST ID FROM MULTIPLE INPUT ---
    let idForRecent = finalId;

    if (isMulti) {
      // Numbers ko split karo aur array banao
      const allIds = finalId.split(/\s|,/).filter(Boolean);
      // Array ka sabse AAKHIRI (last) element uthao
      idForRecent = allIds.length > 0 ? allIds[allIds.length - 1] : finalId;
    }

    // Recent mein sirf ye aakhiri searched ID hi rahegi
    const newHistory = [idForRecent]; 
    sessionStorage.setItem("recentSearches", JSON.stringify(newHistory));
    setHistory(newHistory);
    // --------------------------------------------------

    try {
      const payload = isMulti
        ? { trackingNumbers: finalId.split(/\s|,/).filter(Boolean) }
        : { trackingNumber: finalId };

      const res = await fetch("http://localhost:5000/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      navigate("/result", { state: data });
    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <section className="trackon-hero">
      <div className="white-gradient-overlay">
        <div className="hero-container">
          <div className="text-content">
            <h1 className="main-title">
              FAST, FLAWLESS AND <br />
              <span className="bold-title">FUTURE-READY LOGISTICS</span>
            </h1>
            <p className="sub-title">Connecting your shipments with speed and reliability across India.</p>
          </div>

          <div className="box-content">
            <div className="tracking-card-simple">
              <div className="input-row-original">
                {isMulti ? (
                  <textarea 
                    className="input-field"
                    placeholder="Numbers should be less than 30" 
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                  />
                ) : (
                  <input 
                    type="text" 
                    className="input-field"
                    placeholder="Enter Tracking ID" 
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                  />
                )}
                <button className="black-track-btn" onClick={() => handleTrack()}>Track</button>
              </div>

              {/* Recent Search UI: Sirf 1 latest ID */}
              {history.length > 0 && (
                <div style={{ textAlign: 'left', marginTop: '10px', fontSize: '13px', color: '#666' }}>
                  <span style={{ fontWeight: 'bold' }}>Recent:</span>
                  <span 
                    onClick={() => handleTrack(history[0])} 
                    style={{ cursor: 'pointer', marginLeft: '8px', color: '#0056b3', textDecoration: 'underline' }}
                  >
                    {history[0]}
                  </span>
                </div>
              )}
              
              <p className="blue-toggle-link" onClick={() => { setIsMulti(!isMulti); setTracking(""); }}>
                {isMulti ? "← SINGLE TRACKING" : "+ MULTIPLE TRACKING NUMBERS"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
