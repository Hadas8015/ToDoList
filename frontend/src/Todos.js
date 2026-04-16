import React, { useEffect, useState } from 'react';
import service from './service.js';

function App() {
  const [newTodo, setNewTodo] = useState(""); // שם המשימה החדשה שהמשתמש מקליד
  const [todos, setTodos] = useState([]); // רשימת כל המשימות
  const username = localStorage.getItem("username"); // שם המשתמש המחובר

  // שליפת כל המשימות מהשרת
  async function getTodos() {
    const todos = await service.getTasks();
    setTodos(todos);
  }

  // יצירת משימה חדשה
  async function createTodo(e) {
    e.preventDefault();
    await service.addTask(newTodo);
    setNewTodo("");
    await getTodos();
  }

  // עדכון סטטוס משימה (הושלמה/לא הושלמה)
  async function updateCompleted(todo, isComplete) {
    await service.setCompleted(todo.id, isComplete, todo.name);
    await getTodos(); // רענון הרשימה
  }

  // מחיקת משימה
  async function deleteTodo(id) {
    await service.deleteTask(id);
    await getTodos(); // רענון הרשימה
  }

  // טעינת המשימות בעת עליית הקומפוננטה
  useEffect(() => {
    getTodos();
  }, []);

  return (
    <section className="todoapp">
      <header className="header">
        {/* הצגת שם המשתמש המחובר */}
        <h1>שלום {username}!</h1>
        {/* כפתור התנתקות - מנקה את ה-localStorage ומעביר לדף לוגין */}
        <button type="button" onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          window.location.href = "/login";
        }}>Logout</button>
        {/* טופס הוספת משימה חדשה */}
        <form onSubmit={createTodo}>
          <input className="new-todo" placeholder="Well, let's take on the day" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} />
        </form>
      </header>

      <section className="main" style={{ display: "block" }}>
        <ul className="todo-list">
          {/* רינדור רשימת המשימות */}
          {todos.map(todo => {
            return (
              // הוספת קלאס completed אם המשימה הושלמה
              <li className={todo.isComplete ? "completed" : ""} key={todo.id}>
                <div className="view">
                  {/* צ'קבוקס לסימון משימה כהושלמה */}
                  <input className="toggle" type="checkbox" id={`todo-${todo.id}`} checked={todo.isComplete || false} onChange={(e) => updateCompleted(todo, e.target.checked)} />
                  
                  {/* שם המשימה */}
                  <label htmlFor={`todo-${todo.id}`}>{todo.name}</label>
                  
                  {/* כפתור מחיקה */}
                  <button className="destroy" onClick={() => deleteTodo(todo.id)}></button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </section>
  );
}

export default App;