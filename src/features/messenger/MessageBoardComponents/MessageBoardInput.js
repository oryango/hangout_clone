import React, { useState } from "react";
import { 
  sendMessage,
  sentMessage, 
  receivedMessage, 
  roomSelector 
} from "../messengerSlice";
import { socketSelector } from "../../videoCall/videoCallSlice";
import { 
  fullNameSelector, 
  loggedInSelector
} from "../../userCred/userCredSlice";
import { useSelector, useDispatch } from "react-redux";
import validator from "validator";



export function MessageBoardInput() {
  const dispatch = useDispatch()
  const senderName = useSelector(fullNameSelector)
  const [message, setMessage] = useState("")
  const roomId = useSelector(roomSelector)
  const socket = useSelector(socketSelector)
  const loggedIn = useSelector(loggedInSelector)

  const submitMessage = async () => {
    const options = { ignore_whitespace: true }

    if(!validator.isEmpty(message, options) && loggedIn) {
      const result = await dispatch(sendMessage({message, senderName}))
      setMessage("")

      const body = {
        result, 
        roomId
      }
      dispatch(sentMessage({body, socket}))
    }
  }

	return (
		<div className="chat-search pl-3 pr-3">
          <div className="input-group">
            <input type="text" className="form-control msg-board" disabled placeholder="Write a message" 
              value={message}
              onChange={(e) => {setMessage(e.target.value)}}
            />
            <div className="input-group-append prepend-white" onClick={()=>{submitMessage()}}>
              <span className="input-group-text pl-2 pr-2">
                <i className="fs-19 bi bi-cursor ml-2 mr-2"></i>
              </span>
            </div>
          </div>
        </div>
	);
}