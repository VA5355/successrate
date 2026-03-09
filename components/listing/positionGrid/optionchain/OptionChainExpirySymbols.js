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
 // MARCH SERIES 
  // Mar 10	
  { id: "302549989", symbol: "NIFTY26M1023100CE", k: 44 },
  { id: "302549990", symbol: "NIFTY26M1023100PE", k: 11 },
  { id: "302549991", symbol: "NIFTY26M1023200CE", k: 44 },
  { id: "302549992", symbol: "NIFTY26M1023200PE", k: 11 },
  { id: "302549993", symbol: "NIFTY26M1023300CE", k: 44 },
  { id: "302549994", symbol: "NIFTY26M1023300PE", k: 11 },
    { id: "302549995", symbol: "NIFTY26M1023400CE", k: 44 },
  { id: "302549996", symbol: "NIFTY26M1023400PE", k: 11 },


  { id: "302549997", symbol: "NIFTY26M1023500PE", k: 90 },
  { id: "302549998", symbol: "NIFTY26M1023500CE", k: 95 },


{ id: "302549999", symbol: "NIFTY26M1023600CE", k: 12 },
  { id: "302550000", symbol: "NIFTY26M1023600PE", k: 18 },

     { id: "302550001", symbol: "NIFTY26M1023700CE", k: 13 },
  { id: "302550002", symbol: "NIFTY26M1023700PE", k: 23 },
     { id: "302550003", symbol: "NIFTY26M1023800CE", k: 15 },
  { id: "302550004", symbol: "NIFTY26M1023800PE", k: 21 },
   { id: "302550005", symbol: "NIFTY26M1023900CE", k: 44 },
  { id: "302550006", symbol: "NIFTY26M1023900PE", k: 11 },

   { id: "302550007", symbol: "NIFTY26M1024100CE", k: 54 },
  { id: "302550008", symbol: "NIFTY26M1024100PE", k: 62 },

   { id: "302530007", symbol: "NIFTY26M1024200CE", k: 54 },
  { id: "302530008", symbol: "NIFTY26M1024200PE", k: 62 },

    { id: "302550009", symbol: "NIFTY26M1024300CE", k: 44 },
  { id: "302550010", symbol: "NIFTY26M1024300PE", k: 11 },

   { id: "402449999", symbol: "NIFTY26M1024400CE", k: 12 },
  { id: "402450000", symbol: "NIFTY26M1024400PE", k: 18 },

     { id: "402450001", symbol: "NIFTY26M1024500CE", k: 13 },
  { id: "402450002", symbol: "NIFTY26M1024500PE", k: 23 },
     { id: "402450003", symbol: "NIFTY26M1024600CE", k: 15 },
  { id: "402450004", symbol: "NIFTY26M1024600PE", k: 21 },
   { id: "402450005", symbol: "NIFTY26M1024700CE", k: 44 },
  { id: "402450006", symbol: "NIFTY26M1024700PE", k: 11 },

   { id: "402450007", symbol: "NIFTY26M1024800CE", k: 54 },
  { id: "402450008", symbol: "NIFTY26M1024800PE", k: 62 },

    { id: "402450009", symbol: "NIFTY26M1024900CE", k: 44 },
  { id: "402450010", symbol: "NIFTY26M1024900PE", k: 11 },

      { id: "402450011", symbol: "NIFTY26M1026000CE", k: 44 },
  { id: "402450012", symbol: "NIFTY26M1026000PE", k: 11 },
  { id: "402450013", symbol: "NIFTY26M1026100CE", k: 44 },
  { id: "402450014", symbol: "NIFTY26M1026100PE", k: 11 },
  { id: "402450015", symbol: "NIFTY26M1026200CE", k: 44 },
  { id: "402450016", symbol: "NIFTY26M1026200PE", k: 11 },
    { id: "402450017", symbol: "NIFTY26M1026300CE", k: 44 },
  { id: "402450018", symbol: "NIFTY26M1026300PE", k: 11 },


  { id: "402450021", symbol: "NIFTY26M1026400CE", k: 90 },
  { id: "402450022", symbol: "NIFTY26M1026400PE", k: 95 },
 // 17

   { id: "302550011", symbol: "NIFTY26M1723100CE", k: 44 },
  { id: "302550012", symbol: "NIFTY26M1723100PE", k: 11 },
  { id: "302550013", symbol: "NIFTY26M1723200CE", k: 44 },
  { id: "302550014", symbol: "NIFTY26M1723200PE", k: 11 },
  { id: "302550015", symbol: "NIFTY26M1723300CE", k: 44 },
  { id: "302550016", symbol: "NIFTY26M1723300PE", k: 11 },
    { id: "302550017", symbol: "NIFTY26M1723400CE", k: 44 },
  { id: "302550018", symbol: "NIFTY26M1723400PE", k: 11 },


  { id: "302550019", symbol: "NIFTY26M1723500PE", k: 90 },
  { id: "302550020", symbol: "NIFTY26M1723500CE", k: 95 },


