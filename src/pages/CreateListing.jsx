import { useState } from "react";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {getAuth} from "firebase/auth"
import {v4 as uuidv4} from "uuid";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import AgentGuard from '../components/AgentGuard';
import { GrFormNext } from "react-icons/gr";
import { GrFormPrevious } from "react-icons/gr";



export default function CreateListing() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const majorMoroccanCities = [
    "Casablanca",
    "Rabat",
    "Marrakech",
    "Fes",
    "Tangier",
    "Agadir",
    "Meknes",
    "Oujda",
    "Kenitra",
    "Tetouan",
    "Laayoune",
    "Nador",
    "Settat",
    "Mohammedia",
    "Khouribga",
    "El Jadida",
    "Benguerir",
    "Taza",
    "Khenifra",
    "Beni Mellal",
    "Errachidia",
    "Safi",
    "Dakhla",
    "Taroudant",
    "Larache",
    "Guelmim",
    "Ouarzazate",
    "Berkane",
    "Taourirt",
    "Sidi Slimane",
    "Lagouira",
    "Al Hoceima",
    "Tiznit",
    "Azemmour",
    "Tifelt",
    "Midelt",
    "Taounate",
    "Chefchaouen",
  ];
  const auth = getAuth()
  const [geolocationEnabled, setGeolocationEnabled] = useState(true);
  const [loading,setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "rent",
    name: "",
    yearBuilt: 2018,
    size: 0,
    homeType: "villa",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    city: "",
    address: "",
    description: "",
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    latitude: 0,
    longitude: 0,
    images: {},
  });
  const {
    type,
    name,
    yearBuilt,
    size,
    homeType,
    bedrooms,
    bathrooms,
    parking,
    address,
    furnished,
    description,
    offer,
    regularPrice,
    discountedPrice,
    latitude,
    longitude,
    images,

  } = formData;
  function onChange(e) {
    let boolean = null; 
    if(e.target.value === "true"){
        boolean = true
    }
    if(e.target.value === "false"){
        boolean = false
    }
    if(e.target.files){
        setFormData((prevState) =>({
            ...prevState,
            images : e.target.files,
        }))
    }
    if(!e.target.files){
        setFormData((prevState) =>({
          ...prevState,
          [e.target.id]: boolean ?? e.target.value,

        }))
    }
    if (e.target.id === "city") {
      setFormData((prevState) => ({
        ...prevState,
        city: e.target.value,
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

    // Handle 'homeType' selection from a dropdown
    if (e.target.id === "homeType") {
      setFormData((prevState) => ({
        ...prevState,
        homeType: e.target.value,
      }));
    }
  }
  async function onSubmit(e){
    e.preventDefault();
    setLoading(true);
    if(+discountedPrice >= +regularPrice){
      setLoading(false)
      toast.error("Discounted price needs to be less than regular price")
      return;
    }
    if(images.length > 6){
      setLoading(false)
      toast.error("maximum 6 images are allowed")
      return;
    }
    let geolocation = {}
    let location 
    if (geolocationEnabled){
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`);
      const data = await response.json()
      console.log(data);
      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;

      location = data.status === "ZERO_RESULTS" && undefined;
      
      if(location === undefined){
        setLoading(false)
        toast.error("Please enter a correct address");
        return;
      }
    }else{
      geolocation.lat = latitude;
      geolocation.lng = longitude;
    }

    async function storeImage(image) {
      return new Promise((resolve, reject)=>{
        const storage = getStorage();
        const filename = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
        const storageRef = ref(storage, filename);
        const uploadTask = uploadBytesResumable(storageRef, image);
        uploadTask.on('state_changed', 
  (snapshot) => {
    // Observe state change events such as progress, pause, and resume
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    switch (snapshot.state) {
      case 'paused':
        console.log('Upload is paused');
        break;
      case 'running':
        console.log('Upload is running');
        break;
    }
  }, 
  (error) => {
    // Handle unsuccessful uploads
    reject(error)
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
      [...images].map((image)=>storeImage(image))).catch((error)=>{
        setLoading(false)
        toast.error("Images not uploaded");
        return;
      }
     );

     const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
      userRef: auth.currentUser.uid,
      city: formData.city,
    };
    delete formDataCopy.images;
    !formDataCopy.offer && delete formDataCopy.discountedPrice;
    delete formDataCopy.latitude;
    delete formDataCopy.longitude;
    const docRef = await addDoc(collection(db, "listings"), formDataCopy);
    setLoading(false);
    toast.success("Listing created");
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);



  }

  if(loading){
    return <Spinner />
  }
  

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
      default:
        return null;
    }
  };

  const renderStep1 = () => {
    return (
      <div>
        <h1 className="text-3xl mb-12 font-bold">Step 1 - Create a Listing</h1>
        <p className="text-lg mt-6 font-semibold">Sell / Rent</p>
        <div className="flex">
          <button
            type="button"
            id="type"
            value="sale"
            onClick={onChange}
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              type === "rent"
                ? "bg-white text-black"
                : "bg-black text-white"
            }`}
          >
            sell
          </button>
          <button
            type="button"
            id="type"
            value="rent"
            onClick={onChange}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              type === "sale"
                ? "bg-white text-black"
                : "bg-black text-white"
            }`}
          >
            rent
          </button>
        </div>
         <p className="text-lg mt-6 font-semibold">Home Type</p>
          <select
            id="homeType"
            value={homeType}
            onChange={onChange}
            className="w-full mb-6 px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-black text-center"
          >
            <option value="villa">Villa</option>
            <option value="apartment">Apartment</option>
            <option value="land">Land</option>
            <option value="other">Other</option>
          </select>
        <div className="flex space-x-6 mb-6">
  <div className="flex-1">
    <p className="text-lg font-semibold">Year Built</p>
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
    <p className="text-lg font-semibold">Size</p>
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
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-md whitespace-nowrap">
          m²
        </div>
      </div>
    </div>
  </div>
</div>
          
        <div className="flex space-x-6 mb-6">
          <div>
            <p className="text-lg font-semibold">Beds</p>
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
            <p className="text-lg font-semibold">Baths</p>
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
        <p className="text-lg mt-6 font-semibold">Parking spot</p>
        <div className="flex">
          <button
            type="button"
            id="parking"
            value={true}
            onClick={onChange}
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              !parking ? "bg-white text-black" : "bg-black text-white"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            id="parking"
            value={false}
            onClick={onChange}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              parking ? "bg-white text-black" : "bg-black text-white"
            }`}
          >
            no
          </button>
        </div>
        <p className="text-lg mt-6 font-semibold">Furnished</p>
        <div className="flex">
          <button
            type="button"
            id="furnished"
            value={true}
            onClick={onChange}
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              !furnished ? "bg-white text-black" : "bg-black text-white"
            }`}
          >
            yes
          </button>
          <button
            type="button"
            id="furnished"
            value={false}
            onClick={onChange}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              furnished ? "bg-white text-black" : "bg-black text-white"
            }`}
          >
            no
          </button>
        </div>
        <button className="mb-6 px-3 py-2 mt-8 bg-white border-2 border-black text-black rounded-full shadow-md hover:opacity-70 hover:bg-black hover:text-white focus:bg-black focus:shadow-lg active:bg-black active:shadow-lg transition duration-150 ease-in-out"  onClick={nextStep}><GrFormNext className="inline text-lg" /></button>
      </div>
    );
  };

  const renderStep2 = () => {
    return (
      <div>
        <h1 className="text-3xl mb-12 font-bold">Step 2 - Address</h1>
        <p className="text-lg mt-6 font-semibold">City</p>
      <select
        id="city"
        value={formData.city}
        onChange={onChange}
        className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-black mb-6"
      >
        <option value="" disabled>Select a city</option>
        {majorMoroccanCities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
        <p className="text-lg mt-6 font-semibold">Address</p>
        <textarea
          type="text"
          id="address"
          value={address}
          onChange={onChange}
          placeholder="Address"
          required
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-black mb-6"
        />
        {!geolocationEnabled && (
          <div className="flex space-x-6 justify-start mb-6">
            <div className="">

              <p className="text-lg font-semibold">Latitude</p> 
              <input 
              type="number" 
              id="latitude" 
              value={latitude} 
              onChange={onChange} 
              required 
              min="-90"
              max="90"
              className="w-full mb-6 px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-black text-center"/>
            </div>
            <div>
              <p className="text-lg font-semibold">Longitude</p> 
              <input 
              type="number" 
              id="longitude" 
              value={longitude} 
              onChange={onChange} 
              required 
              min="-180"
              max="180"
              className="w-full mb-6 px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-black text-center"/>           
            </div>
          </div>
        )}
        <button className="mb-6 px-3 py-2 mt- bg-white border-2 border-black text-black rounded-full shadow-md hover:opacity-70 hover:bg-black hover:text-white focus:bg-black focus:shadow-lg active:bg-black active:shadow-lg transition duration-150 ease-in-out"  onClick={prevStep}><GrFormPrevious className="inline text-lg" /></button>
        <button className="mb-6 px-3 py-2 ml-2 mt- bg-white border-2 border-black text-black rounded-full shadow-md hover:opacity-70 hover:bg-black hover:text-white focus:bg-black focus:shadow-lg active:bg-black active:shadow-lg transition duration-150 ease-in-out"  onClick={nextStep}><GrFormNext className="inline text-lg" /></button>
      </div>
    );
  };

  const renderStep3 = () => {
    return (
      <div>
        <h1 className="text-3xl mb-12 font-bold">Step 3 - Princing</h1>
        <p className="text-lg font-semibold">Offer</p>
        <div className="flex mb-6">
          <button
            type="button"
            id="offer"
            value={true}
            onClick={onChange}
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              !offer ? "bg-white text-black" : "bg-black text-white"
            }`}
          >
            yes
          </button>
          <button
            type="button"
            id="offer"
            value={false}
            onClick={onChange}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              offer ? "bg-white text-black" : "bg-black text-white"
            }`}
          >
            no
          </button>
        </div>
        <div className="flex items-center mb-6">
          <div className="">
            <p className="text-lg font-semibold">Regular price</p>
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
              <p className="text-lg font-semibold">Discounted price</p>
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
        
        
        <button className="mb-6 px-3 py-2 mt- bg-white border-2 border-black text-black rounded-full shadow-md hover:opacity-70 hover:bg-black hover:text-white focus:bg-black focus:shadow-lg active:bg-black active:shadow-lg transition duration-150 ease-in-out"  onClick={prevStep}><GrFormPrevious className="inline text-lg" /></button>
        <button className="mb-6 px-3 py-2 ml-2 mt- bg-white border-2 border-black text-black rounded-full shadow-md hover:opacity-70 hover:bg-black hover:text-white focus:bg-black focus:shadow-lg active:bg-black active:shadow-lg transition duration-150 ease-in-out"  onClick={nextStep}><GrFormNext className="inline text-lg" /></button>
      </div>
    );
    
  };
  const renderStep4 = () => {
    return (
      <div>
        <h1 className="text-3xl mb-12 font-bold">Step 4 - Images / Description</h1>
         <p className="text-lg font-semibold">Description</p>
        <textarea
          type="text"
          id="description"
          value={description}
          onChange={onChange}
          placeholder="Description"
          required
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-black mb-6"
        />
        <div className="mb-6">
          <p className="text-lg font-semibold">Images</p>
          <p className="text-gray-600">
            The first image will be the cover (max 6)
          </p>
          <input
            type="file"
            id="images"
            onChange={onChange}
            accept=".jpg,.png,.jpeg"
            multiple
            required
            className="w-full px-3 py-1.5 text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:border-black"
          />
        </div>
        <button type="submit" className="mb-6 w-full px-7 py-3 bg-black text-white font-medium text-sm uppercase rounded shadow-md hover:opacity-70 hover:shadow-lg focus:bg-black focus:shadow-lg active:bg-black active:shadow-lg transition duration-150 ease-in-out">Create Listing</button>
        <button className="mb-6 px-3 py-2 mt- bg-white border-2 border-black text-black rounded-full shadow-md hover:opacity-70 hover:bg-black hover:text-white focus:bg-black focus:shadow-lg active:bg-black active:shadow-lg transition duration-150 ease-in-out"  onClick={prevStep}><GrFormPrevious className="inline text-lg" /></button>
      </div>
    );
  };

  return (
    <AgentGuard>
      
    <main>
    <div className="px-4 sm:px-2 py-2 grid grid-cols-1 md:grid-cols-2">
      <div className="hidden sm:grid w-full h-48 grid-cols-1 grid-rows-1 overflow-hidden bg-cover md:h-screen bg-blue-100 ">
      <div className='h-full  col-span-1 col-start-1 row-span-1 row-start-1"'>

      </div>
      </div>

      <div className="flex items-center py-12 bg-white md:my-0 md:h-screen md:shadow-md shadow-black/30">
      <form onSubmit={onSubmit} className='max-w-md px-4 w-[28rem] mx-auto'> 
      {renderStepContent()}
      </form>
      </div>
      </div>
    </main>
    </AgentGuard>
  );
}
