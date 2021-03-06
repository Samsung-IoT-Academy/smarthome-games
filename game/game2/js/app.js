var Active = false;
var WinLevel = 2;
var Winners = [];
var WinnerCount = 0;
StageIndexMax = 8;
DevTypeCount = 4;

var mqtt = {
	host: "192.168.0.26",
	port: 1884,
	client: "Display"
};

DevType = {
	luminosity : 0,
	Temperature : 1,
	Accelerometer : 2,
	Proximity : 3
}
Limits = [
	10000,
	28,
	2500,
	70
];
//Limits = [50,15,50,10];
Params = [
	"luminocity",
	"temperature",
	"luminocity",
	"humidity"
]

GroupName = [
	"security",
	"robots",
	"power",
	"skynet",
	"transport"
];
Group = {
	Security : 0,
	Robots : 1,
	Power : 2,
	Skynet : 3,
	Transport : 4
};
var GroupCount = Object.keys(Group).length;



Client = undefined;
Devices = {
	"807b85902000040a": { type: DevType.luminosity, value: 0, level:0, win: false, group: Group.Security, },
	"807b85902000021c": { type: DevType.luminosity, value: 0, level:0, win: false, group: Group.Robots },
	"807b85902000035f": { type: DevType.luminosity, value: 0, level:0, win: false, group: Group.Power },
	"807b85902000040e": { type: DevType.luminosity, value: 0, level:0, win: false, group: Group.Skynet },
	"807b859020000406": { type: DevType.luminosity, value: 0, level:0, win: false, group: Group.Transport },

	"807b859020000404": { type: DevType.Temperature, value: 0, level:0, win: false, group: Group.Security },
	"807b8590200002ce": { type: DevType.Temperature, value: 0, level:0, win: false, group: Group.Robots },
	"807b85902000051d": { type: DevType.Temperature, value: 0, level:0, win: false, group: Group.Power },
	"807b85902000051a": { type: DevType.Temperature, value: 0, level:0, win: false, group: Group.Skynet },
	"807b85902000050a": { type: DevType.Temperature, value: 0, level:0, win: false, group: Group.Transport },

	"807b85902000040d": { type: DevType.Accelerometer, value: 0, level:0, win: false, group: Group.Security },
	"807b85902000049d": { type: DevType.Accelerometer, value: 0, level:0, win: false, group: Group.Robots },
	"807b85902000050b": { type: DevType.Accelerometer, value: 0, level:0, win: false, group: Group.Power },
	"807b859020000520": { type: DevType.Accelerometer, value: 0, level:0, win: false, group: Group.Skynet },
	"807b85902000035b": { type: DevType.Accelerometer, value: 0, level:0, win: false, group: Group.Transport },

	"807b859020000484": { type: DevType.Proximity, value: 0, level:0, win: false, group: Group.Security },
	"807b859020000518": { type: DevType.Proximity, value: 0, level:0, win: false, group: Group.Robots },
	"807b85902000051c": { type: DevType.Proximity, value: 0, level:0, win: false, group: Group.Power },
	"807b85902000045f": { type: DevType.Proximity, value: 0, level:0, win: false, group: Group.Skynet },
	"807b85902000036a": { type: DevType.Proximity, value: 0, level:0, win: false, group: Group.Transport }


};


function init() {
	$("body").keydown(function(event) {
		if (event.which == 84 && event.shiftKey && event.ctrlKey) {
			console.log("Test mode!");
			event.preventDefault();
			$("#test").show();
			test();
		} else if (event.which == 32 && Active === false) {
			$("#start").fadeOut(1500);
			$("#cloud0,#cloud1,#cloud2,#container2").fadeIn(1500);
			Active = true;
			event.preventDefault();
		}
	});

	for (var eui in Devices) {
		Devices[eui].eui = eui;
	}
	
	var cont = $("#container2");
	for (var name in Group) {
		var gi = Group[name];
		var g = $("<div>").addClass("group").attr("id","group_"+gi);	
		var place = $("<div>").addClass("place").attr("id","place_"+gi);
		var img = $("<img>").attr("id", "house_"+gi).attr("src", "img/house/0/0.png").addClass("house");
		g.append(place);
		g.append(img);
		g.append($("<p>").text(GroupName[gi]));
		
		var bg = $("<div>").addClass("bargroup").attr("id","bg_"+gi);
		


		for (var eui in Devices) {
			if (Devices[eui].group == gi) {
				var barcol = $("<div>").addClass("barcol").attr("id",eui);
				var bar = $("<div>").addClass("bar").attr("device",Devices[eui].type);
				for (var l = WinLevel; l > 0; l--) {
					bar.append($("<div>").addClass("barcell").addClass("bc_"+l));
				}
				var icon = $("<img>").addClass("icon").attr("src","img/icons/dev/"+Devices[eui].type+".png").attr("title", eui);
				barcol.append(bar);
				barcol.append(icon);	
				bg.append(barcol);
			}
		}
		g.append(bg);
		cont.append(g);
	}

	
}

