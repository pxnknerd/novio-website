import React, { useState } from "react";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import ListingItem from "./ListingItem";
import "mapbox-gl/dist/mapbox-gl.css";


const MapBoxComponent = ({ listings }) => {
  const [viewport, setViewport] = useState({
    width: "100%",
    height: "100%",
  });

  const [selectedListing, setSelectedListing] = useState(null);

  const handleMarkerClick = (listing) => {
    setSelectedListing(listing);
  };

  const closePopup = () => {
    setSelectedListing(null);
  };

  return (
    <ReactMapGL
      {...viewport}
      mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
      onViewportChange={(newViewport) => setViewport(newViewport)}
      mapStyle="mapbox://styles/mapbox/streets-v11"
    >
      {listings &&
        listings.map((listing) => (
          <Marker
            key={listing.id}
            latitude={listing.data.latitude}
            longitude={listing.data.longitude}
          >
            <div
              onClick={() => handleMarkerClick(listing)}
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: "red",
                border: "2px solid white",
                cursor: "pointer",
              }}
            />
          </Marker>
        ))}

      {selectedListing && (
        <Popup
          latitude={selectedListing.data.latitude}
          longitude={selectedListing.data.longitude}
          onClose={closePopup}
        >
          <ListingItem id={selectedListing.id} listing={selectedListing.data} />
        </Popup>
      )}
    </ReactMapGL>
  );
};

export default MapBoxComponent;
