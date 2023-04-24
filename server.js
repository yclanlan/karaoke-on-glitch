// the express package will run our server
const express = require("express");
const app = express();
app.use(express.static("public")); // this line tells the express app to 'serve' the public folder to clients

// HTTP will expose our server to the web
const http = require("http").createServer(app);

// start our server listening on port 8080 for now (this is standard for HTTP connections)
const server = app.listen(8080);
console.log("Server is running on http://localhost:8080");

// Create a database and load it into memory using 'nedb'
let Datastore = require("nedb");
let db = new Datastore({ filename: "./database.db" });
db.loadDatabase();
db.find({}, function (err, docs) {
  console.log("# of database entries:", docs.length);
});

// uncomment to delete all docs
db.remove({}, { multi: true }, function (err, numRemoved) {
  console.log("Removing",numRemoved,"database entries!");
});


/////SOCKET.IO///////
const io = require("socket.io")().listen(server);

const peers = {};

io.on("connection", (socket) => {
  console.log(
    "Someone joined our server using socket.io.  Their socket id is",
    socket.id
  );
  db.find({}, function (err, docs) {
    console.log(
      "Sending",
      docs.length,
      "existing database entries to new client"
    );
    socket.emit("existing", docs);
  });

  peers[socket.id] = {};

  console.log("Current peers:", peers);

  socket.on("msg", (data) => {
    console.log("Got message from client with id ", socket.id, ":", data);
    let messageWithId = { from: socket.id, data: data };
    socket.broadcast.emit("msg", messageWithId);
    db.insert(messageWithId, (err, doc) => {
      console.log("newdoc:", doc);
    });
  });

  socket.on("disconnect", () => {
    console.log("Someone with ID", socket.id, "left the server");
    delete peers[socket.id];
  });
});
