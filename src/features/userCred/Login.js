import React, { useState } from 'react';
import {
  loggedIn,
  verifyLogin,
  fullNameSelector,
  idSelector,
  getSortedRooms,
} from './userCredSlice';
import { setsId } from "../messenger/messengerSlice";
import { startMedia, logSocket } from "../videoCall/videoCallSlice";
import { useDispatch, useSelector } from 'react-redux';
import './Login.css';

export function Login() {
  const dispatch = useDispatch()
  const name = useSelector(fullNameSelector)
  const userId = useSelector(idSelector)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setError] = useState([]);

  const submitForm = async (e) => {
    e.preventDefault()

    const verified = await dispatch(verifyLogin({email, password}));

    if(verified.payload.state === "error_found") {
      setError(verified.payload.errors)
    } else if (verified.payload.state === "success") {
      await dispatch(loggedIn(verified.payload.body))
      dispatch(getSortedRooms({conversationList: verified.payload.body.conversationList}))
      dispatch(setsId(verified.payload.body))
      dispatch(startMedia())
      const userName = `${verified.payload.body.firstName} ${verified.payload.body.lastName}`
      dispatch(logSocket({
        name: userName, 
        userId: verified.payload.body._id, 
        phoneNumber: verified.payload.body.phoneNumber
      }))
    }
  }

  return (
    <>
      <h1> Log In to Hangout </h1>
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
    </>
  )
};
