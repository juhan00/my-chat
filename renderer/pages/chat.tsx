import React, { useEffect, useState, useContext } from "react";
import Head from "next/head";
import Router from "next/router";
import Link from "next/link";
import {
  getDatabase,
  ref,
  push,
  get,
  set,
  update,
  onValue,
  remove,
} from "firebase/database";
import { UserContext } from "../context/UserContext";
import AddChatList from "../components/AddChatList";

function Chat() {
  const [sendMessage, setSendMessage] = useState("");
  const [message, setMessage] = useState([]);
  const [isAddChatList, setIsAddChatList] = useState(false);
  const { userState } = useContext(UserContext);
  const roomMessageId = Router.query.messageId;

  // message 받기
  useEffect(() => {
    const db = getDatabase();
    const dbRef = ref(db, `Messages/${roomMessageId}`);

    onValue(dbRef, (snapshot) => {
      const messages = snapshot.val();

      if (messages !== null) {
        const arrKey = Object.keys(snapshot.val());
        const arrMessage = [];
        for (let i = 0; i < arrKey.length; i++) {
          arrMessage.push({
            message: messages[arrKey[i]].message,
            nickname: messages[arrKey[i]].nickname,
            timestamp: messages[arrKey[i]].timestamp,
          });
        }
        setMessage(arrMessage);
      }
    });
  }, []);

  //message 보내기
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const db = getDatabase();
    const messageListRef = ref(db, `Messages/${roomMessageId}`);
    const newPostRef = push(messageListRef);
    set(newPostRef, {
      message: sendMessage,
      timestamp: Date.now(),
      uid: userState.uid,
      nickname: userState.nickname,
    });
  };

  async function delChatList(messageId: string | string[]) {
    const db = getDatabase();
    //RoomUsers에서 내 uid 삭제
    const roomUsersRef = ref(db, `RoomUsers/${roomMessageId}`);
    const getRoomUsers = await get(roomUsersRef);
    const roomUsersUid = getRoomUsers.val();

    //RoomUsers에서 내 uid 삭제
    const resetUsersUid = roomUsersUid.filter(
      (item: string) => item !== userState.uid
    );
    await set(roomUsersRef, { ...resetUsersUid });

    //UserRooms 내 uid에서 대화방 삭제
    const UserRoomsRef = ref(db, `UserRooms/${userState.uid}/${roomMessageId}`);
    await remove(UserRoomsRef);

    //selectAddUser에 있는 사용자들 닉네임 구하기
    let userNickname = [];
    for (const item of resetUsersUid) {
      const userRef = ref(db, `Users/${item}`);
      const getUser = await get(userRef);

      userNickname.push(getUser.val().nickname);
    }

    //현재 대화방 user의 UserRooms에서 삭제
    for (const item of resetUsersUid) {
      const UserRoomsRef = ref(db, `UserRooms/${item}/${roomMessageId}`);
      await update(UserRoomsRef, {
        userListNickname: userNickname,
        userListUid: resetUsersUid,
      });
    }
  }

  return (
    <React.Fragment>
      <Head>
        <title>채팅</title>
      </Head>
      <Link href="/login">
        <a>로그인</a>
      </Link>
      <Link href="/join">
        <a>회원가입</a>
      </Link>
      <Link href="/users">
        <a>홈</a>
      </Link>
      <button type="button" onClick={() => Router.back()}>
        뒤로가기
      </button>
      {isAddChatList && (
        <AddChatList
          messageId={roomMessageId}
          isAddChatList={isAddChatList}
          setIsAddChatList={setIsAddChatList}
        />
      )}
      <button onClick={() => setIsAddChatList(!isAddChatList)}>
        사용자 추가
      </button>
      <button onClick={() => delChatList(roomMessageId)}>대화방 나가기</button>

      {message?.map((item) => (
        <div
          key={item.timestamp}
        >{`메시지:${item.message}, 닉네임:${item.nickname}, 타임:${item.timestamp}`}</div>
      ))}

      <form onSubmit={handleSendMessage}>
        <input
          placeholder="내용을 입력하세요."
          value={sendMessage}
          onChange={(e) => setSendMessage(e.target.value)}
        />
        <button type="submit">전송</button>
      </form>
    </React.Fragment>
  );
}

export default Chat;
