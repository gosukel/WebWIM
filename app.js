import express from "express";
import session from "express-session";
import { Pool } from "pg";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import "./config/passport.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import indexRouter from "./routes/indexRouter.js";
import loginRouter from "./routes/loginRouter.js";
import calculateRouter from "./routes/calculateRouter.js";
import processRouter from "./routes/processRouter.js";
import itemsRouter from "./routes/itemsRouter.js";
import locationsRouter from "./routes/locationsRouter.js";
import logoutRouter from "./routes/logoutRouter.js";
import adminRouter from "./routes/adminRouter.js";
import { isAuth, isAdmin } from "./middleware/authMiddleware.js";

if (process.env.NODE_ENV !== "production") {
    await import("dotenv/config");
}

const pool = new Pool({
    host: process.env.host,
    user: process.env.user,
    database: process.env.database,
    password: process.env.password,
    port: process.env.dbport,
});
const pgSession = connectPgSimple(session);
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
        store: new pgSession({
            pool: pool,
            createTableIfMissing: true,
        }),
        secret: process.env.sessionSecret,
        cookie: { maxAge: 1000 * 60 * 60 * 24 },
        resave: false,
        saveUninitialized: false,
    }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
    const publicPaths = ["/login", "/logout"];

    if (publicPaths.includes(req.path)) {
        return next();
    }

    if (req.isAuthenticated()) {
        res.locals.user = req.user;
        return next();
    }

    res.redirect("/login");
});

// paths
app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/calculate", calculateRouter);
app.use("/process", processRouter);
app.use("/items", itemsRouter);
app.use("/locations", locationsRouter);
app.use("/logout", logoutRouter);
app.use("/admin", adminRouter);

// app listen
// app.listen(process.env.PORT, () => {
//     console.log(`Listening on port: ${process.env.PORT}`);
// });

async function startServer() {
    try {
        await pool.query("SELECT 1");
        console.log("database ready");

        app.listen(process.env.PORT, () => {
            console.log(`Listening on port: ${process.env.PORT}`);
        });
    } catch (err) {
        console.error("Failed to connect to DB: ", err);
        process.exit(1);
    }
}

startServer();
