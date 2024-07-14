const canvas=document.querySelector(".can");
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;
const context=canvas.getContext("2d");
var isdrawing=false;
function down(event){
    let offsetX=event.offsetX; 
    let offsetY=event.offsetY;
    isdrawing=true;
    // console.log(offsetX,offsetY);
    context.moveTo(offsetX,offsetY);
}
function up(event){
    isdrawing=false;
}
function draw(event){
    if(!isdrawing){
        return;
    }
    let offsetX=event.offsetX; 
    let offsetY=event.offsetY;
    context.lineTo(offsetX,offsetY);
    context.stroke();
    context.strokeStyle="brown";
}
// console.log(context);
context.beginPath();
context.moveTo(10,20);
context.lineTo(300,400);
context.closePath();
context.stroke();

