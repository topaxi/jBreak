var Paddle = jBreak.Paddle = function(position){
	this._init(position);
};

Paddle.prototype = {
	_init:function(relativePosition){
		var $el      = this.$el = $('<div class="jBreakPaddle"/>')
		  , position = this._position = {
		    	relative: relativePosition
		    }
		  , width
		  , height
		;

		this._balls = [];

		$jBreakField.append($el.addClass(relativePosition));

		this._size = {
			width:  width  = $el.width(),
			height: height = $el.height()
		};

		switch(relativePosition){
			default:
			case 'bottom':
				position.y = jBreak.fieldSize.height - height;
				position.x = jBreak.fieldSize.width / 2 - width / 2;
				break;
			case 'top':
				position.y = 0;
				position.x = jBreak.fieldSize.width / 2 - width / 2;
				break;
			case 'left':
				position.y = jBreak.fieldSize.height / 2 - width / 2;
				position.x = 0;
				break;
			case 'right':
				position.y = jBreak.fieldSize.height / 2 - height / 2;
				position.x = jBreak.fieldSize.width - width;
				break;
		}

		$el.css({
			left: position.x,
			top:  position.y
		});

		addTimers(this);
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

		this.$el.css({
			width:  width,
			height: height,
			backgroundImage: 'url(images/paddles/pad'+ width +'x'+ height +'.png)'
		});

		this._size = {width:width, height:height};
	},
	start:function(){
		var self             = this
		  , fieldOffset      = $jBreakField.offset()
		  , topOffset        = fieldOffset.top
		  , leftOffset       = fieldOffset.left
		  , relativePosition = this._position.relative
		;

		this.toggleTimers(true);

		$document.mousemove(function(e){
			var newPosition = relativePosition === 'top'
			               ||  relativePosition === 'bottom'
			                   ? e.pageX - leftOffset
			                   : e.pageY - topOffset
			;

			self.move(newPosition);
		});
	},
	connectBall:function(jBBall){
		var x, y, effectDirection, ballSize = jBBall.size();

		switch(this._position.relative){
			case 'top':
				x = this._position.x
				  + this._size.width / 2
				  - ballSize.width / 2;

				y = this._position.y
				  + this._size.height / 2
				  + ballSize.height / 2;

				jBBall.angle(90);
				effectDirection = 'down';
				break;
			case 'right':
				x = this._position.x
				  - ballSize.width;

				y = this._position.y
				  + this._size.height / 2
				  - ballSize.width / 2;

				jBBall.angle(90);
				effectDirection = 'left';
				break;
			default:
			case 'bottom':
				x = this._position.x
				  + this._size.width / 2
				  - ballSize.width / 2;

				y = this._position.y
				  - this._size.height / 2
				  - ballSize.height / 2;

				jBBall.angle(-90);
				effectDirection = 'up';
				break;
			case 'left':
				x = this._position.x
				  + ballSize.width;

				y = this._position.y
				  + this._size.height / 2
				  - ballSize.width / 2;

				jBBall.angle(-90);
				effectDirection = 'right';
				break;
		}

		jBBall.move(x,y);
		jBBall.$el.show('bounce', {
			direction:effectDirection,
			distance:40,
			times:5
		}, function(){
			var position = jBBall.position();

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
		var jB               = jBreak
		  , size             = this._size
		  , jBFieldSize      = jB.fieldSize
		  , relativePosition = this._position.relative
		;

		if(relativePosition === 'top' || relativePosition === 'bottom'){
			var x = position;
			x -= size.width / 2;

			if(x < 0)
				x = 0;
			else if(x > jBFieldSize.width - size.width)
				x = jBFieldSize.width - size.width;

			for(var i = this._balls.length;i--;){
				var ball  = this._balls[i]
				  , ballX = x
				          + size.width / 2
				          - ball.size().width / 2

				  , $parent = ball.$el.parent();
				;

				if($parent.hasClass('ui-effects-wrapper')){
					$parent.css({
						left:ballX,
						top:ball.position().y
					});
					ball.position(ballX, null);
				}
				else {
					ball.move(
						ballX,
						ball.position().y);
				}
			}

			this._position.x = x;
			this.$el.css('left', x);
		}
		else {
			var y = position;
			y -= size.height / 2;

			if(y < 0)
				y = 0;
			else if(y > jBFieldSize.height - size.height)
				y = jBFieldSize.height - size.height;

			for(var i = this._balls.length;i--;){
				var ball  = this._balls[i]
				  , ballY = y
				          + size.height / 2
				          - ball.size().height / 2

				  , $parent = ball.$el.parent();
				;

				if($parent.hasClass('ui-effects-wrapper')){
					$parent.css({
						left:ball.position().x,
						top:ballY
					});
					ball.position(null, ballY);
				}
				else {
					ball.move(
						ball.position().x,
						ballY);
				}
			}

			this._position.y = y;
			this.$el.css('top', y);
		}
	},
	remove:function(){
		var jB = jBreak;

		this.triggerTimer();

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

		this.$el.remove();
		//delete this;
	},
	getPosition:function(){
		return this._position;
	},

	// private variables
	_size:     null,
	_position: null,
	_balls:    null,
	_paused:   false,

	// public variables
	$el:null
};