{ id: "302550021", symbol: "NIFTY26M1723600CE", k: 12 },
  { id: "302550022", symbol: "NIFTY26M1723600PE", k: 18 },

     { id: "302550023", symbol: "NIFTY26M1723700CE", k: 13 },
  { id: "302550024", symbol: "NIFTY26M1723700PE", k: 23 },
     { id: "302550025", symbol: "NIFTY26M1723800CE", k: 15 },
  { id: "302550026", symbol: "NIFTY26M1723800PE", k: 21 },
   { id: "302550027", symbol: "NIFTY26M1723900CE", k: 44 },
  { id: "302550028", symbol: "NIFTY26M1723900PE", k: 11 },

   { id: "302550029", symbol: "NIFTY26M1724100CE", k: 54 },
  { id: "302550030", symbol: "NIFTY26M1724100PE", k: 62 },

   { id: "302530029", symbol: "NIFTY26M1724200CE", k: 54 },
  { id: "302530030", symbol: "NIFTY26M1724200PE", k: 62 },

    { id: "302550031", symbol: "NIFTY26M1724300CE", k: 44 },
  { id: "302550032", symbol: "NIFTY26M1724300PE", k: 11 },




 { id: "402459999", symbol: "NIFTY26M1724400CE", k: 12 },
  { id: "402460000", symbol: "NIFTY26M1724400PE", k: 18 },

    { id: "402460001", symbol: "NIFTY26M1724500CE", k: 13 },
  { id: "402460002", symbol: "NIFTY26M1724500PE", k: 23 },
     { id: "402460003", symbol: "NIFTY26M1724600CE", k: 15 },
  { id: "402460004", symbol: "NIFTY26M1724600PE", k: 21 },
   { id: "402460005", symbol: "NIFTY26M1724700CE", k: 44 },
  { id: "402460006", symbol: "NIFTY26M1724700PE", k: 11 },

   { id: "402460007", symbol: "NIFTY26M1724800CE", k: 54 },
  { id: "402460008", symbol: "NIFTY26M1724800PE", k: 62 },

    { id: "402460009", symbol: "NIFTY26M1724900CE", k: 44 },
  { id: "402460010", symbol: "NIFTY26M1724900PE", k: 11 },

      { id: "402460011", symbol: "NIFTY26M1726000CE", k: 44 },
  { id: "402460012", symbol: "NIFTY26M1726000PE", k: 11 },
  { id: "402460013", symbol: "NIFTY26M1726100CE", k: 44 },
  { id: "402460014", symbol: "NIFTY26M1726100PE", k: 11 },
  { id: "402460015", symbol: "NIFTY26M1726200CE", k: 44 },
  { id: "402460016", symbol: "NIFTY26M1726200PE", k: 11 },
    { id: "402460017", symbol: "NIFTY26M1726300CE", k: 44 },
  { id: "402460018", symbol: "NIFTY26M1726300PE", k: 11 },


  { id: "402460021", symbol: "NIFTY26M1726400CE", k: 90 },
  { id: "402460022", symbol: "NIFTY26M1726400PE", k: 95 },
//24

 { id: "302550033", symbol: "NIFTY26M2423100CE", k: 44 },
  { id: "302550034", symbol: "NIFTY26M2423100PE", k: 11 },
  { id: "302550035", symbol: "NIFTY26M2423200CE", k: 44 },
  { id: "302550036", symbol: "NIFTY26M2423200PE", k: 11 },
  { id: "302550037", symbol: "NIFTY26M2423300CE", k: 44 },
  { id: "302550038", symbol: "NIFTY26M2423300PE", k: 11 },
    { id: "302550039", symbol: "NIFTY26M2423400CE", k: 44 },
  { id: "302550040", symbol: "NIFTY26M2423400PE", k: 11 },


  { id: "302550041", symbol: "NIFTY26M2423500PE", k: 90 },
  { id: "302550042", symbol: "NIFTY26M2423500CE", k: 95 },


