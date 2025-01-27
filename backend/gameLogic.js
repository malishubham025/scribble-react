const {Redis,partialGameStates,Publisher,subScriber}=require("./connections");
try{
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
    if(!state){
      partialGameStates.set(room,true);
      state=true;
    }
    if (state) {
        console.log(`Game already in progress for room ${room}`);
        return;
    }
    if(!RealGameState.get(room) && arr){
      // console.log("starting the game ",arr);
      let obj={
        rounds:0,
        whowasplaying:arr[0],
        timeremaining:0
      }
      RealGameState.set(room,obj);
    }
    
    // Check if the number of players is enough to start the game
    let obj1=RealGameState.get(room);
    let words = ["hi", "hello", "isit", "nice", "one", "three", "home"];
    GameStates.set(room, true);
    let size = arr.length;
    let timegivenplayer = 40;
    let rounds = obj.rounds; // Number of rounds
    let round = obj1.rounds; // Start with round 1
 
    
    function startRound(round) {
        if (round > rounds) {
            partialGameStates.set(room,false);
            console.log("Game ended.");
            GameStates.set(room, false);
            obj1.rounds=0;
            return;
        }
        let score=size+10;
        console.log(`Round ${round} started`);
        obj1.rounds=round;
        io.to(room).emit("round-number", round);

        let p = 1;
        let p1=1;
        for(let i=0;i<arr.length;i++){
          
          if(obj1.whowasplaying==arr[i]){
              p1=i;
              break;
          }
        }
        
        function player(size, p) {
            if (p > size) {
                startRound(round + 1); // Proceed to the next round
                return;
            }

            let mySet = new Set();
            let x = timegivenplayer;
            let word = words[Math.floor(Math.random() * words.length)];
            console.log(`${arr[p1]} is playing with word: ${word} ${p1} `);
            obj1.whowasplaying=arr[p1];
            io.to(room).emit("word", word);
            io.to(room).emit("is-playing", arr[(p1)%size]);

            timer = setInterval(() => {
                if (x <= 0) {
                   obj1.timeremaining=0;
                    io.to(room).emit("timer-player", 0);
                    clearInterval(timer);
                    p1=(p1+1)%size;
                    player(size, p + 1); // Move to the next player
                } else {
                    obj1.timeremaining=x;
                    io.to(room).emit("timer-player", x);
                    x--;
                }
            }, 1000);
            playerTimers.set(room, timer);
            const checkTimeListener = (user) => {
                console.log("correct guess by ", user);
                pushScore(RoomsScores,room,user,score);
                io.to(room).emit("allusers",RoomsScores.get(room));
                mySet.add(user);
                score--;
                if (mySet.size === size - 1) { // All other players guessed correctly
                    console.log("All players guessed correctly, moving to next player");
                    p1=(p1+1)%size;
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
  }
  catch(err){
    console.log("error while playing the game",err);
  }