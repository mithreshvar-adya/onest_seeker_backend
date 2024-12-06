interface GlobalEnvConfig {
    PORT: number;
    MONGO_DB_URL: string;
    MONGO_DB_NAME: string;
    COMMON_POSTGRESS_URL: string;
    JWT_SECRET: string;
    EXPIRY_TIME: string;
}

export const GlobalEnv: GlobalEnvConfig = {
    PORT: 4021,
    MONGO_DB_URL: "mongodb://myUser:myPassword@4.240.98.192:27020/Onest_seeker",
    MONGO_DB_NAME: "Onest_seeker",
    COMMON_POSTGRESS_URL: "postgres://postgres:password@localhost:5432/new_testing_poc?schema=public",
    JWT_SECRET: "yNVrBBM+oAOWOEcXPFjJuvXXpUq/4XR1KuSGX/i+slF+oE/geu2uW25PXjfWS9pwjmTry3WXn7q0DH7I+vNSjw==",
    EXPIRY_TIME: "3d",
};