import React from 'react';
import { Link } from 'react-router-dom';
import './ApartmentList.css';

const ApartmentList = ({ apartments, loading, error }) => {
    if (loading) return <div className="loading">Loading apartments...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="ApartmentList">
            {apartments && apartments.length > 0 ? (
                apartments.map((apartment) => {
                    // Vérifier si l'appartement a des photos valides
                    const firstPhoto = 
                        apartment.photos && apartment.photos.length > 0 
                        ? apartment.photos[0].photo_url // Utiliser l'URL depuis l'API
                        : "/default-apartment.jpg";

                    console.log(`Apartment ID: ${apartment.id}, First Photo URL: ${firstPhoto}`);

                    return (
                        <div key={apartment.id} className="ApartmentItem">
                            <Link to={`/apartments/${apartment.id}`}>
                                <img 
                                    src={firstPhoto} 
                                    alt={`Apartment in ${apartment.ville}`} 
                                    className="ApartmentImage"
                                    onError={(e) => {
                                        if (e.target.src !== "/default-apartment.jpg") {
                                            e.target.src = "/default-apartment.jpg"; // Remplacement si l'image ne charge pas
                                        }
                                    }}
                                />
                                <div className="ApartmentDetails">
                                    <h2>{apartment.titre || "No Title"}</h2>
                                    <p><strong>Price:</strong> {apartment.prix ? `${apartment.prix} EUR/night` : "Not Available"}</p>
                                    <p><strong>Capacity:</strong> {apartment.capacite ? `${apartment.capacite} guests` : "N/A"}</p>
                                    <p><strong>Address:</strong> {apartment.adresse ? apartment.adresse : "Unknown"}, {apartment.ville ? apartment.ville : "Unknown"}</p>
                                </div>
                            </Link>
                        </div>
                    );
                })
            ) : (
                <div>No apartments found.</div>
            )}
        </div>
    );
};

export default ApartmentList;
