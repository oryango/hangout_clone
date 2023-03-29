import React, {useEffect, useState} from "react";
import {
	createProducerTransport,
	listenToProducer,
	audioToggleSelector,
	videoToggleSelector,
	videoToggle,
	micToggle,
	getAllProducers,
} from "./videoCallSlice";
import { roomSelector } from "../messenger/messengerSlice"
import { useSelector, useDispatch } from "react-redux";

export function CallWindow() {
	const dispatch = useDispatch()
	const roomId = useSelector(roomSelector)
	const videoEnabled = useSelector(videoToggleSelector)
	const audioEnabled = useSelector(audioToggleSelector)
	const [webcam, setWebcam] = useState(null)

	const toggleVideoStream = async () => {
		let stream
		if( videoEnabled ) {
			stream = null
			const tracks = webcam.getTracks();

		  tracks.forEach((track) => {
		    track.stop();
		  });
		} else {
			stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true})
		}
    setWebcam(stream)
		dispatch(videoToggle())
	}

	const beginCall = async () => {
		await dispatch(createProducerTransport())
		await dispatch(getAllProducers({roomId}))
		//dispatch(listenToProducer())
	}



	return (<>
		<div className="video-container">
			{ videoEnabled ? (
			<video class='local-video' muted="true" autoplay="true" ref={video => {
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
				<button className="video-btn rounded-circle btn btn-light btn-icon text-dark" onClick={()=>{
					dispatch(micToggle())
					dispatch(listenToProducer())
				}}> {audioEnabled ? <i class="las la-microphone-slash"></i> : <i class="las la-microphone"></i> }</button> 
			</section>
			<section>
				<button className="call-btn btn btn-light text-dark" onClick={()=>{
					beginCall()
				}}> Begin call
				</button> 
			</section>
		</div>
	</>)
}
