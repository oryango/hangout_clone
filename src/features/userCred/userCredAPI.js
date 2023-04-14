export async function verifyUserCred({email, password}) {
	const response = await fetch(
		"/verify_login", 
		{
			method: "POST", 
			headers: { "Content-Type": "application/json"},
			body: JSON.stringify({ email, password })
		});
	const body = await response.json();

	if(body === null) {
		const data = {body, state: "error_found", errors: ["Incorrect email and/or password"]}
		return data
	}
	const data = {body, state: "success"}
	return data
}

export async function createUser(data) {
	const response = await fetch(
		"/create_User",
		{
			method : "POST",
			headers: { "Content-Type": "application/json"},
			body: JSON.stringify(data)
		}
	);
	const	body = await response.json();
	return body;
}

export async function sortRooms(data) {
	const response = await fetch(
		"/sort_rooms",
		{
			method : "POST",
			headers: { "Content-Type": "application/json"},
			body: JSON.stringify(data)
		}
	);
	const	body = await response.json();
	return body;
}