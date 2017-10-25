// Require mongoose
var mongoose = require ("mongoose");

// Create Schema class
var Schema = mongoose.Schema;

//Create article schema
var NoteSchema = new Schema({
    //title is a require string
    title: {
        type: String
    },
    //body is a string
    body: {
        type: String
    }
})

// Create the Note model with the NoteSchema
var Note = mongoose.model("Note", NoteSchema);

//export the Note model
module.exports = Note;