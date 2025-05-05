import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthContextProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Hire from './pages/Hire';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import UserDashboard from './pages/Dashboard/UserDashboard';
import WorkerDashboard from './pages/Dashboard/WorkerDashboard';
import WorkerProfile from './pages/Dashboard/WorkerProfile';
import Bookings from './pages/Dashboard/Bookings';
import {ProtectedRoute} from './components/ProtectedRoute';
import './styles/main.css';

function App() {
  return (
    <AuthContextProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/hire" element={<Hire />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['user']} />}>
            <Route path="/user-dashboard" element={<UserDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['worker']} />}>
            <Route path="/worker-dashboard" element={<WorkerDashboard />} />
            <Route path="/worker-profile" element={<WorkerProfile />} />
            <Route path="/bookings" element={<Bookings />} />
          </Route>
        </Routes>
        <Footer />
      </Router>
    </AuthContextProvider>
  );
}

export default App;