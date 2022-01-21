// https://medium.com/seventyseven/using-google-apis-in-an-app-engine-application-with-node-js-8cd4746b2e2d
const fs = require("fs");
const google = require("googleapis").google;
const key = JSON.parse(fs.readFileSync("./keys.json").toString());

module.exports = {
    start: async (sheets) => {
        await sheets.auth();
    },

    auth: async function() {
        // Load the key
        // Auth using the key
        const auth = await google.auth.fromJSON(key);
        // Add read / write spreadsheets scope to our auth client
        auth.scopes = ["https://www.googleapis.com/auth/spreadsheets"];
        // Create an instance of sheets to a scoped variable
        this.sheets = await google.sheets({ version: "v4", auth });
        console.log("Authed with google and instantiated google sheets");
    },

    writeToSheet: async function(spreadsheetId, sheetName, values, range) {
        // Create the resource for google sheets
        const resource = {
            values
        };
        // Write out to the spreadsheet
        const res = await this.sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheetId,
            range: sheetName + "!" + range,
            valueInputOption: "RAW",
            resource: resource
        });
        console.log("Updated spreadsheet!");
    },

    readFromSheet: async function(spreadsheetId, sheetName, range) {
        range = sheetName + "!" + range;

        const result = await this.sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
            valueRenderOption : 'UNFORMATTED_VALUE'
        });

        const numRows = result.data.values ? result.data.values.length : 0;
        console.log(`${numRows} rows retrieved.`);

        return result.data.values;
    }
};
