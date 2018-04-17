var network_prefix="devices/6lowpan/"

var module_eui_list = [
	"02124B000C468107", // lamp on the first floor 	
	"02124b000c468d07"  // lamp on the second floor
	]

var client;
var message;

var BROKER_ADDRESS = "192.168.1.65"; //if connected by ethernet, then it will be "106.109.128.213" or something like that
var BROKER_PORT = 1884;
var CLIENT_ID = "tatyana_volkova";
function start_connection() {
	if(client===undefined) {
		client = new Paho.MQTT.Client(BROKER_ADDRESS, BROKER_PORT, CLIENT_ID);
		client.onConnectionLost = onConnectionLost;
		client.onMessageArrived = onMessageArrived;
		client.connect({onSuccess:onConnect});	
	}	
	else
		alert("Connection is already open");
}

function onConnect() {
  // Once a connection has been made, make a subscription
  console.log("onConnect");

  module_eui_list.forEach(function(module_eui) {
	subscription_path = network_prefix + module_eui + "/miso/#"
  	console.log("Subscribing to: " + subscription_path);
  	client.subscribe(subscription_path);
  })

};

function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
	console.log("onConnectionLost:"+responseObject.errorMessage);
  }
};

function onMessageArrived(message) {
  var str = message.payloadString;
  console.log("onMessageArrived:"+str);
  try {
	  obj = JSON.parse(str);
  } 
  catch (e) {
	  console.log("Not a valid JSON: " + str);
	  return;
  }

  if(obj.data!==undefined) {
	  var sensorData=0;
	  var element_id = "null"
	  if(obj.data.luminocity!==undefined) {
	  	sensorData=obj.data.luminocity
		console.log("Luminosity: " + sensorData.toString());
	  }
		
	  if(obj.status.devEUI!==undefined) {
		module_eui = obj.status.devEUI;
		console.log("Module EUI: " + module_eui.toString());
		if (module_eui==module_eui_list[0]) //can be refactored
			element_id = "luminocity_string_0";
		else if (module_eui==module_eui_list[1])
			element_id = "luminocity_string_1";
		if (element_id!="null")			
			document.getElementById(element_id).innerHTML = sensorData;

		//!!! automatic regulation of light
		//regulate(module_eui, sensorData);
	  }

	  	 
  }
};

function send_message(destination, text) {
	if(client !== null) {
		var message = new Paho.MQTT.Message(text);
		message.destinationName = destination;
		client.send(message);
		console.log("Sent message " + text + " to " + destination);	
	}
	else	
		alert("Client is not connected!");
}

//module number is 0 or 1
//level is number from 0 (darkest) to 100 (lightest)
function set_light_level(module_number, level) {
	console.log("set_light_level = " + module_number + " = " + level);
	if (module_number<module_eui_list.length) {
	console.log("set_light_level true = " + module_number + " = " + level);
		sending_path = network_prefix + module_eui_list[module_number] + "/mosi/pwm";
		send_message(sending_path, "set freq 1000 dev 01 on ch 04 duty " + level);
	}	
}

function ask_luminocity(module_number) {
	if (module_number<module_eui_list.length) {
		sending_path = network_prefix + module_eui_list[module_number] + "/mosi/opt3001";
		send_message(sending_path, "get");
	}
}	


window.onload = function() {
	start_connection();
}

function refresh_all() {
	ask_luminocity(0);
	ask_luminocity(1);
}

function light_on_0() {
	set_light_level(0,100);
}

function light_off_0() {
	set_light_level(0,0);
}

function light_on_1() {
	set_light_level(1,100);
}

function light_off_1() {
	set_light_level(1,0);
}

var MAXLUM = 350;
var LUMPREV = 0;
var MAXDUTY = 20;

//if I receive a new light level, I change PWM
function regulate(module_eui, light_level) {

        if (light_level > MAXLUM) {
            light_level = MAXLUM;
	}

        if (Math.abs(LUMPREV - light_level)<5) {
            return;
	}

        LUMPREV = light_level;

        duty = Math.round((1.0 - light_level/MAXLUM) * MAXDUTY)

        console.log("Luminocity: " + light_level);
        console.log("Duty: " + duty);
        client.send(network_prefix + module_eui + "/mosi/pwm", "set freq 1000 dev 01 on ch 04 duty " + duty);
}

var sun_level = 0;
var sun_dir = 1;
var speed_coeff = 5;
var max_level = 80;
var min_level = 0;
var dutyStepCount = 5;
var dutyStep = Math.ceil(max_level / (dutyStepCount - 1));

function set_sun() {	
/*
	if(sun_level==min_level)
	sun_dir = 1;
	if(sun_level==max_level)
	sun_dir = -1;

	sun_level+=sun_dir*speed_coeff;
*/
	sun_level = (sun_level + dutyStep);
	if (sun_level > max_level) sun_level = 0;
	//dutyIndex = (dutyIndex+1) % max_level;

	sending_path = "devices/6lowpan/02124B000C467985/mosi/pwm";
	send_message(sending_path, "set freq 1000 dev 01 on ch 01 duty " + sun_level);	
}
	

var timerSun = setInterval(set_sun, 4000);

/*
var light_level_max = 235;
function adjust_light(target_light_level) {

    //user clicks on which light level he wants to keep
    if (target_light_level > light_level_max)
    target_light_level = light_level_max
    if (target_light_level<0)
    target_light_level = 0

    var percentage = target_light_level / light_level_max;
    var duty = Math.round(Math.pow((-10.0/3.0) * Math.log(1.0 - percentage), 5.0/3.0));
  
    if(duty > 100)
    duty=100;
    if(duty<0)
    duty=0;

    //set this duty on both devices
    set_light_level(0, duty);
   setTimeout(function () {
	set_light_level(1, duty)
	}, 1000);

  return duty;
  }

*/
