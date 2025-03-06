import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DateRangePicker from './DatePicker'; // Import the new DateRangePicker component
import './ApartmentDetail.css';
import Map from './Map';  // Import the Map component

const ApartmentDetail = () => {
  const { id } = useParams();  // Get the ID from the URL
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);

  useEffect(() => {
    fetchApartmentDetails(id);  
    fetchApartmentAvailability(id); // Fetch availability data
  }, [id]);

  const fetchApartmentDetails = async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5276/api/Apartments/${id}`);
      if (!response.ok) {
        throw new Error(`Error fetching apartment details`);
      }

      const data = await response.json();
      setApartment(data);
    } catch (err) {
      setError('Error fetching apartment details');
    } finally {
      setLoading(false);
    }
  };

  const fetchApartmentAvailability = async (id) => {
    try {
      const response = await fetch(`http://localhost:5276/api/Apartments/${id}/availability`);
      if (!response.ok) {
        const errorMessage = await response.text(); // Get the error message from the response
        throw new Error(`Error fetching availability data: ${errorMessage}`);
      }
      const data = await response.json();
      setUnavailableDates(data);
    } catch (err) {
      console.error('Fetch availability error:', err); // Log the error for debugging
      setError(`Error fetching availability data: ${err.message}`); // Set a more descriptive error message
    }
  };

  if (loading) return <div className="loading">Loading apartment details...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="ApartmentDetail">
      {apartment ? (
        <>
          <h1 className="apartment-title">{apartment.titre}</h1>
          <div className="apartment-images">
  {apartment.photos && apartment.photos.length > 0 ? (
    apartment.photos.map((photo, index) => (
      <img 
        key={index}
        src={photo.photo_url}  // Accéder à photo_url au lieu de photo directement
        alt={`Apartment in ${apartment.ville}`} 
        className="ApartmentImage"
      />
    ))
  ) : (
    <img 
      src="/default-apartment.jpg" 
      alt={`Apartment in ${apartment.ville}`} 
      className="ApartmentImage"
    />
  )}
</div>

          <p className="apartment-price"><strong>Price:</strong> {apartment.prix} EUR/night</p>
          <p><strong>Capacity:</strong> {apartment.capacite} guests</p>
          <p><strong>Address:</strong> {apartment.adresse}, {apartment.ville}</p>
          <p><strong>Description:</strong> {apartment.description}</p>
          
          <DateRangePicker onDateChange={(start, end) => console.log(start, end)} unavailableDates={unavailableDates} />
          <Map locations={[{ lat: apartment.latitude, lng: apartment.longitude }]} />
          <button className="reserve-button">Reserve</button>
        </>
      ) : (
        <div>No apartment details available</div>
      )}
    </div>
  );
};

export default ApartmentDetail;
