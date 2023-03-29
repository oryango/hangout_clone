const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const bodyParser = require('body-parser');
const mediasoup = require('mediasoup');
const config = require('./server/config');

const mongoose = require('mongoose');
const UserModel = require('./server/models/User');
const MessagesModel = require('./server/models/Messages');
const mongoString = "mongodb+srv://admin:debtappearancetheorist@hangout.sobneka.mongodb.net/hangoutDB?retryWrites=true&w=majority"
const ObjectID = require('mongodb').ObjectId
const createWebRtcTransport = require("./server/services/createWebRtcTransport")

const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname + "/build"))

main()

let onlineUsers = []  // {socketId: socket.id, name: fullName, status: "available" | "busy" | "chatonly"}
let mediasoupRouter = null;
const producerTransport = []; //{ socketId, type, transport }
const consumerTransport = [];
const producerIds = []  // {ids: [{producerId, name, socketId}], roomId}

async function main() {
	await mongoose.connect(
		mongoString, {
		useNewUrlParser: true,
  		useUnifiedTopology: true,
  	});

	mediasoupRouter = await createWorker()
	socketEvents(io)

	app.post("/verify_login", async (req, res) => {		
		const verify = await UserModel.verify(req.body);
		return res.status(200).json(verify);
	});

	app.post("/fetch_messages", async (req, res) => {		
		const messages = await MessagesModel.findOne(req.body);
		return res.status(200).json(messages);
	});

	app.post("/create_User", async (req, res) => {
		try {
			const chatId = new ObjectID()
			const query = {...req.body, conversationList: [
				{
					chatId: chatId,
					type: "self",
					name: "Note to Self"
				},
			]}
			const result = await UserModel.create(query);

			await MessagesModel.createInitialRoom({...result, chatId});

			const body = {state: "success", body: result}

			return res.status(200).json(body);

		} catch (err) {
			const body = {state: "error_found", errors: []}
			const errors = Object.keys(err.keyValue)
			if(errors[0] === "email") {
				body.errors.push("Email already in use")
			} else {
				body.errors.push("Error please try again later")
			}

			return res.status(200).json(body);
		}
	});

	app.post("/create_direct_room", async (req, res) => {
		const verify = await UserModel.findOne({email: req.body.email});

		if(verify == null) {
			const result = { state: "error_found", errors: ["Email not found"] }
			return res.status(200).json(result)
		}

		const sendeeId = verify._id;
		const sendeeName = `${verify.firstName} ${verify.lastName}`;

		const result = await MessagesModel.createDirectConversation({...req.body, sendeeName, sendeeId});
		console.log(result)

		if(result.operation === "created") {
			const senderName = req.body.senderName
			await UserModel.updateUsersDirect({...result, senderName, sendeeName})
		}

		return res.status(200).json(result);
	});

	app.post("/create_group_room", async (req, res) => {

		const { users, userData, errors } = await verifyUsersGroup(req.body)

		if(errors.length > 0) {
			return res.status(200).json({state: "error_found", errors})
		}

		const data = {
			name: groupName,
			users: {users: users, userData: userData}
		}

		const result = await MessagesModel.createGroupConversation(data)

		if(result.state === "success") {
			await UserModel.updateUsersGroup(result)
		}

		return res.status(200).json(result);
	});

	app.post("/send_message", async (req, res) => {
		const result = await MessagesModel.appendMessage(req.body)
		return res.status(200).json({body:result});
	});

	app.get("*", (req, res) => {
	  res.sendFile(__dirname + "/build/index.html");
	});


	http.listen(PORT, () => {
	  console.log(`listening on ${PORT}`);
	});
}

