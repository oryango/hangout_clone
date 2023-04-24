import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { verifyUserCred, createUser, sortRooms } from "./userCredAPI";
import validator from "validator";
import { Device } from '@twilio/voice-sdk';

const initialState = {
  email: null,
  id: null,
  firstName: null,
  lastName: null,
  conversationList: [], //{type, chatId, name}
  phoneNumber: null,
  device: null,
  call: null,
  loggedIn: false,
};

export const verifyLogin = createAsyncThunk(
	"userCred/verifyLogin",
	async ({email, password}) => {

		let errors = []
    const options = { ignore_whitespace: true }

    if(validator.isEmpty(email, options)) {
      errors.push("Email field is required") 
    } else {
      if(!validator.isEmail(email))
       	errors.push("Please input a valid email address")
    }

    if(validator.isEmpty(password, options)) {
      errors.push("Password field is required")
    }

    if(errors.length === 0) {
    	const response = await verifyUserCred({email, password});
			return response;
    } else {
    	const data = {state: "error_found", errors}
    	return data
    }
		
	}
);

export const getSortedRooms = createAsyncThunk(
  "userCred/getSortedRooms",
  async ({conversationList},{getState}) => {
    const response = await sortRooms({conversationList})
    const sortedIds = []
    response.body.sortedIds.forEach((id)=> { 
     const contact = conversationList.find((unsortedId) => unsortedId.chatId === id._id)
     sortedIds.push({name: contact.name, chatId: id._id, type: id.conversationType})
    })
    return {sortedIds}
  }
)

export const getRoomName = createAsyncThunk(
  "userCred/getRoomName",
  async ({roomId},{getState}) => {
    const state = getState()
    const roomName = state.userCred.conversationList.find((conversation) => {
      return conversation.chatId === roomId
    })

    return roomName.name
  }
)

export const findRoomIdByPhone = createAsyncThunk(
  "userCred/findRoomIdByPhone",
  async ({phoneNumber}, {getState}) => {
    const state = getState()
    const conversation = state.userCred.conversationList.find((conversation) => conversation.name === phoneNumber)
    return conversation
  }
);

export const connectDevice = createAsyncThunk(
  "userCred/connectDevice",
  async ({To}, {getState, dispatch}) => {
    const state = getState()
    if(state.userCred.device){
      const call = await state.userCred.device.connect({
        params: {
          To,
          From: state.userCred.phoneNumber,
          Direction: "outbound",
        }
      })

      call.on("accept", () => {
        console.log("call is ready")
      })

      call.on("disconnect", () => {
        console.log("call disconnected")
        dispatch(hangUp())
      })

      call.on("cancel", () => {
        console.log("call canceled")
      })

      call.on("reject", () => {
        console.log("call rejected")
        dispatch(hangUp())
      })

      call.on('error', (error) => {
        console.log('An error has occurred: ', error);
      })

      return { call }
    }
  }
)

export const createAccount = createAsyncThunk(
	"userCred/createAccount",
	async (data) => {

		let errors = []
		const options = { ignore_whitespace: true }

    if(validator.isEmpty(data.firstName, options)) {
      errors.push("First name field is required") 
    }
    if(validator.isEmpty(data.lastName, options)) {
      errors.push("Last name field is required") 
    }

    if(validator.isEmpty(data.email, options)) {
      errors.push("Email field is required") 
    } else {
      if(!validator.isEmail(data.email))
        errors.push("Please input a valid email address")
    }

    if(validator.isEmpty(data.password, options))
      errors.push("Password field is required")

    if(validator.isEmpty(data.passwordConfirm, options)) {
      errors.push("Confirm password is field is required")
    }
    else {
    	if(data.password	!== data.passwordConfirm) 
    			errors.push("Passwords do not match")
    }

    if(errors.length === 0) {
    	const response = await createUser(data);
			return response;
    } else {
    	const data = {state: "error_found", errors}
    	return data
    }

	}
);

