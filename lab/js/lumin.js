function LightModule(id, eui, onChanged)
{
	var $this = this;
	var waitingForSensor = false;
	var timerTimeout = undefined;
	var _onChanged = typeof onChanged == "function" ? onChanged : undefined;

	this.EUI = eui;
	this.Id = id;
	this.Duty = undefined;
	this.Coef = 1;
	this.OutLight = 0;
	this.Changed = function(value) {
		if (_onChanged !== undefined) _onChanged($this, value);
	}
	this.GetLuminocity = function() {
		//TODO: Implement synchronous luminocity request
	};
	this.SetDuty = function(){};
	this.SetReportInterval = function(){};

};

function Lumin(ip, port, options)
{
	var $this = this;
	var timerQueue = undefined;
	var Client;
	var Message;
	var Queue = new Array();
	var Debug = false;

	$this.Modules = [];
	$this.Devices = {
		Sensor: "/mosi/opt3001",
		PWM: "/mosi/pwm"
	}
	$this.Options = {
		QueueInterval: 500,
		InitialDuty: 0,
		ReportInterval: 1
	};

	$this._pwmPin = {R: "01", G: "02", B: "03", W: "04"};

	$this.BrokerIP = "127.0.0.1",
	$this.BrokerPort = 1884,
	$this.ClientID = "kdf",
	$this.Network = "devices/6lowpan/"

	$this.onLuminocityUpdate = undefined;

	$this.AddModule = function(id, eui, onChanged) {
	
		var module = new LightModule(id, eui, onChanged);
		module.Id = id;
		module.SetDuty = function(value, color = "W") {
			module.Duty = value;
			module.Skip = true;
			$this.SetDuty(eui, value, color);
			return module;
		}
		module.SetReportInterval = function(value) {
			$this.SetReportInterval(eui, value);
			return module;
		}
		$this.Modules.push(module);
		return module;
	};


	$this.Connect = function(onSuccess, onError) {
	    if (Client === undefined) {
		_log("Connecting...");
		Client = new Paho.MQTT.Client(
			$this.BrokerIP, 
			$this.BrokerPort, 
			$this.ClientID);
		Client.onConnectionLost = _onConnectionLost;
		Client.onMessageArrived = _onMessageArrived;
		Client.connect({
			mqttVersion: 3,
			onSuccess: function() {
				_onConnected(); 
				if (typeof onSuccess === "function") onSuccess();
			},
			//onSuccess: $this._onConnected,
			onFailure: function() {
				if (typeof onError === "function") onError();
			}
		});
	    }
	    else 
		_warn("Connection is already open");
	};

	$this.SetDuty = function(eui, value, color = "W") {
		_pushMessage(
			$this.Network + 
			eui + 
			$this.Devices.PWM, 
			"set freq 1000 dev 01 on ch "+ $this._pwmPin[color] +" duty " + value);
	};

	$this.SetReportInterval = function(eui, value) {
		$this.Options.ReportInterval = value;
		_pushMessage(
			$this.Network + 
			eui + 
			$this.Devices.Sensor, 
			"set_period " + value);
	};

	$this.Debug = function(on) {
		Debug = on;
	}

	/***************/
	if (ip) 
		$this.BrokerIP = ip;
	if (port)
		$this.BrokerPort = port;
	if (options)
		for (key in options) {
			if ($this.Options[key] !== undefined) {
				$this.Options[key] = options[key];;
			}
		}

	/***************/

	_log = function(msg) {
		if (Debug) console.log(msg);
	};
	_error = function(msg) {
		if (Debug) console.error(msg);
	};
	_warn = function(msg) {
		if (Debug) console.warn(msg);
	};
	

	function _init() {
		for (key in $this.Modules) {
	       		var path = $this.Network + $this.Modules[key].EUI + "/miso/#";
			_log("Subscribing to: " + path);
			Client.subscribe(path, {qos: 0});
	    	}
		timerQueue = setInterval(_queueSend, $this.Options.QueueInterval);
	};


	function _onConnected() {
	    	_log("onConnected");
	    	_init();
	};

	function _onConnectionLost(responseObject) {
	    if (responseObject.errorCode !== 0) {
		_log("onConnectionLost:" + responseObject.errorMessage);
		clearInterval(timerQueue);
	    }
	};
	function _onMessageArrived(message) {
	   	var str = message.payloadString;
	    	_log("onMessageArrived:" + str);
	    
		try {
			obj = JSON.parse(str);
	   	}
	    	catch (e) {
			console.error("Not a valid JSON: " + str);
			return;
	    	}
		
	    	if (obj.data !== undefined) {
			var sensorData = 0;
			if (obj.data.luminocity !== undefined) {
		    		sensorData = obj.data.luminocity
			}

			if (obj.status.devEUI !== undefined) {
		    		devEUI = obj.status.devEUI;
				for (key in $this.Modules) {
					if (devEUI == $this.Modules[key].EUI) {
						if ($this.Modules[key].Skip == false) {
							$this.Modules[key].Changed(sensorData);
						} else $this.Modules[key].Skip = false;
						//if (typeof $this.onLuminocityUpdate === "function") $this.onLuminocityUpdate(key, sensorData);
						break;
					}
				}
			}
	    	}

	};

	function _sendMessage(destination, text) {
	    if (Client !== null) {

		var Message = new Paho.MQTT.Message(text);
		Message.destinationName = destination;
		Client.send(Message);
		delete message;
		
		_log("Sent message <" + text + "> to <" + destination + ">");
	    }
	    else 
		_error("Client is not connected!");
	}

	function _queueSend() {
		var msg = Queue.shift();

		if (msg !== undefined) {
			_sendMessage(msg.topic, msg.text);
		}
	}
	
	function _pushMessage(topic, text) {
		Queue.push({topic: topic, text: text});
	}


	
}
