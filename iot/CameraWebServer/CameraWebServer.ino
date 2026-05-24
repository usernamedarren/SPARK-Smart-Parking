#include <Arduino.h>
#include "esp_camera.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>

#include "board_config.h"

// ================================
// Konfigurasi
// ================================
const char* ssid           = "*****************";
const char* password       = "*****************";
const char* apiHost        = "prowling-unkind-arbitrate.ngrok-free.dev";
const int   apiPort        = 443;
const String apiUrl        = "/iot/upload";
const String cameraDeviceId = "CAM_AREA_01";
const int    INTERVAL_MS   = 10000;  // 10 detik

// ================================
// Forward Declaration
// ================================
void initCamera();
void connectWiFi();
void uploadImageToAPI();

// ================================
// Setup
// ================================
void setup() {
    Serial.begin(115200);
    delay(5000);  // tunggu serial monitor kebuka

    Serial.println("\n\n=========================");
    Serial.println("   ESP32-CAM BOOTING    ");
    Serial.println("=========================");

    // Cek PSRAM
    if (psramFound()) {
        Serial.printf("✅ PSRAM ditemukan: %u bytes\n", ESP.getPsramSize());
    } else {
        Serial.println("⚠️  PSRAM tidak ditemukan, pakai DRAM");
    }

    initCamera();
    connectWiFi();

    Serial.println("=========================");
    Serial.println("✅ SETUP SELESAI");
    Serial.printf("📡 IP Address : %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("⏱️  Interval   : %d detik\n", INTERVAL_MS / 1000);
    Serial.println("=========================\n");
}

// ================================
// Loop
// ================================
void loop() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("⚠️  WiFi terputus, mencoba reconnect...");
        connectWiFi();
    } else {
        uploadImageToAPI();
    }

    Serial.printf("💤 Menunggu %d detik...\n\n", INTERVAL_MS / 1000);
    delay(INTERVAL_MS);
}

// ================================
// Init Kamera
// ================================
void initCamera() {
    Serial.println("📷 Inisialisasi kamera...");

    camera_config_t config;
    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer   = LEDC_TIMER_0;
    config.pin_d0       = Y2_GPIO_NUM;
    config.pin_d1       = Y3_GPIO_NUM;
    config.pin_d2       = Y4_GPIO_NUM;
    config.pin_d3       = Y5_GPIO_NUM;
    config.pin_d4       = Y6_GPIO_NUM;
    config.pin_d5       = Y7_GPIO_NUM;
    config.pin_d6       = Y8_GPIO_NUM;
    config.pin_d7       = Y9_GPIO_NUM;
    config.pin_xclk     = XCLK_GPIO_NUM;
    config.pin_pclk     = PCLK_GPIO_NUM;
    config.pin_vsync    = VSYNC_GPIO_NUM;
    config.pin_href     = HREF_GPIO_NUM;
    config.pin_sccb_sda = SIOD_GPIO_NUM;
    config.pin_sccb_scl = SIOC_GPIO_NUM;
    config.pin_pwdn     = PWDN_GPIO_NUM;
    config.pin_reset    = RESET_GPIO_NUM;
    config.xclk_freq_hz = 20000000;
    config.pixel_format = PIXFORMAT_JPEG;
    config.grab_mode    = CAMERA_GRAB_LATEST;
    config.jpeg_quality = 10;

    if (psramFound()) {
        config.frame_size  = FRAMESIZE_SVGA;
        config.fb_location = CAMERA_FB_IN_PSRAM;
        config.fb_count    = 1;
    } else {
        config.frame_size  = FRAMESIZE_VGA;
        config.fb_location = CAMERA_FB_IN_DRAM;
        config.fb_count    = 1;
    }

    esp_err_t err = esp_camera_init(&config);
    if (err != ESP_OK) {
        Serial.printf("❌ Kamera gagal init: 0x%x\n", err);
        Serial.println("   Restart dalam 5 detik...");
        delay(5000);
        ESP.restart();
    }

    // Flip vertikal
    sensor_t* s = esp_camera_sensor_get();
    s->set_vflip(s, 1);

    Serial.println("✅ Kamera OK");
}

// ================================
// Connect WiFi
// ================================
void connectWiFi() {
    Serial.printf("📶 Menghubungkan ke WiFi: %s\n", ssid);
    WiFi.begin(ssid, password);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("\n❌ WiFi gagal terhubung!");
        Serial.println("   Restart dalam 5 detik...");
        delay(5000);
        ESP.restart();
    }

    Serial.println("\n✅ WiFi terhubung!");
}

