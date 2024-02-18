import React, { useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import ListingItem from "../components/ListingItem";

const libraries = ["places"]; // Move libraries outside the component

const GoogleMapComponent = ({ listings }) => {
  const [selectedListing, setSelectedListing] = useState(null);


    const handleMarkerClick = (listing) => {
      setSelectedListing(listing);
    };

    const handleInfoWindowClose = () => {
      setSelectedListing(null);
    };

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_API_KEY}
      region="MA"
    >
      <GoogleMap
        mapContainerStyle={{
          width: "100%",
          height: "100%",
        }}
        center={{ lat: 33.5731, lng: -7.5898 }}
        zoom={12}
        options={{
          styles: mapStyles,
          mapTypeControl: false,
          streetViewControl: false,
        }}
      >
        {listings &&
          listings.map((listing) => (
            <Marker
              key={listing.id}
              position={{
                lat: listing.data.latitude,
                lng: listing.data.longitude,
              }}
              icon={{
                url: process.env.PUBLIC_URL + "/MyPin.svg",
                scaledSize: new window.google.maps.Size(30, 30),
              }}
              onClick={() => handleMarkerClick(listing)}
            />
          ))}

        {selectedListing && (
          <InfoWindow
            position={{
              lat: selectedListing.data.latitude,
              lng: selectedListing.data.longitude,
            }}
            onCloseClick={handleInfoWindowClose}
            options={{ maxWidth: 300, minWidth: 300, maxHeight: 150 }} // Adjust these values as needed
          >
            {/* Integrate the ListingItem component here */}
            <ListingItem
              listing={selectedListing.data}
              id={selectedListing.id}
            />
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapComponent;
