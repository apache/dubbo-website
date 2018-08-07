import React from 'react';

const ContributorItem = (props) => {
  const { contributor } = props;
  const { img, title, content } = contributor;
  return (
    <div className="contributor-item">
      <img src={img} />
      <div>{title}</div>
      <p>{content}</p>
    </div>
  );
};

export default ContributorItem;
