import React, {useEffect, useState} from "react";
import {
	createProducerTransport,
	listenToProducer,
	audioToggleSelector,
	videoToggleSelector,
	videoToggle,
	getAllProducers,
	callStarted,
	roomIdSelector,
	roomNameSelector,
} from "../videoCallSlice"
import { sendSystemMsg } from "../../messenger/messengerSlice"
import { fullNameSelector } from "../../userCred/userCredSlice"
import { useSelector, useDispatch } from "react-redux";

export function VideoPreview({callType}) {
	const dispatch = useDispatch()
	const videoEnabled = useSelector(videoToggleSelector)
	const roomId = useSelector(roomIdSelector)
	const roomName = useSelector(roomNameSelector)
	const name = useSelector(fullNameSelector)
	const [webcam, setWebcam] = useState(null)

	const toggleVideoStream = async () => {
		let stream
		if( videoEnabled ) {
			stream = null
			const tracks = webcam.getTracks();

		  tracks.forEach((track) => {
		    track.stop();
		  });
		  setWebcam(null)
		} else {
			stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false})
		}
    setWebcam(stream)
		dispatch(videoToggle())
	}

	const beginCall = async () => {
		if(webcam !== null){
			webcam.getVideoTracks()[0].stop()
			setWebcam(null)
		}
		dispatch(getAllProducers())
		dispatch(createProducerTransport({callType}))
		dispatch(callStarted())
		dispatch(sendSystemMsg({name, roomId, stage: "joined"}))
		//await dispatch(getAllProducers({roomId}))
		//dispatch(listenToProducer())
	}

	return (<>
		<div className="video-container">
			{ videoEnabled ? (
			<video class='local-video self' muted="true" autoplay="true" ref={video => {
	            if (video) {
	              video.srcObject = webcam
	          }}}
	       	>
			</video> ) :
			<i class="las la-video-slash no-video-feed"></i>
			}
		</div>
		<div className="call-btn-container">
			<section className="video-btn-section">
				<button className="video-btn rounded-circle btn btn-light btn-icon text-dark" onClick={()=>{
					toggleVideoStream()
				}}> {videoEnabled ? <i class="las la-video-slash"></i> : <i class="las la-video"></i>} </button> 
			</section>
			<section>
				<button className="call-btn btn btn-light text-dark" onClick={()=>{
					beginCall()
				}}> Start call
				</button> 
			</section>
		</div>
	</>)
}