var client = require('./es');

var getLocation = function(callback, err_callback) {
    client.search({
        index: 'ngos',
        type: 'ngo',
        size:1000,
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
        var ngoArr = resp.hits.hits.map(function(obj){ 
          var ngo = {}
          ngo["lat"] = obj["_source"]["location"]["lat"];
          ngo["lng"] = obj["_source"]["location"]["lon"];
          ngo["name"] = obj["_source"]["name"];
          ngo["_id"] = obj["_id"];
          return ngo;
        });
        callback(ngoArr);
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

module.exports = {
    getLocation: getLocation,
    getNGODetails:getNGODetails
};