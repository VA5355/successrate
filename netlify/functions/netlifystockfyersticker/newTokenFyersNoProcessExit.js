const axios = require('axios');
const otplib = require('otplib');
const crypto = require('crypto');
const { URL } = require('url');


// Client Information (ENTER YOUR OWN INFO HERE! Data varies from users and app types)
const CLIENT_ID ='XV31360';// "XM44577";       // Your Fyers Client ID
const PIN = "7892";                // User pin for Fyers account
const APP_ID = "7GSQW68AZ4";       //7GSQW68AZ4-100 // App ID from MyAPI dashboard (https://myapi.fyers.in/dashboard)
const APP_TYPE = "100";
const APP_SECRET = "MGY8LRIY0M" ;// "4O7FS21OSQ";  //MGY8LRIY0M

 // App Secret from myapi dashboard (https://myapi.fyers.in/dashboard)
const TOTP_SECRET_KEY =  "CO5MMHUS4CY4RABN6XEUGAQ6YZV6DC3Z" ;   //"UN4JGYCRUJ2NFNNHAFU5XENHPMEKCUMB";  // TOTP secret key
// 

const REDIRECT_URI = "https://successrate.netlify.app/.netlify/functions/netlifystockfyersbridge/api/fyersauthcodeverify";
//"https://trade.fyers.in/api-login/redirect-uri/index.html";  // Redirect URL from the app

// API endpoints
const BASE_URL = "https://api-t2.fyers.in/vagator/v2";
const BASE_URL_2 = "https://api-t1.fyers.in/api/v3";
const URL_VERIFY_CLIENT_ID = BASE_URL + "/send_login_otp";
const URL_VERIFY_TOTP = BASE_URL + "/verify_otp";
const URL_VERIFY_PIN = BASE_URL + "/verify_pin";
const URL_TOKEN = BASE_URL_2 + "/token";
const URL_VALIDATE_AUTH_CODE = BASE_URL_2 + "/validate-authcode";

const SUCCESS = 1;
const ERROR = -1;

async function verifyClientId(clientId) {
    try {
        const payload = {
            fy_id: clientId,
            app_id: "2"
        };

        const response = await axios.post(URL_VERIFY_CLIENT_ID, payload);
        if (response.status !== 200) {
            return [ERROR, response.data];
        }

        const requestKey = response.data.request_key;
        return [SUCCESS, requestKey];
    } catch (error) {
        return [ERROR, error.message];
    }
}

function generateTotp(secret) {
    try {
        const totp = otplib.authenticator.generate(secret);
        return [SUCCESS, totp];
    } catch (error) {
        return [ERROR, error.message];
    }
}

async function verifyTotp(requestKey, totp) {
    try {
        const payload = {
            request_key: requestKey,
            otp: totp
        };

        const response = await axios.post(URL_VERIFY_TOTP, payload);
        if (response.status !== 200) {
            return [ERROR, response.data];
        }

        const newRequestKey = response.data.request_key;
        return [SUCCESS, newRequestKey];
    } catch (error) {
        return [ERROR, error.message];
    }
}

async function verifyPin(requestKey, pin) {
    try {
        const payload = {
            request_key: requestKey,
            identity_type: "pin",
            identifier: pin
        };

        const response = await axios.post(URL_VERIFY_PIN, payload);
        if (response.status !== 200) {
            return [ERROR, response.data];
        }

        const accessToken = response.data.data.access_token;
        return [SUCCESS, accessToken];
    } catch (error) {
        return [ERROR, error.message];
    }
}

