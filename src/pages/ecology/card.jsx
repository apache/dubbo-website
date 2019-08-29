import React from 'react';

const Card = (props) => {
  const { title, children } = props;
  return (
    <div className="card">
      <h3 className="card-title">{title}</h3>
      <div className="card-content">{children}</div>
    </div>
  );
};

export default Card;
