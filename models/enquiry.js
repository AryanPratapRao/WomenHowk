const { name } = require("ejs");
const mongoose = require("mongoose");

const enquirySchema = mongoose.Schema({
    name: String,
    email: String,
    message: String
});

module.exports = mongoose.model("enquiry",enquirySchema);