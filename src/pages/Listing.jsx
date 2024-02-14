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
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import MyPin from "../assets/svg/MyPin.svg";
import { Link as ScrollLink } from "react-scroll";
import { IoCallOutline } from "react-icons/io5";







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

  // Function to toggle the popup state
  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };


const customMarkerIcon = new L.Icon({
  iconUrl: MyPin, // Assuming it's in the root of the 'public' folder
  iconSize: [35, 58],
  iconAnchor: [17.5, 29],
  popupAnchor: [1, -34],
  // Optionally, customize other values based on your needs
});


  useEffect(() => {
    async function fetchListing() {
      const docRef = doc(db, "listings", params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing(docSnap.data());
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
      <div className="md:hidden bg-gray-100 h-[250px]">
        <div
          style={{ height: "300px", overflow: "hidden", position: "relative" }}
        >
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
      <div className="max-w-6xl px-8 py-8 mx-auto">
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
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-black md:bg-black bg-opacity-50 md:bg-opacity-50 max-w-screen-md">
            <button
              className="absolute top-0 right-0 p-2 z-50"
              onClick={togglePopup}
            >
              <IoMdClose className="w-10 md:w-12 h-12 md:mr-8  text-white" />
            </button>
            {/* Display all images in the popup */}
            <div className="popup-container">
              <ImageGallery items={images} />
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
                      {listing.discountedPrice
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
                      (listing.discountedPrice || listing.regularPrice) /
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
              <div className="mt-4 bg-gray-100 border-4 border-gray-300 h-[250px] rounded-lg">
                {listing.latitude && listing.longitude && (
                  <MapContainer
                    center={[listing.latitude, listing.longitude]}
                    zoom={13}
                    style={{ height: "100%", width: "100%", zIndex: 1 }}
                    zoomControl={false} // Disable zoom controls
                  >
                    <TileLayer
                      url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png"
                      minZoom={14}
                      maxZoom={20}
                      attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker
                      position={[listing.latitude, listing.longitude]}
                      icon={customMarkerIcon}
                    >
                      <Popup>{listing.address}</Popup>
                    </Marker>
                  </MapContainer>
                )}
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
                      className="flex justify-center  bg-custom-red border-2 text-white rounded-md w-full py-3 text-xl"
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
                    {listing.discountedPrice
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
                    (listing.discountedPrice || listing.regularPrice) /
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
              {listing.latitude && listing.longitude && (
                <MapContainer
                  center={[listing.latitude, listing.longitude]}
                  zoom={13}
                  style={{ height: "100%", width: "100%", zIndex: 1 }}
                  zoomControl={false} // Disable zoom controls
                >
                  <TileLayer
                    url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png"
                    minZoom={14}
                    maxZoom={20}
                    detectRetina={true}
                    attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker
                    position={[listing.latitude, listing.longitude]}
                    icon={customMarkerIcon}
                  >
                    <Popup>{listing.address}</Popup>
                  </Marker>
                </MapContainer>
              )}
            </div>
            <h1 className="mt-10  text-xl font-semibold">Contact</h1>

            <div className="mt-4 border-2 w-full border-gray-200 rounded-md flex justify-center py-4 px-4 items-center">
              {listing.userRef !== auth.currentUser?.uid &&
                !contactLandlord && (
                  <div className="w-full">
                    <button
                      onClick={() => setContactLandlord(true)}
                      className="flex justify-center  bg-custom-red border-2 text-white rounded-md w-full py-3 text-xl"
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
                  <button className="flex items-center gap-2 px-4 bg-custom-red text-lg text-white rounded-md p-2">
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
