"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google: any;
  }
}

type MapBookingCardProps = {
  vehicleType: string;
  setVehicleType: (value: string) => void;
  fare: number;
  calculateFare: () => void;
  handleBookRide: (
    pickup: string,
    drop: string,
    pickupCoords?: { lat: number; lng: number },
    dropCoords?: { lat: number; lng: number }
  ) => void;
};

export default function MapBookingCard({
  vehicleType,
  setVehicleType,
  fare,
  calculateFare,
  handleBookRide,
}: MapBookingCardProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const pickupInputRef = useRef<HTMLInputElement | null>(null);
  const dropInputRef = useRef<HTMLInputElement | null>(null);

  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [pickupCoords, setPickupCoords] = useState<
    { lat: number; lng: number } | undefined
  >();
  const [dropCoords, setDropCoords] = useState<
    { lat: number; lng: number } | undefined
  >();
  const [mapsReady, setMapsReady] = useState(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error("Google Maps API key missing");
      return;
    }

    const existingScript = document.getElementById("google-maps-script");

    if (existingScript) {
      if (window.google) initMap();
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => initMap();
    document.body.appendChild(script);

    function initMap() {
      if (
        !mapRef.current ||
        !pickupInputRef.current ||
        !dropInputRef.current ||
        !window.google
      ) {
        return;
      }

      const defaultCenter = { lat: 19.076, lng: 72.8777 }; // Mumbai
      const map = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 11,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      const pickupMarker = new window.google.maps.Marker({
        map,
        title: "Pickup",
      });

      const dropMarker = new window.google.maps.Marker({
        map,
        title: "Drop",
      });

      const pickupAutocomplete = new window.google.maps.places.Autocomplete(
        pickupInputRef.current,
        {
          fields: ["formatted_address", "geometry", "name"],
        }
      );

      const dropAutocomplete = new window.google.maps.places.Autocomplete(
        dropInputRef.current,
        {
          fields: ["formatted_address", "geometry", "name"],
        }
      );

      pickupAutocomplete.addListener("place_changed", () => {
        const place = pickupAutocomplete.getPlace();

        if (!place.geometry?.location) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        const address = place.formatted_address || place.name || "";
        setPickup(address);
        setPickupCoords({ lat, lng });

        pickupMarker.setPosition({ lat, lng });
        map.setCenter({ lat, lng });
        map.setZoom(14);
      });

      dropAutocomplete.addListener("place_changed", () => {
        const place = dropAutocomplete.getPlace();

        if (!place.geometry?.location) return;

        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        const address = place.formatted_address || place.name || "";
        setDrop(address);
        setDropCoords({ lat, lng });

        dropMarker.setPosition({ lat, lng });

        if (pickupCoords) {
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend({ lat: pickupCoords.lat, lng: pickupCoords.lng });
          bounds.extend({ lat, lng });
          map.fitBounds(bounds);
        } else {
          map.setCenter({ lat, lng });
          map.setZoom(14);
        }
      });

      setMapsReady(true);
    }
  }, [pickupCoords]);

  return (
    <div
      style={{
        background: "white",
        padding: "24px",
        borderRadius: "16px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
      }}
    >
      <h2 style={{ marginTop: 0, color: "#1e293b" }}>Book Your Ride</h2>
      <p style={{ color: "#64748b", marginBottom: "20px" }}>
        Search pickup and drop locations with maps support.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <input
          ref={pickupInputRef}
          type="text"
          placeholder="Enter pickup location"
          defaultValue={pickup}
          style={{
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
          }}
        />

        <input
          ref={dropInputRef}
          type="text"
          placeholder="Enter drop location"
          defaultValue={drop}
          style={{
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
          }}
        />

        <select
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #cbd5e1",
          }}
        >
          <option value="Mini">Mini</option>
          <option value="Sedan">Sedan</option>
          <option value="SUV">SUV</option>
        </select>

        <button
          type="button"
          onClick={calculateFare}
          style={{
            background: "#0f172a",
            color: "white",
            border: "none",
            padding: "12px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Calculate Fare
        </button>

        <div
          style={{
            background: "#f8fafc",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            fontWeight: "bold",
            color: "#0f172a",
          }}
        >
          Estimated Fare: ₹{fare}
        </div>

        <button
          type="button"
          onClick={() =>
            handleBookRide(pickup, drop, pickupCoords, dropCoords)
          }
          style={{
            background: "#22c55e",
            color: "white",
            border: "none",
            padding: "12px",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Book Ride
        </button>
      </div>

      <div
        ref={mapRef}
        style={{
          marginTop: "18px",
          width: "100%",
          height: "320px",
          borderRadius: "14px",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          background: mapsReady ? "transparent" : "#f1f5f9",
        }}
      />
    </div>
  );
}
