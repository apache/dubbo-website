import React from 'react';
import classnames from 'classnames';
import { autobind } from 'core-decorators';
import Item from './item.jsx';
import './index.scss';

export default class SideMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menuBodyVisible: false,
    };
  }

  @autobind
  toggleMenuBody() {
    this.setState({
      menuBodyVisible: !this.state.menuBodyVisible,
    });
  }

  render() {
    const { dataSource } = this.props;
    const { menuBodyVisible } = this.state;
    const cls = classnames({
      sidemenu: true,
      'sidemenu-open': menuBodyVisible,
    });
    const itemCls = classnames({
      'menu-item': true,
      'menu-item-level-1': true,
    });
    return (
      <div className={cls}>
        <div onClick={this.toggleMenuBody} className="sidemenu-toggle">
          <img src={menuBodyVisible ? 'https://img.alicdn.com/tfs/TB1I5itXQyWBuNjy0FpXXassXXa-200-200.png' : 'https://img.alicdn.com/tfs/TB1E6apXHGYBuNjy0FoXXciBFXa-200-200.png'} />
        </div>
        <ul>
          {
            dataSource.map((data, i) => {
              return (
                <li className={itemCls} key={i}>
                  <span>
                  {data.title}
                  </span>
                  <ul>
                    {data.children.map((item, j) => <Item item={item} key={j} toggleMenuBody={this.toggleMenuBody} />)}
                  </ul>
                </li>
              );
            })
          }
        </ul>
      </div>
    );
  }
}
