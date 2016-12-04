var client = require('./es');

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
//Exports added
module.exports = {
    getLocation: getLocation,
    getNGODetails:getNGODetails,
    getNGOs:getNGOs
};