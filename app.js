const dotenv = require('dotenv');
dotenv.config()

const base = require("./base/base")
const app = base.app;
const log = require('./log')
const cmc = require('./cointmarketcapapi')
const sheets = require('./apps/sheets/app')

const axios = require('axios')

console.log(`Found: ${process.env.NODE_PORT}`);
// App Fired Up an listening
base.setListenCallback(() => {
    (async () => {
        await sheets.auth();
    })();
});

app.get('/trigger/', async (req, res) => {
    res.status(200).json({"status": "ok"}).end()
    refreshSpreadsheet()
});

async function refreshSpreadsheet() {
    let spreadsheetId = process.env.SPREADSHEET_ID;
    let sheetName = process.env.SPREADSHEET_NAME;

    // Read the values
    let rangeRead = "B2:C100";
    log(`Reading: ${rangeRead}`);

    let rows = await sheets.readFromSheet(spreadsheetId, sheetName, rangeRead);

    let symbols = [];
    let data = [];
    for (let rowIndex in rows) {
        let row = {};
        if (rows[rowIndex][0]) {
            symbols.push(rows[rowIndex][0]);
            row.symbol = rows[rowIndex][0];
            row.name = rows[rowIndex][1];
        }

        data.push(row);
    }

    log(symbols.join(","));

    const map = await cmc.map(symbols.join(","));
    let tokens = map.data;

    let ids = [];

    for (let i in data) {
        let row = data[i];

        for (let j in tokens) {
            let token = tokens[j];

            if (row.name != undefined) {
                if (row.name == token.name) {
                    row.id = token.id;
                    row.cncName = token.name;
                    ids.push(token.id);
                    break;
                }
            } else {
                if (row.symbol == token.symbol) {
                    row.id = token.id;
                    row.cncName = token.name;
                    ids.push(token.id);
                    break;
                }
            }
        }
    }

    console.log(data);

    log(ids.join(","));

    const values = await cmc.value(ids.join(","));
    const pricesData = values.data;

    let prices = [];

    for (let i in data) {
        let row = data[i];
        let price = [];

        if (row.id in pricesData) {
            let tokenPrice = pricesData[row.id];
            row.price = tokenPrice.quote.EUR.price;
            price.push(row.price);
            log(row.symbol + " " + row.price + " / " + row.name);
        }

        prices.push(price);
    }

    console.log(prices);

    let rangeWrite = "A2:A" + (3 + prices.length);
    log(`Update: ${rangeWrite}`);
    await sheets.writeToSheet(spreadsheetId, sheetName, prices, rangeWrite);
}

const interval = process.env.INTERVAL_IN_MINUTES * 60 * 1000;
console.log(`Interval set to ${process.env.INTERVAL_IN_MINUTES} minutes`)
setInterval(refreshSpreadsheet, interval)

module.exports = app;
