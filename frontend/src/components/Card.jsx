import React from 'react';

const Card = ({ company }) => (
  <div className="card">
    <h3>{company.name}</h3>
    <p>{company.domain}</p>
    <p>Score: {company.score}</p>
  </div>
);

export default Card;