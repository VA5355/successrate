import { Html, Head, Main, NextScript } from "next/document";
 
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* 🔹 External stylesheets (GLOBAL) */}

          <link rel="stylesheet" href="/css/globals.css" />
        	 <link  type="text/css" rel="stylesheet" href="/bootcss/bootstrap.min.css"/>
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
        />

        <link rel="stylesheet" href="/css/uploadaddhar.css" />
        <link rel="stylesheet" href="/css/style_new.css" />

        <link
          rel="stylesheet"
          href="https://login.fyers.in/new-sso/16.3/fyers-ui.css"
        />

        <link
          rel="stylesheet"
          href="https://use.fontawesome.com/releases/v5.1.0/css/all.css"
        />

        <link
          rel="stylesheet"
          href="https://assets.fyers.in/Lib/intlTelInput.css"
        />

        <link
          rel="stylesheet"
          href="https://assets.fyers.in/fy_notifications/css/2.0/notify.min.css"
        />
         <link rel="preload" as="font" href="/css/text-security-disc.woff" type="font/woff" crossOrigin="anonymous"/> 

      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
