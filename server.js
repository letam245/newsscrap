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
    // Save an empty arry
    var result = [];
    // First, we grab the body of the html with request
    request("http://www.nytimes.com/pages/todayspaper/index.html", function (err, reponse, html) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);

        var arrLength = $(".story").length;

        // Now, we grab every h4 with the class headline-link
        $(".story").each(function (i, element) {

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(element).children("h3").text();
            result.link = $(element).children("h3").children("a").attr("href");
            result.summary = $(element).children("p").text();

            // Using our Article model, create a new entry
            // This effectively passes the result object to the entry
            var entry = new Article(result)

            // Now, save that entry to the db
            entry.save(function (err, doc) {
                if (err) {
                    console.log(err)
                }
                else {
                    result.push(doc);
                    console.log(doc)
                    if (i === arrLength - 1) {
                        //res.send(result)
                        res.redirect("/")
                        //console.log(result)
                    }

                }
            })
        })
    })
    // Tell the browser that we finished scraping the text
    // res.send("Scrape Complete");

})

//This will get the articles we scraped from the mongoDB
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


//This will set a article's saved property to true
app.post("/savearticle/:id", function (req, res) {
    Article.findOneAndUpdate({ "_id": req.params.id }, { $set: { "saved": true } })
        //.populate("articles")
        // Log any errors
        .exec(function (err, doc) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(doc)
                res.send(doc)
            }
        })
});

//This will get all the saved articles
app.get("/savedarticle", function (req, res) {
    // console.log('savedArticles');
    Article.find({ "saved": true })
        //.populate("articles")
        // Log any errors
        .exec(function (err, doc) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(doc)
                res.send(doc)
            }
        })

});

//This will delete/remove an article in the database
app.delete("/delete/:id", function (req, res) {
    Article.findOneAndRemove({ "_id": req.params.id })
        //.populate("articles")
        // Log any errors
        .exec(function (err, doc) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(doc)
                res.send(doc)
            }
        });
});

/// This will grab an article by it's ObjectId and populate the note collection
app.get("/getnote/:id", function (req, res) {
    Article.findOne({ "_id": req.params.id })
        .populate("notes")
        .exec(function (err, doc) {
            if (err) {
                console.log(err)
            }
            else {
                res.send(doc)
            }
        });
});


///This will create a new note or replace an existing note
app.post("/getnote/:id/", function (req, res) {
    var newNote = new Note(req.body)
    newNote.save(function (err, doc) {
        if (err) {
            console.log(err)
        }
        else {
            Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { "notes": doc._id } }, function (err, newdoc) {
                // Send any errors to the browser
                if (err) {
                    res.send(err);
                }
                // Or send the newdoc to the browser
                else {
                    res.send(newdoc);
                    console.log(newdoc)
                }
            });
        }
    });
});


// /// This will grab  an the notes and delete it
app.delete("/deletenote/:id", function (req, res) {
    Note.findOneAndRemove({ "_id": req.params.id })
        //.populate("articles")
        // Log any errors
        .exec(function (err, doc) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(doc)
                res.send(doc)
            }
        });
});






// Listen on port 5000
app.listen(process.env.PORT || 5000, function() {
    console.log("App running on port 5000!");
  });
