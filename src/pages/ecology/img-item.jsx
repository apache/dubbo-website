import React from 'react';
import Tooltip from 'antd/lib/tooltip';
import 'antd/lib/tooltip/style/index.css';
import Modal from 'antd/lib/modal';
import 'antd/lib/modal/style/index.css';
import { getLink } from '../../../utils';

class ImgItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  }

  hideModal = () => {
    this.setState({
      visible: false,
    });
  }

  render() {
    const { dataSource } = this.props;
    const { name = '', img = '', desc = '', tags = [], website = '', repository = '', hiddenImg = false } = dataSource;
    return (
      <div className="img-item" onClick={this.showModal}>
        <Tooltip title={name}>{
          hiddenImg ? <p className="hidden-img-title">{name}</p> : <img src={getLink(img)} alt={name} />
        }
        </Tooltip>
        <Modal
          visible={this.state.visible}
          width={800}
          onOk={this.hideModal}
          onCancel={this.hideModal}
          wrapClassName="img-item-modal"
          footer={null}
        >
          <div className="modal-content-left"><img src={getLink(img)} alt={name} /></div>
          <div className="modal-content-right">
            <h3>{name}</h3>
            <p>{desc}</p>
            {
              tags.map(tag => <div key={tag.text} className="tag" style={{ backgroundColor: tag.bgColor }}>{tag.text}</div>)
            }
            {
              website ? <div className="website"><span>Website</span><a href={website} rel="noopener noreferrer" target="_blank">{website}</a></div> : null
            }
            {
              repository ? <div className="repository"><span>Repository</span><a href={repository} rel="noopener noreferrer" target="_blank">{repository}</a></div> : null
            }
          </div>
        </Modal>
      </div>
    );
  }
}

export default ImgItem;
