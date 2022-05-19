import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase-config';
import { getDatabase, ref, set } from 'firebase/database';
import styled from '@emotion/styled';

const JoinStyle = styled.div`
  width: 100%;
  margin-top: 179px;
  text-align: center;

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

function Join() {
  const router = useRouter();
  const [joinEmail, setJoinEmail] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('해당 이메일 사용자가 존재합니다.');
      }
      console.log(error.message);
    }
  };

  return (
    <React.Fragment>
      <Head>
        <title>회원가입</title>
      </Head>
      <JoinStyle>
        <form onSubmit={userJoin}>
          <input
            type="email"
            placeholder="이메일을 입력해 주세요"
            onChange={(e) => {
              setJoinEmail(e.target.value);
            }}
            required
          />
          <input
            type="password"
            placeholder="비밀번호를 입력해 주세요"
            onChange={(e) => {
              setJoinPassword(e.target.value);
            }}
            required
          />
          <input
            type="text"
            placeholder="이름을 입력해 주세요"
            onChange={(e) => {
              setUserName(e.target.value);
            }}
            required
          />
          <div className="error-message">{errorMessage}</div>
          <button type="submit">회원가입</button>
        </form>

        <div className="btn-join">
          <Link href="/Login">
            <a>로그인</a>
          </Link>
        </div>
      </JoinStyle>
    </React.Fragment>
  );
}

export default Join;
