import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Welcome from './pages/Welcome/Welcome';
import Main from './pages/Main/Main';
import WriteMessage from './pages/WriteMessage/WriteMessage';
import CreateUser from './pages/CreateUser/CreateUser';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/main" element={<Main />} />
          <Route path="/write" element={<WriteMessage />} />
          <Route path="/create-user" element={<CreateUser />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
