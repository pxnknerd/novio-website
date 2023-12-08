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
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaParking,
  FaChair,
} from "react-icons/fa";

export default function Listing() {
    const params = useParams()
    const [listing, setListing] = useState(null) 
    const [loading, setLoading] = useState(true)
    const [shareLinkCopied, setShareLinkCopied] = useState(false)

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
              className="relative w-full overflow-hidden h-[600px]"
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
        <p className="fixed top-[22%] right-[5%] font-semibold bg-black b rounded text-white p-2 z-10">Link Copied</p>
       )}
       <div className='m-4 flex flex-col md:flex-row max-w-6xl lg:mx-auto p-4 rounded-lg border-3 capitalize shadow-lg lg:space-x-5'>
        <div className=' w-full h-[200px] lg-[400px]'>
          <p className='text-2xl font-bold mb-3 text-blue-700'>
            {listing.name} - $ {listing.offer ? listing.discountedPrice.toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",") : listing.regularPrice.toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  {listing.type === "rent" ? " / month" : ""}
          </p>
          <p className='flex capitalize items-center mt-6 mb-3 font-semibold'><FaLocationDot className='text-green-600 mr-1'/>{listing.address}</p>
        <div className='flex justify-start items-center space-x-4 w-[75%]'>
          <p className='bg-red-800 w-full max-w-[200px] capitalize rounded-md p-1 text-white text-center font-semibold shadow-md'>{listing.type === "rent" ? "Rent" : "sale"}</p>
          {listing.offer && (
            <p className='w-full max-w-[200px] bg-green-800 rounded-md p-1 text-white text-center font-semibold shadow-md capitalize'>$ {listing.regularPrice - listing.discountedPrice} discount</p>
            )}
        </div>
        <p className="mt-3 mb-3 capitalize">
            <span className="font-semibold">Description - </span>
            {listing.description}
          </p>
          <ul className="flex items-center space-x-2 sm:space-x-10 text-sm font-semibold mb-6">
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
        </div>
        <div className='bg-blue-300 w-full h-[200px] lg-[400px] z-10 overflow-hidden'></div>
       </div>

  </main>
  )
}
