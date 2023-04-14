import React,{ useState } from "react";
import { 
  conversationNameSelector, 
  conversationTypeSelector,
  roomSelector, 
  sendSystemMsg,
} from "../messengerSlice";
import { 
  streamClosed, 
  setRoomId,
  inCallSelector,
  callEnded,
  roomIdSelector,
} from "../../videoCall/videoCallSlice"
import { fullNameSelector } from "../../userCred/userCredSlice"
import { useSelector, useDispatch } from "react-redux";
import userProfile from "../../../images/user-profile.svg"
import groupProfile from "../../../images/group.svg"
import selfProfile from "../../../images/notes.svg"
import smsProfile from "../../../images/sms.svg"

import { CallWindow } from "../../videoCall/CallWindow"
import { InCallWindow } from "../../videoCall/InCallWindow"
import { AddGroupModal } from "./AddGroupModal"

import NewWindow from 'react-new-window';

export function MessageBoardHeader() {
  const dispatch = useDispatch()
	const conversationName = useSelector(conversationNameSelector);
  const type = useSelector(conversationTypeSelector);
  const roomId = useSelector(roomSelector)
  const callerRoom = useSelector(roomIdSelector)
  const [callWindow, setCallWindow] = useState(false)
  const [addUser, setAddUser] = useState(false)
  const inCall = useSelector(inCallSelector)
  const name = useSelector(fullNameSelector)

  const features = {
    width: 800,
    height: 580,
    popup: true,
  }

  const displayCallWindow = async () => {
    //const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true})
    //dispatch(openedWebcam(stream))
    dispatch(setRoomId({roomId}))
    setCallWindow(true)
  }
  const closeWindow = () => {
    if(inCall) {
      dispatch(sendSystemMsg({name, roomId: callerRoom, stage: "left"}))
    }

    console.log("close stream")
    setCallWindow(false)
    dispatch(streamClosed())
    dispatch(callEnded())
  }

  const addUserToGroup = () => {
    setAddUser(true)    
  }

  const closeModal = () => {
    setAddUser(false)
  }

	return (
		<div className="p-3 chat-header">
          { callWindow ? 
            <NewWindow 
              title={`Calling ${conversationName}`}
              onBlock={()=>{
                console.log("allow pop up")
              }}
              onUnload={()=>{
                closeWindow()
              }}
              features={features}
            >
              {inCall ? <InCallWindow />  : <CallWindow callType={type} roomName={conversationName} />}
            </NewWindow> : 
            null 
          }
          {
            addUser ? (
              <div className="add-user-container">
                <AddGroupModal closeModal={closeModal}/>             
              </div>
            ) : null
          }
          <div className="d-flex">
            <div className="w-100 d-flex pl-0">
              {type !== null ? (
                <img className="rounded-circle shadow avatar-sm mr-3 chat-profile-picture" src={
                  type === "direct" ? userProfile : 
                  type === "group" ? groupProfile : 
                  type === "sms" ? smsProfile : selfProfile} />
                ) : null}
              <div className="mr-3">
                <p className="fw-400 mb-0 text-dark-75">{conversationName}</p>
                {/*<p className="sub-caption text-muted text-small mb-0"><i className="la la-clock mr-1"></i>last seen today at 09:15 PM</p>*/}
              </div>
            </div>
            <div className="flex-shrink-0 margin-auto">
            {type == "group" ? (
              <a className="rounded-circle btn btn-icon text-dark btn-light" onClick={()=>{
                addUserToGroup()
              }}>
                <i class="las la-plus chat-icon"></i>
              </a>

            ) : null}
            {type !== null && type != "self" ? (
              <a className="rounded-circle btn btn-icon text-dark btn-light" onClick={()=>{
                displayCallWindow()
              }}>
                <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" className="feather">
                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
              </a>
            ) : null}
            { type !== null ? (
              <a className="rounded-circle btn btn-icon text-dark btn-light">
                <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" className="feather">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="12" cy="5" r="1"></circle>
                  <circle cx="12" cy="19" r="1"></circle>
                </svg>
              </a>
            ) : null}
            </div>
          </div>
        </div>
	);
}