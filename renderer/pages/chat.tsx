import React, { useEffect, useState, useContext } from "react";
import Head from "next/head";
import Router from "next/router";
import Link from "next/link";
import { getDatabase, ref, push, set, onValue } from "firebase/database";
import { UserContext } from "../context/UserContext";
import AddChatList from "../components/AddChatList";

function Chat() {
  const [sendMessage, setSendMessage] = useState("");
  const [message, setMessage] = useState([]);
  const { userState } = useContext(UserContext);

  // message 받기
  useEffect(() => {
    const db = getDatabase();
    const dbRef = ref(db, `Messages/${Router.query.messageId}`);

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
    const messageListRef = ref(db, `Messages/${Router.query.messageId}`);
    const newPostRef = push(messageListRef);
    set(newPostRef, {
      message: sendMessage,
      timestamp: Date.now(),
      uid: userState.uid,
      nickname: userState.nickname,
    });
  };

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
      <AddChatList messageId={Router.query.messageId} />
      <button>사용자 추가</button>

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
