import React, { useContext, useEffect, useState } from "react";
import styled from "@emotion/styled";
import Head from "next/head";
import Router from "next/router";
import Link from "next/link";
import { getDatabase, ref, onValue, get, set, push } from "firebase/database";
import { UserContext } from "../context/UserContext";

const AddChatListStyle = styled.div`
  & > ul {
    & > li {
      &.dim {
        opacity: 0.2;
      }
    }
  }
`;

interface propsType {
  messageId: string | string[];
}

function AddChatList({ messageId }: propsType) {
  const { userState } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [roomUsers, setRoomUsers] = useState([]);
  //users list 받기
  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, "Users");

    onValue(usersRef, (snapshot) => {
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

    getRoomUsersList();
  }, []);

  //RoomUsers에서 대화방 사용자 리스트 받아오기
  const getRoomUsersList = async () => {
    const db = getDatabase();
    const roomUsersRef = ref(db, `RoomUsers/${messageId}`);
    const getRoomUsers = await get(roomUsersRef);
    const roomUsersData = getRoomUsers.val();
    console.log(roomUsersData);
    setRoomUsers(roomUsersData);
  };

  //채팅방에 새로운 사용자 등록

  return (
    <AddChatListStyle>
      <ul>
        {users?.map((item) =>
          roomUsers.filter((uid) => item.uid === uid).length === 1 ? (
            <li className="dim">
              <p>{item.nickname}</p>
            </li>
          ) : (
            <li>
              <p>{item.nickname}</p>
            </li>
          )
        )}
      </ul>
    </AddChatListStyle>
  );
}

export default AddChatList;
