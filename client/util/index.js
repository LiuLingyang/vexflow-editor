import path from "path";
import im from "./im";
import { v4 as uuidv4 } from "uuid";

function is(type, obj) {
  return Object.prototype.toString.call(obj) === `[object ${type}]`;
}

function isArray(item) {
  return is("Array", item);
}

function isString(item) {
  return is("String", item);
}

function isObject(item) {
  return is("Object", item);
}

function isNullOrUndefined(obj) {
  return obj === null || obj === undefined;
}

function isEmpty(obj) {
  if (isNullOrUndefined(obj)) return true;
  if (isObject(obj)) return !Object.keys(obj).length;
  if (isArray(obj)) return !obj.length;
  if (isString(obj)) return obj === "";
  return false;
}

function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key])
          Object.assign(target, {
            [key]: {},
          });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, {
          [key]: source[key],
        });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

function clearSelection() {
  if (document.body.createTextRange) {
    const range = document.body.createTextRange();
    range.collapse();
    range.select();
  } else if (window.getSelection) {
    if (window.getSelection().empty) {
      window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) {
      window.getSelection().removeAllRanges();
    }
  } else if (document.selection) {
    document.selection.empty();
  }
}

function cancelRequests() {
  window.needCancels &&
    window.needCancels.forEach((cancel) => {
      cancel();
    });
  window.needCancels = [];

  if (window.queryCancels && !isEmpty(window.queryCancels)) {
    Object.values(window.queryCancels).forEach((cancel) => {
      cancel();
    });
    window.queryCancels = {};
  }
}

function setUrlParams(query) {
  let data = [];
  for (let key in query) {
    if (query[key]) {
      data.push(`${key}=${query[key]}`);
    }
  }
  return data.join("&");
}

export default {
  typeOf(o) {
    return o == null
      ? String(o)
      : Object.prototype.toString.call(o).slice(8, -1).toLowerCase();
  },

  deepClone(obj) {
    let result = null;
    try {
      result = JSON.parse(JSON.stringify(obj));
    } catch (e) {
      //
    }
    return result;
  },

  clone(target) {
    let type = this.typeOf(target);

    if (type === "array") {
      return Array.prototype.slice.call(target);
    }
    if (type === "object") {
      return Object.assign({}, target);
    }
    return target;
  },

  indexOf(list, filter) {
    for (let i = 0, len = list.length; i < len; i++) {
      if (filter(list[i], i)) {
        return i;
      }
    }
    return -1;
  },

  find(list, filter) {
    if (!Array.isArray(list)) return;
    let result;
    list.some((item, index) => {
      if (filter(item, index) && !result) {
        result = item;
        return true;
      }
    });
    return result;
  },

  requireAll(requireContext) {
    const dataMap = {};
    requireContext.keys().forEach((key) => {
      let property = path.basename(key, path.extname(key));
      dataMap[property] = requireContext(key);
    });
    delete dataMap.index;
    return dataMap;
  },

  debounce(fn, delay, options) {
    options =
      typeof options === "undefined"
        ? typeof delay === "object"
          ? delay
          : {}
        : options;
    delay = typeof delay === "number" ? delay : 300;
    var timer;
    var leading = options.leading;
    return function () {
      let args = arguments;
      if (timer) clearTimeout(timer);
      let self = this;
      if (leading) {
        leading = false;
        fn.apply(self, args);
      }
      timer = setTimeout(function () {
        leading = options.leading;
        if (!options.leading) {
          fn.apply(self, args);
        }
      }, delay);
    };
  },

  getUrlQuery(search) {
    if (!search) {
      search = window.location.search;
    }
    const searchObj = {};
    for (let [key, value] of new URLSearchParams(search)) {
      searchObj[key] = value;
    }
    return searchObj;
  },
  getOmegaUrl(option, params) {
    const { from, applyUserName, applyType, applyId } =
      params || this.getUrlQuery();
    if (from !== "omega" && from !== "developerMode") {
      return "";
    }
    const { reportId, noApplyId, firstCondtion } = option;
    let url = firstCondtion ? "?" : "&";
    url += `from=${from}`;
    if (reportId) {
      url += `&reportId=${reportId}`;
    }
    if (applyUserName) {
      url += `&applyUserName=${applyUserName}`;
    }
    if (applyType) {
      url += `&applyType=${applyType}`;
    }
    if (!noApplyId && applyId) {
      url += `&applyId=${applyId}`;
    }
    return url;
  },

  getQueryByKey(key, url) {
    if (isNullOrUndefined(url)) {
      url = window.location.href;
    }
    key = key.replace(/[[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + key + "(=([^&#]*)|&|#|$)");
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  },

  isNumber(value, type) {
    let reg, parseFunction;
    if (type === "integer") {
      reg = /^-?[0-9]+$/;
      parseFunction = parseInt;
    } else {
      reg = /^-?[0-9]+\.[0-9]+$|^-?[0-9]+$/;
      parseFunction = parseFloat;
    }
    if (!reg.test(value)) return false;
    if (isNaN(parseFunction(value))) return false;
    return true;
  },

  transformNumber(value) {
    if (this.isNumber(value)) return +value;
    return value;
  },

  // array unique
  getUniqueArray(a) {
    let hash = {},
      len = a.length,
      result = [];
    for (let i = 0; i < len; i++) {
      if (!hash[a[i]]) {
        hash[a[i]] = true;
        result.push(a[i]);
      }
    }
    return result;
  },
  // array object unique
  getUniqueArrayObject(a, key) {
    let hash = {},
      len = a.length,
      result = [];
    for (let i = 0; i < len; i++) {
      if (!hash[a[i][key]]) {
        hash[a[i][key]] = true;
        result.push(a[i]);
      }
    }
    return result;
  },
  isNullOrUndefined,
  isObject,
  isString,
  isArray,
  isEmpty,
  mergeDeep,
  clearSelection,
  cancelRequests,
  setUrlParams,
  toLowerCase(value) {
    return String(value).toLowerCase();
  },
  stateChanged(prev, now, list) {
    return list.some((area) => {
      if (im.get(prev, area) !== im.get(now, area)) {
        return true;
      }
    });
  },
  generateFrontendId() {
    return uuidv4();
  },
  isNullOrUndefined(obj) {
    return obj === null || obj === undefined;
  },
};

export function fireKeyEvent(el, evtType, keyCode) {
  var doc = el.ownerDocument,
    win = doc.defaultView || doc.parentWindow,
    evtObj;
  if (doc.createEvent) {
    if (win.KeyEvent) {
      evtObj = doc.createEvent("KeyEvents");
      evtObj.initKeyEvent(
        evtType,
        true,
        true,
        win,
        false,
        false,
        false,
        false,
        keyCode,
        0
      );
    } else {
      evtObj = doc.createEvent("UIEvents");
      Object.defineProperty(evtObj, "keyCode", {
        get: function () {
          return this.keyCodeVal;
        },
      });
      Object.defineProperty(evtObj, "which", {
        get: function () {
          return this.keyCodeVal;
        },
      });
      evtObj.initUIEvent(evtType, true, true, win, 1);
      evtObj.keyCodeVal = keyCode;
      if (evtObj.keyCode !== keyCode) {
        console.log(
          "keyCode " + evtObj.keyCode + " 和 (" + evtObj.which + ") 不匹配"
        );
      }
    }
    el.focus();
    el.dispatchEvent(evtObj);
  } else if (doc.createEventObject) {
    evtObj = doc.createEventObject();
    evtObj.keyCode = keyCode;
    el.fireEvent("on" + evtType, evtObj);
  }
}
