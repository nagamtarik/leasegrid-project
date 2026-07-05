import React, { useState } from "react";

export default function App() {
  const [user] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  function login() {
    const demoUser = {
      name: "Test User",
      phone: "000",
    };
    localStorage.setItem("user", JSON.stringify(demoUser));
    window.location.reload();
  }

  function logout() {
    localStorage.removeItem("user");
    window.location.reload();
  }

  if (!user) {
    return (
      <div style={{ padding: 40 }}>
        <h1>App is running ✅</h1>
        <p>No user logged in</p>
        <button onClick={login}>Login Test</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>App is running ✅</h1>
      <p>Welcome {user.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}