import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { IoMenu } from 'react-icons/io5';
import { VscChromeClose } from "react-icons/vsc";


export default function Header() {
  const [pageState, setPageState] = useState('Sign in');
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setPageState('My Profile');
      } else {
        setPageState('Sign in');
      }
    });
  }, [auth]);

  function pathMatchRoute(route) {
    return route === location.pathname;
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="bg-white border-b-[10px]  mt-3 border-white top-0 z-40">
      <header className="flex justify-between items-center px-4 md:px-8  mx-auto max-w-6xl">
        <div className="flex container mx-auto w-full justify-center  md:hidden">
          <div className='flex justify-start w-full'>
          <IoMenu className='w-8 h-8' onClick={toggleMobileMenu} />
          </div>
          <a className='absolute '>
            <img src={process.env.PUBLIC_URL + '/Logo.png'}
            alt="Logo"
            className=' h-8'
            onClick={() => navigate('/')} />
          </a>
        </div>
        
        <div className="hidden mb-2 justify-middle md:flex">
          <ul className="md:flex space-x-8 list-none">
          <li
              className={`cursor-pointer pt-3 text-xs md:text-base ${
                pathMatchRoute('/category/sale')
                  ? 'font-bold text-black border-b-3 border-black'
                  : 'font-thin text-black border-b-3 border-transparent'
              }`}
              onClick={() => navigate('/category/sale')}
            >
              Buy
            </li>
            <li
              className={`cursor-pointer pt-3 text-xs md:text-base ${
                pathMatchRoute('/category/rent')
                  ? 'font-bold text-black border-b-3 border-black'
                  : 'font-thin text-black border-b-3 border-transparent'
              }`}
              onClick={() => navigate('/category/rent')}
            >
              Rent
            </li>
            <li
              className={`cursor-pointer pt-3 text-xs md:text-base ${
                pathMatchRoute('/Offers')
                  ? 'font-bold text-black border-b-3 border-black'
                  : 'font-thin text-black border-b-3 border-transparent'
              }`}
              onClick={() => navigate('/Offers')}
            >
              Offers
            </li>
          </ul>
        </div>
        <div className="hidden  md:flex">
          <img
            src={process.env.PUBLIC_URL + '/Logo.png'}
            alt="Logo"
            className="md:absolute-none opacity-100 h-7 sm:h-10 cursor-pointer"
            onClick={() => navigate('/')}
          />
        </div>
        <div className='hidden md:flex space-x-2 items-center'>
          {pageState === 'Sign in' && (
            <>
              <p
                className="cursor-pointer px-6 mt-2 bg-custom-red hover:bg-custom-red transition ease-in-out border-[1px] py-1 rounded-md md:mt-0 text-md md:text-md text-white"
                onClick={() => navigate('/sign-up')}
              >
                Join
              </p>
              <p
                className={`cursor-pointer px-6 mt-2 hover:bg-gray-300 transition ease-in-out border-[1px] py-1 border-gray-300 rounded-md md:mt-0 text-md md:text-md ${
                  pathMatchRoute('/sign-in') || pathMatchRoute('/profile')
                    ? ' text-black'
                    : ' text-black'
                }`} 
                onClick={() => navigate('/profile')}
              >
                {pageState}
              </p>
            </>
          )}
          {pageState === 'My Profile' && (
            
            <p
              className={`cursor-pointer px-6 mt-2 hover:bg-gray-300 transition ease-in-out border-[1px] py-1 border-gray-300 rounded-md md:mt-0 text-md md:text-md ${
                pathMatchRoute('/sign-in') || pathMatchRoute('/profile')
                  ? ' text-black'
                  : ' text-black'
              }`} 
              onClick={() => navigate('/profile')}
            >
              {pageState}
            </p>
            
          )}
        </div>
        
      </header >
      {/* Dark Overlay */}
{isMobileMenuOpen && (
  <div
    className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm z-50"
    onClick={closeMobileMenu}
  />
)}

{/* Mobile Menu */}
<div className={`md:hidden fixed left-0 -top-0 h-full w-64 z-50 transition-transform ease-in-out duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-[-17rem]'}`}>
  {/* Mobile Menu Content */}
  <div className="bg-white shadow-lg h-full flex flex-col justify-between">
    {/* Logo and Close Icon */}
    <div className="flex justify-between items-center p-4">
      {/* Your Logo */}
      <img
        src={process.env.PUBLIC_URL + '/Logo.png'} // Replace with your logo path
        alt="Logo"
        className="w-24"
      />
      {/* Close Icon */}
      <VscChromeClose className="h-8 w-8 cursor-pointer" onClick={closeMobileMenu} />
    </div>

    {/* Menu Items */}
    <ul className="flex flex-col space-y-4 p-4">
      <li onClick={() => navigateAndCloseMobileMenu('/category/sale')}>Buy</li>
      <div className="border-t flex-1 after:border-gray-300"></div>
      <li onClick={() => navigateAndCloseMobileMenu('/category/rent')}>Rent</li>
      <div className="border-t flex-1 after:border-gray-300"></div>
      <li onClick={() => navigateAndCloseMobileMenu('/Offers')}>Offers</li>
      <div className="border-t flex-1 after:border-gray-300"></div>
      </ul>
    {/* Last Menu Item */}
    <ul className="flex flex-col items-center mt-auto space-y-4 p-4">
    {pageState === 'Sign in' && (
        <>
          <li
            className={`py-2 w-full text-center rounded-xl ${
              pageState === 'Sign in' ? 'bg-white text-black border-2' : 'bg-black text-white border-2'
            }`}
            onClick={() => navigateAndCloseMobileMenu('/sign-in')}
          >
            {pageState}
          </li>
          <li
            className="py-2 w-full text-center rounded-xl mb-14 bg-custom-red text-white "
            onClick={() => navigateAndCloseMobileMenu('/sign-up')}
          >
            Join
          </li>
        </>
      )}
      {pageState === 'My Profile' && (
    <li className={`py-2  w-full text-center rounded-xl  ${
      pathMatchRoute('/sign-in') || pathMatchRoute('/profile')
        ? ' bg-custom-red text-white'
        : ' bg-custom-red  text-white'
    }`} 
    onClick={() =>  navigateAndCloseMobileMenu('/profile')}
  >
    {pageState}</li>
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
}
