const koa = require("koa");
const static = require("koa-static");
const render = require("koa-ejs");
const router = require("koa-router")({
  prefix: "/",
});
const config = require("../config");

const app = koa();
app.use(router.routes());
app.use(static(__dirname + "../"));

render(app, {
  root:
    process.env.NODE_ENV === "production"
      ? config.build.viewpath
      : config.dev.viewpath,
  viewExt: "ejs",
  layout: false,
  cache: false,
});

router.get("/", function* () {
  yield this.render("index", {
    NODE_ENV: process.env.NODE_ENV || "development",
  });
});
router.get("/index", function* () {
  yield this.render("index", {
    NODE_ENV: process.env.NODE_ENV || "development",
  });
});
router.get("/test", function* () {
  yield this.render("test", {
    NODE_ENV: process.env.NODE_ENV || "development",
  });
});

app.listen(3000);
