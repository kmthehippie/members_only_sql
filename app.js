const express = require("express");
const path = require("path");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const passport = require("passport");
const passportConfig = require("./config/passport-config");
require("dotenv").config();
const indexRouter = require("./routes/index");

//initialize express
const app = express();

//view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//setup all other stuff
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));

//setup sessions
app.use(
  session({
    store: new pgSession({
      connectionString: process.env.DATABASE_URL,
      pg: require("pg"),
    }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1 * 60 * 60 * 1000, // 1hour
      httpOnly: true,
    },
  })
);

//TOP says no need for the following line
app.use(passport.initialize());
app.use(passport.session());

passportConfig(passport);
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use("/", indexRouter);

app.listen(process.env.PORT, () => {
  console.log("App is listening on PORT ", process.env.PORT);
});
