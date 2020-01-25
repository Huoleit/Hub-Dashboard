require('dotenv').config();
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');

const faker = require('faker');
const Redis = require('ioredis');
const redis = new Redis('redis://127.0.0.1:6379');
const router = express.Router();

const port = process.env.SERVER_PORT || 8000;
class Device{
    static get OFF() { return 'disconnected'};
    static get ON() { return 'connected'};
    timer_fn = (timeout) => {
        return setTimeout(() => {
            this.set_status(Device.OFF);
        }, timeout);
    }; 
    
    status = Device.OFF;
    last_status = Device.OFF;
    data;

    constructor(type, timeout){
        this.type = type;
        this.timeout = timeout;
        this.heartbeatTimer = this.timer_fn(this.timeout);

    }
    set_status(new_s){
        this.last_status = this.status;
        this.status = new_s;
        if(new_s === Device.ON)
        {
            clearTimeout(this.heartbeatTimer);
            this.heartbeatTimer = this.timer_fn(this.timeout);
        }
        if(this.status !== this.last_status)
        {   
            // io.emit('update_status',this.type, this.status);
            console.log(this.status);
        }
       
    }
    set_info(data_in){
        this.data = data_in;
        // io.emit('update_info',data_out);
    }
    update(){
        io.emit('update_status',this.type, this.status);
        io.emit('update_info',this.type, this.data);
    }
}
let hub = new Device('hub',500);

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/img', express.static(__dirname + '/public/img'));
app.use('/vendor', express.static(__dirname + '/public/vendor'));

router.route('/hubinfo')
.post(async (req,res) => { 
   
    hub.set_status(Device.ON);
    hub.set_info(req.body);
    console.log(req.body);
    res.json({data:req.body.status});
});
router.route('/record')
.post(async (req,res) => { 
    
    
    await redis.rpush('records', JSON.stringify(req.body));
    io.emit('update_record', Array(req.body));
    console.log(Array(req.body));
    res.json({status:'OK', method:'POST'});

}).get(async (req,res) => { 
    
    const redis_records = await redis.lrange('records',0,-1);
    const records = redis_records.map(JSON.parse);
    io.emit('update_record', records);
    res.json({status:'OK', method:'GET'});
});

const broadcastTimer = setInterval(() => {
    hub.update();
},100);

app.use('/api', router); 
app.get('*',(req, res) => res.sendFile(__dirname + '/public/index.html'));
server.listen(port); console.log("port: " + port);   



// socket.io parts
    // helper functions
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  }

io.on('connection',(socket) => {
    let user = {
        name:faker.name.firstName(),
        age:getRndInteger(50,80),
        city:faker.address.city(),
        job:faker.name.jobType(),
        avatar:faker.image.avatar()
    };
    socket.emit('update_userinfo',user);
    
});
