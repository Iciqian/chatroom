$(document).ready(function(){
	var chatroom = new ChatRoom();
	chatroom.init();
});

function ChatRoom(){
	this.socket = null;
};

ChatRoom.prototype = {
	//初始化
	init:function(){
		var that = this;
		//建立socket连接
		this.socket = io.connect();

		//处理socket连接事件
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

		//处理用户名已存在事件
		this.socket.on('nameExisted',function(){
			$('#name').focus();
			$('#nameexisted').show().delay(2000).slideUp();
		});

		//处理登陆成功事件
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

		//处理系统消息事件
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

		//处理消息发送成功事件
		this.socket.on('sendSuccess',function(sendname,myname,msg){
			that.msg(sendname,myname,msg);
			$('#emoji-box').hide();
		});

		//点击在线列表按钮，在线列表展示动效，表情包收回
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

		//点击消息界面，在线列表和表情包收回
		$('#screen').click(function(){
			$('#emoji-box').hide();
			if (flag) {
				$('#users').animate({right:'-270px'});
				flag = !flag;
			}
		});

		//点击表情输入按钮，表情包呈现toggle效果，在线列表收回
		$('#emoji').click(function(){
			$('#emoji-box').toggle();
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

	//发送消息
	sendmsg:function(msg,name){
		if ($.trim(msg) != ''){
			this.socket.emit('sendMsg',name,msg);
		}else{
			alert('消息不能为空哦');
			$('#msg').val('').focus();
		}	
	},

	//显示消息，自动滚动到底部
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

	//显示可爱的emoji
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