const socketEvents = io => {
	//insert socket function here
	io.on("connection", (socket) => {

		socket.on("log-in", (data) => {
			const { name } = data
			onlineUsers.push({socketId: socket.id, name, status: "available"})
			console.log("User has logged in")
		})

		socket.on("get-router-rtp-capabilities", () => {
			socket.emit("router-rtp-capabilities", { routerRtpCapabilities: mediasoupRouter.rtpCapabilities })
		})

		socket.on("fetched-messages", (data) => {
			const { previousRoom, newRoom } = data

			if(previousRoom !== null) {
				socket.leave(previousRoom)
			}

			socket.join(newRoom)

		})

		socket.on("new-message", (data) => {
			const { result, roomId } = data
			const { body: items } = result.payload

			const body = { ...items, roomId }
			io.to(roomId).emit("new-message", { body })
		})

		socket.on("disconnect", (data) => {
			const newOnlineUsers = onlineUsers.filter(
				(user) => user.ID !== socket.id
			)

			console.log("Socket disconnected")
		})

		socket.on("create-producer-transport", async (event) => {
			const { data, type } = event
			const { transport, params } =  await createWebRtcTransport({data, router: mediasoupRouter})
			producerTransport.push({transport, socketId: socket.id, type})
			io.to(socket.id).emit("producer-transport-created", {params, type})
		})

		socket.on("connect-producer-transport", async (data, callback) => {
			const { dtlsParameters, transportId } = data
			const transport = findProducerTransport({transportId})
			await transport.connect({dtlsParameters})
			callback()
		})

		socket.on("produce", async (data, callback) => {
			const {
				name, 
				kind, 
				rtpParameters, 
				roomId, 
				transportId } = data
			const transport = findProducerTransport({transportId})
			const producer = await transport.produce({kind, rtpParameters})
			socket.leave(`${roomId} call`)

			const ids = [{producerId: producer.id, socketId: socket.id, name}]

			io.to(`${roomId} call`).emit("new-producer", {producerIds: ids})
			socket.join(`${roomId} call`)

			const filteredRoom = findCallRoom(roomId)
			const id = { producerId: producer.id, socketId: socket.id, name }

			if(filteredRoom === null) { 
				producerIds.push({roomId: `${roomId} call`, ids:[id]})
			} else {
				filteredRoom.ids.push(id)
			}

			callback({id: producer.id})
		})

		socket.on("get-producers", ({roomId}) => {
			const filteredRoom = findCallRoom(roomId)
			socket.emit("new-producer",{producerIds: filteredRoom})
		})

		socket.on("create-consumer-transport", async (data) => {
			const { transport, params } =  await createWebRtcTransport({data, router: mediasoupRouter})
			consumerTransport = transport
			
			io.to(socket.id).emit("consumer-transport-created", params)
		})

		socket.on("connect-consumer-transport", async({dtlsParameters}, callback) => {
			await consumerTransport.connect({dtlsParameters})
			callback()
		})

		socket.on("consume", async({rtpCapabilities}, callback) => {
			const consumer = await consumerTransport.consume({
				producerId: producer.id,
				rtpCapabilities,
				paused: false,
			})

			const params = {
				producerId: producer.id,
				id: consumer.id,
				kind: consumer.kind,
				rtpParameters: consumer.rtpParameters,
				type: consumer.type,
				producerPaused: consumer.producerPaused,
			}
			callback(params)
		})
	})
}

const findProducerTransport = (data) => {
	const { transportId } = data
	const filteredTransport = producerTransport.filter((transport) => {
		return transport.transport.id == transportId  ?
			transport : null
	})
	return filteredTransport[0].transport
}

const findCallRoom = (roomId) => {
	const filteredRoom = producerIds.filter((room) => {
		return room.roomId == `${roomId} call` ? room : null
	})

	return filteredRoom.length === 0 ? null : filteredRoom[0]
}


const verifyUsersGroup = async (data) => {
	const { senderId, senderEmail, senderName, emails, groupName } = data

	const users = [{
		userId: new ObjectID(senderId),
		name: senderName,
		email: senderEmail
	}]

	const userData = [{
		user: new ObjectID(senderId),
		messages: []
	}]

	const errors = []

	for await (const email of emails) {
		const verify = await UserModel.findOne({email});

		if(verify == null) {
			errors.push(`${email} not found`)
		} else {
			users.push({
				userId: verify._id,
				name: `${verify.firstName} ${verify.lastName}`,
				email: email,
			})

			userData.push({
				user: verify._id,
				messages: []
			})
		}
	};

	return { users, userData, errors }
}

const createWorker = async () => {
	worker = await mediasoup.createWorker({
		logLevel: config.mediasoup.worker.logLevel,
		logTags: config.mediasoup.worker.logTags,
		rtcMinPort: config.mediasoup.worker.rtcMinPort,
		rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
	});

	worker.on('died', () => {
		console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
		setTimeout(() => process.exit(1), 2000);
	});


	const mediaCodecs = config.mediasoup.router.mediaCodecs;

	mediasoupRouter = await worker.createRouter({ mediaCodecs });

	return mediasoupRouter
}