import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { IoMenu } from 'react-icons/io5';
import { FaUser } from 'react-icons/fa';
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
      <header className="flex justify-between items-center px-4 md:px-8  mx-auto">
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
        <div className="hidden md:flex">
          <img
            src={process.env.PUBLIC_URL + '/Logo.png'}
            alt="Logo"
            className="md:absolute-none opacity-100 h-7 sm:h-8 cursor-pointer"
            onClick={() => navigate('/')}
          />
        </div>
        <div className="hidden mb-2 justify-middle md:flex">
          <ul className="md:flex space-x-16 list-none">
          <li
              className={`cursor-pointer pt-3 text-xs md:text-base ${
                pathMatchRoute('/category/sale')
                  ? 'font-bold text-black border-b-3 border-black'
                  : 'font-thin text-gray-500 border-b-3 border-transparent'
              }`}
              onClick={() => navigate('/category/sale')}
            >
              Buy
            </li>
            <li
              className={`cursor-pointer pt-3 text-xs md:text-base ${
                pathMatchRoute('/category/rent')
                  ? 'font-bold text-black border-b-3 border-black'
                  : 'font-thin text-gray-500 border-b-3 border-transparent'
              }`}
              onClick={() => navigate('/category/rent')}
            >
              Rent
            </li>
            <li
              className={`cursor-pointer pt-3 text-xs md:text-base ${
                pathMatchRoute('/Offers')
                  ? 'font-bold text-black border-b-3 border-black'
                  : 'font-thin text-gray-500 border-b-3 border-transparent'
              }`}
              onClick={() => navigate('/Offers')}
            >
              Offers
            </li>
          </ul>
        </div>
        <div className='hidden md:flex items-center'>
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
        </div>
        
      </header >
      {/* Dark Overlay */}
{isMobileMenuOpen && (
  <div
    className="fixed top-0 left-0 w-full h-full bg-black opacity-50 z-50"
    onClick={closeMobileMenu}
  />
)}

{/* Mobile Menu */}
<div className={`md:hidden fixed left-0 -top-0 h-full w-64 z-50 transition-transform ease-in-out duration-300 transform ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-[-17rem]'}`}>
  {/* Mobile Menu Content */}
  <div className="bg-white shadow-lg h-full">
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
    <div className="border-t flex-1 after:border-gray-300"> </div>
    {/* Menu Items */}
    <ul className="flex cursor-pointer flex-col space-y-4 p-4">
      <li onClick={() => navigateAndCloseMobileMenu('/category/sale')}>Buy</li>
      <div className="border-t flex-1 after:border-gray-300"></div>
      <li onClick={() => navigateAndCloseMobileMenu('/category/rent')}>Rent</li>
      <div className="border-t flex-1 after:border-gray-300"></div>
      <li onClick={() => navigateAndCloseMobileMenu('/Offers')}>Offers</li>
      <div className="border-t flex-1 after:border-gray-300"></div>
            <li onClick={() => navigateAndCloseMobileMenu('/sign-in') || navigateAndCloseMobileMenu('/Profile') }>{pageState}</li>
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
