import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "brand-bg": "#07130F",
        "brand-panel": "#10251D",
        "brand-pitch": "#12372A",
        "brand-lime": "#B9FF4D",
        "brand-cream": "#F4F0DA",
        "brand-gold": "#F7C948",
        pitch: "#12372A",
        line: "#F4F0DA",
        boot: "#F7C948",
        coral: "#EF6F6C",
        ink: "#17211B"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(18, 55, 42, 0.18)",
        brand: "0 20px 70px rgba(185, 255, 77, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;
