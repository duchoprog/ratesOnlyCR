// server.js
// where your node app starts

// init project
const express = require("express");
const app = express();
const axios = require("axios");
const xml2js = require("xml2js");
const parser = new xml2js.Parser();

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response("culo");
});
app.get("/cr", function (request, response) {
  // Create a new Date object
  const today = new Date();

  // Get the day, month, and year
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = today.getFullYear();

  // Format the date as dd/mm/yyyy
  const formattedDate = `${day}/${month}/${year}`;
  const odoodDate = `${year}-${month}-${day}`;

  // SOAP request for exchange rates (compra or venta)
  const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ObtenerIndicadoresEconomicosXML xmlns="http://ws.sdde.bccr.fi.cr">
      <Indicador>318</Indicador> <!-- For "compra" exchange rate (317) or "venta" (318) -->
      <FechaInicio>${formattedDate}</FechaInicio> 
      <FechaFinal>${formattedDate}</FechaFinal> <!-- Replace with actual end date -->
      <Nombre>your_name</Nombre> pepe
      <SubNiveles>N</SubNiveles> N
      <CorreoElectronico>patapufete65@gmail.com</CorreoElectronico> <!-- Replace with your email -->
      <Token>9GLELLOR0A</Token>
    </ObtenerIndicadoresEconomicosXML>
  </soap:Body>
</soap:Envelope>`;

  const headers = {
    "Content-Type": "text/xml; charset=utf-8",
    "Content-Length": soapRequest.length,
    SOAPAction: "http://ws.sdde.bccr.fi.cr/ObtenerIndicadoresEconomicosXML",
  };

  const bankUrl =
    "https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx";

  exchangeCRCtoday();
  async function exchangeCRCtoday() {
    try {
      const response = await axios.post(bankUrl, soapRequest, { headers });

      let todaysRate = await parseXMLResponse(response.data);

      return todaysRate;
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
    }
  }

  async function parseXMLResponse(xml) {
    let todaysRate;
    try {
      const result = await parser.parseStringPromise(xml);

      // Extract the embedded XML string from the SOAP response
      const rawXmlData =
        result["soap:Envelope"]["soap:Body"][0][
          "ObtenerIndicadoresEconomicosXMLResponse"
        ][0]["ObtenerIndicadoresEconomicosXMLResult"][0];

      // Parse the embedded XML data to an object
      const embeddedXml = await parser.parseStringPromise(rawXmlData);

      const economicData =
        embeddedXml.Datos_de_INGC011_CAT_INDICADORECONOMIC
          .INGC011_CAT_INDICADORECONOMIC;

      // Iterate over the parsed economic data and log the date and rate
      economicData.forEach((item) => {
        const date = item.DES_FECHA[0];
        todaysRate = item.NUM_VALOR[0];
      });
      console.log(todaysRate);

      return todaysRate;
    } catch (err) {
      console.error("Error parsing XML:", err);
    }
  }
});

// listen for requests :)
const listener = app.listen(3001, function () {
  console.log("Your app is listening on port " + 3001);
});
