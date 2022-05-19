import React from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

const HeaderStyle = styled.div`
  .header-wrap {
    display: flex;
    align-items: center;
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 90px;
    padding: 0 20px;
    box-sizing: border-box;
    border-bottom: 1px solid #e2e2e2;
    background-color: #fff;
    z-index: 999;
    & > h1 {
      margin-left: 10px;
      font-size: 20px;
    }

    &.chat {
      justify-content: center;
      .btn-back {
        position: absolute;
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
      }
      & > h1 {
        margin-left: 0;
        max-width: 250px;
        text-align: center;
        white-space: normal;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
  }
`;

function Header({ title, type }) {
  const router = useRouter();

  return (
    <HeaderStyle>
      {type === 'main' ? (
        <div className="header-wrap">
          <h1>{title}</h1>
        </div>
      ) : (
        type === 'chat' && (
          <div className="header-wrap chat">
            <div className="btn-back" onClick={() => router.back()}>
              <ArrowBackIosNewIcon />
            </div>
            <h1>{title}</h1>
          </div>
        )
      )}
    </HeaderStyle>
  );
}

export default Header;
