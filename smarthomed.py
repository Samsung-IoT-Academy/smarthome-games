#!/usr/bin/python
# coding: utf-8
import paho.mqtt.client as mqtt
import json
import time
import threading

MOSQSRV = "192.168.1.65"
MOSQPRT = 1883
TOPIC_REQUEST = "devices/6lowpan/script/request"
TOPIC_REPLY = "devices/6lowpan/script/reply"
PWM_CHANNEL = {'r':'01', 'g':'02', 'b':'03', 'w':'04'}

ACCURACY = 5
REPORT_INTERVAL = 1

EUIs = ["02124b000c468107", "02124b000c468d07"]
Modules = {}
Queue = []

Config = {}
Config['auto'] = 1
Config['connected'] = 0
Config['level'] = 100

for eui in EUIs:
	Modules[eui] = {'eui': eui,'lastDuty': 0, 'lastLux': 0, 'coef': 23.0, 'I': False, 'rgb': {'r':0,'g':0,'b':0}}

def setInterval(func, sec):
	def func_wrapper():
		setInterval(func, sec) 
		func()  
	t = threading.Timer(sec, func_wrapper)
	t.start()
	return t

def calc_duty( module, targetLux ):
	if module['lastLux'] < targetLux:
		duty = round(pow(module['coef'] * (targetLux - module['lastLux']), 0.59))
	else:
		duty = 0
	if duty > 100: duty = 100
	if duty < 0: duty = 0
	return int(round(duty))

def add_message( topic, msg ):
	Queue.append( {'t': topic, 'm': msg} )
	
def set_duty_rgb( module, value, color ):
	topic = "devices/6lowpan/" + module['eui'] + "/mosi/pwm" 
	msg = "set freq 1000 dev 01 on ch "+PWM_CHANNEL[color]+" duty " + str(value)
	module['rgb'][color] = value
	add_message(topic, msg)
	
def set_duty( module, value ):
	topic = "devices/6lowpan/" + module['eui'] + "/mosi/pwm" 
	msg = "set freq 1000 dev 01 on ch "+PWM_CHANNEL['w']+" duty " + str(value)
	module['lastDuty'] = value
	#client.publish( topic, msg )
	add_message(topic, msg)

def set_period( module, value ):
	topic = "devices/6lowpan/" + module['eui'] + "/mosi/opt3001" 
	msg = "set_period " + str(value)
	#client.publish( topic, msg )
	add_message(topic, msg)

def regulate( eui, currentLux, targetLux):
	module = Modules[eui]
	lastDuty = module['lastDuty']
	duty = lastDuty;

	dif = abs(targetLux - currentLux)
	if dif > ACCURACY:
		duty = calc_duty(module, targetLux)
		
		if lastDuty == duty:
			if duty > 0: 
				module['lastLux'] = int(round(currentLux - pow(duty, 1.7) / module['coef']))
			else:
				module['lastLux'] = int(currentLux)
	
			duty = calc_duty(module, targetLux)
		
		if duty != lastDuty:
			print "Set duty: ", str(currentLux), str(targetLux), str(duty)
			set_duty( module, duty )

def send_message():
	global client
	global Queue
	global Config
	if Config['connected'] and len(Queue) > 0:
		o = Queue.pop(0)
		print "Sending: ", o['t'], o['m'] 
		client.publish( o['t'], o['m'] )

def on_connect( client, userdata, rc, a ):
	global Config	
	print("Connected with result code " + str(rc))
	Config['connected'] = 1
	client.subscribe(TOPIC_REQUEST)
	for eui in EUIs:
		client.subscribe("devices/6lowpan/"+ eui +"/miso/#")

def on_disconnect( client, userdata, rc ):
	global Config
	print("Disconnected")
	Config['connected'] = 0
	for eui in EUIs:
		Modules[eui]['I'] = False
def send_reply( reply ):
	global Client
	if reply.has_key('id'):
		client.publish( TOPIC_REPLY + "/" + str(reply['id']), json.dumps(reply) )
	else:	
		client.publish( TOPIC_REPLY, json.dumps(reply) )

def on_message( client, userdata, msg ):
	global Config
    	try:
		data = json.loads(str(msg.payload))
		if msg.topic == TOPIC_REQUEST:
			method = str(data['method'])
			reply = {}
			if data.has_key('id'):
				reply['id'] = data['id']

			if method == "get":
				reply['modules'] = Modules
				reply['config'] = Config
				reply['result'] = "ok"
				send_reply(reply )
				return
			elif method == "set":
				eui = ""
				try:
					eui = data['module']
				except:
					reply['result'] = "error"
					reply['error'] = "Please, set module EUI"
					send_reply(reply)
					return
				if not Modules.has_key(eui):
					reply['result'] = "error"
					reply['error'] = "Wrong module EUI"
					send_reply(reply)
					return
				try:
					if len(data['data']) == 0:
						raise ValueError
					for key in data['data']:
						if key == 'duty':
							if Config['auto']:
								reply['result'] = "error"
								reply['error'] = "Turn auto regulation OFF to set duty manually"
								send_reply(reply)
								return
							value = int(round(data['data']['duty']))
							set_duty( Modules[eui], value )
						elif key == 'rgb':
							for color in data['data']['rgb']:
								value = int(round(data['data']['rgb'][color]))
								set_duty_rgb( Modules[eui], value, color )
						reply['result'] = "ok"
						send_reply(reply)
				except:
					reply['result'] = "error"
					reply['error'] = "Data field error"
					send_reply(reply)
			elif method == "config":
				try:
					if len(data['data']) == 0:
						raise ValueError
					for key in data['data']:
						if key == 'auto':
							Config['auto'] = int(data['data']['auto'])
						if key == 'level':
							Config['level'] = int(data['data']['level'])
					reply['result'] = "ok"
					send_reply(reply)
				except:
					reply['result'] = "error"
					reply['error'] = "Data field error"
					send_reply(reply)
		else:
			luminocity = data['data']['luminocity']
			eui = data['status']['devEUI']
			if not Modules[eui]['I']:		
				set_period(Modules[eui], 2)
				set_duty(Modules[eui], 0)
				Modules[eui]['I'] = True
			if Config['auto']:
				regulate( eui, luminocity, Config['level'] )
					
	except (ValueError, KeyError, TypeError):
		ValueError


client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.on_disconnect = on_disconnect

setInterval(send_message, 0.5)

client.connect(MOSQSRV, MOSQPRT, 60) 

client.loop_forever()
