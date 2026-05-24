/**
 * SPARK Smart Parking - ESP32-CAM Auto-Upload Firmware
 *
 * Periodically captures a JPEG image and POSTs it to the SPARK FastAPI
 * backend endpoint: POST /iot/upload
 *
 * Board: AI-Thinker ESP32-CAM (CAMERA_MODEL_AI_THINKER)
 * Required Libraries (Arduino Library Manager):
 *   - esp32 board support (Espressif Systems, v2.x+)
 *
 * Configuration — edit the section below before flashing.
 */

#include <Arduino.h>
#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>

// =====================================================================
//  USER CONFIGURATION  —  Edit these values before flashing
// =====================================================================

// Wi-Fi credentials
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// SPARK backend endpoint (replace with your server's LAN IP or domain)
// Example: "http://192.168.1.100:8000/iot/upload"
const char* UPLOAD_URL    = "http://192.168.1.100:8000/iot/upload";

// Camera device ID registered in the database
const char* CAMERA_DEVICE_ID = "CAM-TEST";

// Capture interval (milliseconds). Default: 30 seconds.
const unsigned long CAPTURE_INTERVAL_MS = 30000;

// =====================================================================
//  CAMERA PIN MAP  —  AI-Thinker ESP32-CAM
// =====================================================================
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27

#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

#define LED_GPIO_NUM       4   // Built-in flash LED

// =====================================================================
//  GLOBALS
// =====================================================================
unsigned long lastCapture = 0;

// =====================================================================
//  HELPERS
// =====================================================================

void initCamera() {
  camera_config_t config;
  config.ledc_channel  = LEDC_CHANNEL_0;
  config.ledc_timer    = LEDC_TIMER_0;
  config.pin_d0        = Y2_GPIO_NUM;
  config.pin_d1        = Y3_GPIO_NUM;
  config.pin_d2        = Y4_GPIO_NUM;
  config.pin_d3        = Y5_GPIO_NUM;
  config.pin_d4        = Y6_GPIO_NUM;
  config.pin_d5        = Y7_GPIO_NUM;
  config.pin_d6        = Y8_GPIO_NUM;
  config.pin_d7        = Y9_GPIO_NUM;
  config.pin_xclk      = XCLK_GPIO_NUM;
  config.pin_pclk      = PCLK_GPIO_NUM;
  config.pin_vsync     = VSYNC_GPIO_NUM;
  config.pin_href      = HREF_GPIO_NUM;
  config.pin_sccb_sda  = SIOD_GPIO_NUM;
  config.pin_sccb_scl  = SIOC_GPIO_NUM;
  config.pin_pwdn      = PWDN_GPIO_NUM;
  config.pin_reset     = RESET_GPIO_NUM;
  config.xclk_freq_hz  = 20000000;
  config.pixel_format  = PIXFORMAT_JPEG;
  config.grab_mode     = CAMERA_GRAB_LATEST;
  config.fb_location   = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality  = 10;   // Lower = better quality (0-63)
  config.fb_count      = 2;

  if (psramFound()) {
    config.frame_size   = FRAMESIZE_UXGA;  // 1600x1200 — best quality
  } else {
    config.frame_size   = FRAMESIZE_SVGA;  // 800x600 fallback
    config.fb_location  = CAMERA_FB_IN_DRAM;
    config.fb_count     = 1;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("[CAMERA] Init failed (0x%x). Restarting...\n", err);
    delay(1000);
    ESP.restart();
  }

  // Improve image quality
  sensor_t* s = esp_camera_sensor_get();
  s->set_brightness(s, 1);
  s->set_contrast(s, 1);
  s->set_saturation(s, 0);
  s->set_whitebal(s, 1);
  s->set_awb_gain(s, 1);
  s->set_exposure_ctrl(s, 1);
  s->set_aec2(s, 1);
  s->set_gainceiling(s, (gainceiling_t)2);

  Serial.println("[CAMERA] Initialized successfully.");
}

