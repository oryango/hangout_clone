import React, {useEffect, useState} from "react";
import {
	consumersSelector,
	webcamSelector,
	switchWebcamState,
	switchMicState,
	socketSelector,
	videoToggleSelector,
	audioToggleSelector,
	callEnded,
	roomIdSelector
} from "./videoCallSlice";
import { fullNameSelector } from "../userCred/userCredSlice"
import { sendSystemMsg } from "../messenger/messengerSlice"
import { useSelector, useDispatch } from "react-redux";

export function InCallWindow({callType}) {
	const dispatch = useDispatch()
	const consumerArray = useSelector(consumersSelector);
	const socket = useSelector(socketSelector);
	const webcam = useSelector(webcamSelector)
	const audioEnabled = useSelector(audioToggleSelector)
	const videoEnabled = useSelector(videoToggleSelector)
	const name = useSelector(fullNameSelector)
	const roomId = useSelector(roomIdSelector)

	const [mainStream, setMainStream] = useState({name: "Select a user", stream: null})

	const leaveCall = () => {
		dispatch(callEnded())
		dispatch(sendSystemMsg({name, roomId, stage: "left"}))
	}

	return(<>
		<div className="video-container">
			<section className="video-name-container"> 
				<p className="video-name"> {mainStream.name} </p>
			</section>
			<video class='local-video' autoplay="true" ref={video => {
	            if (video) {
	              video.srcObject = mainStream.stream
	          }}}
	       	>
			</video>
		</div>

		<div className="flex-container">
			<div className="mini-video" onClick={()=>{setMainStream({ name: "You", stream: webcam})}}>
				<video class='local-video self' autoplay="true" ref={video => {
		            if (video) {
		              video.srcObject = webcam
		          }}}
		       	>
				</video>
				<section className="mini-video-name-container">
					<p className="video-name">You</p>
				</section>
			</div>

			{consumerArray.map((consumer) => { 
				const stream = new MediaStream()
				const video = consumer.consumers.video.consumer
				const audio = consumer.consumers.audio.consumer
				stream.addTrack(video.track)
				stream.addTrack(audio.track)

				return(
					<div className="mini-video" id={consumer.socketId} onClick={()=>{setMainStream({name: consumer.name, stream})}}>
						<video class='local-video' autoplay="true" ref={video => {
				            if (video) {
				              video.srcObject = stream
				          }}}
				       	>
						</video>
						<section className="mini-video-name-container">
							<p className="video-name">{consumer.name}</p>
						</section>
					</div>
				)
			})}
		</div>

		<div className="call-btn-container">
			<section className="video-btn-section">
				<button className="video-btn rounded-circle btn btn-light btn-icon text-dark" 
					onClick={() => {dispatch(switchWebcamState())}}> 
					{videoEnabled ? <i class="las la-video-slash"></i> : <i class="las la-video"></i>} 
				</button>		
				<button className="video-btn rounded-circle btn btn-light btn-icon text-dark"
					onClick={() => {dispatch(switchMicState())}}> 
					{audioEnabled ? <i class="las la-microphone-slash"></i> : <i class="las la-microphone"></i>} 
				</button>
				<button className="video-btn rounded-circle btn btn-light btn-icon text-dark"
					onClick={() => {leaveCall()}}> <i class="las la-phone-alt"></i> </button>
			</section>
		</div>

	</>)
}