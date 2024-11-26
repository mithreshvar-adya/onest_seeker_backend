// @ts-nocheck
import { FALIURE_RESP } from "../utils/response_format";
// import JsonWebToken from "../utils/helpers/jwt_token";
import { apiResponse, JsonWebToken } from "@adya/shared";

const jwt_token = new JsonWebToken();

async function authentication(req, res, next) {
    const authToken = req.headers.authorization;
    try {
        if (!authToken) {

            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Invalid Authorization",
                message: "Invalid Authorization"
            }, "No authorization provided"))
        }

        const tokenArr = authToken.split(" ");
        if (tokenArr.length !== 2) {
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Invalid Authorization",
                message: "Invalid Authorization"
            }, "No authorization provided"))
        }

        const token = tokenArr[1];
        const isExpired = await jwt_token.checkExpiry(token);
        if (isExpired) {
            return res.status(500).json(apiResponse.FAILURE_RESP({}, {
                name: "Token expired or not available",
                message: "Token expired or not available"
            }, "Token expired or not available"))

        }

        await jwt_token.verify(token);
        next();
    } catch (err) {
        console.log("Error ====>>>> ", err);
        next(err); // Pass the error to the next middleware
    }
}

export { authentication };
