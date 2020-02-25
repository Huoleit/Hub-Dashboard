const update_info = (user) => {
    // $('img[class*=img-profile]').attr('src',user.avatar);
    // $('#name-anchor').text(user.name);
    $('#name-anchor').text("David");
    
    $('#age-anchor').text(user.age);
    // $('#city-anchor').text(user.city);
    // $('#job-anchor').text(user.job);
    $('#city-anchor').text("New York");
    $('#job-anchor').text("Designer");
};
const socket = io(window.location.hostname + ':' + SERVER_PORT);  //have to change this port

socket.on('update_userinfo',(user) => {
    update_info(user);
});

socket.on('update_status',(type, status) => {
    
    let element = '';
    switch(type)
    {
        case 'hub':
            element = $("#hub-status").siblings().first();
            break;
        case 'device':
            element = $("#device-status").siblings().first();
            break;

        default: 
            element = null; 
            break;
    }
    if(element)
        element.text(status);
});

socket.on('update_info',(type, data) => {
    switch(type)
    {
        case 'hub':
            let element = $("div:contains('Leaves'):last").siblings().first();
            if(element && data && ('leaves' in data))
                element.text(data.leaves);
            break;

        case 'device':
            element = $("div:contains('PositionX'):last").siblings().first();
            
            if (element && data && ('positionx' in data))
                element.text(data.positionx);

            element = $("div:contains('PositionY'):last").siblings().first();
            
            if (element && data && ('positiony' in data))
                element.text(data.positiony);

            element = $("#deviceLastTime").siblings().first();
            
            if (element && data && ('time' in data))
                element.text(data.time);

            break;

        default: 
            break;
    }
    
});

socket.on('update_record',(records_array) => {
    
    for(let record of records_array)
    {
        // console.log(record);
        let time = record.timeStamp;
        
        let id = record.activityID;
        let LastingTime = record.LastingTime;

        const element = ` <span class='d-block'>[info &nbsp${time}]</span>\
                        <span class='d-block'>Last activity ID:${id} &nbsp&nbsp&nbsp&nbsp&nbspLasting time:${LastingTime}</span>\
                        <span class='d-block'></span>`;
        $('#log-box').append(element);               
    }
    
});

socket.on('update_progress',(progress) => {
    // console.log(progress);
    $("#progress-text").text(progress+'%');
    $("#progress-bar").css({'width': progress+'%'});
});

socket.on('update_lastActiveTime',(time) => {
    
    $("#last-active-time").text(time.split(" ")[1]);
});

socket.on('update_chart',(obj) => {
    barChart.data.datasets.forEach((dataset) => {
        for(let label of barChart.data.labels)
        {
            dataset.data.pop();
        }
        for(let label of barChart.data.labels)
        {
            
            let data_in = obj[label] ?? 0;
            dataset.data.push(data_in);
        }
    });
    barChart.update();
    
});