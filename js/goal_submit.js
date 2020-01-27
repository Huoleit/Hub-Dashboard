const addButtonListener = () => 
{
    $('#add-activity').on('click',(event)=>{
        event.preventDefault();
        let baseElement = $('#base-input-row').clone(false).removeAttr('id');
        $('#base-input-row').parent().append(baseElement);
    });
    $('#del-activity').on('click',(event)=>{
        event.preventDefault();
        $('#base-input-row').siblings().last().remove();
        
        // console.log('button');
    });
    $('#submit-button').on('click',(e)=>{
        // console.log('a');
        e.preventDefault();
        let goals_array = [];
        let allInput = $('#input-wrapper').children();
        for(let j of allInput)
        {   
            let one_section = $(j).children();
            let one_goal = {total_time:0};
            for(let i of one_section)
            {
                
                let val = $(i).children('select,input').val() ?? 0;
                switch ($(i).children('label').text()) {
                    case 'Activity':
                        one_goal.id = val
                        break;
                    case 'Hour':
                        one_goal.total_time += val * 3600;
                        break;
                    case 'Minute':
                        one_goal.total_time += val * 60;
                        break;
                    case 'Second':
                        one_goal.total_time += val * 1;
                        break;
                    default:
                        break;
                }
            }
            goals_array.push(one_goal);

        }
        let data = {data:goals_array};
        // $.post('/api/setgoal', JSON.stringify(data),null,'json');
        $.ajax({
            url:'api/goal',
            dataType:'json',
            type:'post',
            contentType: "application/json",
            data:JSON.stringify(data),
            success:(data)=>{
                const alertTemplate = Handlebars.compile($('#alert-template').html());
                let html = alertTemplate({type:'success',msg:'Succeed!'});
                $('#alert-wrapper').html(html);
                console.log(data)
            },
            error:(data)=>{
                const alertTemplate = Handlebars.compile($('#alert-template').html());
                let html = alertTemplate({type:'danger',msg:'Fail!'});
                $('#alert-wrapper').html(html);
                console.log(data)
            },

        });

        // console.log('goals_array');
        return false;
        
    });

};