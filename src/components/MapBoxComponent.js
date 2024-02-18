// MapboxComponent.js
import React, { useState } from "react";
import ReactMapGL from "react-map-gl";

const MapboxComponent = () => {
  const [viewport, setViewport] = useState({
    width: "100%",
    height: "100%",
    latitude: 34.0522, // Latitude for Morocco
    longitude: -6.2423, // Longitude for Morocco
    zoom: 5,
  });

  return (
    <ReactMapGL
      {...viewport}
      mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
      onViewportChange={(newViewport) => setViewport(newViewport)}
      mapStyle="mapbox://styles/mapbox/streets-v11" // You can choose a different style if needed
    />
  );
};

export default MapboxComponent;
