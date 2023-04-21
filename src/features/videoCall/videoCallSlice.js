import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as mediasoup from "mediasoup-client";
import { io } from "socket.io-client";



const initialState = {
  device: null, 			// mediasoup-client device
  socket: null, 			//socket io
  roomId: null, 			//mongodb objectId
  roomName: null, 		//name of current room
	micProducer: null, 	// producer for mic
	webcamProducer: null, //producer for webcam
  mic: null, 					//stream for mic
  webcam: null, 			//stream for webcam
	consumers: [],			//{ socketId, name, consumers:{audio:{consumer, transportId: transport}, video:{consumer,transportId: transport}} }
	consumerQueue: [], 	//{socketId, transportId, name, consumer}
	audioEnabled: false,
	videoEnabled: false,
	inCall: false,
	direction: false,
};

export const getRoom = createAsyncThunk(
	"videoCall/getRoom",
	async (data, {getState}) => {
		const state = getState()
		const { roomId } = await state.videoCall.socket.emitWithAck("convert-to-string", {roomId: state.videoCall.roomId})
		return roomId
	}
)

export const videoCallSlice = createSlice({
	name: "videoCall",
	initialState,
	reducers: {
		startMedia: (state, action) => {
			state.socket = io("/")
			state.device = new mediasoup.Device()
		},
		signOutSocket: (state, action) => {
			state.socket.disconnect()
			state.roomId = null
			state.micProducer = null
			state.webcamProducer = null
			state.mic = null
			state.webcam = null
			state.consumers = []
			state.consumerQueue = []
			state.audioEnabled = false
			state.videoEnabled = false
			state.inCall = false
		},
		logSocket: (state, action) => {
			const { name, userId, phoneNumber } = action.payload
			state.socket.emit("log-in", {name, userId, phoneNumber})
		},
		streamClosed: (state, action) => {
			if(state.webcam !== null && state.webcam !== undefined) {
				const tracks = state.webcam.getTracks();

			  tracks.forEach((track) => {
			    track.stop();
			  });
				state.webcam = null
			}
		},
		createProducerTransport: (state, action) => {
			const { callType } = action.payload
			state.socket.emit("call-started", {
				roomId: state.roomId, 
				roomName: state.roomName, 
				callType
			})

			const data = {
				forceTcp: false,
				rtpCapabilities: state.device.rtpCapabilities,
			}
			state.socket.emit("create-producer-transport", ({
				data, 
				type: "video"
		  }))
		  state.socket.emit("create-producer-transport", ({
				data, 
				type: "audio"
		  }))

		},
		openedWebcam: (state, action) => {
			const stream = new MediaStream()
			stream.addTrack(action.payload)
			state.webcam = stream
		},
		switchWebcamState: (state, action) => {
			if(state.videoEnabled) {
				state.webcamProducer.pause()
			} else {
				state.webcamProducer.resume()
			}
			state.videoEnabled = !state.videoEnabled

			//state.socket.emit("producer-paused", {roomId: state.roomId})
		},
		switchMicState: (state, action) => {
			if(state.audioEnabled){
				state.micProducer.pause()
			} else {
				state.micProducer.resume()
			}
			state.audioEnabled = !state.audioEnabled
		},
		micToggle: (state, action) => {
			state.audioEnabled = !state.audioEnabled
		},
		videoToggle: (state, action) => {
			state.videoEnabled = !state.videoEnabled
		},
		createdProducer: (state, action) => {
			const { producer } = action.payload
			if(producer.kind === "video") {
				state.webcamProducer = producer
				state.webcamProducer.pause()
			} else {
				state.micProducer = producer
				state.micProducer.pause()
			}
		},
		getAllProducers: (state, action) => {
			state.socket.emit("get-producers", {roomId: state.roomId})
		},
		listenToProducer: (state, action) => {
			state.socket.emit("create-consumer-transport", action.payload)
		},
		remoteTrackFound: (state, action) => {
			const { consumer, name, socketId, transportId } = action.payload

			const queuedConsumer = state.consumerQueue.find((consumer) => consumer.socketId === socketId)

			if(queuedConsumer === undefined) {
				state.consumerQueue.push({socketId, name, transportId, consumer})
			} else {
				let audio
				let video
				if(consumer.kind === "video") {
					video = {consumer, transportId}
					audio = {consumer: queuedConsumer.consumer, transportId: queuedConsumer.transportId}
				} else {
					video = {consumer: queuedConsumer.consumer, transportId: queuedConsumer.transportId}
					audio = {consumer, transportId}
				}
				state.consumers.push({socketId, name, consumers:{audio, video}})
				state.consumerQueue = state.consumerQueue.filter((consumer) => consumer.socketId !== socketId)
			}
		},
		setRoomCall: (state, action) => {
			state.roomId = action.payload.roomId
			state.roomName = action.payload.roomName
			state.direction = action.payload.direction
		},
		connectedConsumer: (state, action) => {
			const { transportId } = action.payload

			const queuedConsumer = state.consumerQueue.find((consumer) => consumer.transportId === transportId)

			if(queuedConsumer === undefined) {
				const filteredConsumer = state.consumers.find((consumer) => 
					consumer.consumers.video.transportId === transportId || 
					consumer.consumers.audio.transportId === transportId
					)

				if(filteredConsumer.consumers.video.transportId === transportId) {
					filteredConsumer.consumers.video.consumer.resume()
				} else {
					filteredConsumer.consumers.audio.consumer.resume()
				}
			} else {
				queuedConsumer.consumer.resume()
			}

		},
		callStarted: (state, action) => {
			state.audioEnabled = false
			state.videoEnabled = false
			state.inCall = true
		},
		callEnded: (state, action) => {
			state.audioEnabled = false
			state.videoEnabled = false
			state.direction = false
			state.inCall = false
			if(state.mic !== null) {
				state.mic.stop()
				state.mic = null
			}
			if(state.webcam !== null) {
				state.webcam.getVideoTracks()[0].stop()
				state.webcam = null
			}
			if(state.webcamProducer !== null){
				state.socket.emit("stop-producers")
				state.webcamProducer.close()
				state.micProducer.close()
				state.webcamProducer = null
				state.micProducer = null
			}
			if(state.consumerQueue.length > 0) {
				state.socket.emit("stop-consumers")
				state.consumerQueue.forEach((consumer) => {
					consumer.consumer.close()
				})
				state.consumerQueue = []
			}
			if(state.consumers.length > 0) {
				state.socket.emit("stop-consumers")
				state.consumers.forEach((consumer) => {
					consumer.consumers.video.consumer.close()
					consumer.consumers.audio.consumer.close()
				})
				state.consumers = []
			}
		},
		consumerEnded: (state, action) => {
			const { socketId } = action.payload
			const filteredQueuedConsumers = state.consumerQueue.filter((consumer) => {
				return consumer.socketId === socketId
			})
			if(filteredQueuedConsumers.length > 0) {
				const transportIds = {
					transportIds: [
						filteredQueuedConsumers[0].transportId
					]
				}
				state.socket.emit("stop-select-consumers", {transportIds})
				filteredQueuedConsumers[0].consumer.close()
				state.consumerQueue = state.consumerQueue.filter((consumer) => {
					return consumer.socketId !== socketId
				})
			} else {
				const filteredConsumer = state.consumers.filter((consumer) => {
					return consumer.socketId === socketId
				})

				if(filteredConsumer.length > 0) {
					const transportIds = {
						transportIds: [
							filteredConsumer[0].consumers.video.transportId,
							filteredConsumer[0].consumers.audio.transportId,
						]
					}

					state.socket.emit("stop-select-consumers", transportIds)
					filteredConsumer[0].consumers.video.consumer.close()
					filteredConsumer[0].consumers.audio.consumer.close()

					state.consumers = state.consumers.filter((consumer) => {
						return consumer.socketId !== socketId
					})
				}
			}
		},
	},
});




export const {
	startMedia, 
	signOutSocket,
	logSocket,
	streamClosed,
	createProducerTransport, 
	openedWebcam,
	switchWebcamState,
	switchMicState,
	micToggle,
	videoToggle,
	createdProducer, 
	getAllProducers,
	listenToProducer, 
	remoteTrackFound,
	setRoomCall,	
	connectedConsumer,
	callStarted,
	callEnded,
	consumerEnded,
} = videoCallSlice.actions;

export default videoCallSlice.reducer;

export const socketSelector = (state) => state.videoCall.socket;
export const deviceSelector = (state) => state.videoCall.device;
export const webcamSelector = (state) => state.videoCall.webcam;
export const videoToggleSelector = (state) => state.videoCall.videoEnabled;
export const audioToggleSelector = (state) => state.videoCall.audioEnabled;
export const roomIdSelector = (state) => state.videoCall.roomId;
export const roomNameSelector = (state) => state.videoCall.roomName;
export const inCallSelector = (state) => state.videoCall.inCall;
export const consumersSelector = (state) => state.videoCall.consumers
export const directionSelector = (state) => state.videoCall.direction
