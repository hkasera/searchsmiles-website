#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');
var path    =  require('path');
var ejs = require('ejs');
var api = require('./core/api');
var moment = require('moment');
/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        /*if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }*/

        //  Local cache for static content.
        //self.zcache['index.html'] = fs.readFileSync('./index.html');
       // self.zcache['maps.html'] = fs.readFileSync('./views/maps.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.render('index.ejs');
        };
        self.routes['/explore'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.render("maps.ejs",{API_KEY: process.env.GMAPP_BROWSER_KEY});
        };
        self.routes['/dashboard'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.render("stats.ejs");
        };
        self.routes['/ngos/:id'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            api.getNGOs(function(ngos){
                res.render("ngo-list.ejs",{API_KEY:  process.env.GMAPP_BROWSER_KEY,"ngos":ngos});
            },function(err){
                res.status(500).send(err);
            }) 
        };
        self.routes['/api/get/ngos'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            api.getNGOs(function(ngos){
                 res.send(ngos);
            },function(err){
                res.status(500).send(err);
            }) 
        };
        self.routes['/ngo/:id'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            api.getNGODetails(req.params.id,function(ngo){
                res.render("ngo.ejs",{API_KEY: process.env.GMAPP_BROWSER_KEY,"ngo":ngo});
            },function(err){
                res.status(500).send(err);
            })    
        };

        self.routes['/event/:routing_id/:id'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            api.getEventDetails(req.params,function(event){
                res.render("event.ejs",{API_KEY: process.env.GMAPP_BROWSER_KEY,"event":event});
            },function(err){
                res.status(500).send(err);
            })    
        };

        self.routes['/api/get/ngo/:id'] = function(req, res) {
            res.setHeader('Content-Type', 'application/json');
            api.getNGODetails(req.params.id,function(docs){
                res.send(docs);
            },function(err){
                res.status(500).send(err);
            })
        };

        self.routes['/events/upcoming'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            api.getUpcomingEvents(function(events){
                res.render("events.ejs",{"events":events});
            },function(err){
                res.status(500).send(err);
            })
        };

        self.routes['/api/get/events/upcoming'] = function(req, res) {
            res.setHeader('Content-Type', 'application/json');
            api.getUpcomingEvents(function(docs){
                res.send(docs);
            },function(err){
                res.status(500).send(err);
            })
        };
        

        self.routes['/api/get/ngos/location'] = function(req,res){
            res.setHeader('Content-Type', 'application/json');
            api.getLocation(function(docs){
                res.send(docs);
            },function(err){
                res.status(500).send(err);
            })
            
        }
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express.createServer();
        self.app.locals.substr = function(string,length) {
            return string.substring(0,length);
        }
        self.app.locals.min = function(x,y) {
            return x < y ? x : y;
        }

        self.app.locals.formatDate = function(dateStr){
            return moment(dateStr).format('MMMM Do YYYY, h a');
        }

        self.app.locals.isDateToday = function(dateStr){
            //console.log(moment().diff(moment(dateStr),'days'));
            return moment().diff(moment(dateStr),'days') == 0;
        }

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.engine('html', ejs.renderFile);
        self.app.use(express.static(path.join(__dirname, 'public')));
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

