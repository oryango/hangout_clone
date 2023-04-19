import React, {useEffect, useState} from "react";
import {
	createProducerTransport,
	listenToProducer,
	videoToggle,
	micToggle,
	getAllProducers,
	callStarted,
	roomIdSelector,
	roomNameSelector,
} from "./videoCallSlice";
import { fullNameSelector } from "../userCred/userCredSlice"
import { VideoPreview } from "./CallWindowComponent/VideoPreview"
import { CallStatus } from "./CallWindowComponent/CallStatus"
import { useSelector, useDispatch } from "react-redux";

export function CallWindow({callType}) {
	const dispatch = useDispatch()

	return (<>
		{ callType === "sms" ? 
			<CallStatus /> :
			<VideoPreview callType={callType}/>
		}
	</>)
}
