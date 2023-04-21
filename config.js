const dotenv = require("dotenv");
const cfg = {};

dotenv.config({ path: ".env" });

cfg.accountSid = process.env.TWILIO_ACCOUNT_SID;

cfg.twiMLSid = process.env.TWILIO_TWIML_APP_SID;
cfg.authToken = process.env.TWILIO_AUTH_TOKEN;

cfg.twilioApiKey = process.env.TWILIO_API_KEY;
cfg.twilioApiSecret = process.env.TWILIO_API_SECRET;

cfg.mongoString = process.env.MONGO_STRING

cfg.iceServers = process.env.TURN_SERVER

module.exports = cfg;