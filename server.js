// Dependencies

var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/newsscraper");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function (error) {
    console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function () {
    console.log("Mongoose connection successful.");
});

// ========================
// The Routes
// ========================

// a get request to scrape the website content
app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with request
    request("https://www.nhl.com/", function (err, reponse, html) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);
        // Now, we grab every h4 with the class headline-link
        $("h4.headline-link").each(function (i, element) {
            // Save an empty result object
            var result = {};
            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(element).text();
            result.link = $(element).parent().attr("href")

            // Using our Article model, create a new entry
            // This effectively passes the result object to the entry
            var entry = new Article(result)

            // Now, save that entry to the db
            entry.save(function (err, doc) {
                if (err) {
                    console.log(err)
                }
                else {
                    console.log(doc)
                }
            })
        })
    })
    // Tell the browser that we finished scraping the text
    res.send("Scrape Complete");
})

// This will get the articles we scraped from the mongoDB
app.get("/articles", function (req, res) {
    Article.find({}, function (err, doc) {
        if (err) {
            console.log(err)
        }
        else {
            console.log(doc);
            res.send(doc)
        }
    })
})

// This will grab an article by it's ObjectId
app.get("/articles/:id", function (req, res) {
    Article.findOne({ "_id": res.params.id })
        .populate("notes")
        .exec(function (err, doc) {
            if (err) {
                console.log(err)
            }
            else {
                console.log(doc)
            }
        })
})

// Create a new note or replace an existing note
app.post("/articles/:id", function (req, res) {
    // Use our Note model to make a new note from the req.body
    var newNote = new Note(req.body)
    // Save the new note to mongoose
    newNote.save(function (err, doc) {
        if (err) {
            console.log(err)
        }
        else {
            // Find our article and push the new note id into the Article's notes array
            //pushing the id to the the notes property in the Article collection
            Article.findOneAndUpdate({}, { $push: { "notes": doc._id } }, { new: true }, function (err, newdoc) {
                if (err) {
                    console.log(err)
                }
                else {
                    console.log(newdoc)
                    res.send(newdoc)
                }
            })
        }
    })
})

// Listen on port 5000
app.listen(5000, function(){
    console.log("App is running on 5000")
})