{ id: "302550043", symbol: "NIFTY26M2423600CE", k: 12 },
  { id: "302550044", symbol: "NIFTY26M2423600PE", k: 18 },

     { id: "302550045", symbol: "NIFTY26M2423700CE", k: 13 },
  { id: "302550046", symbol: "NIFTY26M2423700PE", k: 23 },
     { id: "302550047", symbol: "NIFTY26M2423800CE", k: 15 },
  { id: "302550048", symbol: "NIFTY26M2423800PE", k: 21 },
   { id: "302550049", symbol: "NIFTY26M2423900CE", k: 44 },
  { id: "302550050", symbol: "NIFTY26M2423900PE", k: 11 },

   { id: "302550051", symbol: "NIFTY26M2424100CE", k: 54 },
  { id: "302550052", symbol: "NIFTY26M2424100PE", k: 62 },
     { id: "302530051", symbol: "NIFTY26M2424200CE", k: 54 },
  { id: "302530052", symbol: "NIFTY26M2424200PE", k: 62 },

    { id: "302550053", symbol: "NIFTY26M2424300CE", k: 44 },
  { id: "302550054", symbol: "NIFTY26M2424300PE", k: 11 },


    { id: "402469999", symbol: "NIFTY26M2424400CE", k: 12 },
  { id: "402470000", symbol: "NIFTY26M2424400PE", k: 18 },
//--
{ id: "402470001", symbol: "NIFTY26M2424400CE", k: 12 },
  { id: "402470002", symbol: "NIFTY26M2424400PE", k: 18 },

    { id: "402470001", symbol: "NIFTY26M2424500CE", k: 13 },
  { id: "402470002", symbol: "NIFTY26M2424500PE", k: 23 },
     { id: "402470003", symbol: "NIFTY26M2424600CE", k: 15 },
  { id: "402470004", symbol: "NIFTY26M2424600PE", k: 21 },
   { id: "402470005", symbol: "NIFTY26M2424700CE", k: 44 },
  { id: "402470006", symbol: "NIFTY26M2424700PE", k: 11 },

   { id: "402470007", symbol: "NIFTY26M2424800CE", k: 54 },
  { id: "402470008", symbol: "NIFTY26M2424800PE", k: 62 },

    { id: "402470009", symbol: "NIFTY26M2424900CE", k: 44 },
  { id: "402470010", symbol: "NIFTY26M2424900PE", k: 11 },

      { id: "402470011", symbol: "NIFTY26M2426000CE", k: 44 },
  { id: "402470012", symbol: "NIFTY26M2426000PE", k: 11 },
  { id: "402470013", symbol: "NIFTY26M2426100CE", k: 44 },
  { id: "402470014", symbol: "NIFTY26M2426100PE", k: 11 },
  { id: "402470015", symbol: "NIFTY26M2426200CE", k: 44 },
  { id: "402470016", symbol: "NIFTY26M2426200PE", k: 11 },
    { id: "402470017", symbol: "NIFTY26M2426300CE", k: 44 },
  { id: "402470018", symbol: "NIFTY26M2426300PE", k: 11 },
//--
  { id: "402470021", symbol: "NIFTY26M2426400CE", k: 90 },
  { id: "402470022", symbol: "NIFTY26M2426400PE", k: 95 },

  //31

   { id: "302550055", symbol: "NIFTY26M3123100CE", k: 44 },
  { id: "302550056", symbol: "NIFTY26M3123100PE", k: 11 },
  { id: "302550057", symbol: "NIFTY26M3123200CE", k: 44 },
  { id: "302550058", symbol: "NIFTY26M3123200PE", k: 11 },
  { id: "302550059", symbol: "NIFTY26M3123300CE", k: 44 },
  { id: "302550060", symbol: "NIFTY26M3123300PE", k: 11 },
    { id: "302550061", symbol: "NIFTY26M3123400CE", k: 44 },
  { id: "302550062", symbol: "NIFTY26M3123400PE", k: 11 },


  { id: "302550063", symbol: "NIFTY26M3123500PE", k: 90 },
  { id: "302550064", symbol: "NIFTY26M3123500CE", k: 95 },


