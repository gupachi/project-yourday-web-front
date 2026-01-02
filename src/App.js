import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Welcome from './pages/Welcome/Welcome';
import Main from './pages/Main/Main';
import WriteMessage from './pages/WriteMessage/WriteMessage';
import CreateUser from './pages/CreateUser/CreateUser';
import Comments from './pages/Comments/Comments';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/create-user" element={<CreateUser />} />
          <Route path="/write" element={<WriteMessage />} />
          <Route path="/comments/:link" element={<Comments />} />
          <Route path="/:link" element={<Main />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
