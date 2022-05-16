import React, { useContext, useEffect, useState } from "react";
import Head from "next/head";
import Router from "next/router";
import Link from "next/link";
import { getDatabase, ref, onValue, get, set, push } from "firebase/database";
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
  const { authState, userState } = useContext(UserContext);

  const [users, setUsers] = useState([]);

  // console.log(users);
  //로그인 체크
  useEffect(() => {
    // console.log(authState, "authState");
    !authState && Router.push("/login");
  }, [authState]);

  //users list 받기
  useEffect(() => {
    const db = getDatabase();
    const dbRef = ref(db, "Users");

    onValue(dbRef, (snapshot) => {
      const users = snapshot.val();
      const arrKey = Object.keys(snapshot.val());
      const arrUsers = [];
      for (let i = 0; i < arrKey.length; i++) {
        users[arrKey[i]].uid !== userState.uid &&
          arrUsers.push({
            uid: users[arrKey[i]].uid,
            email: users[arrKey[i]].email,
            nickname: users[arrKey[i]].nickname,
          });
      }
      setUsers(arrUsers);
    });
  }, []);

  const goToChatList = async (listUserData: {
    uid: string;
    nickname: string;
    email: string;
  }) => {
    //내 채팅방 리스트 받아오기
    const db = getDatabase();
    const dbRef = ref(db, `UserRooms/${userState.uid}`);

    const getMyRooms = await get(dbRef);

    // const UserRooms = getUserRooms.val();
    // console.log(UserRooms, "UserRooms");
    const myRooms = getMyRooms.val();

    // console.log(UserRooms, "UserRooms");
    let messageList: boolean = false;

    if (myRooms !== null) {
      const arrMyRoomsKey = Object.keys(getMyRooms.val());

      for (let i = 0; i < arrMyRoomsKey.length; i++) {
        console.log(arrMyRoomsKey.length);
        //해당 사용자와 대화방이 존재하는지 확인
        if (myRooms[arrMyRoomsKey[i]].userListUid === listUserData.uid) {
          const messageListRef = myRooms[arrMyRoomsKey[i]].messageId;
          messageList = true;
          Router.push({
            pathname: "/chat",
            query: `messageId=${messageListRef}`,
          });
        }

        if (i === arrMyRoomsKey.length - 1) {
          if (!messageList) {
            createUserRoom(listUserData);
          }
        }
      }
    } else {
      createUserRoom(listUserData);
    }

    // if (UserRooms !== null || !messageList) {
    //   //일치하는 user가 없을 때
    //   //message id 생성
    //   const newMessageListRef = push(ref(db, "Messages"));
    //   // const newPostRef = push(newMessageListRef);
    //   // await set(newPostRef, {});
    //   //userRoom에 정보저장
    //   const userRoomsRef = ref(db, `UserRooms/${userData.uid}`);
    //   // const newPostRef = push(userRoomsRef);
    //   await set(userRoomsRef, {
    //     userListUid: userData.uid,
    //     userListNickname: userData.nickname,
    //     messageId: newMessageListRef.key,
    //     timestamp: userData.email,
    //   });

    //   Router.push({
    //     pathname: "/chat",
    //     query: `messageId=${newMessageListRef.key}`,
    //   });
    // }
  };

  // 새 대화방 리스트 생성
  const createUserRoom = async (listUserData: {
    uid: string;
    nickname: string;
    email: string;
  }) => {
    const db = getDatabase();
    //message id 생성
    const newMessageListRef = push(ref(db, "Messages"));
    // const newPostRef = push(newMessageListRef);
    // await set(newPostRef, {});

    //userRoom 내 리스트에 정보저장
    const myRoomsRef = ref(
      db,
      `UserRooms/${userState.uid}/${newMessageListRef.key}`
    );
    // const newPostRef = push(userRoomsRef);
    await set(myRoomsRef, {
      messageId: newMessageListRef.key,
      roomType: "single",
      userListUid: listUserData.uid,
      userListNickname: listUserData.nickname,
      timestamp: Date.now(),
    });

    //userRoom 대화상대 리스트에 정보저장
    const userRoomsRef = ref(
      db,
      `UserRooms/${listUserData.uid}/${newMessageListRef.key}`
    );
    console.log(userState, "UserRooms");
    // const newPostRef = push(userRoomsRef);
    await set(userRoomsRef, {
      messageId: newMessageListRef.key,
      roomType: "single",
      userListUid: userState.uid,
      userListNickname: userState.nickname,
      timestamp: Date.now(),
    });

    Router.push({
      pathname: "/chat",
      query: `messageId=${newMessageListRef.key}`,
    });
  };

  return (
    <React.Fragment>
      <Head>
        <title>사용자 리스트</title>
      </Head>
      {authState && <LogOut />}
      <Link href="/chatList">
        <a>채팅목록</a>
      </Link>
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
          <li onClick={() => goToChatList(item)} key={item.uid}>
            <p>{item.nickname}</p>
            <p>{item.email}</p>
          </li>
        ))}
      </ul>
    </React.Fragment>
  );
}

export default Home;
