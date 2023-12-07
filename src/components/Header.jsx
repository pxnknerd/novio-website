import { React, useState } from 'react'
import { useLocation, useNavigate } from "react-router-dom"
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect } from 'react';
export default function Header() {
    const [pageState, setPageState] = useState("Sign in");
    const location = useLocation()
    const navigate = useNavigate()
    const auth = getAuth();
    useEffect(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setPageState("Profile");
        } else {
          setPageState("Sign in");
        }
      });
    }, [auth]);
    function pathMatchRoute(route){
        if(route === location.pathname){
            return true
        }
    }
  return (
    <div className="bg-white border-b-[22px] border-black p-4 sticky top-0 z-40">
        <header className=" flex sm:flex  justify-between items-center px-3 max-w-5xl mx-auto">
            <div>
            <img src={process.env.PUBLIC_URL + '/novioLogoB.png'} 
            alt="Logo" 
            className="h-14 cursor-pointer" 
            onClick={()=>navigate("/")} />
            </div>
            <div>
                <ul className="flex space-x-10 ">
                <li
  className={`cursor-pointer pt-7 ${pathMatchRoute("/") ? "font-bold text-black border-b-3 border-black" : "font-semibold text-gray-500 border-b-3 border-transparent"}`}
  onClick={() => navigate("/")}
>
  Home
</li>

<li
  className={`cursor-pointer pt-7 ${pathMatchRoute("/Offers") ? "font-bold text-black border-b-3 border-black" : "font-semibold text-gray-500 border-b-3 border-transparent"}`}
  onClick={() => navigate("/Offers")}
>
  Offers
</li>

<li
  className={`cursor-pointer pt-7 ${(pathMatchRoute("/sign-in") || pathMatchRoute("/profile")) ? "font-bold text-black border-b-3 border-black" : "font-semibold text-gray-500 border-b-3 border-transparent"}`}
  onClick={() => navigate("/profile")}
>
 {pageState}
</li>

                </ul>
            </div>
        </header>
    </div>
  )
}
