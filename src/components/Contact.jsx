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
  const [callButtonText, setCallButtonText] = useState("Call agent");


  useEffect(() => {
    async function getLandlord() {
      const docRef = doc(db, "agents", userRef);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLandlord(docSnap.data());
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
   function handleCallAgent() {
     if (callButtonText === "Call agent") {
       // If the button text is "Call Agent", change it to display the phone number
       setCallButtonText(`Call ${landlord.phoneNumber}`);
     } else {
       // If the button text is already displaying the phone number, initiate the call
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
                    src={landlord.photoURL || "/default-profile-picture.jpg"}
                    alt="Landlord Profile"
                    className="h-10 w-10 mb-4 rounded-full justify-center mx-auto object-cover"
                  />
                  <p>Listed by {""}{`${landlord.firstName} ${landlord.lastName}`}</p>
                </div>{" "}
                <button
                  className="bg-custom-black text-white rounded-md py-3 md:text-xl"
                  type="button"
                  onClick={handleCallAgent}
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
                    className="w-full py-2 text-md text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600"
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
                    className="w-full h-[250px] py-2 text-md text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600"
                  ></textarea>
                </div>
                <button
                  className="block w-full bg-custom-black border-2 text-white rounded-md py-3 md:text-xl"
                  type="button"
                  onClick={handleSendEmail}
                >
                  Send Email
                </button>
                <button
                  className="block w-full mt-2 border-green-500 hover:border-green-700 hover:text-green-700 border-2 text-green-500 rounded-md py-3 md:text-xl"
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
