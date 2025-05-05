import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../styles/dashboard.css';

const WorkerDashboard = () => {
  const [workerData, setWorkerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [rejectedBookings, setRejectedBookings] = useState([]);
  const [cancelledBookings, setCancelledBookings] = useState([]);
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [availability, setAvailability] = useState({
    monday: { available: false, startTime: '09:00', endTime: '17:00' },
    tuesday: { available: false, startTime: '09:00', endTime: '17:00' },
    wednesday: { available: false, startTime: '09:00', endTime: '17:00' },
    thursday: { available: false, startTime: '09:00', endTime: '17:00' },
    friday: { available: false, startTime: '09:00', endTime: '17:00' },
    saturday: { available: false, startTime: '09:00', endTime: '17:00' },
    sunday: { available: false, startTime: '09:00', endTime: '17:00' }
  });
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchWorkerData = async () => {
      if (!user) return;
      
      try {
        const workerRef = doc(db, 'workers', user.uid);
        const workerSnap = await getDoc(workerRef);
        
        if (workerSnap.exists()) {
          const data = workerSnap.data();
          setWorkerData(data);
          
          // Load availability if it exists
          if (data.availability) {
            setAvailability(data.availability);
          }
        } else {
          window.location.href = '/worker-profile';
        }
      } catch (error) {
        console.error("Error fetching worker data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Real-time listener for all bookings
    const unsubscribeBookings = onSnapshot(
      query(collection(db, 'bookings'), where('workerId', '==', user.uid)),
      (snapshot) => {
        const allBookings = [];
        const newPending = [];
        const newConfirmed = [];
        const newCompleted = [];
        const newRejected = [];
        const newCancelled = [];
        
        snapshot.forEach((doc) => {
          const booking = { id: doc.id, ...doc.data() };
          allBookings.push(booking);
          
          switch(booking.status) {
            case 'pending':
              newPending.push(booking);
              break;
            case 'confirmed':
              newConfirmed.push(booking);
              break;
            case 'completed':
              newCompleted.push(booking);
              break;
            case 'rejected':
              newRejected.push(booking);
              break;
            case 'cancelled':
              newCancelled.push(booking);
              break;
            default:
              break;
          }
        });

        setBookings(allBookings);
        setPendingBookings(newPending);
        setConfirmedBookings(newConfirmed);
        setCompletedBookings(newCompleted);
        setRejectedBookings(newRejected);
        setCancelledBookings(newCancelled);

        // Check for new pending bookings
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' && change.doc.data().status === 'pending') {
            toast.info(`New booking request from ${change.doc.data().userName}`, {
              autoClose: false,
              closeOnClick: false
            });
          }
        });
      }
    );

    fetchWorkerData();
    return () => unsubscribeBookings();
  }, [user]);

  const handleBookingAction = async (bookingId, action) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const newStatus = action === 'accept' ? 'confirmed' : 'rejected';
      
      await updateDoc(bookingRef, {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Update local state
      setBookings(bookings.map(b => 
        b.id === bookingId ? {...b, status: newStatus} : b
      ));
      
      setPendingBookings(pendingBookings.filter(b => b.id !== bookingId));
      
      if (newStatus === 'confirmed') {
        setConfirmedBookings([...confirmedBookings, 
          {...bookings.find(b => b.id === bookingId), status: 'confirmed'}
        ]);
      } else {
        setRejectedBookings([...rejectedBookings,
          {...bookings.find(b => b.id === bookingId), status: 'rejected'}
        ]);
      }
      
      toast.success(`Booking ${newStatus} successfully!`);
      
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      toast.error(`Error ${action}ing booking`);
    }
  };

  const handleCompleteBooking = async (bookingId) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'completed',
        completedAt: new Date()
      });
      
      setBookings(bookings.map(b => 
        b.id === bookingId ? {...b, status: 'completed'} : b
      ));
      
      setConfirmedBookings(confirmedBookings.filter(b => b.id !== bookingId));
      setCompletedBookings([...completedBookings,
        {...bookings.find(b => b.id === bookingId), status: 'completed'}
      ]);
      
      toast.success('Booking marked as completed!');
    } catch (error) {
      console.error('Error completing booking:', error);
      toast.error('Error completing booking');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'cancelled',
        cancelledAt: new Date()
      });
      
      setBookings(bookings.map(b => 
        b.id === bookingId ? {...b, status: 'cancelled'} : b
      ));
      
      setConfirmedBookings(confirmedBookings.filter(b => b.id !== bookingId));
      setCancelledBookings([...cancelledBookings,
        {...bookings.find(b => b.id === bookingId), status: 'cancelled'}
      ]);
      
      toast.success('Booking cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Error cancelling booking');
    }
  };

  const handleAvailabilityChange = (day, field, value) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: field === 'available' ? value === 'true' : value
      }
    }));
  };

  const saveAvailability = async () => {
    if (!user) return;
    
    try {
      const workerRef = doc(db, 'workers', user.uid);
      await updateDoc(workerRef, {
        availability: availability
      });
      
      toast.success('Availability saved successfully!');
      setShowAvailabilityForm(false);
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Error saving availability');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="status pending">Pending</span>;
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

  if (!workerData) {
    return (
      <div className="no-profile">
        <h2>You need to create your worker profile first</h2>
        <Link to="/worker-profile" className="btn">Create Profile</Link>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {workerData.name}</h1>
        <p>Here's your work dashboard</p>
        
        {pendingBookings.length > 0 && (
          <div className="notification-badge">
            {pendingBookings.length} new booking{pendingBookings.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p>{bookings.length}</p>
        </div>
        <div className="stat-card">
          <h3>Upcoming Jobs</h3>
          <p>{confirmedBookings.length}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Requests</h3>
          <p>{pendingBookings.length}</p>
        </div>
        <div className="stat-card">
          <h3>Completed Jobs</h3>
          <p>{completedBookings.length}</p>
        </div>
      </div>
      
      <div className="dashboard-sections">
        {!showAllBookings ? (
          <>
            <section className="pending-requests">
              <h2>Pending Booking Requests</h2>
              {pendingBookings.length === 0 ? (
                <div className="no-requests">
                  <p>You don't have any pending booking requests.</p>
                </div>
              ) : (
                <div className="requests-list">
                  {pendingBookings.map((booking) => (
                    <div key={booking.id} className="request-card">
                      <div className="request-header">
                        <h3>Booking from {booking.userName}</h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="request-details">
                        <p><strong>Service:</strong> {workerData.profession}</p>
                        <p><strong>Date:</strong> {booking.date}</p>
                        <p><strong>Time:</strong> {booking.time}</p>
                        <p><strong>Duration:</strong> {booking.hours} hours</p>
                        <p><strong>Total Earnings:</strong> ${booking.total}</p>
                        <p><strong>Address:</strong> {booking.address}</p>
                        <p><strong>Notes:</strong> {booking.notes || 'None'}</p>
                      </div>
                      <div className="request-actions">
                        <button 
                          className="accept-btn"
                          onClick={() => handleBookingAction(booking.id, 'accept')}
                        >
                          Accept
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={() => handleBookingAction(booking.id, 'reject')}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            
            <section className="upcoming-jobs">
              <h2>Your Confirmed Jobs</h2>
              {confirmedBookings.length === 0 ? (
                <div className="no-jobs">
                  <p>You don't have any confirmed jobs.</p>
                </div>
              ) : (
                <div className="jobs-list">
                  {confirmedBookings.map((booking) => (
                    <div key={booking.id} className="job-card">
                      <div className="job-header">
                        <h3>Booking from {booking.userName}</h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="job-details">
                        <p><strong>Service:</strong> {workerData.profession}</p>
                        <p><strong>Date:</strong> {booking.date}</p>
                        <p><strong>Time:</strong> {booking.time}</p>
                        <p><strong>Duration:</strong> {booking.hours} hours</p>
                        <p><strong>Total Earnings:</strong> ${booking.total}</p>
                        <p><strong>Address:</strong> {booking.address}</p>
                        <p><strong>Notes:</strong> {booking.notes || 'None'}</p>
                      </div>
                      <div className="job-actions">
                        <button 
                          className="complete-btn"
                          onClick={() => handleCompleteBooking(booking.id)}
                        >
                          Mark as Completed
                        </button>
                        <button 
                          className="cancel-btn"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Cancel Booking
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="all-bookings">
            <h2>All Bookings</h2>
            <div className="booking-filters">
              <button 
                className={!showAllBookings ? 'active' : ''}
                onClick={() => setShowAllBookings(false)}
              >
                Current Bookings
              </button>
              <button 
                className={showAllBookings ? 'active' : ''}
                onClick={() => setShowAllBookings(true)}
              >
                All Bookings
              </button>
            </div>
            
            <div className="bookings-tabs">
              <div className="tab active">
                <h3>All ({bookings.length})</h3>
              </div>
              <div className="tab">
                <h3>Pending ({pendingBookings.length})</h3>
              </div>
              <div className="tab">
                <h3>Confirmed ({confirmedBookings.length})</h3>
              </div>
              <div className="tab">
                <h3>Completed ({completedBookings.length})</h3>
              </div>
              <div className="tab">
                <h3>Rejected ({rejectedBookings.length})</h3>
              </div>
              <div className="tab">
                <h3>Cancelled ({cancelledBookings.length})</h3>
              </div>
            </div>
            
            <div className="bookings-list">
              {bookings.length === 0 ? (
                <div className="no-bookings">
                  <p>You don't have any bookings yet.</p>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-header">
                      <h3>Booking from {booking.userName}</h3>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="booking-details">
                      <p><strong>Service:</strong> {workerData.profession}</p>
                      <p><strong>Date:</strong> {booking.date}</p>
                      <p><strong>Time:</strong> {booking.time}</p>
                      <p><strong>Duration:</strong> {booking.hours} hours</p>
                      <p><strong>Total Earnings:</strong> ${booking.total}</p>
                      <p><strong>Address:</strong> {booking.address}</p>
                      <p><strong>Notes:</strong> {booking.notes || 'None'}</p>
                      <p><strong>Status:</strong> {booking.status}</p>
                      <p><strong>Created At:</strong> {new Date(booking.createdAt?.seconds * 1000).toLocaleString()}</p>
                      {booking.updatedAt && (
                        <p><strong>Updated At:</strong> {new Date(booking.updatedAt?.seconds * 1000).toLocaleString()}</p>
                      )}
                      {booking.completedAt && (
                        <p><strong>Completed At:</strong> {new Date(booking.completedAt?.seconds * 1000).toLocaleString()}</p>
                      )}
                      {booking.cancelledAt && (
                        <p><strong>Cancelled At:</strong> {new Date(booking.cancelledAt?.seconds * 1000).toLocaleString()}</p>
                      )}
                    </div>
                    {booking.status === 'pending' && (
                      <div className="booking-actions">
                        <button 
                          className="accept-btn"
                          onClick={() => handleBookingAction(booking.id, 'accept')}
                        >
                          Accept
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={() => handleBookingAction(booking.id, 'reject')}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {booking.status === 'confirmed' && (
                      <div className="booking-actions">
                        <button 
                          className="complete-btn"
                          onClick={() => handleCompleteBooking(booking.id)}
                        >
                          Mark as Completed
                        </button>
                        <button 
                          className="cancel-btn"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Cancel Booking
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        )}
        
        {showAvailabilityForm && (
          <section className="availability-form">
            <h2>Set Your Availability</h2>
            <div className="availability-grid">
              {Object.entries(availability).map(([day, data]) => (
                <div key={day} className="availability-day">
                  <h3>{day.charAt(0).toUpperCase() + day.slice(1)}</h3>
                  <div className="availability-toggle">
                    <label>
                      <input
                        type="radio"
                        name={`${day}-available`}
                        value="true"
                        checked={data.available}
                        onChange={() => handleAvailabilityChange(day, 'available', 'true')}
                      />
                      Available
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`${day}-available`}
                        value="false"
                        checked={!data.available}
                        onChange={() => handleAvailabilityChange(day, 'available', 'false')}
                      />
                      Not Available
                    </label>
                  </div>
                  {data.available && (
                    <div className="availability-times">
                      <div className="time-input">
                        <label>Start Time:</label>
                        <input
                          type="time"
                          value={data.startTime}
                          onChange={(e) => handleAvailabilityChange(day, 'startTime', e.target.value)}
                        />
                      </div>
                      <div className="time-input">
                        <label>End Time:</label>
                        <input
                          type="time"
                          value={data.endTime}
                          onChange={(e) => handleAvailabilityChange(day, 'endTime', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="form-actions">
              <button className="save-btn" onClick={saveAvailability}>
                Save Availability
              </button>
              <button 
                className="cancel-btn"
                onClick={() => setShowAvailabilityForm(false)}
              >
                Cancel
              </button>
            </div>
          </section>
        )}
        
        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/worker-profile" className="action-card">
              <h3>Update Profile</h3>
              <p>Edit your profile information</p>
            </Link>
            <div 
              className="action-card" 
              onClick={() => setShowAvailabilityForm(true)}
            >
              <h3>Set Availability</h3>
              <p>Update when you're available</p>
            </div>
            <div 
              className="action-card"
              onClick={() => setShowAllBookings(!showAllBookings)}
            >
              <h3>{showAllBookings ? 'Current Bookings' : 'View All Bookings'}</h3>
              <p>{showAllBookings ? 'Back to current' : 'See all your bookings'}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WorkerDashboard;