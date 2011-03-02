var Bonus = jBreak.Bonus = function(jBBall,x,y,angle){
	this._init(jBBall,x,y,angle);
};

Bonus.prototype = {
	_init:function(jBBall,x,y,angle){
		var random
		  , background
		  , powerup
		  , jB  = jBreak
		  , $el = this.$el = $('<div class="jBreakBonus"/>')
		;
		
		jB.bonuses.push(this);

		// 50% chance to get a bad or a good powerup
		if(Math.floor(Math.random() + .5)){
			random = Math.floor(Math.random() * this._good.length);
			powerup = this._good[random];
			//console.log('Spawning "good" %o -> %d', this, random); 
		}
		else {
			random = Math.floor(Math.random() * this._bad.length);
			powerup = this._bad[random];
			//console.log('Spawning "bad" %o -> %d', this, random); 
		}
		this._action = powerup.action;

		$jBreakField.append($el);

		this._ball = jBBall;
		
		this._position = {x:x,y:y};
		this._speed    = {};

		$el.css({
			left: x,
			top:  y,
			background: powerup.background
		});

		animate(this).angle(angle).toggleAnimate(true);
	},
	_hitCheck:function(x,y){
		var jB          = jBreak
		  , fieldSize   = jB.fieldSize
		  , fieldHeight = fieldSize.height
		  , fieldWidth  = fieldSize.width
		;

		// only run checks if a paddle could be hit
		if(y >= fieldHeight - 32 || y <=  24 || x <=  24 || x >= fieldWidth - 32){
			for(var i = jB.paddles.length;i--;){
				var jBPaddle = jB.paddles[i]
				  , paddleMissed
				  , paddleHit
				  , angle
				  , jBPaddlePosition = jBPaddle.getPosition()
				  , jBPaddleSize     = jBPaddle.size()
				  , speed            = this._speed
				;

				switch(jBPaddlePosition.relative){
					default:
					case 'bottom':
						paddleHit = speed.y > 0
						         && y <= jB.fieldSize.height - 8
						         && x >= jBPaddlePosition.x - 24
						         && Math.ceil(y) >= jBPaddlePosition.y - 24
						         && x <= jBPaddlePosition.x + jBPaddleSize.width;

						paddleMissed = y > fieldHeight + 2;
						break;
					case 'top':
						paddleHit = speed.y < 0
						         && y >= 4
						         && x >= jBPaddlePosition.x + 24
						         && Math.ceil(y) <= jBPaddlePosition.y + 24
						         && x <= jBPaddlePosition.x + jBPaddleSize.width;

						paddleMissed = y < -10;
						break;
					case 'left':
						paddleHit = speed.x < 0 
						         && x >= 4
						         && y >= jBPaddlePosition.y + 24
						         && Math.ceil(x) <= jBPaddlePosition.x + 24
						         && y <= jBPaddlePosition.y + jBPaddleSize.height;

						paddleMissed = x < -10;
						break;
					case 'right':
						paddleHit = speed.x > 0
						         && y >= jBPaddlePosition.y - 24
						         && x <= jB.fieldSize.width - 8
						         && Math.ceil(x) >= jBPaddlePosition.x - 24
						         && y <= jBPaddlePosition.y + jBPaddleSize.height;

						paddleMissed = x > fieldWidth + 2;
						break;
				}

				if(paddleHit)
					return this._powerUpPaddle(jBPaddle);

				if(paddleMissed)
					this.remove();
			}
		}
	},
	_powerUpPaddle:function(jBPaddle){
		jBreak.playSound('sound/pling1s.ogg');

		this._paddle = jBPaddle;

		this._action(jBPaddle);
		this.remove();
	},
	pause:function(pause){
		this._timer = !pause;
		
		if(!pause) this._animate();
	},
	remove:function(){
		this.toggleAnimate(false);
		this.$el.fadeOut(600, function(){
			$(this).remove();
		});

		var jBBonuses = jBreak.bonuses;
		for(var i = jBBonuses.length;i--;)
			if(jBBonuses[i] === this)
				return jBBonuses.remove(i);
	},
	_interval:  30,
	_paddle:    null, // the paddle which caught this bonus
	_bad:[
		{ // shrink paddle
			background:'url(images/bonuses/shrink.png)',
			action:function(paddle){
				paddle.shrink();
			}
		},{ // ball speedup for 15 seconds
			background:'url(images/bonuses/15+speed.png)',
			action:function(){
				var ball = this._ball;

				ball.oldInterval = ball.oldInterval || ball.interval();

				ball.addTimer('speedUp15', {
					action:function(){
						this.interval(ball.oldInterval);
						delete this.oldInterval;
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
			action:function(paddle){
				paddle.$el.effect('pulsate', {times:10}, 3000);
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
			action:function(paddle){
				paddle.grow();
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
		},{ // equip paddle with a gun
			background:'yellow',
			action:function(paddle){
				$jBreakField.bind('click.jBreakBullet', function(){
					var position = paddle.getPosition()
					  , size     = paddle.size()
					;

					if(jBreak.bullets.length < 2)
						new Bullet(
							position.x + size.width  / 2,
							position.y + size.height / 2,
							-180);
				});

				paddle.addTimer('bullet', {
					action:function(){
						$jBreakField.unbind('.jBreakBullet');
					},
					timeout: 5
				});
			}
		}
	]
};
