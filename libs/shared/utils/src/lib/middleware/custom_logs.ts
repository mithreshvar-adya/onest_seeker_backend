class CustomLogs {
    static writeRetailLogsToONDC(message: any, action = "default", application = "BAP") {
      console.log("\n============================= RETAIL " + application + " ONDC START " + action + " =======================================");
      console.log(message);
      console.log("============================== RETAIL " + application + " ONDC END " + action + " ===========================================\n");
    }
  }
  
  export default CustomLogs;