{ id: "302550065", symbol: "NIFTY26M3123600CE", k: 12 },
  { id: "302550066", symbol: "NIFTY26M3123600PE", k: 18 },

     { id: "302550067", symbol: "NIFTY26M3123700CE", k: 13 },
  { id: "302550068", symbol: "NIFTY26M3123700PE", k: 23 },
     { id: "302550069", symbol: "NIFTY26M3123800CE", k: 15 },
  { id: "302550070", symbol: "NIFTY26M3123800PE", k: 21 },
   { id: "302550071", symbol: "NIFTY26M3123900CE", k: 44 },
  { id: "302550072", symbol: "NIFTY26M3123900PE", k: 11 },

   { id: "302550073", symbol: "NIFTY26M3124100CE", k: 54 },
  { id: "302550074", symbol: "NIFTY26M3124100PE", k: 62 },
     { id: "302550075", symbol: "NIFTY26M3124200CE", k: 54 },
  { id: "302550076", symbol: "NIFTY26M3124200PE", k: 62 },

    { id: "302550077", symbol: "NIFTY26M3124300CE", k: 44 },
  { id: "302550078", symbol: "NIFTY26M3124300PE", k: 11 },



      { id: "402479999", symbol: "NIFTY26M3124400CE", k: 12 },
  { id: "402480000", symbol: "NIFTY26M3124400PE", k: 18 },

{ id: "402480001", symbol: "NIFTY26M3124400CE", k: 12 },
  { id: "402480002", symbol: "NIFTY26M3124400PE", k: 18 },

    { id: "402480001", symbol: "NIFTY26M3124500CE", k: 13 },
  { id: "402480002", symbol: "NIFTY26M3124500PE", k: 23 },
     { id: "402480003", symbol: "NIFTY26M3124600CE", k: 15 },
  { id: "402480004", symbol: "NIFTY26M3124600PE", k: 21 },
   { id: "402480005", symbol: "NIFTY26M3124700CE", k: 44 },
  { id: "402480006", symbol: "NIFTY26M3124700PE", k: 11 },

   { id: "402480007", symbol: "NIFTY26M3124800CE", k: 54 },
  { id: "402480008", symbol: "NIFTY26M3124800PE", k: 62 },

    { id: "402480009", symbol: "NIFTY26M3124900CE", k: 44 },
  { id: "402480010", symbol: "NIFTY26M3124900PE", k: 11 },

      { id: "402480011", symbol: "NIFTY26M3126000CE", k: 44 },
  { id: "402480012", symbol: "NIFTY26M3126000PE", k: 11 },
  { id: "402480013", symbol: "NIFTY26M3126100CE", k: 44 },
  { id: "402480014", symbol: "NIFTY26M3126100PE", k: 11 },
  { id: "402480015", symbol: "NIFTY26M3126200CE", k: 44 },
  { id: "402480016", symbol: "NIFTY26M3126200PE", k: 11 },
    { id: "402480017", symbol: "NIFTY26M3126300CE", k: 44 },
  { id: "402480018", symbol: "NIFTY26M3126300PE", k: 11 },


  { id: "402480021", symbol: "NIFTY26M3126400CE", k: 90 },
  { id: "402480022", symbol: "NIFTY26M3126400PE", k: 95 },

// APRIL SERIES 

