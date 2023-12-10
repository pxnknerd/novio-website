import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import Spinner from '../components/Spinner';
import {Swiper, SwiperSlide} from "swiper/react";
import {EffectFade, Autoplay, Navigation, Pagination} from "swiper/modules"
import "swiper/css/bundle"
import { FaLocationDot } from "react-icons/fa6";
import {
  FaShare,
  FaBed,
  FaBath,
  FaParking,
  FaChair,
} from "react-icons/fa";
import { getAuth } from "firebase/auth";
import Contact from "../components/Contact";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

export default function Listing() {
    const auth = getAuth();
    const params = useParams()
    const [listing, setListing] = useState(null) 
    const [loading, setLoading] = useState(true)
    const [shareLinkCopied, setShareLinkCopied] = useState(false)
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
              className="relative w-full overflow-hidden h-[300px] md:h-[350px]"
              style={{
                background: `url(${listing.imgUrls[index]}) center no-repeat`,
                backgroundSize: "cover",
              }}
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="fixed top-[16%] right-[3%] z-10 cursor-pointer " onClick={()=>{
        navigator.clipboard.writeText(window.location.href)
        setShareLinkCopied(true)
        setTimeout(()=>{
          setShareLinkCopied(false)
        }, 2000)
      }}>
         <FaShare className='text-white text-4xl hover:scale-105 duration-200 ease-in-out ' />
      </div>
       {shareLinkCopied && (
        <p className="fixed text-sm w-[] top-[22%] right-[5%] font-semibold bg-black b rounded text-white p-2 z-10">Link Copied</p>
       )}
       <div className='m-4 flex flex-col md:flex-row max-w-6xl lg:mx-auto p-4 rounded-lg border-3 capitalize shadow-lg lg:space-x-5'>
        <div className=' w-full'>
          <p className='text-2xl font-bold mb-3 text-black'>
            {listing.name} - ${listing.offer ? listing.discountedPrice.toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",") : listing.regularPrice.toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  {listing.type === "rent" ? " / month" : ""}
          </p>
          <p className='flex capitalize items-center mt-6 mb-3 font-semibold'><FaLocationDot className='text-black mr-1'/>{listing.address}</p>
        <div className='flex justify-start items-center space-x-4 w-[75%]'>
          <p className='bg-red-700  w-full max-w-[200px] capitalize rounded-md p-1 text-white text-center font-semibold shadow-md'>{listing.type === "rent" ? "Rent" : "sale"}</p>
          {listing.offer && (
            <p className='w-full max-w-[200px] bg-black rounded-md p-1 text-white text-center font-semibold shadow-md capitalize'>-${listing.regularPrice - listing.discountedPrice} off</p>
            )}
        </div>
        <p className="mt-3 mb-3 capitalize">
            <span className="font-semibold">Description - </span>
            {listing.description}
          </p>
          <ul className="flex flex-wrap items-center space-x-2 sm:space-x-10 text-xs font-semibold mb-6 ">
            <li className="flex items-center whitespace-nowrap">
              <FaBed className="text-lg mr-1" />
              {+listing.bedrooms > 1 ? `${listing.bedrooms} Beds` : "1 Bed"}
            </li>
            <li className="flex items-center whitespace-nowrap">
              <FaBath className="text-lg mr-1" />
              {+listing.bathrooms > 1 ? `${listing.bathrooms} Baths` : "1 Bath"}
            </li>
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
        <div className="w-full h-[200px] md:h-[400px] z-10 overflow-x-hidden mt-6 md:mt-0 md:ml-4">
          <MapContainer
            center={[listing.geolocation.lat, listing.geolocation.lng]}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={[listing.geolocation.lat, listing.geolocation.lng]}
            >
              <Popup>
                {listing.address}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </main>
  );
}