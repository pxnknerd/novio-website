import React from "react";
import { useNavigate } from "react-router-dom";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import MoroccanPlaces from "../components/MoroccanPlaces";

const LocationSearchAutocomplete = ({ setSelectedLocation }) => {
  const locations = MoroccanPlaces();
  const navigate = useNavigate();

  const handleLocationSelect = (newValue) => {
    setSelectedLocation(newValue);
    // Navigate to the results page with the selected location
    navigate("/results", { state: { selectedLocation: newValue } });
  };

  return (
    <Autocomplete
      options={locations}
      getOptionLabel={(option) => option.name}
      style={{ width: 300 }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Address"
          variant="outlined"
          inputProps={{
            ...params.inputProps,
            autoComplete: "new-password",
          }}
        />
      )}
      onChange={(event, newValue) => {
        handleLocationSelect(newValue);
      }}
      filterOptions={(options, { inputValue }) => {
        if (inputValue.trim() === "") {
          return [
            {
              name: "Type your address",
              latitude: 33.5731,
              longitude: -7.5898,
            },
          ];
        }

        const filteredOptions = options.filter((option) =>
          option.name.toLowerCase().includes(inputValue.toLowerCase())
        );
        return filteredOptions.slice(0, 6);
      }}
    />
  );
};

export default LocationSearchAutocomplete;
