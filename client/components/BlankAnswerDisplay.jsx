import React from "react";
import BlankEditor from "./BlankEditor";
import _ from "util/index";

export default class BlankAnswerDisplay extends React.PureComponent {
  constructor(props) {
    super(props);
    const answer = JSON.parse(_.getQueryByKey("answer")) || {};
    this.state = {
      answer,
    };
  }

  render() {
    const { answer } = this.state;
    return (
      <div className="m-music-blankDisplay">
        <div className="m-t-10">
          <BlankEditor data={answer} type="answerDisplay" />
        </div>
      </div>
    );
  }
}
