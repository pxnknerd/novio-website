import React from 'react'
import {useLocation, useNavigate} from "react-router-dom"
export default function Header() {
    const location = useLocation()
    const navigate = useNavigate()
    function pathMatchRoute(route){
        if(route === location.pathname){
            return true
        }
    }
  return (
    <div className="bg-white border-b-[22px] border-black p-4 sticky top-0 z-50">
        <header className=" flex justify-between items-center px-3 max-w-5xl mx-auto">
            <div>
            <img src={process.env.PUBLIC_URL + '/novioLogoB.png'} 
            alt="Logo" 
            className="h-14 cursor-pointer" 
            onClick={()=>navigate("/")} />
            </div>
            <div>
                <ul className="flex space-x-10 ">
                <li
  className={`cursor-pointer pt-7 ${pathMatchRoute("/home") ? "font-bold text-black border-b-3 border-black" : "font-semibold text-gray-500 border-b-3 border-transparent"}`}
  onClick={() => navigate("/home")}
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
  className={`cursor-pointer pt-7 ${pathMatchRoute("/sign-in") ? "font-bold text-black border-b-3 border-black" : "font-semibold text-gray-500 border-b-3 border-transparent"}`}
  onClick={() => navigate("/sign-in")}
>
  Sign In
</li>

                </ul>
            </div>
        </header>
    </div>
  )
}
