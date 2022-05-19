import React, { useContext, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
// import Link from 'next/link';
import { getDatabase, ref, onValue, get, set, push } from 'firebase/database';
// import LogOut from '../components/LogOut';
import { UserContext } from '../context/UserContext';
import Header from '../components/Header';
import Navi from '../components/Navi';
import styled from '@emotion/styled';

const UsersStyle = styled.div`
  margin-top: 110px;
  & > ul {
    & > li {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      height: 74px;
      .text-wrap {
        margin-left: 30px;
        .name {
          font-size: 20px;
          color: #000;
        }
        .email {
          margin-top: 5px;
          font-size: 15px;
          color: #999;
        }
      }
      button {
        position: absolute;
        top: 50%;
        right: 30px;
        transform: translateY(-50%);
        border: 1px solid #e2e2e2;
        border-radius: 2px;
        padding: 5px 10px;
        background-color: #fff;
        cursor: pointer;
      }
    }
  }
`;

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
        const sortMyRoomsUid = myRooms[arrMyRoomsKey[i]].userListUid.sort(
          (a: string, b: string) => (a > b ? 1 : -1)
        );
        const newRoomsUid = [userState.uid, listUserData.uid];
        const sortNewRoomsUid = newRoomsUid.sort((a: string, b: string) =>
          a > b ? 1 : -1
        );
        //해당 사용자와 대화방이 존재하는지 확인
        if (
          JSON.stringify(sortMyRoomsUid) === JSON.stringify(sortNewRoomsUid)
        ) {
          const messageListRef = myRooms[arrMyRoomsKey[i]].messageId;
          messageList = true;
          router.push({
            pathname: '/Chat',
            query: `messageId=${messageListRef}`,
          });
        }
      }
      if (!messageList) {
        createUserRoom(listUserData);
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
      userListUid: [userState.uid, listUserData.uid],
      userListNickname: [userState.nickname, listUserData.nickname],
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
      userListUid: [userState.uid, listUserData.uid],
      userListNickname: [userState.nickname, listUserData.nickname],
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
      {/* {authState && <LogOut />} */}
      <Header title="Users" type="main" />
      <UsersStyle>
        <ul>
          {users?.map((item) => (
            <li key={item.uid}>
              <div className="text-wrap">
                <div className="name">{item.nickname}</div>
                <div className="email">{item.email}</div>
              </div>
              <button onClick={() => goToChatList(item)}>대화하기</button>
            </li>
          ))}
        </ul>
      </UsersStyle>
      <Navi />
    </React.Fragment>
  );
}

export default Users;
