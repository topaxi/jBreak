jBreak.bonus = function(jBBall,x,y,angle){
	this._init(jBBall,x,y,angle);
};

jBreak.bonus.prototype = {
	_init:function(jBBall,x,y,angle){
		var random, background, powerup, jB = jBreak;

		jB.bonuses.push(this);

		// 50% chance to get a bad or a good powerup
		if(Math.floor(Math.random()+.5)){
			random = Math.floor(Math.random() * this._good.length);
			powerup = this._good[random];
			//console.log('Spawning "good" %o -> %d', this, random); 
		} else {
			random = Math.floor(Math.random() * this._bad.length);
			powerup = this._bad[random];
			//console.log('Spawning "bad" %o -> %d', this, random); 
		}
		this._action = powerup.action;

		var $bonus = $('<div class="jBreakBonus"/>');

		jB.$field.append($bonus);

		this._ball = jBBall;
		
		this._position = {x:x,y:y};
		this._speed = {
			x:null,
			y:null
		};

		$bonus.css({
			left:x,
			top:y,
			background:powerup.background
		});

		this.$bonus = $bonus;
		this.setAngle(angle);
		this._timer = true;
		this._animate();
	},
	setAngle:function(angle){
		if(angle !== undefined)
			this._angle = angle;

		var speed = this._angle / 360 * Math.PI;
		this._speed.x = Math.cos(speed);
		this._speed.y = Math.sin(speed);
	},
	_hitCheck:function(x,y){
		var jB = jBreak;
		// only run checks if a paddle could be hit
		if(y >= jB.fieldSize.height - 32 || y <=  24 || x <=  24 || x >= jB.fieldSize.width - 32){
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
						paddleHit = this._speed.y > 0
						         && y <= jB.fieldSize.height - 8
						         && x >= jBPaddlePosition.x - 24
						         && Math.ceil(y) >= jBPaddlePosition.y - 24
						         && x <= jBPaddlePosition.x + jBPaddleSize.width;

						paddleMissed = y > jB.fieldSize.height + 2;

						if(paddleHit){
							this._paddle = jBPaddle;
							return this._powerUpPaddle();
						}
						break;
					case 'top':
						paddleHit = this._speed.y < 0
						         && y >= 4
						         && x >= jBPaddlePosition.x + 24
						         && Math.ceil(y) <= jBPaddlePosition.y + 24
						         && x <= jBPaddlePosition.x + jBPaddleSize.width;

						paddleMissed = y < -10;

						if(paddleHit){
							this._paddle = jBPaddle;
							return this._powerUpPaddle();
						}
						break;
					case 'left':
						paddleHit = this._speed.x < 0 
						         && x >= 4
						         && y >= jBPaddlePosition.y + 24
						         && Math.ceil(x) <= jBPaddlePosition.x + 24
						         && y <= jBPaddlePosition.y + jBPaddleSize.height;

						paddleMissed = x < -10;

						if(paddleHit){
							this._paddle = jBPaddle;
							return this._powerUpPaddle();
						}
						break;
					case 'right':
						paddleHit = this._speed.x > 0
						         && y >= jBPaddlePosition.y - 24
						         && x <= jB.fieldSize.width - 8
						         && Math.ceil(x) >= jBPaddlePosition.x - 24
						         && y <= jBPaddlePosition.y + jBPaddleSize.height;

						paddleMissed = x > jB.fieldSize.width + 2;

						if(paddleHit){
							this._paddle = jBPaddle;
							return this._powerUpPaddle();
						}
						break;
				}

				if(paddleMissed)
					this.remove();
			}
		}
	},
	_powerUpPaddle:function(jBPaddle){
		jBreak.playSound('sound/pling1s.ogg');

		this._action(jBPaddle);
		this.remove();
	},
	_animate:function(){
		var x = this._position.x + this._speed.x*4;
		var y = this._position.y + this._speed.y*4;

		this.move(x,y);
		this._hitCheck(x,y);

		if(this._timer){
			// setTimeout(this._animate, 15) kills the "this" reference :(
			var self = this;
			setTimeout(function(){
				self._animate();
			}, this._interval);
		}
	},
	move:function(x,y){
		this.$bonus.css({left:x, top:y});
		this._position = {x:x,y:y};
	},
	pause:function(){
		if(this._timer){
			this._timer = false;
		} else {
			this._timer = true;
			this._animate();
		}
	},
	remove:function(){
		this._timer = false;
		this.$bonus.fadeOut('slow', function(){
			$(this).remove();
		});

		var jBBonuses = jBreak.bonuses;
		for(var i = jBBonuses.length;i--;)
			if(jBBonuses[i] === this)
				return jBBonuses.remove(i);
	},
	$bonus:null,
	_direction:null,
	_position:null,
	_speed:null,
	_timer:false,
	_interval:30,
	_angle:180,
	_ball:null, // the ball who triggered this bonus
	_paddle:null, // the paddle which caught this bonus
	_action:null, // will hold the function to be executed
	_bad:[
		{ // shrink paddle
			background:'url(images/bonuses/shrink.png)',
			action:function(){
				this._paddle.shrink();
			}
		},{ // ball speedup for 15 seconds
			background:'url(images/bonuses/15+speed.png)',
			action:function(){
				var ball = this._ball;

				ball.oldInterval = (ball.oldInterval
					? ball.oldInterval
					: ball.interval());

				ball.addTimer('speedUp15', {
					action:function(){
						this.interval(ball.oldInterval);
						this.oldInterval = false;
					},
					timeout:15
				});

				ball.interval(10);
			}
		},{ // permanent interval reduction
			background:'url(images/bonuses/faster.png)',
			action:function(){
				var ball = this._ball;

				ball.oldInterval -= 5;
				ball.interval(ball.interval() - 5);
			}
		},{ // pulsate paddle
			background:'blue',
			action:function(){
				this._paddle.$paddle.effect('pulsate', {times:10}, 3000);
			}
		},{ // kill a life
			background:'red',
			action:function(){
				jBreak.lives(jBreak.lives()-1);
			}
		}
	],
	_good:[
		{ // grow paddle
			background:'url(images/bonuses/grow.png)',
			action:function(){
				this._paddle.grow();
			}
		},{ // slow down ball
			background:'url(images/bonuses/slower.png)',
			action:function(){
				var ball = this._ball;
				ball.deleteTimer('speedUp15');

				if(ball.interval() < 25){
					ball.interval(25);
				}
			}
		},{ // +1 life
			background:'url(images/bonuses/life.png)',
			action:function(){
				jBreak.lives(jBreak.lives()+1);
			}
		},{ // piercing ball
			background:'url(images/bonuses/powerball.png)',
			action:function(){
				var ball = this._ball;
				
				ball.pierce(true);
				ball.addTimer('pierce', {
					action:function(){
						this.pierce(false);
					},
					timeout:7.5
				});
			}
		},{ // split triggering ball
			background:'url(images/bonuses/multiball.png)',
			action:function(){
				this._ball.clone().start();
			}
		}
	]
};
