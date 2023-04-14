import React from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
      <ToastContainer 
        position="top-right"
        autoClose={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        theme="light"
      />
      <SocketComponent />
    {
      !logInStatus ? <LoginContainer /> : null
    }
      <ChatContainer />
    </div>
  );
};

export default App;
