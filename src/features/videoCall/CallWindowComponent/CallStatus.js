import React, {useState} from "react";
import {
	roomIdSelector,
	directionSelector,
	roomNameSelector,
} from "../videoCallSlice"
import { sendSystemMsg } from "../../messenger/messengerSlice"
import { 
	fullNameSelector, 
	connectDevice, 
	setPhoneMic, 
	hangUp,
} from "../../userCred/userCredSlice"

import { useSelector, useDispatch } from "react-redux";

export function CallStatus() {
	const dispatch = useDispatch()
	const roomName = useSelector(roomNameSelector)
	const roomId = useSelector(roomIdSelector)
	const name = useSelector(fullNameSelector)
	const outbound = useSelector(directionSelector)
	const [callState, setCallState] = useState(outbound ? "standby" : "calling")
	const [audioEnabled, setAudio] = useState(true)

	const startCall = () => {
		dispatch(sendSystemMsg({name, roomId, stage: "started"}))
		dispatch(connectDevice({To: roomName}))
		setCallState("calling")
	}

	const muteMic = () => {
		setAudio(!audioEnabled)
		dispatch(setPhoneMic(audioEnabled))
	}

	const endCall = () => {
		setCallState("standby")
		dispatch(hangUp())
	}

	return(<>
		<div className="phone-name">
			<h2> {roomName} </h2>
		</div>
		<div className="call-btn-container">
			{ callState === "standby" ? (
				<section>
					<button className="call-btn btn btn-light text-dark" onClick={()=>{
						startCall()
					}}> Start call
					</button> 
				</section>
			) : ( <>
				<section className="video-btn-section"> 
					<button className="video-btn rounded-circle btn btn-light btn-icon text-dark" onClick={()=>{
						muteMic()
					}}> {audioEnabled ? <i class="las la-microphone-slash"></i> : <i class="las la-microphone"></i>} </button> 
				</section> 
				<section>
					<button className="call-btn btn btn-light text-dark" onClick={()=>{
						endCall()
					}}> End call
					</button> 
				</section>
			</>)}
		</div>
	</>)
}