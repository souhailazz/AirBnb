import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MyReservations.css'; // Import the CSS file
import { FaHome, FaMapMarkerAlt, FaUser, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa'; // Import icons
import { jsPDF } from 'jspdf'; // Import jsPDF

const MyReservations = () => {
    const [reservations, setReservations] = useState([]);
    const sessionId = sessionStorage.getItem('userId'); // Retrieve session ID dynamically
    const navigate = useNavigate();

    console.log("Session User ID:", sessionId); // Log the session user ID

    useEffect(() => {
        if (!sessionId) {
            // If there's no sessionId (user is not logged in), redirect to the login page
            navigate('/login');
            return;
        }

        const fetchReservations = async () => {
            try {
                const response = await axios.get(`https://backend-production-886a.up.railway.app/api/Reservation/reservations/${sessionId}`);
                setReservations(response.data);
            } catch (error) {
                console.error("Error fetching reservations:", error);
                if (error.response && error.response.status === 401) {
                    navigate('/login');
                }
            }
        };

        fetchReservations();
    }, [sessionId, navigate]);

    const downloadPDF = async (reservation) => {
        const doc = new jsPDF();
    
        // Charger une police personnalisée (Font Awesome)
        const fontAwesomeURL = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/webfonts/fa-solid-900.ttf";
    
        const response = await fetch(fontAwesomeURL);
        const fontData = await response.arrayBuffer();
    
        doc.addFileToVFS("FontAwesome.ttf", fontData);
        doc.addFont("FontAwesome.ttf", "FontAwesome", "normal");
        doc.setFont("FontAwesome");
    
        // Définir le style
        doc.setFontSize(16);
        doc.text("  Details de la Rservation", 10, 15); // Icône "pencil" pour le titre
    
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
    
        const yStart = 30;
        const lineHeight = 10;
    
        doc.text(" Appartement :", 10, yStart);
        doc.text(reservation.appartement.titre, 50, yStart);
    
        doc.text(" Adresse :", 10, yStart + lineHeight);
        doc.text(`${reservation.appartement.adresse}, ${reservation.appartement.ville}`, 50, yStart + lineHeight);
    
        doc.text(" Client :", 10, yStart + 2 * lineHeight);
        doc.text(`${reservation.client.nom} ${reservation.client.prenom}`, 50, yStart + 2 * lineHeight);
    
        doc.text(" Check-in :", 10, yStart + 3 * lineHeight);
        doc.text(`${new Date(reservation.date_depart).toLocaleDateString()} à ${reservation.appartement.checkin_heure}`, 50, yStart + 3 * lineHeight);
    
        doc.text(" Check-out :", 10, yStart + 4 * lineHeight);
        doc.text(`${new Date(reservation.date_sortie).toLocaleDateString()} à ${reservation.appartement.checkout_heure}`, 50, yStart + 4 * lineHeight);
    
        doc.text(" Total :", 10, yStart + 6 * lineHeight);
        doc.text(`${reservation.paiement.total} €`, 50, yStart + 6 * lineHeight);
    
        doc.text("Statut :", 10, yStart + 7 * lineHeight);
        doc.text(reservation.etat, 50, yStart + 7 * lineHeight);
    
        doc.save(`reservation_${reservation.id_reservation}.pdf`);
    };
    
    if (!sessionId) {
        // If there's no sessionId, don't render the reservations (user will be redirected)
        return null;
    }

    return (
        <div className="reservations-container">
            <h1 className="title"><FaHome /> My Reservations</h1>
            {reservations.length > 0 ? (
                reservations.map(reservation => (
                    <div key={reservation.id_reservation} className="reservation-card">
                        <h2 className="reservation-title"><FaHome /> {reservation.appartement.titre}</h2>
                        <p><FaMapMarkerAlt /> Location: {reservation.appartement.adresse}, {reservation.appartement.ville}</p>
                        <p><FaUser /> Client: {reservation.client.nom} {reservation.client.prenom}</p>
                        <p><FaCalendarAlt /> Check-in: {new Date(reservation.date_depart).toLocaleDateString()} {reservation.appartement.checkin_heure}</p>
                        <p><FaCalendarAlt /> Check-out: {new Date(reservation.date_sortie).toLocaleDateString()} {reservation.appartement.checkout_heure}</p>
                        <p><FaMoneyBillWave /> Total: {reservation.paiement.total} €</p>
                        <p>Status: {reservation.etat}</p>
                        <div className="reservation-actions">
                            <button 
                                className="pdf-download-button"
                                onClick={() => downloadPDF(reservation)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Download PDF
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <p>No reservations found.</p>
            )}
        </div>
    );
};

export default MyReservations;