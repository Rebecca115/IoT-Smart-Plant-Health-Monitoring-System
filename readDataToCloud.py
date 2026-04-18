from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
import json
import time

# Configuration
client_id = "RaspberryPiTest"  # Unique client ID for your device
endpoint = "a3gmi7qdtmh3xm-ats.iot.ap-southeast-2.amazonaws.com"  # Your AWS IoT endpoint
root_ca = "/home/jeremyr/Documents/IOT Test/root-CA.crt"  # Path to your Root CA certificate
private_key = "/home/jeremyr/Documents/IOT Test/IOT-Test.private.key"  # Path to your private key
certificate = "/home/jeremyr/Documents/IOT Test/IOT-Test.cert.pem"  # Path to your device certificate
topic = "RaspberryPiAWS"  # Your topic name

# Define a callback for incoming messages
def message_callback(client, userdata, message):
    print(f"Received a new message: {message.payload.decode('utf-8')} from topic: {message.topic}")

# Initialize the MQTT client
mqtt_client = AWSIoTMQTTClient(client_id)
mqtt_client.configureEndpoint(endpoint, 8883)
mqtt_client.configureCredentials(root_ca, private_key, certificate)

# Optional: Configure MQTT client settings
mqtt_client.configureOfflinePublishQueueing(-1)  # Infinite offline publish queueing
mqtt_client.configureDrainingFrequency(2)  # Draining: 2 Hz
mqtt_client.configureConnectDisconnectTimeout(10)  # 10 seconds for connect/disconnect
mqtt_client.configureMQTTOperationTimeout(5)  # 5 seconds for each MQTT operation

def readHumidityTemperature():
    temperature = y
    humidity = x
    return temperature, humidity

def readSoilMoisture():
    soil_Moisture = z
    return soil_Moisture

def readLightLevel():
    light_Level = w
    return light_Level

def readpH():
    pH_Level = v
    return pH_Level

# Connect to AWS IoT Core
try:
    print("Connecting to AWS IoT Core...")
    mqtt_client.connect()
    print("Connected successfully!")

    # Subscribe to the topic
    print("Subscribing to the topic...")
    mqtt_client.subscribe(topic, 1, message_callback)
    print("Subscribed to topic:", topic)

    temperature, humidity = readHumidityTemperature()
    soil_Moisture = readSoilMoisture()
    light_Level = readLightLevel()
    pH_Level = readpH()

    message = {
        "Temperature": temperature,
        "Humidity": humidity,
        "Soil-Moisture": soil_Moisture,
        "Light-Level": light_Level,
        "pH-Level": pH_Level
    }

    print(f"Publishing message to topic {topic}")
    mqtt_client.publish(topic.json.dumps(message),1)
    print(f"Published: {message}")
    
    # Keep the connection alive briefly to ensure messages are handled
    time.sleep(5)

    # Disconnect after publishing
    mqtt_client.disconnect()
    print("Disconnected from AWS IoT Core.")

except Exception as e:
    print(f"Error connecting to AWS IoT Core: {e}")


