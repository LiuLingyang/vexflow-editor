import React from "react";
import { Form, Button, Modal } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import MusicEditor from "./MusicEditor";
import RichEditor from "./RichEditor";
import _ from "@util/index";
import im from "@util/im";
import "./MusicQuestion.scss";

const layout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 22 },
};

export default class MusicQuestion extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      question: {
        title: "",
        content: {},
      },
      answers: [],
    };

    this.richEditorChange = this.richEditorChange.bind(this);
    this.musicEditorChange = this.musicEditorChange.bind(this);

    window.addEventListener("message", this.receiveMessage.bind(this), false);
    window.getMusicData = this.gatherData.bind(this);
  }

  receiveMessage(event) {
    if (
      event.data &&
      ["@devtools-page", "react-devtools-bridge"].includes(event.data.source)
    )
      return;
    if (event.data.iframeData) {
      const { question, answers } = event.data.iframeData;
      this.setState({
        question,
        answers,
      });
    }
  }

  gatherData() {
    const { question, answers } = this.state;

    let realAnswers = _.deepClone(answers);
    realAnswers.forEach((item) => {
      delete item.frontendId;
      delete item.beatDown;
      delete item.beatOpen;
      delete item.beatUp;
      delete item.clef;
      delete item.key;
      delete item.lineForm;
      item.staveDatas.forEach((item2) => {
        item2.noteSeq.forEach((item3) => {
          item3.keys && item3.keys.sort();
        });
      });
    });

    return { iframeData: { question, answers, realAnswers } };
  }

  richEditorChange(html) {
    const { question } = this.state;
    this.setState({
      question: {
        ...question,
        title: html,
      },
    });
  }
  musicEditorChange(data) {
    const { question } = this.state;
    this.setState({
      question: {
        ...question,
        content: data,
      },
    });
  }

  render() {
    let { question, answers, answer, answerVisible, tempAnswer } = this.state;
    let { content, title } = question;
    return (
      <div className="m-music-question m-20" style={{ width: 1000 }}>
        <Form {...layout}>
          <Form.Item label="标题内容" name="title" rules={[{ required: true }]}>
            <RichEditor
              value={title}
              onChange={this.richEditorChange}
              disabledBlank={true}
              disabledKeyImage={true}
            />
          </Form.Item>

          <Form.Item
            label="题目内容"
            name="content"
            rules={[{ required: true }]}
          >
            <MusicEditor
              data={content}
              onChange={this.musicEditorChange}
              type="question"
            />
          </Form.Item>

          <Form.Item
            label="标准答案"
            name="answers"
            rules={[{ required: true }]}
          >
            {answers.map((item, index) => {
              return (
                <Button
                  onClick={() => {
                    this.setState({ answer: item, answerVisible: true });
                  }}
                  className="m-r-4"
                >
                  修改答案
                  <CloseCircleOutlined
                    onClick={(e) => {
                      e.stopPropagation();
                      this.setState({ answers: im.del(answers, index) });
                    }}
                    style={{ color: "#f00" }}
                  />
                </Button>
              );
            })}
            <Button
              onClick={() => {
                this.setState({
                  answer: question.content,
                  answerVisible: true,
                });
              }}
            >
              新增答案
            </Button>
          </Form.Item>
        </Form>

        {answerVisible && (
          <Modal
            width={426}
            visible={answerVisible}
            onCancel={() => {
              this.setState({ answerVisible: false, answer: {} });
            }}
            onOk={() => {
              const index = _.indexOf(
                answers,
                (answer) => answer.frontendId === tempAnswer.frontendId
              );
              if (index > -1) {
                answers = im.set(answers, `${index}`, tempAnswer, true);
              } else {
                answers = im.set(
                  answers,
                  `${answers.length}`,
                  tempAnswer,
                  true
                );
              }
              this.setState({ answers, answerVisible: false, answer: {} });
            }}
          >
            <MusicEditor
              data={_.deepClone(answer)}
              type="answer"
              onChange={(data) => {
                this.setState({
                  tempAnswer: {
                    ...data,
                    frontendId: _.generateFrontendId(),
                  },
                });
              }}
            />
          </Modal>
        )}
      </div>
    );
  }
}
