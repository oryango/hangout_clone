import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux"
import {  } from "../../userCred/userCredSlice"


export function AddGroupModal({closeModal}) {
	const dispatch = useDispatch();
  	const [email, setEmail] = useState("")
  	const [errors, setErrors] = useState([])

  	const processAddEmail = async () => {
  		//const response = await dispatch(addUserToGroup({email}))
  		//if(response.payload.state === "error_found") {
		  //	setErrors(response.payload.errors)
		//}
  	}

	return(
		<>
			<div className="d-flex">
        		<p className="w-100 d-flex pl-0">Add user to group</p>
        		<div onClick={() => {closeModal()}} className="flex-shrink-0 margin-auto btn btn-light">
        			<i class="las la-times chat-icon"></i>
        		</div>
        	</div>
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
			                  	processAddEmail()
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
		          processAddEmail()
		        }}>
	         		<div className="d-flex pl-0">
	            		<div className="d-flex flex-row mt-1 full-size">
	              			<p className="margin-auto fw-400 text-dark-75 full-size">
				                <span className="margin-auto mr-2">
				                  <i className="fs-17 las la-users drop-shadow"></i>
				                </span>
	                			Add User
	              			</p>
	            		</div>
	          		</div>
		        </div>
		  	</div>
		</>
	)
}