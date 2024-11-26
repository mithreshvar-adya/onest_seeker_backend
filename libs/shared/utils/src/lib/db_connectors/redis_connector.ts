import { Redis } from "ioredis";

export class RedisConnection {
    private static redisClient: any;

    static isInitialized(): boolean {
        return this.redisClient !== undefined;
    }

    static getClient(host:string, port:number): any {
        if (this.isInitialized()) return this.redisClient;

        // Initialize the connection.
        this.redisClient = new Redis({
            host: host,
            port: port,
        });
        return this.redisClient;
    }

}
