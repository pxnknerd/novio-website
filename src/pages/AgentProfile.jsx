import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { GrNext, GrPrevious } from "react-icons/gr";
import ReactMapGL, { Marker } from "react-map-gl";




export default function AgentProfile() {
  const { agentId } = useParams();
  const [agentInfo, setAgentInfo] = useState(null);
  const [agentListings, setAgentListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberSince, setMemberSince] = useState("");
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [contactFormData, setContactFormData] = useState({
  name: "",
  phoneNumber: "",
  message: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const listingsPerPage = 4;
 const [viewport, setViewport] = useState({
   width: "100%",
   height: 400,
   latitude: 31.7917, // Latitude for Morocco
   longitude: -7.0926, // Longitude for Morocco
   zoom: 6, // Adjust zoom level as needed
 });
 const [saleListingsCoordinates, setSaleListingsCoordinates] = useState([]);
 const [rentListingsCoordinates, setRentListingsCoordinates] = useState([]);


const handlePrevPage = () => {
  setCurrentPage((prevPage) => prevPage - 1);
};

const handleNextPage = () => {
  setCurrentPage((prevPage) => prevPage + 1);
};

   const handleInputChange = (e) => {
     const { name, value } = e.target;
     setContactFormData((prevData) => ({
       ...prevData,
       [name]: value,
     }));
   };

   const handleSubmit = (e) => {
     e.preventDefault();
     // Send email logic goes here
     const { name, phoneNumber, message } = contactFormData;
     const subject = `Contacting Agent: ${agentInfo.firstName} ${agentInfo.lastName}`;
     const emailBody = `Name: ${name}\nPhone Number: ${phoneNumber}\nMessage: ${message}`;
     const mailtoLink = `mailto:${agentInfo.email}?subject=${encodeURIComponent(
       subject
     )}&body=${encodeURIComponent(emailBody)}`;
     window.location.href = mailtoLink;
     // Clear form data after sending email
     setContactFormData({
       name: "",
       phoneNumber: "",
       message: "",
     });
   };
  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        // Fetch agent data
        const agentDocRef = doc(db, "agents", agentId);
        const agentDocSnapshot = await getDoc(agentDocRef);

        if (agentDocSnapshot.exists()) {
          const agentData = agentDocSnapshot.data();
          setAgentInfo(agentData);

          // Calculate member since date
          const joinTimestamp = agentData.timestamp.toDate();
          const joinDate = joinTimestamp.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          setMemberSince(joinDate);

          setSelectedLanguages(agentData.selectedLanguages || ["--"]);

          // Fetch agent listings
          const listingsRef = collection(db, "listings");
          const q = query(
            listingsRef,
            where("userRef", "==", agentId),
            where("status", "==", "approved")
          );
          const querySnap = await getDocs(q);
          let listings = [];
          let saleCoordinates = [];
          let rentCoordinates = [];
          querySnap.forEach((doc) => {
            const listingData = doc.data();
            listings.push({
              id: doc.id,
              data: listingData,
            });

            // Collect coordinates for sale and rent listings
            if (listingData.type === "sale") {
              saleCoordinates.push({
                id: doc.id,
                latitude: listingData.latitude,
                longitude: listingData.longitude,
              });
            } else if (listingData.type === "rent") {
              rentCoordinates.push({
                id: doc.id,
                latitude: listingData.latitude,
                longitude: listingData.longitude,
              });
            }
          });
          setAgentListings(listings);
          setSaleListingsCoordinates(saleCoordinates);
          setRentListingsCoordinates(rentCoordinates);
          setLoading(false);
        } else {
          console.log("Agent not found");
        }
      } catch (error) {
        console.error("Error fetching agent data:", error);
      }
    };

    fetchAgentData();
  }, [agentId]);

const indexOfLastListing = currentPage * listingsPerPage;
const indexOfFirstListing = indexOfLastListing - listingsPerPage;
const currentListings = agentListings.slice(
  indexOfFirstListing,
  indexOfLastListing
);

const totalPages = Math.ceil(agentListings.length / listingsPerPage);

