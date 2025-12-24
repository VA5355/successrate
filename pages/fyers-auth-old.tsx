import { GetServerSideProps } from "next";
import Head from "next/head";
import { useEffect } from "react";

type Props = {
  clientId: string;
  redirectUri: string;
  auth_code: string;
  code: string;
};

export default function FyersAuth({ clientId, redirectUri , auth_code , code }: Props) {
  useEffect(() => {
    if (!clientId || !redirectUri) return;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      state: "sample_state",
    });
    console.log("fyers-auth.tsx  --->   clientid "+clientId + " redirect_uri "+redirectUri);
    console.log("fyers-auth.tsx  --->   params "+params.toString());
    if(auth_code !==undefined && auth_code !==null ){
        // auth code present show the authenticate button 
         let urlwithauth = process.env.FYERS_BASE_URI  ? process.env.FYERS_BASE_URI + "/fyers-auth?auth_code="+auth_code+"&code="+code : "/fyers-auth?auth_code="+auth_code+"&code="+code ;
 
             window.location.assign(urlwithauth );
    }
    else {   
            window.location.assign(
            "https://api-t1.fyers.in/api/v3/generate-authcode?" + params.toString()
            );
   }

  }, [clientId, redirectUri]);

  return (
    <>
      <Head>
        <title>FYERS Authentication</title>
      </Head>

      <div className="container text-center py-5">
        <h1>GOOD MORNING</h1>
        <img
          src="https://assets.fyers.in/images/logo.svg"
          alt="FYERS"
          width={225}
        />
        <p className="mt-4">Redirecting to FYERS…</p>
      </div>
    </>
  );
}
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  return {
    props: {
      clientId: process.env.FYERS_CLIENT_ID ?? "",
      redirectUri: process.env.FYERS_REDIRECT_URI ?? "",
        auth_code: (query !==undefined) ?  (query?.auth_code ?? "") : "",
      code: (query !==undefined) ? (query.code ?? "") : "",
    },
  };
};
