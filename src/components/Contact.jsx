import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { db } from "../firebase";
import { GrFormPrevious } from "react-icons/gr";
import { FaWhatsapp } from "react-icons/fa";



export default function Contact({ userRef, listing }) {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState(
    "Hello, I'm interested in your listing and would appreciate more information."
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentStep, setCurrentStep] = useState("initial");
  const [callButtonText, setCallButtonText] = useState("Call");
  const [listingType, setListingType] = useState("");


  useEffect(() => {
    async function getLandlord() {
      const agentDocRef = doc(db, "agents", userRef);
      const userDocRef = doc(db, "users", userRef);

      const agentDocSnap = await getDoc(agentDocRef);
      const userDocSnap = await getDoc(userDocRef);

      if (agentDocSnap.exists()) {
        setLandlord(agentDocSnap.data());
        setListingType("Listed by agent");
        setCallButtonText("Call Agent"); 
      } else if (userDocSnap.exists()) {
        setLandlord(userDocSnap.data());
        setListingType("Listed by owner");
        setCallButtonText("Call Owner");

      } else {
        toast.error("Could not get landlord data");
      }
    }

    getLandlord();
  }, [userRef]);

  function onChange(e) {
    const { name, value } = e.target;
    if (name === "message") {
      setMessage(value);
    } else if (name === "phoneNumber") {
      setPhoneNumber(value);
    }
  }

  function handleBack() {
    setCurrentStep("initial");
  }

  function handleShowMessageInput() {
    setCurrentStep("messageInput");
  }
  function handleSendEmail() {
    window.location.href = `mailto:${landlord.email}?Subject=${listing.name}&body=${message}%0D%0A%0D%0AHere's My Phone Number: ${phoneNumber}%0D%0A%0D%0AView Listing: www.beytty.com/results/${listing.listingId}`;
  }

  function handleSendWhatsApp() {
    const whatsappMessage = `Hi, I'm interested in your listing "${listing.name}" and would like more information. My phone number is ${phoneNumber}.`;
    const whatsappLink = `https://wa.me/${
      landlord.phoneNumber
    }?text=${encodeURIComponent(whatsappMessage)}`;
    window.location.href = whatsappLink;
  }
 function handleCall() {
   if (callButtonText === "Call Agent" || callButtonText === "Call Owner") {
     // If the button text is "Call Agent" or "Call Owner", change it to display the phone number
     setCallButtonText(landlord.phoneNumber);
   } else {
     // If the button text is a phone number, initiate the call
     window.location.href = `tel:${landlord.phoneNumber}`;
   }
 }


   
  return (
    <>
      <div className=" w-full">
        {landlord !== null && (
          <div className="flex flex-col w-full">
            {currentStep === "messageInput" && (
              <div className="cursor-pointer hover:opacity-80 mb-3 ">
                <GrFormPrevious size={25} onClick={handleBack} />
              </div>
            )}
            {currentStep === "initial" && (
              <div className="flex flex-col space-y-4">
                <div className=" justify-center mx-auto space-x-2">
                  <img
                    src={landlord.photoURL ? landlord.photoURL : "/anonym.png"}
                    alt="Landlord Profile"
                    className="h-10 w-10 mb-4 rounded-full justify-center mx-auto object-cover"
                  />
                  <p>
                    {""}
                    {`${landlord.firstName} ${landlord.lastName}`}
                  </p>
                  {listingType && <p className="text-gray-400 mx-auto justify-center flex  ">{listingType}</p>}
                </div>{" "}
                <button
                  className="bg-custom-red text-white rounded-md py-3 md:text-xl"
                  type="button"
                  onClick={handleCall}
                >
                  {callButtonText}
                </button>
                <button
                  className="block bg-white border-2 border-black text-black rounded-md py-3 md:text-xl active:border-black active:text-black"
                  type="button"
                  onClick={handleShowMessageInput}
                >
                  Request visit
                </button>
              </div>
            )}

            {currentStep === "messageInput" && (
              <div>
                <p>Phone Number</p>
                <div className="w-full mt-3 mb-6">
                  <input
                    type="tel"
                    name="phoneNumber"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={onChange}
                    placeholder="Enter your phone number"
                    className="w-full py-2 text-md text-gray-700 bg-gray-100 border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600"
                  />
                </div>
                <p>Message</p>
                <div className="w-full mt-1 mb-6">
                  <textarea
                    name="message"
                    id="message"
                    rows="2"
                    value={message}
                    onChange={onChange}
                    className="w-full h-[250px] py-2 text-md text-gray-700 bg-gray-100 border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600"
                  ></textarea>
                </div>
                <button
                  className="block w-full bg-custom-red border-2 text-white rounded-md py-3 md:text-xl"
                  type="button"
                  onClick={handleSendEmail}
                >
                  Send Email
                </button>
                <button
                  className="block w-full mt-2 border-black hover:border-black hover:bg-gray-100 border-2 text-black rounded-md py-3 md:text-xl"
                  type="button"
                  onClick={handleSendWhatsApp}
                >
                  WhatsApp
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
