import React, { useState } from "react";
import { 
  phoneSelector,
  requestedPhone,
  fullNameSelector,
  idSelector,
} from "../../userCred/userCredSlice";
import {
  addDirectRoom, 
  requestPhoneFromServer,
  addSMSRoom,
  roomSelector,
} from "../messengerSlice";
import {
	socketSelector,
} from "../../videoCall/videoCallSlice"
import { useSelector, useDispatch } from "react-redux"

export function DirectMessagePanel({senderEmail, senderName, senderId}) {
	const dispatch = useDispatch();
	const personalNumber = useSelector(phoneSelector)
	const socket = useSelector(socketSelector)
	const currentRoom = useSelector(roomSelector)
  const [email, setEmail] = useState("")
  const [errorEmail, setErrorEmail] = useState([])
  const [inputNumber, setNumber] = useState("")
  const [errorNumber, setErrorNum] = useState([])


	const processCreateDirect = async () => {
		const response = await dispatch(addDirectRoom({ email, senderEmail, senderName, senderId}))
	  if(response.payload.state === "error_found") {
	  	setErrorEmail(response.payload.errors)
	  } else {
	  	socket.emit("join-new-room", {previousRoom: currentRoom, roomId: response.payload.newRoomId})
	  }
	}

	const processCreateSMS = async () => {
		if(personalNumber !== "" && personalNumber !== null && personalNumber !== "requested") {
			const response = await dispatch(addSMSRoom({
				sendeeNumber: inputNumber,
				senderName,
				senderId
			}))
			if(response.payload.state === "error_found") {
				setErrorNum(response.payload.errors)
			}
		}
	}

	const requestPhoneNumber = () => {
		dispatch(requestedPhone())
		dispatch(requestPhoneFromServer())
	}

	return (
		<>
    	<p className="title-panel"> Find by email </p>
      <div className="archived-messages d-flex p-3">
        <div className="w-100">
          <div className="d-flex pl-0">
          	<div className="input-group">
              <input type="text" 
    	          value={email} 
  	            onChange={(e) => setEmail(e.target.value)}
	              className="form-control" 
	              placeholder="Enter full email address" />
              <div className="input-group-append prepend-white" onClick={()=>{
                processCreateDirect()
              }}>
                <span className="input-group-text pl-2 pr-2 btn btn-light">
                  <i className="fs-17 las la-search-plus drop-shadow"></i>
                </span>
              </div>
          	</div>
          </div>
          <div>
         		{errorEmail.map((error)=> {return <h2 className="msg-error"> {error} </h2>})}
          </div>
        </div>
      </div>

      <div className="archived-messages d-flex p-3 divider">
        <div className="w-100 btn-panel btn btn-light" onClick={() => {
          processCreateDirect()
        }}>
          <div className="d-flex pl-0">
            <div className="d-flex flex-row mt-1 full-size">
              <p className="margin-auto fw-400 text-dark-75 full-size">
                <span className="margin-auto mr-2">
                  <i className="fs-17 las la-users drop-shadow"></i>
                </span>
                Search User
              </p>
            </div>
            <div>
            </div>
          </div>
        </div>
      </div>

      { personalNumber === "" || personalNumber === null ? (
      	<div className="archived-messages d-flex p-3">
	        <div className="w-100 btn-panel btn btn-light" onClick={() => {
	          requestPhoneNumber()
	        }}>
	          <div className="d-flex pl-0">
	            <div className="d-flex flex-row mt-1 full-size">
	              <p className="margin-auto fw-400 text-dark-75 full-size">
	                <span className="margin-auto mr-2">
	                  <i className="fs-17 las la-tty drop-shadow"></i>
	                </span>
	                 Request virtual phone number 
	              </p>
	            </div>
	            <div>
	            </div>
	          </div>
	        </div>
	      </div>
      ) : personalNumber === "requested" ? (
      	<div className="archived-messages d-flex p-3">
      		<p> Request for phone number still ongoing </p>
      	</div>
      ) : ( <>
				<p className="title-panel"> Find by phone number </p>
	      <div className="archived-messages d-flex p-3">
	        <div className="w-100">
	          <div className="d-flex pl-0">
	          	<div className="input-group">
	              <input type="text" 
	    	          value={inputNumber} 
	  	            onChange={(e) => setNumber(e.target.value)}
		              className="form-control" 
		              placeholder="+(Country Code) XXX XXX XXXX" />
	              <div className="input-group-append prepend-white" onClick={()=>{
	                processCreateSMS()
	              }}>
	                <span className="input-group-text pl-2 pr-2 btn btn-light">
	                  <i className="fs-17 las la-search-plus drop-shadow"></i>
	                </span>
	              </div>
	          	</div>
	          </div>
	          <div>
	         		{errorNumber.map((error)=> {return <h2 className="msg-error"> {error} </h2>})}
	          </div>
	        </div>
	      </div>

	      <div className="archived-messages d-flex p-3">
	        <div className="w-100 btn-panel btn btn-light" onClick={() => {
	          processCreateSMS()
	        }}>
	          <div className="d-flex pl-0">
	            <div className="d-flex flex-row mt-1 full-size">
	              <p className="margin-auto fw-400 text-dark-75 full-size">
	                <span className="margin-auto mr-2">
	                  <i className="fs-17 las la-users drop-shadow"></i>
	                </span>
	                Search User
	              </p>
	            </div>
	            <div>
	            </div>
	          </div>
	        </div>
	      </div>
      </>)}
	 	</>
	)
}