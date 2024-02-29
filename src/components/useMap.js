import { useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";

const useMap = (onMarkerChange) => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    mapboxgl.accessToken = "YOUR_MAPBOX_ACCESS_TOKEN";
    const newMap = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-74.5, 40],
      zoom: 9,
    });
    setMap(newMap);

    newMap.on("click", (e) => {
      if (marker) {
        marker.setLngLat(e.lngLat);
      } else {
        const newMarker = new mapboxgl.Marker()
          .setLngLat(e.lngLat)
          .addTo(newMap);
        setMarker(newMarker);
      }

      onMarkerChange({
        latitude: e.lngLat.lat,
        longitude: e.lngLat.lng,
      });
    });

    return () => {
      newMap.remove();
    };
  }, [onMarkerChange]);

  return { map, marker };
};

export default useMap;
