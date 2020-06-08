# TREE - Dashboard

**Tree-Dashboard** is a web-based user interface for stroke patients and their physical therapists.

The **front-end** design is derived from [SB Admin 2](https://startbootstrap.com/themes/sb-admin-2), an open-source theme for [Bootstrap](https://startbootstrap.com/).

The **back-end** service is based on Node.js and with the support of the Webscocket protocol and Redis database.



## Preview

![Preview](./preview.png)

## Download and Installation

To begin with this demo,please install [Redis database](redis.io) first and clone this repo.

## Usage

After installation, run `npm install` and then run `npm start` which will open up a preview of the template in your default browser, watch for changes to core template files, and live reload the browser when changes are saved. You can view the `gulpfile.js` to see which tasks are included with the dev environment.

### Gulp Tasks

-   `gulp` the default task that builds everything
-   `gulp watch` browserSync opens the project in your default browser and live reloads when changes are made
-   `gulp css` compiles SCSS files into CSS and minifies the compiled CSS
-   `gulp js` minifies the themes JS file
-   `gulp vendor` copies dependencies from node_modules to the vendor directory

You must have npm installed globally in order to use this build environment. This theme was built using node v11.6.0 and the Gulp CLI v2.0.1. If Gulp is not running properly after running `npm install`, you may need to update node and/or the Gulp CLI locally.

## Built with
- Express.js - A web framework 
- Vanilla.js - Single-page Application Router
- Handlebars - A simple templating language
- Socket.io - A fast and reliable real-time communication engine
