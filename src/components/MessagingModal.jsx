import React, { useState } from 'react';

const MessagingModal = ({ reservationDetails, onClose }) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    // Logic to send the message (e.g., API call)
    console.log('Message sent:', message, 'with details:', reservationDetails);
    alert('Message sent successfully!');
    onClose(); // Close the modal after sending the message
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Send a Message</h2>
        <p>Reservation Details:</p>
        <p>Adults: {reservationDetails.adults}</p>
        <p>Children: {reservationDetails.children}</p>
        <p>Pets: {reservationDetails.pets}</p>
        <textarea 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          placeholder="Type your message here..." 
        />
        <button onClick={handleSendMessage}>Send Message</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default MessagingModal;
