import React from "react";
import { Form, Button, Modal } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import RichEditor from "./RichEditor";
import BlankEditor from "./BlankEditor";
import _ from "@util/index";
import im from "@util/im";
import "./BlankQuestion.scss";

const layout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 22 },
};

export default class BlankQuestion extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      question: {
        title: "",
      },
      answers: [],
    };

    this.richEditorChange = this.richEditorChange.bind(this);

    window.addEventListener("message", this.receiveMessage.bind(this), false);
    window.getBlankData = this.gatherData.bind(this);
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
    realAnswers.map((item) => {
      delete item.frontendId;
      delete item.title;
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

  render() {
    let { question, answers, answer, answerVisible, tempAnswer } = this.state;
    let { title } = question;
    return (
      <div className="m-music-question m-20" style={{ width: 1000 }}>
        <Form {...layout}>
          <Form.Item label="题目内容" name="title" rules={[{ required: true }]}>
            <RichEditor
              value={title}
              disabledKeyImage={true}
              onChange={this.richEditorChange}
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
                  answer: { title: question.title },
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
            <BlankEditor
              data={answer}
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
