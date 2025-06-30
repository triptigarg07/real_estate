import Navbar from "@/components/Navbar";
import { NAVBAR_HEIGHT } from "@/lib/constants";

export default function Home() {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Navbar />
      <main
        style={{
          height: "100%",
          display: "flex",
          width: "100%",
          flexDirection: "column",
          paddingTop: `${NAVBAR_HEIGHT}px`,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              fontSize: "2.25rem",
              fontWeight: "bold",
              color: "#27272a",
            }}
          >
            Welcome to RENTIFUL
          </h1>
        </div>
      </main>
    </div>
  );
}
