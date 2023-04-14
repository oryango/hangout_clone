import React, { useState } from 'react';
import {
  loggedIn,
  createAccount,
  fullNameSelector,
  idSelector,
  getSortedRooms,
} from './userCredSlice';
import { setsId } from "../messenger/messengerSlice";
import { startMedia, logSocket } from "../videoCall/videoCallSlice";

import { useDispatch, useSelector } from 'react-redux';
import './Login.css';

export function Register() {
	const dispatch = useDispatch()
  const name = useSelector(fullNameSelector)
  const userId = useSelector(idSelector)
	const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errors, setError] = useState([]);

  const submitForm = async (e) => {
    e.preventDefault()
    
    
  	const data = {
  		firstName: firstName,
  		lastName: lastName,
  		email: email,
  		password: password,
  		passwordConfirm: passwordConfirm
  	}

    const created = await dispatch(createAccount(data));

    console.log(created)

    if(created.payload.state === "error_found") {
      setError(created.payload.errors)
    } else if (created.payload.state === "success") {
    	dispatch(loggedIn(created.payload.body))
      dispatch(getSortedRooms({conversationList: created.payload.body.conversationList}))
      dispatch(setsId(created.payload.body))
      dispatch(startMedia())
      const userName = `${created.payload.body.firstName} ${created.payload.body.lastName}`
      dispatch(logSocket({name: userName, userId: created.payload.body._id}))
    }
  }

	return (
		<>
      <h1> Create an account </h1>
      <form onSubmit={submitForm} className="login-form">
      	<section>
	       	<label className="login-input-container">
	          <p className="login-labels" label> First name: </p>
	          <input 
	            className="login-input" 
	            type="text" 
	            placeholder="First name" 
	            value={firstName} 
	            onChange={(e) => setFirstName(e.target.value)}>
	          </input>
	        </label>
	         <label className="login-input-container">
	          <p className="login-labels" label> Last name: </p>
	          <input 
	            className="login-input" 
	            type="text" 
	            placeholder="Last name" 
	            value={lastName} 
	            onChange={(e) => setLastName(e.target.value)}>
	          </input>
	        </label>
	      </section>
        <label className="login-input-container">
          <p className="login-labels" label> Email: </p>
          <input 
            className="login-input" 
            type="text" 
            placeholder="Email address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}>
          </input>
        </label>
        <label className="login-input-container">
          <p className="login-labels"> Password: </p>
          <input 
            className="login-input" 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}>
          </input>
        </label>
        <label className="login-input-container">
          <p className="login-labels"> Re-enter password: </p>
          <input 
            className="login-input" 
            type="password" 
            placeholder="Confirm password" 
            value={passwordConfirm} 
            onChange={(e) => setPasswordConfirm(e.target.value)}>
          </input>
        </label>
        {errors.map((error)=> {return <h2 className="login-error"> {error} </h2>})}
        <button className="login-button" type="submit">Register</button>
      </form>   
    </> 
	)
}