import express from 'express';
import cookieParser from "cookie-parser";
import cors from "cors";
import * as config from "config"
import logger from "morgan";
import controller from './controllers/router'
import { BuyerAppConfig, global_env } from '@adya/shared'
import { getAppConfig } from "@adya/shared";
import {live_logs, logsAuth } from "@adya/shared";


export default async function init(app:any){
  

  function customLogger(tokens, req, res) {
    const date = new Date().toISOString(); // Current timestamp
    const method = tokens.method(req, res); // HTTP method
    const url = tokens.url(req, res); // URL requested
    const httpVersion = "HTTP/" + req.httpVersion; // HTTP version
    const statusCode = res.statusCode; // HTTP status code

    // Construct custom log message
    return `date: ${date}, ${method} ${url} ${httpVersion} ${statusCode}`;
  }
  
  try {
    const appConfig: BuyerAppConfig = config.get("seeker.backend_application");
    await getAppConfig(appConfig.MONGO_DB_URL, appConfig.MONGO_DB_NAME, "BACKEND_APPLICATION", appConfig);
    console.log("Backend_Application: ",global_env);
    
    
    app.use(cors());
    app.options("*", cors());
    app.use(cookieParser());
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));
    app.use(logger(customLogger));

    app.get('/', (req, res) => {
      res.send({ message: 'Backend Application Working fine' });
    });
    app.get('/logs', logsAuth, live_logs);

    app.use('/api/v1/onest/backend', controller)

    app.get("*", (req, res) => {
      res.status(404).json({
          "meta": {
              "status": false,
              "message": "page not found"
          },
          "error": {
              "name": "page not found",
              "message": "Page not found"
          }
      });
    });

    app.listen(global_env?.PORT || 3000, () => {
      console.log(`Backend_Application server listening on port : ${global_env?.PORT}`);
    });
  } catch (err) {
    console.log("App Error =====>>>>", err)
    process.exit(1)
  }
};

const app=express()
init(app)