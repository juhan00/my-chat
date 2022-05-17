import React, { useContext, useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { getDatabase, ref, onValue } from 'firebase/database'
import LogOut from '../components/LogOut'
import { UserContext } from '../context/UserContext'

function ChatList() {
  const router = useRouter()
  const { authState, userState } = useContext(UserContext)
  const [chatListState, setChatListState] = useState([])

  //로그인 체크
  useEffect(() => {
    !authState && router.push('/Login')
  }, [authState, router])

  //chat list 받기
  useEffect(() => {
    const db = getDatabase()
    const dbRef = ref(db, `UserRooms/${userState.uid}`)

    onValue(dbRef, async (snapshot) => {
      const userList = snapshot.val()

      if (userList !== null) {
        const arrKey = Object.keys(snapshot.val())
        const arrUserList = []
        for (let i = 0; i < arrKey.length; i++) {
          arrUserList.push(userList[arrKey[i]])
        }

        setChatListState(arrUserList)
      }
    })
  }, [userState.uid])

  const goToChatList = (messageId: string) => {
    router.push({
      pathname: '/Chat',
      query: `messageId=${messageId}`,
    })
  }

  return (
    <React.Fragment>
      <Head>
        <title>채팅 리스트</title>
      </Head>
      {authState && <LogOut />}
      <Link href="/Login">
        <a>로그인</a>
      </Link>
      <Link href="/Join">
        <a>회원가입</a>
      </Link>
      <Link href="/Users">
        <a>홈</a>
      </Link>

      <ul>
        {chatListState?.map((item) => (
          <li key={item.messageId}>
            <div onClick={() => goToChatList(item.messageId)}>
              {Array.isArray(item.userListNickname)
                ? item.userListNickname.filter(
                    (item: string) => item !== userState.nickname
                  )
                : item.userListNickname}
            </div>
          </li>
        ))}
      </ul>
    </React.Fragment>
  )
}

export default ChatList
