import React from 'react';
import './GreyCard.css';

const GreyCard = ({ name, contents }) => {
  return (
    <div className="grey-card">
      <h3 className="grey-card-name">{name}</h3>
      <div className="grey-card-contents">
        {contents}
      </div>
    </div>
  );
};

export default GreyCard;
