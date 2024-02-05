import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import ListingItem from "../components/ListingItem";

export default function Search() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    // Fetch listings from Firestore
    const fetchListings = async () => {
      try {
        const listingsCollection = db.collection("listings");
        const snapshot = await listingsCollection.get();
        const listingsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setListings(listingsData);
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    };

    fetchListings();
  }, []);

  return (
    <div>
      <h1>All Listings</h1>
      <div className="listings-container">
        {listings.map((listing) => (
          <ListingItem key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
