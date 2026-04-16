import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Todos from './Todos.js';
import Login from './Login.js';
import Register from './Register.js';

function App() {
  // שמירת הטוקן ב-state
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    // ניווט
    <BrowserRouter>
      <Routes>
        {/* דף התחברות */}
        <Route path="/login" element={<Login setToken={setToken} />} />
        {/* דף הרשמה */}
        <Route path="/register" element={<Register />} />
        {/* דף המשימות - רק אם יש טוקן, אחרת מעביר לדף לוגין */}
        <Route path="/" element={token ? <Todos /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;