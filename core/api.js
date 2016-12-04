var client = require('./es');

var getLocation = function(callback, err_callback) {
    client.search({
        index: 'ngos',
        type: 'ngo',
        size:100,
        body: {
            "_source": ["location"],
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
        var locationArr = resp.hits.hits.map(function(obj){ 
          var loc = {}
          loc["lat"] = obj["_source"]["location"]["lat"];
          loc["lng"] = obj["_source"]["location"]["lon"];
          return loc;
        });
        callback(locationArr);
    }, function(err) {
        err_callback(err);
    });
}

module.exports = {
    getLocation: getLocation
};