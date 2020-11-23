import React from "react";

const VF = Vex.Flow;

export default class Demo extends React.PureComponent {
  constructor(props) {
    super(props);
    this.score = React.createRef();
  }
  componentDidMount() {
    let div = this.score.current;
    let renderer = new Vex.Flow.Renderer(div, Vex.Flow.Renderer.Backends.SVG);
    renderer.resize(800, 600);
    const context = (this.context = renderer.getContext());
    this.context.setFont("Arial", 10, "").setBackgroundFillStyle("#eed");

    var stave = new VF.Stave(15, 0, 700);
    // 谱号/节拍
    stave.addClef("treble").addTimeSignature("4/4");
    // 有线谱/无线谱
    stave
      .setConfigForLine(0, { visible: false })
      .setConfigForLine(1, { visible: false })
      .setConfigForLine(2, { visible: false })
      .setConfigForLine(3, { visible: false })
      .setConfigForLine(4, { visible: false });
    //调号
    let keySig = new VF.KeySignature("G");
    keySig.addToStave(stave);
    // 终止线
    stave.setEndBarType(VF.Barline.type.END);
    stave.setContext(context).draw();

    var notes = [
      new VF.StaveNote({ clef: "treble", keys: ["e##/5"], duration: "8d" })
        .addAccidental(0, new VF.Accidental("##"))
        .addDotToAll()
        .addDotToAll(),

      new VF.StaveNote({
        clef: "treble",
        keys: ["eb/5"],
        duration: "16",
        stem_direction: -1,
      }).addAccidental(0, new VF.Accidental("b")),

      new VF.BarNote("single"), // 小节线

      new VF.StaveNote({
        clef: "treble",
        keys: ["d/5", "eb/4"],
        duration: "h",
      }).addDot(0),

      new VF.StaveNote({
        clef: "treble",
        keys: ["c/5", "eb/5", "g#/5"],
        duration: "q",
      })
        .addAccidental(1, new VF.Accidental("b"))
        .addAccidental(2, new VF.Accidental("#"))
        .addDotToAll(),
    ];

    VF.Formatter.FormatAndDraw(context, stave, notes);

    var stave2 = new VF.Stave(15, 100, 700);
    // 谱号/节拍
    stave2.addClef("bass").addTimeSignature("4/4");
    //调号
    keySig = new VF.KeySignature("Ab");
    keySig.addToStave(stave2);
    // 终止线
    stave2.setEndBarType(VF.Barline.type.END);
    stave2.setContext(context).draw();

    var notes2 = [
      new VF.StaveNote({ clef: "treble", keys: ["e##/5"], duration: "8d" })
        .addAccidental(0, new VF.Accidental("##"))
        .addDotToAll(),

      new VF.StaveNote({
        clef: "treble",
        keys: ["b/4"],
        duration: "16",
      }).addAccidental(0, new VF.Accidental("b")),

      new VF.StaveNote({
        clef: "treble",
        keys: ["b/4"],
        duration: "16",
      }).addAccidental(0, new VF.Accidental("b")),

      new VF.StaveNote({ clef: "treble", keys: ["e##/5"], duration: "8d" })
        .addAccidental(0, new VF.Accidental("##"))
        .addDotToAll(),

      new VF.StaveNote({
        clef: "treble",
        keys: ["c/4", "f/4", "a/4"],
        duration: "2",
        stem_direction: -1,
      }).addAccidental(0, new VF.Accidental("b")),

      new VF.StaveNote({
        clef: "treble",
        keys: ["d/5", "eb/4"],
        duration: "h",
      }).addDot(0),

      new VF.BarNote("single"), // 小节线

      new VF.StaveNote({
        clef: "treble",
        keys: ["c/5", "eb/5", "g#/5", "g#/5"],
        duration: "q",
      })
        .addAccidental(1, new VF.Accidental("b"))
        .addAccidental(2, new VF.Accidental("#"))
        .addDotToAll(),

      new VF.StaveNote({
        clef: "treble",
        keys: ["d/5"],
        duration: "wr",
      }).addDotToAll(),
    ];

    var beams = [
      new VF.Beam(notes2.slice(0, 2)),
      new VF.Beam(notes2.slice(2, 4)),
    ];
    VF.Formatter.FormatAndDraw(context, stave2, notes2);
    beams.forEach(function (b) {
      b.setContext(context).draw();
    });

    var connector = new VF.StaveConnector(stave, stave2);
    var line = new VF.StaveConnector(stave, stave2);
    connector.setType(VF.StaveConnector.type.BRACE);
    connector.setContext(context);
    connector.setText("Piano");
    line.setType(VF.StaveConnector.type.SINGLE);
    connector.setContext(context);
    line.setContext(context);
    stave.draw();
    stave2.draw();
    connector.draw();
    line.draw();
  }

  render() {
    return (
      <div style={{ width: 700, height: 400, margin: "0 auto" }}>
        <div className="f-pr" ref={this.score}></div>
      </div>
    );
  }
}
