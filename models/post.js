const { name } = require("ejs");
const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    date: {
        type: Date,
        default: Date.now()
    },
    content: String,
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }]
});

module.exports = mongoose.model("post",postSchema);