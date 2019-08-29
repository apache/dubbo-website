import React from 'react';
import Tooltip from 'antd/lib/tooltip';
import 'antd/lib/tooltip/style/index.css';
import classnames from 'classnames';
import { throttle } from '../../../utils';

class Memo extends React.Component {
  constructor(props) {
    super(props);
    this.title = null;
    this.body = null;
    this.adjustSizeThrottle = null;
  }

  componentDidMount() {
    this.adjustSizeThrottle = throttle(this.adjustSize, 200);
    this.adjustSizeThrottle();
    window.addEventListener('resize', this.adjustSizeThrottle);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.adjustSizeThrottle);
  }

  adjustSize = () => {
    if (!this.props.vertical) {
      // 让body去决定整体的高度
      this.title.style.display = 'none';
      const height = this.body.getBoundingClientRect().height;
      console.log('height', height);
      this.title.style.height = `${height}px`;
      this.title.style.display = 'inline-block';
    } else {
      this.title.style.height = '28px';
    }
  }

  render() {
    const { title, bgColor, vertical, children } = this.props;
    return (
      <div
        className={classnames({
          memo: true,
          'memo-vertical': vertical,
        })}
      >
        <span className="memo-title" ref={(node) => { this.title = node; }} style={{ backgroundColor: bgColor }}>
          <Tooltip title={title}><span>{title}</span></Tooltip>
        </span>
        <span className="memo-body" ref={(node) => { this.body = node; }}>{children}</span>
      </div>
    );
  }
}

export default Memo;
