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
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { Icon } from "leaflet";
import "leaflet-providers/leaflet-providers";
import MyPin from "../assets/svg/MyPin.svg";





const customMarkerIcon = new L.Icon({
  iconUrl: MyPin, // Assuming it's in the root of the 'public' folder
  iconSize: [35, 58],
  iconAnchor: [17.5, 29],
  popupAnchor: [1, -34],
  // Optionally, customize other values based on your needs
});



const CreateListingPopUp = ({ closePopUp }) => {
  console.log("CreateListingPopUp Rendered");
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const auth = getAuth();
  const [mapCenter, setMapCenter] = useState([33.5731, -7.5898]); // Casablanca coordinates
  const [markerPosition, setMarkerPosition] = useState([33.5731, -7.5898]);
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
    offer: false,
    latitude: 0,
    longitude: 0,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
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
    offer,
    regularPrice,
    discountedPrice,
  } = formData;


  function onChange(e) {
    let boolean = null;
    if (e.target.value === "true") {
      boolean = true;
    }
    if (e.target.value === "false") {
      boolean = false;
    }
    if (e.target.files) {
      const selectedImages = Array.from(e.target.files);
      setImages(selectedImages);

      const previews = selectedImages.map((image) =>
        URL.createObjectURL(image)
      );
      setImagePreviews(previews);
    }
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }

    if (e.target.id === "size" && isNaN(e.target.value)) {
      return; // Ignore non-numeric input
    }

    // Handle 'yearBuilt' selection from a dropdown
    if (e.target.id === "yearBuilt") {
      setFormData((prevState) => ({
        ...prevState,
        yearBuilt: parseInt(e.target.value),
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
    if (+discountedPrice >= +regularPrice) {
      toast.error("Discounted price needs to be less than regular price");
      setLoading(false); // Set loading state to false here
      return;
    }

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
      userRef: auth.currentUser.uid,
      latitude: markerPosition[0],
      longitude: markerPosition[1],
    };

    delete formDataCopy.images;
    !formDataCopy.offer && delete formDataCopy.discountedPrice;
    const docRef = await addDoc(collection(db, "listings"), formDataCopy);
    setLoading(false);
    toast.success("Listing created");
    closePopUp();
     navigate(`/results/${docRef.id}`);
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

const renderImagePreviews = () => {
  const firstRowImages = imagePreviews.slice(0, 4);
  const secondRowImages = imagePreviews.slice(4, 8);

  const renderRow = (rowImages, rowKey) => (
    <div key={rowKey} className="flex space-x-2 mb-6">
      {rowImages.map((preview, index) => (
        <div key={index} className="relative">
          <img src={preview} alt={`Preview ${index}`} className="h-20 w-20" />
          <button
            type="button"
            onClick={() => handleImageRemove(index + rowKey * 4)}
            className="absolute top-0 right-1 text-sm text-white rounded-full cursor-pointer"
          >
            x
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {renderRow(firstRowImages, 0)}
      {renderRow(secondRowImages, 1)}
    </>
  );
};

const handleImageRemove = (index) => {
  const updatedImages = [...images];
  updatedImages.splice(index, 1);

  const updatedPreviews = updatedImages.map((image) =>
    URL.createObjectURL(image)
  );

  setImages(updatedImages);
  setImagePreviews(updatedPreviews);
};


const renderStepIndicator = () => {
  return (
    <div className="flex items-center justify-between mb-8 mt-4">
      {stepTitles.map((title, index) => (
        <div
          key={index}
          className={`flex-1 h-2 ${
            index + 1 < currentStep
              ? "bg-custom-red" // Highlight the steps before the current step
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

  const renderStepContent = () => {
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
  const handleDragEnd = (event) => {
    const { lat, lng } = event.target.getLatLng();
    setMarkerPosition([lat, lng]);
    setMapCenter([lat, lng]);
    mapRef.current.panTo([lat, lng], { animate: true, duration: 0.5 });
  };


  return (
    <div>
      <h1 className="text-3xl mb-12">Where is your place located ?</h1>
      <p className=" text-gray-500 mb-2">
        Type the exact address of your home.
      </p>
      <input
        type="address"
        id="address"
        value={address}
        onChange={onChange}
        placeholder="..."
        className="w-full mb-6 px-4 py-2 text-md color-grey-700 shadow-md bg-white border-2 border-gray-300 rounded transition ease-in-out"
      />
      <p className=" text-gray-500 mb-2">
        Drag the pin on the map to select your home location.
      </p>
      <MapContainer
        center={mapCenter}
        zoom={11}
        style={{ height: "400px", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png"
          minZoom={0}
          maxZoom={20}
          attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <Marker
          position={markerPosition}
          draggable={true}
          icon={customMarkerIcon}
          eventHandlers={{ dragend: handleDragEnd }}
        >
          <Popup>Drag me to your exact home location</Popup>
        </Marker>
      </MapContainer>

      <button
        className="mb-6 px-3 py-2 mt-6 w-full bg-white border-2 border-black text-black rounded-md shadow-md hover:opacity-70 hover:bg-black hover:text-white focus:bg-black focus:shadow-lg active:bg-black active:shadow-lg transition duration-150 ease-in-out"
        onClick={nextStep}
      >
        Next
        <GrFormNext className="inline" />
      </button>
    </div>
  );
};


  const renderStep2 = () => {
    return (
      <div>
        <h1 className="text-3xl mb-12">Info about your listing.</h1>
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
                : "bg-custom-red text-white"
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
                : "bg-custom-red text-white"
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
          <option value="commercial">Commercial</option>
          <option value="riad">Riad</option>
          <option value="land">Land</option>
          <option value="farmhouse">Farmhouse</option>
        </select>
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
                : "bg-custom-red text-white"
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
                : "bg-custom-red text-white"
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
                : "bg-custom-red text-white"
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
                : "bg-custom-red text-white"
            }`}
          >
            no
          </button>
        </div>
        <div className="flex space-x-6 mt-12 justify-start mb-6">
          <button
            className="mb-6 px-3 py-2 w-1/2 bg-gray-200 border-2 border-black text-black rounded-md shadow-md hover:opacity-70 hover:bg-black hover:text-white focus:bg-black focus:shadow-lg active:bg-black active:shadow-lg transition duration-150 ease-in-out"
            onClick={prevStep}
          >
            <GrFormPrevious className="inline" /> Previous
          </button>
          <button
            className="mb-6 px-3 py-2 w-1/2 bg-white border-2 border-black text-black rounded-md shadow-md hover:opacity-70 hover:bg-black hover:text-white focus:bg-black focus:shadow-lg active:bg-black active:shadow-lg transition duration-150 ease-in-out"
            onClick={nextStep}
          >
            Next
            <GrFormNext className="inline" />
          </button>
        </div>
      </div>
    );
  };
  const renderStep3 = () => {
    return (
      <div>
        <h1 className="text-3xl mb-12"> Pricing details for your listing.</h1>
        <p className="text-gray-500 mb-2  "> Is your listing on discount ?</p>
        <div className="flex mb-6">
          <button
            type="button"
            id="offer"
            value={true}
            onClick={onChange}
            className={`mr-3 px-7 py-3 font-medium rounded text-sm uppercase   transition duration-150 ease-in-out w-full ${
              !offer
                ? "bg-white text-black border-2 border-gray-200"
                : "bg-custom-red text-white"
            }`}
          >
            yes
          </button>
          <button
            type="button"
            id="offer"
            value={false}
            onClick={onChange}
            className={`ml-3 px-7 py-3 font-medium  text-sm uppercase rounded transition duration-150 ease-in-out w-full ${
              offer
                ? "bg-white text-black border-2 border-gray-200"
                : "bg-custom-red text-white"
            }`}
          >
            no
          </button>
        </div>
        <div className="flex items-center mb-6">
          <div className="">
            <p className="text-gray-500 mb-2 ">Original price</p>
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
        {offer && (
          <div className="flex items-center mb-6">
            <div className="">
              <p className="text-gray-500 mb-2 ">New Discounted Price</p>
              <div className="flex w-full justify-center items-center space-x-6">
                <input
                  type="number"
                  id="discountedPrice"
                  value={discountedPrice}
                  onChange={onChange}
                  min="50"
                  max="400000000"
                  required={offer}
                  className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-black text-center"
                />
                {type === "rent" && (
                  <div className="">
                    <p className="text-md w-full whitespace-nowrap">
                      DH / Month
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-6 mt-12 justify-start mb-6">
          <button
            className="mb-6 px-3 py-2 w-1/2 bg-gray-200 border-2 border-black text-black rounded-md shadow-md hover:opacity-70 hover:bg-black hover:text-white focus:bg-black focus:shadow-lg active:bg-black active:shadow-lg transition duration-150 ease-in-out"
            onClick={prevStep}
          >
            <GrFormPrevious className="inline" /> Previous
          </button>
          <button
            className="mb-6 px-3 py-2 w-1/2 bg-white border-2 border-black text-black rounded-md shadow-md hover:opacity-70 hover:bg-black hover:text-white focus:bg-black focus:shadow-lg active:bg-black active:shadow-lg transition duration-150 ease-in-out"
            onClick={nextStep}
          >
            Next
            <GrFormNext className="inline" />
          </button>
        </div>
      </div>
    );
  };
  const renderStep4 = () => {
    return (
      <div>
        <h1 className="text-3xl mb-12">Describe your property.</h1>
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
            className="mb-6 px-3 py-2 w-1/2 bg-gray-200 border-2 border-black text-black rounded-md shadow-md hover:opacity-70 hover:bg-black hover:text-white focus:bg-black focus:shadow-lg active:bg-black active:shadow-lg transition duration-150 ease-in-out"
            onClick={prevStep}
          >
            <GrFormPrevious className="inline" /> Previous
          </button>
          <button
            className="mb-6 px-3 py-2 w-1/2 bg-white border-2 border-black text-black rounded-md shadow-md hover:opacity-70 hover:bg-black hover:text-white focus:bg-black focus:shadow-lg active:bg-black active:shadow-lg transition duration-150 ease-in-out"
            onClick={nextStep}
          >
            Next
            <GrFormNext className="inline" />
          </button>
        </div>
      </div>
    );
  };
  const renderStep5 = () => {
    return (
      <div>
        <h1 className="text-3xl mb-12">Upload images of your place.</h1>
        {renderImagePreviews()}
        <div className="mb-6">
          <p className="text-lg ">Images</p>
          <p className="text-gray-600">
            The first image will be the cover (max 6)
          </p>
          <input
            type="file"
            id="images"
            onChange={onChange}
            accept=".jpg,.png,.jpeg"
            multiple
            className="w-full px-3 py-1.5 text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:border-black"
          />
        </div>
        <button
          type="submit"
          className="mb-6 w-full px-7 py-3 bg-custom-red text-white font-medium text-sm uppercase rounded shadow-md hover:opacity-70 hover:shadow-lg focus:bg-black focus:shadow-lg active:bg-black active:shadow-lg transition duration-150 ease-in-out"
        >
          Create Listing
        </button>
        <button
          className="mb-6 px-3 py-2 w-full bg-white border-2 border-black text-black rounded-md shadow-md hover:opacity-70 hover:bg-black hover:text-white focus:bg-black focus:shadow-lg active:bg-black active:shadow-lg transition duration-150 ease-in-out"
          onClick={prevStep}
        >
          <GrFormPrevious className="inline" /> Previous
        </button>
      </div>
    );
  };
  return (
    <AgentGuard>
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
    </AgentGuard>
  );
};
export default CreateListingPopUp;

