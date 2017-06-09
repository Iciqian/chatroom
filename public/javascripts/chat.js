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
			var msg;
			$('#cover').hide();
			$('#msg').focus();
			var welcome = 'welcome,'+name + '--当前在线人数:' + userCount;;
			$('#system').text(welcome).slideDown().delay(500).slideUp();
			var list = '';
			$.each(users,function(i,n){
				list += '<li><h4>'+n+'</h4></li>';
			})
			$('#users-list').html(list);
			var msg = $('#msg').val();

			$('#msg').keypress(function(e){
				if (e.keyCode == 13) {
					e.preventDefault();
					msg = $('#msg').val();
					that.sendmsg(msg,name);
				}
			});

			$('#sendBtn').click(function(e){
				msg = $('#msg').val();
				e.preventDefault();
				that.sendmsg(msg,name);
			})
		});

		this.socket.on('system',function(name,userCount,users,type){
			if (type == 'login') {
				var welcome = name + ' 已进入聊天室--当前在线人数:' + userCount;
				$('#system').text(welcome).slideDown().delay(500).slideUp();
				var list = '<li>'+name+'</li>'
				$('#users-list').append(list);
			}else if(type == 'logout'){
				if(name){
				var goodbye = 'Goodbye,' + name + '--当前在线人数:' + userCount;
					$('#system').text(goodbye).slideDown().delay(500).slideUp();
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
			$('#emoji-box').hide();
		});

		var flag = false;
		$('#users-slider').click(function(e){
			if (flag==false) {
				$('#users').animate({right:'0'});
				flag = !flag;
			}else{
				$('#users').animate({right:'-270px'});
				flag = false;
			}
			$('#emoji-box').hide();
		});
		$('#emoji').click(function(){
			$('#emoji-box').toggle();
			if (flag) {
				$('#users').animate({right:'-270px'});
				flag = !flag;
			}
		});
		$('#screen').click(function(){
			$('#emoji-box').hide();
			if (flag) {
				$('#users').animate({right:'-270px'});
				flag = !flag;
			}
		});

		$('#emoji-box').on('click','.emoji-item',function(e){
			var target = $(e.target);
			var emoji = $('.emoji-item');
			for (var i = 0; i < emoji.length; i++) {
				if (target[0] == emoji[i]) {
					$('#msg')[0].value += '[emoji:'+i+']';
					$('#msg').focus();
				}
			}
		})
	},
	sendmsg:function(msg,name){
		if ($.trim(msg) != ''){
			this.socket.emit('sendMsg',name,msg);
		}else{
			alert('消息不能为空哦');
			$('#msg').val('').focus();
		}	
	},
	msg:function(sendname,myname,msg){
		var time = new Date();
		time = time.toTimeString().substr(0,8);
		msg = this.showEmoji(msg);
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

	showEmoji:function(msg){
		var match,result = msg;
		var reg = /\[emoji:\d+\]/g;
		var emojiIndex;
		var emojies =  $('.emoji-item');
		var totalEmojiNum = emojies.length;
		while (match = reg.exec(msg)){
			emojiIndex = match[0].slice(7,-1);
			if (emojiIndex > totalEmojiNum) {
				result = result.replace(match[0],'[X]');
			}else{
				var emoji = emojies[emojiIndex];
				emoji = $(emoji);
				var xlink = emoji.attr('xlink:href');
				console.log(xlink);
				result = result.replace(match[0],'<span class="msg-emoji"><svg class="iconemoji" aria-hidden="true"><use  class="emoji-item" xlink:href="'+xlink+'"></use></svg><span>');
			}
		}		
		return result;
	}
}







