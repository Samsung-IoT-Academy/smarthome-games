#!/usr/bin/python
# coding: utf-8
import paho.mqtt.client as mqtt
import paho.mqtt.publish as publish
import zlib
import time

execfile("Topics.py")

MOSQSRV = "192.168.0.26"
MOSQPRT = 1883

# The callback for when the client receives a CONNACK response from the server.
# def on_connect( client, userdata, rc, a ):
def attack():
	global TOPICS
	# print("Connected with result code " + str(rc))
	
	for cat in TOPICS:
		for topic in TOPICS[cat]:
			topicName = cat + '/' + topic
			code = format(zlib.crc32(topicName) % (1<<32), '02x')
			print "►", topicName, ": ", code
			publish.single(topicName, str(code), 0, False, MOSQSRV, MOSQPRT, "MassiveAttack", 60)
			time.sleep(1)


client = mqtt.Client()
#client.on_connect = on_connect
#client.connect(MOSQSRV, MOSQPRT, 60) 

attack()


