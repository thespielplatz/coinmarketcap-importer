let name = require('./package.json').name;

module.exports = (text) => {
    console.log("[" + name + "]: " + text);
}