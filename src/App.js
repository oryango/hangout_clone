import React from "react";
import LoginContainer from "./components/LoginContainer"
import './App.css';

import {
  loggedInSelector,
} from './features/userCred/userCredSlice';
import { useSelector } from 'react-redux';

function App() {
  const logInStatus = useSelector(loggedInSelector);

  return (
    <div className="App">
    {
      !logInStatus ? <LoginContainer /> : null
    }
    </div>
  );
};

export default App;
