jBreak.paddle = function(position){
	this._init(position);
};

jBreak.paddle.prototype = {
	_init:function(position){
		//console.log('Create %s paddle..', position);
		this.$paddle = $('<div class="jBreakPaddle"/>');

		this._position = {
			x:null,
			y:null,
			relative:position
		};

		this._balls = [];

		this.$paddle.addClass(position);
		jBreak.$field.append(this.$paddle);

		this._size = {
			width:this.$paddle.width(),
			height:this.$paddle.height()
		};

		switch(position){
			default:
			case 'bottom':
				this._position.y = jBreak.fieldSize.height - this._size.height;
				this._position.x = jBreak.fieldSize.width / 2 - this._size.width / 2;
				break;
			case 'top':
				this._position.y = 0;
				this._position.x = jBreak.fieldSize.width / 2 - this._size.width / 2;
				break;
			case 'left':
				this._position.y = jBreak.fieldSize.height / 2 - this._size.width / 2;
				this._position.x = 0;
				break;
			case 'right':
				this._position.y = jBreak.fieldSize.height / 2 - this._size.height / 2;
				this._position.x = jBreak.fieldSize.width - this._size.width;
				break;
		}

		this.$paddle.css({
			left:this._position.x,
			top:this._position.y
		});
		//console.log('%s paddle created and moved to initial position -> %o', position, this);
	},
	grow:function(){
		var size = this._size;
		this.size(size.width > size.height
			? size.width  + 16
			: size.height + 16);
	},
	shrink:function(){
		var size = this._size;
		this.size(size.width > size.height
			? size.width  - 16
			: size.height - 16);
	},
	size:function(size){
		if(size === undefined)
			return this._size;

		if(size > 128 || size < 16 || size % 16 !== 0)
			return;

		var width = this._size.width,
		    height = this._size.height;
		(width > height
			? width = size
			: height = size);

		this.$paddle.css({
			width:width+'px',
			height:height+'px',
			backgroundImage:'url(images/paddles/pad'+width+'x'+height+'.png)'
		});
		this._size = {width:width, height:height};
	},
	start:function(){
		var self = this,
		    relativePosition = this._position.relative,
		    fieldOffset = jBreak.$field.offset();

		$(document)./*jBreak.$field.*/mousemove(function(e){
			var newPosition = (relativePosition === 'top'
			               ||  relativePosition === 'bottom'
			                   ? e.pageX - fieldOffset.left
			                   : e.pageY - fieldOffset.top);

			self.move(newPosition);
		});
	},
	connectBall:function(jBBall){
		var x,y,effectDirection;

		switch(this._position.relative){
			case 'top':
				x = this._position.x
				  + this._size.width / 2
				  - jBBall.$ball.width() / 2;

				y = this._position.y
				  + this._size.height / 2
				  + jBBall.$ball.height() / 2;

				jBBall.setAngle(90);
				effectDirection = 'down';
				break;
			case 'right':
				x = this._position.x
				  - jBBalls.$ball.width();

				y = this._position.y
				  + this._size.height / 2
				  - jBBall.$ball.width() / 2;

				jBBall.setAngle(90);
				effectDirection = 'left';
				break;
			default:
			case 'bottom':
				x = this._position.x
				  + this._size.width / 2
				  - jBBall.$ball.width() / 2;

				y = this._position.y
				  - this._size.height / 2
				  - jBBall.$ball.height() / 2;

				jBBall.setAngle(-90);
				effectDirection = 'up';
				break;
			case 'left':
				x = this._position.x
				  + jBBall.$ball.width();

				y = this._position.y
				  + this._size.height / 2
				  - jBBall.$ball.width() / 2;

				jBBall.setAngle(-90);
				effectDirection = 'right';
				break;
		}

		jBBall.move(x,y);
		jBBall.$ball.show('bounce', {
			direction:effectDirection,
			distance:40,
			times:5
		}, function(){
			var position = jBBall.getPosition();

			jBBall.move(position.x,position.y);
			jBBall.ready(true);
		});
		this._balls.push(jBBall);

		//console.log('Ball %d connected to %o and moved to %d,%d', ballID, this, x, y);
	},
	startBalls:function(){
		for(var i = this._balls.length;i--;){
			var ball = this._balls[i];

			if(ball.ready()){
				ball.start();
				this._balls.remove(i);
			}
		}
	},
	move:function(position){
		var jB = jBreak,
		    jBFieldSize = jB.fieldSize,
		    relativePosition = this._position.relative;

		if(relativePosition === 'top' || relativePosition === 'bottom'){
			var x = position;
			x -= this._size.width / 2;

			if(x < 0)
				x = 0;
			else if(x > jBFieldSize.width - this._size.width)
				x = jBFieldSize.width - this._size.width;

			for(var i = this._balls.length;i--;){
				var ball = this._balls[i],
				    ballX = x
				          + this._size.width / 2
				          - ball.$ball.width() / 2;

				// @todo fix this "workaround" or maybe even kill the "bounce" effect
				var $parent = ball.$ball.parent();
				if($parent.hasClass('ui-effects-wrapper')){
					$parent.css({
						left:ballX,
						top:ball.getPosition().y
					});
					ball.setPosition(ballX, null);
				} else {
					ball.move(
						ballX,
						ball.getPosition().y);
				}
			}

			this._position.x = x;
			this.$paddle.css('left', x);
		} else {
			var y = position;
			y -= this._size.height / 2;

			if(y < 0)
				y = 0;
			else if(y > jBFieldSize.height - this._size.height)
				y = jBFieldSize.height - this._size.height;

			for(var i = this._balls.length;i--;){
				var ball  = this._balls[i],
				    ballY = y
				          + this._size.height / 2
				          - ball.$ball.height() / 2;

				var $parent = ball.$ball.parent();
				if($parent.hasClass('ui-effects-wrapper')){
					$parent.css({
						left:ball.getPosition().x,
						top:ballY
					});
					ball.setPosition(null, ballY);
				} else {
					ball.move(
						ball.getPosition().x,
						ballY);
				}
			}

			this._position.y = y;
			this.$paddle.css('top', y);
		}
	},
	remove:function(){
		var jB = jBreak;

		for(var i = jB.paddles.length;i--;)
			if(jB.paddles[i]._position.relative === this._position.relative)
				jB.paddles.remove(i);

		// remove connected balls
		for(var i = this._balls.length;i--;){
			var connectedBall = this._balls[i];
			for(var o = jB.balls.length;o--;){
				var jBBall = jB.balls[o];
				if(connectedBall === jBBall)
					jBBall.remove();
			}
		}

		this.$paddle.remove();
		//delete this;
	},
	getPosition:function(){
		return this._position;
	},
	// private variables
	_size:null,
	_position:null,
	_balls:null,
	_paused:false,
	// public variables
	$paddle:null
};
