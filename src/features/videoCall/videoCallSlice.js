import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as mediasoup from "mediasoup-client";
import { io } from "socket.io-client";

const initialState = {
  device: null, // mediasoup-client device
  socket: null, //socket io
	micProducer: null, // producer for mic
	webcamProducer: null, //producer for webcam
  mic: null, //stream for mic
  webcam: null, //stream for webcam
  producerIds: [], // array of producerIds to be consumed and then removed
	consumersVideo: [], //{ consumer track, name, socketId }
	consumersAudio: [], //{ consumer track, name, socketId }
	audioEnabled: false,
	videoEnabled: false,
};

export const videoCallSlice = createSlice({
	name: "videoCall",
	initialState,
	reducers: {
		startMedia: (state, action) => {
			state.socket = io("/")
			state.device = new mediasoup.Device()
		},
		logSocket: (state, action) => {
			state.socket.emit("log-in", {name: action.payload.name})
		},
		streamClosed: (state, action) => {
			const tracks = state.webcam.getTracks();

		  tracks.forEach((track) => {
		    track.stop();
		  });
			state.webcam = null
		},
		createProducerTransport: (state, action) => {
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
			state.webcam = action.payload
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
			} else {
				state.micProducer = producer
			}
		},
		getAllProducers: async (state, action) => {
			const { roomId } = action.payload
			state.producerIds = await state.socket.emit("get-producers", {roomId})
		},
		listenToProducer: (state, action) => {
			state.socket.emit("create-consumer-transport", action.payload)
		},
		remoteTrackFound: (state, action) => {
			const { consumer, name, socketId } = action.payload
			if(consumer.kind === "video") {
				state.consumersVideo.push({track: consumer.track, name, socketId})
			} else {
				state.consumersAudio.push({track: consumer.track, name, socketId})
			}
		}
	},
});




export const {
	startMedia, 
	logSocket,
	streamClosed,
	createProducerTransport, 
	openedWebcam,
	micToggle,
	videoToggle,
	createdProducer, 
	getAllProducers,
	listenToProducer, 
	remoteTrackFound } = videoCallSlice.actions;

export default videoCallSlice.reducer;

export const socketSelector = (state) => state.videoCall.socket;
export const deviceSelector = (state) => state.videoCall.device;
export const webcamSelector = (state) => state.videoCall.webcam
export const videoToggleSelector = (state) => state.videoCall.videoEnabled
export const audioToggleSelector = (state) => state.videoCall.audioEnabled
export const consumersSelector = (state) => state.videoCall.consumers



