import Link from "next/link";

export default function Home() {
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
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          maxWidth: "700px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "42px",
            marginBottom: "12px",
            color: "#0f172a",
          }}
        >
          Fare Enough 🚗
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "#475569",
            marginBottom: "30px",
          }}
        >
          Because every Fare should be Fair!
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <Link href="/login">
            <button
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Login
            </button>
          </Link>

          <Link href="/signup">
            <button
              style={{
                background: "#0f172a",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Signup
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
``