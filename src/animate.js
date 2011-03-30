function animate(self){
	var selfAngle
	  , animated
	  , $el   = self.$el
	  , pos   = self._position
	  , speed = self._speed = self._speed || {}
	;

	self.toggleAnimate = toggleAnimate;
	self.move          = move;
	self.angle         = angle;
	self.interval      = interval;

	function interval(i){
		if(i === undefined)
			return self._interval;

		self._interval = self._interval < 10 ? 10 : i;
	}

	function animate(){
		var x = pos.x + speed.x*4
		  , y = pos.y + speed.y*4
		;
	
		move(x,y)._hitCheck(~~x, ~~y);
	
		if(animated)
			setTimeout(animate, self._interval);
	}

	function toggleAnimate(a){
		animated = a;

		if(a) animate();
	}

	function move(x,y){
		$el.css({left: ~~x, top: ~~y});

		pos.x = x;
		pos.y = y;
	
		return self;
	}
	
	function angle(angle){
		if(angle === undefined)
			return selfAngle;
	
		selfAngle = angle;
		var s = angle / 360 * Math.PI;

		speed.x = Math.cos(s);
		speed.y = Math.sin(s);
	
		return self;
	}

	return self;
}
