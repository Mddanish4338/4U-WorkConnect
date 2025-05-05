import { useState } from 'react';
import '../styles/popup.css';

const PricePopup = ({ worker, onClose, onBook }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [hours, setHours] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    onBook({
      workerId: worker.id,
      workerName: worker.name,
      date: selectedDate,
      time: selectedTime,
      hours,
      total: hours * worker.hourlyRate
    });
  };

  return (
    <div className="popup-overlay">
      <div className="price-popup">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Book {worker.name}</h2>
        <p>Profession: {worker.profession}</p>
        <p>Rate: ${worker.hourlyRate}/hour</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Date:</label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Time:</label>
            <input 
              type="time" 
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Hours:</label>
            <input 
              type="number" 
              min="1" 
              max="8" 
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value))}
              required 
            />
          </div>
          
          <div className="total">
            <h3>Total: ${hours * worker.hourlyRate}</h3>
          </div>
          
          <button type="submit" className="book-btn">Confirm Booking</button>
        </form>
      </div>
    </div>
  );
};

export default PricePopup;