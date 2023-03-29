import React, {useEffect} from "react";
import {
  socketSelector,
  deviceSelector,
  createdProducer,
  recvTransportSelector,
  remoteTrackFound,
  listenToProducer,
} from './videoCallSlice';
import { fullNameSelector } from "../userCred/userCredSlice"
import { receivedMessage, roomSelector } from "../messenger/messengerSlice";
import { useSelector, useDispatch } from 'react-redux';

export function SocketComponent(argument) {
	const socket = useSelector(socketSelector);
	const device = useSelector(deviceSelector);
	const roomId = useSelector(roomSelector)
  const name = useSelector(fullNameSelector)
  const dispatch = useDispatch();
  
  useEffect(() => {
    if(socket !== null) {
      //messages socket
      socket.on("new-message", (result) => {
        dispatch(receivedMessage(result))
      })

      //video call sockets
      socket.on("connect", () => {
        socket.emit("get-router-rtp-capabilities")
      })

      socket.on("router-rtp-capabilities", async ({ routerRtpCapabilities }) => {
        await device.load({routerRtpCapabilities})
      })

      socket.on("producer-transport-created", async (data) => {
        const { params, type } = data
      	const transport = device.createSendTransport(params)

      	transport.on("connect", async({dtlsParameters}, callback, errback) => {
          const data = {
            transportId: transport.id,
            dtlsParameters,
          }
      		const response = await socket.emitWithAck("connect-producer-transport", data);
          callback()

      	})

      	transport.on("produce", async({kind, rtpParameters}, callback, errback) => {
      		
      		const data = {
      			transportId: transport.id,
      			kind,
      			rtpParameters,
      			roomId,
            name,
      		}
          console.log("producing "+ kind)


      		const { id } = await socket.emitWithAck("produce", data);

      		callback(id)
      	})

      	transport.on("connectionstatechange", (state)=> {
      		switch (state) {
      			case "connecting":
      				console.log("connecting")
      				break
      			case "connected":
      				console.log("connected")
      				break
      			case "failed":
      				transport.close()
      				console.log("failed")
      				break
      			default:
      				break
      		} 
      	})

        const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true})

        let track 
        if(type === "video") {
          track = stream.getVideoTracks()[0]
        } else {
          track = stream.getAudioTracks()[0]
        }
				const producer = await transport.produce({ track })
				dispatch(createdProducer({producer}))

      })

      socket.on("new-producer", ({producerIds}) => {
        if(producerIds !== null) {
          const { ids } = producerIds
          ids.forEach((id) => {
            dispatch(listenToProducer({
              name: id.name, 
              socketId: id.socketId, 
              producerId: id.producerId}))
          })
        }

      })

      socket.on("consumer-transport-created", async (data) => {
        const { name, socketId, params } = data
        console.log("transport created to consume")
        const transport = device.createRecvTransport(params)

        transport.on("connect", async ({dtlsParameters}, callback, errback) => {
          const data = {
            dtlsParameters,
            transport: transport.id,
          }

          console.log("transport connected")
          const response = await socket.emitWithAck("connect-consumer-transport", data)
          callback()
        })

        transport.on("connectionstatechange", (state) => {
          switch (state) {
            case "connecting":
              console.log("connecting")
              break
            case "connected":
              console.log("connected")
              break
            case "failed":
              transport.close()
              console.log("failed")
              break
            default:
              break
          }
        })
        const { rtpCapabilities } = device
        const transportParams = await socket.emitWithAck("consume", { rtpCapabilities })

        const {
          producerId,
          id,
          kind,
          rtpParameters,
        } = transportParams

        const codecOptions = {}

        const consumer = await transport.consume({
          producerId,
          id,
          kind,
          rtpParameters,
          codecOptions,
        })

        const stream = new MediaStream()
        stream.addTrack(consumer.track)

        dispatch(remoteTrackFound({consumer, name, socketId}))

      })
    }

  }, [socket])
	return (<>  </>)
}