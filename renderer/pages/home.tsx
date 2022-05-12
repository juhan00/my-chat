import React, { useContext, useEffect } from "react";
import Head from "next/head";
import Router from "next/router";
import Link from "next/link";
// import { BasicCard } from "../components/BasicCard";
// import { TitleCard } from "../components/TitleCard";
// import { HoverableCard } from "../components/HoverableCard";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { auth } from "../firebase-config";
import LogOut from "../components/LogOut";
import { AuthContext } from "../context/authContext";

function Home() {
  const userInfo = useContext(AuthContext);

  useEffect(() => {
    !userInfo && Router.push("/login");
  }, [userInfo]);

  return (
    <React.Fragment>
      <Head>
        <title>Home - Nextron (with-typescript-emotion)</title>
      </Head>
      {userInfo && <LogOut />}
      <Link href="/login">
        <a>로그인</a>
      </Link>
      <Link href="/join">
        <a>회원가입</a>
      </Link>
      <Link href="/home">
        <a>홈</a>
      </Link>
    </React.Fragment>
  );
}

export default Home;
