import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchMessages, sendToServer } from "./messengerAPI";
import validator from "validator";


const initialState = {
	personalId: null,
	activeConversation: null,
	type: null,
	name: "",
	messages: [],
	mode: "contacts", //contacts | create
}

export const loadActiveConversation = createAsyncThunk(
	"messenger/loadActiveConversation",
	async ({ chatId, name }) => {
		const response = await fetchMessages( { chatId }  )
		//const response = await sendToServer({chatId}, "/fetch_messages")

		return response;
	}

);

export const addDirectRoom = createAsyncThunk(
	"messenger/addDirectRoom",
	async (data) => {		
		const { email } = data

		let errors = []
	    const options = { ignore_whitespace: true }

	    if(validator.isEmpty(email, options)) {
	      errors.push("Email field is required") 
	    } else {
	      if(!validator.isEmail(email))
	       	errors.push("Please input a valid email address")
	    }


		if(errors.length == 0) {
    		//const response = await createDirectRoom(data);
    		const response = await sendToServer(data, "/create_direct_room")
			return response;
	    } else {
	    	const result = {state: "error_found", errors}
	    	return result
	    }
	}
);

export const addGroupRoom = createAsyncThunk(
	"messenger/addGroupRoom",
	async (data) => {
		const errors = []
		const { groupName, emails } = data
		const options = { ignore_whitespace: true }

		if(validator.isEmpty(groupName, options)){
			errors.push("Group name is required")
		} 

		if(emails.length == 0){
			errors.push("At least one email needs to added")
		}



		if(errors.length > 0) {
			const response = {state: "error_found", errors}
			return response
		} else {
			//const response = await createGroupRoom(data);
			const response = await sendToServer(data, "/create_group_room")
			return response
		}
	}
);

export const addSMSRoom = createAsyncThunk(
	"messenger/addSMSRoom",
	async (data) => {
		const errors = []
		const { sendeeNumber } = data
		const options = { ignore_whitespace: true }

		if(validator.isEmpty(sendeeNumber, options)){
			errors.push("Phone number is required")
		} else if(validator.isMobilePhone(sendeeNumber, "any", {strictMode: true})){

		} else {
			errors.push("Please input a valid phone number")
		}

		if(errors.length > 0) {
			const response = {state: "error_found", errors}
			return response
		} else {
			//const response = await createSMSRoom(data)
			const response = await sendToServer({...data, sendeeNumber: sendeeNumber.replace(" ", "")}, "/create_sms_room")
			return response
		}
	}
)


export const sendMessage = createAsyncThunk(
	"messenger/sendMessage",
	async ({message, senderName}, { getState }) => {
		const state = getState()
		const data = {
			message,
			senderId: state.messenger.personalId,
			senderName,
			roomId: state.messenger.activeConversation
		}

		//const response = await sendMessageToServer(data)
		const response = await sendToServer(data, "/send_message")
		return response;
	}
);

export const sendSMS = createAsyncThunk(
	"messenger/sendSMS",
	async ({message, senderNumber}, { getState }) => {
		const state = getState()
		const data = {
			message,
			senderId: state.messenger.personalId,
			roomId: state.messenger.activeConversation,
			senderNumber,
		}

		const response = await sendToServer(data, "/send_sms")
		return response
	}
)

export const inRoom = createAsyncThunk(
	"messenger/inRoom",
	async ({roomId}, {getState}) => {
		const state = getState()
		const match = (state.messenger.activeConversation != roomId)
		return match
	}
)

export const requestPhoneFromServer = createAsyncThunk(
	"messenger/requestPhoneFromServer",
	async (data,{getState}) => {
		const state = getState()
		await sendToServer({userId: state.messenger.personalId}, "/request_phone")
	}
)

export const sendSystemMsg = createAsyncThunk(
	"messenger/sendSystemMsg",
	async ({name, roomId, stage}, {getState}) => {
		const state = getState()

		const data = {
			message: `${name} ${stage} the call`,
			senderName: "System",
			roomId
		}
		//const response = await sendSysMsgToServer(data)
		const response = await sendToServer(data, "/send_sys_message")
		return response
	}
)


