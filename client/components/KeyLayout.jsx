import React from "react";
import _ from "lodash";
import RGL, { WidthProvider } from "react-grid-layout";
import "./KeyLayout.scss";

const ReactGridLayout = WidthProvider(RGL);

export default class KeyLayout extends React.PureComponent {
  static defaultProps = {
    className: "layout",
    rowHeight: 5,
    isDraggable: false,
    isResizable: false,
    autoSize: false,
    onLayoutChange: function () {},
    cols: 12,
    verticalCompact: false,
    margin: [0, 0],
  };

  render() {
    const { layout, selected } = this.props;

    return (
      <ReactGridLayout {...this.props}>
        {layout.map((item) => {
          return (
            <div
              key={item.i}
              onClick={() => this.props.changeSelected(item)}
              className={selected === item.i ? "react-grid-item-selected" : ""}
            >
              <img
                src={`/static/img/key-${item.t}.png`}
                style={{ width: 11 }}
              />
            </div>
          );
        })}
      </ReactGridLayout>
    );
  }
}
