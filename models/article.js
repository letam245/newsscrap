// Require mongoose
var mongoose = require ("mongoose");

// Create Schema class
var Schema = mongoose.Schema;

//Create article schema
var ArticleSchema = new Schema({
    //title is a require string
    title: {
        type: String,
        required: true,
        // unique: { index: { unique: true } }
    },
    //link is require string
    link: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: false
    },
    saved: {
        type: Boolean,
        default: false
    },
    // notes property for the article collection
    notes: [{
        // Store ObjectIds in the array
        type: Schema.Types.ObjectId,
        // The ObjectIds will refer to the ids in the Note model
        ref: "Note"
    }]
})

// Create the Article model with the ArticleSchema
var Article = mongoose.model("Article", ArticleSchema);

//export the Article model
module.exports = Article
