import { Link } from 'react-router-dom';
import '../styles/cards.css';

const Card = ({ worker }) => {
  return (
    <div className="worker-card">
      <div className="card-image">
        <img src={worker.imageUrl || '/default-worker.jpg'} alt={worker.name} />
      </div>
      <div className="card-content">
        <h3>{worker.name}</h3>
        <p className="profession">{worker.profession}</p>
        <p className="rating">Rating: {worker.rating || 'Not rated yet'}</p>
        <p className="price">${worker.hourlyRate}/hour</p>
        <Link to={`/hire/${worker.id}`} className="hire-btn">View Profile</Link>
      </div>
    </div>
  );
};

export default Card;