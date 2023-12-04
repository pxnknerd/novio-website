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
    <div className="bg-white border-b-4 border-black p-4 sticky top-0 z-50">
        <header className="flex justify-between items-center px-3 max-w-4xl mx-auto">
            <div>
            <img src={process.env.PUBLIC_URL + '/novioLogoB.png'} alt="Logo" className="h-14 cursor-pointer" onClick={()=>navigate("/")} />
            </div>
            <div>
                <ul className="flex space-x-10">
                <li className={`cursor-pointer pt-7 font-semibold border-b-[3px] border-transparent  ${pathMatchRoute("/") && "text-black border-b-red-500"}`} onClick={()=>navigate("/")}>
  Home
</li>
                    <li className={`cursor-pointer pt-7 font-semibold border-b-[3px] border-transparent  ${pathMatchRoute("/offers") && "text-black border-b-green-500"}`}onClick={()=>navigate("/offers")}>Offers</li>
                    <li className={`cursor-pointer pt-7 font-semibold border-b-[3px] border-transparent  ${pathMatchRoute("/sign-in") && "text-black border-b-red-500"}`}onClick={()=>navigate("/sign-in")}>Sign In</li>
                </ul>
            </div>
        </header>
    </div>
  )
}
