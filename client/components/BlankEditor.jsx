import React from "react";
import { getCursorPosition, setCursorPosition } from "@util/cursorPosition";
import Keyboard from "./Keyboard";
import "./BlankEditor.scss";

export default class BlankEditor extends React.PureComponent {
  constructor(props) {
    super(props);
    this.cursorPosition = 0;

    this.getCursor = this.getCursor.bind(this);
    this.insertHTML = this.insertHTML.bind(this);
    this.submit = this.submit.bind(this);
    this.answerMap = {};

    this.titleRef = React.createRef();
    this.keyboardRef = React.createRef();

    this.state = {
      height: 400,
    };

    this.setContentHeight = this.setContentHeight.bind(this);
  }

  componentDidMount() {
    const inputList = document.querySelectorAll(".input-item");
    inputList.forEach((div) => {
      div.removeAttribute("contenteditable");
      div.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          e.stopPropagation();

          inputList.forEach((div) => {
            div.style.borderColor = "#ddd";
          });

          this.editor = div;
          this.editor.style.borderColor = "#1890ff";
          this.getCursor(e);
        },
        false
      );
    });

    this.setState({
      height: window.innerHeight - 240,
    });
  }

  setContentHeight() {
    setTimeout(() => {
      this.setState({
        height: window.innerHeight - this.keyboardRef.current.clientHeight - 10,
      });
    }, 0);
  }

  getCursor() {
    this.cursorPosition = getCursorPosition(this.editor);
  }
  insertHTML(item) {
    if (!this.editor) return;

    if (item.key === "Backspace") {
      // document.execCommand("delete");
      this.editor.innerHTML = "";
    } else if (item.source) {
      this.editor.innerHTML =
        this.editor.innerHTML + `<img src="/static/img/${item.target}.png">`;
      // document.execCommand("insertImage", 0, `/static/img/${item.target}.png`);
    } else {
      this.editor.innerHTML =
        this.editor.innerHTML + (item.key == "Space" ? " " : item.name);
      // document.execCommand(
      //   "insertText",
      //   0,
      //   item.key == "Space" ? " " : item.name
      // );
    }
    this.submit();
  }
  submit() {
    const title =
      this.titleRef.current &&
      this.titleRef.current.innerHTML.replace(/[\n\r]$/, "");
    this.answerMap[this.editor.dataset.key] = {
      score: this.editor.dataset.score || 1,
      content: this.editor.innerHTML.replace(/\s*/g, "").replace(/&nbsp;/g, ""),
    };

    this.props.onChange &&
      this.props.onChange({
        title,
        answerMap: this.answerMap,
      });
  }

  handleKeyboardClick(item) {
    this.insertHTML(item);
  }

  onTabClick(item) {
    this.setContentHeight();
  }

  render() {
    const { type, data = {} } = this.props;
    const { title } = data;
    return (
      <div className="m-blank-editor" style={{ width: "100%" }}>
        {type === "answer" && (
          <div className="phone-bg">
            <div style={{ paddingTop: 100, height: 300, overflowY: "auto" }}>
              <div
                ref={this.titleRef}
                dangerouslySetInnerHTML={{
                  __html: title,
                }}
                style={{ padding: "0 30px" }}
              ></div>
              <div className="foot">
                <div className="keyboard">
                  <Keyboard
                    onClick={(item) => this.handleKeyboardClick(item)}
                    onTabClick={(item) => this.onTabClick(item)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {type === "reply" && (
          <div
            style={{
              paddingTop: 10,
              height: this.state.height,
              overflowY: "auto",
            }}
          >
            <div
              ref={this.titleRef}
              dangerouslySetInnerHTML={{
                __html: title,
              }}
              style={{ padding: "0 30px" }}
            ></div>
            <div className="foot-fixed" ref={this.keyboardRef}>
              <div className="keyboard">
                <Keyboard
                  onClick={(item) => this.handleKeyboardClick(item)}
                  onTabClick={(item) => this.onTabClick(item)}
                />
              </div>
            </div>
          </div>
        )}
        {type === "answerDisplay" && (
          <div style={{ paddingTop: 10 }}>
            <div
              dangerouslySetInnerHTML={{
                __html: title,
              }}
              style={{ padding: "0 30px" }}
            ></div>
          </div>
        )}
      </div>
    );
  }
}
