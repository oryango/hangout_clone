import React, { useState } from "react";
import { ContactHeader } from "./ContactsComponent/ContactHeader";
import { DirectMessagePanel } from "./ContactsComponent/DirectMessagePanel"
import { GroupMessagePanel } from "./ContactsComponent/GroupMessagePanel"
import { 
  conversationSelector,
  emailSelector, 
  fullNameSelector,
  idSelector,
  signOutUser,
} from "../userCred/userCredSlice";
import {
  modeSelector, 
  pressedCreateConversation,
  signOutMessages,
} from "./messengerSlice";
import { signOutSocket } from "../videoCall/videoCallSlice"
import { useSelector, useDispatch } from "react-redux";
import userProfile from "../../images/user-profile.svg"



export function Contacts() {
  const dispatch = useDispatch();

	const conversationList = useSelector(conversationSelector);
  const mode = useSelector(modeSelector);
  const personalEmail = useSelector(emailSelector)
  const fullName = useSelector(fullNameSelector)
  const personalId = useSelector(idSelector)

  const [convTypeSwitch, setConvTypeSwitch] = useState("direct")

  const createConversation = () => {
    setConvTypeSwitch("direct")
    dispatch(pressedCreateConversation("create"))
  };

  const changeConvType = ({buttonClasses, type}) => {

    if(!buttonClasses.contains("btn-selected")) {
      document.querySelectorAll(".btn.btn-shadow.btn-light").forEach((button) => {
        button.classList.toggle("btn-selected")
      })
      setConvTypeSwitch(type)
    }
       
  }

  const signOut = () => {
    dispatch(signOutUser())
    dispatch(signOutMessages())
    dispatch(signOutSocket())
  }

	return(
		<div className="col-md-4 col-12 card-stacked">
      <div className="card shadow-line mb-3 chat">
        <div className="chat-user-detail">
          <div className="p-3 chat-header">
            <div className="w-100">
              <div className="d-flex pl-0">
                <div className="d-flex flex-row mt-1 mb-1">
                  <span className="margin-auto mr-2">
                    <a href="#" className="user-undetail-trigger btn btn-sm btn-icon btn-light active text-dark ml-2">
                      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" className="feather">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </a>
                  </span>
                  <p className="margin-auto fw-400 text-dark-75">Profile</p>
                </div>
                <div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 chat-header">
          <div className="d-flex">
            <div className="w-100 d-flex pl-0">
              <img className="user-detail-trigger rounded-circle shadow avatar-sm mr-3 chat-profile-picture" src={userProfile} />
            </div>
            <div className="flex-shrink-0 margin-auto">
              <a className="btn btn-sm btn-icon btn-light active text-dark ml-2" onClick={() => {createConversation()}}>
                <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" className="feather">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </a>
              <a className="btn btn-sm btn-icon btn-light active text-dark ml-2" onClick={()=> {signOut()}}>
                <i class="las la-sign-out-alt chat-icon"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="chat-user-panel scroll">
          <div className="pb-3 d-flex flex-column navigation-mobile pagination-scrool chat-user-scroll">
            {/*<div className="chat-item active d-flex pl-3 pr-0 pt-3 pb-3">
              <div className="w-100">
                <div className="d-flex pl-0">
                  <img className="rounded-circle shadow avatar-sm mr-3" src="https://user-images.githubusercontent.com/35243461/168796877-f6c8819a-5d6e-4b2a-bd56-04963639239b.jpg" />
                  <div>
                    <p className="margin-auto fw-400 text-dark-75">Beate Lemoine</p>
                    <div className="d-flex flex-row mt-1">
                      <span>
                        <div className="svg15 double-check"></div>
                      </span>
                      <span className="message-shortcut margin-auto fw-400 fs-13 ml-1 mr-4">Hey Quan, If you are free now we can meet tonight ?</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 margin-auto pl-2 pr-3">
                <div className="d-flex flex-column">
                  <p className="text-muted text-right fs-13 mb-2">08:21</p>
                  <span className="round badge badge-light-success margin-auto">2</span>
                </div>
              </div>
            </div>*/}

            {
              mode === "contacts" ? 
                conversationList.map((conversation) => { return <ContactHeader conversation={conversation} /> }) :
                (
                  <>
                  <div className="archived-messages d-flex p-3 btn-panel btn btn-light" onClick={() => {dispatch(pressedCreateConversation("contacts"))}}>
                    <div className="w-100">
                      <div className="d-flex pl-0">
                        <div className="d-flex flex-row mt-1">
                          <span className="margin-auto mr-2">
                            <i className="fs-17 las la-angle-left drop-shadow"></i>
                          </span>
                          <p className="margin-auto fw-400 text-dark-75">Return to Contacts</p>
                        </div>
                        <div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="archived-messages d-flex p-3 margin-sides"> 
                    <button className="btn btn-left-side btn-shadow btn-light btn-selected" onClick={(e) => {
                      changeConvType({type: "direct", buttonClasses: e.target.classList})
                    }}>
                      Message User 
                    </button><button className="btn btn-right-side btn-shadow btn-light" onClick={(e) => {
                      changeConvType({type: "group", buttonClasses: e.target.classList})
                    }}> 
                      Create Group 
                    </button> 
                  </div>

                  {convTypeSwitch === "direct" ? (
                    <>
                      <DirectMessagePanel senderName={fullName} senderId={personalId} senderEmail={personalEmail} />
                    </>
                  ) : (
                    <>
                      <GroupMessagePanel senderName={fullName} senderId={personalId} senderEmail={personalEmail} />
                    </>
                  )} 
                  
                  </>
                )
            }
          </div>
        </div>
      </div>
    </div>

	)
}