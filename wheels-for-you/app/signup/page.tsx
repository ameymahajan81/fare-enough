"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role,
        createdAt: serverTimestamp(),
      });

      alert("Signup successful and data saved!");
    } catch (error: any) {
      console.error("Signup/Firestore error:", error);
      alert(error.message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: "36px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          width: "100%",
          maxWidth: "450px",
        }}
      >
        <h1 style={{ marginBottom: "8px", color: "#0f172a" }}>Fare Enough Signup</h1>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>
          Because every Fare should be Fair!
        </p>

        <form
          onSubmit={handleSignup}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
            }}
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
            }}
          >
            <option value="customer">Customer</option>
            <option value="driver">Driver</option>
          </select>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
            }}
          />

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
            }}
          />

          <button
            type="submit"
            style={{
              background: "#0f172a",
              color: "white",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
``