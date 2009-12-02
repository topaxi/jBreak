$(document).ready(function(){
	jbreak1 = new jBreak('jBreak');
});

function jBreak(fieldID){this.init(fieldID);}
jBreak.prototype = {
	init:function(fieldID){
		//var $jBreak = $('<div id="jBreak"/>');
		$jBreak = $('#'+fieldID);
		this.$field = $jBreak;

		$jBreak.css({
			margin:'auto',
			width:'640px',
			height:'400px',
			border:'1px solid black',
			backgroundColor:'#ededed',
			position:'relative',
			cursor:'none',
			overflow:'hidden'
		});

		$('body').append($jBreak);

		// will be destroyed on game start
		var self = this;
		$jBreak.resizable({
			maxHeight: 400,
			minHeight: 400,
			minWidth:  256,
			grid:      8,
			resize:function(){
				self.players[0].move(self.$field.width() / 2);
			}
		});

		this.createPlayers();
	},
	createPlayers:function(){
		this.players[0] = new jBreakPlayer(this.$field, 'bottom');
		this.balls[0]   = new jBreakBall(this.$field);
		this.players[0].connectBall(this.balls[0]);

		//this.players[1] = new jBreakPlayer(this.$field, 'top');
		//this.balls[1]   = new jBreakBall(this.$field);
		//this.players[1].connectBall(this.balls[1]);

		var self = this;
		this.$field.click(function(e){
			for(var i = 0;i < self.players.length;i++){
				var player = self.players[i];

				player.start();
				self.$field.resizable('destroy'); // game started, destroy resizable ui
				player.move(e.pageX - this.offsetLeft);

				$(this).unbind('click');

				$(this).click(function(){
					player.startBalls();
					$(this).unbind('click');
				});
			}
		});
	},
	$field:null,
	players:[],
	balls:[]
};

function jBreakPlayer(field, position){this.init(field, position);}
jBreakPlayer.prototype = {
	init:function(field, position){
		this.$player = $('<div class="jBreakPlayer"/>');
		this.$player.css({
			position:'absolute',
			backgroundColor:'black',
			width:'64px',
			height:'8px'
		});

		switch(position){
			case 'bottom':
			default:
				this.position['y'] = field.height() - 8;
				this.$player.css({
					top:this.position.y,
					'-moz-border-radius-topleft':'3px',
					'-moz-border-radius-topright':'3px',
					'-webkit-border-top-left-radius':'3px',
					'-webkit-border-top-right-radius':'3px'
				});
				break;
			case 'top':
				this.$player.css({
					top:'0px',
					'-moz-border-radius-bottomleft':'3px',
					'-moz-border-radius-bottomright':'3px',
					'-webkit-border-bottom-left-radius':'3px',
					'-webkit-border-bottom-right-radius':'3px'
				});
				this.position['y'] = 0;
				break;
		}

		this.$field = field;
		this.$field.append(this.$player);

		this.position['x'] = this.$field.width() / 2 - this.$player.width() / 2;
		this.$player.css({left:this.position.x});
	},
	start:function(){
		var self = this;
		this.$field.mousemove(function(e){
			var fieldOffset = self.$field.offset();
			var x = e.pageX - fieldOffset.left;
			self.move(x);
		});
	},
	connectBall:function(ball){
		this.balls.push(ball);
		var x = this.position.x + this.$player.width() / 2 - ball.$ball.width() / 2;
		var y = this.position.y - this.$player.height() / 2 - ball.$ball.height() / 2;

		ball.move(x,y);
	},
	startBalls:function(){
		this.balls.each(function(i, ball){
			ball.start();
		});
		// flush balls
		this.balls = $([]);
	},
	move:function(x){
		var playerWidth = this.$player.width();
		x -= playerWidth / 2;

		if(x < 0){
			x = 0;
		} else if(x > this.$field.width() - playerWidth){
			x = this.$field.width() - playerWidth;
		}

		var self = this;
		this.balls.each(function(i, ball){
			var ballX = x + playerWidth / 2 - ball.$ball.width() / 2;
			var ballY = self.position.y - self.$player.height() / 2 - ball.$ball.height() / 2;

			ball.move(ballX, ballY);
		});

		this.$player.css({left:x});
	},
	remove:function(){
		this.$player.remove();
		delete this;
	},
	position:{},
	$player:null,
	balls:$([]),
	$field:null
};

function jBreakBall(field, position){this.init(field, position);}
jBreakBall.prototype = {
	init:function(field, position){
		this.$ball  = $('<div class="jBreakBall" style="position:absolute;background-color:black;width:8px;height:8px;-moz-border-radius:4px;-webkit-border-radius:4px" />');
		this.$field = field;
		this.$field.append(this.$ball);
		this.position = position;
	},
	start:function(){
		var self = this;
		this._fieldSize = {width:this.$field.width(),height:this.$field.height()};

		this._size.width  = this.$ball.width();
		this._size.height = this.$ball.height();

		self._speed.x = Math.cos(self._angle / 360 * Math.PI);
		self._speed.y = Math.sin(self._angle / 360 * Math.PI);

		/* interval is only smooth in webkit... :(
		this._timer = setInterval(function(){
			self.move(
				self.position.x + self._speed.x*4,
				self.position.y + self._speed.y*4
			);
		}, 25);*/
		this._timer = true;
		this._animate();
	},
	_animate:function(){
		x = this.position.x + this._speed.x*5;
		y = this.position.y + this._speed.y*5;

		if(x < 0 || x > this._fieldSize.width - this._size.width){
			this._speed.x *= -1;
		}

		if(y < 0){
			this._speed.y *= -1;
		}

		// 16 == player height and ball height
		// @todo goal is to have 4 players on each side
		if(y >= this._fieldSize.height - 16 || y <= 8){
			var self = this;
			this.$field.find('.jBreakPlayer').each(function(i, el){
				$el = $(el);

				var player = {
					// @todo find another way to get the player position (maybe through the player object?)
					position:{
						x:parseInt(el.style.left),
						y:parseInt(el.style.top)
					},
					width: $el.width(),
					height:$el.height()
				};

				var playerHit = y == player.position.y - player.height;
				playerHit = playerHit && x >= player.position.x;
				playerHit = playerHit && x <= player.position.x + player.width;

				if(playerHit){
					self._speed.y *= -1;
				} else if(y >= self._fieldSize.height){
					alert('Fail...');
					self.remove();
				}
			});
		}

		this.move(x,y);

		if(this._timer){
			// arguments.callee kills the "this" reference :(
			var self = this;
			this._timer = setTimeout(function(){
				self._animate();
			}, 25);
		}
	},
	move:function(x,y){
		this.$ball.css({left:Math.floor(x),top:Math.floor(y)});
		this.position = {x:x, y:y};
	},
	remove:function(){
		this._timer = false;
		this.$ball.remove();
		delete this;
	},
	_size:{width:null,height:null},
	_fieldSize:{width:null,height:null},
	$field:null,
	$ball:null,
	position:{x:null,y:null},
	_speed:{x:null,y:null},
	_angle:-90,
	_timer:null
};
