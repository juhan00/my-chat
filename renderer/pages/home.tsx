import React, { useContext, useEffect } from "react";
import Head from "next/head";
import Router from "next/router";
import Link from "next/link";
// import { getDatabase, ref, push, set } from "firebase/database";
// import { auth } from "../firebase-config";
// import { BasicCard } from "../components/BasicCard";
// import { TitleCard } from "../components/TitleCard";
// import { HoverableCard } from "../components/HoverableCard";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { auth } from "../firebase-config";
import LogOut from "../components/LogOut";
import { UserContext } from "../context/UserContext";

function Home() {
  const userAuth = useContext(UserContext).authState;

  useEffect(() => {
    console.log(userAuth);
    !userAuth && Router.push("/login");
    // if (userAuth) {

    //   if (userName) {
    //     console.log("userName ok");
    //     const userEmail = auth.currentUser.email;
    //     const userUid = auth.currentUser.uid;
    //     const db = getDatabase();

    //     const messageListRef = ref(db, `Users/${userUid}`);
    //     // const newPostRef = push(messageListRef);
    //     set(messageListRef, {
    //       email: userEmail,
    //       name: userName,
    //       uid: auth.currentUser.uid,
    //     });

    //     console.log("Users 쓰기성공");
    //   }
    //   // console.log(userName);
    //   // console.log(userInfo["uid"]);
    // } else {
    //   Router.push("/login");
    // }
  }, [userAuth]);

  return (
    <React.Fragment>
      <Head>
        <title>Home - Nextron (with-typescript-emotion)</title>
      </Head>
      {userAuth && <LogOut />}
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
