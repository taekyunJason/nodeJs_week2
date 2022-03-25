const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Post = require("./schemas/post");
const User = require("./schemas/user");
const jwt = require("jsonwebtoken");

const token = jwt.sign({ test: true }, "my-secret-key");
console.log(token);

const decode = jwt.verify(token, "my-secret-key");
console.log(decode);

mongoose.connect("mongodb://localhost/prac_blog_db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

const app = express();
const router = express.Router();

//미들웨어를 붙이는데, /api로 접근하면 뒤에 있는 express.json()미들웨어로 json바디를 받을 수 있음,(body-parser)
//이후에 라우터도 사용함, 단순히 router.get에는 '/'로 경로가 정의되어 있지만,
//app.use에서 '/api'로 접근해야 사용이 가능하기 때문에 이렇게 작성해야만 라우터로 연결이 됨.
// app.use("/api", express.json(), router);

router.get("/", (req, res) => {
  console.log("로그인 화면입니다");
  const path = require("path");
  res.sendFile(path.join(__dirname + "/templates/loginAndSignUp.html"));
});

router.post("/users", async (req, res) => {
  const { nickName, email, password, passwordConfirm } = req.body;

  console.log(req.body);

  if (password !== passwordConfirm) {
    res.status(400).send({
      errorMessage: "비밀번호가 일치하지 않습니다.",
    });
    return;
  }

  const existUser = await User.find({
    $or: [{ email }, { nickName }],
  });
  if (existUser.length) {
    res.status(400).send({
      errorMessage: "이미 등록된 닉네임, 이메일입니다.",
    });
    return;
  }

  const user = new User({ email, nickName, password });
  await user.save();
  res.status(201).send({});
});

router.post("/posts", async (req, res) => {
  const {} = req.body;
  const maxOrderPost = await Post.findOne().sort("-order").exec();
  let order = 1;

  if (maxOrderPost) {
    order = maxOrderPost.order + 1;
  }

  // const post = new Post({number, order });
  // await post.save();

  // res.send({ post });
});

app.use("/", express.urlencoded({ extended: false }), router);
app.use(express.static("templates"));

app.listen(8080, () => {
  console.log("서버가 켜졌어요!");
});
