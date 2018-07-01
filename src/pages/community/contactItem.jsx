import React from 'react';
import { autobind } from 'core-decorators';

class ContactItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      img: props.contact.img,
    };
  }

  @autobind
  onMouseOver() {
    this.setState({
      img: this.props.contact.imgHover,
    });
  }

  @autobind
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
        href={contact.link}
        target="__blank"
        onMouseOver={this.onMouseOver}
        onMouseOut={this.onMouseOut}
      >
        <img src={img} />
        <div>{contact.title}</div>
      </a>
    );
  }
}

export default ContactItem;
