<?php
function block($value = 0, $theme = null){
	if($theme != null && $value > 0){
		return array('value' => $value, 'theme' => $theme);
	} else {
		return 0;
	}
}

$themes = array('Blue', 'Blue_purpled', 'Gray', 'Green_greener', 'Green_Yellowish_Light',
	'Orange', 'Purple_bluish', 'Purple_gay', 'Purple_haze', 'Red_fire',
	'Turkoise_2', 'Turkoise_3', 'Turkoise_greenisch', 'Yellow'
);

$level[0]['name'] = 'Level 1';
$level[0]['paddles'] = array(array('position' => 'bottom', 'ball' => true));
$pB = block(1, 'Purple_bluish');
$level[0]['blocks'] = array(
	array(),
	array(),
	array(),
	array(),
	array(0, 0, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB),
	array(0, 0, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB),
	array(0, 0, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB),
	array(0, 0, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB),
	array(0, 0, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB),
	array(0, 0, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB),
	array(0, 0, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB),
	array(0, 0, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB)
);

$level[1]['name'] = 'Rainbow';
$level[1]['paddles'] = array(array('position' => 'bottom', 'ball' => true));
$r = block(1, 'Red_fire');
$o = block(1, 'Orange');
$y = block(1, 'Yellow');
$g = block(1, 'Green_greener');
$b = block(1, 'Blue');
$pG = block(1, 'Purple_gay');
$level[1]['blocks'] = array(
	array($r, $r, $r, $r, $r, $r, $r, $r, $r, $r, $r, $r, $r, $r, $r, $r),
	array($r, $r, $r, $r, $r, $r, $r, $r, $r, $r, $r, $r, $r, $r, $r, $r),
	array($o, $o, $o, $o, $o, $o, $o, $o, $o, $o, $o, $o, $o, $o, $o, $o),
	array($o, $o, $o, $o, $o, $o, $o, $o, $o, $o, $o, $o, $o, $o, $o, $o),
	array($y, $y, $y, $y, $y, $y, $y, $y, $y, $y, $y, $y, $y, $y, $y, $y),
	array($y, $y, $y, $y, $y, $y, $y, $y, $y, $y, $y, $y, $y, $y, $y, $y),
	array($g, $g, $g, $g, $g, $g, $g, $g, $g, $g, $g, $g, $g, $g, $g, $g),
	array($g, $g, $g, $g, $g, $g, $g, $g, $g, $g, $g, $g, $g, $g, $g, $g),
	array($b, $b, $b, $b, $b, $b, $b, $b, $b, $b, $b, $b, $b, $b, $b, $b),
	array($b, $b, $b, $b, $b, $b, $b, $b, $b, $b, $b, $b, $b, $b, $b, $b),
	array($pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB),
	array($pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB, $pB),
	array($pG, $pG, $pG, $pG, $pG, $pG, $pG, $pG, $pG, $pG, $pG, $pG, $pG, $pG, $pG, $pG),
	array($pG, $pG, $pG, $pG, $pG, $pG, $pG, $pG, $pG, $pG, $pG, $pG, $pG, $pG, $pG, $pG)
);

$level[2]['name'] = 'Chaos';
$level[2]['paddles'] = array(
	array('position' => 'bottom', 'ball' => true),
	array('position' => 'top', 'ball' => false)
);
$level[2]['blocks'] = array(
	array(),
	array(),
	array(),
	array(),
	array(block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)])),
	array(block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)])),
	array(block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)])),
	array(block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)])),
	array(block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)])),
	array(block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)])),
	array(block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)])),
	array(block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)])),
	array(block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]), block(2, $themes[array_rand($themes)]))
);

$return = array(
	'error' => false,
	'message' => $level[$_GET['levelID']]
);

header('Content-type: application/x-json');
echo json_encode($return);
