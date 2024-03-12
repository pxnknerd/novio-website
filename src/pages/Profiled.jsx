import React from "react";
import {
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBCard,
  MDBCardText,
  MDBCardBody,
  MDBCardImage,
  MDBBtn,
  MDBTypography,
} from "mdb-react-ui-kit";
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
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


  

export default function Profiled() {
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
    photoURL: auth.currentUser.photoURL || "", 
  });
  const { firstName, lastName, agency, email, photoURL } = formData;
  const [isAgentUser, setIsAgentUser] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const [isMyProfileOpen, setIsMyProfileOpen] = useState(false);
  const [isMyListingsOpen, setIsMyListingsOpen] = useState(false);
  const [isContactUsOpen, setIsContactUsOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

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
         where("status", "==", "approved"), // Add this condition
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
       <div className="flex items-center">
         <img
           src={photoURL || process.env.PUBLIC_URL + "/anonym.png"}
           alt="Profile"
           className="h-10 w-10 rounded-full object-cover mr-2"
         />
         <p>
           Hey agent <strong>{displayName}</strong>.
         </p>
       </div>
     );
   } else {
     return (
       <div className="flex items-center">
         <img
           src={photoURL || process.env.PUBLIC_URL + "/anonym.png"}
           alt="Profile"
           className="h-10 w-10 rounded-full object-cover mr-2"
         />
         <p>
           Hey <strong>{displayName}</strong>.
         </p>
       </div>
     );
   }
 };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="gradient-custom-2 bg-custom-gray">
        <MDBContainer className="py-5 h-100">
          <MDBRow className="justify-content-center align-items-center h-100">
            <MDBCol lg="9" xl="7">
              <MDBCard>
                <div className="rounded-top text-white d-flex flex-row">
                  <div
                    className="ms-4 mt-5 d-flex flex-column"
                    style={{ width: "150px" }}
                  >
                    <MDBCardImage
                      src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp"
                      alt="Generic placeholder image"
                      className="mt-4 mb-2 img-thumbnail rounded border-4 border-white"
                      fluid
                      style={{ width: "150px", zIndex: "1" }}
                    />
                    <p>Edit profile</p>
                  </div>
                  <div className="ms-3 text-black text-2xl mt-6">
                    <p > {renderGreeting()}</p>
                    <p>New York</p>
                  </div>
                </div>
                <div
                  className="p-4 text-black"
                  style={{ backgroundColor: "#f8f9fa" }}
                >
                  <div className="hidden flex justify-end text-center py-1">
                    <div>
                      <MDBCardText className="mb-1 h5">253</MDBCardText>
                      <MDBCardText className="small text-muted mb-0">
                        Photos
                      </MDBCardText>
                    </div>
                    <div className="px-3">
                      <MDBCardText className="mb-1 h5">1026</MDBCardText>
                      <MDBCardText className="small text-muted mb-0">
                        Followers
                      </MDBCardText>
                    </div>
                    <div>
                      <MDBCardText className="mb-1 h5">478</MDBCardText>
                      <MDBCardText className="small text-muted mb-0">
                        Following
                      </MDBCardText>
                    </div>
                  </div>
                </div>
                <MDBCardBody className="text-black p-4">
                  <div className="mb-5">
                    <p className="lead fw-normal mb-1">About</p>
                    <div className="p-4" style={{ backgroundColor: "#f8f9fa" }}>
                      <MDBCardText className="font-italic mb-1">
                        Web Developer
                      </MDBCardText>
                      <MDBCardText className="font-italic mb-1">
                        Lives in New York
                      </MDBCardText>
                      <MDBCardText className="font-italic mb-0">
                        Photographer
                      </MDBCardText>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <MDBCardText className="lead fw-normal mb-0">
                      Recent photos
                    </MDBCardText>
                    <MDBCardText className="mb-0">
                      <a href="#!" className="text-muted">
                        Show all
                      </a>
                    </MDBCardText>
                  </div>
                  <MDBRow>
                    <MDBCol className="mb-2">
                      <MDBCardImage
                        src="https://mdbcdn.b-cdn.net/img/Photos/Lightbox/Original/img%20(112).webp"
                        alt="image 1"
                        className="w-100 rounded-3"
                      />
                    </MDBCol>
                    <MDBCol className="mb-2">
                      <MDBCardImage
                        src="https://mdbcdn.b-cdn.net/img/Photos/Lightbox/Original/img%20(107).webp"
                        alt="image 1"
                        className="w-100 rounded-3"
                      />
                    </MDBCol>
                  </MDBRow>
                  <MDBRow className="g-2">
                    <MDBCol className="mb-2">
                      <MDBCardImage
                        src="https://mdbcdn.b-cdn.net/img/Photos/Lightbox/Original/img%20(108).webp"
                        alt="image 1"
                        className="w-100 rounded-3"
                      />
                    </MDBCol>
                    <MDBCol className="mb-2">
                      <MDBCardImage
                        src="https://mdbcdn.b-cdn.net/img/Photos/Lightbox/Original/img%20(114).webp"
                        alt="image 1"
                        className="w-100 rounded-3"
                      />
                    </MDBCol>
                  </MDBRow>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </div>
    </div>
  );
}
