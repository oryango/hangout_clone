import React from "react";
import { 
  loadActiveConversation, 
  roomSelector,
  joinedRoom,
} from "../messengerSlice";
import { socketSelector } from "../../videoCall/videoCallSlice";
import { useSelector, useDispatch } from "react-redux";
import userProfile from "../../../images/user-profile.svg"
import groupProfile from "../../../images/group.svg"
import selfProfile from "../../../images/notes.svg"
import smsProfile from "../../../images/sms.svg"


export function ContactHeader({conversation}) {
	const { name, chatId, type } = conversation;
	const dispatch = useDispatch();
  const currentRoom = useSelector(roomSelector)
  const socket = useSelector(socketSelector)

  const loadContact = () => {
    const body = {
      previousRoom: currentRoom,
      newRoom: chatId
    }

    dispatch(joinedRoom({body, socket}))
    dispatch(loadActiveConversation({chatId, name}))
  }

	return (
		<div className="chat-item d-flex pl-3 pr-0 pt-3 pb-3" data-link={chatId} onClick={()=> {loadContact()}}>
      <div className="w-100">
        <div className="d-flex pl-0">
          <img alt="Chat type picture" className="rounded-circle shadow avatar-sm mr-3" src={
            type === "direct" ? userProfile : 
            type === "group" ? groupProfile : 
            type === "sms" ? smsProfile : selfProfile} />
          <div>
            <p className="margin-auto fw-400 text-dark-75">{ name }</p>
          </div>
        </div>
      </div>

    </div>
	)
};