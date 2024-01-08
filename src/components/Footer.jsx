import React from 'react'
import { FaInstagram, FaFacebook, FaTiktok, FaYoutube  } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";



export default function Footer() {
  return (
    <footer className='flex flex-col items-center mt-12 bg-gray-200'>
    <div className='container flex flex-col items-center justify-center px-4  mx-auto flex-grow  max-w-6xl'>
    <hr className='my-4 border-gray-600' />
      <div className='flex w-full '>
        <div className='grid  flex-grow space-y-4 text-sm text-gray-500 sm:gap-2 grid-cols-1 lg:grid-cols-4 sm:grid-cols-4 sm:space-y-0'>
          <div className='flex justify-between'>
            <div>
              <ul>
                <li>About</li>
                <li>Team</li>
                <li>Help</li>
              </ul>
            </div>
            
          </div>
          <ul>
            <li>Terms of use</li>
            <li>Privacy Portal</li>
          </ul>
          <ul>
            <li>Blog</li>
            <li>AI</li>
          </ul>
          <div className='hidden  sm:flex sm:justify-end space-x-2 text-xl'>
          <FaFacebook/>
              <FaInstagram/>
              <FaTiktok/>
              <FaYoutube/>
              <IoLogoWhatsapp/>
          </div>
        </div>
      </div>
      
      <div className='flex sm:hidden py-4 space-x-4 text-gray-500 justify-end  text-2xl'>
            <FaFacebook/>
              <FaInstagram/>
              <FaTiktok/>
              <FaYoutube/>
              <IoLogoWhatsapp/>
            </div>
            <div className="sm:hidden border-t w-full  border-gray-300"></div>
      <div className='flex py-8 justify-between w-full '>
        <img
          src={process.env.PUBLIC_URL + '/Logo.png'}
          alt="Logo"
          className="w-24 h-full"
        />
        <p className='text-gray-500 text-sm'>© 2023 All rights reserved. </p>
      </div>

    </div>
  </footer>
  
  )
}
