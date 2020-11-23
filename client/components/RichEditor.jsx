import React from "react";
import BraftEditor from "braft-editor";
import { ContentUtils } from "braft-utils";
import { SPECIAL_ICONS } from "@util/consts";
import service from "@service/index";
import "braft-editor/dist/index.css";
import "braft-extensions/dist/emoticon.css";
import Emoticon from "braft-extensions/dist/emoticon";
import { v4 as uuidv4 } from "uuid";
import "./RichEditor.scss";

const controls = [
  // "undo",
  // "redo",
  "font-size",
  "bold",
  "italic",
  "underline",
  "text-color",
  "separator",
  "text-align",
  "separator",
  "list-ul",
  "list-ol",
  "blockquote",
  "link",
  "separator",
  "emoji",
];

const emoticons = SPECIAL_ICONS.map((item) => {
  return `/static/img/${item.icon}.png`;
});

const entityExtension = {
  // 指定扩展类型
  type: "entity",
  // 指定该扩展对哪些编辑器生效，不指定includeEditors则对所有编辑器生效
  // includeEditors: ["demo-editor-with-entity-extension"],
  // 指定扩展的entity名称，推荐使用全部大写，内部也会将小写转换为大写
  name: "KEYBOARD-ITEM",
  // 在编辑器工具栏中增加一个控制按钮，点击时会将所选文字转换为该entity
  // control: {
  //   text: "按键",
  // },
  // 指定entity的mutability属性，可选值为MUTABLE和IMMUTABLE，表明该entity是否可编辑，默认为MUTABLE
  mutability: "IMMUTABLE",
  // 指定通过上面新增的按钮创建entity时的默认附加数据
  // data: {
  //   key: "hello",
  // },
  // 指定entity在编辑器中的渲染组件
  component: (props) => {
    // 通过entityKey获取entity实例，关于entity实例请参考https://github.com/facebook/draft-js/blob/master/src/model/entity/DraftEntityInstance.js
    const entity = props.contentState.getEntity(props.entityKey);
    // 通过entity.getData()获取该entity的附加数据
    const { key } = entity.getData();
    return (
      <span data-key={key} className="input-item">
        {props.children}
      </span>
    );
  },
  // 指定html转换为editorState时，何种规则的内容将会转换成该entity
  importer: (nodeName, node, source) => {
    // source属性表明输入来源，可能值为create、paste或undefined
    if (
      nodeName.toLowerCase() === "span" &&
      node.classList &&
      node.classList.contains("input-item")
    ) {
      // 此处可以返回true或者一个包含mutability和data属性的对象
      return {
        mutability: "IMMUTABLE",
        data: {
          key: node.dataset.key,
        },
      };
    }
  },
  // 指定输出该entnty在输出的html中的呈现方式
  exporter: (entityObject, originalText) => {
    // 注意此处的entityObject并不是一个entity实例，而是一个包含type、mutability和data属性的对象
    const { key } = entityObject.data;
    return (
      <span data-key={key} className="input-item">
        {/* {originalText} */}{" "}
      </span>
    );
  },
};

// 加载扩展模块
BraftEditor.use(entityExtension);
BraftEditor.use(
  Emoticon({
    emoticons: emoticons,
    closeOnBlur: true,
    closeOnSelect: false,
  })
);

export default class RichEditor extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      editorState: BraftEditor.createEditorState(null),
    };
  }
  componentDidMount(preprops) {
    if (this.props.value) {
      this.setState({
        editorState: BraftEditor.createEditorState(this.props.value),
      });
    }
  }

  handleEditorChange = (editorState) => {
    this.setState({ editorState });
    const htmlContent = editorState.toHTML();
    this.props.onChange && this.props.onChange(htmlContent);
  };

  async onFileUpload() {
    const fileInput = document.getElementById("image-upload");
    if (fileInput && fileInput.files) {
      const file = fileInput.files[0];
      const result = await service.upload({ file });
      if (result) {
        this.setState({
          editorState: ContentUtils.insertMedias(this.state.editorState, [
            {
              type: "IMAGE",
              url: result,
            },
          ]),
        });
      }
      fileInput.value = "";
    }
  }

  insertInput = () => {
    const uuid = uuidv4();
    this.setState({
      editorState: ContentUtils.insertHTML(
        this.state.editorState,
        `<span class="input-item" data-key=${uuid}>请输入</span>`
      ),
    });
  };

  insertKeyImage = () => {
    this.setState({
      editorState: ContentUtils.insertMedias(this.state.editorState, [
        {
          type: "IMAGE",
          url: "/static/img/BigSpectrum.jpg",
        },
      ]),
    });
  };

  render() {
    const { disabledBlank, disabledKeyImage, disabledImage } = this.props;
    const { editorState } = this.state;

    const extendControls = [
      !disabledImage
        ? {
            key: "antd-uploader",
            type: "component",
            component: (
              <button
                type="button"
                className="control-item button upload-button"
                data-title="插入图片"
              >
                插入图片
                <input
                  type="file"
                  id="image-upload"
                  className="upload"
                  accept="image/*"
                  onChange={() => this.onFileUpload()}
                />
              </button>
            ),
          }
        : null,
      !disabledBlank
        ? {
            key: "input",
            type: "component",
            component: (
              <button
                type="button"
                className="control-item button upload-button"
                data-title="插入输入框"
                onClick={this.insertInput}
              >
                输入框
              </button>
            ),
          }
        : null,
      !disabledKeyImage
        ? {
            key: "keyImage",
            type: "component",
            component: (
              <button
                type="button"
                className="control-item button upload-button"
                data-title="插入调号图"
                onClick={this.insertKeyImage}
              >
                插入调号图
              </button>
            ),
          }
        : null,
    ].filter(Boolean);

    return (
      <div
        className={this.props.className || "m-richEditor"}
        style={this.props.style}
      >
        <BraftEditor
          value={editorState}
          onChange={this.handleEditorChange}
          controls={controls}
          extendControls={extendControls}
          readOnly={this.props.readOnly}
          style={{ width: "100%" }}
        />
      </div>
    );
  }
}
