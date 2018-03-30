var webshot = require('webshot');

webshot('haberturk.com', 'tmp/haber7.png', function(err) {
  if(err) console.log(err)
});