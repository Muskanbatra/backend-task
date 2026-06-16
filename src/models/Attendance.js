const mongoose = require('mongoose');

module.exports =

  mongoose.model(

    "Attendance",

    new mongoose.Schema({

      userId: String,

      checkInTime: Date,

      checkOutTime: Date,

      checkInLocation: Object,

      checkOutLocation: Object,

      status: String,

      totalHours: Number

    })

  );