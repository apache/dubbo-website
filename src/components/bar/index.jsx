import React from 'react';
import classnames from 'classnames';
import './index.scss';

export default function Bar(props) {
  const { text, img } = props;
  const cls = classnames({
    bar: true,
  });
  return (
    <div className={cls}>
      <div className="bar-body">
        <img src={img} className="front-img" />
        <span>{text}</span>
        <img src={img} className="back-img" />
      </div>
    </div>
  );
}
