// init()

// Grab the articles as a json
$.getJSON("/articles", function (data) {
  // For each one
  for (var i = 0; i < data.length; i++) {

    // Display the apropos information on the page
    $("#articles").append(
      "<div id='" + data[i]._id + "' class='panel panel-default'>"
      + "<div class='panel-heading'>"
      + "<h4 data-id='" + data[i]._id + "'>"
      + "<a class='article-link' target='_blank' href='" + data[i].link + "'>" + data[i].title
      + "</a>"
      + "</h4>"
      + "</div>"
      + "<div class='panel-body'>"
      + "<p>" + data[i].summary + "</p>"
      + "<a data-id='" + data[i]._id + "' class='btn btn-success save' id='" + data[i]._id + "'>"
      + "Save Article"
      + "</a>"
      + "</div>"
      + "</div>"
    );

  }

});



// Grab the savearticles as a json (value "saved" :true)
$.getJSON("/savedarticle", function (data) {
  for (var i = 0; i < data.length; i++) {

    // Display the apropos information on the page
    $("#savenotes").prepend(
      "<div class='panel panel-default " + data[i]._id + "'>"
      + "<div class='panel-heading'>"
      + "<h4 data-id='" + data[i]._id + "'>"
      + "<a class='article-link' target='_blank' href='" + data[i].link + "'>" + data[i].title
      + "</a>"
      + "</h4>"
      + "</div>"
      + "<div class='panel-body'>"
      + "<p>" + data[i].summary + "</p>"
      + "<a data-id='" + data[i]._id + "' class='btn btn-danger delete' id='" + data[i]._id + "'>"
      + "Delete Article"
      + "</a>"
      + "<a data-id='" + data[i]._id + "' class='btn btn-info writeNote'>"
      + "Write Note"
      + "</a>"
      + "</div>"
      + "</div>"
    );

  }
})


// Whenever someone clicks save
$(document).on("click", ".btn.save", function () {
  var thisId = $(this).attr("data-id");
  var currentId = $(this).attr("id");

  console.log("===============\n" + thisId + "\n===============\n")
  console.log("**************\n" + currentId + "\n**************\n")
  //$("#" + currentId).empty()

  $.ajax({
    method: "POST",
    url: "/savearticle/" + thisId
  }).done(function (data) {
    $("#" + currentId).empty()

  })
});


// Whenever someone clicks delete button
$(document).on("click", ".btn.delete", function () {
  var thisId = $(this).attr("data-id");
  var selected = $('.' + thisId);
  console.log("&&&&&&&&&&&&\n" + selected + "&&&&&&&&&&&&\n")

  $.ajax({
    method: "DELETE",
    url: "/delete/" + thisId
    // data: articleToSave
  }).done(function (data) {
    console.log("===============\n" + data + "===============\n")
    console.log("&&&&&&&&&&&&\n" + selected + "&&&&&&&&&&&&\n")
    selected.empty();

  })
});

// Whenever someone clicks save Write Note button
$(document).on("click", ".btn.writeNote", function () {
  $("#noteHere").empty();
  var thisId = $(this).attr("data-id")
  $.ajax({
    method: "GET",
    url: "/getnote/" + thisId
  })
    .done(function (data) {
      console.log("data when click write note" + data)
      var noteArr = data.notes
      console.log("noteArr: " + noteArr)


      $("#noteHere").append("<h5> Your note for: <br></h5>" + "<p class='articleTitle'>" + data.title + "</p>");
      $("#noteHere").append("<textarea id='bodyinput' name='body' placeholder='Your note'></textarea>");
      $("#noteHere").append("<h5> Note List: </h5>");
      for (var i = 0; i < noteArr.length; i++) {

        // $("#noteHere").append("<div id='result' name='result'>" + noteArr[i].body + "</div><span class=deleter>X</span>");
        $("#noteHere").append(
          // "<div class='panel panel-default " + data[i]._id + "'>"
          "<div class='col-xs-12 " + noteArr[i]._id + " '>"
          + "<p class= 'col-xs-11 col-sm-9 col-lg-11' id='result' name='result'>" + noteArr[i].body + "</p>"
          + "<p data-id='" + noteArr[i]._id + "' class= 'col-xs-1 col-sm-3 col-lg-1 deleter'>X" + "</p>"
          + "</div>"
        );

        // $("#noteHere").prepend("<p data-id=" + data._id + "><span class='dataTitle' data-id=" +
        // data._id + ">" + data.title + "</span><span class=deleter>X</span></p>");
      }


      $("#noteHere").append("<button class= 'btn btn-success' data-id='" + data._id + "' id='savenote'>Save Note</button>");
      // $("#noteHere").append("<button class= 'btn btn-danger' data-id='" + data._id + "' id='deletenote'>Delete Note</button>");

      if (data.notes.length > 0) {
        var lastNote = data.notes[data.notes.length - 1]
        // $("#result").val(lastNote.result);
        // $("#bodyinput").val("Last note you wrote for this article: " + '"' + lastNote.body + '"');
        $("#bodyinput").val("");

      }
    });
});

// When you click the Save Note button
$(document).on("click", "#savenote", function () {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/getnote/" + thisId,
    data: {
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    .done(function (data) {

      $("#noteHere").empty();
    });
  // Also, remove the values entered in the textarea for note entry
  $("#bodyinput").val("");
});


// Whenever someone clicks delete note (X) button
$(document).on("click", ".deleter", function () {
  var thisId = $(this).attr("data-id");
  var selected = $('.' + thisId);

  $.ajax({
    method: "DELETE",
    url: "/deletenote/" + thisId
    // data: articleToSave
  }).done(function (data) {
    selected.empty();
    $("#noteHere").empty();

  })
});