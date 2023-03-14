export async function verifyUserCred({email, password}) {
	const response = await fetch(
		"/verify_login", 
		{
			method: "POST", 
			headers: { "Content-Type": "application/json"},
			body: JSON.stringify({ email, password })
		});
	const data = await response.json();
	return data;
}