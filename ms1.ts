import express from "express";
import axios from "axios";
const app = express();
const port = 5001;
app.use(express.json());

axios.post("http://localhost:5000/register", {
  id: "ms1",
  runHook: "http://localhost:5001/login",
});

const done =  async (data: any) => {
  console.log("done", data);
  try {
    const response = await axios.post("http://localhost:5000/done", data);
    console.log(response);
  } catch (e) {
    console.log("error", e);
  }
};
app.post("/login", (req, res) => {
  console.log("working");

  res.on("finish", () => {
    console.log("Response has been sent!", req.body);

    if (
      req.body.data.username == "Marco" &&
      req.body.data.password == "Garofalo"
    ) {
      done({
        eventId: req.body.eventId,
        sessionUUID: req.body.sessionUUID,
        data: { token: (Math.random() * 13).toString() },
      });
    }
  });
  res.send("working");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
