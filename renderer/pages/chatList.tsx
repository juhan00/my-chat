import React, { useContext, useEffect, useState } from "react";
import Head from "next/head";
import Router from "next/router";
import Link from "next/link";
import { getDatabase, ref, onValue, get, set, push } from "firebase/database";
import LogOut from "../components/LogOut";
import { UserContext } from "../context/UserContext";

function chatList() {
  const { authState, userState } = useContext(UserContext);

  const [chatListState, setChatListState] = useState([]);

  console.log(chatListState);
  //로그인 체크
  useEffect(() => {
    // console.log(authState, "authState");
    !authState && Router.push("/login");
  }, [authState]);

  //chat list 받기
  useEffect(() => {
    const db = getDatabase();
    const dbRef = ref(db, `UserRooms/${userState.uid}`);

    onValue(dbRef, (snapshot) => {
      const userList = snapshot.val();
      const arrKey = Object.keys(snapshot.val());
      const arrUserList = [];
      for (let i = 0; i < arrKey.length; i++) {
        // userList[arrKey[i]].uid !== userState.uid &&
        arrUserList.push(userList[arrKey[i]]);
      }
      setChatListState(arrUserList);
    });
  }, []);

  const goToChatList = async (messageId: string) => {
    Router.push({
      pathname: "/chat",
      query: `messageId=${messageId}`,
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
        {chatListState?.map((item) => (
          <li onClick={() => goToChatList(item.messageId)} key={item.messageId}>
            <p>{item.userListNickname}</p>
          </li>
        ))}
      </ul>
    </React.Fragment>
  );
}

export default chatList;
