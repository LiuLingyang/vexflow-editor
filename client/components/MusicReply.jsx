import React from "react";
import MusicEditor from "./MusicEditor";
import _ from "util/index";
import "./MusicReply.scss";

export default class MusicReply extends React.PureComponent {
  constructor(props) {
    super(props);
    const question = JSON.parse(_.getQueryByKey("question")) || {
      title: "",
      content: {},
    };
    this.state = {
      question,
      reply: {},
    };

    this.musicEditorChange = this.musicEditorChange.bind(this);

    window.getMusicReply = this.gatherData.bind(this);
    window.getMusicQuestion = () => question;
  }

  musicEditorChange(data) {
    this.setState({ reply: data });
  }

  gatherData() {
    const { reply } = this.state;

    let realReply = _.deepClone(reply);
    delete realReply.frontendId;
    delete realReply.beatDown;
    delete realReply.beatOpen;
    delete realReply.beatUp;
    delete realReply.clef;
    delete realReply.key;
    delete realReply.lineForm;
    realReply.staveDatas &&
      realReply.staveDatas.forEach((item2) => {
        item2.noteSeq.forEach((item3) => {
          item3.keys && item3.keys.sort();
        });
      });

    return { iframeData: { reply, realReply } };
  }

  render() {
    const { question } = this.state;
    return (
      <div className="m-music-reply">
        <div
          dangerouslySetInnerHTML={{
            __html: question.title,
          }}
        ></div>
        <div className="m-t-10">
          <MusicEditor
            data={question.content}
            type="reply"
            onChange={this.musicEditorChange}
          />
        </div>
      </div>
    );
  }
}
