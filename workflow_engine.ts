import axios from "axios";
import fs from "fs";
import express from "express";
import mqtt from "mqtt";
const workflow = JSON.parse(
  fs.readFileSync("./BE_workflow.json", { encoding: "utf-8" })
) as WorkflowState[];
export class Microservice {
  id: string;
  runHook: string;

  constructor(id: string, runHook: string) {
    this.id = id;
    this.runHook = runHook;
  }
}

interface WorkflowState {
  trigger: string;
  run: string[];
}

export interface Message {
  sessionUUID: string;
  eventId: string;
  data: any;
}

export class Engine {
  private ms_list: Microservice[] = [];
  private client: mqtt.Client;
  private initialTimes: number[] = [];
  private endingTimes: number[] = [];
  private options = {
    clean: true, // retain session
    connectTimeout: 4000, // Timeout period
    // Authentication information
    clientId: "emqx_test",
    username: "emqx_test",
    password: "emqx_test",
    noLocal: true,
  };
  private connectUrl = "ws://localhost:8080/mqtt";

  constructor() {
    this.client = mqtt.connect(this.connectUrl, this.options);
    this.client.on("reconnect", (error) => {
      console.log("reconnecting:", error);
    });

    this.client.on("error", (error) => {
      console.log("Connection failed:", error);
    });

    this.client.on("message", (topic, message) => {
      console.time("mess");
      this.initialTimes.push(Date.now());

      console.log("receive message：" + Date.now(), topic, message.toString());

      const mess: Message = JSON.parse(message.toString());
      const triggered = workflow.filter(
        (state) => state.trigger == mess.eventId
      );

      triggered.forEach((state) =>
        state.run.forEach((ms) => this.runMs(ms, mess))
      );
    });
    const clientId = "mqttjs_" + Math.random().toString(16).substr(2, 8);
    this.client.on("connect", () => {
      console.log("Client connected:" + clientId);
      this.client.subscribe("APP", { qos: 1 });
    });
  }
  addInitialTime() {
    let initTime = Date.now();
    console.log(initTime);
    this.initialTimes.push(initTime);
  }

  addEndingTime() {
    let endingTime = Date.now();
    console.log(endingTime);
    this.endingTimes.push(Date.now());
  }
  register(ms: Microservice) {
    this.ms_list.push(ms);
  }

  runMs(msID: string, data: any) {
    const ms = this.ms_list.find((m) => m.id == msID);
    if (ms) {
      axios.post(ms.runHook, data);
    }
  }

  checkFlow = (event, workflow) => {
    workflow.forEach((task) => {
      console.log(task);
    });
  };

  run() {
    const app = express();
    app.use(express.json());
    app.post("/register", (req, res) => {
      const ms = req.body as Microservice;
      if (ms.id && !this.ms_list.find((m) => m.id == ms.id)) {
        this.register(req.body);
        res.send(ms.id + " has been registered.");
      } else {
        res.send(ms.id + " already exists");
      }
    });

    app.post("/done", (req, res) => {
      const data = req.body as Message;
      console.log(data);
      this.client.publish(
        data.sessionUUID,
        JSON.stringify({ ...data, sendingTime: Date.now() }),
        {
          qos: 1,
          retain: false,
        },
        () => {
          console.timeEnd("mess");
          this.endingTimes.push(Date.now());
        }
      );
    });

    app.get("/ms", (req, res) => {
      let mean = 0;
      let times: number[] = [];
      this.endingTimes.forEach((it, i) => {
        mean += it - this.initialTimes[i];
        times.push(it - this.initialTimes[i]);
      });
      mean = mean / this.endingTimes.length;
      res.on("finish", () => {
        this.endingTimes = [];
        this.initialTimes = [];
      });
      res.send({
        mean: mean,
        times: times,
        initialTimes: this.initialTimes,
        endingTimes: this.endingTimes,
      });
    });

    app.listen(5000, () => {
      console.log(`Example app listening on port ${5000}`);
    });
  }
}
