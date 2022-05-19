import React, { useContext, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getDatabase, ref, onValue } from 'firebase/database';
// import LogOut from '../components/LogOut';
import { UserContext } from '../context/UserContext';
import Header from '../components/Header';
import Navi from '../components/Navi';
import styled from '@emotion/styled';

const ChatListStyle = styled.div`
  margin-top: 20px;
  & > ul {
    & > li {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      height: 74px;
      &:hover {
        background-color: #f0f6fb;
        cursor: pointer;
      }
      .text-wrap {
        padding: 0 30px;
        box-sizing: border-box;
        .name {
          font-size: 20px;
          color: #000;
        }
        .last-message {
          margin-top: 5px;
          font-size: 15px;
          color: #999;
          height: 16px;
          word-break: break-all;
          white-space: normal;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }

      button {
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
        border: 1px solid #e2e2e2;
        border-radius: 2px;
        padding: 5px 10px;
        background-color: #fff;
      }
    }
  }
`;

function ChatList() {
  const router = useRouter();
  const { authState, userState } = useContext(UserContext);
  const [chatListState, setChatListState] = useState([]);

  //로그인 체크
  useEffect(() => {
    !authState && router.push('/Login');
  }, [authState, router]);

  //chat list 받기
  useEffect(() => {
    const db = getDatabase();
    const dbRef = ref(db, `UserRooms/${userState.uid}`);

    onValue(dbRef, async (snapshot) => {
      const userList = snapshot.val();

      if (userList !== null) {
        const arrKey = Object.keys(snapshot.val());
        const arrUserList = [];
        for (let i = 0; i < arrKey.length; i++) {
          arrUserList.push(userList[arrKey[i]]);
        }

        setChatListState(arrUserList);
      }
    });
  }, [userState.uid]);

  const goToChatList = (messageId: string) => {
    router.push({
      pathname: '/Chat',
      query: `messageId=${messageId}`,
    });
  };

  return (
    <React.Fragment>
      <Head>
        <title>채팅 리스트</title>
      </Head>
      <Header title="Chat" type="main" />
      <ChatListStyle>
        {/* {authState && <LogOut />} */}

        <ul>
          {chatListState?.map((item) => (
            <li
              key={item.messageId}
              onClick={() => goToChatList(item.messageId)}
            >
              <div className="text-wrap">
                <div className="name">
                  {Array.isArray(item.userListNickname)
                    ? item.userListNickname
                        .filter((item: string) => item !== userState.nickname)
                        .join(' ')
                    : item.userListNickname}
                </div>
                <div className="last-message">{item.lastMessage}</div>
              </div>
              {/* <button>대화하기</button> */}
            </li>
          ))}
        </ul>
      </ChatListStyle>
      <Navi />
    </React.Fragment>
  );
}

export default ChatList;
