import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase-config';
import { getDatabase, ref, set } from 'firebase/database';

function Join() {
  const router = useRouter();
  const [joinEmail, setJoinEmail] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [userName, setUserName] = useState('');

  const userJoin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      //firebase 회원가입
      const data = await createUserWithEmailAndPassword(
        auth,
        joinEmail,
        joinPassword
      );

      //firebase Users에 유저정보 등록
      const userUid = data.user.uid;
      const userEmail = data.user.email;

      const db = getDatabase();
      const messageListRef = ref(db, `Users/${userUid}`);

      await set(messageListRef, {
        uid: auth.currentUser.uid,
        email: userEmail,
        nickname: userName,
      });

      router.push('/Users');
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <React.Fragment>
      <Head>
        <title>회원가입</title>
      </Head>
      <div>
        <form onSubmit={userJoin}>
          <input
            type="email"
            placeholder="이메일을 입력해 주세요"
            onChange={(e) => {
              setJoinEmail(e.target.value);
            }}
          />
          <input
            type="password"
            placeholder="비밀번호를 입력해 주세요"
            onChange={(e) => {
              setJoinPassword(e.target.value);
            }}
          />
          <input
            type="text"
            placeholder="이름을 입력해 주세요"
            onChange={(e) => {
              setUserName(e.target.value);
            }}
          />
          <button type="submit">회원가입</button>
        </form>

        <Link href="/Login">
          <a>로그인</a>
        </Link>
        <Link href="/Join">
          <a>회원가입</a>
        </Link>
        <Link href="/Users">
          <a>홈</a>
        </Link>
        <Link href="/DropOut">
          <a>탈퇴하기</a>
        </Link>
      </div>
    </React.Fragment>
  );
}

export default Join;
