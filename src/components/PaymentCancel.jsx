import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import './PaymentResult.css';

const PaymentCancel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const reservationId = params.get('reservation_id');
  
  return (
    <div className="payment-result-container">
      <div className="cancel-content">
        <div className="cancel-icon">
          <FontAwesomeIcon icon={faExclamationTriangle} size="5x" />
        </div>
        <h1>Payment Cancelled</h1>
        <p>Your payment was not completed.</p>
        <p>Your reservation is still pending until payment is completed.</p>
        
        <div className="action-buttons">
          {reservationId && (
            <button 
              className="retry-payment-btn" 
              onClick={() => navigate(`/apartment-detail/${reservationId}`)}
            >
              Retry Payment
            </button>
          )}
          <button className="home-btn" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;