const Pageres = require('pageres');

const pageres = new Pageres({delay: 5, crop:true})
	// .src('yeoman.io', ['480x320', '1024x768', 'iphone 5s'], {crop: true})
	// .src('todomvc.com', ['1280x1024', '1920x1080'])
	.src('haber7.com',["640x360"])
	// .src('data:text/html;base64,PGgxPkZPTzwvaDE+', ['1024x768'])
	.dest(__dirname+"/tmp")
	.run()
	.then(() => console.log('done'));