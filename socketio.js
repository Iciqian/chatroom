var socketio = {};  
var socket_io = require('socket.io');  
var users=[];
//获取io  
  socketio.getSocketio = function(server){  
    var io = socket_io.listen(server);  
    io.sockets.on('connection', function (socket) {  
			socket.on('login',function(name){
				if (users.indexOf(name) > -1) {
					socket.emit('nameExisted');
				}else{
					socket.userIndex = users.length;
					socket.name = name;
					users.push(name);
					console.log(users);
					socket.emit('loginSuccess',name,users.length,users);
					socket.broadcast.emit('system',name,users.length,null,'login');
				}
		  });

		  socket.on('disconnect',function(){
		  	users.splice(socket.userIndex,1);
		  	socket.broadcast.emit('system',socket.name,users.length,users,'logout');
		  })


			

	});
};  
  
module.exports = socketio;  