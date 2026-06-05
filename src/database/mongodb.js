const dns = require('node:dns/promises');
dns.setServers(['1.1.1.1', '8.8.8.8']);  // Cloudflare + Google DNS

const mongoose = require("mongoose")
const MONGO_URI = process.env.NODE_ENV == "dev" ? process.env.DEVE_MONGODB_CONNECTION_STRING : process.env.PRO_MONGODB_CONNECTION_STRING 

module.exports = async () => {
    try {
        const conn = await mongoose.connect( MONGO_URI,)
        console.log(`Database Connected (${conn.connection.name})`)
        return conn.connection.db
    } catch (error) {
        console.log(`Error: ${error.message}`)
        console.log(`Database not Connected`)
    }
}


