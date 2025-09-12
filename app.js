import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

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

app.get("/", (req, res) => {
    res.render("login");
});

// app listen
app.listen(process.env.PORT, () => {
    console.log(`Listening on port: ${process.env.PORT}`);
});
