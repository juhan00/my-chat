import React, { useContext, useEffect, useState } from "react";
import Head from "next/head";
import Router from "next/router";
import Link from "next/link";
import { getDatabase, ref, get, onValue, remove } from "firebase/database";
import LogOut from "../components/LogOut";
import { UserContext } from "../context/UserContext";

function chatList() {
  const { authState, userState } = useContext(UserContext);
  const [chatListState, setChatListState] = useState([]);

  //로그인 체크
  useEffect(() => {
    !authState && Router.push("/login");
  }, [authState]);

  //chat list 받기
  useEffect(() => {
    const db = getDatabase();
    const dbRef = ref(db, `UserRooms/${userState.uid}`);

    onValue(dbRef, (snapshot) => {
      const userList = snapshot.val();

      if (userList !== null) {
        const arrKey = Object.keys(snapshot.val());
        const arrUserList = [];
        for (let i = 0; i < arrKey.length; i++) {
          arrUserList.push(userList[arrKey[i]]);
        }
        console.log(arrUserList, "arrUserList");
        setChatListState(arrUserList);
      }
    });
  }, []);

  const goToChatList = (messageId: string) => {
    console.log(messageId, "chatList");
    Router.push({
      pathname: "/chat",
      query: `messageId=${messageId}`,
    });
  };

  // const delChatList = async (messageId: string, userListUid: string[]) => {
  //   var answer = window.confirm("삭제하시겠습니까?");
  //   if (answer) {
  //     const db = getDatabase();
  //     const messagesRef = ref(db, `Messages/${messageId}`);
  //     const roomUsersRef = ref(db, `RoomUsers/${messageId}`);
  //     const getRoomUsers = await get(roomUsersRef);
  //     const roomUsersData = getRoomUsers.val();

  //     await remove(messagesRef);
  //     await remove(roomUsersRef);

  //     for (const item of roomUsersData) {
  //       const userRoomsRef = ref(db, `UserRooms/${item}/${messageId}`);
  //       await remove(userRoomsRef);
  //     }
  //   }
  // };

  return (
    <React.Fragment>
      <Head>
        <title>채팅 리스트</title>
      </Head>
      {authState && <LogOut />}
      <Link href="/login">
        <a>로그인</a>
      </Link>
      <Link href="/join">
        <a>회원가입</a>
      </Link>
      <Link href="/users">
        <a>홈</a>
      </Link>

      <ul>
        {chatListState?.map((item) => (
          <li key={item.messageId}>
            <div onClick={() => goToChatList(item.messageId)}>
              {item.userListNickname}
            </div>
            {/* <button
              onClick={() => delChatList(item.messageId, item.userListUid)}
            >
              삭제
            </button> */}
          </li>
        ))}
      </ul>
    </React.Fragment>
  );
}

export default chatList;
