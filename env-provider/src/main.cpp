#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <AHT10.h>

#define AHT_PWR D8

AHT10 aht(AHT10_ADDRESS_0X38);

void blinkLed(uint8_t pin, bool* pOn, long duration) {
  *pOn = !(*pOn);
  digitalWrite(pin, *pOn ? LOW : HIGH);
  delay(duration);
}

void connectAht() {
  // power on AHT
  digitalWrite(AHT_PWR, HIGH);
  // init AHT
  bool on = false;
  pinMode(LED_BUILTIN, OUTPUT);
  while (!aht.begin()) {
    blinkLed(LED_BUILTIN, &on, 100);
  }
  digitalWrite(LED_BUILTIN, HIGH);
}

void connectWifi() {
  bool on = false;
  pinMode(LED_BUILTIN, OUTPUT);

  WiFi.begin("ssid", "password");

  while (WiFi.status() != WL_CONNECTED)
  {
    blinkLed(LED_BUILTIN, &on, 500);
  }

  digitalWrite(LED_BUILTIN, HIGH);
}

void getEnvValues(float* temperature, float* humidity) {
  digitalWrite(AHT_PWR, HIGH);
  uint8_t status = aht.readRawData();
  if (status == AHT10_ERROR) {
    bool on = false;
    while (true) {
      blinkLed(LED_BUILTIN, &on, 200);
    }
  }
  *temperature = aht.readTemperature(AHT10_USE_READ_DATA);
  *humidity = aht.readHumidity(AHT10_USE_READ_DATA);
}

void sendValues(float* temperature, float* humidity) {
  WiFiClient client;
  HTTPClient http;
  if (http.begin(client, "192.168.1.4", 7654, "/new")) {
    String payload = String("{\"id\":") + 0 + ",\"temperature\":" + *temperature + ",\"humidity\":" + *humidity + "}\n";
    http.POST(payload);
  }
  http.end();
  client.stop();
}

void setup() {
  pinMode(AHT_PWR, OUTPUT);
  digitalWrite(AHT_PWR, LOW);
  connectAht();
}

void loop() {
  while (WiFi.status() != WL_CONNECTED) {
    connectWifi();
  }
  float temperature;
  float humidity;
  getEnvValues(&temperature, &humidity);
  sendValues(&temperature, &humidity);
  WiFi.disconnect();
  digitalWrite(AHT_PWR, LOW);
  ESP.deepSleep(6000000);
  // delay(6000);
}