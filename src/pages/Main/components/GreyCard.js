import React from 'react';
import './GreyCard.css';

const GreyCard = ({ name, contents, onEdit, onDelete }) => {
  return (
    <div className="grey-card">
      <div className="grey-card-header">
        <h3 className="grey-card-name">{name}</h3>
        <div className="grey-card-actions">
          <button
            className="action-button edit-button"
            onClick={onEdit}
            aria-label="수정"
            title="수정"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button
            className="action-button delete-button"
            onClick={onDelete}
            aria-label="삭제"
            title="삭제"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      </div>
      <div className="grey-card-contents">
        {contents}
      </div>
    </div>
  );
};

export default GreyCard;
