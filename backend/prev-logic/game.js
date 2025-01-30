// function pushToMap(map, key, element) {
//   // console.log(key);
//   if (map.has(key)) {
//     // console.log("hello");
//       // // If the key exists, push the element to the array
//       let b=true;
//       let arr=map.get(key);
//       if(arr){
//         for(let i=0;i<arr.length;i++){
//           if(arr[i]==element){
//             b=false;
//             break;
//           }
//         }
//       }
//       // console.log(arr);
//       if(arr && b){
//         arr.push(element);
//       }
//   } else {
//       // If the key doesn't exist, create a new array with the element
//       map.set(key, [element]);
//   }
//   // console.log(map);
  
// }
// function pushToMap2(map, key, element) {
//   // console.log(key);
//   if (map.has(key)) {
//     // console.log("hello");
//       // // If the key exists, push the element to the array
//       let b=true;
//       let arr=map.get(key);
//       if(arr){
//         for(let i=0;i<arr.length;i++){
//           if(arr[i].user==element.user){
//             b=false;
//             break;
//           }
//         }
//       }
//       // console.log(arr);
//       if(arr && b){
//         arr.push(element);
//       }
//   } else {
//       // If the key doesn't exist, create a new array with the element
//       map.set(key, [element]);
//   }
//   // console.log(map);
  
// }
// function pushScore(map,room,user,score){
//   let arr=map.get(room);
//   for(let i=0;i<arr.length;i++){
//     let temp=arr[i];
//     if(user==temp.user){
//       temp.score=temp.score +score;
//     }
//   }
// }
// var timer;

// io.on("connection", (socket) => {

//   const cookies = cookie.parse(socket.handshake.headers.cookie || '');
//   const user=cookies.userid;
//   // if(user){
//     myMap.set(user,socket.id);
//     // console.log("user connected ->",user,myMap.get(user));
//     // io.emit("userids",Object.fromEntries(myMap));
//   // }
//   socket.on("message", (message) => {
//     // console.log({ room, message });
//     io.emit("receive-message", message);
//   });

//   socket.on("toroom", ({ from,room, message ,color}) => {
//     // console.log(socket.id);
//     // console.log({ room, from,message });
//     // console.log(message);
//     io.to(room).emit("receive-message-room", {from,room,message,color})  
//   });
  
//     socket.on("correct-guess",({room,user})=>{
//       io.to(room).emit("correct-guess-room",user);
//     })


//   socket.on("peer-close",(room,id)=>{
//     io.to(room).emit("peer-close",id);
//   })
//   socket.on("join-room", (info) => {
//     console.log("=============================joined=======================================");
//     const room=info.room;
//     const user=info.user;
//     socket.join(room);
//     pushToMap(Rooms, room, user);
//     pushToMap2(RoomsScores,room,{"user":user,score:0});
//     // if (GameStates.get(room)) {
//     //     io.to(room).emit("reload");
//     //     console.log("game play hai bhai");
//     // }
//     UserStates.set(user, { room, score: 0 });
//     console.log(Rooms);
//     // console.log("scores->");
//     // console.log(RoomsScores);
//     // // console.log("ROOMS ->");
//     // console.log(Rooms.get(room));
//     let arr=RoomsScores.get(room);
    
//     io.to(room).emit("allusers",arr);
//     // console.log(User joined room ${room});
//   });
  
//   socket.on("joinedroom",(room,id,user)=>{
//     // console.log("ooiejijfijdioweijo",user);
//     // console.log("////////////////////")
//     // console.log(user,id);
//     // console.log("////////////////////")

//     peerMap.set(user,id);
//     socket.to(room).emit("userjoined",id,user);
//     if(partialGameStates.get(room)){
//       io.to(room).emit("partial-start",room);
//     }
//     // peer
//   })
//   socket.on('drawing', (data) => {
    
//     const room = data.room; // Assuming the room information is included in the data
//     io.to(room).emit("drawing-room", data);
//     // io.to(room).emit("receive-message-room", {"from":"from","room":room,"message":"hi"});
//   });
//   socket.on('drawing2', (data) => {
    
//     const room = data.room; // Assuming the room information is included in the data
//     io.to(room).emit("drawing-room2", data);
//     // io.to(room).emit("receive-message-room", {"from":"from","room":room,"message":"hi"});
//   });
  

//   socket.on("disconnect", () => {
//     console.log("=================================================================================");
//     const room=cookies.roomid;
//     console.log("User Disconnected", user);

