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
  requestTimeout: 1000
}, function (error) {
  if (error) {
    console.log(error);
  } else {
    console.log('All is well');
  }
});


module.exports = client