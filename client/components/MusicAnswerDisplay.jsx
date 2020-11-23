import React from "react";
import MusicEditor from "./MusicEditor";
import _ from "util/index";

export default class MusicAnswerDisplay extends React.PureComponent {
  constructor(props) {
    super(props);
    const question = JSON.parse(_.getQueryByKey("question")) || {};
    const answer = JSON.parse(_.getQueryByKey("answer")) || {};
    this.state = {
      question,
      answer,
    };
  }

  render() {
    const { question, answer } = this.state;
    return (
      <div className="m-music-answerDisplay">
        <div
          dangerouslySetInnerHTML={{
            __html: question.title,
          }}
        ></div>
        <div className="m-t-10">
          <MusicEditor data={answer} type="answerDisplay" />
        </div>
      </div>
    );
  }
}
