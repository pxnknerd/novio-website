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

export default function Profile() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [changeDetail, setChangeDetail] = useState(false);
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: auth.currentUser.displayName.split(' ')[0] || '',
    lastName: auth.currentUser.displayName.split(' ')[1] || '',
    agency: auth.currentUser.displayName.split(' ')[2] || '',
    email: auth.currentUser.email,
  });
  const { firstName, lastName, agency, email } = formData;
  const [isAgentUser, setIsAgentUser] = useState(false);
  const [userStatus, setUserStatus] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Check if the user is an agent
        const agentStatus = await isAgent();
        setIsAgentUser(agentStatus);

         // Fetch user status
         const userDocRef = doc(db, 'agents', auth.currentUser.uid);
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
  }

  async function onSubmit() {
    try {
      const displayName = `${firstName} ${lastName} ${agency}`;
  
      if (auth.currentUser.displayName !== displayName) {
        // Update display name in firebase auth
        await updateProfile(auth.currentUser, {
          displayName,
        });
  
        // Update name in Firestore based on user type (agent or regular user)
        const userDocRef = doc(db, isAgentUser ? 'agents' : 'users', auth.currentUser.uid);
        await updateDoc(userDocRef, {
          firstName,
          lastName,
          agency,
        });
      }
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
  return (
    <>
      <section className="px-6 pt-6 max-w-6xl mx-auto flex justify-center items-center flex-col">
        <div className="w-full md:w-[50%] mt-6 px-3">
        <h1 className="text-xl md:text-2xl mt-6 mb-12">My Profile</h1>
          <form>
          <p className="mb-2">First name</p>
            <input
              type="text"
              id="firstName"
              value={firstName}
              disabled={!changeDetail}
              onChange={onChange}
              className={`mb-6 w-full px-4 py-2 text-md text-gray-700 bg-white hover:shadow-xl rounded shadow-lg transition ease-in-out ${
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
              className={`mb-6 w-full px-4 py-2 text-md text-gray-700 bg-white hover:shadow-xl rounded shadow-lg transition ease-in-out ${
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
             className={`mb-6 w-full px-4 py-2 text-md text-gray-700 bg-white hover:shadow-xl rounded shadow-lg transition ease-in-out ${
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
              className="mb-6 w-full px-4 py-2 text-md text-gray-700 bg-white rounded shadow-lg hover:shadow-xl transition ease-in-out"
            />

            <div className="flex justify-between whitespace-nowrap mb-6 text-sm sm:text-lg">
              <p className="flex items-center">
                <span
                  onClick={() => {
                    changeDetail && onSubmit();
                    setChangeDetail((prevState) => !prevState);
                  }}
                  className="text-black capitalize hover:text-gray-300 transition ease-in-out duration-150 ml-1 cursor-pointer"
                >
                  {changeDetail ? "Apply Change" : "Edit Profile"}
                </span>
              </p>
              <p
                onClick={onLogout}
                className="text-black capitalize hover:text-gray-300 transition ease-in-out duration-200 cursor-pointer"
              >
                Sign out
              </p>
            </div>
          </form>
          {isAgentUser && userStatus === 'approved' && (
        <button
          type="submit"
          className="w-full text-sm text-white shadow-lg hover:shadow-xl rounded-md bg-black px-3 py-3 capitalize transition-all duration-300"
        >
          <Link to="/create-listing" className="flex justify-center items-center ">
            New Listing
          </Link>
        </button>
      )}

        </div>
      </section>
      <div>
        {!loading && listings.length > 0 && (
          <>
            <h2 className="text-xl md:text-2xl text-center mt-6 mb-6">My Listings</h2>
            <ul className="px-6 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl-grid-cols-5 mt-6 mb-6">
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
          </>
        )}
        
      </div>
    </>
  );
}
