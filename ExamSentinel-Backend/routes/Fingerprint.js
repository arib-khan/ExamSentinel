// const ffi = require("ffi-napi");
const ref = require("ref-napi");

// -------- Load MFS100 DLL --------
let mantraLib;
try {
  mantraLib = ffi.Library("C:\\Windows\\System32\\MFS100.dll", {
    Init: ["int", []],
    Uninit: ["int", []],
    IsConnected: ["int", []],
    GetDeviceInfo: ["int", [ref.refType(ref.types.char)]], // Add device info
    CaptureFinger: ["int", [ref.refType(ref.types.uchar)]],
    ExtractTemplate: [
      "int",
      [
        ref.refType(ref.types.uchar),
        "int",
        ref.refType(ref.types.uchar),
        ref.refType("int"),
      ],
    ],
    GetLastError: ["int", []], // Add error function if available
  });
  console.log("✅ DLL loaded successfully");
} catch (error) {
  console.error("❌ Failed to load DLL:", error.message);
  console.log(
    "🔍 Check if MFS100.dll exists at C:\\Windows\\System32\\MFS100.dll"
  );
  process.exit(1);
}

// -------- Enhanced Capture + Extract Function --------
function captureAndExtract() {
  try {
    console.log("👉 Initializing fingerprint device...");
    const initStatus = mantraLib.Init();
    console.log("🔍 Init status code:", initStatus);

    if (initStatus !== 0) {
      console.log("❌ Common Init error codes:");
      console.log("  - Code 1: Device not found");
      console.log("  - Code -1: DLL not found or corrupted");
      console.log("  - Code 2: Device driver issue");
      throw new Error(`❌ Device Init failed with code ${initStatus}`);
    }

    // Check connection status
    console.log("👉 Checking device connection...");
    const connected = mantraLib.IsConnected();
    console.log("🔍 Connection status:", connected);

    if (connected !== 1) {
      console.log("❌ Device not connected. Possible issues:");
      console.log("  - USB cable disconnected");
      console.log("  - Device driver not installed");
      console.log("  - Device powered off");
      console.log("  - Another application using the device");
      throw new Error("❌ Fingerprint device not detected!");
    }
    console.log("✅ Device connected!");

    // Get device info if available
    try {
      const deviceInfoBuffer = Buffer.alloc(256);
      const deviceInfoStatus = mantraLib.GetDeviceInfo(deviceInfoBuffer);
      if (deviceInfoStatus === 0) {
        console.log("📱 Device Info:", deviceInfoBuffer.toString("utf8"));
      }
    } catch (err) {
      console.log("ℹ️  Device info not available");
    }

    console.log("👉 Capturing fingerprint...");
    console.log("🖐️  Please place finger on scanner...");

    // Try different buffer sizes
    const bufferSizes = [2000, 4096, 8192];
    let captureBuffer;
    let captureStatus;

    for (const size of bufferSizes) {
      console.log(`🔍 Trying capture with buffer size: ${size}`);
      captureBuffer = Buffer.alloc(size);
      captureBuffer.fill(0); // Initialize buffer

      captureStatus = mantraLib.CaptureFinger(captureBuffer);
      console.log(`🔍 Capture status code: ${captureStatus}`);

      if (captureStatus === 0) {
        console.log("✅ Capture successful!");
        break;
      } else {
        console.log(
          `❌ Capture failed with buffer size ${size}, code: ${captureStatus}`
        );
        console.log("📋 Common capture error codes:");
        console.log("  - Code 1: No finger detected");
        console.log("  - Code 2: Poor finger placement");
        console.log("  - Code 3: Capture timeout");
        console.log("  - Code 4: Image quality too poor");
      }
    }

    if (captureStatus !== 0) {
      throw new Error(
        `❌ Fingerprint Capture failed with code ${captureStatus}`
      );
    }

    // Check if capture buffer has data
    const nonZeroBytes = captureBuffer.filter((byte) => byte !== 0).length;
    console.log(`🔍 Capture buffer non-zero bytes: ${nonZeroBytes}`);

    if (nonZeroBytes === 0) {
      throw new Error(
        "❌ Capture buffer is empty - no fingerprint data captured"
      );
    }

    console.log("👉 Extracting template...");
    const templateBuffer = Buffer.alloc(1024); // Increased template buffer size
    templateBuffer.fill(0);
    const templateSizeRef = ref.alloc("int");
    ref.writeInt32LE(templateSizeRef, 0, 0); // Initialize to 0

    console.log(`🔍 Using capture buffer length: ${captureBuffer.length}`);

    const extractStatus = mantraLib.ExtractTemplate(
      captureBuffer,
      captureBuffer.length,
      templateBuffer,
      templateSizeRef
    );

    console.log("🔍 Extract status code:", extractStatus);

    if (extractStatus !== 0) {
      console.log("❌ Common extraction error codes:");
      console.log("  - Code 1: Invalid capture data");
      console.log("  - Code 2: Poor quality fingerprint");
      console.log("  - Code 3: Template generation failed");
      console.log("  - Code 4: Insufficient minutiae points");
      throw new Error(
        `❌ Template Extraction failed with code ${extractStatus}`
      );
    }

    const templateSize = templateSizeRef.deref();
    console.log("🔍 Template size from reference:", templateSize);

    if (templateSize <= 0) {
      throw new Error("❌ Invalid template size returned");
    }

    const template = templateBuffer.slice(0, templateSize);

    console.log("✅ Template extracted successfully!");
    console.log("📏 Template length:", template.length);
    console.log(
      "🧩 Template first 20 bytes:",
      Array.from(template.slice(0, 20))
    );
    console.log(
      "🔢 Template as hex:",
      template.toString("hex").substring(0, 40) + "..."
    );

    // Cleanup
    console.log("👉 Cleaning up device...");
    const uninitStatus = mantraLib.Uninit();
    console.log("🔍 Uninit status:", uninitStatus);

    return {
      template: template,
      templateHex: template.toString("hex"),
      size: template.length,
    };
  } catch (err) {
    console.error("❌ Error:", err.message);

    // Always try to cleanup even on error
    try {
      mantraLib.Uninit();
    } catch (cleanupErr) {
      console.error("❌ Cleanup error:", cleanupErr.message);
    }

    return null;
  }
}

