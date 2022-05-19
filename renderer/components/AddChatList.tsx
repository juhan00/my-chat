import React, { useContext, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import {
  getDatabase,
  ref,
  onValue,
  get,
  set,
  update,
  push,
} from 'firebase/database';
import { UserContext } from '../context/UserContext';

const AddChatListStyle = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #fff;
  z-index: 9999;
  padding: 30px 30px;
  box-sizing: border-box;
  & > ul {
    & > li {
      width: 100%;
      height: 40px;
      font-size: 20px;
      & > p {
        position: relative;
        padding-left: 30px;
        & > input {
          position: absolute;
          left: 0;
          top: 0;
        }
      }

      &.dim {
        opacity: 0.2;
      }
    }
  }
  & > .btn-wrap {
    border-top: 1px solid #e2e2e2;
    padding: 20px 0;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    & > button {
      border: 1px solid #e2e2e2;
      border-radius: 2px;
      padding: 5px 20px;
      font-size: 14px;
      color: #000;
      background-color: #fff;
      &:disabled {
        color: #555;
        opacity: 0.3;
      }
    }
    & > button + button {
      margin-left: 10px;
    }
  }
`;

interface PropsType {
  messageId: string | string[];
  isAddChatList: boolean;
  setIsAddChatList: (value: React.SetStateAction<boolean>) => void;
  setRoomMessageId: (value: React.SetStateAction<string>) => void;
}

function AddChatList({
  messageId,
  isAddChatList,
  setIsAddChatList,
  setRoomMessageId,
}: PropsType) {
  const { userState } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [roomUsers, setRoomUsers] = useState([]);
  const [selectAddUser, setSelectAddUser] = useState([]);
  const [isAddButton, setIsAddButton] = useState(false);

  //users list 받기
  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, 'Users');

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

    getRoomUsersList();
  }, [userState.uid, messageId]);

  useEffect(() => {
    if (JSON.stringify(roomUsers) === JSON.stringify(selectAddUser)) {
      setIsAddButton(false);
    } else {
      setIsAddButton(true);
    }
  }, [roomUsers, selectAddUser]);

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

    let isRoom = false;
    let roomMessageId = '';

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

    if (!isRoom) {
      // createChatRoom();
      addRoomChatUser();
      setIsAddChatList(!isAddChatList);
    } else {
      const dialog = confirm('기존 대화방이 존재합니다. 새로 만들겠습니까?');
      if (dialog) {
        createChatRoom();
        setIsAddChatList(!isAddChatList);
      } else {
        setRoomMessageId(roomMessageId);
        setIsAddChatList(!isAddChatList);
      }
    }
  };

  //기존 대화방에 user 추가
  const addRoomChatUser = async () => {
    const db = getDatabase();

    //selectAddUser에 있는 사용자들 닉네임 구하기
    const userNickname = [];
    for (const item of selectAddUser) {
      const userRef = ref(db, `Users/${item}`);
      const getUser = await get(userRef);

      userNickname.push(getUser.val().nickname);
    }

    //selectAddUser에 있는 사용자들 UserRooms 대화상대 리스트에 정보저장
    selectAddUser.forEach(async (item) => {
      const userRoomsRef = ref(db, `UserRooms/${item}/${messageId}`);

      await update(userRoomsRef, {
        lastMessage: '',
        messageId,
        roomType: 'multi',
        userListUid: selectAddUser,
        userListNickname: userNickname,
        timestamp: Date.now(),
      });
    });

    //RoomUsers에 대화상대 리스트 저장
    const roomUsersRef = ref(db, `RoomUsers/${messageId}`);
    await set(roomUsersRef, [...selectAddUser]);
  };

  //신규 대화방 생성
  const createChatRoom = async () => {
    const db = getDatabase();
    //message id 생성
    const newMessageListRef = push(ref(db, 'Messages'));

    //selectAddUser에 있는 사용자들 닉네임 구하기
    const userNickname = [];
    for (const item of selectAddUser) {
      const userRef = ref(db, `Users/${item}`);
      const getUser = await get(userRef);

      userNickname.push(getUser.val().nickname);
    }

    //selectAddUser에 있는 사용자들 UserRooms 대화상대 리스트에 정보저장
    selectAddUser.forEach(async (item) => {
      const userRoomsRef = ref(
        db,
        `UserRooms/${item}/${newMessageListRef.key}`
      );

      await set(userRoomsRef, {
        lastMessage: '',
        messageId: newMessageListRef.key,
        roomType: 'multi',
        userListUid: selectAddUser,
        userListNickname: userNickname,
        timestamp: Date.now(),
      });
    });

    //RoomUsers에 대화상대 리스트 저장
    const roomUsersRef = ref(db, `RoomUsers/${newMessageListRef.key}`);
    await set(roomUsersRef, [...selectAddUser]);

    setRoomMessageId(newMessageListRef.key);
  };

  return (
    <AddChatListStyle>
      <ul>
        {users?.map((item) =>
          roomUsers?.filter((uid) => item.uid === uid).length === 1 ? (
            <li key={item.uid} className="dim">
              <p>{item.nickname}</p>
            </li>
          ) : (
            <li key={item.uid}>
              <p>
                <input
                  type="checkbox"
                  onClick={() => handleSelectUser(item.uid)}
                />
                {item.nickname}
              </p>
            </li>
          )
        )}
      </ul>
      <div className="btn-wrap">
        <button onClick={() => setIsAddChatList(!isAddChatList)}>취소</button>
        {isAddButton ? (
          <button onClick={addChatUser}>추가</button>
        ) : (
          <button disabled>추가</button>
        )}
      </div>
    </AddChatListStyle>
  );
}

export default AddChatList;
