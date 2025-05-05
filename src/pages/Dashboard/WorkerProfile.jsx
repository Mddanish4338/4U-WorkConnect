import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/worker-profile.css';

const WorkerProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: '',
    profession: '',
    description: '',
    hourlyRate: '',
    phone: '',
    imageUrl: '' // This will now store a base64 encoded string or URL
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    const fetchWorkerProfile = async () => {
      if (!user) return;
      
      try {
        const workerRef = doc(db, 'workers', user.uid);
        const workerSnap = await getDoc(workerRef);
        
        if (workerSnap.exists()) {
          const data = workerSnap.data();
          setProfileData(data);
          if (data.imageUrl) {
            setImagePreview(data.imageUrl);
          }
        }
      } catch (error) {
        console.error("Error fetching worker profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Convert image to base64 if new image was selected
      let imageUrl = imagePreview;
      if (imageFile) {
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result);
          };
          reader.readAsDataURL(imageFile);
        });
      }

      const workerRef = doc(db, 'workers', user.uid);
      const workerData = {
        ...profileData,
        id: user.uid,
        email: user.email,
        hourlyRate: parseFloat(profileData.hourlyRate) || 0,
        imageUrl: imageUrl || '',
        updatedAt: new Date()
      };
      
      await setDoc(workerRef, workerData, { merge: true });
      
      // Also update the user's name in the users collection
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { name: profileData.name });
      
      alert('Profile updated successfully!');
      navigate('/worker-dashboard');
    } catch (error) {
      console.error("Error updating profile:", error);
      alert('Error updating profile. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="worker-profile">
      <h1>Your Profile</h1>
      <p>Complete your profile to start getting hired</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profileData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="profession">Profession</label>
            <select
              id="profession"
              name="profession"
              value={profileData.profession}
              onChange={handleChange}
              required
            >
              <option value="">Select your profession</option>
              <option value="Electrician">Electrician</option>
              <option value="Plumber">Plumber</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Painter">Painter</option>
              <option value="Cleaner">Cleaner</option>
              <option value="AC Technician">AC Technician</option>
              <option value="Mechanic">Mechanic</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="hourlyRate">Hourly Rate ($)</label>
            <input
              type="number"
              id="hourlyRate"
              name="hourlyRate"
              value={profileData.hourlyRate}
              onChange={handleChange}
              min="10"
              step="5"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={profileData.phone}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={profileData.description}
              onChange={handleChange}
              rows="4"
              required
            ></textarea>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Profile Picture</h2>
          
          <div className="image-upload">
            {imagePreview ? (
              <img src={imagePreview} alt="Profile Preview" className="profile-image" />
            ) : (
              <div className="image-placeholder">No image</div>
            )}
            
            <div className="upload-controls">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
              />
              <label htmlFor="image" className="upload-btn">
                Choose Image
              </label>
            </div>
            <p className="image-note">Note: Images will be stored as base64 in Firestore</p>
          </div>
        </div>
        
        <button type="submit" className="submit-btn">
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default WorkerProfile;