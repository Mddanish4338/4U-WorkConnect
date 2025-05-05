import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import '../../styles/bookings.css';

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      
      try {
        const bookingsRef = collection(db, 'bookings');
        let q;
        
        if (user.role === 'worker') {
          q = query(bookingsRef, 
            where('workerId', '==', user.uid),
            orderBy('date', 'desc'),
            orderBy('time', 'desc')
          );
        } else {
          q = query(bookingsRef, 
            where('userId', '==', user.uid),
            orderBy('date', 'desc'),
            orderBy('time', 'desc')
          );
        }
        
        const querySnapshot = await getDocs(q);
        
        const bookingsData = [];
        querySnapshot.forEach((doc) => {
          bookingsData.push({ id: doc.id, ...doc.data() });
        });
        
        setBookings(bookingsData);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filter);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      // Here you would update the booking status in Firestore
      // For now, we'll just log it
      console.log(`Updating booking ${bookingId} to status ${newStatus}`);
      alert('Status updated!');
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert('Error updating status');
    }
  };

  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  return (
    <div className="bookings-page">
      <h1>Your Bookings</h1>
      
      <div className="booking-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilter('confirmed')}
        >
          Confirmed
        </button>
        <button 
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
        <button 
          className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('cancelled')}
        >
          Cancelled
        </button>
      </div>
      
      {filteredBookings.length === 0 ? (
        <div className="no-bookings">
          <p>No bookings found</p>
        </div>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <h3>
                  {user.role === 'worker' 
                    ? `Booking from ${booking.userName}` 
                    : `Booking with ${booking.workerName}`}
                </h3>
                <span className={`status ${booking.status}`}>{booking.status}</span>
              </div>
              
              <div className="booking-details">
                <p><strong>Date:</strong> {booking.date}</p>
                <p><strong>Time:</strong> {booking.time}</p>
                <p><strong>Duration:</strong> {booking.hours} hours</p>
                <p><strong>Total:</strong> ${booking.total}</p>
              </div>
              
              {user.role === 'worker' && booking.status === 'confirmed' && (
                <div className="booking-actions">
                  <button 
                    className="complete-btn"
                    onClick={() => handleStatusChange(booking.id, 'completed')}
                  >
                    Mark as Completed
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={() => handleStatusChange(booking.id, 'cancelled')}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;