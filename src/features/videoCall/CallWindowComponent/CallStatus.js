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

	const startCall = () => {
		dispatch(sendSystemMsg({name, roomId, stage: "started"}))
		dispatch(connectDevice({To: roomName}))
		setCallState("calling")
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
				<h7> Please allow mic access in the main browser to continue. Diregard if already allowed </h7>
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