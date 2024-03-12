import { React, useState, useRef, useEffect } from "react";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { getAuth } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import AgentGuard from "../components/AgentGuard";
import { GrFormNext } from "react-icons/gr";
import { GrFormPrevious } from "react-icons/gr";
import ReactMapGL, { Marker, NavigationControl } from "react-map-gl";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import { IoIosArrowBack } from "react-icons/io";


registerPlugin(FilePondPluginImagePreview);



const CreateListingPopUp = ({ closePopUp }) => {
  console.log("CreateListingPopUp Rendered");
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState([]);
  const auth = getAuth();
    const [finalStep, setFinalStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "rent",
    yearBuilt: 2018,
    size: 0,
    listingType: "villa",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    city: "",
    address: "",
    description: "",
    latitude: 0,
    longitude: 0,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    status: "pending",
  });

  const {
    type,
    yearBuilt,
    size,
    listingType,
    address,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    description,
    regularPrice,
    discountedPrice,
  } = formData;

   const [viewport, setViewport] = useState({
     width: "100%",
     height: "100%",
     latitude: 31.7917, // Latitude for the center of Morocco
     longitude: -7.0926, // Longitude for the center of Morocco
     zoom: 6,
   });

const handleMapClick = (event) => {
  const { lng, lat } = event.lngLat;
  setFormData((prevFormData) => ({
    ...prevFormData,
    latitude: lat,
    longitude: lng,
  }));
      console.log("Latitude:", lat, "Longitude:", lng);
};

  function onChange(e) {
    let boolean = null;
    if (e.target.value === "true") {
      boolean = true;
    }
    if (e.target.value === "false") {
      boolean = false;
    }

    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }

    // Handle 'bedrooms' input
    if (e.target.id === "bedrooms") {
      const bedroomsValue = isNaN(e.target.value)
        ? 0
        : parseInt(e.target.value);
      setFormData((prevState) => ({
        ...prevState,
        bedrooms: bedroomsValue,
      }));
    }

    // Handle 'bathrooms' input
    if (e.target.id === "bathrooms") {
      const bathroomsValue = isNaN(e.target.value)
        ? 0
        : parseInt(e.target.value);
      setFormData((prevState) => ({
        ...prevState,
        bathrooms: bathroomsValue,
      }));
    }

    if (e.target.id === "size") {
      const sizeValue = isNaN(e.target.value) ? 0 : parseFloat(e.target.value);
      setFormData((prevState) => ({
        ...prevState,
        size: sizeValue,
      }));
      return;
    }

    // Handle 'yearBuilt' selection from a dropdown
    if (e.target.id === "yearBuilt") {
      setFormData((prevState) => ({
        ...prevState,
        yearBuilt: parseInt(e.target.value),
      }));
    }

    // Handle 'regularPrice' input
    if (e.target.id === "regularPrice") {
      setFormData((prevState) => ({
        ...prevState,
        regularPrice: parseFloat(e.target.value), // Convert to number
      }));
    }

    // Handle 'listingType' selection from a dropdown
    if (e.target.id === "listingType") {
      setFormData((prevState) => ({
        ...prevState,
        listingType: e.target.value,
      }));
    }
  }
  async function onSubmit(e) {
    e.preventDefault();
    // Add validation for each form field
    const requiredFields = [
      "address",
      "type",
      "listingType",
      "yearBuilt",
      "size",
      "bedrooms",
      "bathrooms",
      "description",
      "images",
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(
          `Please fill in the ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`
        );
        return;
      }
    }
    setLoading(true);


    if (images.length > 10) {
      setLoading(false);
      toast.error("maximum 10 images are allowed");
      return;
    }

    async function storeImage(image) {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const filename = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
        const storageRef = ref(storage, filename);
        const uploadTask = uploadBytesResumable(storageRef, image);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
            }
          },
          (error) => {
            // Handle unsuccessful uploads
            reject(error);
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    }

    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch((error) => {
      setLoading(false);
      toast.error("Images not uploaded");
      return;
    });

    const formDataCopy = {
      ...formData,
      imgUrls,
      timestamp: serverTimestamp(),
      lastEdited: null,
      userRef: auth.currentUser.uid,
      status: "pending",
    };

    delete formDataCopy.images;
    !formDataCopy.offer && delete formDataCopy.discountedPrice;
    const docRef = await addDoc(collection(db, "listings"), formDataCopy);
    setLoading(false);
    toast.success("Listing submitted");
    closePopUp();
  }

  if (loading) {
    return <Spinner />;
  }

  const stepTitles = [
    "Location",
    "Listing",
    "Pricing",
    "Description",
    "Images",
  ];

 


 const renderStepIndicator = () => {
   return (
     <div className="flex items-center justify-between mb-8 mt-4">
       {stepTitles.map((title, index) => (
         <div
           key={index}
           className={`flex-1 h-2 ${
             index + 1 < currentStep ||
             (finalStep && index + 1 === stepTitles.length)
               ? "bg-custom-red" // Highlight the steps before the current step and the final step
               : "bg-gray-300"
           }`}
         ></div>
       ))}
     </div>
   );
 };

 const nextStep = () => {
   setCurrentStep(currentStep + 1);
 };

 const prevStep = () => {
   setCurrentStep(currentStep - 1);
 };

 const renderConfirmationStep = () => {
   return (
     <div>
       <h1 className="text-2xl md:text-3xl  mb-12">Listing Submitted!</h1>
       <p className="text-gray-500 mb-2">
         We have received your listing, and our team will review it. Approval
         may take a few hours.
       </p>
       {/* Add any additional content or styling for the confirmation step */}
     </div>
   );
 };

 const renderStepContent = () => {
   if (finalStep) {
     return renderConfirmationStep();
   }
   switch (currentStep) {
     case 1:
       return renderStep1();
     case 2:
       return renderStep2();
     case 3:
       return renderStep3();
     case 4:
       return renderStep4();
     case 5:
       return renderStep5();
     default:
       return null;
   }
 };

 const renderStep1 = () => {
   return (
     <div>
       <h1 className="text-2xl md:text-3xl mb-12">
         Where is your place located ?
       </h1>
       <p className=" text-gray-500 mb-2">
         Type the exact address of your home.
       </p>
       <input
         type="address"
         id="address"
         value={address}
         onChange={onChange}
         placeholder=""
         className="w-full mb-6 px-4 py-2 text-md color-grey-700 shadow-md bg-white border-2 border-gray-300 rounded transition ease-in-out"
       />
       <p className=" text-gray-500 mb-2">
         Click and drop the pin on the map to select the location.
       </p>
       <div className="h-[400px] bg-gray-200">
         <ReactMapGL
           {...viewport}
           mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
           mapStyle="mapbox://styles/mohamedmakdad/clsqz4sct00xn01pf8o9vg38g"
           onMove={(evt) => setViewport(evt.viewport)}
           onClick={handleMapClick}
         >
           {formData.latitude !== 0 && formData.longitude !== 0 && (
             <Marker
               latitude={formData.latitude}
               longitude={formData.longitude}
               offsetTop={-20}
               offsetLeft={-10}
               anchor="bottom" // Set the anchor point to the bottom
             >
               <img
                 src="/MyPin.svg"
                 alt="Pin"
                 style={{ width: "40px", height: "40px" }}
               />
             </Marker>
           )}
           <div style={{ position: "absolute", right: 10, top: 10 }}>
             <NavigationControl />
           </div>
         </ReactMapGL>{" "}
       </div>

       <button
         className="mb-6 px-3 py-2 mt-6 w-full bg-white border-2 border-black text-black rounded-md shadow-md hover:opacity-70 hover:bg-black hover:text-white focus:bg-black focus:shadow-lg active:bg-black active:shadow-lg transition duration-150 ease-in-out"
         onClick={nextStep}
       >
         Confirm
       </button>
     </div>
   );
 };

 const renderStep2 = () => {
   const isLand = listingType === "land";
   const isOffice = listingType === "office" || listingType === "commercial";
   const isPlace =
     listingType === "apartment" ||
     listingType === "villa" ||
     listingType === "riad" ||
     listingType === "farmhouse";
   return (
     <div>
       <h1 className="flex gap-2 text-2xl md:text-3xl  mb-12">
         <IoIosArrowBack
           className="my-1 cursor-pointer hover:opacity-70"
           onClick={prevStep}
         />
         Info about your listing.
       </h1>
       <p className="text-gray-500 mb-2 ">Do you want to sell or rent ?</p>
       <div className="flex">
         <button
           type="button"
           id="type"
           value="sale"
           onClick={onChange}
           className={`mr-3 px-7 py-3 font-medium text-sm uppercase  rounded transition duration-150 ease-in-out w-full ${
             type === "rent"
               ? "bg-white text-black border-2 border-gray-200"
               : "bg-custom-black text-white"
           }`}
         >
           sell
         </button>
         <button
           type="button"
           id="type"
           value="rent"
           onClick={onChange}
           className={`mr-3 px-7 py-3 font-medium text-sm uppercase  rounded transition duration-150 ease-in-out w-full ${
             type === "sale"
               ? "bg-white text-black border-2 border-gray-200"
               : "bg-custom-black text-white"
           }`}
         >
           rent
         </button>
       </div>
       <p className="mt-8 text-gray-500 mb-2 ">What's your listing type ?</p>
       <select
         id="listingType"
         value={listingType}
         onChange={onChange}
         className="w-full  px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-black text-center"
       >
         <option value="villa">Villa</option>
         <option value="apartment">Apartment</option>
         <option value="riad">Riad</option>
         <option value="farmhouse">Farmhouse</option>
         <option value="commercial">Commercial</option>
         <option value="office">Office</option>
         <option value="land">Land</option>
       </select>
       {isLand && (
         <div className="flex-1">
           <p className="mt-8 text-gray-500 mb-2 ">Size</p>
           <div className="flex w-full justify-center items-center space-x-6">
             <div className="relative w-full">
               <input
                 type="number"
                 id="size"
                 value={size}
                 onChange={onChange}
                 min="0"
                 required
                 className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-black text-center"
               />
               <div className="absolute right-4 sm:right-10 top-1/2 transform -translate-y-1/2 text-md whitespace-nowrap">
                 m²
               </div>
             </div>
           </div>
         </div>
       )}

       {isOffice && (
         <div className="">
           <div className="">
             <p className="mt-8 text-gray-500 mb-2 ">Size</p>
             <div className="flex w-full justify-center items-center space-x-6">
               <div className="relative w-full">
                 <input
                   type="number"
                   id="size"
                   value={size}
                   onChange={onChange}
                   min="0"
                   required
                   className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-black text-center"
                 />
                 <div className="absolute right-4 sm:right-10 top-1/2 transform -translate-y-1/2 text-md whitespace-nowrap">
                   m²
                 </div>
               </div>
             </div>
           </div>
           <div className="">
             <p className="mt-8 text-gray-500 mb-3 ">
               Does your place have a parking spot ?
             </p>
             <div className="flex ">
               <button
                 type="button"
                 id="parking"
                 value={true}
                 onClick={onChange}
                 className={`mr-3 px-7 py-3 font-medium rounded text-sm uppercase  transition duration-150 ease-in-out w-full ${
                   !parking
                     ? "bg-white text-black border-2 border-gray-200"
                     : "bg-custom-black text-white"
                 }`}
               >
                 Yes
               </button>
               <button
                 type="button"
                 id="parking"
                 value={false}
                 onClick={onChange}
                 className={`ml-3 px-7 py-3 font-medium rounded text-sm uppercase  transition duration-150 ease-in-out w-full ${
                   parking
                     ? "bg-white text-black border-2 border-gray-200"
                     : "bg-custom-black text-white"
                 }`}
               >
                 No
               </button>
             </div>
           </div>
         </div>
       )}
       {isPlace && (
         <div>
           <div className="flex space-x-6 mb-6">
             <div className="flex-1">
               <p className="mt-8 text-gray-500 mb-2 ">Year built </p>
               <select
                 id="yearBuilt"
                 value={yearBuilt}
                 onChange={onChange}
                 className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-black text-center"
               >
                 {/* Populate options for yearBuilt */}
                 {Array.from({ length: 126 }, (_, index) => (
                   <option key={index} value={2025 - index}>
                     {2025 - index}
                   </option>
                 ))}
               </select>
             </div>
             <div className="flex-1">
               <p className="mt-8 text-gray-500 mb-2 ">Size</p>
               <div className="flex w-full justify-center items-center space-x-6">
                 <div className="relative w-full">
                   <input
                     type="number"
                     id="size"
                     value={size}
                     onChange={onChange}
                     min="0"
                     required
                     className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-black text-center"
                   />
                   <div className="absolute right-4 sm:right-10 top-1/2 transform -translate-y-1/2 text-md whitespace-nowrap">
                     m²
                   </div>
                 </div>
               </div>
             </div>
           </div>

           <div className="flex space-x-6 mb-6">
             <div>
               <p className="text-gray-500 mb-2  ">Beds</p>
               <input
                 type="number"
                 id="bedrooms"
                 value={bedrooms}
                 onChange={onChange}
                 min="1"
                 max="50"
                 required
                 className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-black text-center"
               />
             </div>
             <div>
               <p className="text-gray-500 mb-2  ">Baths</p>
               <input
                 type="number"
                 id="bathrooms"
                 value={bathrooms}
                 onChange={onChange}
                 min="1"
                 max="50"
                 required
                 className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-black text-center"
               />
             </div>
           </div>
           <p className="mt-8 text-gray-500 mb-3 ">
             Does your Home have a parking spot ?
           </p>
           <div className="flex">
             <button
               type="button"
               id="parking"
               value={true}
               onClick={onChange}
               className={`mr-3 px-7 py-3 font-medium rounded text-sm uppercase  transition duration-150 ease-in-out w-full ${
                 !parking
                   ? "bg-white text-black border-2 border-gray-200"
                   : "bg-custom-black text-white"
               }`}
             >
               Yes
             </button>
             <button
               type="button"
               id="parking"
               value={false}
               onClick={onChange}
               className={`ml-3 px-7 py-3 font-medium rounded text-sm uppercase  transition duration-150 ease-in-out w-full ${
                 parking
                   ? "bg-white text-black border-2 border-gray-200"
                   : "bg-custom-black text-white"
               }`}
             >
               no
             </button>
           </div>
           <p className="mt-8 text-gray-500 mb-2  ">Is it furnished ?</p>
           <div className="flex">
             <button
               type="button"
               id="furnished"
               value={true}
               onClick={onChange}
               className={`mr-3 px-7 py-3 rounded font-medium text-sm uppercase  transition duration-150 ease-in-out w-full ${
                 !furnished
                   ? "bg-white text-black border-2 border-gray-200"
                   : "bg-custom-black text-white"
               }`}
             >
               yes
             </button>
             <button
               type="button"
               id="furnished"
               value={false}
               onClick={onChange}
               className={`ml-3 px-7 py-3 font-medium rounded text-sm uppercase  transition duration-150 ease-in-out w-full ${
                 furnished
                   ? "bg-white text-black border-2 border-gray-200"
                   : "bg-custom-black text-white"
               }`}
             >
               no
             </button>
           </div>
         </div>
       )}
       <div className="flex space-x-6 mt-12 justify-start mb-6">
         <button
           className="mb-6 px-3 py-2 w-full bg-white border-2 border-black text-black rounded-md shadow-md hover:opacity-70 hover:bg-black hover:text-white focus:bg-black focus:shadow-lg active:bg-black active:shadow-lg transition duration-150 ease-in-out"
           onClick={nextStep}
         >
           Confirm
         </button>
       </div>
     </div>
   );
 };

 const renderStep3 = () => {
   return (
     <div>
       <h1 className="flex gap-2 text-2xl md:text-3xl  mb-12">
         {" "}
         <IoIosArrowBack
           className="mt-1 cursor-pointer hover:opacity-70"
           onClick={prevStep}
         />{" "}
         Pricing details for your listing.
       </h1>
       <div className="flex items-center mb-6">
         <div className="">
           <p className="text-gray-500 mb-2 ">Set your desired price</p>
           <div className="flex w-full justify-center items-center space-x-6">
             <input
               type="number"
               id="regularPrice"
               value={regularPrice}
               onChange={onChange}
               min="50"
               max="400000000"
               required
               className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-black text-center"
             />
             {type === "rent" && (
               <div className="">
                 <p className="text-md w-full whitespace-nowrap">DH / Month</p>
               </div>
             )}
           </div>
         </div>
       </div>

       <div className="flex space-x-6 mt-12 justify-start mb-6">
         <button
           className="mb-6 px-3 py-2 w-full bg-white border-2 border-black text-black rounded-md shadow-md hover:opacity-70 hover:bg-black hover:text-white focus:bg-black focus:shadow-lg active:bg-black active:shadow-lg transition duration-150 ease-in-out"
           onClick={nextStep}
         >
           Confirm
         </button>
       </div>
     </div>
   );
 };
 const renderStep4 = () => {
   return (
     <div>
       <h1 className="flex gap-2 text-2xl md:text-3xl mb-12">
         {" "}
         <IoIosArrowBack
           className="mt-1 cursor-pointer hover:opacity-70"
           onClick={prevStep}
         />{" "}
         Describe your property details.
       </h1>
       <p className="text-gray-500 mb-2 ">Share details about your property</p>
       <textarea
         type="text"
         id="description"
         value={description}
         onChange={onChange}
         placeholder="..."
         required
         className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-black mb-6"
       />
       <div className="flex space-x-6 mt-12 justify-start mb-6">
         <button
           className="mb-6 px-3 py-2 w-full bg-white border-2 border-black text-black rounded-md shadow-md hover:opacity-70 hover:bg-black hover:text-white focus:bg-black focus:shadow-lg active:bg-black active:shadow-lg transition duration-150 ease-in-out"
           onClick={nextStep}
         >
           Confirm
         </button>
       </div>
     </div>
   );
 };
 const renderStep5 = () => {
   const handleFileChange = async (files) => {
     const validFiles = [];

     for (const file of files) {
       const image = new Image();
       image.src = URL.createObjectURL(file.file);

       await new Promise((resolve) => {
         image.onload = () => {
           const aspectRatio = image.width / image.height;
           const tolerance = 0.1; // Adjust the tolerance level as needed

           if (Math.abs(aspectRatio - 16 / 9) <= tolerance) {
             validFiles.push(file.file);
           }

           resolve();
         };
       });
     }

     if (validFiles.length < files.length) {
       toast.error("Images should have an aspect ratio close to 16:9.");
     }

     setImages(validFiles);
   };

   // Custom options for FilePond
   const filePondOptions = {
     allowMultiple: true,
     acceptedFileTypes: ["image/*"],
     maxFiles: 6,
     imagePreviewHeight: 100, // Set your desired height for each image preview
     imageCropAspectRatio: "16:9", // Crop images to a 16:9 aspect ratio
   };

   return (
     <div>
       <h1 className=" flex gap-2 text-2xl md:text-3xl  mb-4">
         {" "}
         <IoIosArrowBack
           className="mt-1 cursor-pointer hover:opacity-70"
           onClick={prevStep}
         />{" "}
         Upload images of your place.
       </h1>
       <div className="mb-6">
         <p className="text-gray-600">
           The first image will be the cover (max 6)
         </p>
         <FilePond
           files={images}
           onupdatefiles={handleFileChange}
           {...filePondOptions}
         />
       </div>
       <button
         type="submit"
         className="mb-6 w-full px-7 py-3 bg-custom-red text-white font-medium text-sm uppercase rounded shadow-md hover:opacity-70 hover:shadow-lg focus:bg-black focus:shadow-lg active:bg-black active:shadow-lg transition duration-150 ease-in-out"
       >
         Create Listing
       </button>
     </div>
   );
 };




  return (
      <main>
        <form
          onSubmit={onSubmit}
          className="max-w-md px-2 w-[28rem] mx-auto bg-white rounded-md  relative"
          onClick={(e) => e.stopPropagation()}
        >
          {renderStepIndicator()}
          {renderStepContent()}
        </form>
      </main>
  );
};
export default CreateListingPopUp;
