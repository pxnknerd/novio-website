import React from 'react'
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";
import { async } from "@firebase/util";
import { Link, useNavigate } from "react-router-dom";

export default function Offers() {
  const navigate = useNavigate(); 
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchListing] = useState(null);
  useEffect(() => {
    async function fetchListings() {
      try {
        const listingRef = collection(db, "listings");
        const q = query(
          listingRef,
          where("offer", "==", true),
          orderBy("timestamp", "desc"),
          limit(8)
        );
        const querySnap = await getDocs(q);
        const lastVisible = querySnap.docs[querySnap.docs.length - 1];
        setLastFetchListing(lastVisible);
        const listings = [];
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setListings(listings);
        setLoading(false);
      } catch (error) {
        toast.error("Could not fetch listing");
      }
    }

    fetchListings();
  }, []);

  async function onFetchMoreListings() {
    try {
      const listingRef = collection(db, "listings");
      const q = query(
        listingRef,
        where("offer", "==", true),
        orderBy("timestamp", "desc"),
        startAfter(lastFetchedListing),
        limit(4)
      );
      const querySnap = await getDocs(q);
      const lastVisible = querySnap.docs[querySnap.docs.length - 1];
      setLastFetchListing(lastVisible);
      const listings = [];
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      setListings((prevState)=>[...prevState, ...listings]);
      setLoading(false);
    } catch (error) {
      toast.error("Could not fetch listing");
    }
  }

  return (
    <div>
       <div className="relative h-[25rem] sm:h-[27rem] flex overflow-hidden">
      <img
        src={process.env.PUBLIC_URL + '/img002.jpg'}
        alt="keyz"
        className="object-cover w-full h-full"
      />
     <h1 className="text-white text-center absolute inset-0 flex items-center justify-center mb-44 sm:mb-44 text-2xl sm:text-4xl font-black">
  Discover the latest offers<br /> available now
</h1>
      
      <div className="absolute text-center bottom-28 sm:bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="text-xl  sm:text-2xl mb-2 text-bold">
      <a
            href="/category/sale"
            className="text-white mr-4 cursor-pointer"
            onClick={() => navigate('/category/sale')}
          >
            Buy
          </a>
          <a
            href="/category/rent"
            className="text-white mr-4 cursor-pointer"
            onClick={() => navigate('/category/rent')}
          >
            Rent
          </a>
          <a
            href="/offers"
            className="text-white font-bold cursor-pointer"
            onClick={() => navigate('/offers')}
          >
            Offers
          </a>
          </div>
        <input
          type="search"
          className="bg-white border-white h-10  sm:h-10 sm:py-6  w-[18rem] sm:w-[37rem] rounded-lg pl-5 mb-8 sm:mb-28 placeholder:text-gray-500 placeholder:text-[16px] sm:placeholder:text-[20px] outline-0"
          placeholder="Address, City, or Neighborhood"
        />
      </div>
    </div>
  <div className="max-w-6xl mx-auto px-6 md:px-2">
    <h1 className="text-3xl text-center mt-6 font-bold mb-6">Offers</h1>
    {loading ? (
      <Spinner />
    ) : listings && listings.length > 0 ? (
      <>
        <main>
          <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3">
            {listings.map((listing) => (
              <ListingItem
                key={listing.id}
                id={listing.id}
                listing={listing.data}
              />
            ))}
          </ul>
        </main>
        {lastFetchedListing && (
          <div className="flex justify-center items-center">
            <button
              onClick={onFetchMoreListings}
              className="rounded-2xl shadow-lg hover:shadow-xl bg-white mt-8 mb-8 px-6 py-3 font-semibold uppercase text-black transition-all duration-300"
            >
              Load more
            </button>
          </div>
        )}
      </>
    ) : (
      <p>There are no current offers</p>
    )}
  </div>
</div>

  );
}