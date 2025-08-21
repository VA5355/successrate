# Groww Stonks

Groww Stonks is a web application that help you track status of various stocks/etfs. It has many level of optimizations
like throttling for API calls reduction, and lazy loading for performance improvement.

[Live Deployed Link](https://groww-task-delta.vercel.app)

## Folder Structure

- libs (cache, api, etc.)
- components (UI components)
- app (UI pages)
- utils (constants)
- redux (redux toolkit setup & provider)
- public (assets)

## Setup

- Clone repo using `git clone https://github.com/RamGoel/groww-task.git `
- Change Directory using `cd groww-task`
- install dependencies using `npm i`
- run app using `npm run dev`
- App running on `http://localhost:3000/` .



The actual GIT Upload project working local is D:\n\store-stocks-git
this has 2 parts 
1. the Next JS local UI that runs on the https://192.168.1.4:3000 as of July 11 2025 the IP of the machine is 192.168.1.4
2. verify the IP mentioned in the https://myapi.fyers.in/dashboard  MoneyFlow this is created for Local App Call Back 
3. the ip for the call back is https://fyersbook.netlify.app/.netlify/functions/netlifystockfyersbridge/api/fyerscallback as 
      of Updated : Updated date 15 Jun 2025 with following details and Permissions 
	App type: User App  	Webhook count:0 	App ID:P67RJAS1M6-100
        Secret ID:4LXEKKMFUL	
	Permissions:
	Profile Details, Transaction Info, Order Placement, Historical Data, Quotes & Market data

4. production App in https://myapi.fyers.in/dashboard is  GoodStoreSpread
		http://storenotify.in/.netlify/functions/netlifystockfyersbridge
	Created : Created date 18 Jan 2025
	Updated : Updated date 08 Jun 2025
	App type: User App  	Webhook count:0 	App ID:7GSQW68AZ4-100
        Secret ID:MGY8LRIY0M	
	Permissions:
	Profile Details, Transaction Info, Order Placement, Historical Data, Quotes & Market data
5.the local has to be build as follows
    D:\n\groww-task\npm run build 
	this will generate some \company\[slug] compile time pages 
    also when you start using npm run dev-ssl  it uses the dev-server.js  to start local in SSL using the IP as well 
6. Now for the Local Backend you have to run the following 
	netlify functions:build --functions dist/netlify/functions --src netlify/functions
	netlify dev 
		   the ssl and other configurations are already there in the netlify.toml file
9. all the routes are already in the D:\n\groww-task\netlify\functions\netlifystockfyersbridge\routes.js
	we refer the https://myapi.fyers.in/docsv3#tag/Transaction-Info/paths/~1Transaction%20Info/patch
	e.g the Curl Request Method curl -H "Authorization: app_id:access_token" https://api-t1.fyers.in/api/v3/tradebook

	const FyersAPI = require("fyers-api-v3").fyersModel
	var fyers = new FyersAPI({path:"/path/to/where/logs/to/be/saved"})
	// set appID
	fyers.setAppId("Qxxxxxx75-1xx")
	// set redirectURL
	fyers.setRedirectUrl("https://XXXXX.com")
	// set accessToken
	fyers.setAccessToken("eyJ0xxxx")
	fyers.get_tradebook().then((response)

10. Also there are all the post man dependency URL's D:\n\groww-task\screens\FYERS API V3
	ONce the access token , you receive by login into the app using 

	copy the access token from the Application tab in the Browser and place in the 
        Bruno Env variables 

	the following cRUL local requests also can be generated for the same 

	curl --insecure "https://fyersbook.netlify.app/.netlify/functions/netlifystockfyersbridge/api/fyersgetquote?	symbol=ICICIBANK&auth_code=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBfaWQiOiJUUkxWMkE2R1BMIiwidXVpZCI6IjBiNTc3ZGEyNDBlMzRkZWU4ZWY3NzliMGIwMTUyODU0IiwiaXBBZGRyIjoiIiwibm9uY2UiOiIiLCJzY29wZSI6IiIsImRpc3BsYXlfbmFtZSI6IlhWMzEzNjAiLCJvbXMiOiJLMSIsImhzbV9rZXkiOiIzMDMwZjNjMDM2ZTUxYmE2YWNmZDg1YjQyMWM0MGY1NmRiOTQwODFlZTBlYjJjMzY3ZGE5OTExYiIsImlzRGRwaUVuYWJsZWQiOiJOIiwiaXNNdGZFbmFibGVkIjoiTiIsImF1ZCI6IltcImQ6MVwiLFwiZDoyXCIsXCJ4OjBcIixcIng6MVwiLFwieDoyXCJdIiwiZXhwIjoxNzUwMDAyODkxLCJpYXQiOjE3NDk5NzI4OTEsImlzcyI6ImFwaS5sb2dpbi5meWVycy5pbiIsIm5iZiI6MTc0OTk3Mjg5MSwic3ViIjoiYXV0aF9jb2RlIn0.PSXdo9bSTyneoQHc69vuVREw7MZ7M0kDLB0txv38D2w&apikey='7GSQW68AZ4-100'"

{"message":"","code":200,"d":[{"n":"NSE:ICICIBANK-EQ","v":{"ask":0,"bid":1416.1,"chp":-0.64,"ch":-9.1,"description":"NSE:ICICIBANK-EQ","exchange":"NSE","fyToken":"10100000004963","high_price":1421.5,"low_price":1403.6,"lp":1416.1,"open_price":1403.6,"original_name":"NSE:ICICIBANK-EQ","prev_close_price":1425.2,"short_name":"ICICIBANK-EQ","spread":0,"symbol":"NSE:ICICIBANK-EQ","tt":"1749945600","volume":7573103,"atp":1413.66},"s":"ok"}],"s":"ok"}


	curl -H "Authorization: P67RJAS1M6-100:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBfaWQiOiJUUkxWMkE2R1BMIiwidXVpZCI6ImNiNWNkMjczOTY4OTQ1NmFiNmUzNTgxMjVjYWEwZGI2IiwiaXBBZGRyIjoiIiwibm9uY2UiOiIiLCJzY29wZSI6IiIsImRpc3BsYXlfbmFtZSI6IlhWMzEzNjAiLCJvbXMiOiJLMSIsImhzbV9rZXkiOiIzMDMwZjNjMDM2ZTUxYmE2YWNmZDg1YjQyMWM0MGY1NmRiOTQwODFlZTBlYjJjMzY3ZGE5OTExYiIsImlzRGRwaUVuYWJsZWQiOiJOIiwiaXNNdGZFbmFibGVkIjoiTiIsImF1ZCI6IltcImQ6MVwiLFwiZDoyXCIsXCJ4OjBcIixcIng6MVwiLFwieDoyXCJdIiwiZXhwIjoxNzUyNDQyNzExLCJpYXQiOjE3NTI0MTI3MTEsImlzcyI6ImFwaS5sb2dpbi5meWVycy5pbiIsIm5iZiI6MTc1MjQxMjcxMSwic3ViIjoiYXV0aF9jb2RlIn0.WpAUoc4663kqMgCMa6z9wMR5kwvV8RlxtkQ7oNCPYCc" https://api-t1.fyers.in/api/v3/tradebook




## 🚀 About Me

I'm Ram, a full stack developer skilled in MERN stack, React Native, and can do other stuff like,

- Chrome Extensions
- Telegram bots
- UI designing

npm run build
netlify functions:build --functions dist/netlify/functions --src netlify/functions

netlify functions:create --name netlifystockfyersbridge
netlify dev 
netlify dev  --live --port 8888 --host 192.168.1.4

netlify functions:invoke netlifystockfyersbridge --port 8888 --querystring "remoteUrl='/api/auth/google'&payLoad='{ \'username\': \"vvanvekar@gmail.com\",\'password\':\'123\'  }'}"


https://fyersbook.netlify.app/.netlify/functions/fyersticker?ticker=SENSEX

netlify functions:invoke netlifystockfyersbridge --port 8888 --querystring "remoteUrl='/api/auth/google'&payLoad='{ \'username\': \"vvanvekar@gmail.com\",\'password\':\'123\'  }'}"
netlify functions:invoke netlifyproxygoogleauth   --querystring "remoteUrl='/api/auth/google'&payLoad='{ \'username\': \"vvanvekar@gmail.com\",\'password\':\'123\'  }'}"
netlify functions:invoke netlifyproxygoogleauth  --port 3450 --querystring "remoteUrl='/api/auth/google'&payLoad='{ \'username\': \"vvanvekar@gmail.com\",\'password\':\'123\'  }'}"
netlify functions:invoke netlifyproxyphoneverify/api/verifycode --payload '{"phoneRegionCode": "IN","phoneNumber": "7588230462", "phoneVerificationMethod": "SMS","languageCode": "en-US"}'
netlify functions:invoke netlifyproxyphoneverify  --port 8888   --payload '{"phoneRegionCode": "IN","phoneNumber": "7588230462", "phoneVerificationMethod": "SMS","languageCode": "en-US"}'
netlify functions:invoke netlifyproxyphoneverify/api/phone/verifycode --payload '{"phoneRegionCode": "IN","phoneNumber": "7588230462", "phoneVerificationMethod": "SMS","languageCode": "en-US"}'


https://fyersbook.netlify.app/fyersticker?userId=123&roomId=456