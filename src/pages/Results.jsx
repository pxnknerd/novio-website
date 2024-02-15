import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";
import { useParams } from "react-router-dom";
import GoogleMapComponent from "../components/GoogleMapComponent";
import { useLocation } from "react-router-dom";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { FaSearch } from "react-icons/fa";
import SecondHeader from "../components/SecondHeaderLg";

export default function Results() {
  const location = useLocation();
  const initialFilterType = location.state ? location.state.filterType : null;
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const params = useParams();
  const listingsPerPage = 6;
  const [filters, setFilters] = useState({
    type: initialFilterType,
    listingType: null,
  });

  useEffect(() => {
    async function fetchListings() {
      try {
        const listingRef = collection(db, "listings");

        // Create a base query with orderBy and limit
        let baseQuery = query(
          listingRef,
          orderBy("timestamp", "desc"),
          limit(listingsPerPage * currentPage)
        );

        // Apply filters
        if (filters.type && filters.type !== "both") {
          baseQuery = query(baseQuery, where("type", "==", filters.type));
        }

        if (filters.listingType) {
          baseQuery = query(
            baseQuery,
            where("listingType", "==", filters.listingType)
          );
        }

        // Execute the query
        const querySnap = await getDocs(baseQuery);
        const listings = querySnap.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }));

        // If "Both" is selected, fetch both sale and rent listings
        if (filters.type === "both") {
          const bothQuery = query(
            listingRef,
            where("type", "in", ["sale", "rent"])
          );

          const bothSnap = await getDocs(bothQuery);

          const bothListings = bothSnap.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }));

          setListings(bothListings);
        } else {
          // If not "Both," set the listings based on the single type filter
          setListings(listings);
        }

        setTotalPages(Math.ceil(listings.length / listingsPerPage));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching listings:", error);
        toast.error("Could not fetch listings");
      }
    }

    fetchListings();
  }, [params.categoryName, currentPage, filters]);

  function handlePageChange(newPage) {
    setCurrentPage(newPage);
  }

  return (
    <div className="flex flex-col border-t-2 h-screen">
      <SecondHeader />
      <div className="relative flex px-2 gap-4 mt-2 mb-2 bg-white ">
        <div className="relative md:px-2 flex items-center">
          <input
            type="search"
            className="hidden sm:flex bg-gray-200 border-gray-200 h-12 sm:h-12 sm:py-6 w-[16rem] sm:w-[30rem] rounded placeholder:text-gray-400 placeholder:text-[16px] sm:placeholder:text-[20px] outline-0"
            placeholder="Search Address"
          />
          <div className="absolute right-4 text-black top-0 h-full flex items-center">
            <FaSearch />
          </div>
        </div>
        <div className="space-x-1 md:space-x-4">
          <Select
            className="bg-white h-10 sm:h-12 sm:py-6 rounded outline-0"
            value={filters.type || ""}
            onChange={(e) =>
              setFilters({ ...filters, type: e.target.value || null })
            }
            displayEmpty
            inputProps={{ "aria-label": "Type" }}
          >
            <MenuItem disabled value="">
              Type
            </MenuItem>
            <MenuItem value="sale">For Sale</MenuItem>
            <MenuItem value="rent">For Rent</MenuItem>
            <MenuItem value="both">Both</MenuItem>
          </Select>
          <Select
            className="bg-white h-10 sm:h-12 sm:py-6 rounded outline-0"
            value={filters.listingType || ""}
            onChange={(e) =>
              setFilters({ ...filters, listingType: e.target.value || null })
            }
            displayEmpty
            inputProps={{ "aria-label": "Listing Type" }}
          >
            <MenuItem disabled value="">
              Category
            </MenuItem>
            <MenuItem value="apartment">Apartment</MenuItem>
            <MenuItem value="villa">Villa</MenuItem>
            <MenuItem value="farmhouse">Farmhouse</MenuItem>
            <MenuItem value="commercial">Commercial</MenuItem>
            <MenuItem value="riad">Riad</MenuItem>
            <MenuItem value="land">Land</MenuItem>
            {/* Add other listing types as needed */}
          </Select>
        </div>
      </div>
      <div className="flex flex-col overflow-hidden lg:flex-row">
        <div className="w-3/5 lg:block ">
          <div className="sticky top-0 -full col-span-1 overflow-hidden rounded h-screen50 lg:h-screen ">
            <div className="overflow-hidden rounded">
              <div className="relative w-full h-[calc(100vh-4rem)]">
                <GoogleMapComponent listings={listings} />
              </div>
            </div>
          </div>
        </div>

        <div className="w-2/5 overflow-y-auto ">
          <div className="items-center px-2 ">
            {loading ? (
              <Spinner />
            ) : listings.length > 0 ? (
              <>
                <main className="flex flex-col mx-auto items-center justify-center ">
                  <ul className="w-full  sm:grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
                    {listings.map((listing) => (
                      <ListingItem
                        key={listing.id}
                        id={listing.id}
                        listing={listing.data}
                      />
                    ))}
                  </ul>
                </main>
                {totalPages > 1 && (
                  <div className="justify-center items-center">
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`${
                          currentPage === index + 1 ? "bg-black" : "bg-black"
                        } rounded-full h-8 w-8 flex items-center justify-center mx-2 focus:outline-none`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col justify-center items-center py-26 h-2/3">
                <h1 className="text-lg md:text-2xl">
                  No matching properties found.
                </h1>
                <p className="text-gray-400 text-sm md:text-md">
                  Try modifying the filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
