function App(ip, port, options) {
	this.Adapter = new Lumin(ip, port);
	this.ip = ip;
	this.port = port;
	this.options = {
		maxLuminocity: 120,
		initDuty: 0,
		accuracy: 5
	};
}

var Light = undefined;

var BROKER_ADDR = "192.168.1.65";
var INIT_DUTY = 0;
var LUX_MAX = 115;
var TargetLux = LUX_MAX;
var ACCURACY = 5;

var Modules = [
	{EUI: "02124b000c468107", Coef: 23.0, Display: "lightSensor0 p.label" },
	{EUI: "02124b000c468d07", Coef: 23.0, Display: "lightSensor1 p.label" }
];

var Boards = [];
var Displays = [];
var Ranges = [];

function getDuty(module, targetLux) {
	var Duty = module.OutLight < TargetLux ? Math.round(Math.pow(module.Coef*(TargetLux-module.OutLight),0.59)) : 0; 
	if (Duty > 100) Duty = 100;
	if (Duty < 0) Duty = 0;
	return Duty;
}

function RangeChanged(range, value)
{
	if (!$("#checkAuto").prop("checked")) {
		var Duty = value;
		if (Duty > 100) Duty = 100;
		if (Duty < 0) Duty = 0;	

		var r = Boards[range];
		if (r) {			
			r.SetDuty(Duty);
		}	
	}
	return true;
}

function RangeRGBChanged(range, value, color)
{
	console.log(range + " RangeRGB "+color+": "+value);
	var module = Boards[range];
	module.SetDuty(value, color);
	return true;
}

function LuminocityChanged(module, value) {
	var LastDuty = module.Duty !== undefined ? module.Duty : 0;
	var Duty = LastDuty;

	console.info("Mod: " + module.Id +"; Duty: " + LastDuty + "; Val:" + value);
	if (module.Display !== undefined) {
		module.Display.update(value);
	}

	if ($("#checkAuto").prop("checked")) {
		//REGULATE AUTOMATICALLY

		var dif = Math.abs(TargetLux - value);
		if (dif > ACCURACY) {
			Duty = getDuty(module, TargetLux);

			if (LastDuty == Duty) {
				module.OutLight = Duty > 0 ? value - Math.pow(Duty, 1.7)/module.Coef : value;
				Duty = getDuty(module, TargetLux);
			};
			
			if (Duty != LastDuty) {
				module.SetDuty(Duty);
				var r = Ranges[module.Id];
				if (r) {			
					r.setValue(Duty, true);
				}
			}
		}
	} else {

	}
}

function LevelChanged(el, value)
{
	console.log("LevelChanged: " + value);
	TargetLux = value;
	if (TargetLux < 0) TargetLux = 0;
	if (TargetLux > LUX_MAX) TargetLux = LUX_MAX;
}

