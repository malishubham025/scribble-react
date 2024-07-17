// const canvas=document.querySelector(".can");
// canvas.width=window.innerWidth;
// canvas.height=window.innerHeight;
// const context=canvas.getContext("2d");
// var isdrawing=false;
// function down(event){
//     let offsetX=event.offsetX; 
//     let offsetY=event.offsetY;
//     isdrawing=true;
//     // console.log(offsetX,offsetY);
//     context.moveTo(offsetX,offsetY);
// }
// function up(event){
//     isdrawing=false;
// }
// function draw(event){
//     if(!isdrawing){
//         return;
//     }
//     let offsetX=event.offsetX; 
//     let offsetY=event.offsetY;
//     context.lineTo(offsetX,offsetY);
//     context.stroke();
//     context.strokeStyle="brown";
// }
// // console.log(context);
// context.beginPath();
// context.moveTo(10,20);
// context.lineTo(300,400);
// context.closePath();
// context.stroke();

// // const express=require("express");
// // const app=express();
// // const {Server}=require("socket.io");
// // const http=require("http");
// // const server=http.createServer(app);
// // const bodyParser=require("body-parser");
// // const cors=require("cors");
// // app.use(bodyParser.json());
// // const { v4: uuidv4 } = require('uuid');
// // const io=new Server(server,{
// //     cors: {
// //         origin: "http://localhost:3000",
// //         methods: ["GET", "POST"],
// //         credentials: true
// //     }
// // });
// // io.on("connection",(socket)=>{
// //     console.log("connected ",socket.id);
// //     socket.on("sendmessage",(message)=>{
// //         console.log("hi");
// //         io.emit("toall",message);
// //     })
// //     // socket.on("createroom",(id)=>{
// //     //     // socket.join()
// //     //     const uuid=uuidv4();
// //     //     console.log("room id is ",uuid);
// //     //     socket.join(uuid);
// //     //     // console.log(uuid,"is of socket id ",id);
// //     //     socket.emit("roomid",uuid);
// //     //     // console.log("message");
// //     //     // console.log(id);
// //     // });
// //     // socket.on("joinroom",(id)=>{
// //     //     console.log("joined to",id);
// //     //     socket.join(id);
// //     // })
// //     // // socket.on("messagetoroom",(message)=>{
// //     // //     console.log(message);
// //     // // })
// //     // socket.on("sendMessage",(message)=>{
// //     //     // io.emit("messagetoroom",message.message);
// //     //     console.log(message);
// //     //     const x=message.id;
// //     //     const v=message.message;
// //     //     // io.to(x).emit('messagetoroom',v);
// //     //     // socket.to(x).emit("messagetoroom", v);
// //     //     // socket.to(message.id).emit("messagetoroom",message.message);
// //     //     // console.log(message);
// //     // })
// // })
// // app.use(cors({
// //     origin:"*",
// //     credentials:true
// // }))
// // app.get("/",(req,res)=>{
// //     res.send("hello");
// // })
// // server.listen(4000,()=>{
// //     console.log("listning ...");
// // })


let arr=[1,2,3];
let timegivenplayer=5;
let timebtwn=5;
let size=arr.length;
let rounds = 3; // Number of rounds
let seconds = timegivenplayer*size; // Duration of each round in seconds
let round = 1; // Start with round 1

function startRound(round){
    if (round > rounds) {
        console.log("Game ended.");
        return;
    }
    console.log(`Round ${round} started`);
    // io.to(room).emit("round-number",round);
    // io.to(room).emit("round-start", { round });
    let p=1;
    function player(size,p){
        if(p>size){
            // io.to(room).emit("timer-player",timebtwn);
            return ;
        }
        // io.to(room).emit("timer-player",--timebtwn);
        console.log(p," is playing ");
        // io.to(room).emit("is-playing",arr[p-1]);
            setTimeout(() => {
                player(size,p+1);
            }, timegivenplayer*1000);
        }
    player(size,p);
    setTimeout(() => 
    {
        // 10-second delay between rounds (can be adjusted)
        console.log(`Round ${round} ended`);
        // io.to(room).emit("round-end", { round });
        
        // Start the next round after a delay
        setTimeout(() => {
            startRound(round + 1);
        }, timebtwn* 1000);
    }, seconds* 1000);
}
startRound(round);
  //   // console.log(myMap);
  