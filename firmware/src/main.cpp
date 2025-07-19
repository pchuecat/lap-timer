#include <Arduino.h>

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);

  // On ESP8266, built-in LED is usually active LOW (so LOW = ON)
  digitalWrite(LED_BUILTIN, LOW);  // LED ON

  Serial.begin(115200);
  Serial.println("LED should now be ON");
}

void loop() {
  delay(5000);
  Serial.println("hellow from loop");
}
