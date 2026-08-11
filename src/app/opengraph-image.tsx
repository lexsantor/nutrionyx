import { ImageResponse } from "next/og";

export const alt = "Nutrionyx, la ficha única del paciente para nutricionistas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0b0f14",
          color: "#f5f8fa",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              backgroundColor: "#9db4c6",
              color: "#0b0f14",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "34px",
              fontWeight: 700,
            }}
          >
            N
          </div>
          <div style={{ fontSize: "40px", fontWeight: 600 }}>Nutrionyx</div>
        </div>
        <div
          style={{
            fontSize: "62px",
            fontWeight: 600,
            lineHeight: 1.15,
            maxWidth: "900px",
            letterSpacing: "-1px",
          }}
        >
          La ficha única del paciente para nutricionistas
        </div>
        <div
          style={{
            marginTop: "28px",
            fontSize: "28px",
            color: "#9db4c6",
            maxWidth: "820px",
          }}
        >
          Evaluación, dieta, entreno, medicación, mensajes y citas en un solo
          lugar. RGPD por diseño.
        </div>
      </div>
    ),
    size,
  );
}
