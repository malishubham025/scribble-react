import React, { useRef } from "react";
import {io} from "socket.io-client";
import Cookies from "js-cookie";
import { v4 as uuidv4 } from 'uuid';
import Peer from "peerjs";
// import "./Audio.css"
import "./lobby.css"
// import ScoresBoard from "./Socres";
// import {ZegoUIKitPrebuilt} from "@zegocloud/zego-uikit-prebuilt"
function Lobby(){
    var timebtwn=3;
    const [word,setword]=React.useState("hello");
    const ref=React.useRef();
    const contextref=React.useRef();
    const [isdrawing,setisDrawing]=React.useState(false);
    const [penColor, setPenColor] = React.useState("#000000"); 
    const [penWidth, setPenWidth] = React.useState(1);
    const [admin,setAdmin]=React.useState(0);
    let [scores,setScores]=React.useState([{}]);
    const localstream=useRef(null);
    const peerinstance=useRef(null);
    function click(){
        setPenColor("#FFFFFF");
        contextref.current.strokeStyle = "#FFFFFF";
    }
    const [name,setname]=React.useState("");
    const socket=React.useMemo(()=>io("http://localhost:4000",{withCredentials:true}),[]);
    const [message,setMessage]=React.useState("");
    const [messages, setMessages] = React.useState([{}]);
    const [round,setRound]=React.useState(0);
    const [playername,setPLayer]=React.useState("");
    var [timer,setTimer]=React.useState(10);
    function handelForm(event){
        const value=event.target.value;
        setMessage(value);
    }
    const myMeeting=async (element)=>{
        const appID=process.env.appID;
        const serverSecret=process.env.serverSecret;
        let room=Cookies.get("roomid");
        let user=Cookies.get("userid");
    }
   
    function startGame() {
    
            const obj={
                rounds:3,
                seconds:10,
                room:Cookies.get("roomid")
            }
            socket.emit("play-finnally",obj);
            
            // socket.emit(`start-game${roomid}`, obj);
        }

            // }

    
   
    
    
    // // React.useEffect(() => {
    // //     socket.on("messagetoroom", (message) => {
    // //       console.log("Message received from room:", message);
    // //     });
    // //   }, []);
    React.useEffect(()=>{
        let set=new Set();
        let peerId = null; 
        let remote=document.querySelector(".videos");
        function addVideo(stream,id) {
            // Check if the stream is already in the Set
            if (!set.has(stream)) {
              set.add(stream);
          
              // Create a new video element for the new stream
              let video = document.createElement("video");
              video.srcObject = stream;
              video.autoplay = true;
              video.id = id;
              remote.appendChild(video);
              console.log(remote);
            }
          }
          
        const peer=new Peer();
        peerinstance.current=peer;
        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then((stream) => {
          localstream.current=stream;
          addVideo(stream, "local"); 
        })
        .catch(err => console.error('Failed to get local stream', err));
      
        setTimer(timebtwn);
        let a=Cookies.get("admin");
        setAdmin(a);
        const room=Cookies.get("roomid");
        const user=Cookies.get("userid");

        if (peer) {
            if(room){
                socket.emit("join-room",{room,user});
                peer.on('open',function(id){
                    peerId = id; 
                    socket.emit("joinedroom",room,id,user);
                })
                
            }
            peer.on("call", async (call) => {
              call.answer(localstream.current); // Ensure localstream is available here
              call.on("stream", (remoteStream) => {
                addVideo(remoteStream, call.peer);
              });
            });
          }
          
          socket.on("userjoined",  (id,user) => {
            
            let call =  peerinstance.current.call(id, localstream.current);
            // console.log(call);
            if(call){
                console.log("hi");
                call.on("stream", (remoteStream) => {
                console.log("called");  
                addVideo(remoteStream, id);
            });
            }

            console.log("user joined", id);
          });
          
        // io.on("game-started",(obj)=>{
            
        // })
        function removeVideo(id) {
            const video = document.getElementById(id);
            if (video) {
                video.srcObject.getTracks().forEach(track => track.stop()); // Stop the video tracks
                video.remove(); // Remove the video element
            }
        }

        socket.on("user-disconnect", id => {
            console.log("user disconnected ",id);
            removeVideo(id);
        });
        socket.on("timer-player",(timebtwn)=>{
            setTimer(timebtwn);
        })

        socket.on("players-checked",(obj)=>{
           
            // if(admin===1){
                const id=Cookies.get("roomid");
                console.log(obj);
                let roomid=obj.roomid;
                let players=obj.players;
                if(id===roomid && players>=2){
                    const obj={
                        rounds:3,
                        seconds:10,
                        room:roomid
                    }
                    console.log("jo");
                    socket.emit("start-game",obj);
                    
                    // socket.emit(`start-game${roomid}`, obj);
                }
                else if(roomid===id && players<2){
                    // console.log("hi");
                    alert("Atleast 2 playes should be there ");
                }
            // }
        })
        

        socket.on("receive-message-room",({from,room,message,color})=>{
            // sessionStorage.setItem("message",message);
            // setMessages(message.push({from:message}));
            setMessages(prevMessages => [...prevMessages, { from, message,color }]);
            console.log(from,message);

        });

        if(socket.id){
            Cookies.set("socket",socket.id);
            setname(Cookies.get(socket.id));
        }

        const canvas=ref.current;
        canvas.width = 500;
        canvas.height = 400;
        const context=canvas.getContext("2d");
        context.strokeStyle = penColor;//for color
        context.lineWidth = penWidth;
        contextref.current = context;
        socket.on('drawing-room', ({room, offsetX, offsetY, color, width }) => {
            // console.log("drawing");
            // contextref.current.moveTo(offsetX,offsetY);
            context.strokeStyle = color;
            context.lineWidth = width;
            context.lineTo(offsetX, offsetY);
            context.stroke();
            // contextref.current.closePath();


        });
        socket.on('drawing-room2', ({room, offsetX, offsetY, color, width }) => {
            // console.log("drawing");
            // contextref.current.moveTo(offsetX,offsetY);
            contextref.current.moveTo(offsetX,offsetY);
            // context.strokeStyle = color;
            // context.lineWidth = width;
            // context.lineTo(offsetX, offsetY);
            context.stroke();
            // contextref.current.closePath();


        });

        // socket.on("game-started",(obj)=>{
        //     socket.emit("play-finnally",obj);
        //   });

        socket.on("round-info",(number)=>{
            setRound(number);
            console.log(`round ${number} started`)
        })
        socket.on("is-playing",(player)=>{
            setPLayer(player);
            console.log(`player ${player} is playing `);
        })
        socket.on("round-end",({round})=>{
            let d=0;
            let user="x";
            scores.map((data)=>{
                if(data.score>d){
                    user=data.user;
                    d=data.score;
                }
            })
            alert(`${user} is winner`)
            console.log(`round ${round} is ended `);
        });
        socket.on("word",(word)=>{
            setword(word);
        });
        socket.on("correct-guess-room",(user)=>{
            
            console.log("corrected guess by ",user);
            socket.emit("check-time",user);
        })
        socket.on("reload",(room)=>{
            socket.emit("new_user",room);
        })
        socket.on("allusers",(map)=>{
            console.log(map,typeof(map));
            if(map){
                setScores(map);
                
            }
            console.log(scores);
            // console.log(map);
        })
        socket.on("partial-start",(room)=>{
            socket.emit("check-players",room);
        })

    },[]);
    let mutebtn=document.querySelector("#mutebtn");
    function handleMute(){
        if(localstream.current){
            let enable=localstream.current.getAudioTracks()[0].enabled;
            if(enable){
                document.querySelector("#local").style.backgroundColor = "white";
                localstream.current.getAudioTracks()[0].enabled=false;
                mutebtn.innerHTML="unmute";
            }
            else{
                document.querySelector("#local").style.backgroundColor = "green";
                localstream.current.getAudioTracks()[0].enabled=true;
                mutebtn.innerHTML="Mute";
            }
        }
    }
    function sendMessage(event){

        if(message){
            // console.log()
            const x=Cookies.get("roomid");
            const obj={
                "from":Cookies.get("userid"),
                "message":message,
                "room":x,
                "color":"black"
            }
            if(word==message && playername!=obj.from){
                const user=Cookies.get("userid");
                socket.emit("correct-guess",{room:x,user:user});
                obj.color="green";
            }
            else{
                obj.color="black";
            }
            socket.emit("toroom",obj);
            setMessage("");
            
        }


        event.preventDefault();
    }
    function startdraw(event){
        // if (playername !== Cookies.get("userid")) return;
        setisDrawing(true);
        const {offsetX,offsetY}=event.nativeEvent;
        contextref.current.beginPath();
        contextref.current.moveTo(offsetX,offsetY);
        const room=Cookies.get("roomid"); 
        socket.emit('drawing2', {
            room,
            offsetX,
            offsetY,
            color: penColor,
            width: penWidth
        });

        // console.log(offsetX,offsetY);
    };
    function stopdraw(event){
        if (playername !== Cookies.get("userid")) return;
        setisDrawing(false);
        // const {offsetX,offsetY}=event.nativeEvent;
        contextref.current.closePath();
        // console.log(offsetX,offsetY);
    }
    function draw(event){
        if (!isdrawing || playername !== Cookies.get("userid")) return; 
        if(!isdrawing){
            return;
        }
        const {offsetX,offsetY}=event.nativeEvent;
        contextref.current.lineTo(offsetX,offsetY);
        contextref.current.stroke();
        const room=Cookies.get("roomid"); 
        socket.emit('drawing', {
            room,
            offsetX,
            offsetY,
            color: penColor,
            width: penWidth
        });
        // console.log("jo");
       


    }
    function handleColor(event){
        const x=event.target.value;
        // console.log(event.target.value);
        setPenColor(x);
        contextref.current.strokeStyle = x;
    }
    
    function handleWidthChange(event) {
        setPenWidth(event.target.value);
        contextref.current.lineWidth = event.target.value; // Update the line width immediately
    }
    
    return (
        <div className="main-lobby">
            {admin!=0?<button onClick={startGame}>Start</button>:null}
            <div className="audios">
                <button id="mutebtn" onClick={handleMute}>Mute</button>
            </div>
            <div className="left_lobby">
                <h3>word is {word}</h3>
                <h3>Round number {round}</h3>
                <h3>player {playername} is playing </h3>
            <p>{Cookies.get("userid")} {timer}</p>
            <div>
                {scores && scores.length > 0 ? scores.map((data, index) => {
                    return (
                        <p key={index}>{data.user} {data.score}</p>
                    );
                }) : null}
            </div>

            </div>
            <div className="right_lobby">
                <form action="">
                <input type="text" value={message} onChange={handelForm} placeholder="Meaasge" />
                <input type="submit" onClick={sendMessage} placeholder="send" />
                </form>
            </div>
             <div className="messages">
                {messages?messages.map((data)=>{
                    return (
                        
                    <p style={{color:Cookies.get("userid")==data.from?data.color:"black"}}>{data.from}  {data.message}</p>
                    

                    );
                }):null}
            </div> 
            <div>
            <input type="color" onChange={handleColor}/>
            <canvas 
                onMouseDown={startdraw}
                onMouseUp={stopdraw}
                onMouseMove={draw}
                ref={ref}
            />
            <button onClick={click}>erase</button>
            <input 
                type="range" 
                min="1" 
                max="30" 
                value={penWidth} 
                onChange={handleWidthChange} 
                style={{ marginLeft: "10px" }}
            />
        </div>
            {/* {console.log(admin)} */}
            
            <div ref={myMeeting}></div>
        </div>
    )
}
export default Lobby;