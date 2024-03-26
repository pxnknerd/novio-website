import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import Spinner from "../components/Spinner";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import { getAuth } from "firebase/auth";
import Contact from "../components/Contact";
import { IoGridOutline } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { MdOutlineVilla } from "react-icons/md";
import { LuSofa } from "react-icons/lu";
import { LuParkingSquare } from "react-icons/lu";
import { MdOutlineConstruction } from "react-icons/md";
import { FaRulerCombined } from "react-icons/fa6";
import Moment from "react-moment";
import MyPin from "../assets/svg/MyPin.svg";
import { Link as ScrollLink } from "react-scroll";
import { IoCallOutline } from "react-icons/io5";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function Listing() {
  const auth = getAuth();
  const params = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [contactLandlord, setContactLandlord] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
const [viewport, setViewport] = useState({
  latitude: 0,
  longitude: 0,
  zoom: 13,
});
  
  // Function to toggle the popup state
  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };


  useEffect(() => {
    async function fetchListing() {
      const docRef = doc(db, "listings", params.listingId);
      const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().status === "approved") {
const listingData = docSnap.data(); // Corrected variable name
setListing(listingData);    
      setViewport({
            latitude: listingData.latitude,
            longitude: listingData.longitude,
            zoom: 13,
          });
        setLoading(false);
      }
    }
    fetchListing();
  }, [params.listingId]);
  if (loading) {
    return <Spinner />;
  }

  const images = listing.imgUrls.map((url) => ({
    original: url,
    thumbnail: url,
    originalHeight: 300,
    originalWidth: 400,
  }));

  return (
    <main>
      <div className="md:hidden bg-gray-100 mb-4">
        <div style={{ overflow: "hidden", position: "relative" }}>
          <ImageGallery
            items={images}
            showThumbnails={false}
            showPlayButton={false}
            showFullscreenButton={false}
            showNav={false}
            disableArrowKeys={true}
            disableSwipe={false}
            onClick={togglePopup}
            onSlide={(currentIndex) => setCurrentImageIndex(currentIndex)}
          />
          {listing.imgUrls.length > 1 && (
            <button className="absolute flex rounded top-4 left-4 px-1 py-1 text-sm bg-white text-black cursor-pointer">
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 ${
                    listing.type === "rent" ? "bg-yellow-500" : "bg-green-600"
                  } rounded-full mr-2`}
                ></div>
                <p className="flex text-black opacity-80 capitalize text-center font-light">
                  For {listing.type === "rent" ? "Rent" : "Sale"}
                </p>
              </div>
            </button>
          )}
          {listing.imgUrls.length > 1 && (
            <button className="absolute flex rounded top-4 right-4 px-2 py-1 bg-black bg-opacity-70 text-black cursor-pointer">
              <div className="flex items-center">
                <p className="flex text-sm font-semibold  text-white  opacity-80 ">
                  {currentImageIndex + 1} of {listing.imgUrls.length}
                </p>
              </div>
            </button>
          )}
        </div>
      </div>
      <div className="hidden md:block max-w-6xl px-8 py-8 mx-auto">
        <div className="hidden md:grid grid-cols-2 gap-1">
          <div className="col-span-2 md:col-span-1 relative h-[400px]">
            {/* Main Image with rounded top-left and bottom-left corners */}
            <img
              src={listing.imgUrls[0]}
              alt="Main Listing"
              className="w-full h-full cursor-pointer object-cover rounded-tl-2xl rounded-bl-2xl"
              onClick={togglePopup}
            />
            {listing.imgUrls.length > 1 && (
              <button className="absolute flex rounded top-4 left-4 px-2 py-2 bg-white text-black cursor-pointer">
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 ${
                      listing.type === "rent" ? "bg-yellow-500" : "bg-green-600"
                    } rounded-full mr-2`}
                  ></div>
                  <p className="flex text-black opacity-80 capitalize text-center font-light">
                    For {listing.type === "rent" ? "Rent" : "Sale"}
                  </p>
                </div>
              </button>
            )}
          </div>
          <div className="col-span-2 md:col-span-1 grid grid-cols-2 grid-rows-2 h-[400px] gap-1 relative">
            {/* 4 Images in the Right Side */}
            {listing.imgUrls.slice(1, 5).map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Image ${index + 2}`}
                onClick={togglePopup}
                className={`w-full cursor-pointer h-full object-cover ${
                  index === 1 ? "rounded-tr-2xl" : ""
                }${index === 3 ? " rounded-br-2xl" : ""}`}
              />
            ))}
            {/* Add button on the bottom right of the last image */}
            {listing.imgUrls.length > 5 && (
              <button
                className="absolute flex rounded bottom-4 right-4 px-3 py-2 bg-white text-black cursor-pointer"
                onClick={togglePopup}
              >
                <IoGridOutline className="mr-2 text-2xl" /> See all{" "}
                {listing.imgUrls.length} photos
              </button>
            )}
          </div>
        </div>
      </div>
      {isPopupOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 flex justify-center items-center z-50">
          <div className="max-w-screen-xl">
            <button
              className="absolute top-0 right-0 p-2 z-50"
              onClick={togglePopup}
            >
              <IoMdClose className="w-10 md:w-12 h-12 md:mr-8  text-white" />
            </button>
            {/* Display all images in the popup */}
            <div className="popup-container">
              <ImageGallery
                showPlayButton={false}
                showFullscreenButton={false}
                items={images}
              />
            </div>
          </div>
        </div>
      )}

      <div className="hidden space-x-4 md:flex max-w-6xl px-8 mx-auto">
        <div className="flex justify-between w-2/3 mx-auto">
          <div className="mx-auto w-full">
            <div className="flex w-full mx-auto justify-between mb-3 text-black">
              {listing.offer ? (
                <div className="flex justify-start w-full">
                  <div className="flex flex-col items-start">
                    <span className="text-2xl md:text-4xl font-bold mr-2">
                      {listing.regularPrice
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      DH
                    </span>
                    <span className="text-lg">{listing.address}</span>
                  </div>
                  <div className="flex justify-end space-x-6  w-full">
                    <div className="flex flex-col items-start">
                      <span className="text-2xl md:text-4xl font-bold mr-2">
                        {+listing.bedrooms > 1 ? `${listing.bedrooms}` : "1"}
                      </span>
                      <span className="text-lg ">Beds</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-2xl md:text-4xl font-bold mr-2">
                        {+listing.bathrooms > 1 ? `${listing.bathrooms}` : "1"}
                      </span>
                      <span className="text-lg ">Baths</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-2xl md:text-4xl font-bold mr-2">
                        {listing.size}
                      </span>
                      <span className="text-lg ">m²</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-start w-full">
                  <div className="flex flex-col items-start">
                    <span className="text-2xl md:text-4xl font-bold mr-2">
                      {listing.regularPrice
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      DH
                    </span>
                    <span className="text-lg">{listing.address}</span>
                  </div>
                  <div className="flex justify-end space-x-6  w-full">
                    <div className="flex flex-col items-start">
                      <span className="text-2xl md:text-4xl font-bold mr-2">
                        {+listing.bedrooms > 1 ? `${listing.bedrooms}` : "1"}
                      </span>
                      <span className="text-lg ">Beds</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-2xl md:text-4xl font-bold mr-2">
                        {+listing.bathrooms > 1 ? `${listing.bathrooms}` : "1"}
                      </span>
                      <span className="text-lg ">Baths</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-2xl md:text-4xl font-bold mr-2">
                        {listing.size}
                      </span>
                      <span className="text-lg ">m²</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-8 grid grid-cols-3 grid-rows-2 gap-4 text-md ">
              {/* Content for the grid cells */}
              <div className="flex items-center capitalize col-span-3 md:col-span-1 row-span-1 bg-gray-100  p-4 rounded-md">
                <MdOutlineVilla className="text-2xl mr-2" />
                {listing.listingType}
                {/* Button or additional content for the first cell */}
              </div>
              <div className="flex items-center capitalize col-span-3 md:col-span-1 row-span-1 bg-gray-100  p-4 rounded-md">
                <li className="flex items-center whitespace-nowrap">
                  <LuSofa className="text-2xl mr-2" />
                  {listing.furnished ? "Furnished" : "Not furnished"}
                  {/* Button or additional content for the second cell */}
                </li>
              </div>
              <div className="flex items-center capitalize col-span-3 md:col-span-1 row-span-1 bg-gray-100  p-4 rounded-md">
                <LuParkingSquare className="text-2xl mr-2" />
                {listing.parking ? "Parking spot" : "No parking"}
                {/* Button or additional content for the third cell */}
              </div>
              <div className="flex items-center capitalize col-span-3 md:col-span-1 row-span-1 bg-gray-100  p-4 rounded-md">
                <MdOutlineConstruction className="text-2xl mr-2" />
                Built in {listing.yearBuilt}
                {/* Button or additional content for the fourth cell */}
              </div>
              <div className="flex items-center  col-span-3 md:col-span-1 row-span-1 bg-gray-100 p-4 rounded-md">
                {listing.type === "sale" ? (
                  <>
                    <FaRulerCombined className="text-2xl mr-2" />
                    {(
                      (listing.regularPrice || listing.regularPrice) /
                      listing.size
                    ).toFixed(2)}
                    DH/m²
                  </>
                ) : (
                  <>
                    <FaRulerCombined className="text-2xl mr-2" />
                    --
                  </>
                )}
              </div>

              <div className="flex items-center capitalize col-span-3 md:col-span-1 row-span-1 bg-gray-100 p-4 rounded-md">
                <img
                  src="/favicon.ico" // Update the path if the favicon.ico is in a different subdirectory
                  alt="Parking Icon"
                  className="w-7 h-7 mr-2"
                />
                --
                {/* Button or additional content for the sixth cell */}
              </div>
            </div>
            <div className="mt-10">
              <h1 className="text-3xl font-semibold">Highlights</h1>
              <p className="mt-2">{listing.description}</p>
              <p className="mt-4">
                Listing updated : {}
                <Moment className="font-semibold " fromNow>
                  {listing.timestamp?.toDate()}
                </Moment>
              </p>
              <p>
                Last update : {}
                <Moment className="font-semibold ">
                  {listing.timestamp?.toDate()}
                </Moment>
              </p>
              <h1 className="mt-8 text-3xl font-semibold">Location</h1>
              <div className="mt-4 bg-gray-100 border-4 border-gray-300 h-[400px] rounded-lg">
                <ReactMapGL
                  {...viewport}
                  width="100%"
                  height="100%"
                  mapStyle="mapbox://styles/mapbox/streets-v11"
                  onViewportChange={setViewport}
                  mapboxApiAccessToken={
                    process.env.REACT_APP_MAPBOX_ACCESS_TOKEN
                  }
                >
                  <Marker
                    latitude={listing.latitude}
                    longitude={listing.longitude}
                    offsetLeft={-20}
                    offsetTop={-10}
                  >
                    <img
                      src={MyPin}
                      alt="Pin"
                      style={{ width: "40px", height: "40px" }}
                    />
                  </Marker>
                  {isPopupOpen && (
                    <Popup
                      latitude={listing.latitude}
                      longitude={listing.longitude}
                      onClose={togglePopup}
                      closeOnClick={false}
                    >
                      {listing.address}
                    </Popup>
                  )}
                </ReactMapGL>
              </div>
            </div>
          </div>
        </div>
        <div className="w-1/3">
          <div className="ml-6 sticky top-8">
            <div className=" border-2 w-full border-gray-200 rounded-md flex justify-center py-4 px-4 items-center">
              {listing.userRef !== auth.currentUser?.uid &&
                !contactLandlord && (
                  <div className="w-full">
                    <button
                      onClick={() => setContactLandlord(true)}
                      className="flex justify-center  bg-black border-2 text-white rounded-md w-full py-3 text-xl"
                    >
                      Contact agent
                    </button>
                  </div>
                )}
              {contactLandlord && (
                <Contact userRef={listing.userRef} listing={listing} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex md:hidden px-4 justify-between w-full mx-auto">
        <div className="mx-auto w-full">
          <div className="flex w-full mx-auto justify-between mb-3 text-black">
            {listing.offer ? (
              <div className="flex justify-start w-full">
                <div className="flex flex-col items-start">
                  <span className="text-xl md:text-4xl font-bold mr-2">
                    {listing.regularPrice
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    DH
                  </span>
                  <span className="text-sm">{listing.address}</span>
                </div>
                <div className="flex justify-end space-x-2  w-full">
                  <div className="flex flex-col items-start">
                    <span className="text-xl md:text-4xl font-bold mr-2">
                      {+listing.bedrooms > 1 ? `${listing.bedrooms}` : "1"}
                    </span>
                    <span className="text-sm ">Beds</span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xl md:text-4xl font-bold mr-2">
                      {+listing.bathrooms > 1 ? `${listing.bathrooms}` : "1"}
                    </span>
                    <span className="text-sm ">Baths</span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xl md:text-4xl font-bold mr-2">
                      {listing.size}
                    </span>
                    <span className="text-sm ">m²</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-start w-full">
                <div className="flex flex-col items-start">
                  <span className="text-xl md:text-4xl font-bold mr-2">
                    {listing.regularPrice
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    DH
                  </span>
                  <span className="text-sm">{listing.address}</span>
                </div>
                <div className="flex justify-end space-x-2  w-full">
                  <div className="flex flex-col items-start">
                    <span className="text-xl md:text-4xl font-bold mr-2">
                      {+listing.bedrooms > 1 ? `${listing.bedrooms}` : "1"}
                    </span>
                    <span className="text-sm ">Beds</span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xl md:text-4xl font-bold mr-2">
                      {+listing.bathrooms > 1 ? `${listing.bathrooms}` : "1"}
                    </span>
                    <span className="text-sm ">Baths</span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xl md:text-4xl font-bold mr-2">
                      {listing.size}
                    </span>
                    <span className="text-sm ">m²</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="mt-8 grid grid-cols-2 grid-rows-3 gap-2 text-sm ">
            {/* Content for the grid cells */}
            <div className="flex items-center capitalize col-span-1 row-span-1 bg-gray-100  p-4 rounded-md">
              <MdOutlineVilla className="text-md mr-2" />
              {listing.listingType}
              {/* Button or additional content for the first cell */}
            </div>
            <div className="flex items-center capitalize col-span-1 row-span-1 bg-gray-100  p-4 rounded-md">
              <li className="flex items-center whitespace-nowrap">
                <LuSofa className="text-md mr-2" />
                {listing.furnished ? "Furnished" : "Not furnished"}
                {/* Button or additional content for the second cell */}
              </li>
            </div>
            <div className="flex items-center capitalize col-span-1 row-span-1 bg-gray-100  p-4 rounded-md">
              <LuParkingSquare className="text-md mr-2" />
              {listing.parking ? "Parking spot" : "No parking"}
              {/* Button or additional content for the third cell */}
            </div>
            <div className="flex items-center capitalize col-span-1 row-span-1 bg-gray-100  p-4 rounded-md">
              <MdOutlineConstruction className="text-md mr-2" />
              Built in {listing.yearBuilt}
              {/* Button or additional content for the fourth cell */}
            </div>
            <div className="flex items-center  col-span-1 row-span-1 bg-gray-100 p-4 rounded-md">
              {listing.type === "sale" ? (
                <>
                  <FaRulerCombined className="text-md mr-2" />
                  {(
                    (listing.regularPrice || listing.regularPrice) /
                    listing.size
                  ).toFixed(2)}
                  DH/m²
                </>
              ) : (
                <>
                  <FaRulerCombined className="text-md mr-2" />
                  --
                </>
              )}
            </div>

            <div className="flex items-center capitalize col-span-1 row-span-1 bg-gray-100 p-4 rounded-md">
              <img
                src="/favicon.ico" // Update the path if the favicon.ico is in a different subdirectory
                alt="Parking Icon"
                className="w-7 h-7 mr-2"
              />
              --
              {/* Button or additional content for the sixth cell */}
            </div>
          </div>

          <div className="mt-10 text-sm">
            <h1 className="text-xl font-semibold">Highlights</h1>
            <p className="mt-2">{listing.description}</p>
            <p className="mt-4">
              Listing updated : {}
              <Moment className="font-semibold " fromNow>
                {listing.timestamp?.toDate()}
              </Moment>
            </p>
            <p>
              Last update : {}
              <Moment className="font-semibold ">
                {listing.timestamp?.toDate()}
              </Moment>
            </p>

            <h1 className="mt-8 text-xl font-semibold">Location</h1>
            <div
              id="contactSection"
              className="mt-4 bg-gray-100 border-4 border-gray-300 h-[250px] rounded-lg"
            >
              <ReactMapGL
                {...viewport}
                width="100%"
                height="100%"
                mapStyle="mapbox://styles/mapbox/streets-v11"
                onViewportChange={setViewport}
                mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
              >
                <Marker
                  latitude={listing.latitude}
                  longitude={listing.longitude}
                  offsetLeft={-20}
                  offsetTop={-10}
                >
                  <img
                    src={MyPin}
                    alt="Pin"
                    style={{ width: "40px", height: "40px" }}
                  />{" "}
                </Marker>
                {isPopupOpen && (
                  <Popup
                    latitude={listing.latitude}
                    longitude={listing.longitude}
                    onClose={togglePopup}
                    closeOnClick={false}
                  >
                    {listing.address}
                  </Popup>
                )}
              </ReactMapGL>
            </div>
            <h1 className="mt-10  text-xl font-semibold">Contact</h1>

            <div className="mt-4 border-2 w-full border-gray-200 rounded-md flex justify-center py-4 px-4 items-center">
              {listing.userRef !== auth.currentUser?.uid &&
                !contactLandlord && (
                  <div className="w-full">
                    <button
                      onClick={() => setContactLandlord(true)}
                      className="flex justify-center  bg-black border-2 text-white rounded-md w-full py-3 text-xl"
                    >
                      Contact agent
                    </button>
                  </div>
                )}
              {contactLandlord && (
                <Contact userRef={listing.userRef} listing={listing} />
              )}
              <div className="md:hidden fixed bottom-4 z-50 ">
                <ScrollLink to="contactSection" smooth={true} duration={500}>
                  <button className="flex items-center gap-2 px-4 bg-custom-black text-lg text-white rounded-md p-2">
                    <IoCallOutline />
                    Contact
                  </button>
                </ScrollLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
