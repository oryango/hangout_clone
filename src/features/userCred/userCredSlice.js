import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { verifyUserCred } from "./userCredAPI";

const initialState = {
  email: "testing",
  password: "",
  loggedIn: false
};

export const verifyLogin = createAsyncThunk(
	"userCred/verifyLogin",
	async ({email, password}) => {
		const response = await verifyUserCred({email, password});
		return response;
	}
);

export const createAccount = createAsyncThunk(
	"userCred/createAccount",
	async ({}) => {
		
	}
);

export const userCredSlice = createSlice({
	name: "userCred",
	initialState,
	reducers: {
		loggedIn: (state, action) => {
				const { email, password } = action.payload;
	      state.email = email;
	      state.password = password;
	      state.loggedIn = true;
	    },
	},
});

export const {loggedIn} = userCredSlice.actions;

export default userCredSlice.reducer;

export const emailSelector = (state) => state.userCred.email;

export const loggedInSelector = (state) => state.userCred.loggedIn;