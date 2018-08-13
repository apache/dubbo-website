import React from 'react';
import { autobind } from 'core-decorators';
import { getLink } from '../../../utils';

import './blogItem.scss';

@autobind
class BlogItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHovered: false,
    };
  }

  onMouseOver() {
    this.setState({
      isHovered: true,
    });
  }

  onMouseOut() {
    this.setState({
      isHovered: false,
    });
  }

  render() {
    const { dataSource } = this.props;
    const { link, target, title, author, companyIcon, companyIconHover, dateStr, desc } = dataSource;
    const { isHovered } = this.state;
    return (
      <a
        href={getLink(link)}
        target={target || '_self'}
        className="blog-item"
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut}
      >
        <div className="title">
        <img src={isHovered ? `${window.rootPath}/img/docs_hover.png` : `${window.rootPath}/img/docs_normal.png`} />
          <span>{title}</span>
        </div>
        <div className="brief-info">
          <span className="author">{author}</span>
          {
            companyIcon ? <img src={isHovered ? `${window.rootPath}${companyIconHover}` : `${window.rootPath}${companyIcon}`} /> : null
          }
          <span className="date">{dateStr}</span>
        </div>
        <p>{desc}</p>
      </a>
    );
  }
}

export default BlogItem;
