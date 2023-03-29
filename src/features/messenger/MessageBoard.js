import React from "react";

import { MessageBoardHeader } from "./MessageBoardComponents/MessageBoardHeader";
import { MessageBoardDisplay } from "./MessageBoardComponents/MessageBoardDisplay";
import { MessageBoardInput } from "./MessageBoardComponents/MessageBoardInput";

export function MessageBoard() {
	return(
		<div className="col-md-8 col-12 card-stacked">
      <div className="card shadow-line mb-3 chat chat-panel">
        <MessageBoardHeader />
        <MessageBoardDisplay />
        <MessageBoardInput />
      </div>
    </div>

	)
}