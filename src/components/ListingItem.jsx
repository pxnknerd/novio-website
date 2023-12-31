import Moment from "react-moment";
import { Link } from "react-router-dom";
import { MdDelete, MdEdit } from "react-icons/md";


export default function ListingItem({ listing, id, onEdit, onDelete}) {
    return <li className="flex flex-col relative justify-between items-center overflow-hidden m-[10px] rounded-2xl shadow-xl bg-white mt-8 mb-8 font-semibold  text-black transition-all duration-300">
        <Link className="contents" to={`/category/${listing.type}/${id}`}>
            <img className="h-[240px] w-full object-cover  transition-scale duration-200 ease-in" loading="lazy" src={listing.imgUrls[0]} alt=""/>
            <Moment className="absolute top-2 left-2 bg-black text-white rounded-md px-2 py-1 shadow-lg uppercase text-xs font-semibold"fromNow >
                {listing.timestamp?.toDate()}
            </Moment>
            <div className="w-full p-[10px]">
              <div className="flex items-center">  
                <div className={`w-3 h-3 ${listing.type === 'rent' ? 'bg-yellow-500' : 'bg-green-600'} rounded-full mr-2`}></div>             
                  <p className='flex text-black text-sm opacity-80 capitalize text-center font-light'>
                 For {listing.type === "rent" ? "Rent" : "Sale"}
                  </p>
                </div>

                <p className="text-[#1d1d1d]  font-bold text-lg mt-1">
              
  {listing.offer
    ? `${listing.discountedPrice
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} DH`
    : `${listing.regularPrice
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} DH`}
  {listing.type === "rent" && " / month"}
            </p>

          <div className="flex items-center mt-2 space-x-3">
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
                <div className="flex items-center mt-2 space-x-1">
                <p className="font-light opacity-80 text-sm mb-[2px] capitalize text-black truncate max-w-[200px] md:max-w-[300px]">{listing.address}</p>
                </div>
            </div>
        </Link>
        {onDelete && (
          <MdDelete className="absolute bottom-2 right-2 h-[25px] text-xl cursor-pointer text-red-600" onClick={()=>onDelete(listing.id)} />
        )}
        {onEdit && (
          <MdEdit className="absolute bottom-2 right-7 h-[25px] text-xl cursor-pointer text-black" onClick={()=>onEdit(listing.id)} />
        )}
    </li>;
  }
