import Moment from "react-moment";
import { Link } from "react-router-dom";
import { FaLocationDot } from "react-icons/fa6";
import { MdDelete, MdEdit } from "react-icons/md";


export default function ListingItem({ listing, id, onEdit, onDelete}) {
    return <li className="relative border-[3px] border-black bg-white flex flex-col justify-between items-center shadow-lg hover:shadow-xl rounded-md overflow-hidden transition-scale-shadow ease-in-out md:hover:scale-105 duration-200 m-[10px]">
        <Link className="contents" to={`/category/${listing.type}/${id}`}>
            <img className="h-[300px] w-full object-cover  transition-scale duration-200 ease-in" loading="lazy" src={listing.imgUrls[0]} alt=""/>
            <Moment className="absolute top-2 left-2 bg-black text-white rounded-md px-2 py-1 shadow-lg uppercase text-xs font-semibold"fromNow >
                {listing.timestamp?.toDate()}
            </Moment>
            <div className="w-full p-[10px]">
                <div className="flex items-center space-x-1">
                <FaLocationDot className="h-4 w-4 text-black" />
                <p className="font-semibold text-sm mb-[2px] capitalize text-black truncate">{listing.address}</p>
                </div>
                <p className="font-semibold m-0 text-xl text-black capitalize truncate">{listing.name}</p>
                <p className="text-[#1d1d1d] mt-2 font-semibold">
            $
            {listing.offer
              ? listing.discountedPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              : listing.regularPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            {listing.type === "rent" && " / month"}
          </p>
          <div className="flex items-center mt-[10px] space-x-3">
            <div className="flex items-center space-x-1">
              <p className="font-bold text-xs">
                {listing.bedrooms > 1 ? `${listing.bedrooms} Beds` : "1 Bed"}
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <p className="font-bold text-xs">
                {listing.bathrooms > 1
                  ? `${listing.bathrooms} Baths`
                  : "1 Bath"}
              </p>
            </div>
          </div>
            </div>
        </Link>
        {onDelete && (
          <MdDelete className="absolute bottom-2 right-2 h-[25px] text-xl cursor-pointer text-black" onClick={()=>onDelete(listing.id)} />
        )}
        {onEdit && (
          <MdEdit className="absolute bottom-2 right-7 h-[25px] text-xl cursor-pointer text-black" onClick={()=>onEdit(listing.id)} />
        )}
    </li>;
  }
