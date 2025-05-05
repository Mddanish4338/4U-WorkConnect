import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import Card from '../components/Card';
import '../styles/services.css';

const Services = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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

  const filteredWorkers = filter === 'all' 
    ? workers 
    : workers.filter(worker => worker.profession.toLowerCase() === filter);

  const professions = [...new Set(workers.map(worker => worker.profession))];

  return (
    <div className="services-page">
      <h1>Our Services</h1>
      
      <div className="filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Services
        </button>
        
        {professions.map((prof) => (
          <button
            key={prof}
            className={`filter-btn ${filter === prof.toLowerCase() ? 'active' : ''}`}
            onClick={() => setFilter(prof.toLowerCase())}
          >
            {prof}
          </button>
        ))}
      </div>
      
      {loading ? (
        <div className="loading">Loading workers...</div>
      ) : (
        <div className="workers-grid">
          {filteredWorkers.length > 0 ? (
            filteredWorkers.map((worker) => (
              <Card key={worker.id} worker={worker} />
            ))
          ) : (
            <div className="no-results">No workers found for this service.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Services;