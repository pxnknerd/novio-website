
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ListingItem from "../components/ListingItem";
import { FaSearch } from "react-icons/fa";


export default function Home() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [offerListings, setOffersListings] = useState(null)
  useEffect(() =>{

    async function fetchListings(){
      try {
        //get reference
        const listingsRef = collection(db, "listings")
        const q = query(listingsRef, where("offer", "==", true), orderBy("timestamp", "desc"), limit(4));
        const querySnap = await getDocs(q)
        const listings = []
        querySnap.forEach((doc)=>{
          return listings.push({
            id: doc.id,
            data: doc.data(),
        })
        })
        setOffersListings(listings)
        console.log(listings)
      } catch (error) {
        console.log(error)
        
      }
    }
    fetchListings()
  },[])

  // places for rent
  const [rentListings, setRentListings] = useState(null)
  useEffect(() =>{

    async function fetchListings(){
      try {
        //get reference
        const listingsRef = collection(db, "listings")
        const q = query(listingsRef, where("type", "==", "rent"), orderBy("timestamp", "desc"), limit(4));
        const querySnap = await getDocs(q)
        const listings = []
        querySnap.forEach((doc)=>{
          return listings.push({
            id: doc.id,
            data: doc.data(),
        })
        })
        setRentListings(listings)
        console.log(listings)
      } catch (error) {
        console.log(error)
        
      }
    }
    fetchListings()
  },[])

  // places for sale
  const [saleListings, setSaleListings] = useState(null)
  useEffect(() =>{

    async function fetchListings(){
      try {
        //get reference
        const listingsRef = collection(db, "listings")
        const q = query(listingsRef, where("type", "==", "sale"), orderBy("timestamp", "desc"), limit(4));
        const querySnap = await getDocs(q)
        const listings = []
        querySnap.forEach((doc)=>{
          return listings.push({
            id: doc.id,
            data: doc.data(),
        })
        })
        setSaleListings(listings)
        console.log(listings)
      } catch (error) {
        console.log(error)
        
      }
    }
    fetchListings()
  },[])

  const handleNavigation = (path) => {
    setLoading(true);
    // Add a delay of 500 milliseconds (adjust as needed)
    setTimeout(() => {
      navigate(path);
    }, 2000);
  };



  return (
    <div>
       <div className="relative h-[25rem] sm:h-[27rem] flex overflow-hidden">
      <img
        src={process.env.PUBLIC_URL + '/img003.jpg'}
        alt="keyz"
        className="object-cover w-full h-full"
      />
     <h1 className="text-white text-center absolute inset-0 flex items-center justify-center mb-36 sm:mb-44 text-2xl sm:text-4xl ">
  The #1er destination <br /> for real estate in Morocco.
</h1>
      
      <div className="absolute text-center bottom-32 sm:bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="text-xl mb-4 sm:text-2xl">
      <a
            href="/category/sale"
            className="text-white hover:opacity-70 transition ease-in-out duration-200 mr-4 cursor-pointer"
            onClick={() => handleNavigation('/category/sale')}
          >
            Buy
          </a>
          <a
            href="/category/rent"
            className="text-white hover:opacity-70 transition ease-in-out mr-4 cursor-pointer"
            onClick={() => handleNavigation('/category/rent')}
          >
            Rent
          </a>
          <a
            href="/offers"
            className="text-white hover:opacity-70 transition ease-in-out cursor-pointer"
            onClick={() => handleNavigation('/offers')}
          >
            Offers
          </a>
          </div>
          <div className="relative">
  <div className="flex sm:mb-20 items-center">
    <input
      type="search"
      className="bg-white border-white h-10 sm:h-10 sm:py-6 w-[18rem] sm:w-[37rem] rounded-lg pl-5 pr-12 placeholder:text-gray-500 placeholder:text-[16px] sm:placeholder:text-[20px] outline-0"
      placeholder="Address, City, or Neighborhood"
    />
    <div className="absolute right-4  top-0 h-full flex items-center">
      <FaSearch />
    </div>
  </div>
</div>
      </div>
    </div>
      <div className=" mx-auto pt-4 space-y-6 max-w-6xl">
        {offerListings && offerListings.length > 0 && (
          <div className="m-6 mb-6">
            <h2 className="px-3 text-2xl mt-- ">Recent Offers</h2>
            <Link to="/Offers">
              <p className="px-3 text-sm text-black opacity-70 hover:text-black hover:opacity-100 transition duration-150 ease-in-out">show more offers</p>            
            </Link>
            <ul className="sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
              {offerListings.map((listing)=>(
                <ListingItem
                key={listing.id}
                listing={listing.data}
                id={listing.id}
                />
                ))}
            </ul>
          </div>
        )}
        {rentListings && rentListings.length > 0 && (
          <div className="m-6 mb-6">
            <h2 className="px-3 text-2xl ">Places for rent</h2>
            <Link to="/category/rent">
              <p className="px-3 text-sm text-black opacity-70 hover:text-black hover:opacity-100 transition duration-150 ease-in-out">show more places for rent</p>            
            </Link>
            <ul className="sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
              {rentListings.map((listing)=>(
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
              <p className="px-3 text-sm text-black opacity-70 hover:text-black hover:opacity-100 transition duration-150 ease-in-out">show more places for sale</p>            
            </Link>
            <ul className="sm:grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
              {saleListings.map((listing)=>(
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
