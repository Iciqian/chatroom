$(document).ready(function(){
	var chatroom = new ChatRoom();
	chatroom.init();
});

function ChatRoom(){
	this.socket = null;
};
ChatRoom.prototype = {
	init:function(){
		var that = this;
		this.socket = io.connect();
		this.socket.on('connect',function(){
			$('#cover').show();
			$('#name').focus();
			$('#cfmBtn').click(function(){
				var name = $('#name').val();
				if ( name != ''&&name.length != 0){
						that.socket.emit('login',name);				
				}else{
					$('#name').focus();
				}
			});
		});
		
		this.socket.on('nameExisted',function(){
			$('#name').focus();
			$('#nameexisted').show();
		});

		this.socket.on('loginSuccess',function(name,userCount,users){
			$('#cover').hide();
			$('#msg').focus();
			var welcome = 'welcome,'+name + '--当前在线人数:' + userCount;;
			$('#system').text(welcome).slideDown().delay(1000).slideUp();
			var list = '';
			$.each(users,function(i,n){
				list += '<li>'+n+'</li>';
			})
			$('#users-list').html(list);
		});

		this.socket.on('system',function(name,userCount,users,type){
			if (type == 'login') {
				var welcome = name + ' 已进入聊天室--当前在线人数:' + userCount;
				$('#system').text(welcome).slideDown().delay(1000).slideUp();
				var list = '<li>'+name+'</li>'
				$('#users-list').append(list);
			}else if(type == 'logout'){
				var goodbye = 'Goodbye,' + name + '--当前在线人数:' + userCount;
				$('#system').text(goodbye).slideDown().delay(1000).slideUp();
				var list = '';
				$.each(users,function(i,n){
					list += '<li>'+n+'</li>';
			  });
		  	$('#users-list').html(list);
			}
		});
	}
};

var flag = false;
$('#users_slide').click(function(){
		if (flag == false) {
			$('#users').animate({right:'0px'});
			flag = !flag;
		}else{
			$('#users').animate({right:'-270px'});
			flag = !flag;
		}
	console.log(flag);
});




