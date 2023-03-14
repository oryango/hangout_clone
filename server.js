const express = require("express");
const app = express();
const http = require("http").Server(app);

const mongoose = require('mongoose');
const UserModel = require('./server/models/User');

const bodyParser = require('body-parser');

const PORT = 3000;
const mongoString = "mongodb+srv://admin:debtappearancetheorist@hangout.sobneka.mongodb.net/hangoutDB?retryWrites=true&w=majority"


const io = require("socket.io")(http);


main()

async function main() {
	await mongoose.connect(
		mongoString, {
			useNewUrlParser: true,
  		useUnifiedTopology: true,
  	});

	const db = mongoose.connection;
	db.on("error", console.error.bind(console, "connection error: "));
	db.once("open", function () {
	  console.log("Connected successfully");
	});
	app.use(bodyParser.json());
	app.use(express.static(__dirname + "/build"))


	app.post("/verify_login", async (req, res) => {		
		const verify = await UserModel.verify(req.body);
		return res.status(200).json(verify);
	});

	app.get("*", (req, res) => {
	  res.sendFile(__dirname + "/build/index.html");
	});


	http.listen(PORT, () => {
	  console.log(`listening on ${PORT}`);
	});
}


