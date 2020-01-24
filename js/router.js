window.addEventListener('load', () => {
    const el = $('#content');
    const dashboardTemplate = Handlebars.compile($('#dashboard-template').html());
    const errorTemplate = Handlebars.compile($('#error-template').html());

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
    const barChart = createBarChart(ctx);
    console.log('Home page'); 
    
    });

router.add('/a', function () {
    console.log('a');
});

// router.addUriListener();
router.navigateTo(window.location.pathname);

$('a').on('click', (event) => {
    // Block page load
    event.preventDefault();
    const target = $(event.target);
    const href = target.attr('href');
    const path = href.substr(href.lastIndexOf('/'));
    console.log(path);
    router.navigateTo(path);
  });

});


