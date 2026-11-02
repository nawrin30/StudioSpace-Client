import type { Config } from "tailwindcss";
import daisyui from "daisyui";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: { ink: "#17211d", moss: "#a7c957", paper: "#f5f4ef" },
      fontFamily: { sans: ["Arial", "sans-serif"] },
    },
  },
  plugins: [daisyui],
};

export default config;
