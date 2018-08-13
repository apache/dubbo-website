import React from 'react';
import { getLink } from '../../../utils';

class EventCard extends React.Component {
  render() {
    const { event } = this.props;
    return (
      <div className="event-card">
        <a href={getLink(event.link)}>
          <img src={`${window.rootPath}${event.img}`} />
        </a>
        <div className="event-introduction">
          <h4>{event.title}</h4>
          <p>{event.content}</p>
          <a href={getLink(event.link)}>
            {event.dateStr}
            <img className="arrow" src={`${window.rootPath}/img/arrow_right.png`} />
          </a>
        </div>
      </div>
    );
  }
}

export default EventCard;
