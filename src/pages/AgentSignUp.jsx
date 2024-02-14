import React, { useState } from 'react'
import { AiFillEyeInvisible, AiFillEye} from "react-icons/ai";
import { Link } from "react-router-dom";
import OAuth from "../components/OAuth";
import {getAuth, createUserWithEmailAndPassword, updateProfile} from "firebase/auth";
import {db} from "../firebase";
import {doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import {toast} from "react-toastify";
import Select from "react-select";

export default function AgentSignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    agency: "",
    email: "",
    password: "",
    phoneNumber: "+212",
    selectedCities: [],
  }); 
    const [emailError, setEmailError] = useState("");
      const [phoneNumberError, setPhoneNumberError] = useState("");

    const [passwordError, setPasswordError] = useState("");
    const MoroccanCities = [
      "Agadir",
      "Al Hoceima",
      "Azemmour",
      "Beni Mellal",
      "Boujdour",
      "Casablanca",
      "Chefchaouen",
      "Dakhla",
      "El Jadida",
      "Erfoud",
      "Essaouira",
      "Fes",
      "Fnideq",
      "Guelmim",
      "Ifrane",
      "Kénitra",
      "Khouribga",
      "Laayoune",
      "Larache",
      "Marrakech",
      "Meknes",
      "Mohammedia",
      "Nador",
      "Ouarzazate",
      "Oujda",
      "Rabat",
      "Safi",
      "Salé",
      "Tangier",
      "Taza",
      "Tétouan",
      "Tiznit",
    ];
    const isValidMoroccanPhoneNumber = (number) => {
      const moroccanPhoneNumberRegex = /^\+212[5-9]\d{8}$/;
      return moroccanPhoneNumberRegex.test(number);
    };

  const { firstName, lastName, email, agency, password, phoneNumber, selectedCities} =
    formData;
  const navigate = useNavigate()
  function onChange(e) {
    setFormData((prevState)=>({
      ...prevState, 
      [e.target.id]: e.target.value,
    }))
  }
const onCityChange = (selectedOptions) => {
  // Enforce a limit of 3 selected cities
  if (selectedOptions.length > 3) {
    // Display a message or take appropriate action (e.g., toast)
    return;
  }

  setFormData((prevState) => ({
    ...prevState,
    selectedCities: selectedOptions.map((option) => option.value),
  }));
};

