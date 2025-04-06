import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '1000%',  // Changed from 200% to 50% for better proportions
  height: '400px',
  float: 'center', // This positions the map on the right
  marginRight: '20px', // Add some spacing from content to the left
  borderRadius: '20px', // Optional: adds rounded corners
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)' // Optional: adds subtle shadow
};

const mapWrapperStyle = {
  display: 'flex',
  justifyContent: 'flex-end', // Aligns the map container to the right
  width: '100%'
};

const Map = ({ locations }) => {
  // Adding default locations in Paris if none are provided
  const defaultLocations = [
    { lat: 48.8584, lng: 2.2945 }, // Eiffel Tower
    { lat: 48.8606, lng: 2.3376 }, // Louvre Museum
    { lat: 48.8525, lng: 2.3932 }  // Notre Dame Cathedral
  ];
  const center = locations?.length > 0 ? locations[0] : defaultLocations[0];

  return (
    <div style={mapWrapperStyle}>
      <LoadScript googleMapsApiKey="AIzaSyAQlyaR2Dr0fJPTPk3otltkPnyRekZCPpg">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
        >
          {(locations?.length > 0 ? locations : defaultLocations).map((location, index) => (
            <Marker key={index} position={location} />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default Map;