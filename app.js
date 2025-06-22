// const express=require("express");
// const socket=require("socket.io");
// const http=require("http"); //custom http server for calling the socket.io
// const {Chess}=require("chess.js");
// const path=require("path");
// const { title } = require("process");
// const { console } = require("inspector/promises");

// const app=express();

// const server=http.createServer(app);
// const io=socket(server);//all functionality of socket is given to io

// const chess=new Chess();//all chess rules and functionality is here in new chess class
// let players={};
// let currPlayer="W";

// app.set("view engine","ejs");
// app.use(express.static(path.join(__dirname,"public")))

// app.get("/",(req,res)=>{
//     res.render("index",{title:"Chess Game"})
// })

// io.on("connection",function(uniquesocket){//io is connected to backend and send information to frontend
//     console.log("connected")
//     uniquesocket.on("churan",function(){
//         console.log("churan received")
//     })
// })

// server.listen(3001,function(){
//     console.log("server running at port 3001")
// })

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { Chess } = require("chess.js");

const chess=new Chess();
let players={}
let currPlayer="w"

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.render("index", { title: "Chess Game" });
});

io.on("connection", function (uniquesocket) {
  console.log("connected");

  if(!players.white){
    players.white=uniquesocket.id;//if new player connected it send request to backend
    uniquesocket.emit("playerRole","w")//backend response the role to player which is newly try to connect
  }
  else if(!players.black){
    players.black=uniquesocket.id
    uniquesocket.emit("playerRole","b")
  }
  else{
    uniquesocket.emit("spectatorRole")
  }

  uniquesocket.on("disconnect",function(){
    if(uniquesocket.id===players.white){
        delete players.white;
    }
    else if(uniquesocket.id===players.black){
        delete players.black;
    }
  })
  uniquesocket.on("move", (move) => {
  try {
    if (chess.turn() === "w" && uniquesocket.id !== players.white) return;
    if (chess.turn() === "b" && uniquesocket.id !== players.black) return;

    const result = chess.move(move);
    if (result) {
      currPlayer = chess.turn();
      io.emit("move", move);
      io.emit("boardState", chess.fen());
    } else {
      console.log("invalid move", move);
      uniquesocket.emit("invalidMove", move);
    }
  } catch (err) {
    console.log(err);
    uniquesocket.emit("invalid move", move);
  }
});
});

server.listen(3001, function () {
  console.log("server running at port 3001");
});
