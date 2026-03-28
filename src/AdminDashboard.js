import React, { useState, useEffect, useCallback } from "react";

import { 
  Eye, EyeOff, Trash2, AlertTriangle, X, Menu, 
  LogOut, LayoutDashboard, MapPin, Users, PlusCircle 
} from "lucide-react"; 

function AdminDashboard() {
  // --- States ---
  const [activeTab, setActiveTab] = useState("dashboard");
  const [shipments, setShipments] = useState([]); 
  const [partners, setPartners] = useState([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [latestId, setLatestId] = useState("---");
  const [showModal, setShowModal] = useState(false); 
  const [showPartnerModal, setShowPartnerModal] = useState(false); 
  const [formData, setFormData] = useState({ from: "", to: "", courier: "Amazon" });
  
  const [partnerData, setPartnerData] = useState({ username: "", password: "" }); 
  const [visiblePasswords, setVisiblePasswords] = useState({}); 

  const [showRegPassword, setShowRegPassword] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: "" });

  // Mobile Sidebar Toggle State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  // Resize Listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
      if (window.innerWidth > 1024) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeResizeListener("resize", handleResize);
  }, []);

  // --- Auth logic ---
  const userRole = localStorage.getItem("userRole") || "Franchisee";
  const userName = localStorage.getItem("userName") || "Guest_Hub"; 

  const courierList = ["Amazon", "BlueDart", "Delhivery", "DHL", "DTDC", "Ekart", "FedEx", "Trackon"];

  // --- Password Toggle Logic for Table ---
  const togglePassword = (id) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Data Fetching ---
  const fetchAllData = useCallback(async () => {
    if (showModal || showPartnerModal || deleteModal.show) return;
    
    try {
      const response = await fetch("https://multicourier-backend.onrender.com/all-trackings");
      if (!response.ok) throw new Error("Server down");
      const data = await response.json();
      setShipments(data); 

      const myData = userRole === "Internal Admin" ? data : data.filter(s => s.bookedBy === userName);
      if(myData.length > 0) {
          setLatestId(myData[0].trackingNumber); 
      } else {
          setLatestId("No Bookings");
      }

      if(userRole === "Internal Admin") {
        const pRes = await fetch("https://multicourier-backend.onrender.com/all-partners"); 
        if(pRes.ok) {
          const pData = await pRes.json();
          setPartners(pData);
        }
      }
    } catch (err) { 
      console.log("Database connection error");
    }
  }, [userRole, userName, showModal, showPartnerModal, deleteModal.show]);

  useEffect(() => { 
    fetchAllData(); 
    const interval = setInterval(() => {
        fetchAllData();
    }, 5000); 
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // --- Action Handlers ---

  const confirmDelete = async () => {
    try {
      const response = await fetch(`https://multicourier-backend.onrender.com/delete-hub/${deleteModal.id}`, {
        method: "DELETE",
      });
      if(response.ok) {
        setDeleteModal({ show: false, id: null, name: "" });
        fetchAllData(); 
      }
    } catch (err) { alert("Delete failed"); }
  };

  const handleAddPartner = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://multicourier-backend.onrender.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            username: partnerData.username, 
            password: partnerData.password, 
            role: "Franchisee" 
        })
      });
      if(response.ok) {
        setShowPartnerModal(false);
        setPartnerData({ username: "", password: "" });
        setShowRegPassword(false);
        fetchAllData(); 
        alert("Hub Registered Successfully!");
      } else {
        const errData = await response.json();
        alert(errData.message || "Registration failed");
      }
    } catch (err) { alert("Error adding partner"); }
  };

  // --- FIX APPLIED HERE: STATUS UPDATE LOGIC ---
  const handleStatusUpdate = async (trackingNo, newStatus) => {
    // 1. UI ko turant update karein
    setShipments(prev => 
      prev.map(s => s.trackingNumber === trackingNo ? { ...s, status: newStatus } : s)
    );

    try {
      const response = await fetch(`https://multicourier-backend.onrender.com/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber: trackingNo, status: newStatus })
      });
      
      if (!response.ok) {
        alert("Update failed on server!");
        fetchAllData(); // Fail hone par database se sahi data layein
      } else {
        console.log("Status updated successfully");
      }
    } catch (err) { 
      alert("Network Error!"); 
      fetchAllData();
    }
  };

  const generateNewID = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("https://multicourier-backend.onrender.com/create-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, bookedBy: userName })
      });
      if(response.ok) {
        const data = await response.json();
        alert(` Generated ID: ${data.trackingNumber}`);
        setShowModal(false);
        setFormData({ from: "", to: "", courier: "Amazon" }); 
        fetchAllData(); 
      }
    } catch (err) { alert("Booking failed!"); }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/"; 
  };

  const displayShipments = shipments
    .filter(s => userRole === "Internal Admin" ? true : s.bookedBy === userName)
    .filter(s => s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', flexDirection: isMobile ? 'column' : 'row' }}>
      
      {/* MOBILE HEADER BAR */}
      {isMobile && (
        <div style={{ background: '#0f172a', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', position: 'sticky', top: 0, zIndex: 1000 }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>MULTI COURIER</h3>
          <Menu onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ cursor: 'pointer' }} />
        </div>
      )}

      {/* SIDEBAR */}
      <div style={{ 
        width: isMobile ? '100%' : '280px', 
        backgroundColor: '#0f172a', 
        color: '#fff', 
        padding: '30px', 
        position: isMobile ? (isSidebarOpen ? 'fixed' : 'hidden') : 'fixed', 
        height: isMobile ? 'auto' : '100vh', 
        zIndex: 900,
        display: isMobile && !isSidebarOpen ? 'none' : 'block',
        top: isMobile ? '58px' : 0,
        left: 0,
        boxSizing: 'border-box'
      }}>
        {!isMobile && <h2 style={{ marginBottom: '10px', letterSpacing: '1px' }}>MULTI COURIER</h2>}
        
        <div style={{ marginBottom: '30px', padding: '15px', background: '#1e293b', borderRadius: '12px', borderLeft: '4px solid #fbbf24' }}>
            <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0, fontWeight: 'bold' }}>HUB SESSION</p>
            <p style={{ fontSize: '16px', color: '#fff', fontWeight: 'bold', margin: '5px 0' }}>{userRole === "Internal Admin" ? " System Director" : userName}</p>
            <p style={{ fontSize: '10px', color: '#fbbf24', margin: 0 }}>{userRole}</p>
        </div>
        
        <div onClick={() => { setActiveTab("dashboard"); setIsSidebarOpen(false); }} style={{ padding: '15px', cursor: 'pointer', background: activeTab === "dashboard" ? '#334155' : '', borderRadius: '8px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}> <LayoutDashboard size={18} /> Dashboard</div>
        <div onClick={() => { setActiveTab("shipments"); setIsSidebarOpen(false); }} style={{ padding: '15px', cursor: 'pointer', background: activeTab === "shipments" ? '#334155' : '', borderRadius: '8px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}> <MapPin size={18} /> {userRole === "Internal Admin" ? "Global Shipments" : "My Shipments"}</div>
        
        {userRole === "Internal Admin" && (
          <div onClick={() => { setActiveTab("manage_partners"); setIsSidebarOpen(false); }} style={{ padding: '15px', cursor: 'pointer', background: activeTab === "manage_partners" ? '#334155' : '', borderRadius: '8px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '10px' }}> <Users size={18} /> Manage Partners</div>
        )}
        
        <div onClick={handleLogout} style={{ padding: '15px', cursor: 'pointer', color: '#fb7185', marginTop: '20px', borderTop: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '10px' }}> <LogOut size={18} /> Logout</div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ 
        flex: 1, 
        padding: isMobile ? '20px' : '40px 60px', 
        marginLeft: isMobile ? '0' : '280px', 
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '40px', gap: '20px' }}>
          <h1 style={{ margin: 0, fontSize: isMobile ? '24px' : '32px', fontWeight: '900', color: '#0f172a' }}>
              {activeTab === "dashboard" ? "Dashboard" : activeTab === "manage_partners" ? "Hub Management" : "Shipment Logs"}
          </h1>
          {activeTab === "shipments" && (
            <input type="text" placeholder="Search Tracking..." style={{ padding: '12px 20px', width: isMobile ? '100%' : '320px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} onChange={(e) => setSearchTerm(e.target.value)} />
          )}
        </div>

        {activeTab === "dashboard" ? (
          <div>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '25px', marginBottom: '35px' }}>
                <div style={{ background: '#fff', padding: '30px', borderRadius: '18px', flex: 1, boxShadow: '0 5px 15px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '800' }}>LATEST ID</p>
                    <h2 style={{ color: '#2563eb', fontSize: isMobile ? '28px' : '36px', margin: '10px 0' }}>{latestId}</h2>
                </div>
                <div style={{ background: '#fff', padding: '30px', borderRadius: '18px', flex: 1, boxShadow: '0 5px 15px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '800' }}>TOTAL BOOKINGS</p>
                    <h2 style={{ color: '#10b981', fontSize: isMobile ? '28px' : '36px', margin: '10px 0' }}>{displayShipments.length}</h2>
                </div>
            </div>
            <div style={{ background: '#fff', padding: isMobile ? '40px 20px' : '80px', borderRadius: '25px', textAlign: 'center', boxShadow: '0 15px 35px rgba(0,0,0,0.04)' }}>
                {userRole !== "Internal Admin" ? (
                  <>
                    <h3 style={{ fontSize: isMobile ? '20px' : '24px' }}>Welcome back, {userName}!</h3>
                    <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '14px' }}>Ready to manage your hub's logistics today?</p>
                    <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '0 auto', padding: '18px 30px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', width: isMobile ? '100%' : 'auto' }}> <PlusCircle size={20} /> GENERATE NEW ID</button>
                  </>
                ) : (
                  <p style={{ color: '#475569', fontSize: '18px' }}>Admin Control Panel: Monitor all franchisee activities globally.</p>
                )}
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff', padding: isMobile ? '15px' : '30px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '800px' : '1000px' }}>
                <thead>
                    <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                        {activeTab === "manage_partners" ? (
                          <>
                            <th style={{ padding: '15px' }}>SR NO.</th>
                            <th style={{ padding: '15px' }}>HUB NAME</th>
                            <th style={{ padding: '15px' }}>PASSWORD</th>
                            <th style={{ padding: '15px' }}>TOTAL ID'S</th>
                            <th style={{ padding: '15px' }}>STATUS</th>
                            <th style={{ padding: '15px' }}>ACTION</th>
                          </>
                        ) : (
                          <>
                            <th style={{ padding: '15px' }}>TRACKING ID</th>
                            <th style={{ padding: '15px' }}>COURIER</th>
                            <th style={{ padding: '15px' }}>STATUS</th>
                            <th style={{ padding: '15px' }}>ROUTE</th>
                            {userRole === "Internal Admin" && <th style={{ padding: '15px' }}>BOOKED BY</th>}
                            <th style={{ padding: '15px' }}>DATE & TIME</th>
                            {userRole === "Internal Admin" && <th style={{ padding: '15px' }}>ACTION</th>}
                          </>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {activeTab === "manage_partners" ? (
                      partners.map((p, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '15px' }}>{i + 1}</td>
                          <td style={{ padding: '15px', fontWeight: 'bold' }}>{p.username}</td>
                          <td style={{ padding: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontFamily: 'monospace', fontSize: '14px', width: '100px', letterSpacing: visiblePasswords[p.username] ? '0' : '2px' }}>
                                {visiblePasswords[p.username] ? p.password : "••••••••"}
                              </span>
                              <button onClick={() => togglePassword(p.username)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                                {visiblePasswords[p.username] ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: '15px', fontWeight: 'bold' }}>{p.shipmentCount || 0}</td>
                          <td style={{ padding: '15px' }}><span style={{ color: '#10b981', fontWeight: 'bold' }}>● Active</span></td>
                          <td style={{ padding: '15px' }}>
                             <button onClick={() => setDeleteModal({ show: true, id: p._id, name: p.username })} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      displayShipments.map((s, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '15px', fontWeight: 'bold', color: '#2563eb' }}>{s.trackingNumber}</td>
                            <td style={{ padding: '15px' }}>{s.courier}</td>
                            <td style={{ padding: '15px' }}>
                                <span style={{ background: s.status === 'Delivered' ? '#dcfce7' : '#e0f2fe', color: s.status === 'Delivered' ? '#166534' : '#0369a1', padding: '6px 12px', borderRadius: '25px', fontSize: '11px', fontWeight: 'bold' }}>{s.status}</span>
                            </td>
                            <td style={{ padding: '15px' }}>{s.from} ➔ {s.to}</td>
                            {userRole === "Internal Admin" && <td style={{ padding: '15px', color: '#64748b', fontWeight: 'bold' }}>{s.bookedBy}</td>}
                            <td style={{ padding: '15px', fontSize: '11px' }}>{new Date(s.createdAt).toLocaleString('en-IN')}</td>
                            {userRole === "Internal Admin" && (
                                <td style={{ padding: '15px' }}>
                                    <select 
                                      style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }} 
                                      value={s.status} 
                                      onChange={(e) => handleStatusUpdate(s.trackingNumber, e.target.value)}
                                    >
                                        <option value="Booked">Booked</option>
                                        <option value="In Transit">In Transit</option>
                                        <option value="Out for Delivery">Out for Delivery</option> 
                                        <option value="Delivered">Delivered</option>
                                    </select>
                                </td>
                            )}
                        </tr>
                      ))
                    )}
                </tbody>
            </table>
            {activeTab === "manage_partners" && (
                <div style={{ textAlign: 'center', marginTop: '25px' }}>
                 <button onClick={() => setShowPartnerModal(true)} style={{ padding: '15px 30px', background: '#fbbf24', color: '#000', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', width: isMobile ? '100%' : 'auto' }}>+ ADD NEW HUB</button>
               </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      {[
        { show: deleteModal.show, content: (
          <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', width: isMobile ? '90%' : '400px', textAlign: 'center' }}>
            <div style={{ background: '#fee2e2', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px' }}><AlertTriangle size={32} color="#ef4444" /></div>
            <h3>Delete Hub Account?</h3>
            <p style={{ fontSize: '14px', marginBottom: '25px' }}>Delete <b>{deleteModal.name}</b> permanently?</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setDeleteModal({ show: false, id: null, name: "" })} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmDelete} style={{ flex: 1, padding: '12px', background: '#ef4444', color: '#fff', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        )},
        { show: showPartnerModal, content: (
          <div style={{ background: '#fff', padding: isMobile ? '25px' : '40px', borderRadius: '24px', width: isMobile ? '90%' : '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}><h2>New Hub</h2><X onClick={() => setShowPartnerModal(false)} style={{ cursor: 'pointer' }} /></div>
            <form onSubmit={handleAddPartner}><input type="text" placeholder="Hub Name" required style={{ width: '100%', padding: '15px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #ddd', boxSizing: 'border-box' }} onChange={(e) => setPartnerData({...partnerData, username: e.target.value})} />
            <div style={{ position: 'relative', marginBottom: '25px' }}><input type={showRegPassword ? "text" : "password"} placeholder="Password" required style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #ddd', boxSizing: 'border-box' }} onChange={(e) => setPartnerData({...partnerData, password: e.target.value})} /><button type="button" onClick={() => setShowRegPassword(!showRegPassword)} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none' }}>{showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
            <button type="submit" style={{ width: '100%', padding: '16px', background: '#fbbf24', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}>CREATE HUB</button></form>
          </div>
        )},
        { show: showModal, content: (
          <div style={{ background: '#fff', padding: isMobile ? '25px' : '40px', borderRadius: '24px', width: isMobile ? '90%' : '420px' }}>
            <h2 style={{ textAlign: 'center' }}>Booking</h2>
            <form onSubmit={generateNewID}><input type="text" placeholder="Origin" required style={{ width: '100%', padding: '15px', marginBottom: '12px', borderRadius: '12px', border: '1px solid #ddd', boxSizing: 'border-box' }} onChange={(e) => setFormData({...formData, from: e.target.value})} />
            <input type="text" placeholder="Destination" required style={{ width: '100%', padding: '15px', marginBottom: '12px', borderRadius: '12px', border: '1px solid #ddd', boxSizing: 'border-box' }} onChange={(e) => setFormData({...formData, to: e.target.value})} />
            <select style={{ width: '100%', padding: '15px', marginBottom: '25px', borderRadius: '12px', border: '1px solid #ddd' }} onChange={(e) => setFormData({...formData, courier: e.target.value})}>{courierList.map(c => <option key={c} value={c}>{c}</option>)}</select>
            <button type="submit" style={{ width: '100%', padding: '16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}>CONFIRM</button>
            <button type="button" onClick={() => setShowModal(false)} style={{ width: '100%', marginTop: '10px', background: 'none', border: 'none' }}>Discard</button></form>
          </div>
        )}
      ].map((m, idx) => m.show && (
        <div key={idx} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          {m.content}
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;