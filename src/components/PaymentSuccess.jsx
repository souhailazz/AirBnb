import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import './PaymentResult.css';

const PaymentSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [reservationDetails, setReservationDetails] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get query parameters
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');
    const reservationId = params.get('reservation_id');
    
    if (reservationId) {
      // Fetch reservation details
      const fetchReservation = async () => {
        try {
          const response = await fetch(`https://backend-production-886a.up.railway.app/api/Reservation/${reservationId}`);
          if (response.ok) {
            const data = await response.json();
            setReservationDetails(data);
          }
        } catch (error) {
          console.error('Error fetching reservation details:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchReservation();
    } else {
      setLoading(false);
    }
  }, [location]);
  
  return (
    <div className="payment-result-container">
      {loading ? (
        <div className="loading-indicator">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <p>Loading reservation details...</p>
        </div>
      ) : (
        <div className="success-content">
          <div className="success-icon">
            <FontAwesomeIcon icon={faCheckCircle} size="5x" />
          </div>
          <h1>Payment Successful!</h1>
          <p>Your payment has been processed successfully.</p>
          
          {reservationDetails && (
            <div className="reservation-summary">
              <h3>Reservation Details</h3>
              <p><strong>Reservation ID:</strong> {reservationDetails.id_reservation}</p>
              <p><strong>Check-in:</strong> {new Date(reservationDetails.date_depart).toLocaleDateString()}</p>
              <p><strong>Check-out:</strong> {new Date(reservationDetails.date_sortie).toLocaleDateString()}</p>
            </div>
          )}
          
          <div className="action-buttons">
            <button className="view-reservations-btn" onClick={() => navigate('/reservations')}>
              View My Reservations
            </button>
            <button className="home-btn" onClick={() => navigate('/')}>
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSuccess;