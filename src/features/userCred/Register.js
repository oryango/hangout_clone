


export function Register() {
	return (
		<>
      <h1> Create an account </h1>
      <form onSubmit={submitForm} className="login-form">
        <label className="login-input-container">
          <p className="login-labels" label> Email: </p>
          <input 
            className="login-input" 
            type="text" 
            placeholder="Enter your email address..." 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}>
          </input>
        </label>
        <label className="login-input-container">
          <p className="login-labels"> Password: </p>
          <input 
            className="login-input" 
            type="password" 
            placeholder="Enter your password..." 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}>
          </input>
        </label>
        {errors.map((error)=> {return <h2 className="login-error"> {error} </h2>})}
        <button className="login-button" type="submit">Log in</button>
      </form>   
      <p className="register-link" onClick={()=> (setFlag(!loginFlag))}> Already have an account? Log in <b><u>here</u></b>. </p>
    </> 
	)
}