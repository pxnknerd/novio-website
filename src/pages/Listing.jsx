import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import Spinner from '../components/Spinner';
import {Swiper, SwiperSlide} from "swiper/react";
import {EffectFade, Autoplay, Navigation, Pagination} from "swiper/modules"
import "swiper/css/bundle"
import { FaShare } from "react-icons/fa";

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

  </main>
  )
}
