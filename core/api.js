var client = require('./es');
var moment = require('moment');

var getLocation = function(callback, err_callback) {
    client.search({
        index: 'ngos',
        type: 'ngo',
        size:5000,
        body: {
            "_source": ["name","location"],
            "query": {
                "bool": {
                    "must": [{
                        "exists": {
                            "field": "location"
                        }
                    }]
                }
            }
        }
    }).then(function(resp) {
        callback(resp.hits.hits);
    }, function(err) {
        err_callback(err);
    });
}

var getNGOs = function(callback, err_callback) {
    client.search({
        index: 'ngos',
        type: 'ngo',
        size:1000,
        body: {
            "query": {
                "bool": {
                    "must": [{
                        "exists": {
                            "field": "location"
                        }
                    }]
                }
            }
        }
    }).then(function(resp) {
        callback(resp.hits.hits);
    }, function(err) {
        err_callback(err);
    });
}
var filterNGOs = function(params,callback, err_callback) {
    client.search({
        index: 'ngos',
        type: 'ngo',
        size:1000,
        body: {
            "query": {
                "bool": {
                    "must": [{
                        "exists": {
                            "field": "location"
                        }
                    }]
                },
                "match_phrase": {
                  "name": params.startsWith
                }
            }
        }
    }).then(function(resp) {
        callback(resp.hits.hits);
    }, function(err) {
        err_callback(err);
    });
}

var getNGODetails = function(id,callback, err_callback) {
    client.get({
        index: 'ngos',
        type: 'ngo',
        "id": id
    }).then(function(resp) {
        callback(resp["_source"]);
    }, function(err) {
        err_callback(err);
    });
}

var getEventDetails = function(params,callback, err_callback) {
    client.get({
        index: 'ngos',
        type: 'event',
        "id": params.id,
        routing:params.routing_id
    }).then(function(resp) {
        callback(resp["_source"]);
    }, function(err) {
        err_callback(err);
    });
}

var getUpcomingEvents = function(callback, err_callback){
    var date = moment().format('DD/MM/YYYY');
    client.search({
        index: 'ngos',
        type: 'event',
        size:100,
        body:{
          "query": {
            "range": {
              "start_time": {
                "gte": date,
                "format": "dd/MM/yyyy"
              }
            }
          },
          "sort": [
            {
              "start_time": {
                "order": "asc"
              }
            }
          ]
        }
    }).then(function(resp) {
        //console.log(resp)
        callback(resp.hits.hits);
    }, function(err) {
        err_callback(err);
    });
}
//Exports added
module.exports = {
    getLocation: getLocation,
    getNGODetails:getNGODetails,
    getNGOs:getNGOs,
    filterNGOs:filterNGOs,
    getUpcomingEvents:getUpcomingEvents,
    getEventDetails:getEventDetails
};