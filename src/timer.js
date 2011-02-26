function addTimers(obj) {
	var timers = {},
	    interval;

	obj.toggleTimers = toggleTimers;
	obj.addTimer     = addTimer;
	obj.deleteTimer  = deleteTimer;

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
		timers[name] = timer;
	}

	function deleteTimer(name){
		delete timers[name];
	}
	
	function triggerTimer(name){
		timers[name].action.call(obj);
		deleteTimer(name);
	}
}
