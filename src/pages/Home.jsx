import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ListingItem from "../components/ListingItem";
import { FaSearch } from "react-icons/fa";

export default function Home() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const navigateToResults = (filterType) => {
    // Use the `navigate` function to go to the Results page
    // Pass the filter type as a query parameter
    navigate("/results", { state: { filterType } });
  };
  const [offerListings, setOffersListings] = useState(null);
  useEffect(() => {
    async function fetchListings() {
      try {
        //get reference
        const listingsRef = collection(db, "listings");
        const q = query(
          listingsRef,
          where("offer", "==", true),
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
        setOffersListings(listings);
        console.log(listings);
      } catch (error) {
        console.log(error);
      }
    }
    fetchListings();
  }, []);

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

  const handleNavigation = (path) => {
    setLoading(true);
    // Add a delay of 500 milliseconds (adjust as needed)
    setTimeout(() => {
      navigate(path);
    }, 2000);
  };

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
      <div className=" mx-auto pt-4 pb-4 space-y-6 max-w-6xl">{offerListings && offerListings.length > 0 && (
          <div className="m-6 mb-6">
            <h2 className="px-3 text-2xl mt-- ">Recent Offers</h2>
            <Link to="/Offers">
              <p className="px-3 text-sm text-black opacity-70 hover:text-black hover:opacity-100 transition duration-150 ease-in-out">
                show more offers
              </p>
            </Link>
            <ul className="sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
              {offerListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                />
              ))}
            </ul>
          </div>
        )} </div>

      <div className="bg-gray-100">
        <div className="mx-auto p-8  flex max-w-6xl ">
          <ul className=" grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2">
            <li
              className="cursor-pointer hover:shadow-lg shadow-md px-8 items-center flex flex-col rounded-lg bg-white transition duration-300"
              onClick={() => navigateToResults("rent")}
            >
              <img
                className="w-full object-cover transition-scale duration-200 ease-in"
                loading="lazy"
                src={process.env.PUBLIC_URL + "/RentCard.png"}
                alt=""
              />
              <h1 className="text-2xl mb-8 font-semibold">Rent a Home</h1>
              <p className="text-center">
                We're making it easy for you online from finding your dream
                rental to applying for rent hassle-free.
              </p>
              <button
                type="button"
                class="mt-8 mb-8 border-2 border-red-500 rounded text-red-500 hover:bg-red-600 hover:text-white px-4 py-2 transition duration-300"
                onClick={() => navigateToResults("rent")}
              >
                Find Rentals
              </button>
            </li>
            <li
              className="cursor-pointer hover:shadow-lg shadow-md px-8 items-center flex flex-col rounded-lg bg-white transition duration-300"
              onClick={() => navigateToResults("sale")}
            >
              <img
                className="w-full object-cover transition-scale duration-200 ease-in"
                loading="lazy"
                src={process.env.PUBLIC_URL + "/BuyCard.png"}
                alt=""
              />
              <h1 className="text-2xl mb-8 font-semibold">Buy a Home</h1>
              <p className="text-center">
                Discover your perfect space through an extensive list of unique
                listings you won't find elsewhere
              </p>
              <button
                type="button"
                class="mt-8 mb-8 border-2 border-red-500 rounded text-red-500 hover:bg-red-600 hover:text-white px-4 py-2 transition duration-300"
                à
                onClick={() => navigateToResults("sale")}
              >
                Search Homes
              </button>
            </li>
            <li className="cursor-pointer hover:shadow-lg shadow-md px-8 items-center flex flex-col rounded-lg bg-white transition duration-300">
              <img
                className="w-full object-cover transition-scale duration-200 ease-in"
                loading="lazy"
                src={process.env.PUBLIC_URL + "/SellCard.png"}
                alt=""
              />
              <h1 className="text-2xl mb-8 font-semibold">Sell a Home</h1>
              <p className="text-center">
                No matter what approach you choose to sell or rent your place,
                we're here to help you achieve a successful sale.
              </p>
              <button
                type="button"
                class="mt-8 mb-8 border-2 border-red-500 rounded text-red-500 hover:bg-red-600 hover:text-white px-4 py-2 transition duration-300"
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
