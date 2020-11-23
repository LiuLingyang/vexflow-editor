import React from "react";
import ReactDOM from "react-dom";
import Demo from "@components/Demo";

ReactDOM.render(<Demo />, document.getElementById("root"));

if (module.hot) {
  module.hot.accept();
}
