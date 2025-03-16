import { useState, useEffect } from "react";
import './Chat.css';
const Chat = ({  }) => {
    const [chats, setChats] = useState([]); // List of conversations
    const [messages, setMessages] = useState([]); // Messages for selected chat
    const [newMessage, setNewMessage] = useState(""); 
    const [selectedChat, setSelectedChat] = useState(null); // Active chat

    const sessionId = parseInt(sessionStorage.getItem('userId') || '0');
    useEffect(() => {
        if (sessionId === 0) {
            console.error("Invalid sessionId");
            return;
        }
        
        fetch(`http://localhost:5276/api/message/chats/${sessionId}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log("Chats data:", data); // Debug log
                setChats(data);
            })
            .catch(error => console.error("Error fetching chat list:", error));
    }, [sessionId]);

    // Fetch messages for selected chat
    useEffect(() => {
        if (selectedChat) {
            fetch(`http://localhost:5276/api/message/${selectedChat.reservationId}`)
                .then(res => res.json())
                .then(data => setMessages(data))
                .catch(error => console.error("Error fetching messages:", error));
        }
    }, [selectedChat]);

    // Send message
    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedChat) return;

        const messageData = {
            reservationId: selectedChat.reservationId,
            senderId: sessionId,
            receiverId: sessionId === selectedChat.clientId ? selectedChat.adminId : selectedChat.clientId,
            content: newMessage
        };

        const response = await fetch("http://localhost:5276/api/message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(messageData)
        });

        if (response.ok) {
            fetch(`http://localhost:5276/api/message/${selectedChat.reservationId}`)
                .then(res => res.json())
                .then(data => setMessages(data))
                .catch(error => console.error("Error fetching messages:", error));

            setNewMessage("");
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
                        </div>
                    ))}
                </div>
            ) : (
                /* Chat Messages View */
                <div className="chat-box">
                    <button onClick={() => setSelectedChat(null)}>⬅ Back</button>
                    <h3>Chat with {selectedChat.clientId === sessionId ? "Admin" : "Client"}</h3>
                    
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
