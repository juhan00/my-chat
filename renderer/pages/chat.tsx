import React, { useEffect, useState, useContext } from "react";
import Router from "next/router";
import { getDatabase, ref, push, set, onValue } from "firebase/database";
import { auth } from "../firebase-config";
import { UserContext } from "../context/UserContext";

function chat() {
  const [sendMessage, setSendMessage] = useState("");
  const [message, setMessage] = useState([]);
  const { userState } = useContext(UserContext);

  console.log(Router.query);

  //message 받기
  useEffect(() => {
    const db = getDatabase();
    const dbRef = ref(db, `Messages/${Router.query.messageId}`);

    onValue(dbRef, (snapshot) => {
      const messages = snapshot.val();
      console.log(messages, "key");
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

      // console.log(arrMessage);
    });
  }, []);

  // console.log(userState, "chat");
  //message 보내기
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log(userState.uid);

    const db = getDatabase();
    const messageListRef = ref(db, `Messages/${Router.query.messageId}`);
    const newPostRef = push(messageListRef);
    set(newPostRef, {
      message: sendMessage,
      timestamp: Date.now(),
      uid: userState.uid,
      nickname: userState.nickname,
    });

    console.log("쓰기성공");

    // const postData = {
    //   message: sendMessage,
    //   timestamp: Date.now(),
    //   uid: auth.currentUser.uid,
    // };

    // try {
    //   const newPostKey = push(child(ref(db), "Messages")).key;

    //   const updates = {};
    //   updates[`/Messages/-N1t8AVJvIhBkh85aCGO/${newPostKey}`] = postData;

    //   update(ref(db), updates);

    //   console.log("쓰기성공");
    // } catch (error) {
    //   console.log(error);
    // }
  };

  return (
    <div>
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
    </div>
  );
}

export default chat;
