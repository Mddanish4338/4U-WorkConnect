import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import Card from '../components/Card';
import PricePopup from '../components/PricePopup';
import { useAuth } from '../context/AuthContext';
import '../styles/hire.css';

const Hire = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const workersRef = collection(db, 'workers');
        const querySnapshot = await getDocs(workersRef);
        
        const workersData = [];
        querySnapshot.forEach((doc) => {
          workersData.push({ id: doc.id, ...doc.data() });
        });
        
        setWorkers(workersData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching workers:", error);
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  const handleBook = (worker) => {
    if (!user) {
      alert('Please login to book a worker');
      return;
    }
    setSelectedWorker(worker);
    setShowPopup(true);
  };

  const handleBookingSubmit = async (bookingData) => {
    try {
      // Here you would add the booking to Firestore
      // For now, we'll just log it
      console.log('Booking data:', bookingData);
      alert('Booking successful!');
      setShowPopup(false);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error creating booking');
    }
  };

  return (
    <div className="hire-page">
      <div className="hire-header">
        <h1>Hire a Professional</h1>
        <p>Browse our list of skilled workers and book one that fits your needs</p>
      </div>
      
      {loading ? (
        <div className="loading">Loading workers...</div>
      ) : (
        <div className="workers-grid">
          {workers.map((worker) => (
            <div key={worker.id} className="worker-card-wrapper">
              <Card worker={worker} />
              <button 
                className="book-now-btn"
                onClick={() => handleBook(worker)}
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      )}
      
      {showPopup && selectedWorker && (
        <PricePopup 
          worker={selectedWorker} 
          onClose={() => setShowPopup(false)}
          onBook={handleBookingSubmit}
        />
      )}
    </div>
  );
};

export default Hire;