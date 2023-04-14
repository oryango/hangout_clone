import React, {useEffect} from "react";
import { conversationMessagesSelector } from "../messengerSlice";
import { socketSelector } from "../../videoCall/videoCallSlice";
import { idSelector } from "../../userCred/userCredSlice";
import { useDispatch, useSelector } from "react-redux";


export function MessageBoardDisplay() {
	const dispatch = useDispatch()
	const messages = useSelector(conversationMessagesSelector);
	const id = useSelector(idSelector);	

	return (
		<div className="d-flex flex-row mb-3 navigation-mobile scrollable-chat-panel chat-panel-scroll">
          <div className="w-100 p-3 scroll">
          {/*
            <div className="svg36 loader-animate3 horizontal-margin-auto mb-2"></div>*/}

            {messages.map((message) => { 
            	return message.system === true ? (
            		<div className="text-center letter-space drop-shadow text-uppercase fs-12 w-100 mb-3">{message.body}</div>
            	) : message.senderId === id ? 
            	(
	            	<div className="d-flex flex-row-reverse mb-2">
		              <div className="right-chat-message fs-13 mb-2">
		                <div className="mb-0 mr-3 pr-4">
		                  <div className="d-flex flex-row">
		                    <div className="pr-2">{message.body}</div>
		                    <div className="pr-4"></div>
		                  </div>
		                </div>
		                <div className="message-options dark">
		                  <div className="message-time">
		                    <div className="d-flex flex-row">
		                      <div className="mr-2">You</div>
		                      <div className="svg15 double-check"></div>
		                    </div>
		                  </div>
		                  <div className="message-arrow">You</div>
		                </div>
		              </div>
		            </div>
	            ) : (
	            	<div className="left-chat-message fs-13 mb-2">
		              <p className="mb-0 mr-3 pr-4">{message.body}</p>
		              <div className="message-options">
		                {/*<div className="message-time">{message.senderName}</div>*/}
		              	<div className="message-time">06:52</div>
		                <div className="message-arrow">{message.senderName}</div>
		              </div>
		            </div>
	            )
            })}

            {/*<div className="left-chat-message fs-13 mb-2">
              <p className="mb-0 mr-3 pr-4">Hi, Quan</p>
              <div className="message-options">
                <div className="message-time">06:15</div>
                <div className="message-arrow"><i className="text-muted la la-angle-down fs-17"></i></div>
              </div>
            </div>
            <div className="d-flex flex-row-reverse mb-2">
              <div className="right-chat-message fs-13 mb-2">
                <div className="mb-0 mr-3 pr-4">
                  <div className="d-flex flex-row">
                    <div className="pr-2">Hey, Beate</div>
                    <div className="pr-4"></div>
                  </div>
                </div>
                <div className="message-options dark">
                  <div className="message-time">
                    <div className="d-flex flex-row">
                      <div className="mr-2">06:49</div>
                      <div className="svg15 double-check"></div>
                    </div>
                  </div>
                  <div className="message-arrow"><i className="text-muted la la-angle-down fs-17"></i></div>
                </div>
              </div>
            </div>
            <div className="left-chat-message fs-13 mb-2">
              <p className="mb-0 mr-3 pr-4">Oh hey, I didn’t see you there. Did you already get a table?</p>
              <div className="message-options">
                <div className="message-time">06:52</div>
                <div className="message-arrow"><i className="text-muted la la-angle-down fs-17"></i></div>
              </div>
            </div>*/}
          </div>
        </div>
	);
}