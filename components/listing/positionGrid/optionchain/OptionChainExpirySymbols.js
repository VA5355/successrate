const expirySymbols = [

      /*  { id: "302418012", symbol: "NIFTY25O0724100CE", k: 180 },
    { id: "302418013", symbol: "NIFTY25O0724100PE", k: 40 },
    { id: "302418014", symbol: "NIFTY25O0724200PE", k: 360 },
    { id: "302418015", symbol: "NIFTY25O0724200CE", k: 60 },

    { id: "302418016", symbol: "NIFTY25O0724300CE", k: 180 },
    { id: "302418017", symbol: "NIFTY25O0724300PE", k: 40 },
    { id: "302418018", symbol: "NIFTY25O0724400PE", k: 360 },
    { id: "302418019", symbol: "NIFTY25O0724400CE", k: 60 },

     { id: "302418020", symbol: "NIFTY25O0724500CE", k: 180 },
    { id: "302418021", symbol: "NIFTY25O0724500PE", k: 40 },
    { id: "302418022", symbol: "NIFTY25O0724600PE", k: 360 },
    { id: "302418023", symbol: "NIFTY25O0724600CE", k: 60 },

    { id: "302418032", symbol: "NIFTY25O0724700CE", k: 180 },
    { id: "302418025", symbol: "NIFTY25O0724700PE", k: 40 },
    { id: "302418024", symbol: "NIFTY25O0724800PE", k: 360 },
    { id: "302418029", symbol: "NIFTY25O0724800CE", k: 60 } */
     { id: "302418011", symbol: "NIFTY-50", k: 2 },
      { id: "302418012", symbol: "NIFTY25D1624100CE", k: 180 },
    { id: "302518013", symbol: "NIFTY25D1625100PE", k: 40 },
    { id: "302418014", symbol: "NIFTY25D1625200PE", k: 360 },
    { id: "302418015", symbol: "NIFTY25D1625200CE", k: 60 },

    { id: "302418016", symbol: "NIFTY25D1625300CE", k: 180 },
    { id: "302418017", symbol: "NIFTY25D1625300PE", k: 40 },
    { id: "302418018", symbol: "NIFTY25D1625400PE", k: 360 },
    { id: "302418019", symbol: "NIFTY25D1625400CE", k: 60 },

     { id: "302418020", symbol: "NIFTY25D1625500CE", k: 180 },
    { id: "302418021", symbol: "NIFTY25D1625500PE", k: 40 },
    { id: "302418022", symbol: "NIFTY25D1625600PE", k: 360 },
    { id: "302518023", symbol: "NIFTY25D1625600CE", k: 60 },

    { id: "302418032", symbol: "NIFTY25D1625700CE", k: 180 },
    { id: "302418025", symbol: "NIFTY25D1625700PE", k: 40 },
    { id: "302418024", symbol: "NIFTY25D1625800PE", k: 360 },
    { id: "302418029", symbol: "NIFTY25D1625800CE", k: 60 },
    	
        { id: "302419032", symbol: "NIFTY25D1625900CE", k: 180 },
    { id: "302419025", symbol: "NIFTY25D1625900PE", k: 40 },
    { id: "302419024", symbol: "NIFTY25D1626000PE", k: 360 },
    { id: "302419029", symbol: "NIFTY25D1626000CE", k: 60 },
    			
    	 { id: "302420032", symbol: "NIFTY25D1626050CE", k: 180 },
    { id: "302420025", symbol: "NIFTY25D1626050PE", k: 40 },
    { id: "302420024", symbol: "NIFTY25D1626100PE", k: 360 },
     { id: "302420029", symbol: "NIFTY25D1626100CE", k: 60 },

    { id: "302430001", symbol: "NIFTY25D2325400CE", k: 12 },
  { id: "302430002", symbol: "NIFTY25D2325400PE", k: 18 },

  { id: "302430003", symbol: "NIFTY25D2325500CE", k: 22 },
  { id: "302430004", symbol: "NIFTY25D2325500PE", k: 28 },

  { id: "302430005", symbol: "NIFTY25D2325600CE", k: 35 },
  { id: "302430006", symbol: "NIFTY25D2325600PE", k: 42 },

  { id: "302430007", symbol: "NIFTY25D2325700CE", k: 48 },
  { id: "302430008", symbol: "NIFTY25D2325700PE", k: 52 },

  { id: "302430009", symbol: "NIFTY25D2325800CE", k: 55 },
  { id: "302430010", symbol: "NIFTY25D2325800PE", k: 58 },

  { id: "302430011", symbol: "NIFTY25D2325900CE", k: 60 },
  { id: "302430012", symbol: "NIFTY25D2325900PE", k: 63 },

  { id: "302430013", symbol: "NIFTY25D2326000CE", k: 65 },
  { id: "302430014", symbol: "NIFTY25D2326000PE", k: 68 },

  { id: "302430015", symbol: "NIFTY25D2326100CE", k: 70 },
  { id: "302430016", symbol: "NIFTY25D2326100PE", k: 72 },

  { id: "302430017", symbol: "NIFTY25D2326200CE", k: 75 },
  { id: "302430018", symbol: "NIFTY25D2326200PE", k: 78 },

  { id: "302430019", symbol: "NIFTY25D2326300CE", k: 82 },
  { id: "302430020", symbol: "NIFTY25D2326300PE", k: 85 },

  { id: "302430021", symbol: "NIFTY25D2326400CE", k: 90 },
  { id: "302430022", symbol: "NIFTY25D2326400PE", k: 95 },

    { id: "302440001", symbol: "NIFTY25D3025400CE", k: 12 },
  { id: "302440002", symbol: "NIFTY25D3025400PE", k: 18 },

  { id: "302440003", symbol: "NIFTY25D3025500CE", k: 22 },
  { id: "302440004", symbol: "NIFTY25D3025500PE", k: 28 },

  { id: "302440005", symbol: "NIFTY25D3025600CE", k: 35 },
  { id: "302440006", symbol: "NIFTY25D3025600PE", k: 42 },

  { id: "302440007", symbol: "NIFTY25D3025700CE", k: 48 },
  { id: "302440008", symbol: "NIFTY25D3025700PE", k: 52 },

  { id: "302440009", symbol: "NIFTY25D3025800CE", k: 55 },
  { id: "302440010", symbol: "NIFTY25D3025800PE", k: 58 },

  { id: "302440011", symbol: "NIFTY25D3025900CE", k: 60 },
  { id: "302440012", symbol: "NIFTY25D3025900PE", k: 63 },

  { id: "302440013", symbol: "NIFTY25D3026000CE", k: 65 },
  { id: "302440014", symbol: "NIFTY25D3026000PE", k: 68 },

  { id: "302440015", symbol: "NIFTY25D3026100CE", k: 70 },
  { id: "302440016", symbol: "NIFTY25D3026100PE", k: 72 },

  { id: "302440017", symbol: "NIFTY25D3026200CE", k: 75 },
  { id: "302440018", symbol: "NIFTY25D3026200PE", k: 78 },

  { id: "302440019", symbol: "NIFTY25D3026300CE", k: 82 },
  { id: "302440020", symbol: "NIFTY25D3026300PE", k: 85 },

  { id: "302440021", symbol: "NIFTY25D3026400CE", k: 90 },
  { id: "302440022", symbol: "NIFTY25D3026400PE", k: 95 },

   { id: "302449999", symbol: "NIFTY26J0625400CE", k: 12 },
  { id: "302450000", symbol: "NIFTY26J0625400PE", k: 18 },

     { id: "302450001", symbol: "NIFTY26J0625500CE", k: 13 },
  { id: "302450002", symbol: "NIFTY26J0625500PE", k: 23 },
     { id: "302450003", symbol: "NIFTY26J0625600CE", k: 15 },
  { id: "302450004", symbol: "NIFTY26J0625600PE", k: 21 },
   { id: "302450005", symbol: "NIFTY26J0625700CE", k: 44 },
  { id: "302450006", symbol: "NIFTY26J0625700PE", k: 11 },

   { id: "302450007", symbol: "NIFTY26J0625800CE", k: 54 },
  { id: "302450008", symbol: "NIFTY26J0625800PE", k: 62 },

    { id: "302450009", symbol: "NIFTY26J0625900CE", k: 44 },
  { id: "302450010", symbol: "NIFTY26J0625900PE", k: 11 },

      { id: "302450011", symbol: "NIFTY26J0626000CE", k: 44 },
  { id: "302450012", symbol: "NIFTY26J0626000PE", k: 11 },
  { id: "302450013", symbol: "NIFTY26J0626100CE", k: 44 },
  { id: "302450014", symbol: "NIFTY26J0626100PE", k: 11 },
  { id: "302450015", symbol: "NIFTY26J0626200CE", k: 44 },
  { id: "302450016", symbol: "NIFTY26J0626200PE", k: 11 },
    { id: "302450017", symbol: "NIFTY26J0626300CE", k: 44 },
  { id: "302450018", symbol: "NIFTY26J0626300PE", k: 11 },


  { id: "302450021", symbol: "NIFTY26J0626400CE", k: 90 },
  { id: "302450022", symbol: "NIFTY26J0626400PE", k: 95 },
 // 13 
 { id: "302459999", symbol: "NIFTY26J1325400CE", k: 12 },
  { id: "302460000", symbol: "NIFTY26J1325400PE", k: 18 },

    { id: "302460001", symbol: "NIFTY26J1325500CE", k: 13 },
  { id: "302460002", symbol: "NIFTY26J1325500PE", k: 23 },
     { id: "302460003", symbol: "NIFTY26J1325600CE", k: 15 },
  { id: "302460004", symbol: "NIFTY26J1325600PE", k: 21 },
   { id: "302460005", symbol: "NIFTY26J1325700CE", k: 44 },
  { id: "302460006", symbol: "NIFTY26J1325700PE", k: 11 },

   { id: "302460007", symbol: "NIFTY26J1325800CE", k: 54 },
  { id: "302460008", symbol: "NIFTY26J1325800PE", k: 62 },

    { id: "302460009", symbol: "NIFTY26J1325900CE", k: 44 },
  { id: "302460010", symbol: "NIFTY26J1325900PE", k: 11 },

      { id: "302460011", symbol: "NIFTY26J1326000CE", k: 44 },
  { id: "302460012", symbol: "NIFTY26J1326000PE", k: 11 },
  { id: "302460013", symbol: "NIFTY26J1326100CE", k: 44 },
  { id: "302460014", symbol: "NIFTY26J1326100PE", k: 11 },
  { id: "302460015", symbol: "NIFTY26J1326200CE", k: 44 },
  { id: "302460016", symbol: "NIFTY26J1326200PE", k: 11 },
    { id: "302460017", symbol: "NIFTY26J1326300CE", k: 44 },
  { id: "302460018", symbol: "NIFTY26J1326300PE", k: 11 },


  { id: "302460021", symbol: "NIFTY26J1326400CE", k: 90 },
  { id: "302460022", symbol: "NIFTY26J1326400PE", k: 95 },
//20
    { id: "302469999", symbol: "NIFTY26J2025400CE", k: 12 },
  { id: "302470000", symbol: "NIFTY26J2025400PE", k: 18 },
//--
{ id: "302470001", symbol: "NIFTY26J2025400CE", k: 12 },
  { id: "302470002", symbol: "NIFTY26J2025400PE", k: 18 },

    { id: "302470001", symbol: "NIFTY26J2025500CE", k: 13 },
  { id: "302470002", symbol: "NIFTY26J2025500PE", k: 23 },
     { id: "302470003", symbol: "NIFTY26J2025600CE", k: 15 },
  { id: "302470004", symbol: "NIFTY26J2025600PE", k: 21 },
   { id: "302470005", symbol: "NIFTY26J2025700CE", k: 44 },
  { id: "302470006", symbol: "NIFTY26J2025700PE", k: 11 },

   { id: "302470007", symbol: "NIFTY26J2025800CE", k: 54 },
  { id: "302470008", symbol: "NIFTY26J2025800PE", k: 62 },

    { id: "302470009", symbol: "NIFTY26J2025900CE", k: 44 },
  { id: "302470010", symbol: "NIFTY26J2025900PE", k: 11 },

      { id: "302470011", symbol: "NIFTY26J2026000CE", k: 44 },
  { id: "302470012", symbol: "NIFTY26J2026000PE", k: 11 },
  { id: "302470013", symbol: "NIFTY26J2026100CE", k: 44 },
  { id: "302470014", symbol: "NIFTY26J2026100PE", k: 11 },
  { id: "302470015", symbol: "NIFTY26J2026200CE", k: 44 },
  { id: "302470016", symbol: "NIFTY26J2026200PE", k: 11 },
    { id: "302470017", symbol: "NIFTY26J2026300CE", k: 44 },
  { id: "302470018", symbol: "NIFTY26J2026300PE", k: 11 },
//--
  { id: "302470021", symbol: "NIFTY26J2026400CE", k: 90 },
  { id: "302470022", symbol: "NIFTY26J2026400PE", k: 95 },

  //30
      { id: "302479999", symbol: "NIFTY26J2725400CE", k: 12 },
  { id: "302480000", symbol: "NIFTY26J2725400PE", k: 18 },

{ id: "302480001", symbol: "NIFTY26J2725400CE", k: 12 },
  { id: "302480002", symbol: "NIFTY26J2725400PE", k: 18 },

    { id: "302480001", symbol: "NIFTY26J2725500CE", k: 13 },
  { id: "302480002", symbol: "NIFTY26J2725500PE", k: 23 },
     { id: "302480003", symbol: "NIFTY26J2725600CE", k: 15 },
  { id: "302480004", symbol: "NIFTY26J2725600PE", k: 21 },
   { id: "302480005", symbol: "NIFTY26J2725700CE", k: 44 },
  { id: "302480006", symbol: "NIFTY26J2725700PE", k: 11 },

   { id: "302480007", symbol: "NIFTY26J2725800CE", k: 54 },
  { id: "302480008", symbol: "NIFTY26J2725800PE", k: 62 },

    { id: "302480009", symbol: "NIFTY26J2725900CE", k: 44 },
  { id: "302480010", symbol: "NIFTY26J2725900PE", k: 11 },

      { id: "302480011", symbol: "NIFTY26J2726000CE", k: 44 },
  { id: "302480012", symbol: "NIFTY26J2726000PE", k: 11 },
  { id: "302480013", symbol: "NIFTY26J2726100CE", k: 44 },
  { id: "302480014", symbol: "NIFTY26J2726100PE", k: 11 },
  { id: "302480015", symbol: "NIFTY26J2726200CE", k: 44 },
  { id: "302480016", symbol: "NIFTY26J2726200PE", k: 11 },
    { id: "302480017", symbol: "NIFTY26J2726300CE", k: 44 },
  { id: "302480018", symbol: "NIFTY26J2726300PE", k: 11 },


  { id: "302480021", symbol: "NIFTY26J2726400CE", k: 90 },
  { id: "302480022", symbol: "NIFTY26J2726400PE", k: 95 },
    
  ];
 
  export default expirySymbols;

  