import { useEffect, useState } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import Card from '../components/Card';
import '../styles/home.css';

const Home = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const workersRef = collection(db, 'workers');
        const q = query(workersRef, limit(6));
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

    fetchWorkers();
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Find Skilled Workers Near You</h1>
          <p>Connect with trusted professionals for all your home service needs</p>
          <button className="cta-btn">Get Started</button>
        </div>
      </section>

      <section className="featured-workers">
        <h2>Featured Workers</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="workers-grid">
            {workers.map((worker) => (
              <Card key={worker.id} worker={worker} />
            ))}
          </div>
        )}
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Search for a Worker</h3>
            <p>Browse through our list of skilled professionals</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Book an Appointment</h3>
            <p>Choose a date and time that works for you</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Get the Job Done</h3>
            <p>Your worker arrives and completes the task</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;