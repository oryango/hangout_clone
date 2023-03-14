import React, { useState } from 'react';
import Login from "../features/userCred/Login";
import Register from "../features/userCred/Register";

export function LoginContainer() {
  const [loginFlag, setFlag] = useState(true);

  return (
    <div className="login-container">
    	{loginFlag ? (
    		<>
    			<Login />
      		<p className="register-link" onClick={()=> (setFlag(!loginFlag))}> Register <b><u>here</u></b>. </p>
    		</>
    	) : (
    		<>
    			<Register />
     	 		<p className="register-link" onClick={()=> (setFlag(!loginFlag))}> Already have an account? Log in <b><u>here</u></b>. </p>
    		</>
    	)}
   	</div>
  )

}