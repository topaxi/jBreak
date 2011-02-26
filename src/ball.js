jBreak.Ball = function(position){
	this._init(position);
};

jBreak.Ball.prototype = {
	_init:function(position){
		jBreak.balls.push(this);
		//console.log('Create ball %d -> %o', ballID, this);
		this.$el = $('<div class="jBreakBall"/>');
		jBreak.$field.append(this.$el);

		this._size = {
			width: this.$el.width(),
			height:this.$el.height()
		};

		this._position = position;
		this._speed = {
			x:null,
			y:null
		};

		this._animate = $.proxy(animate, this);
		addTimers(this);
	},
	start:function(){
		if(this._ready){
			this.angle(this._angle);
			this._timer = true;
			this.toggleTimers(true);
			this._animate();
		}
	},
	ready:function(ready){
		if(ready !== undefined){
			this._ready = ready;

			return this;
		}

		return this._ready;
	},
	angle:angle,
	_hitCheck:function(x,y){
		var jB = jBreak, // store jBreak in this scope to access it faster!
		    paddle = {
		    	top:false,
		    	right:false,
		    	bottom:false,
		    	left:false
		    };

		var speed  = this._speed
		  , size   = this._size
		  , ballY  = speed.y > 0 ? y + size.height : y
		  , ballX  = speed.x > 0 ? x + size.width  : x

		  , blockX = ~~(ballX / 40)
		  , blockY = ~~(ballY / 16)

		  , block  = jB.blocks[blockY]
		          && jB.blocks[blockY][blockX]
		;

		if(block){
			if(block.value > 0){
				jB.playSound('sound/pling1s.ogg');

				if(!this._pierce){
					this._interval -= (this._interval > 12.5 ? .025 : 0);

					ballX = ~~ballX;
					ballY = ~~ballY;

					var hHit = (ballX % 40 <= 39 && ballX % 40 >= 36 && speed.x < 0)
					        || (ballX % 40 <=  4 && speed.x > 0),
					    vHit = (ballY % 16 <= 15 && ballY % 16 >= 12 && speed.y < 0)
					        || (ballY % 16 <=  4 && speed.y > 0);

					if(vHit && hHit) // don't mirror both speeds, mirror the slower one
						(speed.y > speed.x
							? hHit = false
							: vHit = false);

					if(vHit)
						speed.y *= -1;

					if(hHit)
						speed.x *= -1;
				}

				//console.log('I hit %d,%d', blockX,blockY);
				var $block = $('.x'+ blockX +'.y'+ blockY, jB.$field),
				    direction =
				    	(vHit && speed.y > 0 ? 'up' :
				    		(hHit && speed.x > 0 ? 'left' :
				    			(hHit && speed.x < 0 ? 'right' :
				    				/*vHit && speed.y < 0*/ 'down')));

				var rand = Math.random();
				if(block.value > 1 && !this._pierce){
					if(rand < .04)
						new jB.Bonus(this,x,y,180); // spawn bonus

					$block.css({
						opacity:1-1/block.value,
						backgroundPosition:'0 '+block.sprite+'px'
					});
					block.value -= 1;

					setTimeout(function(){
						$block.css('background-position', '-40px '+block.sprite+'px');
					}, 100);
				}
				else {
					if(rand < .08)
						new jB.Bonus(this,x,y,180); // spawn bonus

					$block.css('background-position', '0 '+block.sprite+'px');
					$block.effect('drop', {direction:direction}, 200, function(){
						$block.remove();
					});

					delete jB.blocks[blockY][blockX];
					jB.blockChecker();
				}
			}
		}

		// only run checks if a paddle could be hit
		if(y >= jB.fieldSize.height - 16 || y <=  8 || x <=  8 || x >= jB.fieldSize.width - 16){
			for(var i = jB.paddles.length;i--;){
				var jBPaddle         = jB.paddles[i]
				  , jBPaddlePosition = jBPaddle.getPosition()
				  , jBPaddleSize     = jBPaddle.size()
				  , paddleMissed
				  , paddleHit
				  , angle
				;

				switch(jBPaddlePosition.relative){
					default:
					case 'bottom':
						paddle.bottom = true;

						paddleHit = speed.y > 0
						         && y <= jB.fieldSize.height - 8
						         && x >= jBPaddlePosition.x - size.width
						         && Math.ceil(y) >= jBPaddlePosition.y - size.height
						         && x <= jBPaddlePosition.x + jBPaddleSize.width;

						paddleMissed = y > jB.fieldSize.height + 2;

						if(paddleHit){
							angle =
								(x - jBPaddlePosition.x + size.width/2)
								 * 180 / (jBPaddle._size.width / 2)
								 - 360;

							angle = Math.floor(
								(angle > -45 ? -45 :
									(angle < -315 ? -315 : angle)));

							this.angle(angle);
						}
						break;
					case 'top':
						paddle.top = true;

						paddleHit = speed.y < 0
						         && y >= 4
						         && x >= jBPaddlePosition.x - size.width
						         && Math.ceil(y) <= jBPaddlePosition.y + size.height
						         && x <= jBPaddlePosition.x + jBPaddleSize.width;

						paddleMissed = y < -10;

						if(paddleHit){
							angle =
								(x - jBPaddlePosition.x + size.width/2)
								 * 180 / (jBPaddle._size.width / 2)
								 - 360;

							angle = Math.floor(
								(angle > -45 ? -45 :
									(angle < -315 ? -315 : angle)));

							this.angle(angle*-1);
						}
						break;
					case 'left':
						paddle.left = true;

						paddleHit = speed.x < 0 
						         && x >= 4
						         && y >= jBPaddlePosition.y - size.height
						         && Math.ceil(x) <= jBPaddlePosition.x + size.width
						         && y <= jBPaddlePosition.y + jBPaddleSize.height;

						paddleMissed = x < -10;

						if(paddleHit)
							speed.x *= -1;
						break;
					case 'right':
						paddle.right = true;

						paddleHit = speed.x > 0
						         && y >= jBPaddlePosition.y - size.height
						         && x <= jB.fieldSize.width - 8
						         && Math.ceil(x) >= jBPaddlePosition.x - size.width
						         && y <= jBPaddlePosition.y + jBPaddleSize.height;

						paddleMissed = x > jB.fieldSize.width + 2;

						if(paddleHit)
							speed.x *= -1;
						break;
				}

				if(paddleHit){
					jB.playSound('sound/pling1s.ogg');
					this._interval -= (this._interval > 12.5 ? .2 : 0);
				}
				else if(paddleMissed){
					this.remove();
					jB.ballChecker(jBPaddle); // any balls left?
					return;
				}
			}
		}

		var check;

		check = x < 0 && !paddle.left
		     || x > jB.fieldSize.width - size.width && !paddle.right;
		if(check){
			jB.playSound('sound/pling1s.ogg');
			speed.x *= -1;
			this._interval -= (this._interval > 10 ? .075 : 0);
		}

		check = y < 0 && !paddle.top
		     || y > jB.fieldSize.height - size.height && !paddle.bottom;
		if(check){
			jB.playSound('sound/pling1s.ogg');
			speed.y *= -1;
			this._interval -= (this._interval > 10 ? .075 : 0);
		}
	},
	_animate:null,
	move:move,
	interval:function(i){
		if(i !== undefined)
			this._interval = (this._interval < 10 ? 10 : i);
		else
			return this._interval;
	},
	position:function(x,y){
		if(x === undefined && y === undefined)
			return this._position;

		this._position = {
			x:x !== null ? x : this._position.x,
			y:y !== null ? y : this._position.y
		};
	},
	remove:function(){
		this._timer = false;
		this.toggleTimers(false);
		this.$el.remove();

		// delete me!
		var jBBalls = jBreak.balls;
		for(var i = jBBalls.length;i--;)
			if(jBBalls[i] === this)
				return jBBalls.remove(i);
	},
	pause:function(pause){
		if(pause){
			this._timer = false;
			this.toggleTimers(false);
		}
		else {
			this._timer = true;
			this.toggleTimers(true);
			this._animate();
		}
	},
	pierce:function(pierce){
		this._pierce = pierce;

		this.$el.css('background-image', (pierce
			? 'url(images/ball1-88.png)'
			: 'url(images/ball4-88.png)'
		));
	},
	clone:function(){
		var ball = $.extend(true, {}, this);

		ball = $.extend(true, ball, {
			$el:this.$el.clone(),
			_animate:$.proxy(animate, ball)
		});

		jBreak.balls.push(ball);
		jBreak.$field.append(ball.$el);

		return ball;
	},
	size:function(size){
		if(size === undefined)
			return this._size;

		// setting size is not implemented yet!
	},

	// private variables
	_speed:    null,
	_angle:    -90,
	_position: null,
	_timer:    null,
	_interval: 30,
	_size:     null,
	_pierce:   false,
	_ready:    false, // ready to start?

	// public variables
	$el:null
};
