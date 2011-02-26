function addTimers(obj) {
	var timers = {}
	  , interval
	;

	obj.toggleTimers = toggleTimers;
	obj.addTimer     = addTimer;
	obj.deleteTimer  = deleteTimer;
	obj.triggerTimer = triggerTimer;
	obj.getTimer     = getTimer;

	function toggleTimers(on){
		clearInterval(obj._timerIntervalID);

		if(on){
			interval = setInterval(function(){
				for(var i in timers){
					var timer = timers[i];
					timer.timeout -= .25;

					if(timer.timeout <= 0){
						timer.action.call(obj);
						deleteTimer(i);
					}
				}
			}, 250);
		}
	}

	function addTimer(name, timer){
		if(timer) timers[name] = timer
		else      timers       = name;
	}

	function deleteTimer(name){
		delete timers[name];
	}
	
	function triggerTimer(name){
		if(name){
			timers[name].action.call(obj);
			deleteTimer(name);
		}
		else {
			for(var i in timers){
				timers[i].action.call(obj);
				deleteTimer(i);
			}
		}
	}

	function getTimer(name){
		return name ? timers[name] : timers;
	}
}
