import React from "react";
import { Router, Route, Link, browserHistory } from "react-router";

export default class Index extends React.PureComponent {
  render() {
    return this.props.children;
  }
}
