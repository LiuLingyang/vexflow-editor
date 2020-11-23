import React from "react";
import {
  Button,
  Card,
  Row,
  Col,
  Form,
  Radio,
  InputNumber,
  Modal,
  Dropdown,
  Menu,
  Popover,
} from "antd";
import { DownOutlined } from "@ant-design/icons";
import {
  DURATION_ARRAY,
  LIFT_ARRAY,
  LIFT_ARRAY_ONE,
  CLEF_ARRAY,
  KEY_ARRAY,
  CLEF_MAP,
  KEY_MAP,
  LIFT_MAP,
} from "@util/consts";
import im from "@util/im";
import _ from "@util/index";
import "./MusicEditor.scss";

const VF = Vex.Flow;
const INITKEY = "b/4";

export default class MusicEditor extends React.PureComponent {
  constructor(props) {
    super(props);

    const data = props.data || {};
    this.state = {
      lineForm: data.lineForm || "wired",
      clef: data.clef || "p",
      key: data.key || "reset",
      beatOpen: !_.isNullOrUndefined(data.beatOpen) ? data.beatOpen : true,
      beatUp: data.beatUp || 4,
      beatDown: data.beatDown || 4,
      clefVisible: false,
      keyVisible: false,
      chordVisible: false,
    };

    this.lineIndex = 0;
    this.noteIndex = 0;
    this.cursorElement = {};
    this.context = {};
    this.noteArr = []; // 节点二维数组

    this.staveDatas = data.staveDatas || [
      {
        clef: "treble",
        ts: "4/4",
        noteSeq: [
          {
            clef: "treble",
            keys: [INITKEY],
            duration: "w",
            dot: 0,
          },
        ],
        beams: [],
      },
      {
        clef: "bass",
        ts: "4/4",
        noteSeq: [
          {
            clef: "treble",
            keys: [INITKEY],
            duration: "w",
            dot: 0,
          },
        ],
        beams: [],
      },
    ];
    this.staveData = this.staveDatas[0];

    this.score = React.createRef();
  }
  componentDidMount() {
    let div = this.score.current;
    this.cursorElement = document.createElement("img");
    this.cursorElement.style.position = "absolute";
    this.cursorElement.style.zIndex = "1";
    div.parentNode.appendChild(this.cursorElement);

    this.refreshStaff(true);

    div.addEventListener(
      "click",
      (e) => {
        this.noteArr.forEach((line, lineIndex) => {
          line.forEach((item, noteIndex) => {
            let bound = item.getBoundingBox();
            if (
              this.isPointInRect(
                e.offsetX,
                e.offsetY,
                bound.x,
                bound.y,
                bound.x + bound.w,
                bound.y + bound.h
              )
            ) {
              this.lineIndex = lineIndex;
              this.noteIndex = noteIndex;
              this.staveData = this.staveDatas[lineIndex];
              this.drawCursor(bound.x, bound.y, bound.w, bound.h);
            }
          });
        });
      },
      false
    );
  }
  componentDidUpdate(preprops, prestate) {
    if (
      _.stateChanged(prestate, this.state, [
        "lineForm",
        "clef",
        "key",
        "beatOpen",
        "beatUp",
        "beatDown",
      ])
    ) {
      this.refreshStaff();
    }
  }

  selectNote() {
    try {
      let note = this.noteArr[this.lineIndex][this.noteIndex];
      let bound = note && note.getBoundingBox();
      this.drawCursor(bound.x, bound.y, bound.w, bound.h);
    } catch (e) {}
  }
  drawCursor(l, t, w, h) {
    this.cursorElement.style.top = t + "px";
    this.cursorElement.style.left = l + "px";
    this.cursorElement.height = h;
    this.cursorElement.width = w;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = 1;
    const ctx = c.getContext("2d");
    ctx.globalAlpha = 0.5;
    const gradient = ctx.createLinearGradient(
      0,
      0,
      this.cursorElement.width,
      0
    );
    gradient.addColorStop(0, "white"); // it was: "transparent"
    gradient.addColorStop(0.2, "#24b7ed");
    gradient.addColorStop(0.8, "#24b7ed");
    gradient.addColorStop(1, "white"); // it was: "transparent"
    //ctx.fillStyle = gradient;
    ctx.fillStyle = "#24b7ed";
    ctx.fillRect(0, 0, w, 1);
    // Set the actual image
    this.cursorElement.src = c.toDataURL("image/png");
    this.cursorElement.style.display = "";
  }

  isPointInRect(x, y, l, t, r, b) {
    if (x > l && x < r && y > t && y < b) {
      return true;
    } else {
      return false;
    }
  }

