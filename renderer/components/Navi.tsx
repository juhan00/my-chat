import React from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';
import PersonIcon from '@mui/icons-material/Person';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import { useRouter } from 'next/router';
import { auth } from '../firebase-config';
import { signOut } from 'firebase/auth';

const NaviStyle = styled.div`
  & > nav {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    width: 100%;
    height: 70px;
    left: 0px;
    bottom: 0px;
    background-color: #f4f4f4;
    .menu {
      & > a {
        font-size: 15px;
      }
      & > a + a {
        margin-left: 40px;
      }
    }
    .button-wrap {
      position: absolute;
      top: 50%;
      right: 20px;
      transform: translateY(-50%);
      & > button {
        font-size: 11px;
        color: #999;
        background-color: transparent;
        border: 0px;
      }
    }
  }
`;

function Navi() {
  const router = useRouter();

  const userLogOut = async () => {
    try {
      await signOut(auth);

      router.push('/Login');
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <NaviStyle>
      <nav>
        <div className="menu">
          <Link href="/Users">
            <a>
              <PersonIcon sx={{ fontSize: 30 }} />
            </a>
          </Link>
          <Link href="/ChatList">
            <a>
              <ChatBubbleIcon sx={{ fontSize: 25 }} />
            </a>
          </Link>
        </div>
        <div className="button-wrap">
          <button onClick={userLogOut}>로그아웃</button>
        </div>
      </nav>
    </NaviStyle>
  );
}

export default Navi;
