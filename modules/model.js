// File: ./modules/model.js

// Require Mongoose
var mongoose = require("mongoose");

// Määritellään Schema, eli tietomalli.
const MovieSchema = new mongoose.Schema({

    title: String,
    year: Number,
    poster: String,
});

/* The next step is to export MovieSchema based Movie Model */
module.exports = mongoose.model('Movie', MovieSchema, 'movies');