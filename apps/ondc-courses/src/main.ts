import express from 'express';
import cookieParser from "cookie-parser";
import cors from "cors";
import logger from "morgan";
import { WebLogger, apiResponse, customLogger, htmlContent, live_logs, logsAuth } from "@adya/shared";
import NetworkCourseRouter from './controller/router'
import { GlobalEnv } from './config/env'
import axios from 'axios';

export default async function init(app: any) {
  try {
    app.use((req, res, next) => {
        console.log("Request URL:", req.url);
        next();
    });

    app.use(cors());
    app.options("*", cors());
    app.use(cookieParser());
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));

    app.use(logger(customLogger));

    app.get('/', (req, res) => {
      res.send({ message: 'ONEST Network Course App Working fine' });
    });

    app.get('/logs', logsAuth, live_logs);
    app.use('/api/v1/onest_ondc/course', NetworkCourseRouter) // for network router call
    app.use('/api/v1/onest/course', NetworkCourseRouter) // for fe api
    app.use('/api/v1/onest', NetworkCourseRouter) // for L1 adaptor
    app.use('/api/v1/onest_ondc/bap', NetworkCourseRouter)

    app.get('/ondc-site-verification.html', async (req, res) => {
      console.log("Prod File");

      let htmlcontent: any = `${htmlContent}`;
      const html_key = ""
      htmlcontent = htmlcontent.replaceAll("HTML_SIGNING_KEY", "L8/qLivuS9Kjx3DJDzXAC3Twu2pVvZKZQt9fMW24Icl1APCsnzeiWBaHQ3hfd5Ev683Vm6qcqmn8sqqKO1Z4AA==")
      res.set('Content-Type', 'text/html');
      res.send(htmlcontent);
    });

    app.get("*", (req, res) => {
      res.status(404).json(apiResponse.ONEST_ONDC_FAILURE_RESP("Invalid API", "", "Invalid Route", "API NOT FOUND"));
    });

    app.post("*", (req, res) => {
      res.status(404).json(apiResponse.ONEST_ONDC_FAILURE_RESP("Invalid API", "", "Invalid Route", "API NOT FOUND"));
    });

    const app_server = app.listen(GlobalEnv.PORT || 3000, () => {
      console.log(`Onest_Courses server listening on port : ${GlobalEnv.PORT}`);
    });
    try{
      await axios.post("http://localhost:4020/set_course_env", GlobalEnv)
      console.log("Set Env Success ====>>>")
    }catch(error){
        console.log("Error ====>>> Set Env Error")
    }
    WebLogger(app_server);
  }
  catch (err) {
    console.log("App Error =====>>>>", err)
    process.exit(1)
  }
}

const app = express()
init(app)