async function getToken(clientId, appId, redirectUri, appType, accessToken) {
    try {
        const payload = {
            fyers_id: clientId,
            app_id: appId,
            redirect_uri: redirectUri,
            appType: appType,
            code_challenge: "",
            state: "sample_state",
            scope: "",
            nonce: "",
            response_type: "code",
            create_cookie: true
        };

        const headers = {
            Authorization: `Bearer ${accessToken}`
        };

        const response = await axios.post(URL_TOKEN, payload, { headers, maxRedirects: 0, validateStatus: (status) => status === 308 });
        
        // First try to get location from headers
        let redirectUrl = response.headers.location;
        
        // If not in headers, check response data (handle both Url and url cases)
        if (!redirectUrl && response.data) {
            redirectUrl = response.data.Url || response.data.url || 
                         (response.data.data && response.data.data.Url) || 
                         (response.data.data && response.data.data.url);
        }

        if (!redirectUrl) {
            console.log('Full response structure:', {
                status: response.status,
                headers: response.headers,
                data: JSON.stringify(response.data, null, 2),
                config: response.config
            });
            return [ERROR, "No redirect URL found in response. Check full response structure above"];
        }

        console.log('Found redirect URL:', redirectUrl);

        try {
            // Parse the redirect URL
            const url = new URL(redirectUrl);
            const authCode = url.searchParams.get('auth_code');
            
            if (!authCode) {
                return [ERROR, "No auth_code found in redirect URL"];
            }

            return [SUCCESS, authCode];
        } catch (e) {
            return [ERROR, `Error processing redirect: ${e.message}`];
        }

    } catch (error) {
        return [ERROR, error.message];
    }
}

function sha256Hash(appId, appType, appSecret) {
    const message = `${appId}-${appType}:${appSecret}`;
    return crypto.createHash('sha256').update(message).digest('hex');
}

async function validateAuthCode(authCode) {
    try {
        const appIdHash = sha256Hash(APP_ID, APP_TYPE, APP_SECRET);
        const payload = {
            grant_type: "authorization_code",
            appIdHash: appIdHash,
            code: authCode,
        };

        const response = await axios.post(URL_VALIDATE_AUTH_CODE, payload);
        if (response.status !== 200) {
            return [ERROR, response.data];
        }

        const accessToken = response.data.access_token;
        return [SUCCESS, accessToken];
    } catch (error) {
        return [ERROR, error.message];
    }
}

async function main() {
    // Step 1 - Retrieve request_key from verifyClientId Function
    const verifyClientIdResult = await verifyClientId(CLIENT_ID);
    if (verifyClientIdResult[0] !== SUCCESS) {
        console.log(`verifyClientId failure - ${verifyClientIdResult[1]}`);
       // process.exit();
    } else {
        console.log("verifyClientId success");
        // Step 3 - Verify totp and get request key from verifyTotp Function.
    const requestKey = verifyClientIdResult[1];

    // Step 2 - Generate totp
    const generateTotpResult = generateTotp(TOTP_SECRET_KEY);
    if (generateTotpResult[0] !== SUCCESS) {
        console.log(`generateTotp failure - ${generateTotpResult[1]}`);
      //  process.exit();
    } else {
        console.log("generateTotp success");
       const totp = generateTotpResult[1];
        const verifyTotpResult = await verifyTotp(requestKey, totp);
        if (verifyTotpResult[0] !== SUCCESS) {
            console.log(`verifyTotp failure - ${verifyTotpResult[1]}`);
        //  process.exit();
        } else {
            console.log("verifyTotp success");
            // Step 4 - Verify pin and send back access token
        const requestKey2 = verifyTotpResult[1];
        const verifyPinResult = await verifyPin(requestKey2, PIN);
        if (verifyPinResult[0] !== SUCCESS) {
            console.log(`verifyPin failure - ${verifyPinResult[1]}`);
       //     process.exit();
        } else {
            console.log("verifyPin success");
          // Step 5 - Get auth code for API V3 App from trade access token
            const tokenResult = await getToken(
                CLIENT_ID, APP_ID, REDIRECT_URI, APP_TYPE, verifyPinResult[1]
            );
            if (tokenResult[0] !== SUCCESS) {
                console.log(`token failure - ${tokenResult[1]}`);
              //  process.exit();
            } else {
                console.log("token success");
        // Step 6 - Get API V3 access token from validating auth code
            const authCode = tokenResult[1];
            const validateAuthCodeResult = await validateAuthCode(authCode);
            if (validateAuthCodeResult[0] !== SUCCESS) {
                console.log(`validateAuthCode failure - ${validateAuthCodeResult[1]}`);
                // TIME SPANE active till next day morning 

              //  process.exit();
            } else {
                console.log("validateAuthCode success");

                  const accessToken = `${APP_ID}-${APP_TYPE}:${validateAuthCodeResult[1]}`;
                 console.log(`\naccess_token - ${accessToken}\n`);

            }



            }   



        }   




        }



    }    

    
    }

    
  
}

main();