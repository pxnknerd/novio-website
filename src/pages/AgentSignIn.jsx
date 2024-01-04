import React, { useState } from 'react'
import { AiFillEyeInvisible, AiFillEye} from "react-icons/ai";
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';
import {signInWithEmailAndPassword, getAuth } from "firebase/auth"
import {toast} from "react-toastify";

export default function AgentSignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  }); 
  const { email, password } = formData;
  const handleSignUpAsAgentClick = () => {
    // Navigate to the AgentSignUp page when clicked
    navigate("/sign-in");
  };
  const navigate = useNavigate()
  function onChange(e) {
    setFormData((prevState)=>({
      ...prevState, 
      [e.target.id]: e.target.value,
    }))
  }
  async function onSubmit(e){
    e.preventDefault()
    try {
      const auth = getAuth()
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        email, 
        password
      );
      if(userCredential.user) {
        navigate("/");

    } 
  } catch (error) {
      toast.error("Bad user credentials");
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
            Agent Sign In
          </div>
          <input 
          type="email" 
          id="email" 
          value={email} 
          onChange={onChange}
          placeholder="Email address"
          className="w-full mb-6 px-4 py-2 text-md color-grey-700 shadow-md bg-white border-gray-300 rounded transition ease-in-out"
          />
          <div className="relative">
          <input
          type={showPassword ? "text" : "password"} 
          id="password" 
          value={password} 
          onChange={onChange}
          placeholder="Password"
          className="w-full px-4 mb-6 py-2 text-md  shadow-md color-grey-700 bg-white border-gray-300 rounded transition ease-in-out"
          />   
          {showPassword ? <AiFillEyeInvisible className="absolute right-3 top-3 text-md cursor-pointer"
           onClick={() => setShowPassword
             ((prevState) => !prevState)}/>
          : <AiFillEye className="absolute right-3 top-3 text-xl cursor-pointer" 
           onClick={() => setShowPassword
            ((prevState) => !prevState)}/>}
          </div>
          <div className="flex justify-between whitespace-nowrap text-sm sm:text-md">
          <p className="mb-6">Create new 
              <Link to="/agent-sign-up" className="text-black hover:text-red-700 transition duration-200 ease-in-out font-semibold"> Agent account</Link>
            </p>
            <p>
              <Link to="/forgot-password" className="text-black hover:text-black transition duration-200 ease-in-out font-semibold"> Forgot password?</Link>
            </p>
          </div>
          <button className="w-full uppercase bg-black rounded text-white px-7 py-3" 
        type="submit">Sign in</button> 
      <div className="flex items-center my-4 before:border-t before:flex-1 before:border-gray-300 after:border-t after:flex-1 after:border-gray-300">
        <p className="text-center
        font-semibold mx-4">OR</p>  
      </div>
       <OAuth/>
       <p
      className="text-center py-6 font-semibold mx-4 cursor-pointer hover:underline"
      onClick={handleSignUpAsAgentClick}
    >
      Sign in as user
    </p>
      </form> 
      </div>
      </div>
    </section>
  )
}
