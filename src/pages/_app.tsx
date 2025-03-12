import "@/styles/globals.css";
// pages/_app.tsx

import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Navbar from "../components/Navbar";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Navbar />
      <Component {...pageProps} />
    </SessionProvider>
  );
}


