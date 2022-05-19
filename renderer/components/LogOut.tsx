import React from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import { auth } from '../firebase-config';
import { signOut } from 'firebase/auth';

export const LogOutStyle = styled.button``;

const LogOut = () => {
  const router = useRouter();

  const userLogOut = async () => {
    try {
      await signOut(auth);

      router.push('/Login');
    } catch (error) {
      console.log(error.message);
    }
  };

  return <LogOutStyle onClick={userLogOut}>로그아웃</LogOutStyle>;
};

export default LogOut;