// -------- Additional Diagnostic Functions --------
function checkDeviceStatus() {
  try {
    console.log("🔍 === DEVICE DIAGNOSTICS ===");

    const initStatus = mantraLib.Init();
    console.log("Init Status:", initStatus);

    if (initStatus === 0) {
      const connected = mantraLib.IsConnected();
      console.log("Connection Status:", connected);

      mantraLib.Uninit();
    }

    console.log("🔍 === END DIAGNOSTICS ===");
  } catch (err) {
    console.error("Diagnostic Error:", err.message);
  }
}

// -------- Test Functions --------
async function runTests() {
  console.log("🚀 Starting fingerprint capture tests...\n");

  // First run diagnostics
  checkDeviceStatus();
  console.log("");

  // Then try capture
  const result = captureAndExtract();

  if (result) {
    console.log("\n✅ SUCCESS! Template captured:");
    console.log("Size:", result.size, "bytes");
    console.log("Hex (first 50 chars):", result.templateHex.substring(0, 50));
  } else {
    console.log("\n❌ FAILED to capture fingerprint");
    console.log("\n🔧 TROUBLESHOOTING CHECKLIST:");
    console.log("1. Is the MFS100 device physically connected via USB?");
    console.log("2. Are the device drivers installed? Check Device Manager");
    console.log("3. Is another application using the device?");
    console.log("4. Try unplugging and reconnecting the device");
    console.log("5. Run as Administrator");
    console.log(
      "6. Check if Windows blocked the DLL (Right-click DLL → Properties → Unblock)"
    );
  }
}

// -------- Run Test --------
runTests();
