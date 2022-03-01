let name = require('./package.json').name;

module.exports = (text) => {
    const time = new Date().toLocaleString("en-AT", { timeZone: "Europe/Vienna" })
    console.log(`[${time}|${name}]: ${text}`)
}
