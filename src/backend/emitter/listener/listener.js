const mongoose = require("mongoose");
const socketIO = require("socket.io");
const http = require("http");
const crypto = require("crypto");
const DataModel = require("./models/data");

// Initialize MongoDB connection
mongoose.connect("mongodb://localhost:27017/mytimeseriesdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Create an HTTP server and initialize Socket.IO
const server = http.createServer((req, res) => {
  // Handle HTTP requests here
  if (req.method === "GET" && req.url === "/hello") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello, World!\n");
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found\n");
  }
});

const io = socketIO(server);

io.on("connection", (socket) => {
  console.log("Listener connected to emitter");

  socket.on("data", (messageStream) => {
    const messages = messageStream.split("|");

    messages.forEach((encryptedMessage) => {
      // Decrypt the message using the secret key
      const decryptedMessage = decryptMessage(encryptedMessage, "ravali");

      if (validateMessage(decryptedMessage)) {
        // Save the valid message to the database
        saveToDatabase(decryptedMessage);
      }
    });
  });
});

function decryptMessage(encryptedMessage, passkey) {
  // Convert the encrypted message from hexadecimal to a Buffer
  const encryptedBuffer = Buffer.from(encryptedMessage, "hex");

  // Create a decipher with AES-256-CTR algorithm
  const decipher = crypto.createDecipheriv(
    "aes-256-ctr",
    passkey,
    Buffer.from("ivHex", "hex")
  );

  // Decrypt the message
  const decryptedPayload = Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final(),
  ]);

  // Parse the decrypted JSON data
  try {
    const decryptedMessage = JSON.parse(decryptedPayload.toString("utf8"));
    return decryptedMessage;
  } catch (error) {
    console.error("Error parsing decrypted message:", error);
    return null; // Return null if parsing fails
  }
}

function validateMessage(decryptedMessage) {
  // Check if the decrypted message has the expected keys
  if (
    !decryptedMessage ||
    !decryptedMessage.name ||
    !decryptedMessage.origin ||
    !decryptedMessage.destination ||
    !decryptedMessage.secret_key
  ) {
    console.error("Invalid message format:", decryptedMessage);
    return false; // Invalid message format
  }

  // Recalculate the secret_key from the message
  const recalculatedSecretKey = generateSecretKey({
    name: decryptedMessage.name,
    origin: decryptedMessage.origin,
    destination: decryptedMessage.destination,
  });

  // Compare the recalculated secret_key with the one provided in the message
  if (recalculatedSecretKey === decryptedMessage.secret_key) {
    return true; // Message is valid
  } else {
    console.error("Invalid secret_key:", decryptedMessage.secret_key);
    return false; // Invalid secret_key
  }
}

function saveToDatabase(data) {
  const newData = new DataModel(data);
  newData.save((error) => {
    if (error) {
      console.error("Error saving data to MongoDB:", error);
    } else {
      console.log("Data saved to MongoDB:", data);
    }
  });
}

// Start the server
const PORT = process.env.PORT || 3004;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
