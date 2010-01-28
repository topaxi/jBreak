function animate(){
	var x = this._position.x + this._speed.x*4,
	    y = this._position.y + this._speed.y*4;

	this.move(x,y)._hitCheck(x,y);

	if(this._timer)
		setTimeout(this._animate, this._interval);
}

function move(x,y){
	this.$el.css({left:x, top:y});
	this._position = {x:x,y:y};

	return this;
}

function angle(angle){
	if(angle === undefined)
		return this._angle;

	this._angle = angle;
	var speed = angle / 360 * Math.PI;
	this._speed.x = Math.cos(speed);
	this._speed.y = Math.sin(speed);

	return this;
}
