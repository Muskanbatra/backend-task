require("./mongodb")();

const mongoose = require("mongoose")

// wait for connection to be established
let connected = false
mongoose.connection.on('connected', () => {
    connected = true;
})
