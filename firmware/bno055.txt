#include <Wire.h>
#include <EEPROM.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BNO055.h>
#include <utility/imumaths.h>

#define BUTTON_PIN D5
#define EEPROM_SIZE 32
#define BNO055_SAMPLERATE_DELAY_MS (200)

Adafruit_BNO055 bno = Adafruit_BNO055(55, 0x28, &Wire);

bool buttonPressed = false;

void displaySensorDetails(void)
{
  sensor_t sensor;
  bno.getSensor(&sensor);
  Serial.println("------------------------------------");
  Serial.print("Sensor:       ");
  Serial.println(sensor.name);
  Serial.print("Driver Ver:   ");
  Serial.println(sensor.version);
  Serial.print("Unique ID:    ");
  Serial.println(sensor.sensor_id);
  Serial.print("Max Value:    ");
  Serial.print(sensor.max_value);
  Serial.println(" xxx");
  Serial.print("Min Value:    ");
  Serial.print(sensor.min_value);
  Serial.println(" xxx");
  Serial.print("Resolution:   ");
  Serial.print(sensor.resolution);
  Serial.println(" xxx");
  Serial.println("------------------------------------");
  Serial.println("");
  delay(500);
}

void displaySensorStatus(void)
{
  /* Get the system status values (mostly for debugging purposes) */
  uint8_t system_status, self_test_results, system_error;
  system_status = self_test_results = system_error = 0;
  bno.getSystemStatus(&system_status, &self_test_results, &system_error);

  /* Display the results in the Serial Monitor */
  Serial.println("");
  Serial.print("System Status: 0x");
  Serial.println(system_status, HEX);
  Serial.print("Self Test:     0x");
  Serial.println(self_test_results, HEX);
  Serial.print("System Error:  0x");
  Serial.println(system_error, HEX);
  Serial.println("");
  delay(500);
}

void displayCalStatus(void)
{
  /* Get the four calibration values (0..3) */
  /* Any sensor data reporting 0 should be ignored, */
  /* 3 means 'fully calibrated" */
  uint8_t system, gyro, accel, mag;
  system = gyro = accel = mag = 0;
  bno.getCalibration(&system, &gyro, &accel, &mag);

  /* The data should be ignored until the system calibration is > 0 */
  Serial.print("\t");
  if (!system)
  {
    Serial.print("! ");
  }

  /* Display the individual values */
  Serial.print("Sys:");
  Serial.print(system, DEC);
  Serial.print(" G:");
  Serial.print(gyro, DEC);
  Serial.print(" A:");
  Serial.print(accel, DEC);
  Serial.print(" M:");
  Serial.print(mag, DEC);
}

void setup(void)
{
  Serial.begin(115200);

  while (!Serial)
    delay(10); // wait for serial port to open!

  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  digitalWrite(LED_BUILTIN, LOW); // LED ON

  Serial.println("Orientation Sensor Test");
  Serial.println("");

  /* Initialise the sensor */
  if (!bno.begin())
  {
    /* There was a problem detecting the BNO055 ... check your connections */
    Serial.print("Ooops, no BNO055 detected ... Check your wiring or I2C ADDR!");
    while (1)
      ;
  }

  delay(1000);

  adafruit_bno055_offsets_t cal;
  EEPROM.begin(32);
  EEPROM.get(0, cal);
  EEPROM.end();

  bno.setSensorOffsets(cal);

  /* Display some basic information on this sensor */
  // displaySensorDetails();

  /* Optional: Display current status */
  displaySensorStatus();

  bno.setExtCrystalUse(true);
}

void printCalibrationOffsets(const adafruit_bno055_offsets_t &cal)
{
  Serial.println("📦 Calibration Data:");
  Serial.print("  Accel Offset X/Y/Z: ");
  Serial.print(cal.accel_offset_x);
  Serial.print(", ");
  Serial.print(cal.accel_offset_y);
  Serial.print(", ");
  Serial.println(cal.accel_offset_z);

  Serial.print("  Mag Offset X/Y/Z: ");
  Serial.print(cal.mag_offset_x);
  Serial.print(", ");
  Serial.print(cal.mag_offset_y);
  Serial.print(", ");
  Serial.println(cal.mag_offset_z);

  Serial.print("  Gyro Offset X/Y/Z: ");
  Serial.print(cal.gyro_offset_x);
  Serial.print(", ");
  Serial.print(cal.gyro_offset_y);
  Serial.print(", ");
  Serial.println(cal.gyro_offset_z);

  Serial.print("  Accel Radius: ");
  Serial.println(cal.accel_radius);

  Serial.print("  Mag Radius: ");
  Serial.println(cal.mag_radius);
}

/**************************************************************************/
/*
    Arduino loop function, called once 'setup' is complete (your own code
    should go here)
*/
/**************************************************************************/
void loop(void)
{
  if (digitalRead(BUTTON_PIN) == LOW && !buttonPressed)
  {
    buttonPressed = true; // prevent repeated triggers
    delay(50);            // debounce

    // check calibration state
    uint8_t system, gyro, accel, mag;
    system = gyro = accel = mag = 0;
    bno.getCalibration(&system, &gyro, &accel, &mag);

    if (system == 3 && gyro == 3 && accel == 3 && mag == 3)
    {
      adafruit_bno055_offsets_t cal;
      bno.getSensorOffsets(cal);

      printCalibrationOffsets(cal);

      EEPROM.begin(32);
      EEPROM.put(0, cal);
      EEPROM.commit();
      EEPROM.end();

      Serial.println("✅ Calibration saved to EEPROM!");
    }
    else
    {
      Serial.println("⚠️ Not fully calibrated. Try again.");
    }
  }

  if (digitalRead(BUTTON_PIN) == HIGH)
  {
    buttonPressed = false; // reset latch
  }

  /* Get a new sensor event */
  sensors_event_t event;
  bno.getEvent(&event);

  /* Display the floating point data */
  Serial.print("Heading (X): ");
  Serial.print(event.orientation.x, 4);
  Serial.print("\tRoll (Y): ");
  Serial.print(event.orientation.y, 4);
  Serial.print("\tPitch (Z): ");
  Serial.print(event.orientation.z, 4);

  /* Optional: Display calibration status */
  displayCalStatus();

  /* Optional: Display sensor status (debug only) */
  // displaySensorStatus();

  /* New line for the next sample */
  Serial.println("");

  /* Wait the specified delay before requesting nex data */
  delay(BNO055_SAMPLERATE_DELAY_MS);
}
