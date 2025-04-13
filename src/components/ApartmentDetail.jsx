import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ApartmentDetail.css';
import BookingCalendar from './BookingCalendar';
import Map from './Map';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWifi, faTv, faSnowflake, faUtensils, faCar, faCoffee, faBaby, faBroom, faSpinner, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import ReservationModal from './ReservationModal';
import MessagingModal from './MessagingModal';

const ApartmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reservationError, setReservationError] = useState(null);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isReservationModalOpen, setReservationModalOpen] = useState(false);
  const [isMessagingModalOpen, setMessagingModalOpen] = useState(false);
  const [reservationDetails, setReservationDetails] = useState({ adults: 0, children: 0, pets: 0 });
  const [imageLoading, setImageLoading] = useState(true);
  const [currentReservationId, setCurrentReservationId] = useState(null);
  const sessionId = sessionStorage.getItem('userId'); // Retrieve session ID dynamically

  const fetchRecentReservationId = async () => {
    try {
      if (!sessionId) {
        console.error("No session ID available");
        return null;
      }
      
      const response = await fetch(`https://backend-production-886a.up.railway.app/api/Reservation/recent/${sessionId}`);
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
      const response = await fetch(`https://backend-production-886a.up.railway.app/api/Apartments/${id}`);
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
    setImageLoading(false);   
  };

  const fetchApartmentAvailability = async (id) => {
    try {
      const response = await fetch(`https://backend-production-886a.up.railway.app/api/Apartments/GetApartmentAvailability/${id}`);
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
  
      const response = await fetch('https://backend-production-886a.up.railway.app/api/Payments', {
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
  
  const sessionIdclient = sessionStorage.getItem('userId'); // Retrieve session ID dynamically

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
  
      // Make sure sessionId is properly parsed as an integer
      const clientId = parseInt(sessionIdclient, 10);
      if (isNaN(clientId)) {
        throw new Error('Invalid client ID');
      }
  
      const reservationDto = {
        id_client: parseInt(clientId, 10),  
        id_appartement: parseInt(id, 10), 
        date_depart: startDate.toISOString(),
        date_sortie: endDate.toISOString(),
        nbr_adultes: parseInt(reservationDetails.adults, 10),
        nbr_enfants: parseInt(reservationDetails.children, 10),
        animaux: reservationDetails.pets > 0,
        id_paiement: paiement.id  
      };
  
      console.log("Sending reservation request:", JSON.stringify(reservationDto, null, 2));
  
      const response = await fetch('https://backend-production-886a.up.railway.app/api/Reservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationDto)
      });
  
      const data = await response.text();
      try {
        const jsonData = JSON.parse(data);
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
  const processPayment = async (reservationId, totalAmount) => {
    try {
      const response = await fetch('https://backend-production-886a.up.railway.app/api/Payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId: reservationId,
          amount: totalAmount
        })
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create payment session: ${errorText}`);
      }
  
      const { checkoutUrl } = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;
      
    } catch (error) {
      console.error('Payment processing error:', error);
      alert('Failed to process payment: ' + error.message);
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
      
      const response = await fetch("https://backend-production-886a.up.railway.app/api/message", {
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
      if (!sessionId) {
        alert("Please login to make a reservation");
        navigate('/login');
        return;
      }
  
      setReservationDetails(details);
      if (!startDate || !endDate) {
        alert("Please select check-in and check-out dates.");
        return;
      }
      
      // Set loading state to true and clear any previous errors/success
      setReservationLoading(true);
      setReservationError(null);
      setReservationSuccess(false);
      
      try {
        // Create the reservation
        const reservationResponse = await createReservation(details);
        console.log("Reservation created:", reservationResponse);
        
        // Get the reservation ID from the response
        const reservationId = reservationResponse.reservation && reservationResponse.reservation.id;
        
        if (!reservationId) {
          throw new Error('No reservation ID returned from server');
        }
        
        // Calculate total price for the payment
        const nights = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        const totalPrice = apartment.prix * nights + apartment.frais_menage;
        
        // Show success message before redirecting to payment
        setReservationSuccess(true);
        
        // Process payment with Stripe
        setTimeout(() => {
          processPayment(reservationId, totalPrice);
        }, 1500);
        
      } catch (error) {
        console.error("Reservation error:", error);
        setReservationError(error.message || 'Failed to create reservation');
        // Don't close the modal, let the user see the error
      } finally {
        setReservationLoading(false);
      }
    } catch (error) {
      console.error("Reservation setup error:", error);
      alert('Failed to set up reservation: ' + error.message);
    }
  };

  if (loading) return (
    <div className="loading-container">
      <FontAwesomeIcon icon={faSpinner} spin size="3x" />
      <p>Loading apartment details...</p>
    </div>
  );
  
  if (error) return <div className="error-container">{error}</div>;

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
          
          <button 
            className="reserve-button" 
            onClick={() => {
              if (!sessionId) {
                alert("Please login to make a reservation");
                navigate('/login');
                return;
              }
              setReservationModalOpen(true);
            }}  
          >
            Reserve
          </button>
        </>
      ) : (
        <div>No apartment details available</div>
      )}
      
      {isReservationModalOpen && (
        <ReservationModal 
          onConfirm={handleReservationConfirm} 
          onClose={() => setReservationModalOpen(false)}
          loading={reservationLoading}
          success={reservationSuccess}
          error={reservationError}
        />
      )}
      
      {isMessagingModalOpen && (
        <MessagingModal 
          reservationDetails={reservationDetails} 
          onClose={() => setMessagingModalOpen(false)} 
        />
      )}
      
      {/* Full screen loading overlay for reservation processing */}
      {reservationLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <FontAwesomeIcon icon={faSpinner} spin size="3x" />
            <p>Creating your reservation...</p>
            <p className="loading-subtitle">Please wait, this may take a moment</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApartmentDetail;