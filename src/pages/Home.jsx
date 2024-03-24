import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import ListingItem from "../components/ListingItem";
import { GrPrevious, GrNext } from "react-icons/gr";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaSearch} from "react-icons/fa";





export default function Home() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
    const sliderRef = useRef(null);
    const sliderRefSm = useRef(null);
    const sliderRefMd = useRef(null);
    const sliderRefLg = useRef(null);

  const navigateToResults = (filterType) => {
    // Use the `navigate` function to go to the Results page
    // Pass the filter type as a query parameter
    navigate("/results", { state: { filterType } });
  };



  // places for rent
  const [rentListings, setRentListings] = useState(null);
  useEffect(() => {
    async function fetchListings() {
      try {
        //get reference
        const listingsRef = collection(db, "listings");
        const q = query(
          listingsRef,
          where("type", "==", "rent"),
          where("status", "==", "approved"),
          orderBy("timestamp", "desc"),
          limit(4)
        );
        const querySnap = await getDocs(q);
        const listings = [];
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setRentListings(listings);
        console.log(listings);
      } catch (error) {
        console.log(error);
      }
    }
    fetchListings();
  }, []);

  // places for sale
  const [saleListings, setSaleListings] = useState(null);
  useEffect(() => {
    async function fetchListings() {
      try {
        //get reference
        const listingsRef = collection(db, "listings");
        const q = query(
          listingsRef,
          where("type", "==", "sale"),
          where("status", "==", "approved"),
          orderBy("timestamp", "desc"),
          limit(4)
        );
        const querySnap = await getDocs(q);
        const listings = [];
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setSaleListings(listings);
        console.log(listings);
      } catch (error) {
        console.log(error);
      }
    }
    fetchListings();
  }, []);
  // all listings
  const [Listings, setListings] = useState(null);
  useEffect(() => {
    async function fetchListings() {
      try {
        //get reference
        const listingsRef = collection(db, "listings");
        const q = query(
          listingsRef,
          orderBy("timestamp", "desc"),
          where("status", "==", "approved"),
          limit(10)
        );
        const querySnap = await getDocs(q);
        const listings = [];
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setListings(listings);
        console.log(listings);
      } catch (error) {
        console.log(error);
      }
    }
    fetchListings();
  }, []);


  return (
    <div>
      <div className="relative h-[24rem] sm:h-[27rem] flex overflow-hidden">
        <img
          src={process.env.PUBLIC_URL + "/img003.jpg"}
          alt="keyz"
          className="object-cover w-full h-full"
        />
        <h1 className="text-white text-center custom-font absolute uppercase inset-0 flex items-center justify-center mb-36 sm:mb-44 text-xl sm:text-4xl ">
          <strong>
            The #1 destination <br /> for real estate in Morocco.
          </strong>
        </h1>

        <div className="absolute text-center top-1/2 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <div className="flex sm:mb-20 items-center">
              <input
                type="search"
                className="bg-white border-white h-12 sm:h-14 sm:py-6 w-[20rem] sm:w-[37rem] rounded pl-5 pr-12 placeholder:text-gray-500 placeholder:text-[16px] sm:placeholder:text-[20px] outline-0"
                placeholder="Address, City, or Neighborhood"
              />
              <div className="absolute right-4 top-0 h-full flex items-center">
                <FaSearch />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block mx-auto pt-4 pb-4 space-y-6 max-w-6xl">
        {Listings && Listings.length > 0 && (
          <div className="m-6 mb-6">
            <div className="flex  justify-between my-2 text-2xl">
              <div>
                <p>New listings on Beytty.</p>
                <p className="text-sm text-gray-500 opacity-80">
                  Check out the new available listings{" "}
                </p>
              </div>
              <div className="flex space-x-4 justify-end">
                <GrPrevious
                  className="cursor-pointer hover:opacity-50"
                  onClick={() => sliderRefLg.current.slickPrev()}
                />
                <GrNext
                  className="cursor-pointer hover:opacity-50"
                  onClick={() => sliderRefLg.current.slickNext()}
                />
              </div>
            </div>
            <Slider
              ref={sliderRefLg} // Attach the ref to the Slider component
              infinite={true}
              speed={500}
              slidesToShow={4}
              slidesToScroll={1}
              draggable={false}
            >
              {Listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </Slider>
          </div>
        )}{" "}
      </div>
      <div className="hidden md:block lg:hidden mx-auto pt-4 pb-4 space-y-6 max-w-3xl">
        {Listings && Listings.length > 0 && (
          <div className="m-6 mb-6">
            <div className="flex justify-between my-4 text-2xl">
              <div>
                <p>New listings on Beytty.</p>
                <p className="text-sm text-gray-500 opacity-80">
                  Check out the new available listings{" "}
                </p>
              </div>{" "}
              <div className="flex space-x-4 justify-end">
                <GrPrevious
                  className="cursor-pointer hover:opacity-50"
                  onClick={() => sliderRefMd.current.slickPrev()}
                />
                <GrNext
                  className="cursor-pointer hover:opacity-50"
                  onClick={() => sliderRefMd.current.slickNext()}
                />
              </div>
            </div>
            <Slider
              ref={sliderRefMd} // Attach the ref to the Slider component
              infinite={true}
              speed={500}
              slidesToShow={3}
              slidesToScroll={1}
            >
              {Listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </Slider>
          </div>
        )}{" "}
      </div>
      <div className="hidden sm:block md:hidden mx-auto pt-4 pb-4 space-y-6 max-w-2xl">
        {Listings && Listings.length > 0 && (
          <div className="m-6 mb-6">
            <div className="flex justify-between my-4 text-2xl">
              <div>
                <p>New listings on Beytty.</p>
                <p className="text-sm text-gray-500 opacity-80">
                  Check out the new available listings
                </p>
              </div>{" "}
              <div className="flex space-x-4 justify-end">
                <GrPrevious
                  className="cursor-pointer hover:opacity-50"
                  onClick={() => sliderRefSm.current.slickPrev()}
                />
                <GrNext
                  className="cursor-pointer hover:opacity-50"
                  onClick={() => sliderRefSm.current.slickNext()}
                />
              </div>
            </div>
            <Slider
              ref={sliderRefSm} // Attach the ref to the Slider component
              infinite={true}
              speed={500}
              slidesToShow={2}
              slidesToScroll={1}
            >
              {Listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </Slider>
          </div>
        )}{" "}
      </div>
      <div className="block sm:hidden w-full">
        {Listings && Listings.length > 0 && (
          <div className="m-6 mb-8 mx-auto max-w-xs">
            <div className="flex px-2 justify-between my-2 text-xl">
              <div>
                <p>New offers on Beytty.</p>
                <p className="text-sm text-gray-500 opacity-80">
                  Check out the new available listings
                </p>
              </div>{" "}
              <div className="flex mt-2 space-x-4 justify-end">
                <GrPrevious
                  className="cursor-pointer focus:opacity-50"
                  onClick={() => sliderRef.current.slickPrev()}
                />
                <GrNext
                  className="cursor-pointer focus:opacity-50"
                  onClick={() => sliderRef.current.slickNext()}
                />
              </div>
            </div>
            <div className="mx-auto max-w-xs">
              <Slider
                ref={sliderRef} // Attach the ref to the Slider component
                infinite={true}
                dots={false}
                speed={500}
                slidesToShow={1}
                slidesToScroll={1}
                draggable={false}
              >
                {Listings.map((listing) => (
                  <ListingItem
                    key={listing.id}
                    listing={listing.data}
                    id={listing.id}
                  />
                ))}
              </Slider>
            </div>
          </div>
        )}{" "}
      </div>

      <div className="bg-gray-50">
        <div className="mx-auto p-8  flex max-w-6xl ">
          <ul className=" grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2">
            <li
              className="cursor-pointer hover:shadow-2xl shadow-lg px-8 items-center flex flex-col rounded-lg bg-white transition duration-300"
              onClick={() => navigateToResults("rent")}
            >
              <h1 className="mt-8 text-2xl mb-8 font-semibold">Rent a Home.</h1>
              <p className="text-center mb-4">
                We're making it easy for you online from finding your dream
                rental to applying for rent hassle-free.
              </p>
              <button
                type="button"
                class="mt-auto mb-8 border-2 border-red-500 rounded text-red-500 hover:bg-red-600 hover:text-white px-4 py-2 transition duration-300"
                onClick={() => navigateToResults("rent")}
              >
                Find Rentals
              </button>
            </li>
            <li
              className="cursor-pointer hover:shadow-2xl shadow-lg px-8 items-center flex flex-col rounded-lg bg-white transition duration-300"
              onClick={() => navigateToResults("sale")}
            >
              <h1 className="mt-8 text-2xl mb-8 font-semibold">Buy a Home.</h1>
              <p className="text-center mb-4">
                Discover your perfect space through an extensive list of unique
                listings you won't find elsewhere
              </p>
              <button
                type="button"
                class="mt-auto mb-8 border-2 border-red-500 rounded text-red-500 hover:bg-red-600 hover:text-white px-4 py-2 transition duration-300"
                à
                onClick={() => navigateToResults("sale")}
              >
                Search Homes
              </button>
            </li>
            <li className="cursor-pointer hover:shadow-2xl shadow-lg px-8 items-center flex flex-col rounded-lg bg-white transition duration-300">
              <h1 className="mt-8 text-2xl mb-8 font-semibold">Sell a Home.</h1>
              <p className="text-center mb-4">
                No matter what approach you choose to sell or rent your place,
                we're here to help you achieve a successful sale.
              </p>
              <button
                type="button"
                class="mt-auto mb-8 border-2 border-red-500 rounded text-red-500 hover:bg-red-600 hover:text-white px-4 py-2 transition duration-300"
              >
                Sell a Home
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div className="hidden mx-auto p-4 space-y-6 max-w-6xl">
        {" "}
        {rentListings && rentListings.length > 0 && (
          <div className="m-6 mb-6">
            <h2 className="px-3 text-2xl ">Places for rent</h2>
            <Link to="/category/rent">
              <p className="px-3 text-sm text-black opacity-70 hover:text-black hover:opacity-100 transition duration-150 ease-in-out">
                show more places for rent
              </p>
            </Link>
            <ul className="sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
              {rentListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </ul>
          </div>
        )}
        {saleListings && saleListings.length > 0 && (
          <div className="m-6 mb-6">
            <h2 className="px-3 text-2xl mt-- ">Places for sale</h2>
            <Link to="/category/sale">
              <p className="px-3 text-sm text-black opacity-70 hover:text-black hover:opacity-100 transition duration-150 ease-in-out">
                show more places for sale
              </p>
            </Link>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
              {saleListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
