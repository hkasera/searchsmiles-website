var client = require('./es');

var getLocation = function(callback, err_callback) {
    client.search({
        index: 'ngos',
        type: 'ngo',
        size:100,
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
          return ngo;
        });
        callback(ngoArr);
    }, function(err) {
        err_callback(err);
    });
}

module.exports = {
    getLocation: getLocation
};