const handlePageChange = (page) => {
  setCurrentPage(page);
};


  if (!agentInfo) {
    return <div>Loading agent information...</div>;
  }

  return (
    <div className="flex p-8 max-w-6xl gap-8 mx-auto">
      <div className="md:w-2/3">
        <div className="flex gap-4 items-center">
          <img
            src={agentInfo.photoURL || "/placeholder-image.jpg"} // Use a placeholder image if photoURL is not available
            alt={`${agentInfo.firstName} ${agentInfo.lastName}'s profile`}
            className="h-40 w-40 rounded-full object-cover"
          />{" "}
          <div>
            <p className="font-semibold text-4xl mb-1">{`${agentInfo.firstName} ${agentInfo.lastName}`}</p>
            <p className="flex items-center gap-1 text-lg">
              <RiVerifiedBadgeFill />
              Verified Agent
            </p>
          </div>
        </div>
        <div>
          <p className="mt-14 font-semibold text-2xl mb-4">About Me</p>
          <p>{agentInfo.aboutMe}</p>
        </div>
        <div>
          <p className="mt-14 font-semibold text-2xl mb-4">
            Available Listings ({agentListings.length})
          </p>
          {agentListings.length > 0 && (
            <ul className="flex gap-10 p-4 px-8 font-semibold">
              <li className="w-1/4">Listing</li>
              <li className="w-1/4">Address</li>
              <li className="w-1/4">Type</li>
              <li className="flex w-1/4 ml-auto justify-end">Price</li>
            </ul>
          )}
          <div className="w-full bg-gray-200 h-[2px]"></div>
          <ul className="">
            {!loading && agentListings.length > 0 ? (
              currentListings.map((listing) => (
                <li key={listing.id} className="">
                  <Link to={`/listingdetails/${listing.id}`} className="block">
                    <div className="flex gap-10 p-4 hover:bg-gray-50 px-8 rounded-md">
                      <div className="flex w-1/4">
                        <img
                          src={listing.data.imgUrls || "/placeholder-image.jpg"}
                          alt=""
                          className="h-10 w-20 object-cover rounded-md mb-2"
                        />
                      </div>
                      <div className="w-1/4">
                        <p className="flex capitalize text-gray-700 mb-1">
                          {listing.data.address}
                        </p>
                      </div>
                      <div className="w-1/4">
                        <p className="flex capitalize mb-1">
                          {listing.data.listingType}
                        </p>
                      </div>
                      <div className="flex w-1/4 ml-auto">
                        <p className="ml-auto">{listing.data.regularPrice}DH</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 h-[2px]"></div>
                  </Link>
                </li>
              ))
            ) : (
              <div>No listings found for this agent.</div>
            )}
          </ul>
        </div>

        <div className="flex mt-4 pagination gap-4 justify-center">
          {agentListings.length > 0 && (
            <button onClick={handlePrevPage} disabled={currentPage === 1}>
              <GrPrevious />
            </button>
          )}

          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              style={{
                backgroundColor:
                  currentPage === index + 1 ? "#ffebeb" : "transparent",
                border:
                  currentPage === index + 1
                    ? "3px solid red"
                    : "2px solid transparent",
                color: currentPage === index + 1 ? "black" : "#333",
                padding: "5px 10px",
                borderRadius: "50%",
                cursor: "pointer",
                width: "40px", // Adjust width as needed for circular buttons
                height: "40px", // Adjust height as needed for circular buttons
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {index + 1}
            </button>
          ))}
          {agentListings.length > 0 && (
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <GrNext />
            </button>
          )}
        </div>
        <p className="mt-4 font-semibold text-2xl mb-4">
          Listings Map ({agentListings.length})
        </p>
        {agentListings.length > 0 && (
          <div className="bg-gray-200 h-[400px] mt-4">
            <ReactMapGL
              {...viewport}
              mapStyle="mapbox://styles/mohamedmakdad/clsqz4sct00xn01pf8o9vg38g"
              mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
              onMove={(evt) => setViewport(evt.viewport)}
            >
              {saleListingsCoordinates.map((listing) => (
                <Marker
                  key={listing.id}
                  latitude={listing.latitude}
                  longitude={listing.longitude}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "red",
                      border: "4px solid white",
                    }}
                  ></div>
                </Marker>
              ))}
              {rentListingsCoordinates.map((listing) => (
                <Marker
                  key={listing.id}
                  latitude={listing.latitude}
                  longitude={listing.longitude}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "purple",
                      border: "4px solid white",
                    }}
                  ></div>
                </Marker>
              ))}
            </ReactMapGL>
          </div>
        )}
      </div>
      <div className="md:w-1/3 space-y-2">
        <div className="border rounded space-y-2 p-6">
          <p className="text-2xl font-semibold">Contact Agent</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={contactFormData.name}
                onChange={handleInputChange}
                className="border bg-gray-100 w-full p-2 rounded"
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block">
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={contactFormData.phoneNumber}
                onChange={handleInputChange}
                className="border bg-gray-100 w-full p-2 rounded"
              />
            </div>
            <div>
              <label htmlFor="message" className="block">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={contactFormData.message}
                onChange={handleInputChange}
                className="border bg-gray-100 w-full p-2 rounded"
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-custom-red w-full text-white px-4 py-3 rounded"
            >
              Send email
            </button>
          </form>
        </div>
        <div className="border rounded space-y-2 p-6">
          <p className="text-2xl font-semibold mb-6">Professional Info</p>
          <p>
            <strong>Email:</strong> {agentInfo.email}
          </p>
          <p>
            <strong>Agency:</strong> {agentInfo.agency}
          </p>
          <p>
            <strong>Phone Number:</strong> {agentInfo.phoneNumber}
          </p>
          <p>
            <strong>Member Since:</strong> {memberSince}
          </p>
          <p>
            <strong>Languages:</strong> {selectedLanguages.join(", ")}
          </p>
        </div>
      </div>
    </div>
  );
}
