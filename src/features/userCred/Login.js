import React, { useState } from 'react';
import {
  loggedIn,
  verifyLogin,
} from './userCredSlice';
import { useDispatch } from 'react-redux';
import './Login.css';
import validator from "validator";

export function Login() {
  const dispatch = useDispatch()

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setError] = useState([]);

  const submitForm = async (e) => {
    e.preventDefault()
    
    setError([])
    const options = { ignore_whitespace: true }

    if(validator.isEmpty(email, options)) {
      const newError = email
      setError(errors => [...errors, "Email field is required"]) 
    } else {
      if(!validator.isEmail(email))
        setError(errors => [...errors, "Please input a valid email address"])
    }

    if(validator.isEmpty(password, options))
      setError(errors => [...errors,  "Password is field is required"])
      return

    if(errors.length == 0) {
      const verified = await dispatch(verifyLogin({email, password}));

      verified.payload !== null ? 
        dispatch(loggedIn({email, password})) : 
        setError(["Incorrect email and/or password. Please try again..."])
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
