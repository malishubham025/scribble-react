const express =require ("express");
const { Server }=require  ("socket.io");
const { createServer } =require ("http");
const {Redis,partialGameStates,Publisher,subScriber,Names}=require("./connections");
const cors =require ("cors");
const cookieParser = require('cookie-parser');
const cookie = require('cookie');
require('dotenv').config();
require("./gameLogic");



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
subScriber.subscribe("roundInfo");
subScriber.subscribe("word");
subScriber.subscribe("playername");
subScriber.subscribe("correct-guess");
subScriber.subscribe("timer-player");
subScriber.subscribe("join-room");
subScriber.subscribe("peerRoom");
const set=new Set();
const roomMap=new Map();
const Game=require("./gameLogic");

subScriber.on("message", async (channel, Receivedmessage) => {
  if (channel === "receive-message-room") {
    let actualMessage = JSON.parse(Receivedmessage);
    let { from, room, message, color } = actualMessage;
    // console.log(actualMessage);
    io.to(room).emit("receive-message-room", { from, room, message, color });
  }
  else if(channel==="peerRoom"){
    let obj = JSON.parse(Receivedmessage);
    let room=obj.room;
    let id=obj.id;
    let user=obj.user;
    console.log("emitted",obj);
    // socket.to(room).emit("userjoined",id,user);
    io.to(room).emit("userjoined",id,user);
  }
  else if (channel === "join-room") {
    let obj = JSON.parse(Receivedmessage);
    let roomname = obj.room;
    let player = obj.user;
    let name = obj.name;
    try {
        let res = await Redis.get(roomname);
        let arr = res ? JSON.parse(res) : [];
        arr.push(player);
        await Redis.set(roomname, JSON.stringify(arr));

        let names = await Redis.get("names:" + roomname); // <-- Fix: Await Redis.get()
        if (!names) {
            names = { [player]: {
              name:name,
              score:0} };  // Fix: Use player as key
            await Redis.set("names:" + roomname, JSON.stringify(names));
            
        } else {
            names = JSON.parse(names);
            names[player] = {
              name:name,
              score:0};  // Fix: Store multiple users properly
            await Redis.set("names:" + roomname, JSON.stringify(names));
        }
        
        io.to(roomname).emit("user-joined-with-name", names);
        console.log(arr);
    } catch (err) {
        console.error("Error while interacting with Redis:", err);
    }
}

  else if(channel=="timer-player"){
    let obj=JSON.parse(Receivedmessage);
    let room=obj.room;
    let time=obj.time;
    io.to(room).emit("timer-player",time);
  }
  else if (channel == "correct-guess") {
    let obj = JSON.parse(Receivedmessage);
    let room = obj.room;
    let user = obj.user;

    let arr = await Redis.get("count:" + room);
    let score = await Redis.get("score:" + room);

    let userArr = arr ? JSON.parse(arr) : { arr: [] };

    if (!userArr.arr.includes(user)) {
        userArr.arr.push(user);
        await Redis.set("count:" + room, JSON.stringify(userArr));

        let newScore = score ? Number(score) - 10 : 100;
        await Redis.set("score:" + room, newScore);

        console.log(`Emitting score-check for ${user}, score: ${newScore}`); // Debugging

        io.to(room).emit("score-check", { user: user, score: newScore });
    } else {
        console.log(`User ${user} already guessed, skipping event emission.`);
    }
}


  else if(channel==="roundInfo"){
    
    let obj=JSON.parse(Receivedmessage);
    io.to(obj.room).emit("round-info",obj.round);
  }
  else if(channel==="playername"){
    
    let obj=JSON.parse(Receivedmessage);
    io.to(obj.room).emit("is-playing",obj.playername);
  }
  else if(channel==="word"){
    
    let obj=JSON.parse(Receivedmessage);
    // console.log("word");
    io.to(obj.room).emit("word",obj.word);
  }
  else if(channel=="final-play"){
      await Game(Receivedmessage,io);
  }
});

io.on("connection", async (socket) => {
  const cookies = cookie.parse(socket.handshake.headers.cookie || '');
  const player=cookies.userid;
  const roomname=cookies.roomid;
  // console.log(player,roomname);

  socket.on("join-room", ({ room, user,name }) => {
    Publisher.publish("join-room", JSON.stringify({
      room: room,
      user: user,
      name:name
    }));
    socket.join(room); // ✅ Join the room here
  });
  socket.on("joinedroom",(room,id,user)=>{ 
    
    Publisher.publish("peerRoom",
      JSON.stringify({
        user,
        room,
        id
      })
    )
  })
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
  socket.on("correct-guess", async ({ room, user }) => {
    Publisher.publish("correct-guess",JSON.stringify({
      room:room,
      user:user
    }))
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

server.listen(process.env.port, () => {
  console.log(`Server is running on port ${port}`);
})