import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import Features from "./components/Features";
import Footer from "./components/Footer";
import warningTruck from "./warning-truck.png"; 
import truckLoading from "./truck-loader.png"; 
import axios from "axios"; 
import { Eye, EyeOff } from "lucide-react"; 

function Home({ isLoginOpen: externalLoginOpen, setIsLoginOpen: setExternalLoginOpen, setAppLoading }) {
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  
  // Internal state for login popup (renamed to avoid conflict with props)
  const [isLoginPortalVisible, setIsLoginPortalVisible] = useState(false);
  
  const [captchaCode, setCaptchaCode] = useState(""); 
  const [userCaptcha, setUserCaptcha] = useState(""); 
  const [role, setRole] = useState("Franchisee Login");
  
  const [userIdInput, setUserIdInput] = useState(""); 
  const [passwordInput, setPasswordInput] = useState(""); 
  const [showPassword, setShowPassword] = useState(false); 

  const [language, setLanguage] = useState(null); 
  const navigate = useNavigate();

  // Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { type: 'bot', text: 'Welcome to Multi Courier Support! ' },
    { type: 'bot', text: 'Choose Language: Type "English" or "Hindi" to start.' }
  ]);
  const chatEndRef = useRef(null);

  const generateCaptcha = () => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 4; i++) { result += chars.charAt(Math.floor(Math.random() * chars.length)); }
    setCaptchaCode(result);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Handle Loading and Warning Modal
  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setLoading(false); 
      if (setAppLoading) setAppLoading(false); 

      if (!sessionStorage.getItem("hasSeenWarning")) {
        setShowWarning(true);
        sessionStorage.setItem("hasSeenWarning", "true");
      }
    }, 1500);
    return () => clearTimeout(loadTimer);
  }, [setAppLoading]);

  // Synching external prop with internal visibility
  useEffect(() => {
    if (externalLoginOpen) {
      setIsLoginPortalVisible(true);
    }
  }, [externalLoginOpen]);

  // Reset Form when Login opens
  useEffect(() => { 
    if (isLoginPortalVisible) { 
        generateCaptcha(); 
        setUserCaptcha(""); 
        setUserIdInput("");
        setPasswordInput("");
        setShowPassword(false); 
    } 
  }, [isLoginPortalVisible]);

  // REAL-TIME DATABASE LOGIN
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (userCaptcha.toUpperCase() !== captchaCode.toUpperCase()) {
      alert("Invalid Captcha!");
      generateCaptcha();
      return;
    }

    try {
      const response = await axios.post("https://multicourier-backend.onrender.com/login", {
        username: userIdInput,
        password: passwordInput
      });

      if (response.data.success) {
        const userRoleFromDB = response.data.role; 
        const selectedRole = role === "Franchisee Login" ? "Franchisee" : "Internal Admin";

        if (userRoleFromDB === selectedRole) {
          localStorage.setItem("userRole", userRoleFromDB);
          localStorage.setItem("userName", response.data.username);
          navigate("/dashboard");
        } else {
          alert(`Access Denied: Registered as ${userRoleFromDB}. Please select the correct role from dropdown.`);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || "Invalid User ID or Password!");
      generateCaptcha();
    }
  };

  const handleChatSend = (e) => {
    if (e.key === 'Enter' && chatMsg.trim()) {
      const userMessage = chatMsg.trim();
      const msg = userMessage.toLowerCase();
      setChatHistory(prev => [...prev, { type: 'user', text: userMessage }]);
      setChatMsg("");
      setTimeout(() => {
        let botResponse = "";
        if (msg.includes("hin")) {
          setLanguage("hi");
          botResponse = "नमस्ते! मैं क्या मदद करूँ? आप 'Pincode', 'Track' या 'Ticket' के बारे में पूछ सकते हैं।";
        } else if (msg.includes("eng")) {
          setLanguage("en");
          botResponse = "Great! How can I help? You can check 'Pincode', 'Track ID', or 'Raise Ticket'.";
        } else if (msg.includes("number") || msg.includes("call") || msg.includes("contact")) {
          botResponse = language === "hi" ? "हमारे एक्सपर्ट्स से बात करने के लिए +91 98765-43210 पर call करें। 📞" : "Call our dedicated support line at +91 98765-43210 for immediate assistance. 📞";
        } else if (msg.includes("late") || msg.includes("lost") || msg.includes("shikayat") || msg.includes("issue")) {
          const tId = Math.floor(1000 + Math.random() * 9000);
          botResponse = language === "hi" ? `असुविधा के लिए खेद है। टिकट ID: #MC-${tId} बना दिया गया है। सपोर्ट टीम जल्द 011-4569-3500 से कॉल करेगी। ⚠️` : `Sorry for the delay. Ticket #MC-${tId} is raised. Our team will call you back from 011-4569-3500 soon. ⚠️`;
        } else if (msg.includes("thx") || msg.includes("thank") || msg.includes("shukriya") || msg.includes("dhanyawad")) {
          botResponse = language === "hi" ? "आपका बहुत-बहुत धन्यवाद! क्या मैं कुछ और सहायता कर सकता हूँ? 😊" : "You're most welcome! Is there anything else I can help you with? 😊";
        } else if (msg.length === 6 && !isNaN(msg)) {
          botResponse = `Service is ACTIVE for Pin Code ${msg}. ✅`;
        } else {
          botResponse = language === "hi" ? "क्षमा करें, मैं समझ नहीं पाया। कृपया स्पष्ट लिखें या +91 98765-43210 पर कॉल करें।" : "I'm sorry, I didn't catch that. Please be specific or call us at +91 98765-43210.";
        }
        setChatHistory(prev => [...prev, { type: 'bot', text: botResponse }]);
      }, 800);
    }
  };

  const closeLogin = () => {
    setIsLoginPortalVisible(false);
    if (setExternalLoginOpen) setExternalLoginOpen(false);
  };

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <img src={truckLoading} alt="Loading..." style={{ width: "150px", animation: "moveTruck 1.5s infinite" }} />
        <h2 style={{ marginTop: "20px", fontFamily: 'sans-serif', fontWeight: 'bold', color: "#000" }}>LOADING...</h2>
        <style>{`@keyframes moveTruck { 0% { transform: translateX(-20px); } 50% { transform: translateX(20px); } 100% { transform: translateX(-20px); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh", fontFamily: "'Poppins', sans-serif" }}>
      
      {/* Login Portal */}
      {isLoginPortalVisible && (
        <div onClick={closeLogin} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 30000 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "#fff", width: "90%", maxWidth: "400px", borderRadius: "10px", overflow: "hidden", position: "relative" }}>
            <button onClick={closeLogin} style={{ position: "absolute", top: "15px", right: "15px", background: "none", border: "none", color: "#666", fontSize: "20px", cursor: "pointer", zIndex: 30001 }}>✕</button>

            <div style={{ backgroundColor: "#000", color: "#fff", padding: "20px", textAlign: "center" }}>
              <h3 style={{ margin: 0 }}>PARTNER PORTAL</h3>
            </div>

            <form style={{ padding: "30px" }} onSubmit={handleLoginSubmit}>
              <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: "100%", padding: "12px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ddd", outline: 'none' }}>
                <option value="Franchisee Login">Franchisee Login</option>
                <option value="Internal Admin">Internal Admin</option>
              </select>
              
              <input type="text" placeholder="User ID" required value={userIdInput} onChange={(e) => setUserIdInput(e.target.value)} style={{ width: "100%", padding: "12px", marginBottom: "12px", border: "1px solid #ddd", borderRadius: "5px", outline: 'none' }} />
              
              <div style={{ position: "relative", marginBottom: "15px" }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  required 
                  value={passwordInput} 
                  onChange={(e) => setPasswordInput(e.target.value)} 
                  style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "5px", outline: 'none', boxSizing: "border-box", paddingRight: "45px" }} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#666" }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <div style={{ flex: 1, background: "#eee", padding: "12px", textAlign: "center", fontWeight: "bold", border: "1px dashed #999" }}>{captchaCode}</div>
                <input type="text" placeholder="Captcha" required value={userCaptcha} onChange={(e) => setUserCaptcha(e.target.value)} style={{ flex: 1, padding: "12px", border: "1px solid #ddd", borderRadius: "5px", outline: 'none' }} />
              </div>
              <button type="submit" style={{ width: "100%", padding: "14px", backgroundColor: "#000", color: "#fff", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer", marginBottom: "15px" }}>SIGN IN</button>
              <button type="button" onClick={closeLogin} style={{ width: "100%", padding: "10px", backgroundColor: "transparent", color: "#666", border: "1px solid #ddd", borderRadius: "5px", fontSize: "13px", cursor: "pointer" }}>BACK TO HOME</button>
            </form>
          </div>
        </div>
      )}

      {/* Fraud Warning */}
      {showWarning && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10000 }}>
          <div style={{ backgroundColor: "#fff", width: "95%", maxWidth: "780px", borderRadius: "12px", display: "flex", flexDirection: "row", flexWrap: "wrap", overflow: "hidden", position: "relative" }}>
            <button onClick={() => setShowWarning(false)} style={{ position: "absolute", top: "15px", right: "20px", border: "none", background: "none", fontSize: "24px", cursor: "pointer", zIndex: 10 }}>✕</button>
            <div style={{ flex: "1 1 300px", padding: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={warningTruck} alt="Warning" style={{ width: "100%", maxWidth: "300px" }} />
            </div>
            <div style={{ flex: "1 1 300px", padding: "40px" }}>
              <h3 style={{ fontWeight: "bold", marginBottom: "15px" }}>Fraud Awareness</h3>
              <div style={{ backgroundColor: "#ff0000", color: "#fff", padding: "20px", borderRadius: "12px", fontSize: "14px", lineHeight: "1.6" }}>
                <strong>Public Notice:</strong> Multi Courier never asks customers to pay online or share an OTP/UPI pin.
              </div>
              <button onClick={() => setShowWarning(false)} style={{ marginTop: "25px", padding: "12px", backgroundColor: "#000", color: "#fff", width: "100%", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>I UNDERSTAND</button>
            </div>
          </div>
        </div>
      )}

      <Navbar onLoginClick={() => setIsLoginPortalVisible(true)} />
      <div id="home-section"><HeroSection /></div>

      {/* Services Section */}
      <div id="services-section" style={{ padding: "80px 20px", backgroundColor: "#f9f9f9", textAlign: "center" }}>
          <h2 style={{ fontSize: "2.2rem", fontWeight: "700", marginBottom: "10px" }}>Next-Gen Logistics, Tailored For You</h2>
          <p style={{ color: "#666", marginBottom: "45px" }}>Revolutionising The Local Logistics Landscape</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px", maxWidth: "1200px", margin: "0 auto" }}>
              <div style={cardStyle}>
                <div style={{fontSize: "40px", marginBottom: "15px"}}>🚚</div>
                <h3 style={{marginBottom: "10px"}}>Domestic Delivery</h3>
                <p style={{fontSize: "14px", color: "#555"}}>Ensure swift and secure deliveries throughout India with competitive rates.</p>
              </div>
              <div style={cardStyle}>
                <div style={{fontSize: "40px", marginBottom: "15px"}}>🌐</div>
                <h3 style={{marginBottom: "10px"}}>International Shipping</h3>
                <p style={{fontSize: "14px", color: "#555"}}>Seamless shipping to 190+ countries with prompt customs clearance.</p>
              </div>
              <div style={cardStyle}>
                <div style={{fontSize: "40px", marginBottom: "15px"}}>🛡️</div>
                <h3 style={{marginBottom: "10px"}}>Transit Protection</h3>
                <p style={{fontSize: "14px", color: "#555"}}>Comprehensive protection for your valuable shipments during transit.</p>
              </div>
          </div>
      </div>

      <div id="tracking-section"><Features /></div>
      <div id="contact-section"><Footer /></div>

      {/* Chatbot */}
      <div style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 999 }}>
        {isChatOpen && (
          <div style={{ width: "320px", height: "450px", backgroundColor: "#fff", borderRadius: "20px", boxShadow: "0 15px 40px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #eee", marginBottom: "15px" }}>
            <div style={{ padding: "15px 20px", backgroundColor: "#000", color: "#fff", fontWeight: "bold", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Support Bot</span>
              <button onClick={() => setIsChatOpen(false)} style={{ background: "none", border: "none", color: "#fff", fontSize: "18px", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ flex: 1, padding: "15px", overflowY: "auto", display: 'flex', flexDirection: 'column', gap: '12px', background: '#f9f9f9' }}>
              {chatHistory.map((m, i) => (
                <div key={i} style={{ alignSelf: m.type === 'bot' ? 'flex-start' : 'flex-end', background: m.type === 'bot' ? '#fff' : '#000', color: m.type === 'bot' ? '#333' : '#fff', padding: '10px 14px', borderRadius: '15px', maxWidth: '85%', fontSize: '13px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  {m.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: "15px", background: "#fff", borderTop: "1px solid #eee" }}>
              <input type="text" placeholder="Type here..." value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} onKeyDown={handleChatSend} style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "10px", outline: 'none' }} />
            </div>
          </div>
        )}
        <button onClick={() => setIsChatOpen(!isChatOpen)} style={{ width: "65px", height: "65px", borderRadius: "50%", backgroundColor: "#000", color: "#fff", border: "none", fontSize: "28px", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}>💬</button>
      </div>
    </div>
  );
}

const cardStyle = { backgroundColor: "#fff", padding: "40px 30px", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", transition: "0.3s", cursor: "default" };

export default Home;