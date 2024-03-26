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
import { FiEdit } from "react-icons/fi";
import { TbEdit } from "react-icons/tb";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import TextField from "@mui/material/TextField";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { PiSignOutBold } from "react-icons/pi";
import { FormControl, InputLabel, MenuItem, Select, Chip } from "@mui/material";

export default function Profile() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [changeDetail, setChangeDetail] = useState(false);
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [aboutMe, setAboutMe] = useState("");
  const [specialtiesDisabled, setSpecialtiesDisabled] = useState(true);

  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const handleSpecialtiesChange = (event) => {
    const selectedSpecialties = event.target.value;

    if (selectedSpecialties.length <= 3) {
      setSelectedSpecialties(selectedSpecialties);
    } else {
      toast.error("You can only choose up to three specialties");
    }
  };

  const specialties = [
    "Residential",
    "Commercial",
    "Luxury",
    "Property",
    "Investment",
    "Construction",
    "Vacation",
    "Land",
    "Foreclosures",
    "Development",
  ];
  const handleDelete = (value) => {
    setSelectedSpecialties((prevSelected) =>
      prevSelected.filter((selected) => selected !== value)
    );
  };

  const [languageDisabled, setLanguageDisabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState([]);
  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;

    if (selectedLanguage.length <= 3) {
      setSelectedLanguage(selectedLanguage);
    } else {
      toast.error("You can only choose up to three Language");
    }
  };

  const language = ["Arabic", "French", "English", "Spanish", "Tamazight"];
  const handleLanguageDelete = (value) => {
    setSelectedLanguage((prevSelected) =>
      prevSelected.filter((selected) => selected !== value)
    );
  };

  const [formData, setFormData] = useState({
    firstName: auth.currentUser.displayName.split(" ")[0] || "",
    lastName: auth.currentUser.displayName.split(" ")[1] || "",
    agency: auth.currentUser.displayName.split(" ")[2] || "",
    email: auth.currentUser.email,
    phoneNumber: "",
    photoURL: auth.currentUser.photoURL || "",
    aboutMe: "",
  });
  const { firstName, lastName, agency, email, photoURL } = formData;
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
        const userDocRef = doc(
          db,
          isAgentUser ? "agents" : "users",
          auth.currentUser.uid
        );
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          // Assuming the user status is stored as a field named "status"
          const status = userDoc.data().status;
          const userData = userDoc.data();

          setUserStatus(status);
          setAboutMe(userData.aboutMe || "");
          setSelectedSpecialties(userData.specialties || []);
          setSelectedLanguage(userData.language || []);
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

        // Fetch user phone number
        const userPhoneNumber = userDoc.data().phoneNumber;
        setPhoneNumber(userPhoneNumber);
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
        phoneNumber,
        aboutMe,
        specialties: selectedSpecialties,
        language: selectedLanguage,
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
    const displayName = `${firstName}${" "}${lastName}`;

    const handleImageChange = async (e) => {
      const file = e.target.files[0];
      setSelectedImage(file);

      if (file) {
        const storage = getStorage();
        const storageRef = ref(
          storage,
          `profilePictures/${auth.currentUser.uid}`
        );
        await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(storageRef);

        // Update the user's profile picture in Firestore
        const userDocRef = doc(
          db,
          isAgentUser ? "agents" : "users",
          auth.currentUser.uid
        );
        await updateDoc(userDocRef, {
          photoURL: imageUrl,
        });

        // Update the local state
        setFormData((prevState) => ({
          ...prevState,
          photoURL: imageUrl,
        }));

        // Update the current user's photoURL in the auth object
        await updateProfile(auth.currentUser, {
          photoURL: imageUrl,
        });

        toast.success("Profile picture updated");
      }
    };

    if (isAgentUser) {
      return (
        <div className="flex flex-col justify-center items-center w-full mx-auto">
          <div className="flex w-full bg-gray-100 h-40"></div>
          <div className="flex relative -top-10">
            <div className="relative flex items-end ">
              <img
                src={photoURL || process.env.PUBLIC_URL + "/anonym.png"}
                alt="Profile"
                className="h-20 w-20 rounded-full object-cover mr-2"
              />
              <label
                htmlFor="imageInput"
                className="absolute h-8 w-8 top-0 right-0 shadow-lg text-black bg-white rounded-full p-1 cursor-pointer"
              >
                <input
                  type="file"
                  id="imageInput"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
                <FiEdit className="h-5 w-4 mx-auto  hover:opacity-40" />
              </label>
            </div>
          </div>
          <p className="md:text-2xl -mt-4">
            <strong>{displayName}</strong>
          </p>
          {userStatus === "approved" && (
            <p className="flex items-center gap-1 text-sm md:text-md">
              <RiVerifiedBadgeFill /> Verified agent
            </p>
          )}
          {userStatus !== "approved" && (
            <p className="flex items-center gap-1 text-sm md:text-md">
              Pending verification...
            </p>
          )}
        </div>
      );
    } else {
      return (
        <div className="flex flex-col justify-center items-center w-full mx-auto">
          <div className="flex relative">
            <div className="relative flex items-end">
              {" "}
              <img
                src={photoURL || process.env.PUBLIC_URL + "/anonym.png"}
                alt="Profile"
                className="h-20 w-20 rounded-full object-cover mr-2"
              />
            </div>
          </div>
          <p className="md:text-2xl mt-2">
            <strong>{displayName}</strong>
          </p>
        </div>
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto rounded  h-full">
      <section className=" max-w-6xl mx-auto flex justify-center items-center  flex-col">
        <div className="w-full ">
          <div className="mb-8">{renderGreeting()}</div>

          {/* My Profile Section */}
          <div className="mb-4 px-4">
            <div
              className="flex items-center justify-between "
              onClick={() => setIsMyProfileOpen(!isMyProfileOpen)}
            >
              <h2 className="cursor-pointer text-md md:text-xl ">My Profile</h2>
              <p className="flex items-center">
                <span
                  onClick={() => {
                    changeDetail && onSubmit();
                    setChangeDetail((prevState) => !prevState);
                    setSpecialtiesDisabled(false);
                    setLanguageDisabled(false);
                  }}
                  className="text-black text-md md:text-xl capitalize hover:text-gray-300 transition ease-in-out duration-150 cursor-pointer"
                >
                  {changeDetail ? "Apply Change" : "Edit Profile"}
                </span>
              </p>{" "}
            </div>
            <form className="text-md md:text-xl">
              <div className="md:flex md:gap-2">
                <TextField
                  id="firstName"
                  label="First name"
                  value={firstName}
                  disabled={!changeDetail}
                  onChange={onChange}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                />
                <TextField
                  id="lastName"
                  label="Last name"
                  value={lastName}
                  disabled={!changeDetail}
                  onChange={onChange}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                />
              </div>
              {isAgentUser && (
                <div>
                  <TextField
                    id="agency"
                    label="Agency"
                    value={agency}
                    disabled={!changeDetail}
                    onChange={onChange}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                  />
                  <TextField
                    id="aboutMe"
                    label="About Me"
                    value={aboutMe}
                    disabled={!changeDetail}
                    onChange={(e) => setAboutMe(e.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    margin="normal"
                  />
                  <div className="flex flex-col gap-2 md:flex-row">
                  <FormControl fullWidth variant="outlined" margin="normal">
                    <InputLabel id="specialties-label">Specialties</InputLabel>
                    <Select
                      labelId="specialties-label"
                      id="specialties"
                      multiple
                      value={selectedSpecialties}
                      onChange={handleSpecialtiesChange}
                      renderValue={(selected) => (
                        <div className="flex flex-wrap gap-2">
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={value}
                              onDelete={() => handleDelete(value)}
                            />
                          ))}
                        </div>
                      )}
                      disabled={!changeDetail || specialtiesDisabled}
                    >
                      {specialties.map((specialty) => (
                        <MenuItem key={specialty} value={specialty}>
                          {specialty}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth variant="outlined" margin="normal">
                    <InputLabel id="language-label">language</InputLabel>
                    <Select
                      labelId="language-label"
                      id="language"
                      multiple
                      value={selectedLanguage}
                      onChange={handleLanguageChange}
                      renderValue={(selected) => (
                        <div className="flex flex-wrap gap-2">
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={value}
                              onDelete={() => handleLanguageDelete(value)}
                            />
                          ))}
                        </div>
                      )}
                      disabled={!changeDetail || languageDisabled} // Disable if changeDetail is false or specialtiesDisabled is true
                    >
                      {language.map((language) => (
                        <MenuItem key={language} value={language}>
                          {language}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl></div>
                </div>
              )}{" "}
              <TextField
                id="phoneNumber"
                label="Phone Number"
                value={phoneNumber}
                disabled
                onChange={onChange}
                fullWidth
                variant="outlined"
                margin="normal"
              />
              <TextField
                id="email"
                label="Email"
                value={email}
                disabled
                onChange={onChange}
                fullWidth
                variant="outlined"
                margin="normal"
              />
            </form>

            <div className="border-t flex-1 mt-4 after:border-gray-300"></div>
          </div>

          {/* My Listings Section */}
          <div className="mb-4 px-4">
            <div
              className="flex items-center justify-between"
              onClick={() => setIsMyListingsOpen(!isMyListingsOpen)}
            >
              <h2 className="cursor-pointer text-md md:text-xl  mb-2">
                My Listings
              </h2>
              <FaAngleDown
                className={`cursor-pointer transition-transform ease-in-out duration-200 transform ${
                  isMyListingsOpen ? "rotate-180" : ""
                }`}
              />
            </div>
            {isMyListingsOpen && (
              <>
                {!loading && listings.length > 0 && (
                  <ul className="gap-4 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 mt-6 mb-6">
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
          </div>

          <div className="flex justify-center sm:justify-start whitespace-nowrap mb-6 px-4 ">
            <p
              onClick={onLogout}
              className="flex items-center gap-1 mt-8 text-lg  capitalize hover:text-gray-300 transition ease-in-out duration-200 cursor-pointer"
            >
              Sign out <PiSignOutBold />
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
