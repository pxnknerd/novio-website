import { useLocation } from "react-router-dom";
import ListingItem from "../components/ListingItem";

const Results = () => {
  const location = useLocation();
  const searchResults = location.state?.searchResults || [];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchResults.map((listing) => (
          <ListingItem key={listing.id} listing={listing.data} id={listing.id} />
        ))}
      </ul>
    </div>
  );
};

export default Results;