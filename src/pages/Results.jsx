import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { FaSearch } from "react-icons/fa";
import SecondHeader from "../components/SecondHeaderLg";
import Footer from "../components/Footer";
import MoroccanPlaces from "../components/MoroccanPlaces";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import ReactMapGL, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";



export default function Results() {
  const location = useLocation();
  const initialFilterType = location.state ? location.state.filterType : null;
  const [selectedLocation, setSelectedLocation] = useState(null);
  const locations = MoroccanPlaces();

  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const [filters, setFilters] = useState({
    type: initialFilterType,
    listingType: null,
  });
   
 const [viewport, setViewport] = useState({
   latitude: 31.7917, // Default latitude
   longitude: -7.0926, // Default longitude
   zoom: 6,
 });



  useEffect(() => {
    async function fetchListings() {
      try {
        const listingRef = collection(db, "listings");

        let baseQuery = query(
          listingRef,
          orderBy("timestamp", "desc"),
        );

        if (filters.type) {
          baseQuery = query(baseQuery, where("type", "==", filters.type));
        }

        if (filters.listingType) {
          baseQuery = query(
            baseQuery,
            where("listingType", "==", filters.listingType)
          );
        }

        const querySnap = await getDocs(baseQuery);
        const listings = querySnap.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }));

        setListings(listings);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching listings:", error);
        toast.error("Could not fetch listings");
      }
    }

    fetchListings();
  }, [params.categoryName, filters]);



  return (
    <div className="flex flex-col border-t-2 h-screen">
      <SecondHeader />
      <div className="relative flex px-2 gap-4 mt-2 mb-2 bg-white ">
        <div className="hidden relative md:px-2 sm:flex items-center">
          <Autocomplete
            className="bg-white rounded outline-0 custom-autocomplete"
            options={locations}
            getOptionLabel={(option) => option.name}
            getOptionSelected={(option, value) => option.name === value.name}
            style={{ width: 300 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Address"
                variant="outlined"
                inputProps={{
                  ...params.inputProps,
                  autoComplete: "new-password",
                }}
              />
            )}
            onChange={(event, newValue) => {
              setSelectedLocation(newValue);
            }}
            filterOptions={(options, { inputValue }) => {
              const filteredOptions = options.filter((option) =>
                option.name.toLowerCase().includes(inputValue.toLowerCase())
              );
              return filteredOptions.slice(0, 3);
            }}
          />
        </div>

        <div className="space-x-1 md:space-x-4">
          <FormControl
            variant="outlined"
            className="bg-white capitalized h-10 sm:h-12 sm:py-7 rounded outline-0"
          >
            <InputLabel htmlFor="outlined-listing-type" id="listing-type-label">
              Type
            </InputLabel>
            <Select
              labelId="listing-type-label"
              id="outlined-listing-type"
              value={filters.type || "Type"}
              onChange={(e) =>
                setFilters({ ...filters, type: e.target.value || null })
              }
              label="Listing Type"
              displayEmpty
              inputProps={{ "aria-label": "Type" }}
              renderValue={(value) => value || "Type"}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="sale">For Sale</MenuItem>
              <MenuItem value="rent">For Rent</MenuItem>
            </Select>
          </FormControl>
          <FormControl
            variant="outlined"
            className="bg-white h-10 sm:h-12 sm:py-7 rounded outline-0"
          >
            <InputLabel htmlFor="outlined-listing-type" id="listing-type-label">
              Listing Type
            </InputLabel>
            <Select
              labelId="listing-type-label"
              id="outlined-listing-type"
              value={filters.listingType || "Listing Type"}
              onChange={(e) =>
                setFilters({ ...filters, listingType: e.target.value || null })
              }
              label="Listing Type"
              displayEmpty
              inputProps={{ "aria-label": "Listing Type" }}
              renderValue={(value) => value || "Listing Type"}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="apartment">Apartment</MenuItem>
              <MenuItem value="villa">Villa</MenuItem>
              <MenuItem value="farmhouse">Farmhouse</MenuItem>
              <MenuItem value="commercial">Commercial</MenuItem>
              <MenuItem value="riad">Riad</MenuItem>
              <MenuItem value="land">Land</MenuItem>
              {/* Add other listing types as needed */}
            </Select>
          </FormControl>
        </div>
      </div>
      <div className="flex flex-col overflow-hidden lg:flex-row">
        <div className="w-3/5 ">
          <div className="top-0 w-full col-span-1 overflow-hidden rounded ">
            <div className="rounded">
              <div className=" w-full h-[calc(100vh-4rem)]">
                <ReactMapGL
                  {...viewport}
                  width="100%"
                  height="100%"
                  mapStyle="mapbox://styles/mohamedmakdad/clsqz4sct00xn01pf8o9vg38g"
                  onMove={(evt) => setViewport(evt.viewport)}
                  mapboxApiAccessToken={
                    process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
                  }
                >
                  {listings &&
                    listings.map((listing) => (
                      <Marker
                        key={listing.id}
                        latitude={listing.data.latitude} // Set latitude from your listing data
                        longitude={listing.data.longitude} // Set longitude from your listing data
                      >
                        <div style={{ color: "red", fontSize: "10px" }}>
                          {/* You can customize the marker as needed */}
                          &#x1F534;
                        </div>
                      </Marker>
                    ))}
                </ReactMapGL>{" "}
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
          <Footer />
        </div>
      </div>
    </div>
  );
}
