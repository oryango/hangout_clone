import React, { useState } from "react";
import { addGroupRoom, roomSelector } from "../messengerSlice";
import { socketSelector } from "../../videoCall/videoCallSlice"
import { useSelector, useDispatch } from "react-redux";
import validator from "validator";

export function GroupMessagePanel({senderEmail, senderId, senderName}) {
	const dispatch = useDispatch();
  const socket = useSelector(socketSelector)
  const currentRoom = useSelector(roomSelector)
	const [groupName, setGroupName] = useState("") //state for the group name for creating a group
	const [email, setEmail] = useState("")
	const [emailList, setEmailList] = useState([])
	const [errors, setErrors] = useState([])

	const verifyEmail = email => {
		setErrors([])
    let errors = []
    const options = { ignore_whitespace: true }

    if(validator.isEmpty(email, options)) {
      errors.push("Email field is required") 
    } else {
      if(!validator.isEmail(email))
        errors.push("Please input a valid email address")
    }

    if(errors.length == 0) {
      emailList.push(email)
      setEmail("")
      console.log(emailList)
    } else {
      setErrors(errors)
    }
	}

	const processCreateGroup = async () => {
		const response = await dispatch(addGroupRoom({ emails: emailList, senderEmail, senderName, senderId, groupName}))
		console.log(response)
		
		if(response.payload.state === "error_found") {
	  		setErrors(response.payload.errors)
	  } else {
      socket.emit("join-new-room", {previousRoom: currentRoom, roomId: response.payload.newRoomId})
    }
	}

	const removeEmail = toRemoveEmail => {
	    const newEmailList = emailList.filter((email) => {
	      return toRemoveEmail.email != email
	    })
	    setEmailList(newEmailList)
	}

	return (
		<>
			<p className="title-panel"> Enter group name </p>
            <div className="archived-messages d-flex p-3">
              <div className="w-100">
                <div className="d-flex pl-0">
                  <div className="input-group">
                    <input type="text" 
                      value={groupName} 
                      onChange={(e) => setGroupName(e.target.value)}
                      className="form-control" 
                      placeholder="Enter group name" />
                  </div>
                  <div>
                  </div>
                </div>
              </div>
            </div>

            <p className="title-panel"> Add email </p>
            <div className="archived-messages d-flex p-3">
              <div className="w-100">
                <div className="d-flex pl-0">
                  <div className="input-group">
                    <input type="text" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-control" 
                      placeholder="Enter full email address" />
                    <div className="input-group-append prepend-white" onClick={()=>{verifyEmail(email)}}>
                      <span className="input-group-text pl-2 pr-2 btn btn-light">
                        <i className="fs-17 las la-plus-circle drop-shadow"></i>
                      </span>
                    </div>
                  </div>
                  <div>
                  </div>
                </div>
                <div>
                  	{errors.map((error)=> {return <h2 className="msg-error"> {error} </h2>})}
                  </div>
              </div>
            </div>

            <div className="archived-messages d-flex p-3">
              <div className="w-100">
                <div className="d-flex pl-0">
                  <div className="d-flex flex-row mt-1">
                    <p className="margin-auto fw-400 text-dark-75">{emailList.map((email) => {
                      return (
                        <div className="btn btn-light" onClick={()=>{
                          removeEmail({email})
                        }}> 
                          {email} 
                          <span> 
                          <i className="las la-minus-circle"></i> 
                          </span> 
                        </div>
                      )
                    })}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="archived-messages d-flex p-3">
              <div className="w-100 btn-panel btn btn-light" onClick={() => {
                processCreateGroup()
              }}>
                <div className="d-flex pl-0">
                  <div className="d-flex flex-row mt-1 full-size">
                    <p className="margin-auto fw-400 text-dark-75 full-size">
                      <span className="margin-auto mr-2">
                        <i className="fs-17 las la-users drop-shadow"></i>
                      </span>
                      Create Group
                    </p>
                  </div>
                  <div>
                  </div>
                </div>
              </div>
            </div>
		</>
	)
}