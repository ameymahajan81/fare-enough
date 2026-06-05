"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

type Ride = {
  id: string;
  customerId: string;
  pickup: string;
  drop: string;
  vehicleType: string;
  fare: number;
  status: string;
};

export default function CustomerPage() {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [vehicleType, setVehicleType] = useState("Mini");
  const [fare, setFare] = useState(0);
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const calculateFare = () => {
    let baseFare = 0;

    if (vehicleType === "Mini") {
      baseFare = 200;
    } else if (vehicleType === "Sedan") {
      baseFare = 300;
    } else if (vehicleType === "SUV") {
      baseFare = 400;
    }

    setFare(baseFare);
  };

  const handleBookRide = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const user = auth.currentUser;

      if (!user) {
        alert("User not logged in");
        return;
      }

      await addDoc(collection(db, "rides"), {
        customerId: user.uid,
        pickup,
        drop,
        vehicleType,
        fare,
        status: "requested",
        createdAt: serverTimestamp(),
      });

      alert("Ride booked successfully!");

      setPickup("");
      setDrop("");
      setVehicleType("Mini");
      setFare(0);
    } catch (error: any) {
      alert(error.message);
    }
  };

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (!user) {
        setRides([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "rides"),
        where("customerId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const rideList: Ride[] = snapshot.docs.map((docItem) => ({
            id: docItem.id,
            ...(docItem.data() as Omit<Ride, "id">),
          }));

          setRides(rideList);
          setLoading(false);
        },
        (error) => {
          console.error("Customer rides query error:", error);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "16px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: "32px", color: "#1e293b" }}>
                Fare Enough - Customer Dashboard
              </h1>
              <p style={{ marginTop: "8px", color: "#475569" }}>
                Because every Fare should be Fair!
              </p>
            </div>

            <button
              onClick={handleLogout}
              style={{
                background: "#ef4444",
                color: "white",
                border: "none",
                padding: "10px 18px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Logout
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
        >
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
              Enter trip details and confirm your booking.
            </p>

            <form
              onSubmit={handleBookRide}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <input
                type="text"
                placeholder="Enter pickup location"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                }}
              />

              <input
                type="text"
                placeholder="Enter drop location"
                value={drop}
                onChange={(e) => setDrop(e.target.value)}
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
                type="submit"
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
            </form>
          </div>

          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
            }}
          >
            <h2 style={{ marginTop: 0, color: "#1e293b" }}>My Rides</h2>
            <p style={{ color: "#64748b", marginBottom: "20px" }}>
              Track your booked rides in real time.
            </p>

            {loading ? (
              <p>Loading rides...</p>
            ) : rides.length === 0 ? (
              <p>No rides booked yet.</p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {rides.map((ride) => (
                  <div
                    key={ride.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      padding: "14px",
                      background: "#f8fafc",
                    }}
                  >
                    <p><strong>Pickup:</strong> {ride.pickup}</p>
                    <p><strong>Drop:</strong> {ride.drop}</p>
                    <p><strong>Vehicle:</strong> {ride.vehicleType}</p>
                    <p><strong>Fare:</strong> ₹{ride.fare}</p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "999px",
                          background:
                            ride.status === "requested"
                              ? "#fef3c7"
                              : ride.status === "accepted"
                              ? "#dbeafe"
                              : "#dcfce7",
                          color:
                            ride.status === "requested"
                              ? "#92400e"
                              : ride.status === "accepted"
                              ? "#1d4ed8"
                              : "#166534",
                          fontWeight: "bold",
                        }}
                      >
                        {ride.status}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}