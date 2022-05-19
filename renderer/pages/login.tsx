import React, { useContext, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase-config';
import { UserContext } from '../context/UserContext';
import { getDatabase, ref, get } from 'firebase/database';
import styled from '@emotion/styled';

const LoginStyle = styled.div`
  width: 100%;
  margin-top: 140px;
  text-align: center;
  .ico-chat {
    width: 100%;
    display: flex;
    justify-content: center;
    margin: 0 auto;
  }

  & > form {
    width: 70%;
    margin: 0 auto;
    text-align: center;
    padding-top: 50px;
    & > input {
      width: 100%;
      height: 34px;
      font-size: 15px;
      border: 0px;
      border-bottom: 1px solid #e2e2e2;
      &::placeholder {
        color: #dad6d6;
      }
    }
    & > input + input {
      margin-top: 10px;
    }
    .error-message {
      margin-top: 15px;
      text-align: left;
      font-size: 14px;
      color: #f56d5a;
    }
    & > button {
      margin-top: 40px;
      width: 100%;
      height: 46px;
      border: 0px;
      background-color: #58b9ff;
      color: #fff;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
    }
  }

  .btn-join {
    margin-top: 18px;
    a {
      font-size: 12px;
      color: #999;
    }
  }
`;

function Login() {
  const router = useRouter();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
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
      if (error.code === 'auth/user-not-found') {
        setErrorMessage('사용자가 존재하지 않습니다.');
      } else if (error.code === 'auth/wrong-password') {
        setErrorMessage('비밀번호가 일치하지 않습니다.');
      }
      console.log(error.message);
    }
  };
  return (
    <React.Fragment>
      <Head>
        <title>로그인</title>
      </Head>
      <LoginStyle>
        <div className="ico-chat">
          <svg
            width="72"
            height="86"
            viewBox="0 0 72 86"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M33.3136 81.7115L37.6404 67.3024L52.1195 66.2278L33.3136 81.7115Z"
              fill="#58B9FF"
            />
            <circle cx="36" cy="36" r="36" fill="#58B9FF" />
          </svg>
        </div>
        <form onSubmit={userLogin}>
          <input
            type="email"
            placeholder="이메일을 입력해 주세요"
            onChange={(e) => {
              setLoginEmail(e.target.value);
            }}
            required
          />
          <input
            type="password"
            placeholder="비밀번호를 입력해 주세요"
            onChange={(e) => {
              setLoginPassword(e.target.value);
            }}
            required
          />
          <div className="error-message">{errorMessage}</div>
          <button type="submit">로그인</button>
        </form>

        <div className="btn-join">
          <Link href="/Join">
            <a>회원가입</a>
          </Link>
        </div>
      </LoginStyle>
    </React.Fragment>
  );
}

export default Login;
