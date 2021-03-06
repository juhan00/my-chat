import React, { useEffect, useState, useContext, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
// import Link from 'next/link';
import {
  getDatabase,
  ref,
  push,
  get,
  set,
  update,
  onValue,
  remove,
} from 'firebase/database';
import { UserContext } from '../context/UserContext';
import AddChatList from '../components/AddChatList';
import Header from '../components/Header';
import styled from '@emotion/styled';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import LogoutIcon from '@mui/icons-material/Logout';
import { getDate } from '../utils/getDate';

const ChatStyle = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 70px);
  padding: 110px 20px 100px;
  box-sizing: border-box;
  background-color: #f0f6fb;
  .header-btn-wrap {
    display: flex;
    align-items: center;
    position: fixed;
    top: 30px;
    right: 20px;
    z-index: 999;
    .btn-room-out {
      margin-left: 15px;
    }
  }

  ul {
    &.message-list {
      & > li {
        display: flex;
        width: 100%;
        .message-wrap {
          display: inline-block;
          .name {
            font-size: 14px;
          }

          .flex-wrap {
            margin-top: 5px;
            display: flex;
            .message {
              margin-top: 5px;
              padding: 8px 10px;
              font-size: 16px;
              border-radius: 10px;
              margin-top: auto;
              word-break: break-all;
              max-width: 180px;
            }
            .time {
              margin-top: 5px;
              font-size: 12px;
              color: #000;
              opacity: 0.4;
              margin-top: auto;
            }
          }

          &.me {
            margin-left: auto;
            text-align: right;
            .message {
              color: #fff;
              background-color: #58b9ff;
              order: 1;
            }
            .time {
              order: 0;
              margin-right: 5px;
            }
          }
          &.other {
            margin-right: auto;
            text-align: left;
            .message {
              background-color: #fff;
            }
            .time {
              margin-left: 5px;
            }
          }
        }
      }
      & > li + li {
        margin-top: 20px;
      }
    }
  }

  .bottom-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    left: 0;
    bottom: 0px;
    width: 100%;
    height: 70px;
    background-color: #fff;
    border-top: 1px solid #ebe9e9;

    input {
      width: calc(100vw - 110px);
      height: 30px;
      box-sizing: border-box;
      border: 1px solid #ebe9e9;
      background-color: #f4f4f4;
      text-indent: 10px;
    }
    button {
      background-color: #58b9ff;
      border: 0px;
      width: 50px;
      height: 30px;
      margin-left: 10px;
      color: #fff;
    }
  }
