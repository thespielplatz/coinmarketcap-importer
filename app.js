const dotenv = require('dotenv');
dotenv.config()

const cron = require('node-cron');

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
    log(`Importing: ${rangeRead}`);

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

    //console.log(symbols.join(","));

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

    //console.log(data);
    //log(ids.join(","));

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
            //console.log(row.symbol + " " + row.price + " / " + row.name);
        }

        prices.push(price);
    }

    //console.log(prices);

    let rangeWrite = "A2:A" + (3 + prices.length);
    await sheets.writeToSheet(spreadsheetId, sheetName, prices, rangeWrite);
    log(`Updated Spreadsheet: ${rangeWrite}`);
}

// https://crontab.guru/#*/10_0-2,8-23_*_*_*
const CRON_AS_TEXT = 'At every 10th minute past every hour from 0 through 2 and every hour from 8 through 23.'
console.log(`Interval set to "${CRON_AS_TEXT}"`)

cron.schedule('0 */10 0-2,8-23 * * *', async () => {
    await refreshSpreadsheet()
},{
    scheduled: true,
    timezone: 'Europe/Vienna'
})

module.exports = app;
