// const express=require("express");
// const app=express();
// const {Server}=require("socket.io");
// const http=require("http");
// const server=http.createServer(app);
// const bodyParser=require("body-parser");
// const cors=require("cors");
// app.use(bodyParser.json());
// const { v4: uuidv4 } = require('uuid');
// const io=new Server(server,{
//     cors: {
//         origin: "http://localhost:3000",
//         methods: ["GET", "POST"],
//         credentials: true
//     }
// });
// io.on("connection",(socket)=>{
//     console.log("connected ",socket.id);
//     socket.on("sendmessage",(message)=>{
//         console.log("hi");
//         io.emit("toall",message);
//     })
//     // socket.on("createroom",(id)=>{
//     //     // socket.join()
//     //     const uuid=uuidv4();
//     //     console.log("room id is ",uuid);
//     //     socket.join(uuid);
//     //     // console.log(uuid,"is of socket id ",id);
//     //     socket.emit("roomid",uuid);
//     //     // console.log("message");
//     //     // console.log(id);
//     // });
//     // socket.on("joinroom",(id)=>{
//     //     console.log("joined to",id);
//     //     socket.join(id);
//     // })
//     // // socket.on("messagetoroom",(message)=>{
//     // //     console.log(message);
//     // // })
//     // socket.on("sendMessage",(message)=>{
//     //     // io.emit("messagetoroom",message.message);
//     //     console.log(message);
//     //     const x=message.id;
//     //     const v=message.message;
//     //     // io.to(x).emit('messagetoroom',v);
//     //     // socket.to(x).emit("messagetoroom", v);
//     //     // socket.to(message.id).emit("messagetoroom",message.message);
//     //     // console.log(message);
//     // })
// })
// app.use(cors({
//     origin:"*",
//     credentials:true
// }))
// app.get("/",(req,res)=>{
//     res.send("hello");
// })
// server.listen(4000,()=>{
//     console.log("listning ...");
// })
const express =require ("express");
const { Server }=require  ("socket.io");
const { createServer } =require ("http");
const cors =require ("cors");
const cookieParser = require('cookie-parser');
const cookie = require('cookie');
var myMap = new Map();
var Rooms= new Map();
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

  socket.on("toroom", ({ from,room, message }) => {
    // console.log(socket.id);
    // console.log({ room, from,message });
    // console.log(message);
    io.to(room).emit("receive-message-room", {from,room,message})  });

  socket.on("join-room", (info) => {
    
    const room=info.room;
    const user=info.user;
    socket.join(room);
    pushToMap(Rooms, room, user);
    // console.log("ROOMS ->");
    // console.log(Rooms.get(room));
    console.log(`User joined room ${room}`);
  });
  socket.on('drawing', (data) => {
    socket.broadcast.emit('drawing', data);
  });

  socket.on("disconnect", () => {

    const room=cookies.roomid;
    console.log("User Disconnected", socket.id);
    myMap.delete(user);
    var arr=Rooms.get(room);
    console.log(arr,user);
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
    
    // io.to(obj.roomid).emit("game-started",obj);
    let rounds = obj.rounds; // Number of rounds
    let seconds = obj.seconds; // Duration of each round in seconds
    let round = 1; // Start with round 1

    function startRound(round){
      if (round > rounds) {
        console.log("Game ended.");
        // Example: Broadcast game end to players
        socket.emit("game-end");
        return;
    }
    console.log(`Round ${round} started`);
    socket.emit("round-start", { round });
    let p=1;
    function player(size,p){
      if(p>size){
          setTimer(timebtwn);
          return ;
      }
      setTimer(--timer);
      console.log(p," is playing ");
      setTimeout(() => {
          player(size,p+1);
      }, timebtwn*1000);
  }
  player(size,p);
  setTimeout(() => {
     // 10-second delay between rounds (can be adjusted)
    console.log(`Round ${round} ended`);
    socket.emit("round-end", { round });
    
    // Start the next round after a delay
    setTimeout(() => {
        startRound(round + 1);
    }, 10 * 1000);
    }, seconds* 1000);
    



    }
    startRound(round);
    // console.log(myMap);
  })
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