  refreshStaff(init) {
    const { lineForm, clef, key, beatOpen, beatUp, beatDown } = this.state;
    let div = this.score.current;
    div.innerHTML = "";
    let renderer = new VF.Renderer(div, VF.Renderer.Backends.SVG);
    const lengthen =
      this.staveDatas.some(
        (data) => data.noteSeq && data.noteSeq.length > 12
      ) && div.clientWidth < 600;
    renderer.resize(
      div.clientWidth + (lengthen ? 166 : 15),
      div.clientHeight + 40
    );
    this.context = renderer.getContext();

    let allNoteArr = [];
    let staves = [];
    this.staveDatas.forEach((data, index) => {
      let noteArr = [];
      let stave = new VF.Stave(
        15,
        0 + 80 * index,
        this.score.current.clientWidth + (lengthen ? 150 : 0),
        { left_bar: false, right_bar: false }
      );

      if (lineForm !== "wireless") {
        stave.addClef(data.clef);
      }
      //节拍
      if (beatOpen) {
        stave.addTimeSignature(`${beatUp}/${beatDown}`);
      }
      // 无线谱
      if (lineForm === "wireless") {
        stave
          .setConfigForLine(0, { visible: false })
          .setConfigForLine(1, { visible: false })
          .setConfigForLine(2, { visible: false })
          .setConfigForLine(3, { visible: false })
          .setConfigForLine(4, { visible: false });
      }
      //调号
      if (lineForm !== "wireless" && key !== "reset") {
        let keySig = new VF.KeySignature(KEY_MAP[key]);
        keySig.addToStave(stave);
      }
      // 终止线
      if (data.endline && clef !== "p") {
        stave.setEndBarType(VF.Barline.type.END);
      }

      stave.setContext(this.context).draw();

      if (data.noteSeq && data.noteSeq.length) {
        for (let i = 0; i < data.noteSeq.length; i++) {
          let item = data.noteSeq[i];
          let note;
          if (item.barline) {
            note = new VF.BarNote("single");
          } else {
            let noteData = {
              clef: item.clef,
              keys: item.keys,
              duration: item.duration,
            };
            let key = item.keys[0];
            let octave = key.charAt(key.length - 1);
            let octaveResult = parseInt(octave);
            // 三线以上反向
            // if (octaveResult > 4) {
            //   noteData.stem_direction = -1;
            // }

            note = new VF.StaveNote(noteData);
            for (let j = 0; j < item.keys.length; j++) {
              let key = item.keys[j];
              let acc = key.slice(1, key.indexOf("/"));
              if (acc !== "") {
                note.addAccidental(j, new VF.Accidental(acc));
              }
            }
            if (item.dot) {
              for (let i = 0; i < item.dot; i++) {
                note.addDotToAll();
              }
            }
          }
          noteArr.push(note);
        }
        allNoteArr.push(noteArr);

        // 符尾相连处理
        let beams = [];
        data.beams.length &&
          data.beams.forEach((item) => {
            beams.push(new VF.Beam(noteArr.slice(item[0], item[1] + 1)));
          });

        VF.Formatter.FormatAndDraw(this.context, stave, noteArr);
        beams.forEach((b) => {
          b.setContext(this.context).draw();
        });
      }

      staves.push(stave);
    });

    if (staves.length === 2) {
      const stave = staves[0];
      const stave2 = staves[1];
      var connector = new VF.StaveConnector(stave, stave2);
      connector.setType(VF.StaveConnector.type.BRACE);
      connector.setContext(this.context);
      connector.draw();

      var connector2 = new VF.StaveConnector(stave, stave2);
      connector2.setType(VF.StaveConnector.type.SINGLE);
      connector2.setContext(this.context);
      connector2.draw();

      if (clef === "p" && this.staveDatas[0].endline) {
        var connector3 = new VF.StaveConnector(stave, stave2);
        connector3.setType(VF.StaveConnector.type.BOLD_DOUBLE_RIGHT);
        connector3.setContext(this.context);
        connector3.draw();
      }
    }

    this.noteArr = allNoteArr;

    this.selectNote();

    !init &&
      this.props.onChange &&
      this.props.onChange({
        lineForm,
        clef,
        key,
        beatOpen,
        beatUp,
        beatDown,
        staveDatas: this.staveDatas,
      });
  }
  // 改变谱表
  changeClef(item) {
    if (item.key === this.state.clef) return;
    if (item.key === "p") {
      this.staveDatas.push({
        clef: "bass",
        ts: "4/4",
        noteSeq: [
          {
            clef: "treble",
            keys: [INITKEY],
            duration: "w",
            dot: 0,
          },
        ],
        beams: [],
      });
    } else {
      if (this.staveDatas.length === 2) {
        this.staveDatas.splice(1, 1);
        if (this.lineIndex == 1) {
          this.lineIndex = 0;
          this.noteIndex = 0;
          this.staveData = this.staveDatas[0];
        }
      }
      this.staveData.clef = CLEF_MAP[item.key];
    }
  }
  //新增音符
  handleAddNote(item) {
    switch (item.key) {
      case "dot":
        this.handleAddDotToAll();
        break;
      case "barline":
        this.handleAddBarLine();
        break;
      case "endline":
        this.handleAddEndLine();
        break;
      default:
        // beams index 相应 +1
        let beams = this.staveData.beams;
        beams.forEach((item, index) => {
          item[0] = item[0] > this.noteIndex ? item[0] + 1 : item[0];
          item[1] = item[1] > this.noteIndex ? item[1] + 1 : item[1];
        });

        const initKey = item.key === "wr" ? "d/5" : INITKEY;
        this.staveData.noteSeq.splice(this.noteIndex + 1, 0, {
          clef: "treble",
          keys: [initKey],
          duration: item.key,
          dot: 0,
        });
        this.noteIndex = this.noteIndex + 1;
        if (this.noteIndex >= this.staveData.noteSeq.length) this.noteIndex = 0;
        this.refreshStaff();
        break;
    }
  }
  // 附点
  handleAddDotToAll() {
    this.staveData.noteSeq[this.noteIndex].dot =
      this.staveData.noteSeq[this.noteIndex].dot + 1;
    this.refreshStaff();
  }
  // 小节线
  handleAddBarLine() {
    // beams index 相应 +1
    let beams = this.staveData.beams;
    beams.forEach((item, index) => {
      item[0] = item[0] > this.noteIndex ? item[0] + 1 : item[0];
      item[1] = item[1] > this.noteIndex ? item[1] + 1 : item[1];
    });

    this.staveData.noteSeq.splice(this.noteIndex + 1, 0, { barline: true });
    this.noteIndex = this.noteIndex + 1;
    this.refreshStaff();
  }
  // 终止线
  handleAddEndLine() {
    if (this.state.clef === "p") {
      this.staveDatas[0].endline = !this.staveDatas[0].endline;
      this.staveDatas[this.staveDatas.length - 1].endline = !this.staveDatas[
        this.staveDatas.length - 1
      ].endline;
    } else {
      this.staveDatas[0].endline = !this.staveDatas[0].endline;
    }

    this.refreshStaff();
  }
  //删除小节线
  handleDeleteBarLine = () => {
    for (let i = this.staveData.noteSeq.length - 1; i >= 0; i--) {
      if (this.staveData.noteSeq[i].barline) {
        this.staveData.noteSeq.splice(i, 1);
        this.noteIndex = this.staveData.noteSeq.length - 1;
        break;
      }
    }
    this.refreshStaff();
  };
  // 删除音符
  handleDeleteSelect = () => {
    // 删除链接符
    let beams = this.staveData.beams;
    beams.forEach((item, index) => {
      const selfIndex = _.indexOf(item, (p) => p === this.noteIndex);
      if (selfIndex > -1) {
        beams.splice(index, 1);
      }
    });

    this.staveData.noteSeq.splice(this.noteIndex, 1);
    this.noteIndex = this.staveData.noteSeq.length - 1;
    this.refreshStaff();
  };
  // 升降号
  hangleSharpFlat(item) {
    if (item.key === "clear") {
      this.keyIndex = 0;
      for (
        let i = 0;
        i < this.staveData.noteSeq[this.noteIndex].keys.length;
        i++
      ) {
        let keyArr = this.staveData.noteSeq[this.noteIndex].keys[i];
        let str1 = keyArr.charAt(0);
        let str2 = keyArr.charAt(keyArr.length - 1);
        this.staveData.noteSeq[this.noteIndex].keys[i] = `${str1}/${str2}`;
      }
    } else {
      this.staveData.noteSeq[this.noteIndex].keys.some((keyArr, index) => {
        if (keyArr.length === 3) {
          let str1 = keyArr.charAt(0);
          let str2 = keyArr.charAt(keyArr.length - 1);
          this.staveData.noteSeq[this.noteIndex].keys[index] =
            str1 + `${LIFT_MAP[item.key]}/` + str2;
          this.keyIndex = index;
          return true;
        }
      });
    }
    this.refreshStaff();
  }
  handleMoveLift = (type, item) => {
    let keys = this.staveData.noteSeq[this.noteIndex].keys;
    let nextKeyIndex = this.keyIndex;
    if (type === "up") {
      for (let i = this.keyIndex; i < keys.length; i++) {
        let keyArr = this.staveData.noteSeq[this.noteIndex].keys[i];
        if (keyArr.length === 3) {
          nextKeyIndex = Math.min(i, keys.length - 1);
          break;
        }
      }
    } else if (type === "down") {
      for (let i = this.keyIndex; i >= 0; i--) {
        let keyArr = this.staveData.noteSeq[this.noteIndex].keys[i];
        if (keyArr.length === 3) {
          nextKeyIndex = Math.min(i, 0);
          break;
        }
      }
    }

    let keyArr = this.staveData.noteSeq[this.noteIndex].keys[this.keyIndex];
    let str1 = keyArr.charAt(0);
    let str2 = keyArr.charAt(keyArr.length - 1);
    this.staveData.noteSeq[this.noteIndex].keys[
      this.keyIndex
    ] = `${str1}/${str2}`;

    let nextKeyArr = this.staveData.noteSeq[this.noteIndex].keys[nextKeyIndex];
    let nextStr1 = nextKeyArr.charAt(0);
    let nextStr2 = nextKeyArr.charAt(nextKeyArr.length - 1);
    this.staveData.noteSeq[this.noteIndex].keys[nextKeyIndex] =
      nextStr1 + `${LIFT_MAP[item.key]}/` + nextStr2;
    this.keyIndex = nextKeyIndex;

    this.refreshStaff();
  };
  // 移动
  handleMoveUp = () => {
    for (
      let i = 0;
      i < this.staveData.noteSeq[this.noteIndex].keys.length;
      i++
    ) {
      let item = this.staveData.noteSeq[this.noteIndex].keys[i];
      this.staveData.noteSeq[this.noteIndex].keys[i] = this.getUpOrDownNoteName(
        item,
        "up"
      );
    }
    this.refreshStaff();
  };
  handleMoveDown = () => {
    for (
      let i = 0;
      i < this.staveData.noteSeq[this.noteIndex].keys.length;
      i++
    ) {
      let item = this.staveData.noteSeq[this.noteIndex].keys[i];
      this.staveData.noteSeq[this.noteIndex].keys[i] = this.getUpOrDownNoteName(
        item,
        "down"
      );
    }
    this.refreshStaff();
  };
  getUpOrDownNoteName(key, direction) {
    let dic = ["c", "d", "e", "f", "g", "a", "b"];
    let noteName = key.charAt(0);
    let octave = key.charAt(key.length - 1);
    let acc = key.slice(1, key.indexOf("/"));
    let index = dic.indexOf(noteName);
    let noteNameResult;
    let octaveResult = parseInt(octave);
    if (direction === "up") {
      if (index + 1 < dic.length) {
        noteNameResult = dic[index + 1];
      } else {
        noteNameResult = dic[0];
        octaveResult++;
      }
    } else {
      if (index - 1 > -1) {
        noteNameResult = dic[index - 1];
      } else {
        noteNameResult = dic[dic.length - 1];
        octaveResult--;
      }
    }
    let ret = noteNameResult + acc + "/" + octaveResult;
    return ret;
  }
  handleMoveLeft = () => {
    if (this.noteIndex === 0) return;
    const temp = this.staveData.noteSeq[this.noteIndex];
    this.staveData.noteSeq.splice(this.noteIndex, 1);
    this.staveData.noteSeq.splice(this.noteIndex - 1, 0, temp);
    this.noteIndex--;
    this.refreshStaff();
  };
  handleMoveRight = () => {
    if (this.noteIndex === this.staveData.length - 1) return;
    const temp = this.staveData.noteSeq[this.noteIndex];
    this.staveData.noteSeq.splice(this.noteIndex, 1);
    this.staveData.noteSeq.splice(this.noteIndex + 1, 0, temp);
    this.noteIndex++;
    this.refreshStaff();
  };
  // 和弦
  handleAddChord = () => {
    let keys = this.staveData.noteSeq[this.noteIndex].keys;
    let key = keys[keys.length - 1];
    let str1 = key.charAt(0);
    let str2 = key.charAt(key.length - 1);
    key = `${str1}/${str2}`;

    const nextKey = this.getUpOrDownNoteName(key, "up");
    keys.push(nextKey);
    this.staveData.noteSeq[this.noteIndex].keys = keys;
    this.setState({ chordVisible: true });
    this.refreshStaff();
  };
  handleMoveChord = (type) => {
    let keys = this.staveData.noteSeq[this.noteIndex].keys;
    const key = keys[keys.length - 1];
    const nextKey = this.getUpOrDownNoteName(key, type);
    keys[keys.length - 1] = nextKey;
    this.refreshStaff();
  };
  // 符尾相连
  handleBeam = () => {
    let beams = this.staveData.beams;
    if (this.noteIndex === 0) return;
    if (
      ["w", "h", "q", "wr", "hr", "qr"].includes(
        this.staveData.noteSeq[this.noteIndex].duration
      )
    )
      return;
    if (
      ["w", "h", "q", "wr", "hr", "qr"].includes(
        this.staveData.noteSeq[this.noteIndex - 1].duration
      )
    )
      return;

    const needAdd = beams.every((item) => {
      const selfIndex = _.indexOf(item, (p) => p === this.noteIndex);
      const preIndex = _.indexOf(item, (p) => p === this.noteIndex - 1);
      return (
        (selfIndex === -1 && preIndex === -1) ||
        (selfIndex === -1 && preIndex === 0)
      );
    });
    // 新增
    if (needAdd) {
      beams.push([this.noteIndex - 1, this.noteIndex]);
    } else {
      beams.forEach((item, index) => {
        const selfIndex = _.indexOf(item, (p) => p === this.noteIndex);
        const preIndex = _.indexOf(item, (p) => p === this.noteIndex - 1);
        if (selfIndex === 1) {
          // 删除
          beams.splice(index, 1);
        } else if (selfIndex === -1 && preIndex === 1) {
          // 追加
          item[1] = this.noteIndex;
        } else if (selfIndex === 0 && preIndex === -1) {
          //追加
          item[0] = this.noteIndex;
        }
      });
    }
    this.refreshStaff();
  };

