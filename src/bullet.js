jBreak.Bullet = function(x,y,angle){
	this._init(x,y,angle);
}

jBreak.Bullet.prototype = {
	_init:function(x,y,angle){
		var jB  = jBreak,
		    $el = $('<div class="jBreakBullet"/>');

		this._animate = $.proxy(animate, this);

		jB.$field.append($el);
		jB.bullets.push(this);

		this._position = {x:x,y:y};
		this._speed = {
			x:null,
			y:null
		};
		this._size = {width: 3, height: 5};

		$el.css({
			left:x,
			top:y,
			background:'#000',
			width:'3px',
			height:'5px',
			position:'absolute'
		});

		this.$el = $el;
		this.angle(angle);
		this._timer = true;
		this._animate();
	},
	_hitCheck:function(x,y){
		if(y < -10) this.remove();

		var jB      = jBreak
		  , speed   = this._speed
		  , size    = this._size
		  , bulletY = speed.y > 0 ? y + size.height : y
		  , bulletX = speed.x > 0 ? x + size.width  : x
		  , blockX  = ~~(bulletX / 40)
		  , blockY  = ~~(bulletY / 16)

		  , block   = jB.blocks[blockY]
		           && jB.blocks[blockY][blockX]
		;

		if(block){
			var $block = $('.x'+ blockX +'.y'+ blockY, jB.$field)
			  , direction =  speed.y === -1 ? 'up'
			              :  speed.x === -1 ? 'left'
			              :  speed.x ===  1 ? 'right'
			              :/*speed.y ===  1*/ 'down'
			;

			$block.css('background-position', '0 '+ block.sprite +'px');
			$block.effect('drop', {direction:direction}, 200, function(){
				$block.remove();
			});

			delete jB.blocks[blockY][blockX];
			jB.blockChecker();

			this.remove();
		}
	},
	remove:function(){
		this._timer = false;
		this.$el.remove();

		var jBBullets = jBreak.bullets;
		for(var i = jBBullets.length;i--;)
			if(jBBullets[i] === this)
				return jBBullets.remove(i);
	},
	angle:     angle,
	move:      move,
	pause:     jBreak.Bonus.prototype.pause,
	_animate:  null, // bound on runtime
	_interval: 15
};
