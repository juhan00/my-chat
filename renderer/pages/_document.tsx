import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { css, Global } from '@emotion/react';
import emotionReset from 'emotion-reset';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="utf-8" />
        </Head>
        <Global
          styles={css`
            ${emotionReset}
            html,
            body {
              margin: 0;
              padding: 0;
              min-height: 100%;
            }

            body {
              background: #fff;
              font-family: Helvetica, Arial, sans-serif;
              font-size: 24px;
            }
            a {
              text-decoration: none;
              outline: none;
              color: #000;
              &:hover,
              &:active {
                text-decoration: none;
              }
            }
          `}
        />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
