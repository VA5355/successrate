import React, { useEffect, useRef, useState, useReducer } from 'react';
import { setConnected, setSymbols ,setSpot ,setSubscriptionFailure,setOptions } from '@/redux/slices/webSocketSlice';
import { useDispatch } from "react-redux";
// Custom WebSocket hook for connecting to the server and updating state
export default function   useWebSocketStream   (url, dispatch)  {
    const ws = useRef(null);
     // const dispatch = useDispatch();

     const [stateOptionMap , setStateOptionsMap ] = useState( (state) => state?.websocket?.symbols);
     const [optionsMap , setOptionsMap ] = useState(null);
    const [strikeMap , setStrikeMap ] = useState(null);
    useEffect(() => {
        // Initialize WebSocket connection
        ws.current = new WebSocket(url);
         let optionsMap = new Map();
            let strikeMapSymbol = new Map();    
         let symbolsMap = new Map();
         let symbolsStrikeWiseMap =[];
        /**
         * Parses the WebSocket response and extracts option contracts into a Map.
         * @param {string} jsonResponse The raw JSON string from the WebSocket.
         * @returns {Map<string, string> | null} A Map of option IDs to their names, or null if parsing fails.
         */
        function getOptionsMapFromResponse(jsonResponse) {
        try { 
            const data =  jsonResponse ; //JSON.parse(jsonResponse); already parsed 
                  
            // Check if the symbollist exists and is an array
            if (data && data.symbollist && Array.isArray(data.symbollist)) {
            data.symbollist.forEach(symbol => {
                const name = symbol[0];
                const id = symbol[1];

                // Check if the symbol name indicates it's an option (ends with CE or PE)
                if (typeof name === 'string' && (name.endsWith('CE') || name.endsWith('PE'))) {
                // Tag the option with its unique ID and name
                optionsMap.set(id, name);
                 strikeMapSymbol.set (id+"_"+name , symbol)    
                }

            });
            }
             if (optionsMap !==null){
                    // Check if the Map is empty
                    if (optionsMap.size === 0) {
                          console.log("The optionsMap is empty.");
                    } else {
                        setOptionsMap(optionsMap)
                       /* setStrikeMap.forEach((value, key) => {
                         console.log(`ID: ${key}, Symbol: ${value}`);
                          

                        });*/
                         // setStrikeMap(strikeMapSymbol)
                     //      console.log("The OPTIONS data OSTRIKE KEYS FETCH by uniqui id ");
                    }
             }
            return optionsMap;

        } catch (error) {
            console.error("Failed to parse JSON response:", error);
            return null;
        }
        }

        // On successful connection, send the subscription request
        ws.current.onopen = () => {
            console.log('WebSocket connection opened.');
           // dispatch({ type: 'SET_LOADING', payload: true });
            dispatch(setConnected(true));
            // Request to add symbols for live data
            const request = {
                method: 'addsymbol',
                symbols:  ['NIFTY 50', 'NIFTY25100724100CE', 'NIFTY25100724100PE' , 'NIFTY25100724200CE', 'NIFTY25100724200PE', 
                    'NIFTY25100724300CE' , 'NIFTY25100724300PE','NIFTY25100724400CE' , 'NIFTY25100724400PE',
                'NIFTY25100724500CE' , 'NIFTY25100724500PE','NIFTY25100724600CE' , 'NIFTY25100724600PE' ,
                'NIFTY25100724700CE' , 'NIFTY25100724700PE','NIFTY25O0724800PE' , 'NIFTY25O0724800CE']
            };
            ws.current.send(JSON.stringify(request));
        };

        // On receiving a message from the server
        ws.current.onmessage = (event) => {
            try {
                const response = JSON.parse(event.data);
                /*
                {"success":true,"message":"symbols added","symbolsadded":7,"symbollist":[["NIFTY 50","200000001","2025-09-22T10:46:33","25311","0","0","0","25238.1","25331.7","25211.6","25327.05","0","0","0","0","0","0","0"],
                ["NIFTY25093025200CE","302418028","2025-09-22T10:46:32","249","75","229.46","2506800","236","257.1","192.2","276.9","2420850","2367300","0","247.1","225","247.65","300"],
                ["NIFTY25093025200PE","302418029","2025-09-22T10:46:32","68.5","4650","77.67","5248200","62","96","62","66.15","3155100","2599350","0","68.45","225","68.65","900"],
                ["NIFTY25093025100CE","302418024","2025-09-22T10:46:33","328.3","75","304.99","548850","320","336.45","264.2","361.3","1134750","1109625","0","325.35","75","326.45","150"],
                ["NIFTY25093025100PE","302418025","2025-09-22T10:46:33","46.75","300","53.25","3284475","58","66","44.3","46.15","3565275","2832750","0","46.65","150","46.8","1650"],
                ["NIFTY25093025300CE","302418032","2025-09-22T10:46:34","179.8","750","167.99","6335250","172.15","188.9","134","206.95","2951100","2149650","0","180.3","375","180.7","675"],
                ["NIFTY25093025300PE","302418033","2025-09-22T10:46:34","100.95","2400","111.07","7474875","105.1","137.4","96.05","94.75","3718725","2838375","0","100.8","150","101.05","450"]],
                "totalsymbolsubscribed":7}
                */
                // above is the initial message where every OPTION get's a unique HASH ID like 302418028 for NIFTY25093025200CE
                // pasre this resposne 
                // {"success":false,"message":"User Already Connected","segments":null,"maxsymbols":0,"subscription":null,"validity":"0001-01-01T00:00:00"}	
                const status = response?.success;
                if (status ==  false && response?.subscription  == null  ){ 
                    console.log("true data subscription failure ");
                     dispatch(setSubscriptionFailure( "Subscription or streaming failed ")); 
                }
                const options = getOptionsMapFromResponse(response);
                Array.from(options.entries()).map(([key, value]) => {  
                                symbolsMap.set(key , []);
                              });
                              symbolsStrikeWiseMap = [];
                if (options instanceof Map && options.size > 0) {
                  // console.log("optionsMap is a Map.");
                   // Get an array of just the values
                    const valuesArray = Array.from(options.values());
                   if(valuesArray.length > 0 ){
                    
                      dispatch(setOptions(valuesArray  )); 
                    // console.log("OPTIONS FROM TRUE DATA option map: " );
                    //  console.log( options );
                   }
                 
                } else {
                  console.log("optionsMap is not a Map.");
                }

               /* if(Map.isMa(options) && options.length >0){
                    dispatch(setOptions(options  )); 
                     console.log("OPTIONS FROM TRUE DATA " + JSON.stringify(options));
                }*/
                /* process this response 
                   { "trade":["200000001","2025-09-22T09:10:54","25238.1","0","0","0","25238.1","25238.1","25238.1","25327.05","0","0","0","O","1310","0","0","0","0"]  }
                    {"bidask":["302418028","2025-09-22T10:46:34","247.35","300","248","675"]}	
                    */
                if (strikeMapSymbol !==null && strikeMapSymbol !== undefined){
                   // setStrikeMap(strikeMapSymbol);
                }
                if (strikeMapSymbol !==null && strikeMapSymbol !== undefined){
                      if (response.trade !==null && response.trade !== undefined){
                       //  console.log(` response trade `);
                            let temp  =stateOptionMap !==undefined && Array.isArray(stateOptionMap) && 
                                        stateOptionMap.length > 0 ? stateOptionMap: [];
                            let s= response.trade;
                            let sym = {
                                          strike: s[0],
                                           /* expiry : s[0].slice(5, 11),
                                            type: s[0].slice(-2),
                                            strikeNumber: s[0].slice(11, -2),*/
                                            id : s[0],
                                            timestamp: s[1],
                                            ltp: s[2],
                                            bid: s[4],
                                            ask: s[6],
                                            volume: s[3],
                                        }
                           //  console.log(` trade  sym  ${JSON.stringify(sym)}`);  
                             
                             
                            // 1. Create a single Map from the existing symbols for efficient lookups. Array.from(options.entries())
                                                  
                                 symbolsMap.set( options.get(sym.id) , sym);
                              /*
                               Array.from(options.entries()).map(([key, value]) => {
                                if (key === sym.id) {
                                console.log(`trade key ${key}`);
                                return [key, sym]; // must return [key, value] pair for Map
                                } else {
                                return [key, []]; // keep original entry
                                }}) 
                              */
                            // console.log(` trade  symbolsMap  ${JSON.stringify(Array.from(symbolsMap.entries()))}`);               
                            // 2. Iterate through the new payload and update the Map.
                            // This will add new symbols and update existing ones.
                            temp.forEach((newSymbol) => {
                                // Merging old and new data. This is crucial for updating existing symbols.
                                let   strike = newSymbol.strike.slice(11);
                                let strikN  =  strike.slice(-2)
                                    
                                const updateInSymbol  = {...newSymbol.strikeNumber =strikN }

                                const updatedSymbol = { ...symbolsMap.get(newSymbol.id), ...updateInSymbol };
                                symbolsMap.set(newSymbol.id, updatedSymbol);
                                 console.log(` trade match `);
                            });
                            // 3. Convert the Map's values back into an array to update the state.
                            let stateSymbols =Array.from(symbolsMap.entries()).map(([key, value]) => {
                              //  console.log(` ${key}, ${JSON.stringify(value)} `)
                                if(key !== null && key !== undefined){
                               //  console.log(` ${key}, expiry: ${key.slice(5, 11)}, 
                              //     type:  ${key.slice(-2)}, strikeNumber: ${key.slice(11, -2)}`);



                                   let t = {
                                ...value,
                                strike: key,
                                name : key,
                                expiry: key.slice(5, 11),
                                type: key.slice(-2),
                                strikeNumber: key.slice(11, -2)
                                };
                                symbolsStrikeWiseMap.push(t);
                                return t;
                                 }
                                 
                                } );
                            
                             //console.log(` stateSymbols, ${JSON.stringify(stateSymbols)} `)
                             
                            //Array.from(symbolsMap.values());

                            // Step 1: filter only NIFTY records
                            const niftyRecords = symbolsStrikeWiseMap.filter(item => item.strike.startsWith("NIFTY"));

                           
                          const niftyMap = new Map(
                                niftyRecords
                                   
                                    .map(item => [
                                    item.strike, 
                                    [
                                        item.name,
                                        item.id,
                                        item.timestamp,
                                        item.ltp,
                                        null, null, null,   // placeholders
                                        item.bid,
                                        item.ask,
                                        null, null,         // placeholders
                                        item.volume
                                    ]
                                    ])
                                );
                           // suppose niftyMap already exists (Map<name, valueArray>)
                            const sortedEntries = [...niftyMap.entries()].sort(([, a], [, b]) => {
                            // a[0] is name according to our value array structure
                            const strikeA = Number(a[0].slice(11, -2));
                            const strikeB = Number(b[0].slice(11, -2));

                            if (Number.isFinite(strikeA) && Number.isFinite(strikeB)) {
                                if (strikeA !== strikeB) return strikeA - strikeB;
                                // tie-break by type (CE before PE alphabetically)
                                const typeA = a[0].slice(-2), typeB = b[0].slice(-2);
                                return typeA.localeCompare(typeB);
                            }

                            // fallback: keep original order
                            return 0;
                            });
                            const sortedNiftyMap = new Map(sortedEntries);

                             setStrikeMap(sortedNiftyMap);
                          //  console.log(` strikeMap, ${JSON.stringify(sortedNiftyMap.entries())} `)
                            dispatch(setSymbols([stateSymbols])); 
                      }
                     if (response.bidask !==null && response.bidask !== undefined){
                        // console.log(` response bidask `);
                            let temp  =stateOptionMap;
                            let s= response.bidask;
                            let sym = {
                                          strikeNumber: s[0],
                                          timestamp: s[1],
                                            ltp: s[2],
                                            bid: s[3],
                                            ask: s[4],
                                            volume: s[5],
                                        }
                          // 1. Create a single Map from the existing symbols for efficient lookups.
                                  symbolsMap.set( options.get(sym.id) , sym);

                            // 2. Iterate through the new payload and update the Map.
                            // This will add new symbols and update existing ones.
                            if (temp !==undefined){   temp.forEach((newSymbol) => {
                                // Merging old and new data. This is crucial for updating existing symbols.
                                let   strike = newSymbol.strike.slice(11);
                                let strikN  =  strike.slice(-2)
                                    
                                const updateInSymbol  = {...newSymbol.strikeNumber =strikN }

                                const updatedSymbol = { ...symbolsMap.get(newSymbol.id), ...updateInSymbol };
                                symbolsMap.set(newSymbol.id, updatedSymbol);
                                 console.log(`bidask match `);
                            });}
                          
                            // 3. Convert the Map's values back into an array to update the state.
                            let stateSymbols = Array.from(symbolsMap.values());
                            dispatch(setSymbols([stateSymbols])); 
                          }
                      /*if (response.trade !==null && response.trade !== undefined){
                             let optTick = response.trade; let s= response.trade;
                            strikeMapSymbol.forEach(( value,key) => {
                             console.log(`ID: ${key}, Symbol: ${value}`);
                                   let id =     optTick[0];
                                 
                                   let sKey = key.split("_");
                                      console.log(`optTick[0]: ${id}  key: ${sKey[0]} `);
                                   if(sKey[0] === id ){
                                    let sym = {
                                          strike: s[0],
                                            expiry : s[0].slice(5, 6),
                                            type: s[0].slice(-2),
                                            strikeNumber: s[0].slice(11, -2),
                                            id : s[1],
                                            timestamp: s[2],
                                            ltp: s[3],
                                            bid: s[7],
                                            ask: s[8],
                                            volume: s[11],
                                        }
                                          console.log(` match `);
                                      dispatch(setSymbols([sym])); 
                                   }

                              });

                          }*/
                     if (response.bidask !==null && response.bidask !== undefined){
                           strikeMapSymbol.forEach((value, key) => {
                           //  console.log(`ID: ${key}, Symbol: ${value}`);


                              });
                          }
                     if ((response.bidask  ==null || response.bidask  == undefined )
                          && (response.trade  ==null ||  response.trade  == undefined ) ){
                        if(Array.isArray( response.symbollist)   )  {  
                         if(response.success==true && response.symbollist.length ==strikeMapSymbol.size  ){
                              console.log(`response.symbollist: `)
                                strikeMapSymbol.forEach((value, key) => {
                                   
                                   let sKey = key.split("_");
                                   if(sKey[0] !== null && sKey[1] !== undefined ){
                                    let sym = {
                                          strike: value[0],
                                            expiry : value[0].slice(5, 6),
                                            type: value[0].slice(-2),
                                             strikeNumber: value[0].slice(11, -2),
                                            id : value[1],
                                            timestamp: value[2],
                                            ltp: value[3],
                                            bid: value[7],
                                            ask: value[8],
                                            volume: value[11],
                                        }
                                       
                                      console.log(` Symbol: ${JSON.stringify([sym])}`);
                                      dispatch(setSymbols([sym])); 
                                   }

                              });
                            }
                         }  

                     }

                }
                if (response.symbollist) {
                    console.log('Received symbol data:', response.symbollist);
                    // Update state with the new symbol data
                    const formattedSymbols = response.symbollist.map(s => 
                        
                         ({
                        strike: s[0],
                        expiry : s[0].slice(5, 6),
                        type: s[0].slice(-2),
                         strikeNumber: s[0].slice(11, -2),
                         id : s[1],
                        timestamp: s[2],
                        ltp: s[3],
                        bid: s[7],
                        ask: s[8],
                        volume: s[11],
                    }));
                   // dispatch({ type: 'SET_SYMBOLS', payload: formattedSymbols });
                   // dispatch(setSymbols(formattedSymbols)); 
                    if(formattedSymbols[0] !== undefined){  
                   //  dispatch(setSpot(formattedSymbols[0]));
                    } 
                }
            } catch (e) {
                console.error('Failed to parse WebSocket message:', e);
               // dispatch({ type: 'SET_ERROR', payload: 'Failed to parse data from server.' });
               // dispatch(setSymbols([]));
            }
        };

        // On error
        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
           // dispatch({ type: 'SET_ERROR', payload: 'WebSocket connection error.' });
            dispatch(setConnected(false));
             dispatch(setSubscriptionFailure( "Subscription 'WebSocket error:' ")); 

        };

        // On connection close
        ws.current.onclose = () => {
            console.log('WebSocket connection closed.');
              dispatch(setConnected(false));
                dispatch(setSubscriptionFailure( "Subscription 'WebSocket connection closed:' ")); 
            //dispatch({ type: 'SET_LOADING', payload: false });
        };

        // Cleanup function
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [url, dispatch]);


     return { optionsMap, strikeMap };
};