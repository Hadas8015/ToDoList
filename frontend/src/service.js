//ניתוב
import axios from 'axios';

//הגדרת כתובת ברירת מחדל 
axios.defaults.baseURL = "http://localhost:5238";

//לשגיאות בתשובות מהשרת
axios.interceptors.response.use(
  response => response,
  error => {
    console.log('error', error);
    // אם השרת מחזיר 401 - הטוקן פג תוקף, מעבירים ללוגין
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Interceptor להוספת הטוקן לכל בקשה
axios.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  // מוסיפים את הטוקן רק אם קיים ולא בבקשות login/register
  if (token && !config.url.includes('/login') && !config.url.includes('/register')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default {
  // שליפת כל המשימות מהשרת
  getTasks: async () => {
    const result = await axios.get('/items');
    return result.data;
  },

  // הוספת משימה חדשה
  addTask: async (name) => {
    const result = await axios.post('/items', { name });
    return result.data;
  },

  // עדכון סטטוס משימה (הושלמה/לא הושלמה)
  setCompleted: async (id, isComplete, name) => {
    const result = await axios.put(`/items/${id}`, { id, isComplete, name });
    return result.data;
  },

  // מחיקת משימה לפי ID
  deleteTask: async (id) => {
    const result = await axios.delete(`/items/${id}`);
    return result.data;
  },

  // הרשמת משתמש חדש
  register: async (username, password) => {
    const result = await axios.post('/register', { username, password });
    return result.data;
  },

  // התחברות - מחזיר טוקן JWT
  login: async (username, password) => {
    const result = await axios.post('/login', { username, password });
    return result.data.token;
  },
};