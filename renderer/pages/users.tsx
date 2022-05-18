import React, { useContext, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getDatabase, ref, onValue, get, set, push } from 'firebase/database';
import LogOut from '../components/LogOut';
import { UserContext } from '../context/UserContext';

function Users() {
  const router = useRouter();
  const { authState, userState } = useContext(UserContext);
  const [users, setUsers] = useState([]);

  //로그인 체크
  useEffect(() => {
    !authState && router.push('/Login');
  }, [authState, router]);

  //users list 받기
  useEffect(() => {
    const db = getDatabase();
    const dbRef = ref(db, 'Users');

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
  }, [userState.uid]);

  const goToChatList = async (listUserData: {
    uid: string;
    nickname: string;
    email: string;
  }) => {
    //내 채팅방 리스트 받아오기
    const db = getDatabase();
    const dbRef = ref(db, `UserRooms/${userState.uid}`);
    const getMyRooms = await get(dbRef);
    const myRooms = getMyRooms.val();

    let messageList = false;

    if (myRooms !== null) {
      const arrMyRoomsKey = Object.keys(getMyRooms.val());

      for (let i = 0; i < arrMyRoomsKey.length; i++) {
        //해당 사용자와 대화방이 존재하는지 확인
        if (myRooms[arrMyRoomsKey[i]].userListUid === listUserData.uid) {
          const messageListRef = myRooms[arrMyRoomsKey[i]].messageId;
          messageList = true;
          router.push({
            pathname: '/Chat',
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
  };

  // 새 대화방 리스트 생성
  const createUserRoom = async (listUserData: {
    uid: string;
    nickname: string;
    email: string;
  }) => {
    const db = getDatabase();
    //message id 생성
    const newMessageListRef = push(ref(db, 'Messages'));

    //UserRooms 내 리스트에 정보저장
    const myRoomsRef = ref(
      db,
      `UserRooms/${userState.uid}/${newMessageListRef.key}`
    );
    await set(myRoomsRef, {
      messageId: newMessageListRef.key,
      roomType: 'single',
      userListUid: listUserData.uid,
      userListNickname: listUserData.nickname,
      lastMessage: '',
      timestamp: Date.now(),
    });

    //UserRooms 대화상대 리스트에 정보저장
    const userRoomsRef = ref(
      db,
      `UserRooms/${listUserData.uid}/${newMessageListRef.key}`
    );

    await set(userRoomsRef, {
      messageId: newMessageListRef.key,
      roomType: 'single',
      userListUid: userState.uid,
      userListNickname: userState.nickname,
      lastMessage: '',
      timestamp: Date.now(),
    });

    //RoomUsers에 대화상대 리스트 저장
    const roomUsersRef = ref(db, `RoomUsers/${newMessageListRef.key}`);
    await set(roomUsersRef, [userState.uid, listUserData.uid]);

    router.push({
      pathname: '/Chat',
      query: `messageId=${newMessageListRef.key}`,
    });
  };

  return (
    <React.Fragment>
      <Head>
        <title>사용자 리스트</title>
      </Head>
      {authState && <LogOut />}
      <Link href="/ChatList">
        <a>채팅목록</a>
      </Link>
      <Link href="/Login">
        <a>로그인</a>
      </Link>
      <Link href="/Join">
        <a>회원가입</a>
      </Link>
      <Link href="/Users">
        <a>홈</a>
      </Link>
      <Link href="/DropOut">
        <a>탈퇴하기</a>
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

export default Users;
