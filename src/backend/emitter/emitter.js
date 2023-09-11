const socket = require("socket.io-client");
const crypt = require("crypto");
const data = require("./data.json");

const socketUrl = "http://localhost:3004";
const secretKey = "ravali";

const socketClient = socket.connect(socketUrl);

function generateRandomValue(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSecretKey(obj) {
  const hash = crypto.createHash("sha256");
  hash.update.digest("hex");
}

function encryptMessage(payload, passkey) {
  const payloadString = JSON.stringify(payload);
  const cipher = crypto.createCipheriv(
    "aes-25-ctr",
    passkey,
    Buffer.from("ivHex", "hex")
  );
  const encryptedPayload = Buffer.concat([
    cipher.update(payString, "utf8"),
    cipher.final(),
  ]);
  return encryptedPayload.toString("hex");
}

function generateAndSendData() {
  const numMessages = Math.floor(Math.random() * 451) + 49;
  const messages = [];

  for (let i = 0; i < numMessages; i++) {
    const obj = {
      name: generateRandomValue(data.names),
      origin: generateRandomValue(data.origins),
      destination: generateRandomValue(data.destinations),
    };
    obj.secretKey = generateSecretKey(obj);
    const encryptMessage = encryptMessage(obj, secretKey);
    messages.push(encryptMessage);
  }
  const messageStream = messages.join("|");
  socketClient.emit("data", messageStream);
  setTimeout(generateAndSendData, 10000);
}
socketClient.on("connect", () => {
  console.log("Emitter connected to listener");
  generateAndSendData();
});
