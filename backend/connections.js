const redis=require("ioredis");
const Redis=new redis();
const partialGameStates = new redis();
const Publisher=new redis();
const subScriber=new redis();
const Names=new redis();
module.exports={Redis,partialGameStates,Publisher,subScriber,Names}
