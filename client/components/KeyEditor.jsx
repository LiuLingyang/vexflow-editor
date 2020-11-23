import React from "react";
import { Row, Col, Button } from "antd";
import KeyLayout from "./KeyLayout";
import _ from "@util/index";
import im from "@util/im";
import "./KeyEditor.scss";

const INIT_NODES = [
  { x: 0, y: 5, w: 1, h: 1, t: "sharp", index: 0, i: _.generateFrontendId() },
  { x: 0, y: 5, w: 1, h: 1, t: "sharp", index: 1, i: _.generateFrontendId() },
];

export default class KeyEditor extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      nodes: props.data.nodes || INIT_NODES,
      selected: (props.data.nodes || INIT_NODES)[0].i,
    };
  }

  componentDidMount() {
    const imageWrap = document.querySelector(".media-wrap");
    if (imageWrap) {
      this.replaceEle.style.top = imageWrap.offsetTop + "px";
    }
  }

  findNode(selected) {
    const { nodes } = this.state;
    const index = _.indexOf(nodes, (node) => node.i === selected);
    const node = nodes[index];
    return {
      node,
      index,
    };
  }
  changeSelected = (item) => {
    this.setState({ selected: item.i });
  };

  handleMoveUp = () => {
    let { nodes, selected } = this.state;
    const { index, node } = this.findNode(selected);
    if (node.y === 0) return;
    nodes = im.set(
      nodes,
      `${index}`,
      im.set(node, "y", node.y - 1, true),
      true
    );
    this.setState({ nodes }, this.onChange);
  };
  handleMoveDown = () => {
    let { nodes, selected } = this.state;
    const { index, node } = this.findNode(selected);
    if (node.y === 10) return;
    nodes = im.set(
      nodes,
      `${index}`,
      im.set(node, "y", node.y + 1, true),
      true
    );
    this.setState({ nodes }, this.onChange);
  };
  handleAdd = () => {
    let { nodes, selected } = this.state;
    const { index, node } = this.findNode(selected);

    const nextFrontendId = _.generateFrontendId();
    const nextNode = Object.assign({}, node, {
      x: node.x + 1,
      y: 4,
      w: 1,
      h: 1,
      t: "sharp",
      i: nextFrontendId,
    });
    const nextNodes = nodes.slice();
    nextNodes[nextNodes.length] = nextNode;
    this.setState(
      { nodes: nextNodes, selected: nextFrontendId },
      this.onChange
    );
  };
  handleDel = () => {
    let { nodes, selected } = this.state;
    const { index, node } = this.findNode(selected);

    if (node.x === 0) return; // 不允许删除第一个节点

    const nextNodes = nodes.slice();
    nextNodes.splice(index, 1);
    this.setState(
      { nodes: nextNodes, selected: nextNodes[0].i },
      this.onChange
    );
  };
  changeKey(key) {
    let { nodes, selected } = this.state;
    const { index, node } = this.findNode(selected);
    nodes = im.set(nodes, `${index}`, im.set(node, "t", key, true), true);
    this.setState({ nodes }, this.onChange);
  }
  onChange = () => {
    const {
      data: { title },
    } = this.props;
    this.props.onChange &&
      this.props.onChange({ title, nodes: this.state.nodes });
  };

  render() {
    const {
      type,
      data: { title },
    } = this.props;
    const { nodes, selected } = this.state;
    const firstLayout = nodes.filter((node) => node.index === 0);
    const secondLayout = nodes.filter((node) => node.index === 1);
    return (
      <div className="m-key-editor" style={{ width: "100%" }}>
        {type === "answer" && (
          <div className="phone-bg">
            <div style={{ paddingTop: 100 }}>
              <div
                dangerouslySetInnerHTML={{
                  __html: title,
                }}
                style={{ padding: "0 30px" }}
              ></div>
              <div
                className="f-pa"
                style={{ padding: "0 30px", width: 378 }}
                ref={(ele) => {
                  this.replaceEle = ele;
                }}
              >
                <img
                  src="/static/img/BigSpectrum.jpg"
                  style={{ width: "100%" }}
                />
                <div className="key-layout">
                  <KeyLayout
                    width={200}
                    height={70}
                    selected={selected}
                    layout={firstLayout}
                    changeSelected={this.changeSelected}
                  />
                </div>
                <div className="key-layout" style={{ top: 112 }}>
                  <KeyLayout
                    width={200}
                    height={70}
                    selected={selected}
                    layout={secondLayout}
                    changeSelected={this.changeSelected}
                  />
                </div>
              </div>
              <div className="foot">
                <div className="keyboard" style={{ padding: "0 20px" }}>
                  <Row>
                    <Col span={6}>
                      <div className="f-pr f-tac m-t-8">
                        <Button
                          style={{
                            width: "100%",
                            height: 24,
                          }}
                          onClick={this.handleMoveUp}
                        >
                          <img src="/static/img/up.png" style={{ width: 24 }} />
                        </Button>
                        <Button
                          style={{
                            width: "100%",
                            height: 24,
                          }}
                          onClick={this.handleMoveDown}
                        >
                          <img
                            src="/static/img/down.png"
                            style={{ width: 24 }}
                          />
                        </Button>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="f-tac m-l-4 m-t-8">
                        <Button
                          style={{
                            width: 50,
                            height: 50,
                          }}
                          onClick={() => this.changeKey("sharp")}
                        >
                          <img
                            src="/static/img/key-sharp.png"
                            style={{ height: "100%" }}
                          />
                        </Button>
                        <Button
                          style={{
                            width: 50,
                            height: 50,
                          }}
                          onClick={() => this.changeKey("flat")}
                        >
                          <img
                            src="/static/img/key-flat.png"
                            style={{ height: "100%" }}
                          />
                        </Button>
                      </div>
                    </Col>
                    <Col span={4}>
                      <div className="m-l-4 m-t-8">
                        <Button
                          style={{ width: "100%", height: 24 }}
                          onClick={this.handleAdd}
                        >
                          +
                        </Button>
                        <br />
                        <Button
                          style={{ width: "100%", height: 24 }}
                          onClick={this.handleDel}
                          className="m-t-5"
                        >
                          -
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>
          </div>
        )}
        {type === "reply" && (
          <div style={{ paddingTop: 10 }}>
            <div
              dangerouslySetInnerHTML={{
                __html: title,
              }}
              style={{ padding: "0 30px" }}
            ></div>
            <div
              className="f-pa"
              style={{ padding: "0 30px", width: 378, margin: "0 auto" }}
              ref={(ele) => {
                this.replaceEle = ele;
              }}
            >
              <img
                src="/static/img/BigSpectrum.jpg"
                style={{ width: "100%" }}
              />
              <div className="key-layout">
                <KeyLayout
                  width={150}
                  height={70}
                  selected={selected}
                  layout={firstLayout}
                  changeSelected={this.changeSelected}
                />
              </div>
              <div className="key-layout" style={{ top: 112 }}>
                <KeyLayout
                  width={150}
                  height={70}
                  selected={selected}
                  layout={secondLayout}
                  changeSelected={this.changeSelected}
                />
              </div>
            </div>
            <div className="foot-fixed">
              <div className="keyboard" style={{ padding: "0 20px" }}>
                <Row>
                  <Col span={6}>
                    <div className="f-pr f-tac m-t-8">
                      <Button
                        style={{
                          width: "100%",
                          height: 24,
                        }}
                        onClick={this.handleMoveUp}
                      >
                        <img src="/static/img/up.png" style={{ width: 24 }} />
                      </Button>
                      <Button
                        style={{
                          width: "100%",
                          height: 24,
                        }}
                        onClick={this.handleMoveDown}
                      >
                        <img src="/static/img/down.png" style={{ width: 24 }} />
                      </Button>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="f-tac m-l-4 m-t-8">
                      <Button
                        style={{
                          width: 50,
                          height: 50,
                        }}
                        onClick={() => this.changeKey("sharp")}
                      >
                        <img
                          src="/static/img/key-sharp.png"
                          style={{ height: "100%" }}
                        />
                      </Button>
                      <Button
                        style={{
                          width: 50,
                          height: 50,
                        }}
                        onClick={() => this.changeKey("flat")}
                      >
                        <img
                          src="/static/img/key-flat.png"
                          style={{ height: "100%" }}
                        />
                      </Button>
                    </div>
                  </Col>
                  <Col span={4}>
                    <div className="m-l-4 m-t-8">
                      <Button
                        style={{ width: "100%", height: 24 }}
                        onClick={this.handleAdd}
                      >
                        +
                      </Button>
                      <br />
                      <Button
                        style={{ width: "100%", height: 24 }}
                        onClick={this.handleDel}
                        className="m-t-5"
                      >
                        -
                      </Button>
                    </div>
                  </Col>
                </Row>
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
            <div
              className="f-pa"
              style={{ padding: "0 30px", width: 378, margin: "0 auto" }}
              ref={(ele) => {
                this.replaceEle = ele;
              }}
            >
              <img
                src="/static/img/BigSpectrum.jpg"
                style={{ width: "100%" }}
              />
              <div className="key-layout">
                <KeyLayout
                  width={150}
                  height={70}
                  selected={selected}
                  layout={firstLayout}
                  changeSelected={this.changeSelected}
                />
              </div>
              <div className="key-layout" style={{ top: 112 }}>
                <KeyLayout
                  width={150}
                  height={70}
                  selected={selected}
                  layout={secondLayout}
                  changeSelected={this.changeSelected}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
