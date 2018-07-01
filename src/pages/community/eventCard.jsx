import React from 'react';
import { Link } from 'react-router-dom';

class EventCard extends React.Component {
  render() {
    const { event } = this.props;
    return (
      <div className="event-card">
        <img src={event.img} />
        <div className="event-introduction">
          <h4>{event.title}</h4>
          <p>{event.content}</p>
          <Link to={event.link}>
            {event.dateStr}
            <img className="arrow" src="./img/arrow_right.png" />
          </Link>
        </div>
      </div>
    );
  }
}

export default EventCard;
