import express from "express";
import axios from "axios";
const app = express();
const port = 5002;
app.use(express.json());
let times: number[] = [];
axios.post("http://localhost:5000/register", {
  id: "ms2",
  runHook: "http://localhost:5002/geodata",
});

const done = async (data: any) => {
  try {
    let endTime = Date.now();
    let initTime = data.time;
    times.push(endTime - initTime);
    console.log(times);
    const response = await axios.post("http://localhost:5000/done", {
      ...data,
      time: endTime - initTime,
    });
  } catch (e) {
    console.log("error", e);
  }
};
app.post("/geodata", (req, res) => {
  console.log("working");

  let initTime = Date.now();
  res.on("finish", () => {
    console.log("Response has been sent!", req.body);

    done({
      time: initTime,
      eventId: req.body.eventId,
      sessionUUID: req.body.sessionUUID,
      data: {
        lat: (Math.random() * 30).toString(),
        long: (Math.random() * 30).toString(),
      },
    });
  });
  res.send("working");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
