import React, { useState, useEffect } from 'react';
import LanguageSelector from './components/LanguageSelector';
import SearchBar from './components/SearchBar';
import ApartmentList from './components/ApartmentList';
import Map from './components/Map';
import Login from './components/Login'
import Signup from './components/Signup';
import './i18n'; 
import ApartmentDetail from './components/ApartmentDetail';  // New component for apartment details
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  const [apartments, setApartments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllApartments(); 
  }, []);

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
      console.error("Error fetching apartments:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle search form submission
  const handleSearch = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    let params = '?';

    if (formData.get('location')) {
      params += `location=${encodeURIComponent(formData.get('location'))}&`;
    }
    if (formData.get('adults') && formData.get('adults') !== '0') {
      params += `adults=${encodeURIComponent(formData.get('adults'))}&`;
    }
    if (formData.get('children') && formData.get('children') !== '0') {
      params += `children=${encodeURIComponent(formData.get('children'))}&`;
    }
    if (formData.get('pets') === 'on') {
      params += 'pets=true&';
    }

    fetchAllApartments(params);
  };

  
  return (
    <Router>
      <div className="App">
        <LanguageSelector />
        <SearchBar onSearch={handleSearch} />
        {loading && <p>Loading apartments...</p>}
        
        <Routes>
          {/* Home Page */}
          <Route path="/" element={
            <div style={{ display: 'flex' }}>
              <ApartmentList apartments={apartments} loading={loading} error={error} />
              <Map locations={apartments.map((a) => ({ lat: a.latitude, lng: a.longitude }))} />
            </div>
          } />
          
          {/* Apartment Detail Page */}
          <Route path="/apartments/:id" element={<ApartmentDetail />} />

          {/* Login Page */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

        </Routes>
      </div>
    </Router>
    
  );
}
export default App;
