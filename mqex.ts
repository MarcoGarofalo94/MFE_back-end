import mqtt from "mqtt";
//const mqtt = require("mqtt");
import fs from "fs";
import { Engine, Microservice } from "./workflow_engine";

interface Message {
  sessionUUID: string;
  eventId: string;
  data: any;
}

const r = new Engine();
r.run()


// connection option
const options = {
  clean: true, // retain session
  connectTimeout: 4000, // Timeout period
  // Authentication information
  clientId: "emqx_test",
  username: "emqx_test",
  password: "emqx_test",
  noLocal: true,
};

// Connect string, and specify the connection method by the protocol
// ws Unencrypted WebSocket connection
// wss Encrypted WebSocket connection
// mqtt Unencrypted TCP connection
// mqtts Encrypted TCP connection
// wxs WeChat applet connection
// alis Alipay applet connection

const connectUrl = "ws://localhost:8080/mqtt";
//const client = mqtt.connect(connectUrl, options);


