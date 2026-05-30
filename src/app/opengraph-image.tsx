import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

export const alt = "MoveMyTest — Free Driving Test Swaps";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
            top: "-100px",
            left: "-100px",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
            bottom: "-200px",
            right: "-200px",
          }}
        />

        {/* Swap arrows icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "30px",
          }}
        >
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <path
              d="M20 30 L20 10 L0 30 L20 50 L20 30 L50 30 L50 50 L70 30 L50 10 L50 30 Z"
              fill="#0ea5e9"
              opacity="0.9"
            />
            <path
              d="M60 50 L60 70 L80 50 L60 30 L60 50 L30 50 L30 30 L10 50 L30 70 L30 50 Z"
              fill="#38bdf8"
              opacity="0.7"
              transform="translate(0, 5) scale(0.8)"
            />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: "800",
            color: "white",
            letterSpacing: "-1px",
            marginBottom: "20px",
          }}
        >
          MoveMyTest
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "24px",
            color: "rgba(255,255,255,0.75)",
            marginBottom: "30px",
          }}
        >
          Free Driving Test Swaps · DVSA Compliant · Private & Secure
        </div>

        {/* Accent line */}
        <div
          style={{
            width: "200px",
            height: "3px",
            background: "#0ea5e9",
            borderRadius: "2px",
            marginBottom: "30px",
          }}
        />

        {/* URL */}
        <div
          style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          www.movemytest.co.uk
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
