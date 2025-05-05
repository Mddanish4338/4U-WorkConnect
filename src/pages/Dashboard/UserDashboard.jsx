import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/Card';
import PricePopup from '../../components/PricePopup';
import { toast } from 'react-toastify';
import '../../styles/dashboard.css';

const UserDashboard = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [bookings, setBookings] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const workersRef = collection(db, 'workers');
        const q = query(workersRef, limit(4));
        const querySnapshot = await getDocs(q);
        
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

    const fetchBookings = async () => {
      if (!user) return;
      
      try {
        const bookingsRef = collection(db, 'bookings');
        const q = query(bookingsRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const bookingsData = [];
        querySnapshot.forEach((doc) => {
          bookingsData.push({ id: doc.id, ...doc.data() });
        });
        
        setBookings(bookingsData);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchWorkers();
    fetchBookings();

    // Set up real-time listener for booking status updates
    const unsubscribe = onSnapshot(
      query(collection(db, 'bookings'), where('userId', '==', user.uid)),
      (snapshot) => {
        const updatedBookings = [];
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'modified') {
            const updatedBooking = { id: change.doc.id, ...change.doc.data() };
            updatedBookings.push(updatedBooking);
            
            // Show notification for status changes
            if (change.doc.data().status === 'confirmed') {
              toast.success(`Your booking with ${updatedBooking.workerName} has been confirmed!`);
            } else if (change.doc.data().status === 'rejected') {
              toast.warning(`Your booking with ${updatedBooking.workerName} has been rejected.`);
            }
          }
        });
        
        if (updatedBookings.length > 0) {
          setBookings(prev => 
            prev.map(booking => 
              updatedBookings.find(ub => ub.id === booking.id) || booking
            )
          );
        }
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleBook = (worker) => {
    setSelectedWorker(worker);
    setShowPopup(true);
  };

  const handleBookingSubmit = async (bookingData) => {
    try {
      const bookingRef = doc(collection(db, 'bookings'));
      
      const booking = {
        ...bookingData,
        id: bookingRef.id,
        userId: user.uid,
        userName: user.name || user.email,
        workerId: selectedWorker.id,
        workerName: selectedWorker.name,
        workerProfession: selectedWorker.profession,
        status: 'pending',
        createdAt: new Date()
      };
      
      await setDoc(bookingRef, booking);
      
      // Update local state
      setBookings([...bookings, booking]);
      
      toast.success('Booking request sent! The worker will respond soon.');
      setShowPopup(false);
      
      // Notify worker (handled automatically via Firestore real-time updates)
      console.log(`Notification sent to worker ${selectedWorker.name} about new booking request`);
      
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Error creating booking');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      // Update booking status to cancelled
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'cancelled',
        cancelledAt: new Date()
      });
      
      // Update local state
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? {...booking, status: 'cancelled'} : booking
      ));
      
      toast.success('Booking cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Error cancelling booking');
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'completed',
        completedAt: new Date()
      });
      
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? {...booking, status: 'completed'} : booking
      ));
      
      toast.success('Booking marked as completed!');
    } catch (error) {
      console.error('Error completing booking:', error);
      toast.error('Error completing booking');
    }
  };

  const handleBookAgain = (workerId) => {
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
      setSelectedWorker(worker);
      setShowPopup(true);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="status pending">Pending Approval</span>;
      case 'confirmed':
        return <span className="status confirmed">Confirmed</span>;
      case 'completed':
        return <span className="status completed">Completed</span>;
      case 'rejected':
        return <span className="status rejected">Rejected</span>;
      case 'cancelled':
        return <span className="status cancelled">Cancelled</span>;
      default:
        return <span className="status unknown">Unknown</span>;
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name || user?.email}</h1>
        <p>Here's what's happening with your account today.</p>
      </div>
      
      <div className="dashboard-sections">
        <section className="recommended-workers">
          <h2>Recommended Workers</h2>
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
        </section>
        
        <section className="booking-status">
          <h2>Your Bookings</h2>
          
          <div className="booking-tabs">
            <div className="tab active">All Bookings</div>
          </div>
          
          {bookings.length === 0 ? (
            <div className="no-bookings">
              <p>You don't have any bookings yet.</p>
              <button onClick={() => window.location.href = '/hire'}>Find Workers</button>
            </div>
          ) : (
            <div className="bookings-container">
              {bookings.map((booking) => (
                <div key={booking.id} className={`booking-card ${booking.status}`}>
                  <div className="booking-header">
                    <h3>{booking.workerName}</h3>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="booking-details">
                    <p><strong>Service:</strong> {booking.workerProfession}</p>
                    <p><strong>Date:</strong> {booking.date}</p>
                    <p><strong>Time:</strong> {booking.time}</p>
                    <p><strong>Duration:</strong> {booking.hours} hours</p>
                    <p><strong>Total:</strong> ${booking.total}</p>
                  </div>
                  <div className="booking-actions">
                    {booking.status === 'pending' && (
                      <button 
                        className="cancel-btn"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel Booking
                      </button>
                    )}
                    {booking.status === 'confirmed' && (
                      <button 
                        className="complete-btn"
                        onClick={() => handleCompleteBooking(booking.id)}
                      >
                        Mark as Completed
                      </button>
                    )}
                    {booking.status === 'rejected' && (
                      <button 
                        className="book-again-btn"
                        onClick={() => handleBookAgain(booking.workerId)}
                      >
                        Book Again
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      
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

export default UserDashboard;