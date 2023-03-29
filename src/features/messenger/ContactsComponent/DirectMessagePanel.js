import React, { useState } from "react";
import { 
  conversationSelector,
  emailSelector, 
  fullNameSelector,
  idSelector,
} from "../../userCred/userCredSlice";
import {
  addDirectRoom, 
} from "../messengerSlice";
import { useSelector, useDispatch } from "react-redux"

export function DirectMessagePanel({senderEmail, senderName, senderId}) {
	const dispatch = useDispatch();
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState([])


	const processCreateDirect = async () => {
		const response = await dispatch(addDirectRoom({ email, senderEmail, senderName, senderId}))
	  if(response.payload.state === "error_found") {
	  	setErrors(response.payload.errors)
	  }
	}

	return (
		<>
    	<p className="title-panel"> Enter email </p>
        <div className="archived-messages d-flex p-3">
          <div className="w-100">
            <div className="d-flex pl-0">
            	<div className="input-group">
                <input type="text" 
      	          value={email} 
    	            onChange={(e) => setEmail(e.target.value)}
  	              className="form-control" 
		              placeholder="Enter full email address" />
                <div className="input-group-append prepend-white" onClick={()=>{
                  processCreateDirect()
                }}>
                  <span className="input-group-text pl-2 pr-2 btn btn-light">
                    <i className="fs-17 las la-search-plus drop-shadow"></i>
                  </span>
                </div>
            	</div>
            </div>
            <div>
           		{errors.map((error)=> {return <h2 className="msg-error"> {error} </h2>})}
            </div>
          </div>
        </div>

	      <div className="archived-messages d-flex p-3">
	        <div className="w-100 btn-panel btn btn-light" onClick={() => {
	          processCreateDirect()
	        }}>
	          <div className="d-flex pl-0">
	            <div className="d-flex flex-row mt-1 full-size">
	              <p className="margin-auto fw-400 text-dark-75 full-size">
	                <span className="margin-auto mr-2">
	                  <i className="fs-17 las la-users drop-shadow"></i>
	                </span>
	                Search User
	              </p>
	            </div>
	            <div>
	            </div>
	          </div>
	        </div>
	      </div>
	 	</>
	)
}