import React, { useEffect, useState, useContext } from "react";
import { getDatabase, ref, push, set, onValue } from "firebase/database";
import { auth } from "../firebase-config";
import { UserContext } from "../context/UserContext";

function chat() {
  const [sendMessage, setSendMessage] = useState("");
  const [message, setMessage] = useState(null);
  const { userState } = useContext(UserContext);

  console.log(userState);
  //message 보내기
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const db = getDatabase();

    const messageListRef = ref(db, "Messages/-N1t8AVJvIhBkh85aCGO");
    const newPostRef = push(messageListRef);
    set(newPostRef, {
      message: sendMessage,
      timestamp: Date.now(),
      uid: auth.currentUser.uid,
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

  //message 받기
  useEffect(() => {
    const db = getDatabase();
    const dbRef = ref(db, "Messages/-N1t8AVJvIhBkh85aCGO");

    onValue(dbRef, (snapshot) => {
      const messages = snapshot.val();
      const arrKey = Object.keys(snapshot.val());
      const arrMessage = [];
      for (let i = 0; i < arrKey.length; i++) {
        arrMessage.push(messages[arrKey[i]].message);
      }
      setMessage(arrMessage);
      console.log(arrMessage);
    });
  }, []);

  return (
    <div>
      {/* {message.map(item => <div>{item.}</div>)} */}
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
