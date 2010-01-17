jBreak.ball = function(position){
	this._init(position);
};

jBreak.ball.prototype = {
	_init:function(position){
		jBreak.balls.push(this);
		//console.log('Create ball %d -> %o', ballID, this);
		this.$ball = $('<div class="jBreakBall"/>');
		jBreak.$field.append(this.$ball);

		this._size = {
			width: this.$ball.width(),
			height:this.$ball.height()
		};

		this._position = position;
		this._speed = {
			x:null,
			y:null
		};

		this._timers = {};
	},
	start:function(){
		if(this._ready){
			this.angle(this._angle);
			this._timer = true;
			this._toggleTimers(true);
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
	_toggleTimers:function(on){
		if(on){
			var self = this;
			this._timersID = setInterval(function(){
				var timers = self._timers;

				for(var i in timers){
					var timer = timers[i];
					timer.timeout -= .25;

					if(timer.timeout <= 0){
						timer.action.call(self);
						self.deleteTimer(i);
					}
				}
			}, 250);
		} else {
			clearInterval(this._timersID);
		}
	},
	angle:function(angle){
		if(angle === undefined)
			return this._angle;

		this._angle = angle;
		var speed = angle / 360 * Math.PI;
		this._speed.x = Math.cos(speed);
		this._speed.y = Math.sin(speed);
	},
	_hitCheck:function(x,y){
		var jB = jBreak; // store jBreak in this scope to access it faster!
		var paddle = {
			top:false,
			right:false,
			bottom:false,
			left:false
		};

		// only run checks if a block could be hit
		if(y <= jB.fieldSize.height || y >= 0 || x >= 0 || x <= jB.fieldSize.width){
			var ballY = (this._speed.y > 0 ? y + this._size.height : y),
			    ballX = (this._speed.x > 0 ? x + this._size.width  : x);

			var blockX = Math.floor(ballX / 40),
			    blockY = Math.floor(ballY / 16);

			var blockExists = jB.blocks[blockY] !== undefined
			               && jB.blocks[blockY][blockX] !== undefined;

			if(blockExists){
				var block = jB.blocks[blockY][blockX];
				if(block.value > 0){
					jB.playSound('sound/pling1s.ogg');

					if(!this._pierce){
						ballX = Math.floor(ballX);
						ballY = Math.floor(ballY);

						var hHit = (ballX % 40 <= 39 && ballX % 40 >= 36 && this._speed.x < 0)
						        || (ballX % 40 <=  4 && this._speed.x > 0);
						var vHit = (ballY % 16 <= 15 && ballY % 16 >= 12 && this._speed.y < 0)
						        || (ballY % 16 <=  4 && this._speed.y > 0);

						if(vHit && hHit) // don't mirror both speeds, mirror the slower one
							(this._speed.y > this._speed.x
								? hHit = false
								: vHit = false);

						if(vHit)
							this._speed.y *= -1;

						if(hHit)
							this._speed.x *= -1;

						/*if(!hHit && !vHit){
							console.log('ballX: %d speed: %o', ballX, this._speed);
						}*/
					}

					//console.log('I hit %d,%d', blockX,blockY);
					var $block = $('.x'+blockX+'.y'+blockY);
					var direction =
						(vHit && this._speed.y > 0 ? 'up' :
							(hHit && this._speed.x > 0 ? 'left' :
								(hHit && this._speed.x < 0 ? 'right' :
									/*vHit && this._speed.y < 0*/ 'down')));

					var rand = Math.random();
					if(block.value > 1 && !this._pierce){
						if(rand < .04)
							new jB.bonus(this,x,y,180); // spawn bonus

						$block.css({
							opacity:1-1/block.value,
							backgroundPosition:'0 '+block.sprite+'px'
						});
						block.value -= 1;

						setTimeout(function(){
							$block.css('background-position', '-40px '+block.sprite+'px');
						}, 100);
					} else {
						if(rand < .08)
							new jB.bonus(this,x,y,180); // spawn bonus

						$block.css('background-position', '0 '+block.sprite+'px');
						$block.effect('drop', {direction:direction}, 'fast', function(){
							$block.remove();
						});

						delete jB.blocks[blockY][blockX];
						jB.blockChecker();
					}
				}
			}
		}

		// only run checks if a paddle could be hit
		if(y >= jB.fieldSize.height - 16 || y <=  8 || x <=  8 || x >= jB.fieldSize.width - 16){
			for(var i = jB.paddles.length;i--;){
				var jBPaddle = jB.paddles[i],
				    paddleMissed,
				    paddleHit,
				    angle,
				    jBPaddlePosition = jBPaddle.getPosition(),
				    jBPaddleSize = jBPaddle.size();

				switch(jBPaddlePosition.relative){
					default:
					case 'bottom':
						paddle.bottom = true;

						paddleHit = this._speed.y > 0
						         && y <= jB.fieldSize.height - 8
						         && x >= jBPaddlePosition.x - this._size.width
						         && Math.ceil(y) >= jBPaddlePosition.y - this._size.height
						         && x <= jBPaddlePosition.x + jBPaddleSize.width;

						paddleMissed = y > jB.fieldSize.height + 2;

						if(paddleHit){
							angle =
								(this._position.x - jBPaddlePosition.x + this._size.width/2)
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

						paddleHit = this._speed.y < 0
						         && y >= 4
						         && x >= jBPaddlePosition.x - this._size.width
						         && Math.ceil(y) <= jBPaddlePosition.y + this._size.height
						         && x <= jBPaddlePosition.x + jBPaddleSize.width;

						paddleMissed = y < -10;

						if(paddleHit){
							angle =
								(this._position.x - jBPaddlePosition.x + this._size.width/2)
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

						paddleHit = this._speed.x < 0 
						         && x >= 4
						         && y >= jBPaddlePosition.y - this._size.height
						         && Math.ceil(x) <= jBPaddlePosition.x + this._size.width
						         && y <= jBPaddlePosition.y + jBPaddleSize.height;

						paddleMissed = x < -10;

						if(paddleHit)
							this._speed.x *= -1;
						break;
					case 'right':
						paddle.right = true;

						paddleHit = this._speed.x > 0
						         && y >= jBPaddlePosition.y - this._size.height
						         && x <= jB.fieldSize.width - 8
						         && Math.ceil(x) >= jBPaddlePosition.x - this._size.width
						         && y <= jBPaddlePosition.y + jBPaddleSize.height;

						paddleMissed = x > jB.fieldSize.width + 2;

						if(paddleHit)
							this._speed.x *= -1;
						break;
				}

				if(paddleHit){
					jB.playSound('sound/pling1s.ogg');
					this._interval -= (this._interval > 12.5 ? .20 : 0);
				} else if(paddleMissed){
					this.remove();
					jB.ballChecker(jBPaddle); // any balls left?
					return;
				}
			}
		}

		var check;

		check = x < 0 && !paddle.left
		     || x > jB.fieldSize.width - this._size.width && !paddle.right;
		if(check){
			jB.playSound('sound/pling1s.ogg');
			this._speed.x *= -1;
			this._interval -= (this._interval > 10 ? .075 : 0);
		}

		check = y < 0 && !paddle.top
		     || y > jB.fieldSize.height - this._size.height && !paddle.bottom;
		if(check){
			jB.playSound('sound/pling1s.ogg');
			this._speed.y *= -1;
			this._interval -= (this._interval > 10 ? .075 : 0);
		}
	},
	_animate:function(){
		var x = this._position.x + this._speed.x*4;
		var y = this._position.y + this._speed.y*4;

		this.move(x,y);
		this._hitCheck(x,y);

		if(this._timer){
			// setTimeout(this._animate, 15) kills the "this" reference :(
			var self = this;
			this._timerID = setTimeout(function(){
				self._animate();
			}, this._interval);
		}
	},
	move:function(x,y){
		this.$ball.css({left:x, top:y});
		this.setPosition(x,y);
	},
	interval:function(i){
		if(i !== undefined)
			this._interval = (this._interval < 10 ? 10 : i);
		else
			return this._interval;
	},
	setPosition:function(x,y){
		this._position = {
			x:x !== null ? x : this._position.x,
			y:y !== null ? y : this._position.y
		};
	},
	getPosition:function(){
		return this._position;
	},
	remove:function(){
		clearTimeout(this._timerID);
		this._timer = false;
		this._toggleTimers(false);
		this.$ball.remove();

		// delete me!
		var jBBalls = jBreak.balls;
		for(var i = jBBalls.length;i--;)
			if(jBBalls[i] === this)
				return jBBalls.remove(i);

		//console.log('Ball lost. Removed %o from jBreak field!', this);
	},
	pause:function(){
		if(this._timer){
			clearTimeout(this._timerID);
			this._timer = false;
			this._toggleTimers(false);
		} else {
			this._timer = true;
			this._toggleTimers(true);
			this._animate();
		}
	},
	pierce:function(pierce){
		this._pierce = pierce;

		this.$ball.css('background-image', (pierce
			? 'url(images/ball1-88.png)'
			: 'url(images/ball4-88.png)'
		));
	},
	clone:function(){
		var jB = jBreak,
		    ball = $.extend(true, {}, this);

		ball = $.extend(true, ball, {
			$ball:this.$ball.clone()
		});

		jB.balls.push(ball);

		jB.$field.append(ball.$ball);

		return ball;
	},
	addTimer:function(name, timer){
		this._timers[name] = timer;
	},
	deleteTimer:function(name){
		delete this._timers[name];
	},
	// private variables
	_ballID:null,
	_speed:null,
	_angle:-90,
	_position:null,
	_timer:null,
	_timerID:null,
	_interval:30,
	_size:null,
	_pierce:false,
	_ready:false, // ready to start?
	_timers:null,
	_timersID:null,
	// public variables
	$ball:null
};
