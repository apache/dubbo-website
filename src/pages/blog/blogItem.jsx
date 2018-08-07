import React from 'react';
import { Link } from 'react-router-dom';
import { autobind } from 'core-decorators';

import './blogItem.scss';


class BlogItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHovered: false,
    };
  }

  @autobind
  onMouseOver() {
    this.setState({
      isHovered: true,
    });
  }

  @autobind
  onMouseOut() {
    this.setState({
      isHovered: false,
    });
  }

  render() {
    const { dataSource } = this.props;
    const { link, title, author, companyIcon, companyIconHover, dateStr, desc } = dataSource;
    const { isHovered } = this.state;
    return (
      <Link
        to={link}
        className="blog-item"
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut}
      >
        <div className="title">
          <img src={isHovered ? './img/docs_hover.png' : './img/docs_normal.png'} />
          <span>{title}</span>
        </div>
        <div className="brief-info">
          <span className="author">{author}</span>
          {
            companyIcon ? <img src={isHovered ? companyIconHover : companyIcon} /> : null
          }
          <span className="date">{dateStr}</span>
        </div>
        <p>{desc}</p>
      </Link>
    );
  }
}

export default BlogItem;
