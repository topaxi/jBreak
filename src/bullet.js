var Bullet = jBreak.Bullet = function(x,y,angle){
	this._init(x,y,angle);
}

Bullet.prototype = {
	_init:function(x,y,angle){
		var jB  = jBreak
		  , $el = this.$el = $('<div class="jBreakBullet"/>')
		;

		$jBreakField.append($el);
		jB.bullets.push(this);

		this._position = {x:x,y:y};
		this._size     = {
			width:  $el.width(),
			height: $el.height()
		};

		$el.css({left: x, top: y});

		animate(this).angle(angle).toggleAnimate(true);
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

		  , blocks  = jB.blocks
		  , block   = blocks[blockY]
		           && blocks[blockY][blockX]
		;

		if(block){
			var $block    = $('.x'+ blockX +'.y'+ blockY, $jBreakField)
			  , direction =  speed.y === -1 ? 'up'
			              :  speed.x === -1 ? 'left'
			              :  speed.x ===  1 ? 'right'
			              :/*speed.y ===  1*/ 'down'
			;

			$block.css('background-position', '0 '+ block.sprite +'px');
			$block.effect('drop', {direction:direction}, 200, function(){
				$block.remove();
			});

			delete blocks[blockY][blockX];
			jB.blockChecker();

			this.remove();
		}
	},
	remove:function(){
		this.toggleAnimate(false);
		this.$el.remove();

		var jBBullets = jBreak.bullets;
		for(var i = jBBullets.length;i--;)
			if(jBBullets[i] === this)
				return jBBullets.remove(i);
	},
	pause:     Bonus.prototype.pause,
	_interval: 15
};
