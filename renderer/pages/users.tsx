import React, { useContext, useEffect, useState } from "react";
import Head from "next/head";
import Router from "next/router";
import Link from "next/link";
import { getDatabase, ref, onValue } from "firebase/database";
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
  const { authState } = useContext(UserContext);
  const [users, setUsers] = useState([]);

  console.log(users);
  //로그인 체크
  useEffect(() => {
    console.log(authState);
    !authState && Router.push("/login");
  }, [authState]);

  //chat list 받기
  useEffect(() => {
    const db = getDatabase();
    const dbRef = ref(db, "Users");

    onValue(dbRef, (snapshot) => {
      const users = snapshot.val();
      const arrKey = Object.keys(snapshot.val());
      const arrUsers = [];
      for (let i = 0; i < arrKey.length; i++) {
        arrUsers.push({
          uid: users[arrKey[i]].uid,
          email: users[arrKey[i]].email,
          nickname: users[arrKey[i]].nickname,
        });
      }
      setUsers(arrUsers);
    });
  }, []);

  const goToChatList = (uid: string) => {
    Router.push({
      pathname: "/chat",
      query: uid,
    });
  };

  return (
    <React.Fragment>
      <Head>
        <title>Home - Nextron (with-typescript-emotion)</title>
      </Head>
      {authState && <LogOut />}
      <Link href="/login">
        <a>로그인</a>
      </Link>
      <Link href="/join">
        <a>회원가입</a>
      </Link>
      <Link href="/home">
        <a>홈</a>
      </Link>

      <ul>
        {users?.map((item) => (
          <li onClick={() => goToChatList(item.uid)} key={item.uid}>
            <p>{item.nickname}</p>
            <p>{item.email}</p>
          </li>
        ))}
      </ul>
    </React.Fragment>
  );
}

export default Home;
