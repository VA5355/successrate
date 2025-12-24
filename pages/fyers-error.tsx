import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw } from "lucide-react";
import Head from "next/head";
import Script from "next/script";

type Props = {
  clientId: string;
  redirectUri: string;
};
function isValidJwtStructure(token: unknown): boolean {
  if (typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  try {
    const [header, payload] = parts;

    const decode = (str: string) =>
      JSON.parse(
        decodeURIComponent(
          atob(str.replace(/-/g, "+").replace(/_/g, "/"))
            .split("")
            .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        )
      );

    decode(header);
    decode(payload);

    return true;
  } catch {
    return false;
  }
}
export default function FyersError({ clientId, redirectUri }: Props) {
  const router = useRouter();
  const { reason } = router.query;

  return (
      <>
     <Head>
        <title>FYERS Authentication Error</title>
             </Head>
                  <Script
            src="/js/bootstrap.min.js"
             
            strategy="afterInteractive"
          />
            <Script
          src="https://assets.fyers.in/Lib/intlTelInput.min.js"
          strategy="afterInteractive"
        />
           <Script
            src="https://trade.fyers.in/Prod/1.2/fyers-widget.min.js"
            strategy="afterInteractive"
          />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="flex justify-center">
            <AlertTriangle className="w-14 h-14 text-red-500" />
          </div>

          <h1 className="text-2xl font-bold mt-4 bg-brandgreen-600 text-brandgreen-800">
            Authentication Failed
          </h1>
              <div className="container py-5 text-center">
                <p className="text-brandgreen--500 mt-2">
                Something went wrong while logging in to FYERS.
               </p>

                <p className="mt-3 text-muted">
                  Please try again after some time.
                </p>

                {reason && (
                  <p className="mt-3 text-sm text-brandgreen-600 bg-brandgreen-50 px-3 py-2 rounded-lg">
                   Error reason: <strong>{reason}</strong>
                 </p>
                 )}
                       <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {  
                        
                             const params = new URLSearchParams({
                      client_id: clientId,
                      redirect_uri: redirectUri,
                      response_type: "code",
                      state: "sample_state",
                    });

                          window.location.assign(
                            "https://api-t1.fyers.in/api/v3/generate-authcode?" +
                              params.toString()
                          );
                      }
                      }
                      className="mt-6 w-full flex items-center justify-center gap-2 bg-brandgreen-600 hover:bg-brandgreen-700 text-brandgreen py-3 rounded-xl font-bold"
                    >
                   <RotateCcw className="w-5 h-5" />
                      <strong> Retry Login</strong>
                     </motion.button>
             </div>
            
        </motion.div>
      </div>
         </>
  );
}
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      clientId: process.env.FYERS_CLIENT_ID ?? "",
      redirectUri: process.env.FYERS_REDIRECT_URI ?? "",
    },
  };
};
