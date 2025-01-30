const {Redis,partialGameStates,Publisher,subScriber}=require("./connections");

async function Game(Receivedmessage,io){
    
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
                state:true,
                word:""
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
        let secondsPerPlayer = 20;
        let turnTime = secondsPerPlayer * 1000;
        let roundTime = secondsPerPlayer * arr.length * 1000;
        var interval;
        async function startRound(round) {
            if (round > rounds) {
                state.state = false;
                await partialGameStates.set(room, JSON.stringify(state));
                console.log("Game ended.");
                
                return;
            }
            
            
            let obj={
                room:room,
                round:round
            }
            console.log("round is ",round);
            await Publisher.publish("roundInfo",JSON.stringify(obj));
            let timeout2;
            async function player(playerNumber){
                if(playerNumber>=arr.length){
                    
                    startRound(round+1);
                    return;
                }
                let randomIndex=Math.floor(Math.random()*6+1);
                let wordObj={
                    room:room,
                    word:words[randomIndex]
                }
                await Publisher.publish("word",JSON.stringify(wordObj));
                await Publisher.publish("playername",JSON.stringify({
                    room:room,
                    playername:arr[playerNumber]
                }))
                console.log("Player " + playerNumber + " is playing and round is " + round);
                let x=20;
                timer = setInterval(async() => {
                    let userArr = await Redis.get("count:" + room);
                    if(userArr){
                        userArr=JSON.parse(userArr);
                    }
                    // console.log("userarr is "+userArr+" and room is"+room);
                    
                    if(userArr && userArr.arr.length==arr.length-1){
                        await Redis.del("count:"+room);
                        console.log("next-player");
                        await Redis.del("score:"+room);
                        clearInterval(timer);
                        player(playerNumber+1);
                    }
                    if (x <= 0) {
                        // obj1.timeremaining=0;
                        io.to(room).emit("timer-player", 0);
                        clearInterval(timer);
                        // p1=(p1+1)%size;
                        await Redis.del("score:"+room);
                        player(playerNumber + 1); // Move to the next player
                    } else {
                        // obj1.timeremaining=x;
                        // io.to(room).emit("timer-player", x);
                        let timeObj={
                            room:room,
                            time:x
                        }
                        Publisher.publish("timer-player",JSON.stringify(timeObj));
                        x--;
                    }
                }, 1000);

                // Redis.get("count:" + room).then(async (len)=>{
                //     console.log("length is "+len);
                //     if (Number(len) === arr.length - 1) {
                //         await Redis.del("count:" + room);
                //         console.log("all guessed correctly ");                      
                //         return ;
                //     }
                //     timeout2=setTimeout(()=>{
                //         player(playerNumber+1);
                //     },turnTime);
                // })
                

            }
            player(0);

        }
        
        // Start the game
        await startRound(round);
        
    
        
        // await startRound(round);
    }
    catch(err){
        console.log("error while playing the game",err);
    }
}
module.exports=Game;