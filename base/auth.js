const auths = require("./../auth_keys.json");
const log = require("../log");

const findUserByKey = (key) => {
    for (var a in auths.users) {
        var user = auths.users[a];
        if (user.key === key) {
            return user;
        }
    }

    return false;
}

module.exports = {
    authenticateAsCron : (req, res, next) => {
        const appEngineCron = req.header("X-Appengine-Cron");

        log(`AppEngineCron: ${appEngineCron}`);

        if (appEngineCron) {
            log("Autoauth via X-Appengine-Cron");
            return next();
        }

        log("Not Authorized as AppEngineCron");
        res.status(401).json({"error" : "not authorized (cron only)"}).end();
    },
    authenticateAsUser : (req, res, next) => {
        let key = "";
        const bearer = req.header('Authorization');
        if (bearer && bearer.startsWith("Bearer ")) {
            key = bearer.substr(7);
        }

        const user = findUserByKey(key);

        if (user) {
            log(user.name + "'s Key used");
            return next();
        }

        log("Not Authorized with key");
        res.status(401).json({"error" : "not authorized"}).end();
    },
}
