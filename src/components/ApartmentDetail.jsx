import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ApartmentDetail.css';
import BookingCalendar from './BookingCalendar';
import Map from './Map';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWifi, faTv, faSnowflake, faUtensils, faCar, faCoffee, faBaby, faBroom } from '@fortawesome/free-solid-svg-icons';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import ReservationModal from './ReservationModal';
import MessagingModal from './MessagingModal';
const sessionId = sessionStorage.getItem('userId'); 

const ApartmentDetail = () => {
  const { id } = useParams();
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isReservationModalOpen, setReservationModalOpen] = useState(false);
  const [isMessagingModalOpen, setMessagingModalOpen] = useState(false);
  const [reservationDetails, setReservationDetails] = useState({ adults: 0, children: 0, pets: 0 });
  const [imageLoading, setImageLoading] = useState(true); // New state for image loading
  const [currentReservationId, setCurrentReservationId] = useState(null);
  const fetchRecentReservationId = async () => {
    try {
      if (!sessionId) {
        console.error("No session ID available");
        return null;
      }
      
      const response = await fetch(`http://localhost:5276/api/Reservation/recent/${sessionId}`);
      if (!response.ok) {
        throw new Error(`Error fetching recent reservation: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Recent reservation data:", data);
      
      // Check if we got valid data with id_reservation field
      if (data && data.id_reservation) {
        setCurrentReservationId(data.id_reservation);
        return data.id_reservation;
      } else {
        console.error("No reservation ID found in response:", data);
        return null;
      }
    } catch (err) {
      console.error("Error fetching recent reservation:", err);
      return null;
    }
  };
  useEffect(() => {
    fetchApartmentDetails(id);
    fetchApartmentAvailability(id);
  }, [id]);
  const handleDateSelect = (startDate, endDate) => {
    setStartDate(startDate);
    setEndDate(endDate);
  };
  
  const fetchApartmentDetails = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5276/api/Apartments/${id}`);
      if (!response.ok) throw new Error(`Error fetching apartment details`);
      const data = await response.json();
      setApartment(data);
    } catch (err) {
      setError('Error fetching apartment details');
    } finally {
      setLoading(false);
    }
  };
  const handleImageLoad = () => {
    setImageLoading(false); // Set loading to false when the image is loaded
  };


  const fetchApartmentAvailability = async (id) => {
    try {
      const response = await fetch(`http://localhost:5276/api/Apartments/GetApartmentAvailability/${id}`);
      if (!response.ok) throw new Error(`Error fetching availability data`);
      const data = await response.json();
      setUnavailableDates(data.length > 0 ? data : []);
    } catch (err) {
      console.error('Fetch availability error:', err);
      setError(`Error fetching availability data: ${err.message}`);
    }
  };
  const createPayment = async (total, method) => {
    try {
      const paymentData = {
        total: total,
        methode_de_paiement: method,
        payment_code: "PAYMENT-" + Date.now() // Generate a unique payment code
      };
  
      const response = await fetch('http://localhost:5276/api/Payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });
  
      const data = await response.text(); // First get the response as text
    try {
      const jsonData = JSON.parse(data); // Try to parse it as JSON
      if (!response.ok) {
        throw new Error(jsonData.message || 'Failed to create payment');
      }
      return jsonData;
    } catch (parseError) {
      throw new Error(data || 'Failed to create payment');
    }
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
  };
  const createReservation = async (reservationDetails) => {
    try {
      if (!startDate || !endDate) {
        throw new Error('Please select both check-in and check-out dates');
      }
  
      // Calculate number of nights
      const nights = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
      
      // Calculate total price
      const totalPrice = apartment.prix * nights + apartment.frais_menage;
  
      // Create payment first
      const paiement = await createPayment(totalPrice, "Card");
  
      // Create reservation DTO
      const reservationDto  = {
        id_client: sessionId,
        id_appartement: parseInt(id),
        date_depart: startDate.toISOString(),
        date_sortie: endDate.toISOString(),
        etat: "Pending",
        nbr_adultes: parseInt(reservationDetails.adults),
        nbr_enfants: parseInt(reservationDetails.children),
        animaux: reservationDetails.pets > 0,
        id_paiement: paiement.id,
      };
  console.log("id dyal paiement ",paiement.id);
      console.log("Sending reservation request:", JSON.stringify(reservationDto, null, 2));
  
      const response = await fetch('http://localhost:5276/api/Reservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify( reservationDto ) 
      });
  
      const data = await response.text(); // First get the response as text
      try {
        const jsonData = JSON.parse(data); // Try to parse it as JSON
        if (!response.ok) {
          throw new Error(jsonData.message || 'Failed to create reservation');
        }
        console.log("Reservation created successfully:", jsonData);
        return jsonData;
      } catch (parseError) {
        throw new Error(data || 'Failed to create reservation');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  };
  const sendAdminMessage = async (reservationId, reservationDetails) => {
    try {
      const adminId = 1; // Admin ID
      
      // If no reservationId was passed, fetch the most recent one
      if (!reservationId) {
        reservationId = await fetchRecentReservationId();
      }
      
      // Check if we have a valid reservation ID
      if (!reservationId || isNaN(parseInt(reservationId))) {
        throw new Error(`Invalid reservation ID: ${reservationId}`);
      }
      
      // Simple message content
      const messageContent = `New reservation request #${reservationId}:\n` +
        `Apartment: #${id}\n` +
        `Check-in: ${startDate ? startDate.toDateString() : 'Not specified'}\n` +
        `Check-out: ${endDate ? endDate.toDateString() : 'Not specified'}\n` +
        `Adults: ${reservationDetails.adults}\n` +
        `Children: ${reservationDetails.children}\n` +
        `Pets: ${reservationDetails.pets > 0 ? 'Yes' : 'No'}\n` +
        `Please review this reservation.`;
      
      // Format the message data as expected by the API - using the same format as in Chat.jsx
      const messageData = {
        reservationId: parseInt(reservationId),
        senderId: parseInt(sessionId) || 1,
        receiverId: adminId,
        content: messageContent
      };
      
      console.log("Sending message data:", messageData);
      
      const response = await fetch("http://localhost:5276/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send message to admin: ${errorText}`);
      }
      
      const result = await response.json();
      console.log("Message sent to admin successfully:", result);
      return true;
    } catch (error) {
      console.error("Error sending message to admin:", error);
      return false;
    }
  };
  const handleReservationConfirm = async (details) => {
    try {
      setReservationDetails(details);
      if (!startDate || !endDate) {
        alert("Please select check-in and check-out dates.");
        return;
      }
      
      // Create the reservation only once and save the response
      const reservationResponse = await createReservation(details);
      console.log("Reservation created:", reservationResponse);
      
      // Use id_reservation from the response if available, otherwise fetch the most recent
      let reservationId = reservationResponse && reservationResponse.id_reservation 
        ? reservationResponse.id_reservation 
        : null;
      
      // Send message to admin with reservation details
      const messageSent = await sendAdminMessage(reservationId, details);
      console.log("Message sent status:", messageSent);
      
      setReservationModalOpen(false);
      setMessagingModalOpen(true);
    } catch (error) {
      console.error("Reservation error:", error);
      alert('Failed to create reservation: ' + error.message);
    }
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

          <BookingCalendar 
  unavailableDates={unavailableDates}
  onDateSelect={handleDateSelect}
  selectedStartDate={startDate}
  selectedEndDate={endDate}
/>
<div className="date-selection">
  <p><strong>Selected Check-in Date:</strong> {startDate ? startDate.toDateString() : "Not selected"}</p>
  <p><strong>Selected Check-out Date:</strong> {endDate ? endDate.toDateString() : "Not selected"}</p>
</div> 
          
          
                 <button className="reserve-button" onClick={() => setReservationModalOpen(true)}>Reserve</button>
        </>
      ) : (
        <div>No apartment details available</div>
      )}
 {isReservationModalOpen && <ReservationModal onConfirm={handleReservationConfirm} onClose={() => setReservationModalOpen(false)} />}
 {isMessagingModalOpen && <MessagingModal reservationDetails={reservationDetails} onClose={() => setMessagingModalOpen(false)} />}
    </div>
  );
};

export default ApartmentDetail;
