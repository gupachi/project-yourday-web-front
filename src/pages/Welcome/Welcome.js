import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

function Welcome() {
  const navigate = useNavigate();

  const handleCreatePage = () => {
    navigate('/create-user');
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1>특별한 날을 더 특별하게</h1>

        <div className="button-group">
          <button className="create-button" onClick={handleCreatePage}>
            페이지 만들기 →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
