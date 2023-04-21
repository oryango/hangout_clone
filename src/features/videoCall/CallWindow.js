import React from "react";
import { VideoPreview } from "./CallWindowComponent/VideoPreview"
import { CallStatus } from "./CallWindowComponent/CallStatus"

export function CallWindow({callType}) {
	return (<>
		{ callType === "sms" ? 
			<CallStatus /> :
			<VideoPreview callType={callType}/>
		}
	</>)
}
