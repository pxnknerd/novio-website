import React, { useState } from 'react'
import { AiFillEyeInvisible, AiFillEye} from "react-icons/ai";
import { Link } from "react-router-dom";
import OAuth from "../components/OAuth";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import {db} from "../firebase";
import {doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  }); 
  const [emailError, setEmailError] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+212");
  const [passwordError, setPasswordError] = useState("");

  const { firstName, lastName, email, phoneNumber, password } = formData;

  const handleSignUpAsAgentClick = () => {
    // Navigate to the AgentSignUp page when clicked
    navigate("/agent-sign-up");
  };

const onPhoneNumberChange = (e) => {
  const enteredNumber = e.target.value;
  setFormData((prevState) => ({
    ...prevState,
    phoneNumber: enteredNumber,
  }));
};

 const onCountryCodeChange = (e) => {
   setSelectedCountryCode(e.target.value);
 };

  const navigate = useNavigate();
  
  function onChange(e) {
    setFormData((prevState)=>({
      ...prevState, 
      [e.target.id]: e.target.value,
    }))
  }


  async function onSubmit(e){
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    // Regular expression to extract domain from email
    const domainRegex = /@([a-zA-Z0-9.-]+)$/;
    const match = email.match(domainRegex);

    if (!match) {
      setEmailError("Invalid email address. Please enter a valid email.");
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
      // Set initial profile picture
      const initialProfilePicture = process.env.PUBLIC_URL + "/anonym.png";
; // You can customize this
      await updateProfile(auth.currentUser, {
        displayName: `${firstName} ${lastName}`,
        photoURL: initialProfilePicture,
      });
      const formDataCopy = { ...formData };
      delete formDataCopy.password;
      formDataCopy.timestamp = serverTimestamp();

      await updateProfile(auth.currentUser, {
        displayName: `${firstName} ${lastName}`,
      });

      // Send email verification
      await sendEmailVerification(user);

          const completePhoneNumber = `${selectedCountryCode}${phoneNumber}`;
          formDataCopy.phoneNumber = completePhoneNumber;

      // Save additional user data to Firestore
      await setDoc(doc(db, "users", user.uid), formDataCopy);
      navigate("/email-verification");
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
            <div className=" justify-start text-center md:text-left text-xl md:text-4xl md:py-8 text-black">
              Sign Up
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
            <div className="flex mt-6">
              <select
                value={selectedCountryCode}
                onChange={onCountryCodeChange}
                className="w-1/4 px-4 py-2 text-md color-grey-700 shadow-md bg-white border-gray-300 rounded transition ease-in-out"
              >
                <option value="+212">+212</option>
                <option value="+33">+33</option>
                <option value="+32">+32</option>
                <option value="+34">+34</option>
                <option value="+351">+351</option>
              </select>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={onPhoneNumberChange}
                className="w-3/4 ml-2 px-4 py-2 text-md color-grey-700 shadow-md bg-white border-gray-300 rounded transition ease-in-out"
              />
            </div>
            <div className="relative mt-6 ">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={onChange}
                placeholder="Password"
                className="w-full px-4  py-2 text-md  shadow-md color-grey-700 bg-white border-gray-300 rounded transition ease-in-out"
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
            <div className="flex justify-between whitespace-nowrap text-sm sm:text-md">
              <p className="mt-3 mb-6">
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
            <p
              className="text-center md:text-lg py-6 font-semibold mx-4 cursor-pointer hover:text-red-700"
              onClick={handleSignUpAsAgentClick}
            >
              Are you an agent ?
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
