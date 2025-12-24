import { GetServerSideProps } from "next";
import Head from "next/head";
import { useEffect } from "react";

type Props = {
 lastlogin: new () => Date ;
				  
  client_id: string;
  secret_key: string;
  s: string;
  code: string;
  auth_code: string;
  triggerredirectpython: string;
  state: string;
};

export default function FyersCallback(props: Props) {
  const {
    auth_code,
    code,
    s,
    triggerredirectpython,
    state,
  } = props;

  useEffect(() => {
    if (!auth_code) return;

    const token = {
      value: {
        auth_code,
        code,
        s,
        ttl: Date.now(),
      },
    };

    localStorage.setItem("fyersToken", JSON.stringify(token));
  }, [auth_code, code, s]);

  const handleAuthenticated = () => {
    if (triggerredirectpython === "true") {
      if (state === "python_test") {
        window.location.assign(
          `https://localhost:9384/redirect?auth_code=${auth_code}&state=python_test`
        );
      } else if (state === "python_state") {
        window.location.assign(
          `https://localhost:9384/redirect-start?auth_code=${auth_code}&state=python`
        );
      } else if (state === "python_order_state") {
        window.location.assign(
          `https://localhost:5002/redirect-start?auth_code=${auth_code}&state=python_order`
        );
      }
    } else {
      window.close();
    }
  };

  const handleProceedAccess = () => {
    window.location.assign(
      `http://192.168.1.6:8888/.netlify/functions/netlifystockfyersbridge/api/fyersgetaccessauthcode?auth_code=${auth_code}`
    );
  };

  return (
    <>
      <Head>
        <title>FYERS Logged In</title>

        {/* Bootstrap */}
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
        />

        {/* Your CSS (must be in /public/css) */}
        <link rel="stylesheet" href="/css/uploadaddhar.css" />
        <link rel="stylesheet" href="/css/style_new.css" />
      </Head>

      <div className="container py-5 text-center">
        <h1>FYERS LOGGED IN</h1>

        {auth_code ? (
          <>
            <button
              onClick={handleAuthenticated}
              className="btn btn-primary btn-block mt-4"
            >
              Authenticated
            </button>

            <button
              onClick={handleProceedAccess}
              className="btn btn-secondary btn-block mt-2"
            >
              Proceed Access
            </button>
          </>
        ) : (
          <button
            onClick={() => window.close()}
            className="btn btn-danger btn-block mt-4"
          >
            Not Authenticated
          </button>
        )}
      </div>
    </>
  );
}
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  if (!query.auth_code) {
    return {
      redirect: {
        destination: "/fyers-error?reason=invalid_callback",
        permanent: false,
      },
    };
  }

  return {
    props: {
         clientId: process.env.FYERS_CLIENT_ID ?? "",  //  TRLV2A6GPL-100 7GSQW68AZ4-100 
        lastlogin: new Date ,
      auth_code: query.auth_code ?? "",
      code: query.code ?? "",
      s: query.s ?? "",
      state: query.state ?? "",
      triggerredirectpython: query.triggerredirectpython ?? "false",
      secret_key: process.env.FYERS_SECRET_KEY ?? "",  //"V72MPISUJC"; 		 // "MGY8LRIY0M"; 
    },
  };
};
