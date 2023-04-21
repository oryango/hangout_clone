const bodyParser = require('body-parser');
const mediasoup = require('mediasoup');
const config = require('./server/config');
const mongoose = require('mongoose');
const UserModel = require('./server/models/User');
const MessagesModel = require('./server/models/Messages');
const mongoString = "mongodb+srv://admin:debtappearancetheorist@hangout.sobneka.mongodb.net/hangoutDB?retryWrites=true&w=majority"
const ObjectID = require('mongodb').ObjectId
const createWebRtcTransport = require("./server/services/createWebRtcTransport")
const AccessToken = require('twilio').jwt.AccessToken;
const VoiceResponse = require("twilio").twiml.VoiceResponse;
const validator = require("validator");

const accountSid = "AC14ba204440b62fbe369ef028b48f5216";
const authToken = "e4fdccfef4df6269e91df3a84a6b466e";
const twilioApiKey = "SK1b71e8a5035f4f5a1aede3719c055bee";
const twilioApiSecret = "Z9i1qauPSCHu8VRTeuJoWNKDQaADZnBp";
const twiMLSid = "AP8b61844fca46a1464f8277c382528470";
const client = require('twilio')(accountSid, authToken);

const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

let onlineUsers = []  // {socketId: socket.id, name: fullName, userId: objectId, status: "available" | "busy" | "chatonly", phoneNumber: number}
let mediasoupRouter = null;
let producerTransport = []; //{ socketId, type, transport }
let consumerTransport = []; //{socketId, transport}
let producerIds = []  // {ids: [{producerId, name, socketId}], roomId}

const PORT = 80;

main()


