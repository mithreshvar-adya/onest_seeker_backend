import express from 'express';
import cookieParser from "cookie-parser";
import cors from "cors";
import logger from "morgan";
import NetworkRouter from './network_controller/route';
import { WebLogger, apiResponse, customLogger, live_logs, logsAuth } from "@adya/shared";
import { GlobalEnv } from './Config/env';

export default async function init(app:any){
  try{
    app.use(cors());
    app.options("*", cors());
    app.use(cookieParser());
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));

    app.use(logger(customLogger));

    app.get('/', (req, res) => {
      res.send({ message: 'ONEST Network Router Working fine' });
    });

    app.get('/logs', logsAuth, live_logs);

    app.use('/api/v1/onest_ondc', NetworkRouter)

    app.get("*", (req, res) => {
      res.status(404).json(apiResponse.ONEST_ONDC_FAILURE_RESP("Invalid API", "","Invalid Route","API NOT FOUND"));
    });
    app.post("*", (req, res) => {
      res.status(404).json(apiResponse.ONEST_ONDC_FAILURE_RESP("Invalid API", "","Invalid Route","API NOT FOUND"));
    });

    const app_server = app.listen(GlobalEnv.PORT, () => {
      console.log(`Server Listening on port : ${GlobalEnv.PORT}`);
    });
    WebLogger(app_server);
  }
  catch(err){
    console.log("App Error =====>>>>", err)
    process.exit(1)
  }
}

const app=express()
init(app)

