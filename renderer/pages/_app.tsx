import React, { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { auth } from "../firebase-config";
import { AuthContext } from "../context/authContext";

function MyApp({ Component, pageProps }: AppProps) {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const subscribe = auth.onAuthStateChanged((fbUser) => {
      setUserInfo(fbUser);
    });
    return subscribe;
  }, []);

  return (
    <React.Fragment>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AuthContext.Provider value={userInfo}>
        <Component {...pageProps} />
      </AuthContext.Provider>
    </React.Fragment>
  );
}

export default MyApp;
