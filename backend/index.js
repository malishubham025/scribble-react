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
// const jwt =require ("jsonwebtoken");
const cookieParser =require ("cookie-parser");

const secretKeyJWT = "asdasdsadasdasdasdsa";
const port = 4000;

const app = express();
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

// app.get("/login", (req, res) => {
//   const token = jwt.sign({ _id: "asdasjdhkasdasdas" }, secretKeyJWT);

//   res
//     .cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
//     .json({
//       message: "Login Success",
//     });
// });

// io.use((socket, next) => {
//   cookieParser()(socket.request, socket.request.res, (err) => {
//     if (err) return next(err);

//     const token = socket.request.cookies.token;
//     if (!token) return next(new Error("Authentication Error"));

//     const decoded = jwt.verify(token, secretKeyJWT);
//     next();
//   });
// });

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  socket.on("message", (message) => {
    // console.log({ room, message });
    io.emit("receive-message", message);
  });

  socket.on("toroom", ({ from,room, message }) => {
    console.log({ room, from,message });
    io.to(room).emit("receive-message-room", {from,room,message})  });

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`User joined room ${room}`);
  });
  socket.on('drawing', (data) => {
    socket.broadcast.emit('drawing', data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
