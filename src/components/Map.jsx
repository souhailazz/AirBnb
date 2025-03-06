import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const Map = ({ locations }) => {
  // Adding default locations in Paris if none are provided
  const defaultLocations = [
    { lat: 48.8584, lng: 2.2945 }, // Eiffel Tower
    { lat: 48.8606, lng: 2.3376 }, // Louvre Museum
    { lat: 48.8525, lng: 2.3932 }  // Notre Dame Cathedral
  ];
  const center = locations.length > 0 ? locations[0] : defaultLocations[0];

  return (
    <LoadScript
      googleMapsApiKey="AIzaSyAQlyaR2Dr0fJPTPk3otltkPnyRekZCPpg"
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
      >
        {(locations.length > 0 ? locations : defaultLocations).map((location, index) => (
          <Marker key={index} position={location} />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;