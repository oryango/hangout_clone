import React,{ useState } from "react";
import { 
  conversationNameSelector, 
  conversationTypeSelector 
} from "../messengerSlice";
import { streamClosed, } from "../../videoCall/videoCallSlice"
import { useSelector, useDispatch } from "react-redux";
import userProfile from "../../../images/user-profile.svg"
import groupProfile from "../../../images/group.svg"
import selfProfile from "../../../images/notes.svg"
import { CallWindow } from "../../videoCall/CallWindow"
import NewWindow from 'react-new-window';

export function MessageBoardHeader() {
  const dispatch = useDispatch()
	const conversationName = useSelector(conversationNameSelector);
  const type = useSelector(conversationTypeSelector);
  const [callWindow, setCallWindow] = useState(false)

  const displayCallWindow = async () => {
    //const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true})
    //dispatch(openedWebcam(stream))
    setCallWindow(true)
  }
  const closeWindow = () => {
    console.log("close stream")
    setCallWindow(false)
    dispatch(streamClosed())
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
            >
              {false ? null : <CallWindow />}
            </NewWindow> : 
            null 
          }
          <div className="d-flex">
            <div className="w-100 d-flex pl-0">
              {type !== null ? (
                <img className="rounded-circle shadow avatar-sm mr-3 chat-profile-picture" src={type === "direct" ? userProfile : type === "group" ? groupProfile : selfProfile} />
                ) : null}
              <div className="mr-3">
                <p className="fw-400 mb-0 text-dark-75">{conversationName}</p>
                {/*<p className="sub-caption text-muted text-small mb-0"><i className="la la-clock mr-1"></i>last seen today at 09:15 PM</p>*/}
              </div>
            </div>
            
              <div className="flex-shrink-0 margin-auto">
                <a href="#" className="btn btn-sm btn-icon btn-light active text-dark ml-2">
                  <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" className="feather">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </a>
                <a className="rounded-circle btn btn-icon text-dark btn-light" onClick={()=>{
                  displayCallWindow()
                }}>
                  <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" className="feather">
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                </a>
                <a href="#" className="rounded-circle btn btn-icon text-dark btn-light">
                  <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" className="feather">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </a>
                <a href="#" className="rounded-circle btn btn-icon text-dark btn-light">
                  <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" className="feather">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="12" cy="5" r="1"></circle>
                    <circle cx="12" cy="19" r="1"></circle>
                  </svg>
                </a>
              </div>
          </div>
        </div>
	);
}