//     myMap.delete(user);
//     var arr=Rooms.get(room);
//     let arr2=RoomsScores.get(room);
//     // console.log(arr);
//   //   // console.log(arr);
//     // io.to(room).emit("user-disconnect",user);
//     if(arr){
//       let x= peerMap.get(user);
//       // console.log(`//////////////////////////${x}///////////////////////`);
//       if(GameStates.get(room)){
//         GameStates.delete(room);
//         let x=playerTimers.get(room);
//         let obj1=RealGameState.get(room);
//         console.log(obj1);
//         clearInterval(x);
//       }
//       io.to(room).emit("user-disconnect", peerMap.get(user));
//     for (let i = 0; i < arr.length; i++) {
//       if (arr[i] === user) {
//           arr.splice(i, 1);
//           break;
//       }
//     }
//     for (let i = 0; i < arr2.length; i++) {
//       if (arr2[i].user === user) {
//           arr2.splice(i, 1);
//           break;
//       }
//     }
//   }
//     if (arr && arr.length === 0) {
//       Rooms.delete(room);
//     } else {
//         Rooms.set(room, arr);
//         console.log(Rooms);
//     }
//     if (arr2 && arr2.length === 0) {
//       RoomsScores.delete(room);
//     } else {
//         RoomsScores.set(room, arr2);
//         // console.log(Rooms);
//     }
//     // console.log(Rooms.get(room));
//     // io.to(room).emit("peer-close",);
//     io.emit("userids",Object.fromEntries(myMap));
//     // console.log(user);
//   });

//   socket.on("check-players",(room)=>{
//     // let arr=Rooms.get(room);
//     // console.log(arr.length);
//     // console.log("ji");
//     let arr=Rooms.get(room);
//     let len=arr.length;
//     io.emit("players-checked",{"roomid":room,"players":len});
//   })

//   socket.on("start-game",(obj)=>{
//     console.log("game-started");
//     io.to(obj.room).emit("game-started",obj);
//   })


//   socket.on("play-finnally", (obj) => {
//     console.log("play-finnally");
    
//     let room = obj.room;
//     let arr = Rooms.get(room);
//     if (arr.length < 2) {
//         console.log("Not enough players to start the game");
//         return;
//     }
//     // Ensure only one game starts per room
//     if(!partialGameStates.get(room)){
//       partialGameStates.set(room,true);
//     }
//     if (GameStates.get(room)) {
//         console.log(`Game already in progress for room ${room}`);
//         return;
//     }
//     if(!RealGameState.get(room) && arr){
//       // console.log("starting the game ",arr);
//       let obj={
//         rounds:0,
//         whowasplaying:arr[0],
//         timeremaining:0
//       }
//       RealGameState.set(room,obj);
//     }
    
//     // Check if the number of players is enough to start the game
//     let obj1=RealGameState.get(room);
//     let words = ["hi", "hello", "isit", "nice", "one", "three", "home"];
//     GameStates.set(room, true);
//     let size = arr.length;
//     let timegivenplayer = 40;
//     let rounds = obj.rounds; // Number of rounds
//     let round = obj1.rounds; // Start with round 1
 
    
//     function startRound(round) {
//         if (round > rounds) {
//             partialGameStates.set(room,false);
//             console.log("Game ended.");
//             GameStates.set(room, false);
//             obj1.rounds=0;
//             return;
//         }
//         let score=size+10;
//         console.log(`Round ${round} started`);
//         obj1.rounds=round;
//         io.to(room).emit("round-number", round);

//         let p = 1;
//         let p1=1;
//         for(let i=0;i<arr.length;i++){
          
//           if(obj1.whowasplaying==arr[i]){
//               p1=i;
//               break;
//           }
//         }
        
//         function player(size, p) {
//             if (p > size) {
//                 startRound(round + 1); // Proceed to the next round
//                 return;
//             }

//             let mySet = new Set();
//             let x = timegivenplayer;
//             let word = words[Math.floor(Math.random() * words.length)];
//             console.log(`${arr[p1]} is playing with word: ${word} ${p1} `);
//             obj1.whowasplaying=arr[p1];
//             io.to(room).emit("word", word);
//             io.to(room).emit("is-playing", arr[(p1)%size]);

//             timer = setInterval(() => {
//                 if (x <= 0) {
//                    obj1.timeremaining=0;
//                     io.to(room).emit("timer-player", 0);
//                     clearInterval(timer);
//                     p1=(p1+1)%size;
//                     player(size, p + 1); // Move to the next player
//                 } else {
//                     obj1.timeremaining=x;
//                     io.to(room).emit("timer-player", x);
//                     x--;
//                 }
//             }, 1000);
//             playerTimers.set(room, timer);
//             const checkTimeListener = (user) => {
//                 console.log("correct guess by ", user);
//                 pushScore(RoomsScores,room,user,score);
//                 io.to(room).emit("allusers",RoomsScores.get(room));
//                 mySet.add(user);
//                 score--;
//                 if (mySet.size === size - 1) { // All other players guessed correctly
//                     console.log("All players guessed correctly, moving to next player");
//                     p1=(p1+1)%size;
//                     clearInterval(timer);
//                     socket.off("check-time", checkTimeListener); // Remove the listener
                    
//                     player(size, p + 1);
//                 }
//             };

//             socket.on("check-time", checkTimeListener);

//         }

//         player(size, p);
//     }

    
//     startRound(round);
// });


  
// });
