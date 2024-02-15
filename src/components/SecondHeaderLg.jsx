import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { IoMenu } from 'react-icons/io5';
import { VscChromeClose } from "react-icons/vsc";
import { db } from '../firebase';
import { doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { Link } from "react-router-dom";
import CreateListingPopUp from './CreateListingPopUp';
import { FaSearch } from 'react-icons/fa';



export default function SecondHeader() {
  const [pageState, setPageState] = useState('Sign in');
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCreateListingPopUpOpen, setCreateListingPopUpOpen] = useState(false);
  const location = useLocation();
  const [isAgentUser, setIsAgentUser] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const navigate = useNavigate();
  const navigateToResults = (filterType) => {
    // Use the `navigate` function to go to the Results page
    // Pass the filter type as a query parameter
    navigate("/results", { state: { filterType } });
  };
   const [loading, setLoading] = useState(true);
  const auth = getAuth();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setPageState("My Profile");
        } else {
          // User is not authenticated, reset states
          setPageState("Sign in");
          setIsAgentUser(false);
          setUserStatus(null);
        }

        // Set loading to false after the authentication state settles
        setLoading(false);
      });

      // Unsubscribe from the auth state listener when the component unmounts
      return () => {
        unsubscribe();
      };
    }, [auth]);

useEffect(() => {
  
  async function fetchData() {
    try {
      // Check if the user is authenticated
      const user = auth.currentUser;
      if (!user) {
        // Handle the case where the user is not authenticated
        setIsAgentUser(false);
        setUserStatus(null);
        setPageState("Sign in");
        return;
      }

      // Set the page state to 'My Profile' since the user is authenticated
      setPageState("My Profile");

      // Check if the user is an agent
      const agentStatus = await isAgent();
      setIsAgentUser(agentStatus);

      // Fetch user status
      const userDocRef = doc(db, "agents", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // Assuming the user status is stored as a field named "status"
        const status = userDoc.data().status;
        setUserStatus(status);
      } else {
        // Handle the case where the user document doesn't exist
        setUserStatus(null);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  fetchData();
}, [auth.currentUser]);

  function pathMatchRoute(route) {
    return route === location.pathname;
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };
  const toggleCreateListingPopUp = () => {
    setCreateListingPopUpOpen(!isCreateListingPopUpOpen);
  };
  const closeCreateListingPopUp = () => {
    setCreateListingPopUpOpen(false);
  };
  const openCreateListingPopUp = () => {
    setCreateListingPopUpOpen(true);
  };

  const isAgent = async () => {
      const agentDocRef = doc(db, "agents", auth.currentUser.uid);
      const agentDoc = await getDoc(agentDocRef);
      return agentDoc.exists();
    };
  return (
    <div className="hidden lg:block bg-white mt-4 mb-4 top-0 z-40">
      <header className="flex justify-between items-center px-4 md:px-8 mx-auto max-w-8xl">
        <div className="flex container mx-auto w-full sm:hidden">
          <div className="flex items-center w-full">
            <IoMenu className="w-8 h-8 mr-4" onClick={toggleMobileMenu} />
            <a>
              <img
                src={process.env.PUBLIC_URL + "/BeyttyIcon.png"}
                alt="Logo"
                className="h-8"
                onClick={() => navigate("/")}
              />
            </a>
            <div className="relative flex ml-5 rounded h-10">
              <input
                type="search"
                className="w-full rounded bg-gray-200 border-gray-200"
                placeholder="Search Address"
              />
              <div className="absolute right-4 text-black top-0 h-full flex items-center">
                <FaSearch />
              </div>
            </div>
          </div>
        </div>

        <div className="hidden mb-2 justify-middle sm:flex">
          <ul className="sm:flex space-x-4 md:space-x-8 list-none">
            <li
              className={`cursor-pointer pt-3 hover:text-red-800 text-lg  ${
                pathMatchRoute("")
                  ? "font-bold text-black border-b-3  border-black"
                  : " text-black border-b-3 border-transparent"
              }`}
              onClick={() => navigateToResults("sale")}
            >
              Buy
            </li>
            <li
              className={`cursor-pointer pt-3 hover:text-red-800 text-lg  ${
                pathMatchRoute("")
                  ? "font-bold text-black border-b-3 border-black"
                  : " text-black border-b-3 border-transparent"
              }`}
              onClick={() => navigateToResults("rent")}
            >
              Rent
            </li>
            <li
              className={`cursor-pointer pt-3 hover:text-red-800 text-lg  ${
                pathMatchRoute("")
                  ? "font-bold text-black border-b-3 border-black"
                  : " text-black border-b-3 border-transparent"
              }`}
              onClick={() => navigate("")}
            >
              Sell
            </li>
          </ul>
        </div>
        <div className="hidden sm:flex">
          <img
            src={process.env.PUBLIC_URL + "/Logo.png"}
            alt="Logo"
            className="md:absolute-none opacity-100 h-7 sm:h-10 cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>
        <div className="hidden sm:flex space-x-2 items-center">
          {pageState === "Sign in" && (
            <>
              <p
                className={`cursor-pointer px-6 mt-2 hover:bg-gray-300 transition ease-in-out border-[1px] py-1 border-gray-300 rounded-md md:mt-0 text-lg md:text-md ${
                  pathMatchRoute("/sign-in") || pathMatchRoute("/profile")
                    ? " text-black"
                    : " text-black"
                }`}
                onClick={() => navigate("/profile")}
              >
                {pageState}
              </p>
              <p
                className="cursor-pointer px-6 mt-2 bg-custom-red hover:bg-custom-red transition ease-in-out border-[1px] py-1 rounded-md md:mt-0 text-md md:text-lg text-white"
                onClick={() => navigate("/sign-up")}
              >
                Join
              </p>
            </>
          )}
          {isAgentUser && userStatus === "approved" && (
            <button
              type="submit"
              className="cursor-pointer px-6 mt-2 bg-custom-red text-white transition ease-in-out border-[1px] py-1  rounded-md md:mt-0 text-md md:text-md"
              onClick={openCreateListingPopUp}
            >
              New Listing
            </button>
          )}
          {pageState === "My Profile" && (
            <p
              className={`cursor-pointer px-6 mt-2 hover:bg-gray-300 transition ease-in-out border-[1px] py-1 border-gray-300 rounded-md md:mt-0 text-md md:text-md ${
                pathMatchRoute("/sign-in") || pathMatchRoute("/profile")
                  ? " text-black"
                  : " text-black"
              }`}
              onClick={() => navigate("/profile")}
            >
              {pageState}
            </p>
          )}
        </div>
      </header>
      {/* Dark Overlay */}
      {isCreateListingPopUpOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm z-50" />
      )}
      {/* Create Listing Pop-up */}
      {isCreateListingPopUpOpen && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded shadow-lg z-50">
          <button
            className="absolute top-2 right-4 text-3xl"
            onClick={() => setCreateListingPopUpOpen(false)}
          >
            &times;
          </button>
          {/* Include your Create Listing Pop-up content component here */}
          <CreateListingPopUp closePopUp={closeCreateListingPopUp} />
        </div>
      )}

      {/* Dark Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm z-50"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed left-0 -top-0 h-full w-64 z-50 transition-transform ease-in-out duration-300 transform ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-[-17rem]"
        }`}
      >
        {/* Mobile Menu Content */}
        <div className="bg-white shadow-lg h-full flex flex-col justify-between">
          {/* Logo and Close Icon */}
          <div className="flex justify-between items-center p-4">
            {/* Your Logo */}
            <img
              src={process.env.PUBLIC_URL + "/Logo.png"} // Replace with your logo path
              alt="Logo"
              className="w-24"
            />
            {/* Close Icon */}
            <VscChromeClose
              className="h-8 w-8 cursor-pointer"
              onClick={closeMobileMenu}
            />
          </div>

          {/* Menu Items */}
          <ul className="flex flex-col space-y-4 p-4">
            <li onClick={() => navigateFilterAndCloseMobileMenu("sale")}>
              Buy
            </li>
            <div className="border-t flex-1 after:border-gray-300"></div>
            <li onClick={() => navigateFilterAndCloseMobileMenu("rent")}>
              Rent
            </li>
            <div className="border-t flex-1 after:border-gray-300"></div>
            <li>Sell</li>
            <div className="border-t flex-1 after:border-gray-300"></div>
          </ul>
          {/* Last Menu Item */}
          <ul className="flex flex-col items-center mt-auto space-y-4 p-4">
            {pageState === "Sign in" && (
              <>
                <li
                  className={`py-2 w-full text-center rounded-xl ${
                    pageState === "Sign in"
                      ? "bg-white text-black border-2"
                      : "bg-black text-white border-2"
                  }`}
                  onClick={() => navigateAndCloseMobileMenu("/sign-in")}
                >
                  {pageState}
                </li>
                <li
                  className="py-2 w-full text-center rounded-xl mb-14 bg-custom-red text-white "
                  onClick={() => navigateAndCloseMobileMenu("/sign-up")}
                >
                  Join
                </li>
              </>
            )}
            {isAgentUser && userStatus === "approved" && (
              <li
                className="py-2  w-full text-center rounded-xl bg-custom-red text-white"
                onClick={() => navigateAndCloseMobileMenu("/create-listing")}
              >
                New Listing
              </li>
            )}
            {pageState === "My Profile" && (
              <li
                className={`py-2  w-full text-center rounded-xl  ${
                  pathMatchRoute("/sign-in") || pathMatchRoute("/profile")
                    ? " bg-white text-black border-2"
                    : " bg-white  text-black border-2"
                }`}
                onClick={() => navigateAndCloseMobileMenu("/profile")}
              >
                {pageState}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
  function navigateAndCloseMobileMenu(route) {
    navigate(route);
    closeMobileMenu();
  }
  function navigateFilterAndCloseMobileMenu(route) {
    navigateToResults(route);
    closeMobileMenu();
  }
}
