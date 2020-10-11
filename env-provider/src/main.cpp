#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <AHT10.h>

/* definition to expand macro then apply to pragma message */
#define DO_QUOTE(x) #x
#define QUOTE(x) DO_QUOTE(x)
#define VAR_NAME_VALUE(var) #var "="  QUOTE(var)

#if !defined(WIFI_SSID)
#error WIFI_SSID must be defined! 
#endif
#if !defined(WIFI_PASS)
#error WIFI_PASS must be defined! 
#endif
#if !defined(SERVER_HOST)
#error SERVER_HOST must be defined! 
#endif
#if !defined(SERVER_PORT)
#error SERVER_PORT must be defined! 
#endif

// print env var while compiling
#pragma message(VAR_NAME_VALUE(WIFI_SSID))
#pragma message(VAR_NAME_VALUE(WIFI_PASS))
#pragma message(VAR_NAME_VALUE(SERVER_HOST))
#pragma message(VAR_NAME_VALUE(SERVER_PORT))

#define INTERVAL  120000000
#define AHT_PWR   D8

ADC_MODE(ADC_VCC);

AHT10 aht(AHT10_ADDRESS_0X38);
uint8_t deviceId = 0;

void blinkLed(uint8_t pin, bool* pOn, long duration) {
  *pOn = !(*pOn);
  digitalWrite(pin, *pOn ? LOW : HIGH);
  delay(duration);
}

uint8_t getDeviceId() {
  uint8_t readPins[] = {D7, D6, D5};
  int len = sizeof(readPins) / sizeof(uint8_t);
  pinMode(D3, OUTPUT);
  for (int i = 0; i < len; i++) {
    pinMode(readPins[i], INPUT);
  }
  digitalWrite(D3, HIGH);
  delay(1);
  uint8_t id = 0;
  for (int i = 0; i < len; i++) {
    id <<= 1;
    id |= digitalRead(readPins[i]);
  }
  digitalWrite(D3, LOW);
  return id;
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

  WiFi.begin(QUOTE(WIFI_SSID), QUOTE(WIFI_PASS));

  while (WiFi.status() != WL_CONNECTED)
  {
    blinkLed(LED_BUILTIN, &on, 200);
  }

  digitalWrite(LED_BUILTIN, HIGH);
}

bool getEnvValues(float* temperature, float* humidity) {
  digitalWrite(AHT_PWR, HIGH);
  uint8_t status = aht.readRawData();
  if (status != AHT10_ERROR) {
    *temperature = aht.readTemperature(AHT10_USE_READ_DATA);
    *humidity = aht.readHumidity(AHT10_USE_READ_DATA);
  }
  return status != AHT10_ERROR;
}

bool post(const char* url, String& payload) {
  WiFiClient client;
  HTTPClient http;

  int httpCode = 0;
  if (http.begin(client, QUOTE(SERVER_HOST), SERVER_PORT, url)) {
    http.addHeader("Content-Type", "application/json");
    httpCode = http.POST(payload);
  }
  http.end();
  client.stop();
#ifdef ERROR_NOTIFY_LED
  if (httpCode != HTTP_CODE_OK) {
    bool on = false;
    for (int i = 0; i < 20; i++) {
      blinkLed(LED_BUILTIN, &on, 50);
    }
    delay(200);
  }
#endif
  return httpCode == HTTP_CODE_OK;
}

bool sendValues(float* temperature, float* humidity) {
  String payload = String("{\"id\":") + deviceId + ",\"temperature\":" + *temperature + ",\"humidity\":" + *humidity + "}\n";
  return post("/api/new", payload);
}

bool sendVoltage(uint16_t voltage) {
  String payload = String("{\"id\":") + deviceId + ",\"vcc\":" + voltage + "}\n";
  return post("/api/vcc", payload);
}

bool sendError(const char* message) {
  String payload = String("{\"id\":") + deviceId + ",\"error\":\"" + message + "\"}";
  return post("/api/error", payload);
}

void setup() {
  pinMode(AHT_PWR, OUTPUT);
  digitalWrite(AHT_PWR, LOW);
  deviceId = getDeviceId();
  connectAht();
}

void loop() {
  uint64_t start = micros64();
  while (WiFi.status() != WL_CONNECTED) {
    connectWifi();
  }
  float temperature = 0;
  float humidity = 0;
  if (getEnvValues(&temperature, &humidity)) {
    sendValues(&temperature, &humidity);
  } else {
    sendError("Sensor Error!");
#ifdef ERROR_NOTIFY_LED
    bool on = false;
    for (int i = 0; i < 10; i++) {
      blinkLed(LED_BUILTIN, &on, 100);
    }
    delay(500);
#endif
  }
  sendVoltage(ESP.getVcc());
  WiFi.disconnect();
  digitalWrite(AHT_PWR, LOW);
  ESP.deepSleep(start + INTERVAL - micros64());
  ESP.restart();
}