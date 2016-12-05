var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
  host: [
    {
      host: "6ababf46412e5cd9ff51a87e3b704981.us-west-1.aws.found.io",
      auth: 'elastic:QHtaXf3aNCwJtuz66nKZfnRq',
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