`;

function Chat() {
  const messageEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [sendMessage, setSendMessage] = useState('');
  const [message, setMessage] = useState([]);
  const [isAddChatList, setIsAddChatList] = useState(false);
  const { userState } = useContext(UserContext);
  const [roomMessageId, setRoomMessageId] = useState(router.query.messageId);
  const [usersNickname, setUsersNickname] = useState([]);

  //????????? ?????? ?????????
  useEffect(() => {
    messageEndRef.current.scrollIntoView({ block: 'end' });
  }, [message]);

  // message ??????
  useEffect(() => {
    setMessage([]);
    const db = getDatabase();
    const dbRef = ref(db, `Messages/${roomMessageId}`);

    onValue(dbRef, (snapshot) => {
      const messages = snapshot.val();

      if (messages !== null) {
        const arrKey = Object.keys(snapshot.val());
        const arrMessage = [];
        for (let i = 0; i < arrKey.length; i++) {
          arrMessage.push({
            uid: messages[arrKey[i]].uid,
            message: messages[arrKey[i]].message,
            nickname: messages[arrKey[i]].nickname,
            timestamp: messages[arrKey[i]].timestamp,
          });
        }
        setMessage(arrMessage);
      }
    });

    //????????? ????????? ????????????
    const getUsersNicname = async () => {
      const db = getDatabase();
      //RoomUsers?????? ????????? ????????????
      const UserRommMessageRef = ref(
        db,
        `UserRooms/${userState.uid}/${roomMessageId}`
      );
      const getUserRommMessage = await get(UserRommMessageRef);
      const userListNickname = getUserRommMessage.val().userListNickname;

      setUsersNickname(userListNickname);
    };

    if (!isAddChatList) {
      getUsersNicname();
    }
  }, [roomMessageId, userState.uid, isAddChatList]);

  //message ?????????
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const db = getDatabase();
    const messageListRef = ref(db, `Messages/${roomMessageId}`);
    const newPostRef = push(messageListRef);
    await set(newPostRef, {
      message: sendMessage,
      timestamp: Date.now(),
      uid: userState.uid,
      nickname: userState.nickname,
    });
    setSendMessage('');
    saveLastMessage();
  };

  // ????????? ????????? ??????
  const saveLastMessage = async () => {
    const db = getDatabase();
    //RoomUsers?????? ??? uid ??????
    const roomUsersRef = ref(db, `RoomUsers/${roomMessageId}`);
    const getRoomUsers = await get(roomUsersRef);
    const roomUsersUid = getRoomUsers.val();

    for (const item of roomUsersUid) {
      const userRoomsRef = ref(db, `UserRooms/${item}/${roomMessageId}`);

      await update(userRoomsRef, {
        lastMessage: sendMessage,
      });
    }
  };

  const delChatList = async () => {
    const dialog = confirm('???????????? ??????????????????????');
    if (dialog) {
      const db = getDatabase();
      //RoomUsers?????? ??? uid ??????
      const roomUsersRef = ref(db, `RoomUsers/${roomMessageId}`);
      const getRoomUsers = await get(roomUsersRef);
      const roomUsersUid = getRoomUsers.val();

      const resetUsersUid = roomUsersUid.filter(
        (item: string) => item !== userState.uid
      );
      await set(roomUsersRef, { ...resetUsersUid });

      //UserRooms ??? uid?????? ????????? ??????
      const UserRoomsRef = ref(
        db,
        `UserRooms/${userState.uid}/${roomMessageId}`
      );

      //?????? ????????? users ?????? ????????????
      const getUserRooms = await get(UserRoomsRef);
      const userRooms = getUserRooms.val();

      if (userRooms.userListUid.length > 2) {
        //????????? user??? 3??? ??????
        const resetUserNickname = userRooms.userListNickname.filter(
          (item: string) => item !== userState.nickname
        );

        //?????? ????????? user??? UserRooms?????? ????????? ??????
        for (const item of userRooms.userListUid) {
          const UserRoomsRef = ref(db, `UserRooms/${item}/${roomMessageId}`);
          await update(UserRoomsRef, {
            userListNickname: resetUserNickname,
            userListUid: resetUsersUid,
          });
        }
      } else {
        //????????? user??? 2??? ????????? user??? UserRooms?????? ????????? ??????
        for (const item of userRooms.userListUid) {
          const UserRoomsRef = ref(db, `UserRooms/${item}/${roomMessageId}`);
          await remove(UserRoomsRef);
        }
      }

      //UserRooms ??? uid?????? ????????? ??????
      await remove(UserRoomsRef);

      router.push('/ChatList');
    }
  };

  return (
    <React.Fragment>
      <Head>
        <title>??????</title>
      </Head>

      <div ref={messageEndRef}>
        <ChatStyle>
          {isAddChatList && (
            <AddChatList
              messageId={roomMessageId}
              isAddChatList={isAddChatList}
              setIsAddChatList={setIsAddChatList}
              setRoomMessageId={setRoomMessageId}
            />
          )}
          <Header
            title={
              Array.isArray(usersNickname)
                ? usersNickname
                    .filter((item: string) => item !== userState.nickname)
                    .join(' ')
                : usersNickname
            }
            type="chat"
          />

          <div className="header-btn-wrap">
            <div
              className="btn-add-user"
              onClick={() => setIsAddChatList(!isAddChatList)}
            >
              <PersonAddAlt1Icon sx={{ fontSize: 30 }} />
            </div>
            <div className="btn-room-out" onClick={delChatList}>
              <LogoutIcon />
            </div>
          </div>

          <ul className="message-list">
            {message?.map((item) => (
              <li key={item.timestamp}>
                <div
                  className={`message-wrap ${
                    item.uid === userState.uid ? 'me' : 'other'
                  }`}
                >
                  <div className="name">{item.nickname}</div>
                  <div className="flex-wrap">
                    <div className="message">{item.message}</div>
                    <div className="time">{getDate(item.timestamp)}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="bottom-wrap">
            <form onSubmit={handleSendMessage}>
              <input
                placeholder="????????? ???????????????."
                value={sendMessage}
                onChange={(e) => setSendMessage(e.target.value)}
              />
              <button type="submit">??????</button>
            </form>
          </div>
        </ChatStyle>
        {/* <div  /> */}
      </div>
    </React.Fragment>
  );
}

export default Chat;
