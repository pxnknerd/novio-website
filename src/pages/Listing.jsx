import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import Spinner from '../components/Spinner';
import {Swiper, SwiperSlide} from "swiper/react";
import {EffectFade, Autoplay, Navigation, Pagination} from "swiper/modules"
import "swiper/css/bundle"
import {
  FaBed,
  FaBath,
  FaParking,
  FaChair,
} from "react-icons/fa";
import { getAuth } from "firebase/auth";
import Contact from "../components/Contact";

export default function Listing() {
    const auth = getAuth();
    const params = useParams()
    const [listing, setListing] = useState(null) 
    const [loading, setLoading] = useState(true)
    const [contactLandlord, setContactLandlord] = useState(false);
    

    useEffect(()=>{
        async function fetchListing(){
           const docRef = doc(db, "listings", params.listingId)
           const docSnap = await getDoc(docRef);
           if(docSnap.exists()){
            setListing(docSnap.data())
            setLoading(false)
        }
        }
        fetchListing();
    },[params.listingId,])
        if(loading){
            return <Spinner />
        }
  return ( <main>
    <div className='max-w-6xl py-8 mx-auto'>
    <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true, type: "progressbar" }}
        effect="fade"
        autoplay={{ delay: 3000 }}
      >
        {listing.imgUrls.map((url, index) => (
          <SwiperSlide key={index}>
            <div
              className="relative rounded-lg w-full overflow-hidden h-[300px] md:h-[350px]"
              style={{
                background: `url(${listing.imgUrls[index]}) center no-repeat`,
                backgroundSize: "cover",
              }}
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>
       <div className='m-4 flex flex-col md:flex-row max-w-6xl lg:mx-auto p-4 rounded-lg border-3 capitalize lg:space-x-5'>
         <div className=' w-full'>
            <div className="flex items-center">  
              <div className={`w-3 h-3 ${listing.type === 'rent' ? 'bg-yellow-500' : 'bg-green-600'} rounded-full mr-2`}></div>             
                  <p className='flex text-black opacity-80 capitalize text-center font-light'>
                 For {listing.type === "rent" ? "Rent" : "Sale"}
                  </p>
            </div>
            <p className='text-lg  sm:text-2xl font-bold mb-3 text-black'>
            {listing.offer ? (
            <div className="flex items-center">
            <span className="mr-2">
            {listing.discountedPrice
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} DH
            {listing.type === "rent" ? " / month" : ""}
            </span>
            <span className="line-through  text-gray-500">
            {listing.regularPrice
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} DH
            {listing.type === "rent" ? " / month" : ""}
            </span>
            </div>
            ) : (
            <span>
            {listing.regularPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} DH
            {listing.type === "rent" ? " / month" : ""}
            </span>
            )}
            </p>
          <ul className="flex flex-wrap items-center space-x-2 sm:space-x-10 text-xs font-semibold mb-6 ">
          <li className="whitespace-nowrap">
          {+listing.bedrooms > 1 ? `${listing.bedrooms} Beds` : "1 Bed"}
           </li>
           <li className="whitespace-nowrap">
            {+listing.bathrooms > 1 ? `${listing.bathrooms} Baths` : "1 Bath"}
           </li>
           </ul>
            <p className='flex capitalize font-thin items-center mt-6 mb-3'>{listing.address}</p>
            <ul>
            <li className="flex items-center whitespace-nowrap">
              <FaParking className="text-lg mr-1" />
              {listing.parking ? "Parking spot" : "No parking"}
            </li>
            <li className="flex items-center whitespace-nowrap">
              <FaChair className="text-lg mr-1" />
              {listing.furnished ? "Furnished" : "Not furnished"}
            </li>
          </ul>
          {listing.userRef !== auth.currentUser?.uid && !contactLandlord && (
            <div className="mt-6">
              <button
                onClick={() => setContactLandlord(true)}
                className="px-7 py-3 bg-black text-white font-medium text-sm uppercase rounded shadow-md hover:opacity-80 hover:shadow-lg focus:bg-black focus:shadow-lg w-full text-center transition duration-150 ease-in-out "
              >
                Contact
              </button>
            </div>
          )}
          {contactLandlord && (
            <Contact userRef={listing.userRef} listing={listing} />
          )}
        </div>
      </div>
      </div>
    </main>
  );
}