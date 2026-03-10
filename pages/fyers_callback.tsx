import { GetServerSideProps, NextPage } from "next";
import { useEffect } from "react";

interface FyersCallbackProps {
  client_id?: string;
  auth_code?: string;
  lastlogin?: string;
  secret_key?: string;
  code?: string;
  s?: string;
}

const FyersCallback: NextPage<FyersCallbackProps> = ({
  client_id,
}) => {

  useEffect(() => {

    if (!client_id) return;

    const redirectURI = `${window.location.origin}/fyersauthcode`;

    const passOver =
      `client_id=${client_id}` +
      `&redirect_uri=${encodeURIComponent(redirectURI)}` +
      `&response_type=code` +
      `&state=sample_state`;

    const fyersURL =
      `https://api-t1.fyers.in/api/v3/generate-authcode?${passOver}`;

    console.log("FYERS Redirect URL:", fyersURL);

    window.location.assign(fyersURL);

  }, [client_id]);

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "120px",
        fontFamily: "Arial"
      }}
    >
      <h1>GOOD MORNING</h1>

      <img
        src="https://assets.fyers.in/images/logo.svg"
        alt="FYERS"
        width="220"
      />

      <p>Redirecting to FYERS authentication...</p>
    </div>
  );
};

export default FyersCallback;

export const getServerSideProps: GetServerSideProps = async (context) => {

  const {
    client_id,
    auth_code,
    lastlogin,
    secret_key,
    code,
    s
  } = context.query;

  return {
    props: {
      client_id: client_id || null,
      auth_code: auth_code || null,
      lastlogin: lastlogin || null,
      secret_key: secret_key || null,
      code: code || null,
      s: s || null
    }
  };
};