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
			$('#cfmBtn').click(function(e){
				e.preventDefault();
				var name = $('#name').val();
				name = $.trim(name);
				if ($.trim(name) != ''&&name.length <= 10){
						that.socket.emit('login',name);				
				}else{
					$('#name').val('');
					$('#name').focus();
					if ($.trim(name) == '') {
						$('#nameempty').show().delay(1000).slideUp();
					}else{
						$('#namelong').show().delay(1000).slideUp();
					}
				}
			});
		});

		this.socket.on('nameExisted',function(){
			$('#name').focus();
			$('#nameexisted').show().delay(2000).slideUp();
		});

		this.socket.on('loginSuccess',function(name,userCount,users){
			$('#cover').hide();
			$('#msg').focus();
			var welcome = 'welcome,'+name + '--当前在线人数:' + userCount;;
			$('#system').text(welcome).slideDown().delay(2000).slideUp();
			var list = '';
			$.each(users,function(i,n){
				list += '<li><h4>'+n+'</h4></li>';
			})
			$('#users-list').html(list);
			$('#sendBtn').click(function(e){
				e.preventDefault();
				var msg = $('#msg').val();
				if ($.trim(msg) != ''){
					that.socket.emit('sendMsg',name,msg);
				}else{
					alert('消息不能为空哦');
					$('#msg').val('').focus();
				}	
			})
		});

		this.socket.on('system',function(name,userCount,users,type){
			if (type == 'login') {
				var welcome = name + ' 已进入聊天室--当前在线人数:' + userCount;
				$('#system').text(welcome).slideDown().delay(1000).slideUp();
				var list = '<li>'+name+'</li>'
				$('#users-list').append(list);
			}else if(type == 'logout'){
				if(name){
				var goodbye = 'Goodbye,' + name + '--当前在线人数:' + userCount;
					$('#system').text(goodbye).slideDown().delay(1000).slideUp();
					var list = '';
					$.each(users,function(i,n){
						list += '<li>'+n+'</li>';
				  });
			  	$('#users-list').html(list);
		  	}
			}
		});

		this.socket.on('sendSuccess',function(sendname,myname,msg){
			that.msg(sendname,myname,msg);
		})
	},

	msg:function(sendname,myname,msg){
		var time = new Date();
		time = time.toTimeString().substr(0,8);
		var message = '<li><h5 class="msg-title">'+sendname+'('+time+')</h5><p class="msg-text">'+msg+'<p></li>';
		$('#msg-list').append(message);
		if (sendname == myname) {
			$('#msg').val('').focus();
		}
		var sh = $('#msg-list')[0].scrollHeight;
		var h = $('#msg-list').height();
		var st = sh-h;
		$('#msg-list').scrollTop(st);	
	},
}

var flag = false;

$('#users_slider').click(function(){
		if (flag == false) {
			$('#users').animate({right:'0px'});
			flag = !flag;
		}else{
			$('#users').animate({right:'-270px'});
			flag = !flag;
		}
	console.log(flag);
});




