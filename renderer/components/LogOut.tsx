import React from "react";
import styled from "@emotion/styled";
import Router from "next/router";
import { auth } from "../firebase-config";
import { signOut } from "firebase/auth";

export const LogOutStyle = styled.button``;

const LogOut = () => {
  const userLogOut = async () => {
    try {
      const data = await signOut(auth);

      Router.push("/login");
    } catch (error) {
      console.log(error.message);
    }
  };

  return <LogOutStyle onClick={userLogOut}>로그아웃</LogOutStyle>;
};

export default LogOut;
