jBreak.bonus = function(jBBall,x,y,angle){
	this._init(jBBall,x,y,angle);
};

jBreak.bonus.prototype = {
	_init:function(jBBall,x,y,angle){
		var random,
		    background,
		    powerup,
		    jB = jBreak,
		    $el = $('<div class="jBreakBonus"/>');

		this._animate = $.proxy(animate, this);

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

		jB.$field.append($el);

		this._ball = jBBall;
		
		this._position = {x:x,y:y};
		this._speed = {
			x:null,
			y:null
		};

		$el.css({
			left:x,
			top:y,
			background:powerup.background
		});

		this.$el = $el;
		this.angle(angle);
		this._timer = true;
		this._animate();
	},
	angle:angle,
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
						break;
					case 'top':
						paddleHit = this._speed.y < 0
						         && y >= 4
						         && x >= jBPaddlePosition.x + 24
						         && Math.ceil(y) <= jBPaddlePosition.y + 24
						         && x <= jBPaddlePosition.x + jBPaddleSize.width;

						paddleMissed = y < -10;
						break;
					case 'left':
						paddleHit = this._speed.x < 0 
						         && x >= 4
						         && y >= jBPaddlePosition.y + 24
						         && Math.ceil(x) <= jBPaddlePosition.x + 24
						         && y <= jBPaddlePosition.y + jBPaddleSize.height;

						paddleMissed = x < -10;
						break;
					case 'right':
						paddleHit = this._speed.x > 0
						         && y >= jBPaddlePosition.y - 24
						         && x <= jB.fieldSize.width - 8
						         && Math.ceil(x) >= jBPaddlePosition.x - 24
						         && y <= jBPaddlePosition.y + jBPaddleSize.height;

						paddleMissed = x > jB.fieldSize.width + 2;
						break;
				}

				if(paddleHit){
					this._paddle = jBPaddle;
					return this._powerUpPaddle();
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
	_animate:null,
	move:move,
	pause:function(pause){
		if(pause){
			this._timer = false;
		} else {
			this._timer = true;
			this._animate();
		}
	},
	remove:function(){
		this._timer = false;
		this.$el.fadeOut(600, function(){
			$(this).remove();
		});

		var jBBonuses = jBreak.bonuses;
		for(var i = jBBonuses.length;i--;)
			if(jBBonuses[i] === this)
				return jBBonuses.remove(i);
	},
	$el:null,
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
				this._paddle.$el.effect('pulsate', {times:10}, 3000);
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
