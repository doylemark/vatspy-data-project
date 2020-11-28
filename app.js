const fs = require("fs");
const db = require("monk")("localhost:27017/airports");

const parseAirports = async () => {
  const airports = await db.get("all");

  try {
    const data = fs.readFileSync("./data/VATSpy.txt", "utf-8");
    const lines = data.split("\n");

    const sanitizedLines = lines.filter((line) => line.split("")[0] !== ";");

    const output = await Promise.all(
      sanitizedLines.map(async (line) => {
        // ICAO|Airport Name|Latitude Decimal|Longitude Decimal|IATA/LID|FIR|I
        const [icao, name, lat, lon, iata, fir] = line.split("|");

        if (icao) {
          const airport = await airports.findOne({ icao });

          if (airport) {
            return {
              icao,
              iata: iata?.length > 0 ? iata : null,
              name: airport.name,
              city: airport.city,
              country: airport.country,
              state: airport.state,
              elevation: airport.elevation,
              lat: airport.lat,
              lon: airport.lon,
              fir: fir?.length > 0 ? fir : null,
              tz: airport.tz,
            };
          } else {
            return {
              icao: icao?.length > 0 ? icao : null,
              iata: iata?.length > 0 ? iata : null,
              name: name?.length > 0 ? name : null,
              city: null,
              country: null,
              elevation: null,
              lat: lat?.length > 0 ? Number(lat) : null,
              lon: lon?.length > 0 ? Number(lon) : null,
              fir: fir?.length > 0 ? fir : null,
            };
          }
        }
      })
    );

    fs.writeFileSync("./logs/airports.json", JSON.stringify(output));
  } catch (error) {
    console.log(error);
  }
};

parseAirports();
