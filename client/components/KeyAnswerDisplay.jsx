import React from "react";
import KeyEditor from "./KeyEditor";
import _ from "util/index";

export default class KeyAnswerDisplay extends React.PureComponent {
  constructor(props) {
    super(props);
    const answer = JSON.parse(_.getQueryByKey("answer")) || {};
    this.state = {
      answer,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ visible: true });
    }, 500);
  }

  render() {
    const { answer } = this.state;
    return (
      <div className="m-music-blankDisplay">
        <div className="m-t-10">
          {this.state.visible ? (
            <KeyEditor data={answer} type="answerDisplay" />
          ) : null}
        </div>
      </div>
    );
  }
}
