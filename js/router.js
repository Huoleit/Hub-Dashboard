var barChart = null;
window.addEventListener('load', () => {
    const el = $('#content');
    const dashboardTemplate = Handlebars.compile($('#dashboard-template').html());
    const errorTemplate = Handlebars.compile($('#error-template').html());
    const hubTemplate = Handlebars.compile($('#hub-template').html());
    const goalTemplate = Handlebars.compile($('#goal-template').html());

    const router = new Router({
    mode: 'history',
    page404: function (path) {
        const html = errorTemplate();
        el.html(html);
        console.log('Cannot find ' + path);
        }
    });

    router.add('/', () => {
        let html = dashboardTemplate();
        el.html(html);
        const ctx = $('#myBarChart');
        if(barChart) 
        {
            barChart.destroy();
            barChart = null;
            console.log('Des Chart')
        }
        barChart = createBarChart(ctx);
        $.get(window.location.protocol +"//"+ window.location.host+'/api/goal',(data,status)=>{
            // console.log('Get ' + data);
        });
        addListener(router);
        console.log('Home');

    });

    router.add('/hub', function () {
        let hub = hubTemplate();
        el.html(hub);
        $.get(window.location.protocol +"//"+ window.location.host+'/api/record',(data,status)=>{
            // console.log('Get ' + data);
        });
        addListener(router);
        console.log('Hub');
    });
    router.add('/goal', function () {
        let html = goalTemplate();
        el.html(html);
        addListener(router);
        addButtonListener();
        // console.log('Goal');
    });

    router.navigateTo(window.location.pathname);

});

const addListener = (router) => {
    $('a[hasListen=false]').on('click', (event) => {
        event.preventDefault();
        const target = $(event.target).is('a') ? $(event.target) : $(event.target).parents('a');
        const href = target.attr('href');

        const path = href.substr(href.lastIndexOf('/'));
        // console.log('path: ' + path);
        router.navigateTo(path);
    }).attr('hasListen', 'true');

};
