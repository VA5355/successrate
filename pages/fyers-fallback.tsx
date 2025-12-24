import { GetServerSideProps } from "next";
import Head from "next/head";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";
import Script from "next/script";
import { StorageUtils } from '@/libs/cache';
import { CommonConstants } from '@/utils/constants';
type Props = {
  auth_code: string;
  code: string;
  s: string;
  state: string;
  triggerredirectpython: string;
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
export default function FyersFallback(props: Props) {
  const { auth_code, code, s, state, triggerredirectpython } = props;
   let isAuthenticate = false; 
  useEffect(() => {

      if (typeof window === "undefined") return;
    try {
      if (!auth_code) {
        window.location.replace("/fyers-auth");
        return;
      }
      let code_split =    auth_code.split(".");   // isValidJwtStructure(auth_code)
       code_split.length ==3 ;
   //   if( code_split.length ==3){  
        let data = {
          value: {
            auth_code,
            code,
            s,
            ttl: Date.now(),
          }};
    
    
      localStorage.setItem(
        "fyersToken",
        JSON.stringify({
          value: {
            auth_code,
            code,
            s,
            ttl: Date.now(),
          },
        })
      ); 
         // Optional: keep your utility, but ONLY on client
        try {
          StorageUtils?._save?.(CommonConstants.fyersToken, {
            isValid: true,
            data: data,
          });
        } catch (e) {
          console.warn("StorageUtils failed, localStorage already set");
        }




     // }



      // Reset attempt flag after success
      localStorage.removeItem("fyers-auth-attempted");
    } catch (e) {
      console.error("Token storage failed:", e);
    }
  }, []); // auth_code, code, s]  no ned change in this values , every time this usefect must be called 

  const handleAuthenticated = () => {
    try {
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
    } catch {
      alert("Redirection failed.");
    }
  };

  return (
    <>
      <Head>
        <title>FYERS Logged In</title>

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
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex justify-center"
          >
            <CheckCircle className="w-16 h-16 text-brandgreen-500" />
          </motion.div>
          
              <h1  className="text-2xl font-bold mt-4 text-brandgreen--800">FYERS LOGGED IN</h1>

              {auth_code ?  (
                       <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                  onClick={handleAuthenticated}
                   className="mt-6 w-full flex items-center justify-center gap-2 bg-brandgreen-600 hover:bg-brandgreen-700 font-bold  py-3 rounded-xl text-brandgreen"
                    >
              <strong>  Authenticated </strong>
                     <ArrowRight className="w-5 h-5" />
                     </motion.button>
              ) : (
                <p className="text-brandgreen mt-4">
                  Authentication failed. Please retry.   <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                       onClick={() => window.close()}
                       className="mt-6 w-full flex items-center justify-center gap-2 bg-brandgreen-600 hover:bg-brandgreen-700 font-bold  py-3 rounded-xl text-brandgreen"
                    >
                           <strong>  OK</strong>
                    
                     </motion.button>
                       
                </p>
              )}
            </motion.div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  if (!query.auth_code) {
    return {
      redirect: {
        destination: "/fyers-error?reason=missing_auth_code",
        permanent: false,
      },
    };
  }

  return {
    props: {
      auth_code: query.auth_code ?? "",
      code: query.code ?? "",
      s: query.s ?? "",
      state: query.state ?? "",
      triggerredirectpython: query.triggerredirectpython ?? "false",
    },
  };
};
