import React from 'react';
import classnames from 'classnames';
import './index.scss';

const Button = (props) => {
  return (
    <a
      className={
        classnames({
          button: true,
          [`button-${props.type}`]: true,
        })
      }
      target="__blank"
      href={props.link}
    >
      {props.children}
    </a>
  );
};

export default Button;