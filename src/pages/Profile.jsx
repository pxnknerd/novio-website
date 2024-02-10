import { getAuth, updateProfile } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { db } from "../firebase";
import ListingItem from "../components/ListingItem";
import { FaAngleDown } from "react-icons/fa6";

export default function Profile() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [changeDetail, setChangeDetail] = useState(false);
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");

  const [formData, setFormData] = useState({
    firstName: auth.currentUser.displayName.split(" ")[0] || "",
    lastName: auth.currentUser.displayName.split(" ")[1] || "",
    agency: auth.currentUser.displayName.split(" ")[2] || "",
    email: auth.currentUser.email,
    phoneNumber: "",
  });
  const { firstName, lastName, agency, email } = formData;
  const [isAgentUser, setIsAgentUser] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const [isMyProfileOpen, setIsMyProfileOpen] = useState(false);
  const [isMyListingsOpen, setIsMyListingsOpen] = useState(false);
  const [isContactUsOpen, setIsContactUsOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Check if the user is an agent
        const agentStatus = await isAgent();
        setIsAgentUser(agentStatus);

        

        // Fetch user status
        const userDocRef = doc(db, "agents", auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          // Assuming the user status is stored as a field named "status"
          const status = userDoc.data().status;
          setUserStatus(status);
        } else {
          // Handle the case where the user document doesn't exist
          setUserStatus(null);
        }

        // Fetch user listings
        const listingRef = collection(db, "listings");
        const q = query(
          listingRef,
          where("userRef", "==", auth.currentUser.uid),
          orderBy("timestamp", "desc")
        );
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
        
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [auth.currentUser.uid]);
  useEffect(() => {
    async function fetchData() {
      try {
        // ... (your existing code)

        // Fetch user phone number
        const userDocRef = doc(
          db,
          isAgentUser ? "agents" : "users",
          auth.currentUser.uid
        );
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userPhoneNumber = userDoc.data().phoneNumber;
          setPhoneNumber(userPhoneNumber);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, [auth.currentUser.uid, isAgentUser]);

  async function onDelete(listingID) {
    if (window.confirm("Are you sure you want to delete?")) {
      await deleteDoc(doc(db, "listings", listingID));
      const updatedListings = listings.filter(
        (listing) => listing.id !== listingID
      );
      setListings(updatedListings);
      toast.success("Successfully deleted listing");
    }
  }

  function onEdit(listingID) {
    navigate(`/edit-listing/${listingID}`);
  }

  function onLogout() {
    auth.signOut();
    navigate("/");
  }

  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
    // Handle changes to phone number
    if (e.target.id === "phoneNumber") {
      setPhoneNumber(e.target.value);
    }
  }

 async function onSubmit() {
   try {
     const displayName = `${firstName} ${lastName} ${agency}`;

     // Update display name in firebase auth
     await updateProfile(auth.currentUser, {
       displayName,
     });

     // Update name and phone number in Firestore based on user type (agent or regular user)
     const userDocRef = doc(
       db,
       isAgentUser ? "agents" : "users",
       auth.currentUser.uid
     );

     await updateDoc(userDocRef, {
       firstName,
       lastName,
       agency,
       phoneNumber: formData.phoneNumber,
     });

     toast.success("Profile details updated");
   } catch (error) {
     toast.error("Could not update the profile details");
   }
 }

  const isAgent = async () => {
    const agentDocRef = doc(db, "agents", auth.currentUser.uid);
    const agentDoc = await getDoc(agentDocRef);
    return agentDoc.exists();
  };

  const renderGreeting = () => {
    const displayName = `${firstName}`;

    if (isAgentUser) {
      return (
        <p>
          Hey agent <strong>{displayName}</strong>.
        </p>
      );
    } else {
      return (
        <p>
          Hey <strong>{displayName}</strong>.
        </p>
      );
    }
  };

  return (
    <div className="bg-white h-full">
      <section className="px-6 pt-6 max-w-6xl mx-auto flex justify-center items-center  flex-col">
        <div className="w-full mt-6 px-3">
          <div className="mb-12 text-xl md:text-2xl ">{renderGreeting()}</div>
          {/* My Profile Section */}
          <div className="mb-4">
            <div
              className="flex items-center justify-between "
              onClick={() => setIsMyProfileOpen(!isMyProfileOpen)}
            >
              <h2 className="cursor-pointer text-lg  mb-2">My Profile</h2>
              <FaAngleDown
                className={`cursor-pointer transition-transform ease-in-out duration-200 transform ${
                  isMyProfileOpen ? "rotate-180" : ""
                }`}
              />
            </div>
            {isMyProfileOpen && (
              <form>
                <p className="mt-6 mb-2">First name</p>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  disabled={!changeDetail}
                  onChange={onChange}
                  className={`mb-6 w-full md:w-[50%] px-4 py-2 text-md text-gray-700 bg-white hover:shadow-xl rounded shadow-lg transition ease-in-out ${
                    changeDetail && "bg-gray-200 focus:bg-gray-200"
                  }`}
                />
                <p className="mb-2">Last name</p>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  disabled={!changeDetail}
                  onChange={onChange}
                  className={`mb-6 w-full md:w-[50%] px-4 py-2 text-md text-gray-700 bg-white hover:shadow-xl rounded shadow-lg transition ease-in-out ${
                    changeDetail && "bg-gray-200 focus:bg-gray-200"
                  }`}
                />
                <p className="mb-2">Phone Number</p>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  disabled={!changeDetail}
                  onChange={onChange}
                  className={`mb-6 w-full md:w-[50%] px-4 py-2 text-md text-gray-700 bg-white hover:shadow-xl rounded shadow-lg transition ease-in-out ${
                    changeDetail && "bg-gray-200 focus:bg-gray-200"
                  }`}
                />
                {isAgentUser && (
                  <div>
                    <p className="mb-2">Agency</p>
                    <input
                      type="text"
                      id="agency"
                      value={agency}
                      disabled={!changeDetail}
                      onChange={onChange}
                      className={`mb-6 w-full md:w-[50%] px-4 py-2 text-md text-gray-700 bg-white hover:shadow-xl rounded shadow-lg transition ease-in-out ${
                        changeDetail && "bg-gray-200 focus:bg-gray-200"
                      }`}
                    />
                  </div>
                )}

                <p className="mb-2">Email</p>
                <input
                  type="email"
                  id="email"
                  value={email}
                  disabled
                  className="mb-6 w-full md:w-[50%] px-4 py-2 text-md text-gray-700 bg-white rounded shadow-lg hover:shadow-xl transition ease-in-out"
                />

                <div className="flex justify-center sm:justify-start whitespace-nowrap mb-6">
                  <p className="flex items-center">
                    <span
                      onClick={() => {
                        changeDetail && onSubmit();
                        setChangeDetail((prevState) => !prevState);
                      }}
                      className="text-black md:text-md font-semibold capitalize hover:text-gray-300 transition ease-in-out duration-150 cursor-pointer"
                    >
                      {changeDetail ? "Apply Change" : "Edit Profile"}
                    </span>
                  </p>
                </div>
              </form>
            )}
            <div className="border-t flex-1 after:border-gray-300"></div>
          </div>

          {/* My Listings Section */}
          <div className="mb-4">
            <div
              className="flex items-center justify-between"
              onClick={() => setIsMyListingsOpen(!isMyListingsOpen)}
            >
              <h2 className="cursor-pointer text-lg  mb-2">My Listings</h2>
              <FaAngleDown
                className={`cursor-pointer transition-transform ease-in-out duration-200 transform ${
                  isMyListingsOpen ? "rotate-180" : ""
                }`}
              />
            </div>
            {isMyListingsOpen && (
              <>
                {!loading && listings.length > 0 && (
                  <ul className=" grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mt-6 mb-6">
                    {listings.map((listing) => (
                      <ListingItem
                        key={listing.id}
                        id={listing.id}
                        listing={listing.data}
                        onDelete={() => onDelete(listing.id)}
                        onEdit={() => onEdit(listing.id)}
                      />
                    ))}
                  </ul>
                )}
              </>
            )}
            <div className="border-t flex-1 after:border-gray-300"></div>
          </div>

          {/* Contact Us Section */}
          <div className="mb-4">
            <div
              className="flex items-center justify-between"
              onClick={() => setIsContactUsOpen(!isContactUsOpen)}
            >
              <h2 className="cursor-pointer text-lg  mb-2">Help</h2>
              <FaAngleDown
                className={`cursor-pointer transition-transform ease-in-out duration-200 transform ${
                  isContactUsOpen ? "rotate-180" : ""
                }`}
              />
            </div>
            {isContactUsOpen && <p>Contact us content goes here...</p>}
            <div className="border-t flex-1 after:border-gray-300"></div>
          </div>
          <div className="flex justify-center sm:justify-start whitespace-nowrap mb-6  ">
            <p
              onClick={onLogout}
              className=" mt-4 text-lg font-semibold capitalize hover:text-gray-300 transition ease-in-out duration-200 cursor-pointer"
            >
              Sign out
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
