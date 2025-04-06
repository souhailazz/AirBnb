import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import LanguageSelector from './components/LanguageSelector';
import SearchBar from './components/SearchBar';
import ApartmentList from './components/ApartmentList';
import Map from './components/Map';
import Login from './components/Login';
import Signup from './components/Signup';
import MyReservations from './components/MyReservations';
import Admin from './components/Admin';
import './i18n';
import ApartmentDetail from './components/ApartmentDetail'; // New component for apartment details
import { FaComments,FaUser, FaHome, FaSignOutAlt, FaUserCog, FaEdit } from 'react-icons/fa'; // Import FaUser, FaHome, and FaSignOutAlt for icons
import './App.css';
import Edit from './components/Edit';
import Chat from './components/Chat';

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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse query parameters from URL on initial load
    const queryParams = new URLSearchParams(location.search);
    const locationParam = queryParams.get('location');
    const adultsParam = queryParams.get('adults');
    const childrenParam = queryParams.get('children');
    const petsParam = queryParams.get('pets');
    
    // Only fetch with params if at least one parameter exists
    if (locationParam || adultsParam || childrenParam || petsParam === 'true') {
      const searchParams = {
        location: locationParam || "",
        adults: adultsParam || "",
        children: childrenParam || "",
        pets: petsParam === 'true'
      };
      handleSearch(searchParams);
    } else {
      fetchAllApartments();
    }
  }, [location.search]);

  const handleSearch = (searchParams) => {
    // Build query string based on search parameters
    const queryParams = new URLSearchParams();
    
    if (searchParams.location) queryParams.append('location', searchParams.location);
    if (searchParams.adults) queryParams.append('adults', searchParams.adults);
    if (searchParams.children) queryParams.append('children', searchParams.children);
    if (searchParams.pets) queryParams.append('pets', 'true');
    
    // Update URL with search parameters
    navigate(`/?${queryParams.toString()}`);
    
    // Fetch apartments based on search parameters
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    fetchAllApartments(queryString);
  };

  const handleUserClick = () => {
    const userId = sessionStorage.getItem('userId');
    console.log("UserId from session:", userId); // Debugging
  
    if (!userId) {
      navigate('/login');
    } else {
      // Navigate first, then fetch data
      navigate('/MyReservations');
      
      fetch(`https://backend-production-886a.up.railway.app/api/Reservation/reservations/${userId}`)
      .then(response => {
          console.log("Response status:", response.status);
          if (!response.ok) {
            return response.text().then(text => {
              throw new Error(`Server error (${response.status}): ${text || "No error details"}`);
            });
          }
          return response.text().then(text => {
            if (!text) {
              console.log("Empty response received");
              return [];
            }
            try {
              return JSON.parse(text);
            } catch (e) {
              console.error("Invalid JSON:", text);
              throw new Error("Invalid JSON response");
            }
          });
        })
        .then(data => {
          console.log("Reservation data:", data);
          // Don't navigate again, we already did
        })
        .catch(error => {
          console.error('Error fetching reservations:', error);
          // Perhaps show an error message to the user
        });
    }
  };

  const handleHomeClick = () => {
    navigate('/'); // Navigate to the root path
  };
  const handleChatClick =() =>{

navigate('/Chat');
  };

  const handleAdminClick = () => {
    navigate('/Admin');
  };

  const handleEditClick = () => {
    navigate('/Edit');
  };

  const fetchAllApartments = async (params = '') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://backend-production-886a.up.railway.app/api/apartments${params}`, {
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
        <div className="header-nav">
          <div className="home-button" onClick={handleHomeClick}>
            <FaHome className="home-icon" />
            <span className="profile-text">Home</span>
          </div>
          <div className="home-button" onClick={handleChatClick}>
            <FaComments className="Chat" />
            <span className="profile-text">Chat</span>
          </div>
        </div>

        {location.pathname === '/' && (
          <div className="search-bar">
            <SearchBar onSearch={handleSearch} />
          </div>
        )}

        <div className="header-right">
         
          {sessionStorage.getItem('userId') === '1' && (
            <>
              <div className="admin-button" onClick={handleAdminClick}>
                <FaUserCog className="admin-icon" />
                <span className="profile-text">Admin</span>
              </div>
              <div className="edit-button" onClick={handleEditClick}>
                <FaEdit className="edit-icon" />
                <span className="profile-text">Edit</span>
              </div>
            </>
          )}
          <div className="profile-icon" onClick={handleUserClick}>
            <a className="profile-link">
              <FaUser className="user-icon" />
              <span className="profile-text">Profile</span>
            </a>
          </div>
          {sessionStorage.getItem('userId') && (
            <button className="disconnect-button" onClick={() => {
              sessionStorage.removeItem('userId');
              navigate('/login');
            }}>
              <FaSignOutAlt className="disconnect-icon" />
              <span>Disconnect</span>
            </button>
          )}
        </div>
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
        <Route path="/Admin" element={<Admin />} />
        <Route path="/MyReservations" element={<MyReservations />} />
        <Route path="/Chat" element={<Chat/>} />
        <Route path="/Edit" element={<Edit/>} />


      </Routes>
    </div>
  );
}

export default AppWrapper; 