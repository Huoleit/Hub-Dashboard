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
let device = new Device('device',500);

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
    // console.log(req.body);
    res.json({data:req.body.status});
});
router.route('/deviceinfo')
.post(async (req,res) => { 
   
    device.set_status(Device.ON);
    device.set_info(req.body);
    // console.log(req.body);
    res.json({data:req.body.status});
});
router.route('/record')
.post(async (req,res) => { 
    
    
    await redis.rpush('records', JSON.stringify(req.body));
    io.emit('update_record', Array(req.body));
    update_progress();
    res.json({status:'OK', method:'POST'});

}).get(async (req,res) => { 
    
    const redis_records = await redis.lrange('records',0,-1);
    const records = redis_records.map(JSON.parse);
    io.emit('update_record', records);
    res.json({status:'OK', method:'GET'});
});

router.route('/goal')
.post(async (req,res) => { 
    
    let records = {};
    for(let record of req.body.data)
    {
        records[record.id] = record.total_time;
    }
    console.log(records);
    await redis.set('schema',JSON.stringify(records));
    schema = records;
    res.json({status:'OK', method:'POST'});

})
.get(async (req,res) => { 
    
    update_progress();
    res.json({status:'OK', method:'GET'});
});

const broadcastTimer = setInterval(() => {
    hub.update();
    device.update();
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

const update_progress = async ()=>{
    let schema = await redis.get('schema');
    schema = JSON.parse(schema);
    let redis_records = await redis.lrange('records',0,-1);
    let records = redis_records.map(JSON.parse);
    let progress = 0;
    let goal_time = 0;
    let done_time = 0;
    let activeTimeObj = {};

    let time_a = schema ? Object.values(schema) : null;
    if(time_a)
    {
        for(let s of time_a)
        {
            if(!isNaN(s))
                goal_time += s;
        }
    }
    if(records)
    {
        for(let record of records)
        {
            if(record && record.activityID in schema)
            {
                if(!isNaN(record.LastingTime))
                    done_time += record.LastingTime * 1;
            }
    
            if(record)
            {
                let key = record.timeStamp.split(" ")[0];
                if(!activeTimeObj[key]) 
                    activeTimeObj[key] = record.LastingTime * 1;
                else
                    activeTimeObj[key] += record.LastingTime * 1;
            }
    
        }

    }
    if(goal_time === 0) progress = 100;
    else{
        progress = Math.round(done_time*100/goal_time);
        if(progress > 100) progress = 100;
        else if(progress < 0) progress = 0;
    }
    console.log(JSON.stringify(schema) + goal_time +"  "+done_time+"  "+progress);
    io.emit('update_progress', progress);
    io.emit('update_chart', activeTimeObj);
    console.log(activeTimeObj);
    if(records.length)
    {
        io.emit('update_lastActiveTime', records[records.length-1].timeStamp);
    }
};