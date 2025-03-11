import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import LanguageSelector from './components/LanguageSelector';
import SearchBar from './components/SearchBar';
import ApartmentList from './components/ApartmentList';
import Map from './components/Map';
import Login from './components/Login';
import Signup from './components/Signup';
import MyReservations from './components/MyReservations';
import './i18n';
import ApartmentDetail from './components/ApartmentDetail'; // New component for apartment details
import { FaUser, FaHome, FaSignOutAlt } from 'react-icons/fa'; // Import FaUser, FaHome, and FaSignOutAlt for icons
import './app.css';

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const [apartments, setApartments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // useNavigate is now inside the Router context

  useEffect(() => {
    fetchAllApartments();
  }, []);

  const handleUserClick = () => {
    const userId = sessionStorage.getItem('userId'); // Retrieve the userId from sessionStorage

    if (!userId) {
      navigate('/login'); // Redirect to login if no userId exists
    } else {
      navigate('/MyReservations');
      // Fetch reservations for the logged-in user
      fetch(`http://localhost:5276/api/reservations/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          navigate('/MyReservations');
        })
        .catch((error) => console.error('Error fetching reservations:', error));
    }
  };

  const handleHomeClick = () => {
    navigate('/'); // Navigate to the root path
  };

  const fetchAllApartments = async (params = '') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5276/api/apartments${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received apartments:', data);
      setApartments(data);
    } catch (error) {
      console.error('Error fetching apartments:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="header">
        <div className="home-button" onClick={handleHomeClick}>
          <FaHome className="home-icon" /><span className="profile-text">
          Home </span>
        </div>
        <div className="profile-icon" onClick={handleUserClick}>
          <a className="profile-link">
            <FaUser className="user-icon" />
            <span className="profile-text">Profile</span>
          </a>
        </div>
        <div className="language-selector">
          <LanguageSelector />
        </div>
        <div className="search-bar">
          <SearchBar />
        </div>
        {sessionStorage.getItem('userId') && (
          <button className="disconnect-button" onClick={() => {
            sessionStorage.removeItem('userId');
            navigate('/login');
          }}>
            <FaSignOutAlt className="disconnect-icon" /> Disconnect
          </button>
        )}
      </header>
      {loading && <p>Loading apartments...</p>}

      <Routes>
        {/* Home Page */}
        <Route
          path="/"
          element={
            <div style={{ display: 'flex' }}>
              <ApartmentList apartments={apartments} loading={loading} error={error} />
              <Map locations={apartments.map((a) => ({ lat: a.latitude, lng: a.longitude }))} />
            </div>
          }
        />

        {/* Apartment Detail Page */}
        <Route path="/apartments/:id" element={<ApartmentDetail />} />

        {/* Login Page */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/MyReservations" element={<MyReservations />} />
      </Routes>
    </div>
  );
}

export default AppWrapper; 