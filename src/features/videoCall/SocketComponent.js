import React, {useEffect} from "react";
import useSound from 'use-sound'
import notifSfx from '../../sounds/notification.mp3'
import callSfx from '../../sounds/call.mp3'
import { toast } from 'react-toastify';
import {
  socketSelector,
  deviceSelector,
  createdProducer,
  remoteTrackFound,
  listenToProducer,
  getRoom,
  connectedConsumer,
  consumerEnded,
  openedWebcam,
  getWebcamStream,
} from './videoCallSlice';
import { 
  fullNameSelector, 
  hasRoom, 
  newRoomAdded, 
  getRoomName, 
  reorderRooms, 
  receivedToken,
} from "../userCred/userCredSlice"
import { 
  receivedMessage, 
  roomSelector, 
  inRoom, 
  joinedRoom, 
  loadActiveConversation 
} from "../messenger/messengerSlice";
import { useSelector, useDispatch } from 'react-redux';

export function SocketComponent(argument) {
	const socket = useSelector(socketSelector);
	const device = useSelector(deviceSelector);
  const name = useSelector(fullNameSelector)
  const activeRoom = useSelector(roomSelector)
  const dispatch = useDispatch();
  const [playMessage] = useSound(notifSfx);
  const [playCall, { stop }] = useSound(callSfx);
  
  const loadContact = ({roomId, roomName}) => {
    const body = {
      previousRoom: activeRoom,
      newRoom: roomId
    }

    dispatch(joinedRoom({body, socket}))
    dispatch(loadActiveConversation({
      chatId: roomId, 
      name: roomName
    }))
  }

  useEffect(() => {
    if(socket !== null) {
      //video call sockets
      socket.on("connect", () => {
        socket.emit("get-router-rtp-capabilities")
      })

      socket.on("log-in", ({token}) => {
        dispatch(receivedToken({token}))
      })

      socket.on("router-rtp-capabilities", async ({ routerRtpCapabilities }) => {
        await device.load({routerRtpCapabilities})
      })

      socket.on("producer-transport-created", async (data) => {
        const { params, type } = data
      	const transport = device.createSendTransport(params)

      	transport.on("connect", async({dtlsParameters}, callback, errback) => {
      		const response = await socket.emitWithAck("connect-producer-transport", {
            transportId: transport.id,
            dtlsParameters,
          });
          callback()

      	})

      	transport.on("produce", async({kind, rtpParameters}, callback, errback) => {
          const {payload: roomId} = await dispatch(getRoom())
      		const data = {
      			transportId: transport.id,
      			kind,
      			rtpParameters,
      			roomId,
            name,
      		}
      		const { id } = await socket.emitWithAck("produce", data);

      		callback(id)
      	})

      	transport.on("connectionstatechange", (state)=> {
      		switch (state) {
      			case "connecting":
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

        const stream = await dispatch(getWebcamStream())
        console.log(stream)

        let track 
        if(type === "video") {
          track = stream.payload.getVideoTracks()[0]
          dispatch(openedWebcam(track))
        } else {
          track = stream.payload.getAudioTracks()[0]
        }
				const producer = await transport.produce({ track })

				dispatch(createdProducer({producer}))

      })

      socket.on("new-producer", ({producerIds}) => {
        if(producerIds !== null) {
          const { ids } = producerIds
          ids.forEach((id) => {
            dispatch(listenToProducer({name: id.name, socketId: id.socketId, producerId: id.producerId}))
          })
        } else {
          console.log("no one in call")
        }
      })

      socket.on("consumer-transport-created", async (data) => {
        const { name,socketId, params, producerId } = data
        const transport = device.createRecvTransport(params)

        transport.on("connect", async ({dtlsParameters}, callback, errback) => {
          const response = await socket.emitWithAck("connect-consumer-transport", {
            dtlsParameters,
            transportId: transport.id,
          })
          callback()
        })

        transport.on("connectionstatechange", (state) => {
          switch (state) {
            case "connecting":
              break
            case "connected":
              dispatch(connectedConsumer({transportId: transport.id}))
              console.log("connected")
              break
            case "failed":
              console.log("failed")
              break
            default:
              break
          }
        })

        const { rtpCapabilities } = device
        const transportParams = await socket.emitWithAck("consume", { rtpCapabilities, producerId, transportId: transport.id })

        const {
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

        dispatch(remoteTrackFound({consumer, name, socketId, transportId: transport.id}))

      })

      socket.on("user-left", ({socketId}) => {
        dispatch(consumerEnded({socketId}))
      })

      //messages socket
      socket.on("new-message", async (result) => {
        dispatch(receivedMessage(result))
      })

      socket.on("new-room-added", ({query}) => {
        dispatch(newRoomAdded({query}))
      })
      socket.on("notification-message", async ({body}) => {
        const notInRoom = await dispatch(inRoom({roomId: body.roomId}))
        const foundRoom = await dispatch(hasRoom({roomId: body.roomId}))

        const activeHeader = document.querySelector(".chat-item.active")
        let currentActiveRoom 
        if(activeHeader !== null) {
          activeHeader.classList.remove("active")
          currentActiveRoom = activeHeader.getAttribute("data-link")
        }

        await dispatch(reorderRooms({body}))

        const headers = document.querySelectorAll(".chat-item")
        headers.forEach((header) => {
          const chatId = header.getAttribute("data-link")
          if(chatId === currentActiveRoom) {
            header.classList.add("active")
          }
        })

        if(foundRoom.payload && notInRoom.payload) {
          playMessage()
          const roomName = await dispatch(getRoomName({roomId: body.roomId}))
          toast(`New message from ${roomName.payload}`, {onClick: () => {
            loadContact({roomName: roomName.payload, roomId: body.roomId})
          }})
        }
      })

      socket.on("call-started", async ({ roomId, roomName: groupName, callType }) => {
        const foundRoom = await dispatch(hasRoom({roomId}))

        if(foundRoom.payload) {
          if(callType === "group") {
            toast(`A user has joined a call in ${groupName}`, {onClick: () => {
              loadContact({roomName: groupName, roomId})
            }})
          } else if (callType === "direct") {
            playCall()
            const roomName = await dispatch(getRoomName({roomId: roomId}))
            toast(`${roomName.payload} is calling you`, {onClick: ()=> {
              loadContact({roomName: roomName.payload, roomId})
            }, onClose: () => stop(), hideProgressBar: false, autoClose: 30000,})
          }
        }
      })
  
    }

  }, [socket])
	return (<>  </>)
}