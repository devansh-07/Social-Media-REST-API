const express = require("express");
const env = require("dotenv");
const morgan = require("morgan");
const mongoose = require("mongoose");
const helmet = require("helmet");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");

// Load .env file (access using process.env.VAR_NAME)
env.config({ path: "./config/config.env" })

// Connect MongoDB
mongoose.connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then((conn) => {
    console.log(`MongoDB Connected: ${conn.connection.host}.`);
}).catch((err) => {
    console.error(err);
});

app = express();

app.use(express.json());
app.use(helmet());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV === "dev") { app.use(morgan('dev')); }

app.get("/", (req, res) => {
    res.send("Working!");
});

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);

PORT = 8000
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on ${PORT}`));