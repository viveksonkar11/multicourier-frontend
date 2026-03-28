import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./Home";
import ResultPage from "./ResultPage";
import AdminDashboard from "./AdminDashboard";
import Navbar from "./components/Navbar";

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true); 
  const location = useLocation();

  const isDashboardPage = location.pathname === "/dashboard";

  
  useEffect(() => {
    setIsAppLoading(true);
  }, [location.pathname]);

  return (
    <>
      
      {!isDashboardPage && !isAppLoading && (
        <Navbar onLoginClick={() => setIsLoginOpen(true)} />
      )}

      <Routes>
        <Route 
          path="/" 
          element={
            <Home 
              isLoginOpen={isLoginOpen} 
              setIsLoginOpen={setIsLoginOpen} 
              setAppLoading={setIsAppLoading} 
            />
          } 
        />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
      </Routes>
    </>
  );
}

export default App;