// Apr 07	
   { id: "402549999", symbol: "NIFTY26A0724400CE", k: 12 },
  { id: "402550000", symbol: "NIFTY26A0724400PE", k: 18 },

     { id: "402550001", symbol: "NIFTY26A0724500CE", k: 13 },
  { id: "402550002", symbol: "NIFTY26A0724500PE", k: 23 },
     { id: "402550003", symbol: "NIFTY26A0724600CE", k: 15 },
  { id: "402550004", symbol: "NIFTY26A0724600PE", k: 21 },
   { id: "402550005", symbol: "NIFTY26A0724700CE", k: 44 },
  { id: "402550006", symbol: "NIFTY26A0724700PE", k: 11 },

   { id: "402550007", symbol: "NIFTY26A0724800CE", k: 54 },
  { id: "402550008", symbol: "NIFTY26A0724800PE", k: 62 },

    { id: "402550009", symbol: "NIFTY26A0724900CE", k: 44 },
  { id: "402550010", symbol: "NIFTY26A0724900PE", k: 11 },

      { id: "402550011", symbol: "NIFTY26A0726000CE", k: 44 },
  { id: "402550012", symbol: "NIFTY26A0726000PE", k: 11 },
  { id: "402550013", symbol: "NIFTY26A0726100CE", k: 44 },
  { id: "402550014", symbol: "NIFTY26A0726100PE", k: 11 },
  { id: "402550015", symbol: "NIFTY26A0726200CE", k: 44 },
  { id: "402550016", symbol: "NIFTY26A0726200PE", k: 11 },
    { id: "402550017", symbol: "NIFTY26A0726300CE", k: 44 },
  { id: "402550018", symbol: "NIFTY26A0726300PE", k: 11 },


  { id: "402550021", symbol: "NIFTY26A0726400CE", k: 90 },
  { id: "402550022", symbol: "NIFTY26A0726400PE", k: 95 },
 // 14
 { id: "402559999", symbol: "NIFTY26M1724400CE", k: 12 },
  { id: "402560000", symbol: "NIFTY26M1724400PE", k: 18 },

    { id: "402560001", symbol: "NIFTY26M1724500CE", k: 13 },
  { id: "402560002", symbol: "NIFTY26M1724500PE", k: 23 },
     { id: "402560003", symbol: "NIFTY26M1724600CE", k: 15 },
  { id: "402560004", symbol: "NIFTY26M1724600PE", k: 21 },
   { id: "402560005", symbol: "NIFTY26M1724700CE", k: 44 },
  { id: "402560006", symbol: "NIFTY26M1724700PE", k: 11 },

   { id: "402560007", symbol: "NIFTY26M1724800CE", k: 54 },
  { id: "402560008", symbol: "NIFTY26M1724800PE", k: 62 },

    { id: "402560009", symbol: "NIFTY26M1724900CE", k: 44 },
  { id: "402560010", symbol: "NIFTY26M1724900PE", k: 11 },

      { id: "402560011", symbol: "NIFTY26M1726000CE", k: 44 },
  { id: "402560012", symbol: "NIFTY26M1726000PE", k: 11 },
  { id: "402560013", symbol: "NIFTY26M1726100CE", k: 44 },
  { id: "402560014", symbol: "NIFTY26M1726100PE", k: 11 },
  { id: "402560015", symbol: "NIFTY26M1726200CE", k: 44 },
  { id: "402560016", symbol: "NIFTY26M1726200PE", k: 11 },
    { id: "402560017", symbol: "NIFTY26M1726300CE", k: 44 },
  { id: "402560018", symbol: "NIFTY26M1726300PE", k: 11 },


  { id: "402560021", symbol: "NIFTY26M1726400CE", k: 90 },
  { id: "402560022", symbol: "NIFTY26M1726400PE", k: 95 },
//21
    { id: "402569999", symbol: "NIFTY26A2124400CE", k: 12 },
  { id: "402570000", symbol: "NIFTY26A2124400PE", k: 18 },
//--
{ id: "402570001", symbol: "NIFTY26A2124400CE", k: 12 },
  { id: "402570002", symbol: "NIFTY26A2124400PE", k: 18 },

    { id: "402570001", symbol: "NIFTY26A2124500CE", k: 13 },
  { id: "402570002", symbol: "NIFTY26A2124500PE", k: 23 },
     { id: "402570003", symbol: "NIFTY26A2124600CE", k: 15 },
  { id: "402570004", symbol: "NIFTY26A2124600PE", k: 21 },
   { id: "402570005", symbol: "NIFTY26A2124700CE", k: 44 },
  { id: "402570006", symbol: "NIFTY26A2124700PE", k: 11 },

   { id: "402570007", symbol: "NIFTY26A2124800CE", k: 54 },
  { id: "402570008", symbol: "NIFTY26A2124800PE", k: 62 },

    { id: "402570009", symbol: "NIFTY26A2124900CE", k: 44 },
  { id: "402570010", symbol: "NIFTY26A2124900PE", k: 11 },

      { id: "402570011", symbol: "NIFTY26A2126000CE", k: 44 },
  { id: "402570012", symbol: "NIFTY26A2126000PE", k: 11 },
  { id: "402570013", symbol: "NIFTY26A2126100CE", k: 44 },
  { id: "402570014", symbol: "NIFTY26A2126100PE", k: 11 },
  { id: "402570015", symbol: "NIFTY26A2126200CE", k: 44 },
  { id: "402570016", symbol: "NIFTY26A2126200PE", k: 11 },
    { id: "402570017", symbol: "NIFTY26A2126300CE", k: 44 },
  { id: "402570018", symbol: "NIFTY26A2126300PE", k: 11 },
