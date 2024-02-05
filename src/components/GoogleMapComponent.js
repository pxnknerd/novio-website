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

  const mapStyles = [
    {
      featureType: "landscape.man_made",
      elementType: "geometry",
      stylers: [
        {
          color: "#f7f1df",
        },
      ],
    },
    {
      featureType: "landscape.natural",
      elementType: "geometry",
      stylers: [
        {
          color: "#d0e3b4",
        },
      ],
    },
    {
      featureType: "landscape.natural.terrain",
      elementType: "geometry",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "poi.business",
      elementType: "all",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "poi.medical",
      elementType: "geometry",
      stylers: [
        {
          color: "#fbd3da",
        },
      ],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [
        {
          color: "#bde6ab",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "labels",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#ffe15f",
        },
      ],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [
        {
          color: "#efd151",
        },
      ],
    },
    {
      featureType: "road.arterial",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#ffffff",
        },
      ],
    },
    {
      featureType: "road.local",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "black",
        },
      ],
    },
    {
      featureType: "transit.station.airport",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#cfb2db",
        },
      ],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [
        {
          color: "#a2daf2",
        },
      ],
    },
  ];
    const handleMarkerClick = (listing) => {
      setSelectedListing(listing);
    };

    const handleInfoWindowClose = () => {
      setSelectedListing(null);
    };

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GEOCODE_API_KEY}
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
