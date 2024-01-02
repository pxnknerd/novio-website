import React, { useState } from "react";
import OAuth from "../components/OAuth";
import { Link } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-toastify"

export default function ForgotPassword() {
  const [email, setEmail] = useState(""); 

  function onChange(e) {
    setEmail(e.target.value);
  }

  async function onSubmit(e){
    e.preventDefault()
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      toast.success("Email was sent");
    } catch (error) {
      toast.error("Could not send reset password");
    }
  }
  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2"> 
      <div className="grid w-full h-48 grid-cols-1 grid-rows-1 overflow-hidden bg-cover md:h-screen bg-blue-100 ">
        <div className='h-full  col-span-1 col-start-1 row-span-1 row-start-1"'>
      <img src={process.env.PUBLIC_URL + '/img007.png'} 
      alt="key"
      className=" object-cover h-full bg-blend-overlay"/>
      </div>
      <div  className='h-full col-span-1 col-start-1 row-span-1 row-start-1 text-center  '>
        <a href="/">
          <img src={process.env.PUBLIC_URL + '/Logo.svg'}
            className='mt-12 w-36 md:w-60 text-center hover:opacity-70 transition ease-in-out duration-200 inline-block'/>
        </a>
        

      </div>
      </div>
      <div className="flex items-center py-12 bg-white md:my-0 md:h-screen md:shadow-md shadow-black/30">
        <form onSubmit={onSubmit} className='max-w-md px-4 w-[28rem] mx-auto'>
        <div className=" justify-start text-center md:text-left text-xl md:text-4xl py-8 text-black">
            Reset Password
          </div>
          <input 
          type="email" 
          id="email" 
          value={email} 
          onChange={onChange}
          placeholder="Email address"
          className="w-full mb-6 px-4 py-2 text-md color-grey-700 shadow-md bg-white border-gray-300 rounded transition ease-in-out"
          />
          <div className="flex justify-between whitespace-nowrap text-sm sm:text-md">
            <p className="mb-6">Don't have a account? 
              <Link to="/sign-up" className="text-black hover:text-red-700 transition duration-200 ease-in-out font-semibold"> Register</Link>
            </p>
            <p>
              <Link to="/sign-in" className="text-black hover:text-red-700 transition duration-200 ease-in-out font-semibold"> Sign in instead</Link>
            </p>
          </div>
          <button className="w-full uppercase bg-black rounded text-white px-7 py-3" 
        type="submit">Send email</button> 
      <div className="flex items-center my-4 before:border-t before:flex-1 before:border-gray-300 after:border-t after:flex-1 after:border-gray-300">
        <p className="text-center
        font-semibold mx-4">OR</p>  
      </div>
       <OAuth/>
      </form> 
      </div>
      </div>
    </section>
  )
}