const onPhoneNumberChange = (e) => {
  const remainingPart = e.target.value.replace(/^\+212/, "");
  setFormData((prevState) => ({
    ...prevState,
    phoneNumber: `+212${remainingPart}`,
  }));
};

  async function onSubmit(e){
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    // Regular expression to extract domain from email
    const domainRegex = /@([a-zA-Z0-9.-]+)$/;
    const match = email.match(domainRegex);

    // Validate Moroccan phone number format
    if (!isValidMoroccanPhoneNumber(formData.phoneNumber)) {
      // Display a message or take appropriate action (e.g., toast)
      setPhoneNumberError("Invalid Moroccan phone number format");
      return;
    }

    if (!match) {
      setPasswordError("Invalid email address. Please enter a valid email.");
      return;
    }

    const emailDomain = match[1].toLowerCase();
    const allowedDomains = [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "icloud.com",
      "aol.com",
      "protonmail.com",
      "mail.com",
      "zoho.com",
      "yandex.com",
      "gmx.com",
    ];
    if (!allowedDomains.includes(emailDomain)) {
      setEmailError(
        "Invalid email domain. Please use a supported email provider."
      );
      return;
    }
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;
      const formDataCopy = { ...formData };
      delete formDataCopy.password;
      formDataCopy.timestamp = serverTimestamp();
      formDataCopy.status = "pending";
      formDataCopy.selectedCities = selectedCities;
      // Ensure both operations are atomic
      await Promise.all([
        updateProfile(auth.currentUser, {
          displayName: `${firstName} ${lastName} ${agency}`,
        }),
        setDoc(doc(db, "agents", user.uid), formDataCopy),
      ]);
      navigate("/agent-verification");
    } catch (error) {
      console.error("Firebase authentication error:", error);

      switch (error.code) {
        case "auth/email-already-in-use":
          setEmailError("This email is already in use. Please choose another.");
          break;
        case "auth/invalid-email":
          setEmailError("Invalid email address. Please enter a valid email.");
          break;
        case "auth/weak-password":
          setPasswordError(
            "Password is too weak. Please choose a stronger password."
          );
          break;
        // Handle other auth errors as needed
        default:
          setEmailError("Something went wrong with the registration");
      }
    }
  }
  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="grid w-full h-48 grid-cols-1 grid-rows-1 overflow-hidden bg-cover md:h-screen bg-gray-100 ">
          <div className='h-full  col-span-1 col-start-1 row-span-1 row-start-1"'>
            <img
              src={process.env.PUBLIC_URL + "/img007.png"}
              alt="key"
              className=" object-cover h-full bg-blend-overlay"
            />
          </div>
          <div className="h-full col-span-1 col-start-1 row-span-1 row-start-1 text-center  ">
            <a href="/">
              <img
                src={process.env.PUBLIC_URL + "/Logo.svg"}
                className="mt-12 w-36 md:w-60 text-center hover:opacity-70 transition ease-in-out duration-200 inline-block"
              />
            </a>
          </div>
        </div>
        <div className="flex items-center py-12 bg-white md:my-0 md:h-screen md:shadow-md shadow-black/30">
          <form onSubmit={onSubmit} className="max-w-md px-4 w-[28rem] mx-auto">
            <div className=" justify-start text-center md:text-left text-xl md:text-4xl py-8 text-black">
              Create agent account
            </div>

            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={onChange}
              placeholder="First name"
              className="w-full mt-6 px-4 py-2 text-md color-grey-700 shadow-md bg-white border-gray-300 rounded transition ease-in-out"
            />
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={onChange}
              placeholder="Last name"
              className="w-full mt-6 px-4 py-2 text-md color-grey-700 shadow-md bg-white border-gray-300 rounded transition ease-in-out"
            />
            <input
              type="text"
              id="agency"
              value={agency}
              onChange={onChange}
              placeholder="Agency name"
              className="w-full mt-6 px-4 py-2 text-md color-grey-700 shadow-md bg-white border-gray-300 rounded transition ease-in-out"
            />
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={onPhoneNumberChange}
              className="w-full mt-6 px-4 py-2 text-md color-grey-700 shadow-md bg-white border-gray-300 rounded transition ease-in-out"
            />
            {phoneNumberError && (
              <p className="text-red-500 text-sm mb-2">{phoneNumberError}</p>
            )}

            <div className="mt-6">
              <label
                htmlFor="selectedCities"
                className="text-md font-medium text-black"
              ></label>
              <Select
                id="selectedCities"
                name="selectedCities"
                placeholder="Select up to 3 cities you operate in:"
                options={MoroccanCities.map((city) => ({
                  value: city,
                  label: city,
                }))}
                isMulti
                value={selectedCities.map((city) => ({
                  value: city,
                  label: city,
                }))}
                onChange={onCityChange}
              />
            </div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={onChange}
              placeholder="Email address"
              className="w-full mt-6 px-4 py-2 text-md color-grey-700 shadow-md bg-white border-gray-300 rounded transition ease-in-out"
            />
            {emailError && (
              <p className="text-red-500 text-sm mb-2">{emailError}</p>
            )}
            <div className="relative mt-6">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={onChange}
                placeholder="Password"
                className="w-full px-4 py-2 text-md  shadow-md color-grey-700 bg-white border-gray-300 rounded transition ease-in-out"
              />

              {showPassword ? (
                <AiFillEyeInvisible
                  className="absolute right-3 top-3 text-xl cursor-pointer"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              ) : (
                <AiFillEye
                  className="absolute right-3 top-3 text-xl cursor-pointer"
                  onClick={() => setShowPassword((prevState) => !prevState)}
                />
              )}
            </div>
            {passwordError && (
              <p className="text-red-500 text-sm mb-2">{passwordError}</p>
            )}
            <div className="flex  justify-between whitespace-nowrap text-sm sm:text-md">
              <p className="mb-6 mt-3 ">
                Have an account?
                <Link
                  to="/sign-in"
                  className="text-black hover:text-red-700 transition duration-200 ease-in-out font-semibold"
                >
                  {" "}
                  Sign in
                </Link>
              </p>
            </div>
            <button
              className="w-full uppercase bg-custom-red rounded text-white px-7 py-3"
              type="submit"
            >
              Submit
            </button>
            <div className="flex items-center my-4 before:border-t before:flex-1 before:border-gray-300 after:border-t after:flex-1 after:border-gray-300">
              <p
                className="text-center
        font-semibold mx-4"
              >
                OR
              </p>
            </div>
            <OAuth />
          </form>
        </div>
      </div>
    </section>
  );
}
