import React from 'react'
import {FaGoogle} from "react-icons/fa"

export default function OAuth() {
  return (
    <button className="flex items-center justify-center w-full bg-gray-50 px-7 py-3 uppercase text-sm shadow-md hover:shadow-lg active: shadow-lg transition duration-150 ease-in-out rounded">
        <FaGoogle className="text-2xl bg-white rounded-full mr-2" />
        Continue with Google
    </button>
  )
}
