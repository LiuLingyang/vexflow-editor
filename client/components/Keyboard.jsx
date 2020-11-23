import React from "react";
// import "./Keyboard.scss";
import keys from "@util/keys";
import { Tabs, Row, Col, Button } from "antd";
const { TabPane } = Tabs;

export default class Keyboard extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      caps: false,
    };
  }

  handleClick(item) {
    if (item.name === "CAPS") {
      this.setState({ caps: !this.state.caps });
    } else {
      this.props.onClick && this.props.onClick(item);
    }
  }

  renderKeyBoard(data, key) {
    const style = {
      whiteSpace: "normal",
      lineHeight: 1,
      height: 40,
      fontSize: 12,
    };
    return data.map((line, index) => {
      return (
        <Row gutter={2} justify="space-between">
          {line.map((item) => {
            return (
              <Col span={item.col || Math.floor(24 / line.length)}>
                <Button
                  onClick={() => this.handleClick(item)}
                  style={key === "chord" && index < 4 ? style : {}}
                >
                  {item.source ? (
                    <img
                      src={`/static/img/${item.source}.png`}
                      style={{
                        width: "auto",
                        maxWidth: "100%",
                        height: "100%",
                      }}
                    />
                  ) : (
                    item.name
                  )}
                </Button>
              </Col>
            );
          })}
        </Row>
      );
    });
  }

  render() {
    const { caps } = this.state;
    return (
      <div className="m-keyboard">
        <Tabs tabPosition={"bottom"} onTabClick={this.props.onTabClick}>
          <TabPane tab="Letter Names" key="1">
            {caps
              ? this.renderKeyBoard(keys.letterCaps)
              : this.renderKeyBoard(keys.letter)}
          </TabPane>
          <TabPane tab="Mode" key="2">
            {this.renderKeyBoard(keys.mode)}
          </TabPane>
          <TabPane tab="Interval" key="3">
            {this.renderKeyBoard(keys.interval)}
          </TabPane>
          <TabPane tab="Chord" key="4">
            {caps
              ? this.renderKeyBoard(keys.chordCaps, "chord")
              : this.renderKeyBoard(keys.chord, "chord")}
          </TabPane>
          <TabPane tab="Eng&Num" key="5">
            {caps
              ? this.renderKeyBoard(keys.numAndEnCaps)
              : this.renderKeyBoard(keys.numAndEn)}
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