//--
  { id: "402570021", symbol: "NIFTY26A2126400CE", k: 90 },
  { id: "402570022", symbol: "NIFTY26A2126400PE", k: 95 },

  //28
      { id: "402579999", symbol: "NIFTY26A2824400CE", k: 12 },
  { id: "402580000", symbol: "NIFTY26A2824400PE", k: 18 },

{ id: "402580001", symbol: "NIFTY26A2824400CE", k: 12 },
  { id: "402580002", symbol: "NIFTY26A2824400PE", k: 18 },

    { id: "402580001", symbol: "NIFTY26A2824500CE", k: 13 },
  { id: "402580002", symbol: "NIFTY26A2824500PE", k: 23 },
     { id: "402580003", symbol: "NIFTY26A2824600CE", k: 15 },
  { id: "402580004", symbol: "NIFTY26A2824600PE", k: 21 },
   { id: "402580005", symbol: "NIFTY26A2824700CE", k: 44 },
  { id: "402580006", symbol: "NIFTY26A2824700PE", k: 11 },

   { id: "402580007", symbol: "NIFTY26A2824800CE", k: 54 },
  { id: "402580008", symbol: "NIFTY26A2824800PE", k: 62 },

    { id: "402580009", symbol: "NIFTY26A2824900CE", k: 44 },
  { id: "402580010", symbol: "NIFTY26A2824900PE", k: 11 },

      { id: "402580011", symbol: "NIFTY26A2826000CE", k: 44 },
  { id: "402580012", symbol: "NIFTY26A2826000PE", k: 11 },
  { id: "402580013", symbol: "NIFTY26A2826100CE", k: 44 },
  { id: "402580014", symbol: "NIFTY26A2826100PE", k: 11 },
  { id: "402580015", symbol: "NIFTY26A2826200CE", k: 44 },
  { id: "402580016", symbol: "NIFTY26A2826200PE", k: 11 },
    { id: "402580017", symbol: "NIFTY26A2826300CE", k: 44 },
  { id: "402580018", symbol: "NIFTY26A2826300PE", k: 11 },


  { id: "402580021", symbol: "NIFTY26A2826400CE", k: 90 },
  { id: "402580022", symbol: "NIFTY26A2826400PE", k: 95 },


  /*
   search and replace usign regex in EM Editoe 
   25\d+(CE|PE)
     24400$1
   25\d*([0-9]{3})(CE|PE)
   $1$2

    26J13
    26M17

  */
    
  ];
 
  export // Fyers Custom Format Exipry Table Mapper 
 const tableGlobalExipryMapper = new Map();
         // this is also a configuration setting for converting yymmdd to fyers specific yyMdd format 
        tableGlobalExipryMapper.set('251216','25D16')
        tableGlobalExipryMapper.set('251223','25D23')
        tableGlobalExipryMapper.set('251230','25DEC')
        tableGlobalExipryMapper.set('260106','26J06')
        tableGlobalExipryMapper.set('260113','26J13')
         tableGlobalExipryMapper.set('2025-12-16','25D16')
        tableGlobalExipryMapper.set('2025-12-23','25D23')
        tableGlobalExipryMapper.set('2025-12-30','25D30') // convert to 25DEC while sending to netlify function 
        tableGlobalExipryMapper.set('2026-01-06','26J06')
        tableGlobalExipryMapper.set('2026-01-13','26J13')
         tableGlobalExipryMapper.set('2026-01-20','26J20')
        tableGlobalExipryMapper.set('2026-01-27','26J27')

         tableGlobalExipryMapper.set('25D16', '2025-12-16')
        tableGlobalExipryMapper.set('25D23','2025-12-23')
        tableGlobalExipryMapper.set('25D30','2025-12-30') // convert to 25DEC while sending to netlify function 
        tableGlobalExipryMapper.set('26J06','2026-01-06')
        tableGlobalExipryMapper.set('26J13', '2026-01-13')
  tableGlobalExipryMapper.set('26J20', '2026-01-20')
    tableGlobalExipryMapper.set('26J27', '2026-01-27')

  export default expirySymbols;

  
