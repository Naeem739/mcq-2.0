import localFont from "next/font/local";

export const timesNewRoman = localFont({
  src: [
    {
      path: "../../public/fonts/times-new-roman/times.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-en",
  display: "swap",
});

export const tiroBangla = localFont({
  src: [
    {
      path: "../../public/fonts/Tiro_Bangla/TiroBangla-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Tiro_Bangla/TiroBangla-Italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-bn",
  display: "swap",
});