function blinkIcon(eui) {
	$("#"+eui+" img.icon").addClass("iconq").addClass("con");
	setTimeout(function(){
		$("#"+eui+" img.icon").removeClass("iconq")
	},500);
}

function updateUI(groups) {

	for (var i = 0; i < groups.length; i++) {
		if (groups[i].stage >= DevTypeCount && Winners[i] === undefined) {
			WinnerCount++;
			Winners[i] = WinnerCount;
			$("#place_"+i).text(Winners[i]).addClass("p"+WinnerCount);
			$("#bg_"+i).hide();

			if (WinnerCount >= GroupCount) {
				$("#cloud0").fadeOut(2000).animate({top:"-35%"}, 2000);
				$("#cloud1").animate({left:"-100%"}, 2500);
				$("#cloud2").animate({left:"100%"}, 2500);
				$("#sun").animate({top:"40px"}, 1500);
			}
		}
		var imgIndex = Math.round(StageIndexMax * (groups[i].stage / DevTypeCount));
		$("#house_"+i).attr("src", "img/house/0/"+imgIndex+".png");

		for (d = 0; d < groups[i].devices.length; d++) {
			if (groups[i].devices[d].level >= WinLevel) {
				$("#"+groups[i].devices[d].eui).addClass("barfull");
			} else if (groups[i].devices[d].level == 0) {
				$("#"+groups[i].devices[d].eui+" div").removeClass("full");
			} else {	
				$("#"+groups[i].devices[d].eui+" div.bc_"+groups[i].devices[d].level).addClass("full");
			}
		}
		
	}
}

function update() {
	var groups = [];
	for (var eui in Devices) {
		if (typeof groups[Devices[eui].group] === "undefined") groups[Devices[eui].group] = {stage:0, devices:[]};
		groups[Devices[eui].group].devices[Devices[eui].type] = Devices[eui]; 
		if (Devices[eui].win === true) groups[Devices[eui].group].stage++;
	}
	updateUI(groups);
}

var testTimer = undefined;
function test() {
	function stop() {
		clearInterval(testTimer);
		testTimer = undefined;
	}
	function boom() {
		var euis = Object.keys(Devices);
		var count = euis.length;
		var index = 0;
		
		for (key in Devices) {
			if (Devices[key].win === true) index++;
		}
		
		if (index >= count) {
			return stop();
		}

		do {
			index = Math.floor(Math.random() * count);
		} while (Devices[euis[index]].win);

		var topic = "devices/lora/server";
		var dev = Devices[euis[index]];
		var msg = {data:{},status:{devEUI:dev.eui}};
		msg.data[Params[dev.type]] = Math.floor(Math.random()*Limits[dev.type]*0.4+Limits[dev.type]*0.9);

		Client.publish(topic, JSON.stringify(msg));
	}
	if (testTimer) {
		return stop();
	}
	testTimer = setInterval(boom, 1000);
}

function onConnected() {
	console.log("connected");
	Client.subscribe("devices/lora/#");
};

function onConnectionLost(responseObject) {
	console.warn("Disconnected!");
    if (responseObject.errorCode !== 0) {
	
    }
};
function onMessageArrived(message) {
   	var str = message.payloadString;
	var obj = undefined;
	var eui = "";
	console.log(str);

	if (Active === false) return;

	try {
		obj = JSON.parse(str);
		if (obj.data == undefined || obj.status == undefined) return;
		eui = obj.status.devEUI.toLowerCase();
		blinkIcon(eui);
	}
    	catch (e) {
		console.error("Not a valid JSON: " + str);
		return;
    	}

		
	try {
		if (Devices[eui].win == true) return;
	}
    	catch (e) {
		console.error("EUI is not registered: " + eui);
		return;
    	}
			
		

		var type = Devices[eui].type;
		var value = 0;

		value = obj.data[Params[type]];

		if (value >= Limits[type]) {
			if (Devices[eui].value >= Limits[type]) {
				Devices[eui].level++;
				
				if (Devices[eui].level >= WinLevel) {
					Devices[eui].win = true;
					console.log("Module " + eui + " wins!");
				}
			} else {
				Devices[eui].level = 1;
			}
		} else {
			Devices[eui].level = 0;
		}

		Devices[eui].value = value;
   		update();
	
    	if (obj.data !== undefined) {

    	}

};

$(document).ready(function(){
	init();
	console.log("Connecting");
	Client = new Paho.MQTT.Client(mqtt.host, mqtt.port, mqtt.client);
	Client.onConnectionLost = onConnectionLost;
	Client.onMessageArrived = onMessageArrived;
	Client.connect({
		onSuccess: onConnected
	});
});

/*
mosquitto_pub -h localhost -t "devices/lora/server" -m "{\"data\": {\"luminosity\": 1300,\"Address\": \"C\"},\"status\":{\"devEUI\": \"807b85902000040a\",\"rssi\": 0,\"temperature\": 0,\"battery\": 0,\"date\":\"2017-02-21T13:02:21.147555Z\"}}"
*/
