const express = require("express")
// const { default: logger } = require("./logger");
// <-------------------------- initialize app -------------------------->
const app = express()
const path = require("path");

// <---------------------- load env vars ----------------------------->
require('dotenv').config();

//<----------------------- Database connect ---------------------->
require("./src/database/init");

const PORT = process.env.PORT || 8000;

//<---------------------------- cors config ------------------------------>
const cors = require("cors")
app.use(cors())
app.use(express.json())
// app.use(logger);

// remove body size limit
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '10gb' }));
app.use(bodyParser.urlencoded({ limit: '10gb', extended: true }));

app.use("/images", express.static(path.join(__dirname, "public/images")));

//<------------------------- logging with morgan ------------------------>
const morgan = require("morgan");
const errorHandler = require("./src/middleware/errorHandler.middleware");
app.use(morgan('dev'));

//<---------------------------- main route setup ------------------------>
app.use("/api/v2", require('./src/routes'));
app.get('/', (req, res) => res.status(200).send("Hello World !"))

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on Port: ${PORT}`);
})

