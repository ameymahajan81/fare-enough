"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
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
  driverId?: string;
};

export default function DriverPage() {
  const [requestedRides, setRequestedRides] = useState<Ride[]>([]);
  const [acceptedRides, setAcceptedRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  useEffect(() => {
    let unsubscribeRequested: (() => void) | null = null;
    let unsubscribeAccepted: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeRequested) {
        unsubscribeRequested();
        unsubscribeRequested = null;
      }

      if (unsubscribeAccepted) {
        unsubscribeAccepted();
        unsubscribeAccepted = null;
      }

      if (!user) {
        setRequestedRides([]);
        setAcceptedRides([]);
        setLoading(false);
        return;
      }

      const requestedQuery = query(
        collection(db, "rides"),
        where("status", "==", "requested")
      );

      unsubscribeRequested = onSnapshot(
        requestedQuery,
        (snapshot) => {
          const rideList: Ride[] = snapshot.docs.map((docItem) => ({
            id: docItem.id,
            ...(docItem.data() as Omit<Ride, "id">),
          }));

          setRequestedRides(rideList);
          setLoading(false);
        },
        (error) => {
          console.error("Requested rides query error:", error);
          setLoading(false);
        }
      );

      const acceptedQuery = query(
        collection(db, "rides"),
        where("status", "==", "accepted"),
        where("driverId", "==", user.uid)
      );

      unsubscribeAccepted = onSnapshot(
        acceptedQuery,
        (snapshot) => {
          const rideList: Ride[] = snapshot.docs.map((docItem) => ({
            id: docItem.id,
            ...(docItem.data() as Omit<Ride, "id">),
          }));

          setAcceptedRides(rideList);
        },
        (error) => {
          console.error("Accepted rides query error:", error);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeRequested) unsubscribeRequested();
      if (unsubscribeAccepted) unsubscribeAccepted();
    };
  }, []);

  const handleAcceptRide = async (rideId: string) => {
    try {
      const user = auth.currentUser;

      if (!user) {
        alert("Driver not logged in");
        return;
      }

      await updateDoc(doc(db, "rides", rideId), {
        status: "accepted",
        driverId: user.uid,
        acceptedAt: serverTimestamp(),
      });

      alert("Ride accepted successfully!");
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleCompleteRide = async (rideId: string) => {
    try {
      await updateDoc(doc(db, "rides", rideId), {
        status: "completed",
        completedAt: serverTimestamp(),
      });

      alert("Ride completed successfully!");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
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
                Fare Enough - Driver Dashboard
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
            <h2 style={{ marginTop: 0, color: "#1e293b" }}>Requested Rides</h2>
            <p style={{ color: "#64748b", marginBottom: "20px" }}>
              New ride requests available for acceptance.
            </p>

            {loading ? (
              <p>Loading rides...</p>
            ) : requestedRides.length === 0 ? (
              <p>No requested rides available.</p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {requestedRides.map((ride) => (
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
                          background: "#fef3c7",
                          color: "#92400e",
                          fontWeight: "bold",
                        }}
                      >
                        {ride.status}
                      </span>
                    </p>

                    <button
                      onClick={() => handleAcceptRide(ride.id)}
                      style={{
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        padding: "10px 16px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        marginTop: "8px",
                      }}
                    >
                      Accept Ride
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "16px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
            }}
          >
            <h2 style={{ marginTop: 0, color: "#1e293b" }}>My Accepted Rides</h2>
            <p style={{ color: "#64748b", marginBottom: "20px" }}>
              Complete rides you have already accepted.
            </p>

            {acceptedRides.length === 0 ? (
              <p>No accepted rides yet.</p>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {acceptedRides.map((ride) => (
                  <div
                    key={ride.id}
                    style={{
                      border: "1px solid #bbf7d0",
                      borderRadius: "12px",
                      padding: "14px",
                      background: "#f0fdf4",
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
                          background: "#dbeafe",
                          color: "#1d4ed8",
                          fontWeight: "bold",
                        }}
                      >
                        {ride.status}
                      </span>
                    </p>

                    <button
                      onClick={() => handleCompleteRide(ride.id)}
                      style={{
                        background: "#16a34a",
                        color: "white",
                        border: "none",
                        padding: "10px 16px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        marginTop: "8px",
                      }}
                    >
                      Complete Ride
                    </button>
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
