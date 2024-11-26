import { BuyerAppConfig, Global_Env } from "@adya/shared";


export var  global_env: any = {};


export async function getAppConfig(db_url: string, db_name: string, code: string, appConfig: BuyerAppConfig) { 
    try {
        const global = Global_Env.getInstance();

        if (Object.keys(global_env).length > 0) {
            return;
        }
        console.log("db details====================>",db_url, db_name, code, appConfig);
        

        const env = await global.get(db_url, db_name, code);


        console.log("env details=================",env);
        

        if(env?._id){
            delete env._id
        }
        if(env?.CODE){
            delete env.CODE
        }
        
        // const { _id, CODE, ...newEnv } = env;
        // global_env = {...appConfig, ...newEnv};

        global_env = {...appConfig, ...env };

        console.log("global_env ----------->",global_env);
        
    } catch (error) {
        console.log("Error", error);
    }
}
