import React from "react";
import { LoginContainer } from "./components/LoginContainer";
import { ChatContainer } from "./components/ChatContainer";
import { SocketComponent } from "./features/videoCall/SocketComponent";

import {
  loggedInSelector,
} from './features/userCred/userCredSlice';
import { useSelector, useDispatch } from 'react-redux';

function App() {
  const logInStatus = useSelector(loggedInSelector);
  
  return (
    <div className="App">
      <SocketComponent />
    {
      !logInStatus ? <LoginContainer /> : null
    }
      <ChatContainer />
    </div>
  );
};

export default App;
