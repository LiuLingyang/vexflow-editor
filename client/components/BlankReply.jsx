import React from "react";
import _ from "util/index";
import BlankEditor from "./BlankEditor";

export default class BlankReply extends React.PureComponent {
  constructor(props) {
    super(props);

    const question = JSON.parse(_.getQueryByKey("question")) || {
      title: "",
    };
    this.state = {
      question,
      reply: {},
    };

    window.getBlankReply = this.gatherData.bind(this);
    window.getBlankQuestion = () => question;
  }

  gatherData() {
    const { reply } = this.state;

    let realReply = _.deepClone(reply);
    delete realReply.title;

    return { iframeData: { reply, realReply } };
  }

  render() {
    const { question } = this.state;
    return (
      <div className="m-blank-reply">
        <div className="m-t-10">
          <BlankEditor
            data={question}
            type="reply"
            onChange={(data) => {
              this.setState({ reply: data });
            }}
          />
        </div>
      </div>
    );
  }
}
