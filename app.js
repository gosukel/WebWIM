import express from "express";
import session from "express-session";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import indexRouter from "./routes/indexRouter.js";
import loginRouter from "./routes/loginRouter.js";
import calculateRouter from "./routes/calculateRouter.js";
import processRouter from "./routes/processRouter.js";
import itemsRouter from "./routes/itemsRouter.js";

if (process.env.NODE_ENV !== "production") {
    await import("dotenv/config");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const assetsPath = path.join(__dirname, "public");

//  app logic
const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
    session({
        secret: "mySecret",
        cookie: {},
        resave: false,
        saveUninitialized: false,
    })
);

// paths
app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/calculate", calculateRouter);
app.use("/process", processRouter);
app.use("/items", itemsRouter);

// app listen
app.listen(process.env.PORT, () => {
    console.log(`Listening on port: ${process.env.PORT}`);
});

// ADD JS FILE TO PUBLIC FILE, LINK TO IT IN PROCESS.EJS
// USE IT FOR DOM MANIPULATION TO ADD EVENT LISTENERS, CREATE ELEMENTS, ETC...
