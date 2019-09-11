var express = require('express');
var http = require('http');
var ent = require('ent');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var todos = [];


/* Gestion des routes */
app.get('/todo', function(req, res){
	res.render('todo.ejs');
});

/* Si la page n'est pas touvée on redirige vers la todolist */
app.use(function(req, res, next){
	res.redirect('/todo');
});

io.on('connection', function(socket){
	console.log('Nouvel utilisateur !');

	// Un nouvel utilisateur se connecte
	socket.on('newuser', function(pseudo){
		pseudo = ent.encode(pseudo);
		socket.pseudo = pseudo;

		socket.emit('showtodos', todos);			// Envoi de la todolist en cours à l'utilisateur courant.
		socket.broadcast.emit('newuser', pseudo);	// On informe les autres utilisateurs qu'un nouvel utilisateur vient d'arriver.
	});


	// Un utilisateur ajoute un nouveau todo
	socket.on('newtodo', function(newTodo){
		var todo = ent.encode(newTodo);
		todos.push(todo);

		// On envoi le nouveau todo à tous les utilisateurs y compris celui qui vient d'ajouter le todo.
		io.emit('newtodo', todos);
	});


	// Un utilisateur à cliqué sur le bouton pour supprimer le todo.
	socket.on('deltodo', function(index){
		
		// On supprimer le todo de la liste.
		todos.splice(index, 1);		

		// On envoi la nouvelle todolist à tous les utilisateurs y compris celui qui vient de supprimer le todo.
		io.emit('deltodo', todos);
	});

});
	
server.listen(8080);