void connectWiFi() {
  Serial.printf("[WiFi] Connecting to %s", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    if (millis() - start > 20000) {
      Serial.println("\n[WiFi] Connection timed out. Restarting...");
      ESP.restart();
    }
  }

  Serial.printf("\n[WiFi] Connected! IP: %s\n", WiFi.localIP().toString().c_str());
}

/**
 * Capture one JPEG frame and POST it to the SPARK backend.
 * Returns true on HTTP 200, false on any failure.
 */
bool captureAndUpload() {
  // Flush stale frame buffers
  camera_fb_t* fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("[CAPTURE] Failed to get frame buffer.");
    return false;
  }
  esp_camera_fb_return(fb);

  // Grab fresh frame
  fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("[CAPTURE] Failed to get fresh frame buffer.");
    return false;
  }

  Serial.printf("[CAPTURE] Image size: %u bytes (%dx%d)\n",
                fb->len, fb->width, fb->height);

  // --- Build multipart/form-data body manually ---
  String boundary = "----SparkBoundary7MA4YWxkTrZu0gW";
  String contentType = "multipart/form-data; boundary=" + boundary;

  // camera_device_id field
  String body = "--" + boundary + "\r\n";
  body += "Content-Disposition: form-data; name=\"camera_device_id\"\r\n\r\n";
  body += String(CAMERA_DEVICE_ID) + "\r\n";

  // image field header
  body += "--" + boundary + "\r\n";
  body += "Content-Disposition: form-data; name=\"image\"; filename=\"capture.jpg\"\r\n";
  body += "Content-Type: image/jpeg\r\n\r\n";

  // Assemble full payload (header + binary + footer)
  String footer = "\r\n--" + boundary + "--\r\n";

  size_t totalLen = body.length() + fb->len + footer.length();
  uint8_t* payload = (uint8_t*)malloc(totalLen);
  if (!payload) {
    Serial.println("[UPLOAD] Memory allocation failed.");
    esp_camera_fb_return(fb);
    return false;
  }

  size_t offset = 0;
  memcpy(payload + offset, body.c_str(), body.length()); offset += body.length();
  memcpy(payload + offset, fb->buf,      fb->len);        offset += fb->len;
  memcpy(payload + offset, footer.c_str(), footer.length());

  esp_camera_fb_return(fb);  // Return buffer as soon as possible

  // --- HTTP POST ---
  HTTPClient http;
  http.begin(UPLOAD_URL);
  http.addHeader("Content-Type", contentType);
  http.setTimeout(15000);  // 15 second timeout

  Serial.printf("[UPLOAD] POSTing %u bytes to %s ...\n", totalLen, UPLOAD_URL);

  int httpCode = http.POST(payload, totalLen);
  free(payload);

  if (httpCode > 0) {
    Serial.printf("[UPLOAD] HTTP %d\n", httpCode);
    if (httpCode == 200) {
      String response = http.getString();
      Serial.println("[UPLOAD] Response: " + response);
      http.end();
      return true;
    }
  } else {
    Serial.printf("[UPLOAD] HTTP error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
  return false;
}

// =====================================================================
//  ARDUINO ENTRY POINTS
// =====================================================================

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== SPARK Smart Parking - Auto-Upload Firmware ===");

  // Turn off the built-in flash LED (GPIO4)
  pinMode(LED_GPIO_NUM, OUTPUT);
  digitalWrite(LED_GPIO_NUM, LOW);

  initCamera();
  connectWiFi();

  Serial.printf("[MAIN] Upload interval: %lu ms\n", CAPTURE_INTERVAL_MS);
  Serial.println("[MAIN] Starting first capture in 3 seconds...");
  delay(3000);

  // Trigger an immediate upload on boot
  captureAndUpload();
  lastCapture = millis();
}

void loop() {
  // Reconnect WiFi if dropped
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Disconnected — reconnecting...");
    connectWiFi();
  }

  // Periodic capture and upload
  if (millis() - lastCapture >= CAPTURE_INTERVAL_MS) {
    bool ok = captureAndUpload();
    Serial.printf("[MAIN] Upload %s\n", ok ? "SUCCESS" : "FAILED");
    lastCapture = millis();
  }

  delay(100);
}
