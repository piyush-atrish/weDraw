import type { Config } from "tailwindcss";

const config: Omit<Config, "content"> = {
  theme: {
    extend: {
      // Add shared colors, fonts, and utilities here
    },
  },
  plugins: [],
};
export default config;