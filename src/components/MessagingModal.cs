import React, { useState, useEffect } from 'react';
import AdminReservationApproval from './AdminReservationApproval';
import './MessagingModal.css';

const MessagingModal = ({ reservationDetails, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [reservationId, setReservationId] = useState(null);
  const [showApproval, setShowApproval] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const sessionId = parseInt(sessionStorage.getItem('userId') || '0');

  useEffect(() => {
   

    // Find the reservation ID from URL or state
    const findReservationId = async () => {
      if (reservationDetails && reservationDetails.reservationId) {
        setReservationId(reservationDetails.reservationId);
        return;
      }
      
      try {
        const response = await fetch(`http://localhost:5276/api/Reservation/recent/${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          setReservationId(data.id);
        }
      } catch (error) {
        console.error("Error finding reservation:", error);
      }
    };
    
    findReservationId();
  }, [sessionId, reservationDetails]);

  useEffect(() => {
    if (reservationId) {
      fetchMessages();
    }
  }, [reservationId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:5276/api/messages/${reservationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !reservationId) return;

    try {
      const response = await fetch(`http://localhost:5276/api/Reservation/${reservationId}`);
      if (!response.ok) throw new Error("Failed to fetch reservation details");
      
      const reservation = await response.json();
      
      const messageData = {
        reservationId: reservationId,
        senderId: sessionId,
        receiverId: 1,
        content: newMessage
      };
      
      const msgResponse = await fetch("http://localhost:5276/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData)
      });
      
      if (msgResponse.ok) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="messaging-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Messaging</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {showApproval && isAdmin ? (
          <AdminReservationApproval 
            reservationId={reservationId} 
            onClose={() => setShowApproval(false)} 
          />
        ) : (
          <>
            <div className="messages-container">
              {messages.length > 0 ? (
                messages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`message ${msg.senderId === sessionId ? 'sent' : 'received'}`}
                  >
                    <p>{msg.content}</p>
                    <span className="timestamp">{new Date(msg.sentAt).toLocaleTimeString()}</span>
                  </div>
                ))
              ) : (
                <p className="no-messages">No messages yet</p>
              )}
            </div>

            <div className="message-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
              />
              <button onClick={sendMessage}>Send</button>
            </div>

            {isAdmin && (
              <div className="admin-actions">
                <button onClick={() => setShowApproval(true)}>
                  Manage Reservation
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MessagingModal;