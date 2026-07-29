import { ImageResponse } from "next/og";

/**
 * Apple touch icon — the mark alone on ink, generated as a PNG at build time.
 * Apple's touch-icon convention does not accept SVG, so this cannot be a static
 * .svg the way `icon.svg` is.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const mark = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 32 32" fill="none">
  <path d="M16 2.5C23.2 10 23.2 22 16 29.5C8.8 22 8.8 10 16 2.5Z" stroke="#F5F2EC" stroke-width="1.6" fill="#B07C2E" fill-opacity="0.18"/>
  <path d="M16 7.5V24.5" stroke="#F5F2EC" stroke-width="1.6"/>
  <path d="M16 14.5L21 11" stroke="#B07C2E" stroke-width="1.6"/>
  <path d="M16 19.5L11 16" stroke="#B07C2E" stroke-width="1.6"/>
</svg>`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F1D18",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          width={128}
          height={128}
          alt=""
          src={`data:image/svg+xml;base64,${Buffer.from(mark).toString("base64")}`}
        />
      </div>
    ),
    size,
  );
}
