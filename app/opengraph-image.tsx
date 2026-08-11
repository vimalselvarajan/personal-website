import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const dynamic = "force-static";

export const alt = `${siteConfig.name} portfolio social preview`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "radial-gradient(circle at 85% 10%, #bcd5ff 0, #f7f8fa 40%)", color: "#1b2029", padding: "72px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "18px", fontSize: 28, fontWeight: 700 }}><div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 54, height: 54, borderRadius: 27, background: "#1b2029", color: "#fff", fontSize: 14 }}>{siteConfig.initials}</div>{siteConfig.name}</div>
      <div style={{ display: "flex", flexDirection: "column" }}><div style={{ fontSize: 22, color: "#2867c7", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>{siteConfig.role}</div><div style={{ marginTop: 22, maxWidth: 960, fontSize: 76, lineHeight: 0.98, letterSpacing: "-0.055em", fontWeight: 700 }}>{siteConfig.headline}</div></div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#687182" }}><span>Projects · Research</span><span>{siteConfig.links.site.replace("https://", "")}</span></div>
    </div>,
    size,
  );
}
