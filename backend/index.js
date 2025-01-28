const express =require ("express");
const { Server }=require  ("socket.io");
const { createServer } =require ("http");
const {Redis,partialGameStates,Publisher,subScriber}=require("./connections");
const cors =require ("cors");
const cookieParser = require('cookie-parser');
const cookie = require('cookie');
const { channel } = require("diagnostics_channel");
require("./gameLogic");
var myMap = new Map();
var Rooms= new Map();
let UserStates=new Map();
var RoomsScores= new Map();
const GameStates = new Map();
let RealGameState=new Map();
const peerMap = new Map();

// const jwt =require ("jsonwebtoken");
// const cookieParser =require ("cookie-parser");
const playerTimers = new Map(); 
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


subScriber.subscribe("receive-message-room");
subScriber.subscribe("final-play");

// class Room{
//   arr;
//   admin;
//   currentWord;
//   scores;

//   addPlayer(player) {
//     this.arr.push(player);
//     this.scores.set(player,0);
//   }
//   setCurrentWord(word){
//     this.currentWord=word;
//   }
//   removePlayer(name) {
//     this.arr.filter((data)=>{
//         return name!=data;
//     })
//     this.scores.delete(name);
//   }
//   isPlayerPresent(name) {
//      for(let i=0;i<this.arr.length;i++){
//       if(name==this.arr[i])return true;
//      }
//      return false;
//   }
//   sendMessage(message) {

//   }
//   constructor(name,admin){
//       this.name=name;
//       this.arr=[admin];
//       this.admin=admin;
//       this.scores=new Map();
//       this.scores.set(admin,0);
//   }
// }

subScriber.on("message", (channel, Receivedmessage) => {
  if (channel === "receive-message-room") {
    let actualMessage = JSON.parse(Receivedmessage);
    let { from, room, message, color } = actualMessage;
    // console.log(actualMessage);
    io.to(room).emit("receive-message-room", { from, room, message, color });
  }
  else if(channel=="final-play"){
    
    async function Game(){
        try{
            let obj=JSON.parse(Receivedmessage);
            let room = obj.room;
            console.log(room);
            let arr = await Redis.get(room);
            arr=JSON.parse(arr);
            if (arr.length < 2) {
                console.log("Not enough players to start the game");
                return;
            }
            // Ensure only one game starts per room
            let state = await partialGameStates.get(room);
            state=JSON.parse(state);
            if(!state){
                let gameObject={
                    rounds:0,
                    whowasplaying:arr[0],
                    timeremaining:0,
                    state:true
                }
              partialGameStates.set(room,JSON.stringify(gameObject));
            }
            if (state && state.state) {
                console.log(`Game already in progress for room ${room}`);
                return;
            }
            
            // console.log("starting the game ",arr);

            let words = ["hi", "hello", "isit", "nice", "one", "three", "home"];
            let round = 0, rounds = 3;
            let secondsPerPlayer = 10;
            let turnTime = secondsPerPlayer * 1000;
            let roundTime = secondsPerPlayer * arr.length * 1000;
            
            async function startRound(round) {
                if (round > rounds) {
                    state.state = false;
                    await partialGameStates.set(room, JSON.stringify(state));
                    console.log("Game ended.");
                    return;
                }
                
                console.log("Round " + round + " is started!");
            
                async function player(playingPlayer) {
                    if (playingPlayer >= arr.length) return;
            
                    console.log("Player " + playingPlayer + " is playing and round is " + round);
                    
                    // Wait for the turn to complete before moving to the next player
                    await new Promise(resolve => setTimeout(resolve, turnTime));
            
                    await player(playingPlayer + 1);
                }
            
                await player(0); // Ensure all players play sequentially
            
                console.log("Round " + round + " is ended!");
                
                setTimeout(() => {
                    startRound(round + 1);
                }, 1000); // Small delay before the next round
            }
            
            // Start the game
            await startRound(round);
            
      
          
          await startRound(round);
        }
        catch(err){
            console.log("error while playing the game",err);
        }
    }
    Game();
  }
});

io.on("connection", async (socket) => {
  const cookies = cookie.parse(socket.handshake.headers.cookie || '');
  const player=cookies.userid;
  const roomname=cookies.roomid;
  // console.log(player,roomname);

  try {
    let res = await Redis.get(roomname);
    if (res) {
      let arr = JSON.parse(res);
      arr.push(player);
      await Redis.set(roomname, JSON.stringify(arr));
      console.log(arr);
    } else {
      await Redis.set(roomname, JSON.stringify([player]));
      
    }
    socket.join(roomname);
  } catch (err) {
    console.error("Error while interacting with Redis:", err);
  }
  socket.on("toroom", async({ from,room, message ,color}) => {
    
    await Publisher.publish("receive-message-room",JSON.stringify({
      room:room,
      from:from,
      message:message,
      color:color
    }))

    // console.log("hi");
    // io.to(room).emit("receive-message-room", {from,room,message,color})  
  });

  socket.on("disconnect", async () => {
    
    const room=cookies.roomid;
    let user=cookies.userid;
    console.log("user is ",user);
    try{
    let arr=await Redis.get(room);
      arr=JSON.parse(arr);

      if(arr){
          
          arr=arr.filter((data)=>{
            return data!=user;
          })
          
      }
      if(arr.length>0)
        await Redis.set(room,JSON.stringify(arr));
      else
        await Redis.del(room);
    }
    catch(err){
      console.log("error while deleting",err);
    }

  });

  socket.on("play-finnally", async (obj) => {
    
    Publisher.publish("final-play",JSON.stringify(obj));
  });

  
});

subScriber.on("error", (err) => {
  console.error("Redis Subscriber Error:", err);
});
subScriber.on("connect", () => {
  console.log("Redis Subscriber connected!");
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})