export const hasRoom = createAsyncThunk(
  "userCred/hasRoom",
  async ({roomId}, {getState}) => {
    const state = getState()
    const filterRoom = state.userCred.conversationList.filter((conversation) => {
      const { chatId } = conversation 
      return chatId === roomId ? conversation : null
    })
    return filterRoom.length > 0 ? true : false
  }
)

export const userCredSlice = createSlice({
	name: "userCred",
	initialState,
	reducers: {
		loggedIn: (state, action) => {
			const { 
        email,
        _id, 
        firstName, 
        lastName,
        phoneNumber,
      } = action.payload;

      state.email = email;
      state.id = _id;
      state.firstName = firstName;
      state.lastName = lastName;
      state.phoneNumber = phoneNumber;
      state.loggedIn = true;
    },

    receivedToken: (state, action) => {
      const { token } = action.payload
      const device = new Device(token, {
        codecPreferences: ["opus", "pcmu"],
      })

      device.on("registered", () => {
        console.log("Device ready to receive calls")
      })

      device.on("error", (error) => {
        console.log("Error " + error.message)
      })

      device.on("destroyed", () => {
        console.log("User destroyed")
      })

      device.register()
      state.device = device
    },

    setPhoneMic: (state, action) => {
      const { audioEnabled } = action.payload
      state.device.audio.outgoing(false)
    },

    incomingCall: (state, action) => {
      state.call = action.payload.call
    },

    hangUp: (state, action) => {
      if(state.call !== null){
        state.call.disconnect()
        state.call = null
      }
    },

    callRejected: (state, action) => {
      state.action.call.reject()
      state.action.call = null
    },

    newRoomAdded: (state, action) => {
      const { query } = action.payload
      console.log(query)
      const conversationList = state.conversationList 
      conversationList.unshift(query)
      state.conversationList = conversationList
      console.log(conversationList)
    },

    requestedPhone: (state, action) => {
      state.phoneNumber = "requested"
    },

    reorderRooms: (state, action) => {
      const { body } = action.payload
      console.log(body)
      let targetRoom
      const filterRooms = state.conversationList.filter((conversation) => {
        if(body.roomId !== conversation.chatId) {
          return true
        } else {
          targetRoom = conversation
          return false
        }
      })
      filterRooms.unshift(targetRoom)
      state.conversationList = filterRooms
    },

    signOutUser: (state, action) => {
      state.email = null;
      state.id = null;
      state.firstName = null;
      state.lastName = null;
      state.conversationList = [];
      state.loggedIn = false;
      state.device.destroy();
      state.device = null;
    },
	},
  extraReducers: (builder) => {
    builder
      .addCase(getSortedRooms.fulfilled, (state, action) => {
        const { sortedIds } = action.payload
        state.conversationList = sortedIds
      })

      .addCase(connectDevice.fulfilled, (state, action) => {
        const { call } = action.payload
        state.call = call
      })

    },
});

export const {
  loggedIn, 
  receivedToken, 
  setPhoneMic,
  incomingCall,
  hangUp, 
  callRejected,
  newRoomAdded, 
  requestedPhone, 
  reorderRooms, 
  signOutUser 
} = userCredSlice.actions;

export default userCredSlice.reducer;

export const idSelector =  (state) => state.userCred.id
export const emailSelector = (state) => state.userCred.email;
export const conversationSelector = (state) => state.userCred.conversationList;
export const fullNameSelector = (state) => {return `${state.userCred.firstName} ${state.userCred.lastName}`};
export const loggedInSelector = (state) => state.userCred.loggedIn;
export const phoneSelector = (state) => state.userCred.phoneNumber;
export const phoneStateSelector = (state) => {return state.userCred.device !== null ? state.userCred.device.state : null}
export const callSelector = (state) => state.userCred.call;
export const phoneDeviceSelector = (state) => state.userCred.device;