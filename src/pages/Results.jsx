import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
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
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { easeTo, flyTo } from "mapbox-gl";
import InputAdornment from "@mui/material/InputAdornment";
import { IoIosArrowDown } from "react-icons/io";
import Menu from "@mui/material/Menu";

export default function Results() {
  const location = useLocation();
  const initialFilterType = location.state ? location.state.filterType : null;
  const [selectedLocation, setSelectedLocation] = useState(null);
  const locations = MoroccanPlaces();
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedLocationCoordinates, setSelectedLocationCoordinates] =
    useState(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const mapRef = useRef(null);
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: initialFilterType,
    listingType: null,
  });
  const [viewport, setViewport] = useState({
    latitude: 31.7917, // Default latitude
    longitude: -7.0926, // Default longitude
    zoom: 6,
  });

  const [sortingOptions, setSortingOptions] = useState([
    { label: "Price (Low to High)", value: "asc" },
    { label: "Price (High to Low)", value: "desc" },
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
  ]);

  const [selectedSortingOption, setSelectedSortingOption] = useState(
    sortingOptions[0]
  );

  const [sortOrder, setSortOrder] = useState("asc"); // Default sort order is ascending

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleSortOrderChange = (option) => {
    setSortOrder(option.value);
    setSelectedSortingOption(option); // Update with the entire object
    handleMenuClose();
  };

  useEffect(() => {
    // Fetch listings when the sort order changes
    fetchListings();
  }, [sortOrder]);

  const handleSearch = () => {
    // Trigger the fetching of listings when the search button is clicked
    fetchListings();
  };

  useEffect(() => {
    // Fetch listings when the component mounts
    fetchListings();
  }, [location.state]);

  useEffect(() => {
    const handleFlyTo = () => {
      if (selectedLocationCoordinates && mapRef.current) {
        const newViewport = {
          latitude: selectedLocationCoordinates.latitude,
          longitude: selectedLocationCoordinates.longitude,
          zoom: 12,
        };

        // Introduce a delay before calling flyTo
        setTimeout(() => {
          // Use flyTo for smooth transitions
          mapRef.current.flyTo(newViewport);
        }, 100); // Adjust the delay time as needed
      }
    };

    handleFlyTo(); // Call it immediately on mount

    return () => {
      // Cleanup
      mapRef.current = null;
    };
  }, [selectedLocationCoordinates]);

  async function fetchListings() {
    try {
      const listingRef = collection(db, "listings");

      let baseQuery = query(listingRef);
          baseQuery = query(baseQuery, where("status", "==", "approved"));


      if (filters.type) {
        baseQuery = query(baseQuery, where("type", "==", filters.type));
      }

      if (filters.listingType) {
        baseQuery = query(
          baseQuery,
          where("listingType", "==", filters.listingType)
        );
      }

      if (minPrice !== "") {
        baseQuery = query(
          baseQuery,
          where("regularPrice", ">=", parseFloat(minPrice))
        );
      }

      if (maxPrice !== "") {
        baseQuery = query(
          baseQuery,
          where("regularPrice", "<=", parseFloat(maxPrice))
        );
      }

      if (selectedLocationCoordinates) {
        setViewport({
          ...viewport,
          latitude: selectedLocationCoordinates.latitude,
          longitude: selectedLocationCoordinates.longitude,
          zoom: 14, // You can adjust the zoom level as needed
        });
      }

      // Apply sorting
      switch (sortOrder) {
        case "asc":
          console.log("Sorting by Price Ascending");
          baseQuery = query(
            baseQuery,
            orderBy("regularPrice"), // Use only one orderBy for the same property
            orderBy("timestamp")
          );
          break;
        case "desc":
          console.log("Sorting by Price Descending");
          baseQuery = query(
            baseQuery,
            orderBy("regularPrice", "desc"), // Use only one orderBy for the same property
            orderBy("timestamp", "desc")
          );
          break;
        case "newest":
          console.log("Sorting by Newest");
          baseQuery = query(
            baseQuery,
            orderBy("timestamp", "desc"),
            orderBy("regularPrice")
            // Use only one orderBy for the same property
          );
          break;
        case "oldest":
          console.log("Sorting by Oldest");
          baseQuery = query(
            baseQuery,
            orderBy("timestamp"),
            orderBy("regularPrice")
            // Use only one orderBy for the same property
          );
          break;
        default:
          break;
      }

      console.log("Final Query:", baseQuery);

      const querySnap = await getDocs(baseQuery);
      console.log("Query Snap:", querySnap.docs);

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

  function getMarkerColor(type) {
    // You can customize this function to return different colors based on your requirements
    if (type === "sale") {
      return "red";
    } else if (type === "rent") {
      return "orange";
    } else {
      // Default color for other cases
      return "blue";
    }
  }
  return (
    <div className="flex flex-col border-t-2 h-screen">
      <SecondHeader />
      <div className="hidden md:flex px-2 gap-4 mt-2 mb-2 bg-white items-center ">
        <div className="hidden relative md:px-2 sm:flex items-center">
          <Autocomplete
            className="bg-white rounded outline-0 custom-autocomplete"
            options={locations}
            getOptionLabel={(option) => option.name}
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
                InputProps={{
                  ...params.InputProps,
                  classes: {
                    root: selectedLocation ? "search-selected" : "",
                  },
                }}
                onChange={(event, newValue) => {
                  setSelectedLocation(newValue);
                }}
              />
            )}
            // Inside the onChange handler for Autocomplete component
            onChange={(event, newValue) => {
              setSelectedLocation(newValue);
              // Update the viewport immediately when a new location is selected
              if (newValue) {
                setViewport({
                  latitude: newValue.latitude,
                  longitude: newValue.longitude,
                  zoom: 12,
                });
              } else {
                // If the value is cleared, set viewport to default values
                setViewport({
                  latitude: 31.7917, // Default latitude
                  longitude: -7.0926, // Default longitude
                  zoom: 6,
                });
              }
            }}
            filterOptions={(options, { inputValue }) => {
              if (inputValue.trim() === "") {
                return [
                  {
                    name: "Type your address",
                    latitude: 33.5731,
                    longitude: -7.5898,
                  },
                ];
              }

              const filteredOptions = options.filter((option) =>
                option.name.toLowerCase().includes(inputValue.toLowerCase())
              );
              return filteredOptions.slice(0, 6);
            }}
          />
          {selectedLocation === null && (
            <FaSearch style={{ marginLeft: -30, cursor: "pointer" }} />
          )}
        </div>

        <div className="flex space-x-1 md:space-x-4">
          <FormControl variant="outlined">
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
              renderValue={(value) =>
                value ? value.charAt(0).toUpperCase() + value.slice(1) : "Type"
              }
              className={`bg-white capitalized  rounded outline-0 ${
                filters.type ? "bg-red-50" : ""
              }`}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="sale">For Sale</MenuItem>
              <MenuItem value="rent">For Rent</MenuItem>
            </Select>
          </FormControl>
          <FormControl
            variant="outlined"
            className="bg-white rounded outline-0"
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
              renderValue={(value) =>
                value
                  ? value.charAt(0).toUpperCase() + value.slice(1)
                  : "Listing Type"
              }
              className={`bg-white capitalized  rounded outline-0 ${
                filters.listingType ? "bg-red-50" : ""
              }`}
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
          <TextField
            type="number"
            label="Min Price"
            variant="outlined"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="bg-white h-10 sm:h-12 sm:py-7 rounded outline-0"
            InputProps={{
              inputProps: { step: "any" },
              endAdornment: (
                <InputAdornment
                  position="end"
                  style={{ marginLeft: "auto", paddingLeft: "8px" }}
                >
                  Dh
                </InputAdornment>
              ),
            }}
          />
          <TextField
            type="number"
            label="Max Price"
            variant="outlined"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            InputProps={{
              inputProps: { step: "any" },
              endAdornment: (
                <InputAdornment
                  position="end"
                  style={{ marginLeft: "auto", paddingLeft: "8px" }}
                >
                  Dh
                </InputAdornment>
              ),
            }}
            className="bg-white h-10 sm:h-12 sm:py-7 rounded outline-0"
          />
        </div>
        <button
          className="bg-custom-red text-white rounded h-full px-2"
          onClick={handleSearch}
        >
          Apply Filters
        </button>
      </div>
      <div className="flex flex-col overflow-hidden lg:flex-row">
        <div className="hidden md:block w-3/5 ">
          <div className="top-0 w-full col-span-1 overflow-hidden rounded">
            <div className="rounded">
              <div className=" w-full h-[calc(100vh-4rem)]">
                <ReactMapGL
                  {...viewport}
                  width="100%"
                  height="100%"
                  ref={(map) => (mapRef.current = map)}
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
                        latitude={listing.data.latitude}
                        longitude={listing.data.longitude}
                        onClick={() => {
                          setSelectedListing(listing);
                          setSelectedMarker({
                            latitude: listing.data.latitude,
                            longitude: listing.data.longitude,
                          });
                        }}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill={getMarkerColor(listing.data.type)}
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="marker"
                          style={{
                            filter: "drop-shadow(0px 3px 1px rgba(0,0,0,0.5))",
                          }}
                        >
                          <circle cx="12" cy="12" r="10" stroke="white" />
                        </svg>
                      </Marker>
                    ))}
                  {selectedMarker && selectedListing && (
                    <Popup
                      latitude={selectedMarker.latitude}
                      longitude={selectedMarker.longitude}
                      onClose={() => setSelectedListing(null)}
                      closeButton={true}
                      closeOnClick={false}
                      tipSize={0}
                      anchor="top" // Adjust the anchor position as needed
                      style={{
                        maxWidth: "300px",
                        minWidth: "300px",
                        maxHeight: "300px",
                        minHeight: "300px",
                      }}
                    >
                      <ListingItem
                        key={selectedListing.id}
                        id={selectedListing.id}
                        listing={selectedListing.data}
                      />
                    </Popup>
                  )}
                </ReactMapGL>{" "}
              </div>
            </div>
          </div>
        </div>

        <div className=" md:w-2/5 overflow-y-auto ">
          <p className="text-xl md:text-2xl px-3 mt-2 ">Available listings.</p>
          <div className="flex px-3">
            <div className="w-1/2 justify-start">
              <p className="mb-4 text-sm md:text-md">
                {listings ? listings.length : 0} results
              </p>
            </div>
            <div className="flex px-2 w-1/2 justify-end">
              <p className="flex h-2/3 text-sm md:text-md justify-start text-red-600 font-semibold hover:text-red-800 cursor-pointer">
                Sort:{" "}
                {selectedSortingOption.label !== "" &&
                  `${selectedSortingOption.label}`}
                <IoIosArrowDown
                  className="mt-1 ml-1"
                  onClick={handleMenuOpen}
                />
                <Menu
                  anchorEl={menuAnchorEl}
                  open={Boolean(menuAnchorEl)}
                  onClose={handleMenuClose}
                >
                  {sortingOptions.map((option) => (
                    <MenuItem
                      key={option.value}
                      onClick={() => handleSortOrderChange(option)}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Menu>
              </p>
            </div>
          </div>
          <div className="items-center px-2 ">
            {loading ? (
              <Spinner />
            ) : listings.length > 0 ? (
              <>
                <main className="flex flex-col mx-auto items-center justify-center ">
                  <ul className="w-full  sm:grid grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-2">
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
