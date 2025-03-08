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
                const response = await axios.get(`http://localhost:5276/api/Reservation/reservations/${sessionId}`);
                setReservations(response.data);
            } catch (error) {
                console.error("Error fetching reservations:", error);
                if (error.response && error.response.status === 401) {
                    // If the session is invalid or unauthorized, redirect to login
                    navigate('/login');
                }
            }
        };

        fetchReservations();
    }, [sessionId, navigate]);

    const downloadPDF = (reservation) => {
        const doc = new jsPDF();
        doc.text(`Reservation Details`, 10, 10);
        doc.text(`Title: ${reservation.appartement.titre}`, 10, 20);
        doc.text(`Location: ${reservation.appartement.adresse}, ${reservation.appartement.ville}`, 10, 30);
        doc.text(`Client: ${reservation.client.nom} ${reservation.client.prenom}`, 10, 40);
        doc.text(`Check-in: ${new Date(reservation.date_depart).toLocaleDateString()} ${reservation.appartement.checkin_heure}`, 10, 50);
        doc.text(`Check-out: ${new Date(reservation.date_sortie).toLocaleDateString()} ${reservation.appartement.checkout_heure}`, 10, 60);
        doc.text(`Total: ${reservation.paiement.total} €`, 10, 70);
        doc.text(`Status: ${reservation.etat}`, 10, 80);
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