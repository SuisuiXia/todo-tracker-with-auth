import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import TodoTracker from './components/TodoTracker';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header>
          <h1>Todo Tracker</h1>
          <p className="slogan">Make Everything Planned</p>
        </header>
        <Routes>
          <Route path="/" element={<Signup />} /> 
          <Route path="/signup" element={<Signup />} /> 
          <Route path="/login" element={<Login />} /> 
          <Route path="/todo" element={<TodoTracker />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;
