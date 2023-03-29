import React from "react";
import { Contacts } from "../features/messenger/Contacts";
import { MessageBoard } from  "../features/messenger/MessageBoard";
import "../features/messenger/messenger.css";

import {
  loggedInSelector,
} from '../features/userCred/userCredSlice';
import { useSelector } from 'react-redux';


export function ChatContainer() {
  const logInStatus = useSelector(loggedInSelector);
  const styles = {filter: "blur(0.4rem)"};

	return (
		<div className="main-wrapper" style={!logInStatus ? styles : null}>
    <div className="container">
      <div className="page-content">
        <div className="container mt-5">
          <div className="row">
            <Contacts />
            <MessageBoard />
          </div>
        </div>
      </div>
    </div>
  </div>
	)
}