import { DBNAMES, BuyerAppConfig,TestDbService } from "@adya/shared";


const test_db = TestDbService.getInstance()

class Service {
    private static instance: Service | null = null;

    // Private constructor to prevent direct instantiation
    private constructor() {}

    // Static method to get the singleton instance
    public static getInstance(): Service {
        if (this.instance === null) {
        this.instance = new Service();
        }
        return this.instance;
    }

    async on_track(payload){
        try{
            console.log(payload)
            // await test_db.create(DBNAMES.COMMON_POSTGRESS_URL, appConfig.COMMON_POSTGRESS_URL, {},{})
        }
        catch(err){
            console.log("Service Error =====", err)
        }

    }

}

export default Service