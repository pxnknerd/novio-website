import { getAuth, updateProfile } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { db } from "../firebase";
import { useEffect } from "react";
import ListingItem from "../components/ListingItem";


export default function Profile() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [changeDetail, setChangeDetail] = useState(false);
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });
  const { name, email } = formData;
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
      if (auth.currentUser.displayName !== name) {
        //update display name in firebase auth
        await updateProfile(auth.currentUser, {
          displayName: name,
        });

        // update name in the firestore

        const docRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(docRef, {
          name,
        });
      }
      toast.success("Profile details updated");
    } catch (error) {
      toast.error("Could not update the profile details");
    }
  }
  useEffect(() => {
    async function fetchUserListings() {
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
    }
    fetchUserListings();
  }, [auth.currentUser.uid]);
  async function onDelete(listingID){
    if(window.confirm("are you sure you want to delete?")){
      await deleteDoc(doc(db, "listings", listingID))
      const updatedListings = listings.filter(
        (listing)=> listing.id !== listingID
      )
      setListings(updatedListings)
      toast.success("successfully deleted listing")
    }

  }
  function onEdit(listingID){
    navigate(`/edit-listing/${listingID}`)

  }
  return (
    <>
    <section className="px-6 pt-6 max-w-6xl mx-auto flex justify-center items-center flex-col">
      <h1 className="text-xl md:text-2xl text-center mt-6 ">My Profile</h1>
      <div className="w-full md:w-[50%] mt-6 px-3">

        <form>

          {/* Name Input*/}
          <input type="text" 
          id="name" 
          value={name} 
          disabled={!changeDetail} 
          onChange={onChange} 
          className={`mb-6 w-full px-4 py-2 text-md text-gray-700 bg-white hover:shadow-xl rounded shadow-lg transition ease-in-out ${changeDetail && "bg-gray-200 focus:bg-gray-200" }`}/> 
         
          {/*Email input*/}

        <input 
        type="email" 
        id="email" 
        value={email} 
        disabled 
        className="mb-6 w-full px-4 py-2 text-md text-gray-700 bg-white rounded shadow-lg hover:shadow-xl transition ease-in-out"/> 
          
         
          <div className="flex justify-between whitespace-nowrap mb-6 text-sm sm:text-lg">
            <p className="flex items-center">
              
              <span onClick={() => {
                changeDetail && onSubmit()
                setChangeDetail((prevState) => !prevState)
              }} 
              className="text-black capitalize font-semibold hover:text-gray-300 transition ease-in-out duration-150 ml-1 cursor-pointer">{changeDetail ? "Apply Change" : "Edit Profile"} 

              </span>
            </p>
            <p onClick={onLogout} className="text-black font-semibold  capitalize  hover:text-gray-300 transition ease-in-out duration-200 cursor-pointer">Sign out</p>
          </div>
        </form>
        <button type="submit" className="w-full text-sm text-white shadow-lg hover:shadow-xl  rounded-md bg-black px-3 py-3   capitalize transition-all duration-300">
          <Link to = "/create-listing" className="flex justify-center items-center ">
          List your home
          </Link>
        
        </button>
      </div>
    </section>
    <div>
        {!loading && listings.length > 0 && (
          <>
            <h2 className="text-xl md:text-2xl text-center mt-6 mb-6">
              My Listings
            </h2>
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
    
  )
}