// ================================
// Upload Gambar ke API
// ================================
void uploadImageToAPI() {
    Serial.println("=============================");
    Serial.printf("⏱️  Waktu     : %lu ms\n", millis());
    Serial.printf("📶 WiFi RSSI  : %d dBm\n", WiFi.RSSI());
    Serial.println("📸 Mengambil gambar...");

    // Ambil frame
    camera_fb_t* fb = esp_camera_fb_get();
    if (!fb) {
        Serial.println("❌ Gagal ambil gambar dari kamera!");
        return;
    }

    Serial.printf("🖼️  Ukuran     : %u bytes (%.1f KB)\n", fb->len, fb->len / 1024.0);
    Serial.printf("📐 Resolusi   : %dx%d\n", fb->width, fb->height);
    Serial.println("🔗 Menghubungkan ke API...");

    // Koneksi HTTPS
    WiFiClientSecure client;
    client.setInsecure();  // skip SSL verify (ok untuk development)

    if (!client.connect(apiHost, apiPort)) {
        Serial.println("❌ Koneksi ke server gagal!");
        esp_camera_fb_return(fb);
        return;
    }

    Serial.println("✅ Terhubung ke server");
    Serial.println("📤 Mengirim gambar...");

    // Build multipart body
    String boundary = "ESP32CamBoundaryData";

    String bodyHead = "--" + boundary + "\r\n";
    bodyHead += "Content-Disposition: form-data; name=\"camera_device_id\"\r\n\r\n";
    bodyHead += cameraDeviceId + "\r\n";
    bodyHead += "--" + boundary + "\r\n";
    bodyHead += "Content-Disposition: form-data; name=\"image\"; filename=\"capture.jpg\"\r\n";
    bodyHead += "Content-Type: image/jpeg\r\n\r\n";

    String bodyTail  = "\r\n--" + boundary + "--\r\n";
    uint32_t totalLen = bodyHead.length() + fb->len + bodyTail.length();

    // Kirim HTTP request
    client.println("POST " + apiUrl + " HTTP/1.1");
    client.println("Host: " + String(apiHost));
    client.println("Content-Length: " + String(totalLen));
    client.println("Content-Type: multipart/form-data; boundary=" + boundary);
    client.println("Connection: close");
    client.println();

    // Kirim body head
    client.print(bodyHead);

    // Kirim gambar dalam chunk 1KB
    uint8_t* fbBuf = fb->buf;
    size_t   fbLen = fb->len;
    size_t   sent  = 0;
    for (size_t n = 0; n < fbLen; n += 1024) {
        size_t chunkSize = (n + 1024 < fbLen) ? 1024 : fbLen - n;
        client.write(fbBuf + n, chunkSize);
        sent += chunkSize;
    }

    // Kirim body tail
    client.print(bodyTail);
    esp_camera_fb_return(fb);  // lepas buffer kamera sesegera mungkin

    Serial.printf("📤 Terkirim   : %u bytes\n", sent);
    Serial.println("⏳ Menunggu respons...");

    // Baca respons
    long    timeout      = millis();
    int     statusCode   = 0;
    bool    isBody       = false;
    String  responseBody = "";

    while (client.connected() && millis() - timeout < 10000) {
        while (client.available()) {
            String line = client.readStringUntil('\n');
            line.trim();

            if (line.startsWith("HTTP/1.")) {
                statusCode = line.substring(9, 12).toInt();
            }

            if (line.length() == 0) {
                isBody = true;
            } else if (isBody) {
                responseBody += line;
            }

            timeout = millis();
        }
    }

    client.stop();

    // Log hasil
    Serial.println("\n--- HASIL UPLOAD ---");
    if (statusCode >= 200 && statusCode < 300) {
        Serial.printf("✅ STATUS     : SUKSES (%d)\n", statusCode);
        Serial.println("📦 Response   : " + responseBody);
    } else if (statusCode > 0) {
        Serial.printf("❌ STATUS     : GAGAL (%d)\n", statusCode);
        Serial.println("⚠️  Error      : " + responseBody);
    } else {
        Serial.println("❌ STATUS     : GAGAL (timeout/koneksi terputus)");
    }
    Serial.println("=============================\n");
}