export async function fetchMessages({chatId}) {
	const response = await fetch(
		"/fetch_messages", 
		{
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({_id: chatId})
		});
	const body = await response.json();
	return body
};

export async function createDirectRoom(data) {
	const response = await fetch(
		"/create_direct_room", 
		{
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(data)
		});
	const body = await response.json();

	return body
};

export async function createGroupRoom(data) {
	console.log(data)
	const response = await fetch(
		"/create_group_room",
		{
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(data)
		}
	)

	const body = await response.json();

	return body

}

export async function createSMSRoom(data) {
	const response = await fetch(
		"/create_sms_room",
		{
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(data)
		}
	)
	const body = await response.json();

	return body
}

export async function sendMessageToServer(data) {
	const response = await fetch(
		"/send_message",
		{
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(data)
		}
	)
	const body = await response.json();
	
	return body
}

export async function sendSysMsgToServer(data) {
	const response = await fetch(
		"/send_sys_message",
		{
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(data)
		}
	)
	const body = await response.json()

	return body
}

export async function sendToServer(data, endpoint) {
	const response = await fetch(
		endpoint,
		{
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(data)
		}
	)
	const body = await response.json()

	return body
}
