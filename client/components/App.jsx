import React from "react";
import { Router, Route, Link, hashHistory } from "react-router";
import Index from "./Index";
import Demo from "./Demo";
import MusicQuestion from "./MusicQuestion";
import MusicReply from "./MusicReply";
import MusicAnswerDisplay from "./MusicAnswerDisplay";
import BlankQuestion from "./BlankQuestion";
import BlankReply from "./BlankReply";
import BlankAnswerDisplay from "./BlankAnswerDisplay";
import KeyQuestion from "./KeyQuestion";
import KeyReply from "./KeyReply";
import KeyAnswerDisplay from "./KeyAnswerDisplay";

import "antd/dist/antd.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "@assets/style/style.scss";
import isEqual from "lodash/isEqual";
import "./App.scss";

export default class App extends React.PureComponent {
  componentDidMount() {
    window.isEqual = function (a, b) {
      a = JSON.parse(a);
      b = JSON.parse(b);
      return isEqual(a, b);
    };
  }
  render() {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={Index}>
          <Route path="demo" component={Demo} />
          <Route path="music/question" component={MusicQuestion} />
          <Route path="music/reply" component={MusicReply} />
          <Route path="music/answerDisplay" component={MusicAnswerDisplay} />
          <Route path="blank/question" component={BlankQuestion} />
          <Route path="blank/reply" component={BlankReply} />
          <Route path="blank/answerDisplay" component={BlankAnswerDisplay} />
          <Route path="key/question" component={KeyQuestion} />
          <Route path="key/reply" component={KeyReply} />
          <Route path="key/answerDisplay" component={KeyAnswerDisplay} />
        </Route>
      </Router>
    );
  }
}
