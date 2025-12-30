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
          <Route path="/main/:link" element={<Main />} />
          <Route path="/write/:link" element={<WriteMessage />} />
          <Route path="/comments/:link" element={<Comments />} />
          <Route path="/create-user" element={<CreateUser />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
