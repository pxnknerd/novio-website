
import { React, useState} from "react"
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const auth = getAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayname,
    email: auth.currentUser.email,
  });
  const {name,  email} = formData
  function onLogout (){
     auth.signOut();
     navigate("/home");
  }
  return (
    <>
    <section className="max-w-6xl mx-auto flex justify-center items-center flex-col">
      <h1 className="text-3xl text-center mt-6 font-bold">My Profile</h1>
      <div className="w-full md:w-[50%] mt-6 px-3">

        {/*Email input*/}

        <input type="email" id="email" value={email} disabled className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out"/> 
        <form>

          {/* Name Input*/}
          <input type="text" id="name" value={name} disabled className="mb-6 w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition ease-in-out"/> 
          <div className="flex justify-between whitespace-nowrap mb-6 text-sm sm:text-lg">
            <p className="flex items-center">Do you want to change your name?
              <span className="text-black font-semibold hover:text-gray-300 transition ease-in-out duration-150 ml-1 cursor-pointer">Edit</span>
            </p>
            <p onClick={onLogout} className="text-black font-semibold hover:text-gray-300 transition ease-in-out duration-200 cursor-pointer">Sign Out</p>
          </div>
        </form>
      </div>
    </section>
    </>
  )
}
