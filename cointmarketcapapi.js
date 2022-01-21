const axios = require('axios');
const log = require('./log');

module.exports = {
    "map" : async (symbols) => {

        const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/map';

        const config = {
            method: 'GET',
            url: url + "?symbol=" + symbols,
            headers: {
                'X-CMC_PRO_API_KEY': process.env.COINMARKETCAPKEY,
                'Content-Type': 'application/json'
            },
        };

        try {
            let response = await axios(config);
            //console.log(response.data);
            return response.data;

        } catch (e) {
            let response = e.response;
            log(`Error: ${e.message}`);
            return false;
        }
    },
    "value" : async (ids) => {

        const url = 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest';

        const config = {
            method: 'GET',
            url: url + "?id=" + ids + "&convert=EUR",
            headers: {
                'X-CMC_PRO_API_KEY': process.env.COINMARKETCAPKEY,
                'Content-Type': 'application/json'
            },
        };

        try {
            let response = await axios(config);
            return response.data;

        } catch (e) {
            let response = e.response;
            log(`Error: ${e.message}`);
            return false;
        }
    }
}
