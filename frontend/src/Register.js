import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import service from './service.js';

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    
    // שליחת בקשת הרשמה לשרת
    await service.register(username, password);
    navigate("/login");
  }

  return (
    <section className="todoapp">
      <header className="header">
        <h1>Register</h1>
        <form onSubmit={handleRegister}>
          <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">Register</button>
        </form>
        <button onClick={() => navigate("/login")}>Back to Login</button>
      </header>
    </section>
  );
}

export default Register;