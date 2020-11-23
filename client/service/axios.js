/**
 * raw: 将直接返回 response.data，否则返回 response.data.data
 */
import axios from "axios";
import { Message } from "antd";

const axiosCache = axios.create({
  withCredentials: true,
  timeout: 1000 * 60 * 10,
  baseURL: "https://back.opusforte.com",
});

// request 拦截
axiosCache.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axiosCache.interceptors.response.use(
  function (response) {
    // console.log('response', response);
    const data = response.data.data;
    const code = response.data.code;
    const errorMess = response.data.msg;
    if (code !== 200) {
      switch (code) {
        default:
          // 返回全量数据
          if (response.config.raw) {
            return response.data;
          }
          Message.error(errorMess);
          break;
      }
      return Promise.reject(response.data);
    } else {
      // 返回全量数据
      if (response.config.raw) {
        return response.data;
      }
      return data;
    }
  },
  function (error) {
    if (axios.isCancel) {
      return new Promise(() => {});
    }
    return Promise.reject(error);
  }
);

const catchError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.log(error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log("Error", error);
  }
  return Promise.reject(error);
};

const cache = {
  request(method) {
    return function (url, data = {}, opts = {}) {
      // 处理 url
      url = url
        .split("/")
        .map((item) => {
          const [empty, name] = item.split(":");
          if (!empty && data[name]) {
            const value = data[name];
            delete data[name];
            return value;
          }
          return item;
        })
        .join("/");

      if (method === "get" || method === "delete") {
        // console.log(url, data, opts);
        return axiosCache[method](url, {
          ...opts,
          params: data,
        }).catch(catchError);
      }
      return axiosCache[method](url, data, opts).catch(catchError);
    };
  },
};

cache.get = cache.request("get");
cache.post = cache.request("post");
cache.put = cache.request("put");
cache.patch = cache.request("patch");
cache.delete = cache.request("delete");

export default cache;