  handleFormChange(name, e) {
    const targetValue = im.get(e, "target.value");
    const nextValue = targetValue !== undefined ? targetValue : e;
    if (name === "lineForm" && nextValue === "wireless") {
      this.changeClef({ key: "f" });
      this.setState({ clef: "f" });
    }
    this.setState({
      [name]: nextValue,
    });
  }
  toggleClefVisible = () => {
    this.setState({ clefVisible: !this.state.clefVisible });
  };
  toggleKeyVisible = () => {
    this.setState({ keyVisible: !this.state.keyVisible });
  };

  render() {
    const { type } = this.props;
    const {
      lineForm,
      clef,
      key,
      beatOpen,
      beatUp,
      beatDown,
      clefVisible,
      keyVisible,
      chordVisible,
    } = this.state;

    return (
      <div className="m-musicEditor" style={{ width: "100%" }}>
        {type === "question" && (
          <React.Fragment>
            <div
              className="f-pr"
              style={{ width: 900, height: 220, overflow: "auto" }}
            >
              <div ref={this.score}></div>
            </div>
            <Row>
              <Col span={24}>
                <Card className="m-t-10 operation">
                  <Row>
                    <Col span={16}>
                      <div className="duration">
                        {DURATION_ARRAY.map((line) => {
                          return (
                            <div className="line f-cb">
                              {line.map((item) => {
                                return (
                                  <Button
                                    onClick={() => this.handleAddNote(item)}
                                  >
                                    <img src={`/static/img/${item.icon}.png`} />
                                  </Button>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                      <div className="f-cb">
                        <div className="f-fl lift m-t-10">
                          {LIFT_ARRAY.map((line) => {
                            return (
                              <div className="line f-cb">
                                {line.map((item) => {
                                  return (
                                    <span>
                                      {item.key === "clear" ? (
                                        <Button
                                          onClick={() =>
                                            this.hangleSharpFlat(item)
                                          }
                                          style={{
                                            width: item.width || 34,
                                          }}
                                        >
                                          <img
                                            src={`/static/img/${item.icon}.png`}
                                          />
                                        </Button>
                                      ) : (
                                        <Popover
                                          content={
                                            <Menu>
                                              <Menu.Item
                                                key="1"
                                                onClick={() =>
                                                  this.handleMoveLift(
                                                    "up",
                                                    item
                                                  )
                                                }
                                              >
                                                Move up
                                              </Menu.Item>
                                              <Menu.Item
                                                key="2"
                                                onClick={() =>
                                                  this.handleMoveLift(
                                                    "down",
                                                    item
                                                  )
                                                }
                                              >
                                                Move dowm
                                              </Menu.Item>
                                            </Menu>
                                          }
                                          className="m-t-3"
                                        >
                                          <Button
                                            onClick={() =>
                                              this.hangleSharpFlat(item)
                                            }
                                            style={{
                                              width: item.width || 34,
                                            }}
                                          >
                                            <img
                                              src={`/static/img/${item.icon}.png`}
                                            />
                                          </Button>
                                        </Popover>
                                      )}
                                    </span>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                        <div className="f-fl m-t-10 m-l-10">
                          <Button
                            style={{ width: 122 }}
                            onClick={this.handleDeleteSelect}
                          >
                            -(Reduce notes)
                          </Button>
                          <br />
                          <Dropdown
                            visible={chordVisible}
                            onVisibleChange={(visible) => {
                              this.setState({ chordVisible: visible });
                            }}
                            overlay={
                              <Menu>
                                <Menu.Item
                                  key="1"
                                  onClick={() => this.handleMoveChord("up")}
                                >
                                  Move up
                                </Menu.Item>
                                <Menu.Item
                                  key="2"
                                  onClick={() => this.handleMoveChord("dowm")}
                                >
                                  Move dowm
                                </Menu.Item>
                              </Menu>
                            }
                          >
                            <Button
                              style={{ width: 122 }}
                              onClick={this.handleAddChord}
                            >
                              +(Chord)
                              <DownOutlined />
                            </Button>
                          </Dropdown>
                          <br />
                          <Button
                            style={{ width: 122 }}
                            onClick={this.handleBeam}
                          >
                            +(Beam)
                          </Button>
                        </div>
                      </div>
                      <div className="direction m-t-10 f-pr f-cb">
                        <Button style={{ width: 30, height: 60 }}>
                          <img
                            src="/static/img/left.png"
                            onClick={this.handleMoveLeft}
                          />
                        </Button>
                        <Button
                          style={{ width: 72, height: 28 }}
                          onClick={this.handleMoveUp}
                        >
                          <img src="/static/img/up.png" style={{ width: 28 }} />
                        </Button>
                        <Button
                          style={{
                            width: 72,
                            height: 28,
                            position: "absolute",
                            bottom: 0,
                            left: 34,
                          }}
                          onClick={this.handleMoveDown}
                        >
                          <img
                            src="/static/img/down.png"
                            style={{
                              width: 28,
                            }}
                          />
                        </Button>
                        <Button
                          style={{ width: 30, height: 60 }}
                          onClick={this.handleMoveRight}
                        >
                          <img src="/static/img/right.png" />
                        </Button>
                      </div>
                    </Col>
                    <Col span={8}>
                      <Form layout="vertical">
                        <Form.Item
                          label="线谱形式"
                          name="lineForm"
                          rules={[{ required: true }]}
                          initialValue={lineForm}
                        >
                          <Radio.Group
                            onChange={(value) =>
                              this.handleFormChange("lineForm", value)
                            }
                          >
                            <Radio value="wired">有线谱</Radio>
                            <Radio value="wireless">无线谱</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </Form>
                      <Form layout="vertical" className="f-fl">
                        <Form.Item
                          label="谱表选择"
                          name="clef"
                          rules={[{ required: true }]}
                        >
                          <Button
                            style={{ width: 60, height: 60 }}
                            onClick={this.toggleClefVisible}
                          >
                            <img src={`/static/img/clef-${clef}.png`} />
                          </Button>
                        </Form.Item>
                      </Form>
                      <Form layout="vertical" className="f-fl m-l-24">
                        <Form.Item
                          label="调号选择"
                          name="key"
                          rules={[{ required: true }]}
                        >
                          <Button
                            style={{ width: 60, height: 60 }}
                            onClick={this.toggleKeyVisible}
                          >
                            <img src={`/static/img/key-${key}.png`} />
                          </Button>
                        </Form.Item>
                      </Form>
                      <div className="f-cb"></div>
                      <Form layout="vertical">
                        <Form.Item
                          label="节拍设置"
                          name="beatOpen"
                          rules={[{ required: true }]}
                          initialValue={beatOpen}
                        >
                          <Radio.Group
                            onChange={(value) =>
                              this.handleFormChange("beatOpen", value)
                            }
                          >
                            <Radio value={true}>有</Radio>
                            <Radio value={false}>无</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </Form>
                      {beatOpen ? (
                        <React.Fragment>
                          <Form layout="horizontal">
                            <Form.Item
                              label="分子"
                              name="beatUp"
                              initialValue={beatUp}
                            >
                              <InputNumber
                                min={1}
                                onChange={(value) =>
                                  this.handleFormChange("beatUp", value)
                                }
                              />
                            </Form.Item>
                            <Form.Item
                              label="分母"
                              name="beatDown"
                              initialValue={beatDown}
                            >
                              <InputNumber
                                min={1}
                                onChange={(value) =>
                                  this.handleFormChange("beatDown", value)
                                }
                              />
                            </Form.Item>
                          </Form>
                        </React.Fragment>
                      ) : null}
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
            <Modal
              width={340}
              title="谱表选择"
              visible={clefVisible}
              onCancel={this.toggleClefVisible}
              footer={false}
            >
              <div className="f-cb">
                {CLEF_ARRAY.map((item) => {
                  return (
                    <Button
                      style={{
                        float: "left",
                        width: 60,
                        height: 60,
                        margin: 4,
                        padding: 0,
                      }}
                      onClick={() => {
                        this.changeClef(item);
                        this.handleFormChange("clef", item.key);
                        this.toggleClefVisible();
                      }}
                    >
                      <img
                        src={`/static/img/${item.icon}.png`}
                        style={{ maxWidth: "100%", maxHeight: "100%" }}
                      />
                    </Button>
                  );
                })}
              </div>
            </Modal>
            <Modal
              width={530}
              title="调号选择"
              visible={keyVisible}
              onCancel={this.toggleKeyVisible}
              footer={false}
            >
              <div className="f-cb">
                {KEY_ARRAY.map((item) => {
                  return (
                    <Button
                      style={{
                        float: "left",
                        width: 60,
                        height: 60,
                        margin: 4,
                        padding: 0,
                      }}
                      onClick={() => {
                        this.handleFormChange("key", item.key);
                        this.toggleKeyVisible();
                      }}
                    >
                      <img
                        src={`/static/img/${item.icon}.png`}
                        style={{ maxWidth: "100%", maxHeight: "100%" }}
                      />
                    </Button>
                  );
                })}
              </div>
            </Modal>
          </React.Fragment>
        )}
        {type === "answer" && (
          <div className="phone-bg">
            <div style={{ paddingTop: 100 }}>
              <div
                className="f-pr"
                style={{
                  width: "calc(100% - 70px)",
                  height: 400,
                  marginLeft: 30,
                  overflow: "auto",
                }}
              >
                <div ref={this.score}></div>
              </div>
            </div>
            <div className="foot">
              <div className="keyboard">
                {DURATION_ARRAY.map((line) => {
                  return (
                    <Row gutter={4} justify="space-between">
                      {line.map((item) => {
                        return (
                          <Col span={24 / line.length}>
                            <Button onClick={() => this.handleAddNote(item)}>
                              <img src={`/static/img/${item.icon}.png`} />
                            </Button>
                          </Col>
                        );
                      })}
                    </Row>
                  );
                })}

                <Row>
                  <Col span={8}>
                    <div className="f-pr m-t-8">
                      <Button style={{ width: 28, height: 50 }}>
                        <img
                          src="/static/img/left.png"
                          onClick={this.handleMoveLeft}
                        />
                      </Button>
                      <Button
                        style={{
                          width: 53,
                          height: 24,
                          position: "relative",
                          top: -12,
                        }}
                        onClick={this.handleMoveUp}
                      >
                        <img src="/static/img/up.png" style={{ width: 24 }} />
                      </Button>
                      <Button
                        style={{
                          width: 53,
                          height: 24,
                          position: "absolute",
                          bottom: 0,
                          left: 28,
                        }}
                        onClick={this.handleMoveDown}
                      >
                        <img
                          src="/static/img/down.png"
                          style={{
                            width: 24,
                          }}
                        />
                      </Button>
                      <Button
                        style={{ width: 28, height: 50 }}
                        onClick={this.handleMoveRight}
                      >
                        <img src="/static/img/right.png" />
                      </Button>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="m-l-4">
                      {LIFT_ARRAY_ONE.map((item) => {
                        return (
                          <span>
                            {item.key === "clear" ? (
                              <Button
                                onClick={() => this.hangleSharpFlat(item)}
                                style={{
                                  width: item.width || 30,
                                }}
                              >
                                <img
                                  src={`/static/img/${item.icon}.png`}
                                  style={{ height: "100%" }}
                                />
                              </Button>
                            ) : (
                              <Popover
                                content={
                                  <Menu>
                                    <Menu.Item
                                      key="1"
                                      onClick={() =>
                                        this.handleMoveLift("up", item)
                                      }
                                    >
                                      Move up
                                    </Menu.Item>
                                    <Menu.Item
                                      key="2"
                                      onClick={() =>
                                        this.handleMoveLift("down", item)
                                      }
                                    >
                                      Move dowm
                                    </Menu.Item>
                                  </Menu>
                                }
                                className="m-t-3"
                              >
                                <Button
                                  onClick={() => this.hangleSharpFlat(item)}
                                  style={{
                                    width: item.width || 30,
                                  }}
                                >
                                  <img
                                    src={`/static/img/${item.icon}.png`}
                                    style={{ height: "100%" }}
                                  />
                                </Button>
                              </Popover>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="m-l-4">
                      <Button
                        style={{ width: 52 }}
                        onClick={this.handleDeleteSelect}
                      >
                        -note
                      </Button>
                      <Button
                        style={{ width: 52 }}
                        onClick={this.handleBeam}
                        className="m-l-1"
                      >
                        +Beam
                      </Button>
                      <br />
                      <Dropdown
                        visible={chordVisible}
                        onVisibleChange={(visible) => {
                          this.setState({ chordVisible: visible });
                        }}
                        overlay={
                          <Menu>
                            <Menu.Item
                              key="1"
                              onClick={() => this.handleMoveChord("up")}
                            >
                              Move up
                            </Menu.Item>
                            <Menu.Item
                              key="2"
                              onClick={() => this.handleMoveChord("dowm")}
                            >
                              Move dowm
                            </Menu.Item>
                          </Menu>
                        }
                        className="m-t-3"
                      >
                        <Button
                          style={{ width: 120 }}
                          onClick={this.handleAddChord}
                        >
                          +(Chord)
                          <DownOutlined />
                        </Button>
                      </Dropdown>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        )}
        {type === "reply" && (
          <React.Fragment>
            <div
              className="f-pr"
              style={{ width: "100%", height: 300, overflow: "auto" }}
            >
              <div ref={this.score}></div>
            </div>
            <div className="foot-fixed">
              <div className="keyboard">
                {DURATION_ARRAY.map((line) => {
                  return (
                    <Row gutter={4} justify="space-between">
                      {line.map((item) => {
                        return (
                          <Col span={24 / line.length}>
                            <Button onClick={() => this.handleAddNote(item)}>
                              <img src={`/static/img/${item.icon}.png`} />
                            </Button>
                          </Col>
                        );
                      })}
                    </Row>
                  );
                })}

                <Row>
                  <Col span={8}>
                    <div className="f-pr m-t-8">
                      <Button style={{ width: 28, height: 50 }}>
                        <img
                          src="/static/img/left.png"
                          onClick={this.handleMoveLeft}
                        />
                      </Button>
                      <Button
                        style={{
                          width: 53,
                          height: 24,
                          position: "relative",
                          top: -12,
                        }}
                        onClick={this.handleMoveUp}
                      >
                        <img src="/static/img/up.png" style={{ width: 24 }} />
                      </Button>
                      <Button
                        style={{
                          width: 53,
                          height: 24,
                          position: "absolute",
                          bottom: 0,
                          left: 28,
                        }}
                        onClick={this.handleMoveDown}
                      >
                        <img
                          src="/static/img/down.png"
                          style={{
                            width: 24,
                          }}
                        />
                      </Button>
                      <Button
                        style={{ width: 28, height: 50 }}
                        onClick={this.handleMoveRight}
                      >
                        <img src="/static/img/right.png" />
                      </Button>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="m-l-4">
                      {LIFT_ARRAY_ONE.map((item) => {
                        return (
                          <span>
                            {item.key === "clear" ? (
                              <Button
                                onClick={() => this.hangleSharpFlat(item)}
                                style={{
                                  width: item.width || 30,
                                }}
                              >
                                <img
                                  src={`/static/img/${item.icon}.png`}
                                  style={{ height: "100%" }}
                                />
                              </Button>
                            ) : (
                              <Popover
                                content={
                                  <Menu>
                                    <Menu.Item
                                      key="1"
                                      onClick={() =>
                                        this.handleMoveLift("up", item)
                                      }
                                    >
                                      Move up
                                    </Menu.Item>
                                    <Menu.Item
                                      key="2"
                                      onClick={() =>
                                        this.handleMoveLift("down", item)
                                      }
                                    >
                                      Move dowm
                                    </Menu.Item>
                                  </Menu>
                                }
                                className="m-t-3"
                              >
                                <Button
                                  onClick={() => this.hangleSharpFlat(item)}
                                  style={{
                                    width: item.width || 30,
                                  }}
                                >
                                  <img
                                    src={`/static/img/${item.icon}.png`}
                                    style={{ height: "100%" }}
                                  />
                                </Button>
                              </Popover>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="m-l-3">
                      <Button
                        style={{ width: 58 }}
                        onClick={this.handleDeleteSelect}
                      >
                        -note
                      </Button>
                      <Button
                        style={{ width: 58 }}
                        onClick={this.handleBeam}
                        className="m-l-1"
                      >
                        +Beam
                      </Button>
                      <br />
                      <Dropdown
                        visible={chordVisible}
                        onVisibleChange={(visible) => {
                          this.setState({ chordVisible: visible });
                        }}
                        overlay={
                          <Menu>
                            <Menu.Item
                              key="1"
                              onClick={() => this.handleMoveChord("up")}
                            >
                              Move up
                            </Menu.Item>
                            <Menu.Item
                              key="2"
                              onClick={() => this.handleMoveChord("dowm")}
                            >
                              Move dowm
                            </Menu.Item>
                          </Menu>
                        }
                        className="m-t-3"
                      >
                        <Button
                          style={{ width: 120 }}
                          onClick={this.handleAddChord}
                        >
                          +(Chord)
                          <DownOutlined />
                        </Button>
                      </Dropdown>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </React.Fragment>
        )}
        {type === "answerDisplay" && (
          <div
            className="f-pr"
            style={{ width: "100%", height: 300, overflow: "auto" }}
          >
            <div ref={this.score}></div>
          </div>
        )}
      </div>
    );
  }
}
