import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';
import userCredReducer from '../features/userCred/userCredSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    userCred: userCredReducer,
  },
});
