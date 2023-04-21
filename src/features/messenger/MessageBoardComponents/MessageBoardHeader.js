import React,{ useState, useEffect } from "react";
import { 
  conversationNameSelector, 
  conversationTypeSelector,
  roomSelector, 
  sendSystemMsg,
  loadActiveConversation,
  joinedRoom,
} from "../messengerSlice";
import { 
  streamClosed, 
  setRoomCall,
  inCallSelector,
  callEnded,
  roomIdSelector,
  socketSelector,
} from "../../videoCall/videoCallSlice"
import { 
  fullNameSelector, 
  phoneStateSelector, 
  callSelector,
  phoneDeviceSelector,
  incomingCall,
  hangUp,
  findRoomIdByPhone,
  callRejected,
} from "../../userCred/userCredSlice"
import { useSelector, useDispatch } from "react-redux";
import userProfile from "../../../images/user-profile.svg"
import groupProfile from "../../../images/group.svg"
import selfProfile from "../../../images/notes.svg"
import smsProfile from "../../../images/sms.svg"
import { toast } from 'react-toastify';

import { CallWindow } from "../../videoCall/CallWindow"
import { InCallWindow } from "../../videoCall/InCallWindow"
import { AddGroupModal } from "./AddGroupModal"

import NewWindow from 'react-new-window';

export function MessageBoardHeader() {
  const dispatch = useDispatch()
  //messengerSlice
	const conversationName = useSelector(conversationNameSelector);
  const type = useSelector(conversationTypeSelector);
  const roomId = useSelector(roomSelector)

  //videoCallSlice
  const inCall = useSelector(inCallSelector)
  const callerRoom = useSelector(roomIdSelector)
  const socket = useSelector(socketSelector)

  //userCredSlice
  const name = useSelector(fullNameSelector)
  const phoneReady = useSelector(phoneStateSelector)
  const call = useSelector(callSelector) 
  const phoneDevice = useSelector(phoneDeviceSelector)

  const [callWindow, setCallWindow] = useState(false)
  const [addUser, setAddUser] = useState(false)
  const [callType, setCallType] = useState("")
  const [callingRoom, setCallingRoom] = useState()

  const features = {
    width: 800,
    height: 580,
    popup: true,
  }

  const loadContact = ({newRoomId, roomName}) => {
    const body = {
      previousRoom: roomId,
      newRoom: newRoomId
    }

    dispatch(joinedRoom({body, socket}))
    dispatch(loadActiveConversation({
      chatId: newRoomId, 
      name: roomName
    }))
  }

  const handleIncomingCall = async (call) => {
    dispatch(incomingCall({call}))
    const newRoom = await dispatch(findRoomIdByPhone({phoneNumber: call.parameters.From}))
    setCallingRoom(newRoom.chatId)

    toast(`${call.parameters.From} is calling you`, {onClick: () => {
      loadContact({roomName: call.parameters.From, newRoomId: newRoom.chatId})
    }})

    call.on("accept", () => {
      console.log("call accepted")
    })

    call.on("disconnect", () => {
      dispatch(hangUp())
      console.log("call disconnected")
    })

    call.on("cancel", () => {
      dispatch(hangUp())
      console.log("call canceled")
    })

    call.on("reject", () => {
      console.log("call rejected")
    })

    call.on('error', (error) => {
      console.log('An error has occurred: ', error);
    })
  }

  useEffect(()=> {
    if(phoneReady){
      phoneDevice.off("incoming", handleIncomingCall)
      phoneDevice.on("incoming", handleIncomingCall)
    }
  }, [phoneDevice])

  const displayCallWindow = async () => {
    if(!callWindow) {
      if((type === "sms" && phoneReady === "registered") || type !== "sms"){
        dispatch(setRoomCall({roomId, roomName:conversationName, direction: true }))
      }
      setCallType(type)
      setCallWindow(true)
    }
  }

  const closeWindow = () => {
    if(inCall) {
      dispatch(sendSystemMsg({name, roomId: callerRoom, stage: "left"}))
    }
    if(call !== null) {
      dispatch(hangUp())
    }

    setCallWindow(false)
    dispatch(streamClosed())
    dispatch(callEnded())
  }

  const acceptCall = () => {
    call.accept()
    dispatch(setRoomCall({callingRoom, roomName:conversationName, direction: false }))
    setCallType("sms")
    setCallWindow(true)
  }

  const rejectCall = () => {
    dispatch(callRejected())
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
              {inCall ? <InCallWindow callType={callType} />  : <CallWindow callType={callType}/>}
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

            {/*add to group button*/}
           {/* {type == "group" ? (
              <a className="rounded-circle btn btn-icon text-dark btn-light" onClick={()=>{
                addUserToGroup()
              }}>
                <i class="las la-plus chat-icon"></i>
              </a>

            ) : null}*/}

            {/*accept or reject call*/}
            {call !== null && !callWindow && callingRoom == roomId ? ( <>
              <a className="rounded-circle btn btn-icon text-dark btn-light" onClick={()=>{
                acceptCall()
              }}>
                <i class="las la-phone chat-icon"></i>
              </a>

              <a className="rounded-circle btn btn-icon text-dark btn-light" onClick={()=>{
                rejectCall()
              }}>
                <i class="las la-phone-slash chat-icon"></i>
              </a>

            </>) : null}

            {/*call function - not available to self rooms*/}
            {type !== null && type !== "self" && !callWindow && call === null ? (
              <a className="rounded-circle btn btn-icon text-dark btn-light" onClick={()=>{
                displayCallWindow()
              }}>
                { type !== "sms" ?
                  (<svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" className="feather">
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>) : 
                  phoneReady === "registered" ? <i class="las la-phone chat-icon"></i> : <i class="las la-phone-slash chat-icon"></i>
                }
              </a>
            ) : null}

            {/*empty settings button*/}
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