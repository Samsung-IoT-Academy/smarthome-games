var Light = undefined;

var BROKER_ADDR = "192.168.1.65";
var INIT_DUTY = 0;
var LUX_MAX = 115;
var TargetLux = LUX_MAX;
var ACCURACY = 5;

var Modules = [
	{EUI: "02124b000c468107", Coef: 23.0, Display: "down_light_sensor_p" },
	{EUI: "02124b000c468d07", Coef: 23.0, Display: "up_light_sensor_p" }
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
	if (Displays[module.Display] !== undefined) {
		Displays[module.Display].update(value);
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
	Ranges[0] = new LightRange(0, "down_light_range", 0, 100, "down_light_p", "down_light_ico", RangeChanged, null);
	Ranges[1] = new LightRange(1, "up_light_range", 0, 100, "up_light_p", "up_light_ico", RangeChanged, null);

	Ranges[2] = new LightRangeRGB(0, "down_rgb_r_range","down_rgb_g_range","down_rgb_b_range", 0, 100, 
		"down_rgb_r_p","down_rgb_g_p","down_rgb_b_p", "down_rgb_ico", RangeRGBChanged, null);
	Ranges[2].setValue(0,0,0);

	Ranges[3] = new LightRangeRGB(1, "up_rgb_r_range","up_rgb_g_range","up_rgb_b_range", 0, 100, 
		"up_rgb_r_p","up_rgb_g_p","up_rgb_b_p", "up_rgb_ico", RangeRGBChanged, null);
	Ranges[3].setValue(0,0,0);

	var rangeLevel = new LightRange("lightLevel", "user_want_range", 0, LUX_MAX, null, null, LevelChanged, null);
	TargetLux = rangeLevel.getValue();

	for (key in Modules) {
		var disp = Modules[key].Display;
		if (typeof disp == "string") {
			Displays[disp] = new SensorDisplay(disp, disp);	
		}
	}





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


        $('#up_light_ico').css({'height': ico_height});
        $('#down_light_ico').css({'height': ico_height});
        $('#up_rgb_ico').css({'height': ico_height});
        $('#down_rgb_ico').css({'height': ico_height});
        $("#up_light_sensor_ico").css({'height': ico_height});
        $('#down_light_sensor_ico').css({'height': ico_height});
        $("#up_therm_sensor_ico").css({'height': ico_height});

        $('#video_iframe').css({'position': 'absolute', 'left': w_house+10});

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

        $('#up_rgb_p_div').css({'top': font_size*3.2});
        $('#down_rgb_p_div').css({'top': font_size*3.2});

        $('#up_light').css({'top': up_light_top, 'left': ico_center_w});
        $('#down_light').css({'top': down_light_top, 'left': ico_center_w});
        $('#up_rgb').css({'top': up_rgb_top, 'left': up_rgb_left});
        $('#down_rgb').css({'top': down_rgb_top, 'left': down_rgb_left});
        $("#up_light_sensor").css({'top': up_light_sensor_top, 'left': up_light_sensor_left});
        $('#down_light_sensor').css({'top': down_light_sensor_top, 'left': down_light_sensor_left});
        $("#up_therm_sensor").css({'top': up_therm_sensor_top, 'left': up_therm_sensor_left, 'display':'none'});

/*        var up_light_sensor_p_left = ico_width;
        var down_light_sensor_p_left = ico_width;*/
        var p_left = ico_width/100*70;
        var h_ico =  $('#up_light_ico').height();
        var p_top = -(h_ico/100*5);

        $("#up_light_sensor_p").css({'left' : p_left, 'font-size': font_size, 'color' : "white", 'top': p_top});
        $("#down_light_sensor_p").css({'left' : p_left, 'font-size': font_size, 'color' : "white", 'top': p_top});
        $("#up_therm_p").css({'left' : p_left, 'font-size': font_size, 'color' : "white", 'top': p_top});
        $("#up_light_p").css({'left' : p_left, 'font-size': font_size, 'color' : "white", 'top': p_top});
        $("#down_light_p").css({'left' : p_left, 'font-size': font_size, 'color' : "white", 'top': p_top});
        $("#up_rgb_r_p").css({'left' : p_left, 'font-size': font_size, 'color' : "red", 'margin':0, 'top': p_top*10});
        $("#up_rgb_g_p").css({'left' : p_left, 'font-size': font_size, 'color' : "green", 'margin':0, 'top': p_top*5.5});
        $("#up_rgb_b_p").css({'left' : p_left, 'font-size': font_size, 'color' : "blue", 'margin':0, 'top': p_top});
        $("#down_rgb_r_p").css({'left' : p_left, 'font-size': font_size, 'color' : "red", 'margin':0, 'top': p_top*10});
        $("#down_rgb_g_p").css({'left' : p_left, 'font-size': font_size, 'color' : "green", 'margin':0, 'top': p_top*5.5});
        $("#down_rgb_b_p").css({'left' : p_left, 'font-size': font_size, 'color' : "blue", 'margin':0, 'top': p_top});

        $('.house DIV INPUT').css({'width': ico_width, 'height': h_ico/10, 'margin-top': h_ico/20});
        $('.col').css({'width': ico_width});



        var light_range_top = (ico_width / 100) * 90;
        $("#up_light_range").css({'top': light_range_top});
        $("#down_light_range").css({'top': light_range_top});
        $(".rgb-range").css({'position': 'relative', 'top': light_range_top});


	/********** INIT HARDWARE *********/
		
	Light = new Lumin(BROKER_ADDR);
	for (key in Modules) {
		var module = Light.AddModule(key, Modules[key].EUI, LuminocityChanged).SetDuty(Ranges[key].getValue());
		module.SetReportInterval(1)
		module.Coef = Modules[key].Coef;
		module.Display = Modules[key].Display;
		Boards[key] = module;
	}
	Light.Connect(function() {
		console.log("Successfully connected");	
	});
}

$(document).ready(Init);
