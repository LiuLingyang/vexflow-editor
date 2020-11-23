import React from "react";
import _ from "util/index";
import KeyEditor from "./KeyEditor";

export default class KeyReply extends React.PureComponent {
  constructor(props) {
    super(props);

    const question = JSON.parse(_.getQueryByKey("question")) || {
      title: "",
    };
    this.state = {
      question,
      reply: {},
    };

    window.getKeyReply = this.gatherData.bind(this);
    window.getKeyQuestion = () => question;
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ visible: true });
    }, 500);
  }

  gatherData() {
    const { reply } = this.state;

    let realReply = _.deepClone(reply);
    realReply.nodes &&
      realReply.nodes.length &&
      realReply.nodes.forEach((node) => delete node.i);
    realReply.nodes && realReply.nodes.sort((a, b) => a.index - b.index);

    return { iframeData: { reply, realReply } };
  }

  render() {
    const { question } = this.state;
    return (
      <div className="m-key-reply">
        <div className="m-t-10">
          {this.state.visible ? (
            <KeyEditor
              data={question}
              type="reply"
              onChange={(data) => {
                this.setState({ reply: data });
              }}
            />
          ) : null}
        </div>
      </div>
    );
  }
}
