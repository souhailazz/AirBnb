import { useState, useEffect } from "react";
import './Chat.css';

const Chat = ({  }) => {
    const [chats, setChats] = useState([]); // List of conversations
    const [messages, setMessages] = useState([]); // Messages for selected chat
    const [newMessage, setNewMessage] = useState(""); 
    const [selectedChat, setSelectedChat] = useState(null); // Active chat
    const [reservationDecided, setReservationDecided] = useState(false); // Track if reservation has been decided
    const [reservationStatuses, setReservationStatuses] = useState({}); // Keep track of reservation statuses
    
    const sessionId = parseInt(sessionStorage.getItem('userId') || '0');
    const isAdmin = sessionId === 1; // Check if current user is admin
    
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
            
            // Set that a decision has been made - this will hide the buttons
            setReservationDecided(true);

            // Refresh messages
            fetch(`https://backend-production-886a.up.railway.app/api/message/${selectedChat.reservationId}`)
                .then(res => res.json())
                .then(data => setMessages(data))
                .catch(error => console.error("Error fetching messages:", error));

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
                            >
                                Approve Reservation
                            </button>
                            <button 
                                className="deny-btn"
                                onClick={() => updateReservationStatus(selectedChat.reservationId, "Denied")}
                            >
                                Deny Reservation
                            </button>
                        </div>
                    )}
                    
                    <div className="messages">
                        {messages.map(msg => (
                            <div key={msg.id} className={msg.senderId === sessionId ? "sent" : "received"}>
                                <p>{msg.content}</p>
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
                        />
                        <button onClick={sendMessage}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;