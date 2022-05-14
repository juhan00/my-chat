import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Router from "next/router";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase-config";

function Home() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  //로그인
  const userLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const data = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );
      // console.log(data);
      Router.push("/chat");
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <React.Fragment>
      <Head>
        <title>로그인</title>
      </Head>
      <div>
        <form onSubmit={userLogin}>
          <input
            placeholder="e-mail"
            onChange={(e) => {
              setLoginEmail(e.target.value);
            }}
          />
          <input
            type="password"
            placeholder="password"
            onChange={(e) => {
              setLoginPassword(e.target.value);
            }}
          />
          <button type="submit">로그인</button>
        </form>

        <Link href="/login">
          <a>로그인</a>
        </Link>
        <Link href="/join">
          <a>회원가입</a>
        </Link>
        <Link href="/home">
          <a>홈</a>
        </Link>

        <div>User Logged In:</div>
        {/* <div>{user?.email}</div> */}
      </div>
    </React.Fragment>
  );
}

export default Home;
