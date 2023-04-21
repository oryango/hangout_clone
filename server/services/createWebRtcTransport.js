const config = require("../config")
const mediasoup = require('mediasoup');


module.exports = async ({data, router, iceServers}) => {
	const {
		maxIncomingBitrate,
		initialAvailableOutgoingBitrate,
	} = config.mediasoup.webRtcTransport

	const transport = await router.createWebRtcTransport({
		listenIps: config.mediasoup.webRtcTransport.listenIps,
		enableUdp: true,
		enableTcp: true,
		preferUdp: true,
		initialAvailableOutgoingBitrate
	})

	await transport.setMaxIncomingBitrate(maxIncomingBitrate)

	return {
		transport,
		params: {
			id: transport.id,
			iceParameters: transport.iceParameters,
			iceCandidates: transport.iceCandidates,
			dtlsParameters: transport.dtlsParameters,
			iceServers : iceServers,
		},
	}
}