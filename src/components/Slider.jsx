import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { useState } from "react";
import { useEffect } from "react";
import Spinner from "../components/Spinner";
import { db } from "../firebase";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  EffectFade,
  Autoplay,
  Navigation,
  Pagination,
} from "swiper/modules";
import "swiper/css/bundle";
import { useNavigate } from "react-router-dom";
export default function Slider() {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    async function fetchListings() {
      const listingsRef = collection(db, "listings");
      const q = query(listingsRef, orderBy("timestamp", "desc"), limit(5));
      const querySnap = await getDocs(q);
      let listings = [];
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      setListings(listings);
      setLoading(false);
    }
    fetchListings();
  }, []);
  if (loading) {
    return <Spinner />;
  }
  if (listings.length === 0) {
    return <></>;
  }
  return (
    listings && (
      <>
        <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true, type: "progressbar" }}
        effect="fade"
        autoplay={{ delay: 3000 }}
      >
          {listings.map(({ data, id }) => (
            <SwiperSlide
              key={id}
              onClick={() => navigate(`/category/${data.type}/${id}`)}
            >
              <div
                style={{
                  background: `url(${data.imgUrls[0]}) center, no-repeat`,
                  backgroundSize: "cover",
                }}
                className="relative w-full h-[300px] overflow-hidden"
              ></div>
              <p className="absolute bottom-2 left-2 bg-black text-white rounded-md px-2 py-1 shadow-lg uppercase text-xs font-semibold">
                {data.name} - ${data.discountedPrice ?? data.regularPrice.toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                {data.type === "rent" && " / month"}
              </p>
            </SwiperSlide>
          ))}
        </Swiper>
      </>
    )
  );
}