// the express package will run our server
const express = require("express");
const app = express();
app.use(express.static("public")); // this line tells the express app to 'serve' the public folder to clients

// HTTP will expose our server to the web
const http = require("http").createServer(app);

// start our server listening on port 8080 for now (this is standard for HTTP connections)
const server = app.listen(8080);
console.log("Server is running on http://localhost:8080");

let currentSong = {
  name: null,
  startTime: null
}




/////SOCKET.IO///////
const io = require("socket.io")().listen(server);

const peers = {};

io.on("connection", (socket) => {
  console.log(
    "Someone joined our server using socket.io.  Their socket id is",
    socket.id
  );

  // Make sure to send the client all existing peers
  socket.emit("introduction", peers);

  // tell other clients that a new peer joined
  io.emit("newPeerConnected", socket.id);

  //
  if(!currentSong.name){
    console.log("First user");
    socket.emit("askToPlay");

  }else{
    console.log("Not first user, sending current song info");
    socket.emit("sendCurrentSong", currentSong);
    console.log(currentSong)
  }
  
  socket.on("playSong",(songName)=>{ // play 或是切歌
    // update currentSong
    currentSong = {
      name: songName,
      startTime: new Date().getTime()
    }
    console.log(songName);
    if(songName !== " Change Song "){
      
    socket.broadcast.emit("sendCurrentSong",currentSong);
    
    }// socket.emit("sendCurrentSong",currentSong);
  })
  // socket.emit("sendCurrentSong", currentSong);

  peers[socket.id] = {
    position: [0, 0.5, 0],
    rotation: [0, 0, 0, 1], // stored as XYZW values of Quaternion
  };

  socket.on("msg", (data) => {
    console.log("Got message from client with id ", socket.id, ":", data);
    let messageWithId = { from: socket.id, data: data };
    socket.broadcast.emit("msg", messageWithId);
  });

  // whenever the client moves, update their movements in the clients object
  socket.on("move", (data) => {
    if (peers[socket.id]) {
      peers[socket.id].position = data[0];
      peers[socket.id].rotation = data[1];
    }
  });

  // Relay simple-peer signals back and forth
  socket.on("signal", (to, from, data) => {
    if (to in peers) {
      io.to(to).emit("signal", to, from, data);
    } else {
      console.log("Peer not found!");
    }
  });

  socket.on("disconnect", () => {
    console.log("Someone with ID", socket.id, "left the server");

    io.sockets.emit("peerDisconnected", socket.id);

    delete peers[socket.id];

    if(Object.keys(peers).length<1){
      console.log('no one is here anymore');
      currentSong = {
        name: null,
        startTime: null
      }
    }
  });
});

// update all clients with peer data every 100 milliseconds (around 10 times per second)
setInterval(() => {
  io.sockets.emit("peers", peers);
}, 10);
