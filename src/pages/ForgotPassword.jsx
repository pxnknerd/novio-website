import React, { useState } from 'react'
import OAuth from '../components/OAuth';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState(""); 

  function onChange(e) {
    setEmail(e.target.value);
  }
  return (
    <section>
      <h1 className="text-3xl text-center mt-6 font-bold">Forgot Password</h1>
      <div className="flex justify-center flex-wrap items-center px-6 py-12 max-w-6xl mx-auto"> 
      <div className="md:w-[67%] lg:w-[50%] mb-12 md:mb-6">
      <img src={process.env.PUBLIC_URL + '/img001.jpg'} 
      alt="key"
      className="w-full rounded-3xl shadow-md" />
      </div>
      <div className="w-full md:w-[67%] lg:w-[40%] lg:ml-20">
        <form>
          <input 
          type="email" 
          id="email" 
          value={email} 
          onChange={onChange}
          placeholder="Email address"
          className="w-full mb-6 px-4 py-2 text-xl color-grey-700 shadow-md bg-white border-gray-300 rounded transition ease-in-out"
          />
          <div className="flex justify-between whitespace-nowrap text-sm sm:text-lg">
            <p className="mb-6">Don't have a account? 
              <Link to="/sign-up" className="text-black hover:text-red-700 transition duration-200 ease-in-out font-semibold"> Register</Link>
            </p>
            <p>
              <Link to="/sign-in" className="text-black hover:text-red-700 transition duration-200 ease-in-out font-semibold"> Sign in instead</Link>
            </p>
          </div>
          <button className="w-full uppercase bg-black rounded text-white px-7 py-3" 
        type="submit">Reset password</button> 
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
