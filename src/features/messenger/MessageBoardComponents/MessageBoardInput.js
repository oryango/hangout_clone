import React, { useState } from "react";
import { 
  sendMessage,
  sentMessage, 
  receivedMessage, 
  roomSelector,
  conversationNameSelector,
  sendSMS, 
} from "../messengerSlice";
import { socketSelector } from "../../videoCall/videoCallSlice";
import { 
  fullNameSelector, 
  loggedInSelector, 
  phoneSelector,
} from "../../userCred/userCredSlice";
import { conversationTypeSelector } from "../messengerSlice"
import { useSelector, useDispatch } from "react-redux";
import validator from "validator";



export function MessageBoardInput() {
  const dispatch = useDispatch()
  const senderName = useSelector(fullNameSelector)
  const [message, setMessage] = useState("")
  const roomId = useSelector(roomSelector)
  const type = useSelector(conversationTypeSelector)
  const socket = useSelector(socketSelector)
  const loggedIn = useSelector(loggedInSelector)
  const roomName = useSelector(conversationNameSelector);
  const senderNumber = useSelector(phoneSelector)


  const submitMessage = async () => {
    const options = { ignore_whitespace: true }
    if(!validator.isEmpty(message, options) && loggedIn) {
      let result
      if(type === "sms") {
        result = await dispatch(sendSMS({message, senderNumber}))
      } else {
        result = await dispatch(sendMessage({message, senderName}))
      }

      setMessage("")

      const body = {
        result,
        roomId,
        roomName,
      }
      dispatch(sentMessage({body, socket}))
    }
  }

  const submitForm = (e) => {
    e.preventDefault()
    submitMessage()
  }

	return (
		<div className="chat-search pl-3 pr-3">
          <form onSubmit={submitForm}>
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
              <button hidden type="submit"> </button>
            </div>
          </form>
        </div>
	);
}