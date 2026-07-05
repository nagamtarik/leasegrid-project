import React, { useState, useEffect } from "react";
import { INITIAL_SPACES } from "./lib/theme";
import { generateSmartNotification } from "./lib/aiEngine";

export default function App() {
  const [user, setUser] = useState(null);
  const [spaces] = useState(INITIAL_SPACES);
  const [occupancyStatus, setOccupancyStatus] = useState({});
  const [message, setMessage] = useState("");

  /* ---------------- SAFE USER LOAD ---------------- */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("user");
      if (saved) setUser(JSON.parse(saved));
    } catch {
      localStorage.removeItem("user");
    }
  }, []);

  /* ---------------- INIT OCCUPANCY ---------------- */
  useEffect(() => {
    const init = {};
    INITIAL_SPACES.forEach((s) => {
      init[s.id] = "available";
    });
    setOccupancyStatus(init);
  }, []);

  /* ---------------- AI NOTIFICATIONS (SAFE) ---------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      const msg = generateSmartNotification(
        spaces || [],
        occupancyStatus || {}
      );

      if (msg) setMessage(msg);
    }, 5000);

    return () => clearInterval(interval);
  }, [spaces, occupancyStatus]);

  function login() {
    const demoUser = { name: "Test User", phone: "000" };
    localStorage.setItem("user", JSON.stringify(demoUser));
    setUser(demoUser);
  }

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
  }

  if (!user) {
    return (
      <div style={{ padding: 40 }}>
        <h1>App is running ✅</h1>
        <button onClick={login}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Welcome {user.name} ✅</h1>

      <button onClick={logout}>Logout</button>

      <hr />

      {message && (
        <div style={{ marginTop: 20, padding: 10, background: "#eee" }}>
          {message}
        </div>
      )}
    </div>
  );
}