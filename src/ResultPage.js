import resultBg from "./result-bg.jpg";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import truckLoading from "./truck-loader.png"; 

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("trackingResult");
    return (
      location.state ||
      (saved ? JSON.parse(saved) : { found: [], invalid: [] })
    );
  });

  const { found = [], invalid = [] } = data;
  const [openHistory, setOpenHistory] = useState({});
  const [loading, setLoading] = useState(true); 

  // ULTIMATE BACKGROUND FIX: Direct Body Styling
  useEffect(() => {
    document.body.style.backgroundImage = `url(${resultBg})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundRepeat = "no-repeat";

    return () => {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundSize = "";
      document.body.style.backgroundPosition = "";
      document.body.style.backgroundAttachment = "";
    };
  }, []);

  const toggleHistory = (trackingNumber) => {
    setOpenHistory((prev) => ({
      ...prev,
      [trackingNumber]: !prev[trackingNumber],
    }));
  };

  const refreshData = useCallback(async () => {
    if (!found || found.length === 0) {
      setLoading(false);
      return;
    }
    
    setLoading(true);

    try {
      const trackingNumbers = [
        ...found.map((f) => f.trackingNumber),
        ...(invalid || []),
      ];

      //  2.5 Second Full loading screen 
      await new Promise(resolve => setTimeout(resolve, 2500));

      const res = await fetch("https://multicourier-backend.onrender.com/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumbers }),
      });
      
      const fresh = await res.json();
      localStorage.setItem("trackingResult", JSON.stringify(fresh));
      setData(fresh);
    } catch (err) {
      console.log("Refresh failed", err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    refreshData();
  }, [refreshData]); 

  useEffect(() => {
    if (!loading && found.length === 0 && invalid.length === 0) {
      navigate("/", { replace: true });
    }
  }, [found, invalid, navigate, loading]);

  const getStatusColor = (status) => {
    if (status === "Booked") return "#FACC15";
    if (status === "In Transit") return "#F97316";
    if (status === "Out for Delivery") return "#1976d2";
    if (status === "Delivered") return "#2e7d32";
    return "#555";
  };

  const formatDateTime = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div style={{ 
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", 
        background: "#fff", display: "flex", flexDirection: "column", 
        justifyContent: "center", alignItems: "center", zIndex: 9999 
      }}>
        <img src={truckLoading} alt="Loading..." style={{ width: isMobile ? "150px" : "200px", marginBottom: "20px" }} />
        <div className="loading-text">
          LOADING<span>.</span><span>.</span><span>.</span>
        </div>
        <style>{`
          .loading-text { font-weight: bold; font-size: ${isMobile ? '18px' : '24px'}; letter-spacing: 8px; color: #333; font-family: sans-serif; }
          .loading-text span { animation: blink 1.4s infinite; opacity: 0; }
          .loading-text span:nth-child(1) { animation-delay: 0s; }
          .loading-text span:nth-child(2) { animation-delay: 0.3s; }
          .loading-text span:nth-child(3) { animation-delay: 0.6s; }
          @keyframes blink { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar onLoginClick={() => {}} />

      <div style={{
        flex: "1",
        padding: isMobile ? "20px 15px" : "40px 10px",
        fontFamily: "Segoe UI, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}>
        <div style={{
          maxWidth: "620px",
          width: "100%",
          background: "rgba(255, 255, 255, 0.45)", 
          backdropFilter: "blur(12px)", 
          padding: isMobile ? "15px" : "20px",
          borderRadius: "10px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          boxSizing: "border-box"
        }}>
          <h3 style={{ textAlign: "center", marginBottom: "20px", fontSize: isMobile ? "20px" : "24px" }}>Tracking Result</h3>

          {found.map((item) => {
            const displayHistory = item.history || [];

            return (
              <div key={item.trackingNumber} style={{
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "8px",
                padding: isMobile ? "12px" : "14px",
                marginBottom: "16px",
                background: "rgba(255, 255, 255, 0.8)",
                wordBreak: "break-word" // Tracking number bada ho to mobile pe kate na
              }}>
                <div style={{ fontWeight: "600", marginBottom: "6px", fontSize: isMobile ? "14px" : "16px" }}>Tracking No: {item.trackingNumber}</div>
                <div style={{ marginBottom: "6px", fontSize: isMobile ? "13px" : "15px" }}><b>Courier:</b> {item.courier}</div>
                <div style={{ marginBottom: "4px", color: getStatusColor(item.status), fontWeight: "600", fontSize: isMobile ? "13px" : "15px" }}>
                  Status: {item.status}
                </div>
                
                <div style={{ fontSize: isMobile ? "13px" : "15px" }}><b>From:</b> {item.from}</div>
                <div style={{ fontSize: isMobile ? "13px" : "15px" }}><b>To:</b> {item.to}</div>

                {item.status !== "Delivered" && item.expectedDelivery && (
                  <div style={{ marginBottom: "4px", color: "#1e293b", fontSize: isMobile ? "13px" : "15px" }}>
                    <b>Expected Delivery:</b> {item.expectedDelivery}
                  </div>
                )}

                <div style={{ fontSize: isMobile ? "13px" : "15px" }}><b>Current Location:</b> {item.currentLocation}</div>

                <div style={{ fontSize: isMobile ? "12px" : "13px", color: "#555", marginTop: "6px" }}>
                  <b>Last Update:</b> {formatDateTime(item.updatedAt || item.createdAt)}
                </div>

                <div style={{ marginTop: "15px" }}>
                  <div 
                    onClick={() => toggleHistory(item.trackingNumber)}
                    style={{ fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: isMobile ? "13px" : "15px" }}
                  >
                    Shipment History
                    <span style={{ 
                      fontSize: "16px", 
                      transform: openHistory[item.trackingNumber] ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "0.3s"
                    }}>⌄</span>
                  </div>

                  {openHistory[item.trackingNumber] && (
                    <div style={{ borderLeft: "2px solid #000", marginLeft: "5px", paddingLeft: "15px", marginTop: "10px" }}>
                      {displayHistory.map((h, index) => (
                        <div key={index} style={{ marginBottom: "12px", position: "relative" }}>
                          <div style={{ position: "absolute", left: "-21px", top: "4px", width: "10px", height: "10px", background: "#000", borderRadius: "50%" }}></div>
                          <div style={{ fontSize: isMobile ? "12px" : "13px" }}>
                            <b>{h.status}</b> – {h.location}<br />
                            <span style={{ color: "#777" }}>{formatDateTime(h.time)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {invalid.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <h4 style={{ color: "#d32f2f", fontSize: isMobile ? "16px" : "18px" }}>Invalid Tracking Numbers</h4>
              {invalid.map((num) => <p key={num} style={{ color: "#d32f2f", margin: "0", fontSize: isMobile ? "13px" : "15px" }}>{num}</p>)}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button onClick={() => navigate("/")} style={{
              padding: isMobile ? "10px 25px" : "10px 35px", 
              borderRadius: "4px", border: "none",
              background: "#000", color: "#fff", cursor: "pointer", 
              fontWeight: "bold", fontSize: isMobile ? "12px" : "14px",
              width: isMobile ? "100%" : "auto" // Mobile par button bada
            }}>BACK TO HOME</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ResultPage;