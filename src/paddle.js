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

		  , fieldSize   = jBreak.fieldSize
		  , fieldHeight = fieldSize.height
		  , fieldWidth  = fieldSize.width
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
				position.y = fieldHeight - height;
				position.x = fieldWidth / 2 - width / 2;
				break;
			case 'top':
				position.y = 0;
				position.x = fieldWidth / 2 - width / 2;
				break;
			case 'left':
				position.y = fieldHeight / 2 - width / 2;
				position.x = 0;
				break;
			case 'right':
				position.y = fieldHeight / 2 - height / 2;
				position.x = fieldWidth - width;
				break;
		}

		$el.css({
			left: position.x,
			top:  position.y
		});

		addTimers(this);
	},
	grow:function(){
		this.size(this.size() + 16);
	},
	shrink:function(){
		this.size(this.size() - 16);
	},
	size:function(newSize){
		var size = this._size
		  , width  = size.width
		  , height = size.height
		;

		if(newSize === undefined){
			return width > height ? width : height;
		}

		if(newSize > 128 || newSize < 16 || newSize % 16 !== 0)
			return;

		(width > height
			? width  = newSize
			: height = newSize);

		this.$el.css({
			width:  width,
			height: height,
			backgroundImage: 'url(images/paddles/pad'+ width +'x'+ height +'.png)'
		});

		size.width  = width;
		size.height = height;
	},
	start:function(){
		var self             = this
		  , fieldOffset      = $jBreakField.offset()
		  , topOffset        = fieldOffset.top
		  , leftOffset       = fieldOffset.left
		  , relativePosition = this._position.relative
		;

		this.toggleTimers(true);

		$document.bind('mousemove.jBreakPaddle-'+ relativePosition, function(e){
			var newPosition = relativePosition === 'top'
			               ||  relativePosition === 'bottom'
			                   ? e.pageX - leftOffset
			                   : e.pageY - topOffset
			;

			self.move(newPosition);
		});
	},
	pause:function(pause){
		if(pause) {
			this.toggleTimers(!pause);
			$document.unbind('.jBreakPaddle-'+ this._position.relative);
		}
		else this.start();
	},
	connectBall:function(jBBall){
		var x
		  , y
		  , effectDirection
		  , ballSize = jBBall.size()
		  , position = this._position
		  , size     = this._size
		;

		switch(position.relative){
			case 'top':
				x = position.x
				  + size.width / 2
				  - ballSize.width / 2;

				y = position.y
				  + size.height / 2
				  + ballSize.height / 2;

				jBBall.angle(90);
				effectDirection = 'down';
				break;
			case 'right':
				x = position.x
				  - ballSize.width;

				y = position.y
				  + size.height / 2
				  - ballSize.width / 2;

				jBBall.angle(90);
				effectDirection = 'left';
				break;
			default:
			case 'bottom':
				x = position.x
				  + size.width / 2
				  - ballSize.width / 2;

				y = position.y
				  - size.height / 2
				  - ballSize.height / 2;

				jBBall.angle(-90);
				effectDirection = 'up';
				break;
			case 'left':
				x = position.x
				  + ballSize.width;

				y = position.y
				  + size.height / 2
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

			jBBall.move(position.x, position.y);
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
		  , balls            = this._balls

		  , fieldSize        = jB.fieldSize
		  , fieldHeight      = fieldSize.height
		  , fieldWidth       = fieldSize.width

		  , relativePosition = this._position.relative
		;

		if(relativePosition === 'top' || relativePosition === 'bottom'){
			position -= size.width / 2;

			if(position < 0)
				position = 0;
			else if(position > fieldWidth - size.width)
				position = fieldWidth - size.width;

			for(var i = balls.length;i--;){
				var ball  = balls[i]
				  , ballX = position
				          + size.width / 2
				          - ball.size().width / 2

				  , $parent = ball.$el.parent();
				;

				if($parent.hasClass('ui-effects-wrapper')){
					$parent.css({
						left: ballX,
						top:  ball.position().y
					});
					ball.position(ballX, null);
				}
				else {
					ball.move(
						ballX,
						ball.position().y);
				}
			}

			this._position.x = position;
			this.$el.css('left', position);
		}
		else {
			position -= size.height / 2;

			if(position < 0)
				position = 0;
			else if(position > fieldHeight - size.height)
				position = fieldHeight - size.height;

			for(var i = balls.length;i--;){
				var ball  = balls[i]
				  , ballY = position
				          + size.height / 2
				          - ball.size().height / 2

				  , $parent = ball.$el.parent();
				;

				if($parent.hasClass('ui-effects-wrapper')){
					$parent.css({
						left: ball.position().x,
						top:  ballY
					});
					ball.position(null, ballY);
				}
				else {
					ball.move(
						ball.position().x,
						ballY);
				}
			}

			this._position.y = position;
			this.$el.css('top', position);
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
	_paused:   false
};
