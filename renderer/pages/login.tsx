import React, { useContext, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase-config';
import { UserContext } from '../context/UserContext';
import { getDatabase, ref, get } from 'firebase/database';

function Login() {
  const router = useRouter();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const { setUserState } = useContext(UserContext);

  //로그인
  const userLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const data = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        loginPassword
      );

      //user 정보 받아오기
      const db = getDatabase();
      const dbRef = ref(db, `Users/${data.user.uid}`);
      const getUserInfo = await get(dbRef);
      const userInfo = getUserInfo.val();

      await setUserState({
        uid: userInfo.uid,
        email: userInfo.email,
        nickname: userInfo.nickname,
      });

      router.push('/Users');
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <React.Fragment>
      <Head>
        <title>로그인</title>
      </Head>
      <div>
        <form onSubmit={userLogin}>
          <input
            placeholder="e-mail"
            onChange={(e) => {
              setLoginEmail(e.target.value);
            }}
          />
          <input
            type="password"
            placeholder="password"
            onChange={(e) => {
              setLoginPassword(e.target.value);
            }}
          />
          <button type="submit">로그인</button>
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

        <div>User Logged In:</div>
        {/* <div>{user?.email}</div> */}
      </div>
    </React.Fragment>
  );
}

export default Login;
