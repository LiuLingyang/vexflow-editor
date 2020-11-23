import axios from "./axios";

export default {
  upload({ file }) {
    let formData = new FormData();
    formData.append("image", file);
    return axios.post("/api/upload", formData);
  },
};