export const messengerSlice = createSlice({
	name: "messenger",
	initialState,
	reducers: {
		setsId: (state, action) => {
			state.personalId = action.payload._id
		},
		pressedCreateConversation: (state, action) => {
			state.mode = action.payload;
		},
		receivedMessage: (state, action) => {
			const { body } = action.payload
			if(state.activeConversation == body.roomId)
				state.messages.push(body)
		},
		joinedRoom: (state, action) => {
	    	const { socket, body } = action.payload
      		socket.emit("fetched-messages", body)
	    },
		sentMessage: (state, action) => {
	    	const { socket, body } = action.payload
      		socket.emit("new-message", body)
	    },
		signOutMessages: (state, action) => {
			state.personalId = null;
			state.activeConversation = null;
			state.type = null;
			state.name = "";
			state.messages = [];
			state.mode = "contacts";
		},

	},
	extraReducers: (builder) => {
		builder
			.addCase(loadActiveConversation.pending, (state, action) => {
				state.activeConversation = action.meta.arg.chatId
				state.name = action.meta.arg.name
				const activeHeader = document.querySelector(".chat-item.active")
				if(activeHeader !== null) {
					activeHeader.classList.remove("active")
				}

				const headers = document.querySelectorAll(".chat-item")
				headers.forEach((header) => {
					const chatId = header.getAttribute("data-link")
					if(chatId == action.meta.arg.chatId) {
						header.classList.add("active")
					}
				})
			})
			.addCase(loadActiveConversation.fulfilled, (state, action) => {

				const userData = action.payload.userData.filter((userData) => {
					if(userData.user == state.personalId){
						return userData
					}
				})
				state.messages = userData[0].messages
				state.type = action.payload.conversationType
				const input = document.querySelector(".form-control.msg-board")
				if(input !== null){
					input.removeAttribute("disabled")
				}
			})

			.addCase(addDirectRoom.fulfilled, (state, action) => {

				const { state: success, room, name, newRoomId } = action.payload

				if(success == "success"){
					const userData = room.userData.filter((userData) => {
						if(userData.user == state.personalId){
							return userData
						}
					})

					state.activeConversation = newRoomId
					state.messages = userData[0].messages
					state.type = room.conversationType
					state.name = name
					
					const input = document.querySelector(".form-control.msg-board")
					if(input !== null){
						input.removeAttribute("disabled")
					}
				}

			})

			.addCase(addGroupRoom.fulfilled, (state, action) => {

				const { state: success, room, name, newRoomId } = action.payload

				if(success == "success"){
					const userData = room.userData.filter((userData) => {
						if(userData.user == state.personalId){
							return userData
						}
					})
					state.activeConversation = newRoomId
					state.messages = userData[0].messages
					state.type = room.conversationType
					state.name = name
					const input = document.querySelector(".form-control.msg-board")
					if(input !== null){
						input.removeAttribute("disabled")
					}

				}

			})

			.addCase(addSMSRoom.fulfilled, (state, action) => {
				const {state: success, room, newRoomId} = action.payload

				if(success == "success") {
					const userData = room.userData.filter((userData) => {
						if(userData.user == state.personalId){
							return userData
						}
					})
					state.activeConversation = newRoomId
					state.messages = room.userData[0].messages
					state.type = room.conversationType
					state.name = room.destinationNumber
					const input = document.querySelector(".form-control.msg-board")
					if(input !== null){
						input.removeAttribute("disabled")
					}

				}
			})

			.addCase(sendSystemMsg.fulfilled, (state, action) => {
				const { body, system, roomId } = action.payload.body
				if(state.activeConversation == roomId)
					state.messages.push(action.payload.body)
			})
	},
});

export const {setsId, pressedCreateConversation, receivedMessage, joinedRoom, sentMessage, signOutMessages} = messengerSlice.actions;

export default messengerSlice.reducer;

export const conversationNameSelector = (state) => state.messenger.name;
export const conversationTypeSelector = (state) => state.messenger.type;
export const conversationMessagesSelector = (state) => state.messenger.messages;
export const modeSelector = (state) => state.messenger.mode;
export const roomSelector = (state) => state.messenger.activeConversation;
