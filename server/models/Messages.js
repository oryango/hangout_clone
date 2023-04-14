const mongoose = require('mongoose');
const { Schema } = mongoose;
const ObjectID = require('mongodb').ObjectId


const DataSchema = new Schema({
	senderId: {
		type: mongoose.ObjectId
	},
	senderName: {
		type: String
	},
	body: {
		type: String
	},
	status: {
		type: String,
		default: "seen"
	},
	system: {
		type: Boolean,
		default: false
	}
})

const UserDataSchema = new Schema({
	user: {
		type: mongoose.ObjectId, required: true
	},
	messages: [DataSchema],
});

const MessagesSchema = new Schema({
	users: {type: Array, required: true},
	conversationType: {type: String, required: true},
	destinationNumber: {type: String, default: null, trim: true},
	userData: [UserDataSchema],
}, { timestamps: true });

MessagesSchema.statics.createDirectConversation = async function createDirectConversation(data) {
	const { 
		senderId,
		senderEmail, 
		senderName, 

		sendeeId,
		email, 
		sendeeName 
	} = data

	const roomName = email === senderEmail ? "Note to Self" : sendeeName

	const query = {
		$and: [
		   {"users.email": email},
		   {"users.email": senderEmail}
  		],
  		conversationType: roomName === "Note to Self" ? "self" : "direct"
	}

	let operation = "found"
	let room = await this.findOne(query)

	if(room === null){
		operation = "created"

		const chatId = new ObjectID()

		const query = {
			_id: chatId,
			conversationType: "direct",
			users: [
				{
					userId: new ObjectID(senderId),
					name: senderName,
					email: senderEmail
				},
				{
					userId: sendeeId,
					name: sendeeName,
					email: email
				}
			],
			userData: [
				{
					user: new ObjectID(senderId),
					messages:[]
				},
				{
					user: sendeeId,
					messages:[]
				}
			]

		}
		await this.create(query)

		room = await this.findOne({_id: chatId})
	} 
	const newRoomId = room._id.valueOf()

	const result = {
		state: "success",
		room: room,
		name: roomName,
		operation: operation,
		newRoomId
	}

	return result
};

MessagesSchema.statics.createSMSConversation = async function createSMSConversation(data) {
	const { 
		senderId,
		senderName, 
		sendeeNumber 
	} = data

	console.log(data)

	const query = {
		destinationNumber: sendeeNumber,
		"users.userId": senderId,
	}

	let operation = "found"
	let room = await this.findOne(query)

	if(room === null){
		operation = "created"

		const chatId = new ObjectID()

		const query = {
			_id: chatId,
			destinationNumber: sendeeNumber,
			conversationType: "sms",
			users: [
				{
					userId: new ObjectID(senderId),
					name: senderName,
				},
			],
			userData: [
				{
					user: new ObjectID(senderId),
					messages:[]
				}
			]

		}
		await this.create(query)

		room = await this.findOne({_id: chatId})
	} 
	const newRoomId = room._id.valueOf()

	const result = {
		state: "success",
		room: room,
		operation: operation,
		newRoomId
	}

	return result

}

MessagesSchema.statics.createGroupConversation = async function createGroupConversation(data) {

	const { name, users } = data

	const chatId = new ObjectID()

	const query = {
		_id: chatId,
		conversationType: "group",
		users: users.users,
		userData: users.userData

	}

	await this.create(query)

	room = await this.findOne({_id: chatId})

	const newRoomId = room._id.valueOf()


	const result = {
		state: "success",
		room: room,
		name: name,
		newRoomId,
	}

	return result
};

MessagesSchema.statics.createInitialRoom = async function createInitialRoom(data) {

	const { chatId } = data
	const { _id, firstName, lastName, email } = data._doc
	console.log(data._doc)

	const query = {
		_id: chatId,
		users: [{
			userId: _id,
			name: `${firstName} ${lastName}`,
			email: email
		}],
		conversationType: "self",
		userData: [{
			user: _id,
			messages: []
		}]
	}

	await this.create(query)
};

MessagesSchema.statics.appendMessage = async function appendMessage(data) {
	
	const { message, senderName, senderId, roomId } = data

	const query = {
		senderId: new ObjectID(senderId),
		senderName: senderName,
		body: message,
		status: "seen"
	}

	const room = await this.findOne({_id: roomId})


	for await (const log of room.userData){
		log.messages.push(query)
	}

	const result = await room.save();
	return {...query, roomId}
}

MessagesSchema.statics.sendSMSMessage = async function sendSMSMessage(data) {
	const { message, senderId, roomId } = data

	const query = {
		senderId: new ObjectID(senderId),
		body: message,
		status: "seen"
	}

	const room = await this.findOne({_id: roomId})

	room.userData[0].messages.push(query)

	const result = await room.save()
	return {...query, roomId, destinationNumber: room.destinationNumber}
}

MessagesSchema.statics.recvSMS = async function recvSMS(data) {
	const { userId, body, destinationNumber, name } = data

	const query = {
		destinationNumber,
		"users.userId": userId,
	}

	let operation = "found"
	let room = await this.findOne(query)

	if(room === null){
		operation = "created"

		const chatId = new ObjectID()

		const query = {
			_id: chatId,
			destinationNumber: destinationNumber,
			conversationType: "sms",
			users: [
				{
					userId: new ObjectID(userId),
					name: name,
				},
			],
			userData: [
				{
					user: new ObjectID(userId),
					messages:[]
				}
			]

		}
		await this.create(query)

		room = await this.findOne({_id: chatId})
	} 

	const messageQuery = {
		senderId: new ObjectID(),
		body,
		status: "seen",
		name: destinationNumber
	}

	await room.userData[0].messages.push(messageQuery)
	await room.save()

	const newRoomId = room._id.valueOf()

	const result = {
		...messageQuery,
		state: "success",
		room: room,
		operation: operation,
		roomId: newRoomId,
	}

	return result
}

MessagesSchema.statics.findSortedRooms = async function findSortedRooms(data) {
	const { conversationList } = data
	const ids = []
	conversationList.forEach((conversation) => {
		ids.push(new ObjectID(conversation.chatId))
	})

	const query = [
		{
			$match: {
				_id: {$in: ids}
			}
		}, {
			$sort: {
				updatedAt: -1
			}
		}, {
			$project: {
				conversationType: 1
			}
		}
	]

	const sortedIds = await this.aggregate(query)

	return {sortedIds}

}

MessagesSchema.statics.sendSystemMsg = async function sendSystemMsg(data) {
	const { roomId, senderName, message } = data

	const query = {
		senderName,
		body: message,
		system: true,
	}

	const room = await this.findOne({_id: roomId})
	for await (const log of room.userData){
		log.messages.push(query)
	}
	const result = await room.save();
	return {...query, roomId}
}

module.exports = mongoose.model("messages", MessagesSchema);