import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { verifyUserCred, createUser } from "./userCredAPI";
import validator from "validator";


const initialState = {
  email: null,
  id: null,
  firstName: null,
  lastName: null,
  conversationList: [],
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

    if(errors.length == 0) {
    	const response = await verifyUserCred({email, password});
			return response;
    } else {
    	const data = {state: "error_found", errors}
    	return data
    }
		
	}
);

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

    if(errors.length == 0) {
    	const response = await createUser(data);
			return response;
    } else {
    	const data = {state: "error_found", errors}
    	return data
    }

	}
);

export const userCredSlice = createSlice({
	name: "userCred",
	initialState,
	reducers: {
		loggedIn: (state, action) => {
      console.log(action.payload)
			const { 
        email,
        _id, 
        conversationList, 
        firstName, 
        lastName } = action.payload;

      state.email = email;
      state.id = _id;
      state.conversationList = conversationList;
      state.firstName = firstName;
      state.lastName = lastName;
      state.loggedIn = true;
    },

    signOutUser: (state, action) => {
      state.email = null;
      state.id = null;
      state.firstName = null;
      state.lastName = null;
      state.conversationList = [];
      state.loggedIn = false;
    },
	},
});

export const {loggedIn, signOutUser} = userCredSlice.actions;

export default userCredSlice.reducer;

export const idSelector =  (state) => state.userCred.id
export const emailSelector = (state) => state.userCred.email;
export const conversationSelector = (state) => state.userCred.conversationList;
export const fullNameSelector = (state) => {return `${state.userCred.firstName} ${state.userCred.lastName}`}
export const loggedInSelector = (state) => state.userCred.loggedIn;

