import React from 'react';
import { autobind } from 'core-decorators';
import { getLink } from '../../../utils';

@autobind
class ContactItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      img: props.contact.img,
    };
  }

  onMouseOver() {
    this.setState({
      img: this.props.contact.imgHover,
    });
  }

  onMouseOut() {
    this.setState({
      img: this.props.contact.img,
    });
  }

  render() {
    const { contact } = this.props;
    const { img } = this.state;
    return (
      <a
        className="contact-item"
        href={getLink(contact.link)}
        rel="noopener noreferrer"
        target="_blank"
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut}
      >
      <img src={`${window.rootPath}${img}`} />
        <div>{contact.title}</div>
      </a>
    );
  }
}

export default ContactItem;
