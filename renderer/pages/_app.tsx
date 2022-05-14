import React, { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { auth } from "../firebase-config";
import { UserContext } from "../context/UserContext";
import { stringify } from "querystring";

function MyApp({ Component, pageProps }: AppProps) {
  const [authState, setAuthState] = useState({});
  const [userState, setUserState] = useState({});

  useEffect(() => {
    const subscribe = auth.onAuthStateChanged((data) => {
      setAuthState(data);
    });
    return subscribe;
  }, []);

  return (
    <React.Fragment>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <UserContext.Provider value={{ authState, userState, setUserState }}>
        <Component {...pageProps} />
      </UserContext.Provider>
    </React.Fragment>
  );
}

export default MyApp;
