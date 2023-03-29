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
		type: String
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
	userData: [UserDataSchema],
});

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
	const result = {
		state: "success",
		room: room,
		name: roomName,
		operation: operation
	}

	return result
};

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

	const result = {
		state: "success",
		room: room,
		name: name
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

module.exports = mongoose.model("messages", MessagesSchema);