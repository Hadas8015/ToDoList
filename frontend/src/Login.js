import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import service from './service.js';

// מקבל עדכון ה state אחרי התחברות
function Login({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    
    // שליחת בקשת התחברות לשרת
    const token = await service.login(username, password);
    
    if (token) {
      // שמירת הטוקן ושם המשתמש ב-localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      // עדכון ה-state
      setToken(token);
      navigate("/");
    }
  }

  return (
    <section className="todoapp">
      <header className="header">
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">Login</button>
        </form>
        <button onClick={() => navigate("/register")}>Register</button>
      </header>
    </section>
  );
}

export default Login;