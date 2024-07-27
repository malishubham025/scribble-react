const express =require ("express");
const { Server }=require  ("socket.io");
const { createServer } =require ("http");
const cors =require ("cors");
const cookieParser = require('cookie-parser');
const cookie = require('cookie');
var myMap = new Map();
var Rooms= new Map();
var RoomsScores= new Map();
const GameStates = new Map();
// const jwt =require ("jsonwebtoken");
// const cookieParser =require ("cookie-parser");

const secretKeyJWT = "asdasdsadasdasdasdsa";
const port = 4000;

const app = express();
app.use(cookieParser());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});


function pushToMap(map, key, element) {
  // console.log(key);
  if (map.has(key)) {
    // console.log("hello");
      // // If the key exists, push the element to the array
      let b=true;
      let arr=map.get(key);
      if(arr){
        for(let i=0;i<arr.length;i++){
          if(arr[i]==element){
            b=false;
            break;
          }
        }
      }
      // console.log(arr);
      if(arr && b){
        arr.push(element);
      }
  } else {
      // If the key doesn't exist, create a new array with the element
      map.set(key, [element]);
  }
  // console.log(map);
  
}
function pushScore(map,room,user,score){
  let arr=map.get(room);
  for(let i=0;i<arr.length;i++){
    let temp=arr[i];
    if(user==temp.user){
      temp.score=temp.score +score;
    }
  }
}


io.on("connection", (socket) => {

  const cookies = cookie.parse(socket.handshake.headers.cookie || '');
  const user=cookies.userid;
  // if(user){
    myMap.set(user,socket.id);
    // console.log("user connected ->",user,myMap.get(user));
    // io.emit("userids",Object.fromEntries(myMap));
  // }
  socket.on("message", (message) => {
    // console.log({ room, message });
    io.emit("receive-message", message);
  });

  socket.on("toroom", ({ from,room, message ,color}) => {
    // console.log(socket.id);
    // console.log({ room, from,message });
    // console.log(message);
    io.to(room).emit("receive-message-room", {from,room,message,color})  });
  
    socket.on("correct-guess",({room,user})=>{
      io.to(room).emit("correct-guess-room",user);
    })



  socket.on("join-room", (info) => {
    
    const room=info.room;
    const user=info.user;
    socket.join(room);
    pushToMap(Rooms, room, user);
    pushToMap(RoomsScores,room,{"user":user,score:0});
    console.log(Rooms);
    // console.log("ROOMS ->");
    // console.log(Rooms.get(room));
    let arr=RoomsScores.get(room);
    io.to(room).emit("allusers",arr);
    console.log(`User joined room ${room}`);
  });
  socket.on('drawing', (data) => {
    
    const room = data.room; // Assuming the room information is included in the data
    io.to(room).emit("drawing-room", data);
    // io.to(room).emit("receive-message-room", {"from":"from","room":room,"message":"hi"});
  });
  socket.on('drawing2', (data) => {
    
    const room = data.room; // Assuming the room information is included in the data
    io.to(room).emit("drawing-room2", data);
    // io.to(room).emit("receive-message-room", {"from":"from","room":room,"message":"hi"});
  });
  

  socket.on("disconnect", () => {

    const room=cookies.roomid;
    console.log("User Disconnected", socket.id);
    myMap.delete(user);
    var arr=Rooms.get(room);
    console.log(arr);
  //   // console.log(arr);
    if(arr){
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === user) {
          arr.splice(i, 1);
          break;
      }
    }
  }
    if (arr && arr.length === 0) {
      Rooms.delete(room);
    } else {
        Rooms.set(room, arr);
        console.log(Rooms);
    }
    // console.log(Rooms.get(room));
    io.emit("userids",Object.fromEntries(myMap));
    // console.log(user);
  });

  socket.on("check-players",(room)=>{
    // let arr=Rooms.get(room);
    // console.log(arr.length);
    // console.log("ji");
    let arr=Rooms.get(room);
    let len=arr.length;
    io.emit("players-checked",{"roomid":room,"players":len});
  })

  socket.on("start-game",(obj)=>{
    console.log("game-started");
  io.to(obj.room).emit("game-started",obj);
  })


  socket.on("play-finnally", (obj) => {
    console.log("play-finnally");
    let words = ["hi", "hello", "isit", "nice", "one", "three", "home"];
    let room = obj.room;

    // Ensure only one game starts per room
    if (GameStates.get(room)) {
        console.log(`Game already in progress for room ${room}`);
        return;
    }

    // Check if the number of players is enough to start the game
    let arr = Rooms.get(room);
    if (arr.length < 2) {
        console.log("Not enough players to start the game");
        return;
    }
    
    GameStates.set(room, true);
    let size = arr.length;
    let timegivenplayer = 40;
    let rounds = obj.rounds; // Number of rounds
    let round = 1; // Start with round 1
    let timebtwn = 5;
    
    function startRound(round) {
        if (round > rounds) {
            console.log("Game ended.");
            GameStates.set(room, false);
            return;
        }
        let score=size+10;
        console.log(`Round ${round} started`);
        io.to(room).emit("round-number", round);

        let p = 1;

        function player(size, p) {
            if (p > size) {
                startRound(round + 1); // Proceed to the next round
                return;
            }

            let mySet = new Set();
            let x = timegivenplayer;
            let word = words[Math.floor(Math.random() * words.length)];
            console.log(`${arr[p-1]} is playing with word: ${word}`);

            io.to(room).emit("word", word);
            io.to(room).emit("is-playing", arr[p-1]);

            let timer = setInterval(() => {
                if (x <= 0) {
                    io.to(room).emit("timer-player", 0);
                    clearInterval(timer);
                    player(size, p + 1); // Move to the next player
                } else {
                    io.to(room).emit("timer-player", x);
                    x--;
                }
            }, 1000);

            const checkTimeListener = (user) => {
                console.log("correct guess by ", user);
                pushScore(RoomsScores,room,user,score);
                io.to(room).emit("allusers",RoomsScores.get(room));
                mySet.add(user);
                score--;
                if (mySet.size === size - 1) { // All other players guessed correctly
                    console.log("All players guessed correctly, moving to next player");
                    clearInterval(timer);
                    socket.off("check-time", checkTimeListener); // Remove the listener
                    player(size, p + 1);
                }
            };

            socket.on("check-time", checkTimeListener);
        }

        player(size, p);
    }

    startRound(round);
});

  
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
