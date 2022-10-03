//import mqtt from 'mqtt'
var mqtt = require("mqtt");
var fs = require('fs');
var workflow = JSON.parse(fs.readFileSync('./BE_workflow.json', { encoding: 'utf-8' }));
var checkFlow = function (event, workflow) {
    workflow.forEach(function (task) {
        console.log(task);
    });
};
// connection option
var options = {
    clean: true,
    connectTimeout: 4000,
    // Authentication information
    clientId: "emqx_test",
    username: "emqx_test",
    password: "emqx_test",
    noLocal: true
};
// Connect string, and specify the connection method by the protocol
// ws Unencrypted WebSocket connection
// wss Encrypted WebSocket connection
// mqtt Unencrypted TCP connection
// mqtts Encrypted TCP connection
// wxs WeChat applet connection
// alis Alipay applet connection
var connectUrl = "ws://localhost:8080/mqtt";
var client = mqtt.connect(connectUrl, options);
client.on("reconnect", function (error) {
    console.log("reconnecting:", error);
});
client.on("error", function (error) {
    console.log("Connection failed:", error);
});
client.on("message", function (topic, message) {
    console.log("receive message：", topic, message.toString());
    var mess = JSON.parse(message);
    if (mess.eventId == "LOGIN" && !mess.server) {
        console.log('login event');
        client.publish(mess.sessionUUID, JSON.stringify({ eventId: "LOGIN", data: "ashdakssa", server: true }), {
            qos: 0,
            retain: false,
            noLocal: true
        });
    }
});
var clientId = "mqttjs_" + Math.random().toString(16).substr(2, 8);
client.on("connect", function () {
    console.log("Client connected:" + clientId);
    client.subscribe("APP", { qos: 0, noLocal: true });
});
