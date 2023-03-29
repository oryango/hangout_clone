import { configureStore } from '@reduxjs/toolkit';
import userCredReducer from '../features/userCred/userCredSlice';
import messengerReducer from '../features/messenger/messengerSlice';
import videoCallReducer from '../features/videoCall/videoCallSlice';


export const store = configureStore({
  reducer: {
    videoCall: videoCallReducer,
    messenger: messengerReducer,
    userCred: userCredReducer,
  },
});
