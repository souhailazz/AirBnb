import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DateRangePicker from './DatePicker'; // Import the new DateRangePicker component
import './ApartmentDetail.css';
import Map from './Map';  // Import the Map component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesome
import { faWifi, faTv, faSnowflake, faUtensils, faCar, faCoffee, faBaby, faBroom } from '@fortawesome/free-solid-svg-icons'; // Import specific icons
import { Carousel } from 'react-responsive-carousel'; // Import the new Carousel component
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // Import carousel CSS

const ApartmentDetail = () => {
  const { id } = useParams();  // Get the ID from the URL
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [imageLoading, setImageLoading] = useState(true); // New state for image loading

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

  const handleImageLoad = () => {
    setImageLoading(false); // Set loading to false when the image is loaded
  };

  if (loading) return <div className="loading">Loading apartment details...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="ApartmentDetail futuristic">
      {apartment ? (
        <>
          <h1 className="apartment-title">{apartment.titre}</h1>
          <div className="apartment-images">
            <Carousel 
              showArrows={true} 
              infiniteLoop={true} 
              autoPlay={true} 
              interval={5000} 
              showThumbs={false} 
              showStatus={false} 
              dynamicHeight={false} 
              emulateTouch={true} 
              swipeable={true} 
              className="custom-carousel"
              renderIndicator={false}
            >
              {apartment.photos && apartment.photos.length > 0 ? (
                apartment.photos.map((photo, index) => (
                  <div key={index}>
                    <img 
                      src={photo.photo_url}  
                      alt={`Apartment in ${apartment.ville}`} 
                      className="ApartmentImage"
                      style={{ width: '100%', height: 'auto', cursor: 'zoom-in' }}
                      onLoad={handleImageLoad}
                      onClick={() => window.open(photo.photo_url, '_blank')}
                    />
                  </div>
                ))
              ) : (
                <img 
                  src="/default-apartment.jpg" 
                  alt={`Apartment in ${apartment.ville}`} 
                  className="ApartmentImage"
                  style={{ width: 'auto', height: 'auto' }}
                  onLoad={handleImageLoad}
                />
              )}
            </Carousel>
          </div>

          <p className="apartment-price"><strong> Price:</strong> {apartment.prix} EUR/night</p>
          <p><strong> Capacity:</strong> {apartment.capacite} guests</p>
          <p><strong> Address:</strong> {apartment.adresse}, {apartment.ville}</p>
          <p><strong>Cleaning Fee:</strong> {apartment.frais_menage} EUR</p>
          <p><strong>Max Pets Allowed:</strong> {apartment.max_animaux}</p>
          <p><strong>Surface Area:</strong> {apartment.surface} m²</p>
          <p><strong>Balcony Surface:</strong> {apartment.balcon_surface} m²</p>
          {apartment.chauffage && <span className="feature-icon"><FontAwesomeIcon icon={faSnowflake} /> Heating</span>}
          {apartment.wifi && <span className="feature-icon"><FontAwesomeIcon icon={faWifi} /> WiFi</span>}
          {apartment.television && <span className="feature-icon"><FontAwesomeIcon icon={faTv} /> Television</span>}
          {apartment.lave_Linge && <span className="feature-icon"><FontAwesomeIcon icon={faBroom} /> Washing Machine</span>}
          {apartment.cuisine_equipee && <span className="feature-icon"><FontAwesomeIcon icon={faUtensils} /> Equipped Kitchen</span>}
          {apartment.parking_payant && <span className="feature-icon"><FontAwesomeIcon icon={faCar} /> Paid Parking</span>}
          {apartment.petit_dejeuner_inclus && <span className="feature-icon"><FontAwesomeIcon icon={faCoffee} /> Breakfast Included</span>}
          {apartment.lit_parapluie && <span className="feature-icon"><FontAwesomeIcon icon={faBaby} /> Crib Available</span>}
          {apartment.menage_disponible && <span className="feature-icon"><FontAwesomeIcon icon={faBroom} /> Cleaning Service Available</span>}
          <p><strong>Minimum Nights:</strong> {apartment.nombre_min_nuits}</p>
          <p><strong>Weekly Discount:</strong> {apartment.remise_semaine} %</p>
          <p><strong>Monthly Discount:</strong> {apartment.remise_mois} %</p>
          <p><strong>Check-in Time:</strong> {apartment.checkin_heure.toString()}</p>
          <p><strong>Check-out Time:</strong> {apartment.checkout_heure.toString()}</p>
          <p><strong>Cancellation Policy:</strong> {apartment.politique_annulation}</p>
          <p><strong>Departure Instructions:</strong> {apartment.depart_instructions}</p>
          <p><strong>House Rules:</strong> {apartment.regles_maison}</p>
          <div className="description-box">
            <strong> Description:</strong>
            <p>{apartment.description}</p>
          </div>
          
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
