import _ from "@util/index";

const im = {
  /*
   *
   * 如果是replace== true则是替换，否则的话是构成一个新的
   * 如果delete=true，则val为空时删除对应的字段或者数组值
   * val为undefined时，默认删除，除非forceSet设置为true
   */
  set(target, pathes, val, options = {}) {
    if (options === true) {
      options = {
        replace: true,
      };
    }
    if (typeof pathes === "number") pathes = [pathes];
    else if (typeof pathes === "string") pathes = pathes.split(".");
    pathes = pathes || [];

    let currentVal = this.get(target, pathes);
    if (!options.replace && currentVal === val) {
      return target;
    }

    if (options.delete) {
      if (
        val === undefined ||
        val === null ||
        (_.typeOf(val) === "array" && val.length === 0)
      ) {
        return im.del(target, pathes);
      }
    } else if (val === undefined && !options.forceSet) {
      return im.del(target, pathes);
    }

    let { replace } = options;

    let tType = _.typeOf(target);
    let aType = _.typeOf(val);
    let len = pathes.length;

    if (!len) {
      return !replace && tType === "object" && aType === "object"
        ? Object.assign({}, target, val)
        : val;
    }

    let nextPath = pathes.shift();
    let dest = _.clone(target);

    if (dest === undefined && options.autoCreated) {
      dest = {};
    }

    // 判断是否是一样的设置，否则就不做变化
    if (len === 1) {
      // 证明是最后一个
      if (dest[nextPath] === val) {
        return dest;
      }
    }
    dest[nextPath] = im.set(dest[nextPath], pathes, val, options);
    return dest;
  },

  /**
   * get(state, 'path.left,name')
   * 避免 undefined of undefined 错误
   */
  get(target, pathes) {
    if (_.isNullOrUndefined(pathes)) return target;
    if (typeof pathes === "number") pathes = [pathes];
    else if (typeof pathes === "string") pathes = pathes.split(".");
    target &&
      pathes.some((p) => {
        target = target[p];
        if (target == null) return true;
        return false;
      });
    return target;
  },

  del(target, pathes) {
    if (!target) return target;
    if (typeof pathes === "number") {
      pathes = [pathes];
    } else if (typeof pathes === "string") {
      pathes = pathes.split(".");
    }

    pathes = pathes || [];

    let len = pathes.length;

    let dest = _.clone(target);
    if (!len) {
      return dest;
    }

    let nextPath = pathes.shift();

    let tType = _.typeOf(target);
    if (len === 1) {
      if (tType === "object") {
        delete dest[nextPath];
        return dest;
      } else if (tType === "array") {
        dest.splice(parseInt(nextPath, 10), 1);
        return dest;
      }
      return dest;
    }
    dest[nextPath] = im.del(dest[nextPath], pathes);
    return dest;
  },
};

export default im;
