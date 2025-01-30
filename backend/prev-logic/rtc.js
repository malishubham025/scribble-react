// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);

// io.on('connection', (socket) => {
//   console.log('A user connected');

//   socket.on('join-room', (room) => {
//     socket.join(room);
//     console.log(`User joined room: ${room}`);
//     socket.to(room).emit('user-connected', socket.id);

//     socket.on('disconnect', () => {
//       console.log('A user disconnected');
//       socket.to(room).emit('user-disconnected', socket.id);
//     });

//     socket.on('signal', (data) => {
//       socket.to(room).emit('signal', data);
//     });
//   });
// });

// server.listen(3000, () => {
//   console.log('Server is running on port 3000');
// });

// const socket = io('http://localhost:3000');

// const room = 'audio-room'; // Change this to a dynamic room ID if needed
// socket.emit('join-room', room);

// let localStream;
// let peerConnection;
// const remoteAudio = document.getElementById('remoteAudio');

// const configuration = {
//   iceServers: [
//     {
//       urls: 'stun:stun.l.google.com:19302'
//     }
//   ]
// };

// navigator.mediaDevices.getUserMedia({ audio: true })
//   .then(stream => {
//     localStream = stream;

//     socket.on('user-connected', (userId) => {
//       createOffer(userId);
//     });

//     socket.on('signal', async (data) => {
//       if (data.offer) {
//         await handleOffer(data.offer, data.id);
//       } else if (data.answer) {
//         await handleAnswer(data.answer);
//       } else if (data.candidate) {
//         await handleCandidate(data.candidate);
//       }
//     });
//   })
//   .catch(error => console.error('Error accessing media devices.', error));

// async function createOffer(userId) {
//   peerConnection = new RTCPeerConnection(configuration);
//   peerConnection.addStream(localStream);

//   peerConnection.onicecandidate = (event) => {
//     if (event.candidate) {
//       socket.emit('signal', {
//         candidate: event.candidate,
//         id: userId
//       });
//     }
//   };

//   peerConnection.onaddstream = (event) => {
//     remoteAudio.srcObject = event.stream;
//   };

//   const offer = await peerConnection.createOffer();
//   await peerConnection.setLocalDescription(offer);

//   socket.emit('signal', {
//     offer: offer,
//     id: userId
//   });
// }

// async function handleOffer(offer, userId) {
//   peerConnection = new RTCPeerConnection(configuration);
//   peerConnection.addStream(localStream);

//   peerConnection.onicecandidate = (event) => {
//     if (event.candidate) {
//       socket.emit('signal', {
//         candidate: event.candidate,
//         id: userId
//       });
//     }
//   };

//   peerConnection.onaddstream = (event) => {
//     remoteAudio.srcObject = event.stream;
//   };

//   await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
//   const answer = await peerConnection.createAnswer();
//   await peerConnection.setLocalDescription(answer);

//   socket.emit('signal', {
//     answer: answer,
//     id: userId
//   });
// }

// async function handleAnswer(answer) {
//   await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
// }

// async function handleCandidate(candidate) {
//   await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
// }