async function main() {
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(express.static(__dirname + "/build"))

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

		if(result.operation === "created") {
			const senderName = req.body.senderName
			const roomInfo = await UserModel.updateUsersDirect({...result, senderName, sendeeName})
			roomInfo.forEach(({userId, query}) => {
				const socketId = onlineUsers.find((user) => { 
					return userId.valueOf() == user.userId.valueOf()
				})
				if(socketId !== undefined ) {
					io.to(socketId.socketId).emit("new-room-added", {query})
				}
			})
		}

		return res.status(200).json(result);
	});

	app.post("/create_group_room", async (req, res) => {

		const { users, userData, errors } = await verifyUsersGroup(req.body)

		if(errors.length > 0) {
			return res.status(200).json({state: "error_found", errors})
		}

		const data = {
			name: req.body.groupName,
			users: {users: users, userData: userData}
		}

		const result = await MessagesModel.createGroupConversation(data)

		if(result.state === "success") {
			const roomInfo = await UserModel.updateUsersGroup(result)
			roomInfo.forEach(({userId, query}) => {
				const socketId = onlineUsers.find((user) => { 
					return userId.valueOf() == user.userId.valueOf()
				})
				if(socketId !== undefined ) {
					io.to(socketId.socketId).emit("new-room-added", {query})
				}
			})
		}

		return res.status(200).json(result);
	});

	app.post("/send_message", async (req, res) => {
		const result = await MessagesModel.appendMessage(req.body)
		return res.status(200).json({body:result});
	});

	app.post("/sort_rooms", async (req, res) => {
		const result = await MessagesModel.findSortedRooms(req.body)
		return res.status(200).json({body: result})
	});

	app.post("/send_sys_message", async (req, res) => {
		const result = await MessagesModel.sendSystemMsg(req.body)
		return res.status(200).json({body: result})
	})

	app.post("/request_phone", async (req, res) => {
		await UserModel.requestPhone(req.body)
		return res.status(200).json({})
	})

	app.post("/create_sms_room", async (req, res) => {
		const result = await MessagesModel.createSMSConversation(req.body)

		if(result.operation === "created") {
			const roomInfo = await UserModel.updateUserSMS(result)
			roomInfo.forEach(({userId, query}) => {
				const socketId = onlineUsers.find((user) => { 
					return userId.valueOf() == user.userId.valueOf()
				})
				if(socketId !== undefined ) {
					io.to(socketId.socketId).emit("new-room-added", {query})
				}
			})
		}

		return res.status(200).json(result);
	})

	app.post("/send_sms", async (req, res) => {
		const resultServer = await MessagesModel.sendSMSMessage(req.body)
		const resultNumber = await client.messages.create({
			body: resultServer.body,
			from: req.body.senderNumber,
			to: resultServer.destinationNumber,
		})
		return res.status(200).json({body:resultServer})
	})

	app.post("/recv_sms", async (req, res) => {
		const { Body, To, From, } = req.body
		const user = await UserModel.findOne({phoneNumber: To})

		if(user !== null && user !== undefined) {
			const name = `${user.firstName} ${user.lastName}`
			const result = await MessagesModel.recvSMS({userId: user._id, body: Body, destinationNumber: From, name})
			const body = {
				...result,
				roomName: From,
			}

			console.log(result)

			if(result.operation === "created") {
				const roomInfo = await UserModel.updateUserSMS(result)
				roomInfo.forEach(({userId, query}) => {
					const socketId = onlineUsers.find((user) => { 
						return userId.valueOf() == user.userId.valueOf()
					})
					if(socketId !== undefined ) {
						io.to(socketId.socketId).emit("new-room-added", {query})
						io.to(socketId.socketId).emit("new-message", { body })
						io.to("online").emit("notification-message", { body })
					}
				})
			} else {
				const socketId = onlineUsers.find((userId) => {
					return userId.userId.valueOf() == user._id.valueOf()
				})
				if(socketId !== undefined) {
					io.to(socketId.socketId).emit("new-message", { body })
					io.to("online").emit("notification-message", { body })
				}
			}
		}

	})

	app.post("/voice", (req, res) => {
		const { To, From, Caller, Direction } = req.body
		console.log(req.body)
		let twiml = new VoiceResponse()
		//find if 
		let receiver = null
		let caller = null

		onlineUsers.forEach((user) => {
			console.log(user.phoneNumber)
			if(To.includes(user.userId) || To == user.phoneNumber){
				receiver = user
			} else if(Caller.includes(user.userId) || From.includes(user.phoneNumber)) {
				caller = user
			}
		})
		//if person is online set to be unavailable for call 

		if(Direction == "outbound" && To){
			let dial = twiml.dial({callerId:caller.phoneNumber});
			const attr = validator.isMobilePhone(To, "any", {strictMode: true})
			  	? "number"
		      	: "client";
		    dial[attr]({}, To);
		} else if(Direction == "inbound" && To){
			let dial = twiml.dial()
			dial.client(receiver.userId)
		} else {
			twiml.say("Thanks for calling!");
		}

		res.set("Content-Type", "text/xml");
		res.send(twiml.toString());

	});

	app.get("/.well-known/pki-validation/EDA48F9FCCAD21973C544DDBB9E0A944.txt", (req, res) => {
		res.sendFile(__dirname + "EDA48F9FCCAD21973C544DDBB9E0A944.txt")
	})

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
			const { name, userId, phoneNumber } = data
			onlineUsers.push({socketId: socket.id, name, userId, status: "available", phoneNumber})

			const token = new AccessToken(
				accountSid,
				twilioApiKey,
				twilioApiSecret,
				{identity: userId}
			);

			const grant = new AccessToken.VoiceGrant({
			    outgoingApplicationSid: twiMLSid,
			    incomingAllow: true,
			});
			token.addGrant(grant)
			io.to(socket.id).emit("log-in", {token: token.toJwt()})

			console.log("User has logged in")
			socket.join("online")
			socket.join("available")
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
			const { result, roomId, roomName } = data
			const { body: items } = result.payload

			const body = { ...items, roomId, roomName }
			socket.join(roomId)
			io.to(roomId).emit("new-message", { body })
			io.to("online").emit("notification-message", { body })
		})

		socket.on("disconnect", (data) => {
			const newOnlineUsers = onlineUsers.filter(
				(user) => user.socketId !== socket.id
			)
			onlineUsers = newOnlineUsers
			socket.leave("online")
			socket.leave("available")
			console.log("Socket disconnected")
		})

		socket.on("convert-to-string", ({roomId}, callback) => {
			const convertedRoomId = new ObjectID(roomId)
			callback({roomId: convertedRoomId.valueOf()})
		})

		socket.on("join-new-room", ({previousRoom, roomId}) => {
			console.log(previousRoom)
			console.log(roomId)
			if(previousRoom !== null) {
				socket.leave(previousRoom)
			}
			socket.join(roomId)
		})

		socket.on("call-started", ({ roomId, roomName, callType }) => {
			socket.leave("available")
			io.to("available").emit("call-started", { roomId, roomName, callType })
		})

		socket.on("create-producer-transport", async (event) => {
			const { data, type } = event
			const { transport, params } =  await createWebRtcTransport({data, router: mediasoupRouter})
			producerTransport.push({transport, socketId: socket.id, type})
			io.to(socket.id).emit("producer-transport-created", {params, type})
		})

		socket.on("connect-producer-transport", async (data, callback) => {
			const { dtlsParameters, transportId } = data
			const transport = findTransport({transportId}, producerTransport)
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

			const transport = findTransport({transportId}, producerTransport)
			const producer = await transport.produce({kind, rtpParameters})
			socket.leave(`${roomId} call`)

			const ids = {ids: [{producerId: producer.id, socketId: socket.id, name}]}
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
			const { socketId, name, producerId } = data
			const { transport, params } =  await createWebRtcTransport({data: null, router: mediasoupRouter})
			consumerTransport.push({transport, socketId: socket.id})
			
			io.to(socket.id).emit("consumer-transport-created", {name, socketId, producerId, params })
		})

		socket.on("connect-consumer-transport", async({dtlsParameters, transportId}, callback) => {
			const transport = findTransport({transportId}, consumerTransport)
			await transport.connect({dtlsParameters})
			callback()
		})

		socket.on("consume", async({rtpCapabilities, producerId, transportId}, callback) => {
			const transport = findTransport({transportId}, consumerTransport)

			const consumer = await transport.consume({
				producerId,
				rtpCapabilities,
				paused: false,
			})

			const params = {
				id: consumer.id,
				kind: consumer.kind,
				rtpParameters: consumer.rtpParameters,
				type: consumer.type,
				producerPaused: consumer.producerPaused,
			}
			callback(params)
		})

		socket.on("producer-paused", ({roomId}) => {

			socket.leave(`${roomId} call`)
			io.to(`${roomId} call`).emit("producer-paused", {socketId: socket.id})
			socket.join(`${roomId} call`)
		})

		socket.on("stop-producers", () => {
			socket.join("available")
			const filteredTransport = producerTransport.filter((transport) => {
				if(transport.socketId == socket.id){
					transport.transport.close()
				}
				return transport.socketId != socket.id
			})

			producerTransport = filteredTransport
			producerIds.forEach((room) => {
				const filteredRoom = room.ids.filter((id) => {
					return id.socketId != socket.id
				})
				if(room.ids.length != filteredRoom.length){
					room.ids = filteredRoom
					io.to(room.roomId).emit("user-left", {socketId: socket.id})
				}
			})
			producerIds = producerIds.filter((room) => {
				return room.ids.length > 0
			})
		})

		socket.on("stop-consumers", () => {
			consumerTransport.forEach((transport) => {
				if(transport.socketId == socket.id){
					transport.transport.close()
				}
			})
			const filteredTransport = consumerTransport.filter((transport) => {
				return transport.socketId != socket.id
			})
			consumerTransport = filteredTransport
		})

		socket.on("stop-select-consumers", ({transportIds}) => {
			transportIds.forEach((transportId) => {
				const filteredTransport = consumerTransport.filter((transport) => {
					return transport.transport.id == transportId
				})
				filteredTransport[0].transport.close()
				consumerTransport = consumerTransport.filter((transport) => {
					return transport.transport.id != transportId
				})
			})
		})

	})
}

const findTransport = (data, transports) => {
	const { transportId } = data
	const filteredTransport = transports.filter((transport) => {
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