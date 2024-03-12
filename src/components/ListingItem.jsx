import { Link } from "react-router-dom";
import { MdDelete, MdEdit } from "react-icons/md";
import { useState } from "react";
import { GrPrevious } from "react-icons/gr";
import { GrNext } from "react-icons/gr";
import Moment from "react-moment";

export default function ListingItem({ listing, id, onEdit, onDelete }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

const handlePrevClick = (e) => {
  setCurrentImageIndex((prevIndex) =>
    prevIndex === 0 ? listing.imgUrls.length - 1 : prevIndex - 1
  );
};

const handleNextClick = (e) => {
  setCurrentImageIndex((prevIndex) =>
    prevIndex === listing.imgUrls.length - 1 ? 0 : prevIndex + 1
  );
};


  return (
    <li className="flex flex-col relative justify-between items-center overflow-hidden rounded-md shadow-md bg-white m-2 md:m-1 text-black transition-all duration-300">
      <Link className="contents" to={`/listingdetails/${id}`}>
        <img
          className="relative h-[170px] w-full object-cover  transition-scale duration-200 ease-in"
          loading="lazy"
          src={listing.imgUrls[currentImageIndex]}
          alt=""
        />
      </Link>
      <div
        className="absolute w-1/5 h-3/5 opacity-100 md:opacity-0 hover:opacity-100 left-0 top-0 transition-all duration-150"
        onClick={handlePrevClick}
      >
        <GrPrevious className="absolute text-4xl top-1/2 transform -translate-y-1/2 text-white" />
      </div>
      <div
        className="absolute w-1/5 h-3/5 opacity-100 md:opacity-0 hover:opacity-100 right-0 top-0 transition-all duration-150"
        onClick={handleNextClick}
      >
        <GrNext className="absolute text-4xl top-1/2 transform -translate-y-1/2 right-0 text-white" />
      </div>{" "}
      <Link className="contents" to={`/listingdetails/${id}`}>
        <Moment
          className="absolute top-2 left-2 items-center justify-center bg-black bg-opacity-50 text-white rounded-md px-1 py-1 shadow-lg uppercase text-xs "
          fromNow
        >
          {listing.timestamp?.toDate()}
        </Moment>{" "}
        <div className="w-full p-[10px]">
          <div className="flex items-center">
            <div
              className={`w-3 h-3 ${
                listing.type === "rent" ? "bg-yellow-500" : "bg-green-600"
              } rounded-full mr-2`}
            ></div>
            <p className="flex text-black text-sm opacity-80 capitalize text-center font-light">
              {listing.listingType === "apartment"
                ? "Apt"
                : listing.listingType}{" "}
              For {listing.listingType === "rent" ? "Rent" : "Sale"}
            </p>
          </div>

          <p className="text-[#1d1d1d] font-semibold text-lg mt-1">
            {listing.offer
              ? `${listing.regularPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} DH`
              : `${listing.regularPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} DH`}
            {listing.type === "rent" && " / month"}
          </p>

          <div className="flex items-center font-semibold space-x-1">
            <div className="flex items-center space-x-1">
              <p className=" text-xs">
                {listing.bedrooms > 1 ? `${listing.bedrooms} Bds` : "1 Bed"}
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <p className=" text-xs">
                {listing.bathrooms > 1
                  ? `| ${listing.bathrooms} Bths`
                  : "| 1 Bath"}
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <p className=" text-xs">
                {listing.size > 1 ? `| ${listing.size} m²` : "| 1 m²"}
              </p>
            </div>
          </div>
          <div className="flex items-center  space-x-1">
            <p className="font-light opacity-80 text-sm mb-[2px] capitalize text-black truncate max-w-[200px] md:max-w-[300px]">
              {listing.address}
            </p>
          </div>
        </div>
      </Link>
      {onDelete && (
        <MdDelete
          className="absolute bottom-2 right-2 h-[25px] text-xl cursor-pointer text-red-600"
          onClick={() => onDelete(listing.id)}
        />
      )}
      {onEdit && (
        <MdEdit
          className="absolute bottom-2 right-7 h-[25px] text-xl cursor-pointer text-black"
          onClick={() => onEdit(listing.id)}
        />
      )}
    </li>
  );
}
