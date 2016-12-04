var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: [
    {
      host: process.env.ELASTIC_HOST,
      auth: process.env.ELASTIC_USERNAME+':'+process.env.ELASTIC_PASS,
      protocol: 'http',
      port: 9200
    }
  ]
});

client.ping({
  requestTimeout: Infinity
}, function (error) {
  if (error) {
    console.log(error);
  } else {
    console.log('All is well');
  }
});


module.exports = client