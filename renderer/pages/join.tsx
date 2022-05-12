import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Router from "next/router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase-config";

function Home() {
  const [joinEmail, setJoinEmail] = useState("");
  const [joinPassword, setJoinPassword] = useState("");

  const userJoin = async () => {
    try {
      const data = await createUserWithEmailAndPassword(
        auth,
        joinEmail,
        joinPassword
      );
      // console.log(data);
      Router.push("/home");
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <React.Fragment>
      <Head>
        <title>회원가입</title>
      </Head>
      <div>
        <input
          placeholder="e-mail"
          onChange={(e) => {
            setJoinEmail(e.target.value);
          }}
        />
        <input
          type="password"
          placeholder="password"
          onChange={(e) => {
            setJoinPassword(e.target.value);
          }}
        />
        <button onClick={userJoin}>회원가입</button>

        <Link href="/login">
          <a>로그인</a>
        </Link>
        <Link href="/join">
          <a>회원가입</a>
        </Link>
        <Link href="/home">
          <a>홈</a>
        </Link>
      </div>
    </React.Fragment>
  );
}

export default Home;