function Init() {
	/********** INIT UI *********/
	Ranges[0] = new LightRange(0, $("#light0 input.w"), 0, 100, $("#light0 p.label"), $("#light0 img.icon"), RangeChanged, null);
	Ranges[1] = new LightRange(1, $("#light1 input.w"), 0, 100, $("#light1 p.label"), $("#light1 img.icon"), RangeChanged, null);

	Ranges[2] = new LightRangeRGB(0, $("#rgb0 input.r"), $("#rgb0 input.g"), $("#rgb0 input.b"), 0, 100, 
		$("#rgb0 p.r"),$("#rgb0 p.g"),$("#rgb0 p.b"), $("#rgb0 .icon"), RangeRGBChanged, null);
	Ranges[2].setValue(0,0,0);

	Ranges[3] = new LightRangeRGB(1, $("#rgb1 input.r"), $("#rgb1 input.g"), $("#rgb1 input.b"), 0, 100, 
		$("#rgb1 p.r"),$("#rgb1 p.g"),$("#rgb1 p.b"), $("#rgb1 .icon"), RangeRGBChanged, null);
	Ranges[3].setValue(0,0,0);

	var rangeLevel = new LightRange("lightLevel", $("#regulator input.level"), 0, LUX_MAX, null, null, LevelChanged, null);
	TargetLux = rangeLevel.getValue();



	var w = $(window).width(); //Ширина браузера
        var h = $(window).height(); //Высота браузера

        $("#main_img").css("height", h);
        var h_house = $("#main_img").height();
        var w_house = $("#main_img").width();
        var ico_width = w_house / 10;
        var ico_height = h_house / 8;
        var ico_center_w = w_house / 2 - ico_width / 2;
        var font_size = ico_width / 5;
        var video_width = w-w_house-640;

        if (video_width > 640)
            video_width = 640;


        $('#light1 img.icon').css({'height': ico_height});
        $('#light0 img.icon').css({'height': ico_height});
        $('#rgb1 img.icon').css({'height': ico_height});
        $('#rgb0 img.icon').css({'height': ico_height});
        $("#lightSensor1 img.icon").css({'height': ico_height});
        $('#lightSensor0 img.icon').css({'height': ico_height});
        $("#thermSensor1 img.icon").css({'height': ico_height});

       // $('#video_iframe').css({'position': 'absolute', 'left': w_house+10});

        var up_light_top = h_house/100*12;
        var down_light_top = h_house/100*50;
        var up_rgb_top = h_house/100*15;
        var down_rgb_top = h_house/100*75;
        var up_light_sensor_top = h_house/100*15;
        var down_light_sensor_top = h_house/100*60;
        var up_therm_sensor_top = h_house/100*75;

        var up_rgb_left = w_house/100*70;
        var down_rgb_left = w_house/100*70;
        var up_light_sensor_left = w_house/100*20;
        var down_light_sensor_left = w_house/100*20;
        var up_therm_sensor_left = w_house/100*20;

        $('#rgb1 .label').css({'top': font_size*3.2});
        $('#rgb0 .label').css({'top': font_size*3.2});

        $('#light1').css({'top': up_light_top, 'left': ico_center_w});
        $('#light0').css({'top': down_light_top, 'left': ico_center_w});
        $('#rgb1').css({'top': up_rgb_top, 'left': up_rgb_left});
        $('#rgb0').css({'top': down_rgb_top, 'left': down_rgb_left});
        $("#lightSensor1").css({'top': up_light_sensor_top, 'left': up_light_sensor_left});
        $('#lightSensor0').css({'top': down_light_sensor_top, 'left': down_light_sensor_left});
        $("#thermSensor").css({'top': up_therm_sensor_top, 'left': up_therm_sensor_left, 'display':'none'});

/*        var up_light_sensor_p_left = ico_width;
        var down_light_sensor_p_left = ico_width;*/
        var p_left = ico_width/100*70;
        var h_ico =  $('#light1 .icon').height();
        var p_top = -(h_ico/100*5);

        $("#lightSensor1 p.label").css({'left' : p_left, 'font-size': font_size, 'color' : "white", 'top': p_top});
        $("#lightSensor0 p.label").css({'left' : p_left, 'font-size': font_size, 'color' : "white", 'top': p_top});
        //$("#up_therm_p").css({'left' : p_left, 'font-size': font_size, 'color' : "white", 'top': p_top});
        $("#light1 p.label").css({'left' : p_left, 'font-size': font_size, 'color' : "white", 'top': p_top});
        $("#light0 p.label").css({'left' : p_left, 'font-size': font_size, 'color' : "white", 'top': p_top});
        $("#rgb1 p.r").css({'left' : p_left, 'font-size': font_size, 'color' : "red", 'margin':0, 'top': p_top*10});
        $("#rgb1 p.g").css({'left' : p_left, 'font-size': font_size, 'color' : "green", 'margin':0, 'top': p_top*5.5});
        $("#rgb1 p.b").css({'left' : p_left, 'font-size': font_size, 'color' : "blue", 'margin':0, 'top': p_top});
        $("#rgb0 p.r").css({'left' : p_left, 'font-size': font_size, 'color' : "red", 'margin':0, 'top': p_top*10});
        $("#rgb0 p.g").css({'left' : p_left, 'font-size': font_size, 'color' : "green", 'margin':0, 'top': p_top*5.5});
        $("#rgb0 p.b").css({'left' : p_left, 'font-size': font_size, 'color' : "blue", 'margin':0, 'top': p_top});

        $('.house DIV INPUT').css({'width': ico_width, 'height': h_ico/10, 'margin-top': h_ico/20});
        $('.col').css({'width': ico_width});



        var light_range_top = (ico_width / 100) * 90;
        $("#light1 .w").css({'top': light_range_top});
        $("#light0 .w").css({'top': light_range_top});
        $(".rgb-range").css({'position': 'relative', 'top': light_range_top});


	/********** INIT HARDWARE *********/
		
	Light = new Lumin(BROKER_ADDR);
	for (key in Modules) {
		var module = Light.AddModule(key, Modules[key].EUI, LuminocityChanged).SetDuty(Ranges[key].getValue());
		module.SetReportInterval(1)
		module.Coef = Modules[key].Coef;
		module.Display = new SensorDisplay($("#" + Modules[key].Display));
		Boards[key] = module;
	}
	Light.Connect(function() {
		console.log("Successfully connected");	
	});
}

$(document).ready(Init);
