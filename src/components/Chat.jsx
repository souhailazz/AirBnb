import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './Chat.css';

const Chat = ({  }) => {
    const navigate = useNavigate();
    const [chats, setChats] = useState([]); // List of conversations
    const [messages, setMessages] = useState([]); // Messages for selected chat
    const [newMessage, setNewMessage] = useState(""); 
    const [selectedChat, setSelectedChat] = useState(null); // Active chat
    const [reservationDecided, setReservationDecided] = useState(false); // Track if reservation has been decided
    const [reservationStatuses, setReservationStatuses] = useState({}); // Keep track of reservation statuses
    const [processingPayment, setProcessingPayment] = useState(false); // Flag for payment processing state
    
    const sessionId = parseInt(sessionStorage.getItem('userId') || '0');
    const isAdmin = sessionId === 1; // Check if current user is admin

    // Check session and redirect if not logged in
    useEffect(() => {
        if (!sessionId) {
            navigate('/login');
            return;
        }
    }, [sessionId, navigate]);
    
    useEffect(() => {
        if (sessionId === 0) {
            console.error("Invalid sessionId");
            return;
        }
        
        fetch(`https://backend-production-886a.up.railway.app/api/message/chats/${sessionId}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log("Chats data:", data); // Debug log
                setChats(data);
                
                // Fetch status for each reservation
                data.forEach(chat => {
                    fetchReservationStatus(chat.reservationId);
                });
            })
            .catch(error => console.error("Error fetching chat list:", error));
    }, [sessionId]);

    // Fetch reservation status
    const fetchReservationStatus = async (reservationId) => {
        try {
            const response = await fetch(`https://backend-production-886a.up.railway.app/api/Reservation/${reservationId}`);
            if (!response.ok) {
                throw new Error(`Error fetching reservation: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Update our status tracking object
            setReservationStatuses(prev => ({
                ...prev,
                [reservationId]: data.etat // Store the status by reservation ID
            }));
            
            console.log(`Reservation #${reservationId} status: ${data.etat}`);
        } catch (error) {
            console.error(`Error fetching reservation status for #${reservationId}:`, error);
        }
    };

    // Fetch messages for selected chat
    useEffect(() => {
        if (selectedChat) {
            fetch(`https://backend-production-886a.up.railway.app/api/message/${selectedChat.reservationId}`)
                .then(res => res.json())
                .then(data => {
                    setMessages(data);
                    
                    // Check if this reservation already has a decision
                    const currentStatus = reservationStatuses[selectedChat.reservationId];
                    setReservationDecided(
                        currentStatus === "Confirmed" || 
                        currentStatus === "Denied"
                    );
                })
                .catch(error => console.error("Error fetching messages:", error));
        }
    }, [selectedChat, reservationStatuses]);

    // Send message
    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;

        const messageData = {
            reservationId: selectedChat.reservationId,
            senderId: sessionId,
            receiverId: sessionId === selectedChat.clientId ? selectedChat.adminId : selectedChat.clientId,
            content: newMessage
        };

        const response = await fetch("https://backend-production-886a.up.railway.app/api/message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(messageData)
        });

        if (response.ok) {
            fetch(`https://backend-production-886a.up.railway.app/api/message/${selectedChat.reservationId}`)
                .then(res => res.json())
                .then(data => setMessages(data))
                .catch(error => console.error("Error fetching messages:", error));

            setNewMessage("");
        }
    };

    // Create Stripe checkout session and send link via message
    const createAndSendStripeCheckout = async (reservationId) => {
        try {
            setProcessingPayment(true);
            
            // Fetch reservation details to get apartment ID and calculate total
            const reservationResponse = await fetch(`https://backend-production-886a.up.railway.app/api/Reservation/${reservationId}`);
            if (!reservationResponse.ok) {
                throw new Error("Failed to fetch reservation details");
            }
            
            const reservationData = await reservationResponse.json();
            
            // Fetch apartment details to get pricing
            const apartmentResponse = await fetch(`https://backend-production-886a.up.railway.app/api/Apartments/${reservationData.id_appartement}`);
            if (!apartmentResponse.ok) {
                throw new Error("Failed to fetch apartment details");
            }
            
            const apartmentData = await apartmentResponse.json();
            
            // Calculate number of nights
            const startDate = new Date(reservationData.date_depart);
            const endDate = new Date(reservationData.date_sortie);
            const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            
            // Calculate total price
            const totalAmount = apartmentData.prix * nights + apartmentData.frais_menage;
            
            // Create Stripe checkout session
            const response = await fetch('https://backend-production-886a.up.railway.app/api/Payments/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reservationId: reservationId,
                    amount: totalAmount,
                    returnUrl: `${window.location.origin}/apartments/${reservationData.id_appartement}`
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to create payment session: ${errorText}`);
            }

            // Extract the checkout URL from the response
            const data = await response.json();
            const checkoutUrl = data.url || data.Url;
            
            if (!checkoutUrl) {
                throw new Error('No checkout URL received from server');
            }
            
            // Send the payment link to the client via chat
            const paymentMessage = {
                reservationId: selectedChat.reservationId,
                senderId: sessionId, // Admin
                receiverId: selectedChat.clientId, // Client
                content: `Your reservation has been approved! Please complete your payment using this link: ${checkoutUrl}`
            };
            
            const messageSent = await fetch("https://backend-production-886a.up.railway.app/api/message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(paymentMessage)
            });
            
            if (!messageSent.ok) {
                throw new Error("Failed to send payment link message");
            }
            
            // Refresh messages to show the payment link
            fetch(`https://backend-production-886a.up.railway.app/api/message/${selectedChat.reservationId}`)
                .then(res => res.json())
                .then(data => setMessages(data))
                .catch(error => console.error("Error refreshing messages:", error));
                
            alert("Payment link generated and sent to client!");
        } catch (error) {
            console.error("Error creating payment session:", error);
            alert(`Failed to generate payment link: ${error.message}`);
        } finally {
            setProcessingPayment(false);
        }
    };

    // Update reservation status
    const updateReservationStatus = async (reservationId, status) => {
        try {
            const statusDto = {
                etat: status // The API expects an object with 'etat' property
            };

            const response = await fetch(`https://backend-production-886a.up.railway.app/api/Reservation/${reservationId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(statusDto)
            });

            if (!response.ok) {
                throw new Error(`Failed to update reservation status: ${response.statusText}`);
            }

            // Send a confirmation message about the status update
            const statusMessage = {
                reservationId: selectedChat.reservationId,
                senderId: sessionId,
                receiverId: selectedChat.clientId, // Send to client
                content: `Reservation #${reservationId} has been ${status}.`
            };

            await fetch("https://backend-production-886a.up.railway.app/api/message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(statusMessage)
            });

            // Update our status tracking
            setReservationStatuses(prev => ({
                ...prev,
                [reservationId]: status
            }));
            
            // Set that a decision has been made
            setReservationDecided(true);

            // Refresh messages
            fetch(`https://backend-production-886a.up.railway.app/api/message/${selectedChat.reservationId}`)
                .then(res => res.json())
                .then(data => setMessages(data))
                .catch(error => console.error("Error fetching messages:", error));

            // If approved, generate and send payment link
            if (status === "Confirmed") {
                await createAndSendStripeCheckout(reservationId);
            }

            alert(`Reservation ${status} successfully!`);
        } catch (error) {
            console.error("Error updating reservation status:", error);
            alert(`Failed to ${status} reservation: ${error.message}`);
        }
    };

    return (
        <div className="chat-container">
            {/* Chat List View */}
            {!selectedChat ? (
                <div className="chat-list">
                    <h3>Chats</h3>
                    {chats.map(chat => (
                        <div 
                            key={chat.reservationId} 
                            className="chat-item"
                            onClick={() => setSelectedChat(chat)}
                        >
                            <p><strong>Chat with {chat.clientId === sessionId ? "Admin" : "Client"}</strong></p>
                            <p>Reservation #{chat.reservationId} 
                               {reservationStatuses[chat.reservationId] && 
                                <span className={`status-badge ${reservationStatuses[chat.reservationId].toLowerCase()}`}>
                                  {reservationStatuses[chat.reservationId]}
                                </span>}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                /* Chat Messages View */
                <div className="chat-box">
                    <button onClick={() => setSelectedChat(null)}>⬅ Back</button>
                    <h3>Chat with {selectedChat.clientId === sessionId ? "Admin" : "Client"}</h3>
                    <h4>
                      Reservation #{selectedChat.reservationId}
                      {reservationStatuses[selectedChat.reservationId] && 
                       <span className={`status-badge ${reservationStatuses[selectedChat.reservationId].toLowerCase()}`}>
                         {reservationStatuses[selectedChat.reservationId]}
                       </span>}
                    </h4>
                    
                    {/* Admin-only: Reservation Approval Buttons - only show if not already decided */}
                    {isAdmin && !reservationDecided && (
                        <div className="admin-actions">
                            <button 
                                className="approve-btn"
                                onClick={() => updateReservationStatus(selectedChat.reservationId, "Confirmed")}
                                disabled={processingPayment}
                            >
                                {processingPayment ? "Processing..." : "Approve Reservation"}
                            </button>
                            <button 
                                className="deny-btn"
                                onClick={() => updateReservationStatus(selectedChat.reservationId, "Denied")}
                                disabled={processingPayment}
                            >
                                Deny Reservation
                            </button>
                        </div>
                    )}
                    
                    {/* Admin-only: Send Payment Link button - only show if approved but payment not sent */}
                    {isAdmin && 
                     reservationStatuses[selectedChat.reservationId] === "Confirmed" && 
                     !messages.some(msg => msg.content.includes("complete your payment using this link")) && (
                        <div className="admin-actions">
                            <button 
                                className="payment-btn"
                                onClick={() => createAndSendStripeCheckout(selectedChat.reservationId)}
                                disabled={processingPayment}
                            >
                                {processingPayment ? "Processing..." : "Send Payment Link"}
                            </button>
                        </div>
                    )}
                    
                    <div className="messages">
                        {messages.map(msg => (
                            <div key={msg.id} className={msg.senderId === sessionId ? "sent" : "received"}>
                                {/* Special rendering for payment links */}
                                {msg.content.includes("complete your payment using this link") ? (
                                    <div className="payment-message">
                                        <p>
                                            {msg.content.split("using this link:")[0]} using this link:
                                        </p>
                                        <a 
                                            href={msg.content.split("using this link:")[1].trim()} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="payment-link"
                                        >
                                            Complete Payment
                                        </a>
                                    </div>
                                ) : (
                                    <p>{msg.content}</p>
                                )}
                                <small>{new Date(msg.sentAt).toLocaleTimeString()}</small>
                            </div>
                        ))}
                    </div>

                    <div className="chat-input">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            onKeyPress={(e) => e.key === 'Enter' ? sendMessage() : null}
                            disabled={processingPayment}
                        />
                        <button 
                            onClick={sendMessage}
                            disabled={processingPayment}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
            
            {/* Loading overlay for payment processing */}
            {processingPayment && (
                <div className="loading-overlay">
                    <div className="loading-content">
                        <div className="loading-spinner"></div>
                        <p>Generating payment link...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;