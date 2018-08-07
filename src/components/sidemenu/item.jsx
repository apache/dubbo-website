import React from 'react';
import { Link } from 'react-router-dom';
import { autobind } from 'core-decorators';
import classnames from 'classnames';

export default class Item extends React.Component {
  constructor(props) {
    super(props);
    const { item } = props;
    const hasChildren = item.children && item.children.length;
    let opened = props.item.opened;
    if (hasChildren) {
      if (opened === undefined) {
        // 未配置展开，则是否展开由是否选中决定
        opened = item.children.find(child => child.link === window.location.hash.split('?')[0].slice(2));
      }
    } else {
      opened = false;
    }
    this.state = {
      opened,
    };
  }

  @autobind
  onItemClick(e) {
    this.props.toggleMenuBody();
    e.stopPropagation();
  }

  @autobind
  toggle() {
    this.setState({
      opened: !this.state.opened,
    });
  }

  @autobind
  renderSubMenu(data) {
    return (
      <ul>
      {
        data.map((item, index) => (
          <li
            className={classnames({
              'menu-item': true,
              'menu-item-level-3': true,
              'menu-item-selected': item.link === window.location.hash.split('?')[0].slice(2),
            })}
            key={index}
            onClick={this.onItemClick}
          >
            <Link to={item.link}>{item.title}</Link>
          </li>
        ))
      }
      </ul>
    );
  }

  render() {
    const { item } = this.props;
    const hasChildren = item.children && item.children.length;
    const { opened } = this.state;
    const cls = classnames({
      'menu-item': true,
      'menu-item-level-2': true,
      'menu-item-selected': item.link === window.location.hash.split('?')[0].slice(2),
    });
    const style = {
      height: opened ? 36 * (item.children.length + 1) : 36,
      overflow: 'hidden',
    };
    if (hasChildren) {
      return (
        <li style={style} className={cls} onClick={this.toggle}>
        {
          <span>
            {item.title}
            <img style={{ transform: `rotate(${opened ? 0 : -90}deg)` }} className="menu-toggle" src="./img/arrow_down.png" />
          </span>
        }
        {this.renderSubMenu(item.children)}
        </li>
      );
    }
    return (
      <li style={style} className={cls} onClick={this.onItemClick}>
        <Link to={item.link}>{item.title}</Link>
      </li>
    );
  }
}
