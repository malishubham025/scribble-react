const redis=require("ioredis");
let connection={
    host: "host.docker.internal",
    port: 6379,
}
const Redis=new redis(connection)
const partialGameStates = new redis(connection);
const Publisher=new redis(connection);
const subScriber=new redis(connection);
const Names=new redis(connection);
module.exports={Redis,partialGameStates,Publisher,subScriber,Names}
