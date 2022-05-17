import React, { useContext, useEffect, useState } from "react";
import styled from "@emotion/styled";
import Router from "next/router";
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
  isAddChatList: boolean;
  setIsAddChatList: (value: React.SetStateAction<boolean>) => void;
}

function AddChatList({
  messageId,
  isAddChatList,
  setIsAddChatList,
}: propsType) {
  const { userState } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [roomUsers, setRoomUsers] = useState([]);
  const [selectAddUser, setSelectAddUser] = useState([]);
  const [isAddButton, setIsAddButton] = useState(false);

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

  useEffect(() => {
    if (JSON.stringify(roomUsers) === JSON.stringify(selectAddUser)) {
      setIsAddButton(false);
    } else {
      setIsAddButton(true);
    }
  }, [roomUsers, selectAddUser]);

  //RoomUsers에서 대화방 참여자 리스트 받아오기
  const getRoomUsersList = async () => {
    const db = getDatabase();
    const roomUsersRef = ref(db, `RoomUsers/${messageId}`);
    const getRoomUsers = await get(roomUsersRef);
    const roomUsersData = getRoomUsers.val();

    //현재 대화방 참여자 저장
    setRoomUsers(roomUsersData);
    //추가 선택할 state에 현재 대화방 참여자 저장
    setSelectAddUser([...roomUsersData]);
  };

  //채팅방에 등록할 사용자 선택
  const handleSelectUser = (uid: string) => {
    const fillterSelectAddUser = selectAddUser.filter((item) => item === uid);

    if (fillterSelectAddUser.length === 0) {
      setSelectAddUser([...selectAddUser, uid]);
    } else {
      const delSelectAddUser = selectAddUser.filter((item) => item !== uid);
      setSelectAddUser([...delSelectAddUser]);
    }
  };

  //채팅방에 새로운 사용자 등록
  const addChatUser = async () => {
    // setSelectAddUser([...selectAddUser, uid]);
    const db = getDatabase();
    const roomUsersRef = ref(db, `RoomUsers`);
    const getRoomUsers = await get(roomUsersRef);
    const RoomUsersArrKey = Object.keys(getRoomUsers.val());
    const RoomUsers = getRoomUsers.val();
    const sortSelectAddUserUid = selectAddUser.sort((a: string, b: string) =>
      a > b ? 1 : -1
    );

    let isRoom: boolean = false;
    let roomMessageId: string = "";

    //동일한 멤버가 있는 채팅방이 있는지 확인
    for (let i = 0; i < RoomUsersArrKey.length; i++) {
      const roomSortUid = RoomUsers[RoomUsersArrKey[i]].sort(
        (a: string, b: string) => (a > b ? 1 : -1)
      );

      if (
        JSON.stringify(roomSortUid) === JSON.stringify(sortSelectAddUserUid)
      ) {
        isRoom = true;
        roomMessageId = RoomUsersArrKey[i];
      }
    }

    //selectAddUser에 있는 사용자들 닉네임 구하기
    let userNickname = [];
    for (const item of selectAddUser) {
      const userRef = ref(db, `Users/${item}`);
      const getUser = await get(userRef);

      userNickname.push(getUser.val().nickname);
    }

    if (!isRoom) {
      //기존 대화방이 없을 때
      const db = getDatabase();
      //message id 생성
      const newMessageListRef = push(ref(db, "Messages"));

      //selectAddUser에 있는 사용자들 UserRooms 대화상대 리스트에 정보저장
      selectAddUser.forEach(async (item) => {
        const userRoomsRef = ref(
          db,
          `UserRooms/${item}/${newMessageListRef.key}`
        );

        await set(userRoomsRef, {
          messageId: newMessageListRef.key,
          roomType: "multi",
          userListUid: selectAddUser,
          userListNickname: userNickname,
          timestamp: Date.now(),
        });
      });

      //RoomUsers에 대화상대 리스트 저장
      const roomUsersRef = ref(db, `RoomUsers/${newMessageListRef.key}`);
      await set(roomUsersRef, [...selectAddUser]);

      setIsAddChatList(!isAddChatList);
    } else {
      //기존 대화방이 있을 때
      const db = getDatabase();

      //selectAddUser에 있는 사용자들 UserRooms 대화상대 리스트에 정보저장

      for (const item of selectAddUser) {
        const userRoomsRef = ref(db, `UserRooms/${item}/${roomMessageId}`);

        await set(userRoomsRef, {
          messageId: roomMessageId,
          roomType: "multi",
          userListUid: selectAddUser,
          userListNickname: userNickname,
          timestamp: Date.now(),
        });

        //RoomUsers에 대화상대 리스트 저장
        const roomUsersRef = ref(db, `RoomUsers/${roomMessageId}`);
        await set(roomUsersRef, [...selectAddUser]);
      }

      setIsAddChatList(!isAddChatList);
    }
  };

  return (
    <AddChatListStyle>
      <button onClick={() => setIsAddChatList(!isAddChatList)}>취소</button>
      {isAddButton ? (
        <button onClick={addChatUser}>추가</button>
      ) : (
        <button disabled>추가</button>
      )}
      <ul>
        {users?.map((item) =>
          roomUsers?.filter((uid) => item.uid === uid).length === 1 ? (
            <li key={item.uid} className="dim">
              <p>{item.nickname}</p>
            </li>
          ) : (
            <li key={item.uid}>
              <p>
                {item.nickname}{" "}
                <input
                  type="checkbox"
                  onClick={() => handleSelectUser(item.uid)}
                />
              </p>
            </li>
          )
        )}
      </ul>
    </AddChatListStyle>
  );
}

export default AddChatList;
