// @ts-nocheck
import { v4 as uuidv4 } from 'uuid';
import { ENUM_ACTIONS, ONEST_VERSIONS } from './ondc_signature/constant';

import { OnestNetworkCourseEnv } from './config/env';

class ContextFactoryClass {


    constructor(arg = {}) {
        const {
            domain = OnestNetworkCourseEnv.DOMAIN,
            country = OnestNetworkCourseEnv.COUNTRY,

            bapId = OnestNetworkCourseEnv.ONDC_DETAILS.BAP_ID,
            bapUrl = OnestNetworkCourseEnv.ONDC_DETAILS.BAP_URL
        } = arg || {};

        this.domain = domain;
        this.country = country;
        this.bapId = bapId;
        this.bapUrl = bapUrl;
        this.timestamp = new Date(Date.now())
    };

    async createBapContext(contextObject = {}) {
        const {
            generatedTransactionId = uuidv4(), //FIXME: if ! found in args then create new
            messageId = uuidv4(),
            action = ENUM_ACTIONS.SEARCH,
            bpp_id,
            bpp_uri,
            city,
            state,
            area_code

        } = contextObject || {};


        var ttl = contextObject?.ttl || null

        if (ttl == null) {
            if (contextObject.domain === "onest:work-opportunities") {
                switch (action) {
                    case "search":
                        ttl = "PT30S";
                        break;
                    case "select":
                    case "init":
                        ttl = "P1M";
                        break;
                    case "confirm":
                    case "status":
                        ttl = "PT10M";
                        break;
                    default:
                        ttl = "PT10M";
                }
            } else {
                ttl = "PT10M";
            }
            // switch (action) {
            //     case ENUM_ACTIONS.CANCEL:
            //         ttl = "PT30S"
            //         break;
            //     // case ENUM_ACTIONS.RETURN:
            //     //     ttl = "PT30S"
            //     //     break;
            //     case ENUM_ACTIONS.CONFIRM:
            //         ttl = "PT30S"
            //         break;
            //     case ENUM_ACTIONS.INIT:
            //         ttl = "PT30S"
            //         break;
            //     case ENUM_ACTIONS.SEARCH:
            //         ttl = "PT30S"
            //         break;
            //     // case ENUM_ACTIONS.TRACK:
            //     //     ttl = "PT30S"
            //     //     break;
            //     // case ENUM_ACTIONS.SUPPORT:
            //     //     ttl = "PT30S"
            //     //     break;
            //     case ENUM_ACTIONS.STATUS:
            //         ttl = "PT30S"
            //         break;
            //     case ENUM_ACTIONS.SELECT:
            //         ttl = "PT30S"
            //         break;
            //     case ENUM_ACTIONS.UPDATE:
            //         ttl = "PT30S"
            //         break;
            //     // case ENUM_ACTIONS.RATING:
            //     //     ttl = "PT30S"
            //     //     break;
            //     // case ENUM_ACTIONS.ISSUE:
            //     //     ttl = "PT30S"
            //     //     break;
            //     // case ENUM_ACTIONS.SUPPORT:
            //     //     ttl = "PT30S"
            //         break;
            //     default:
            //         ttl = "PT31S"
            // }
        }

        console.log("domain --------------->", contextObject.domain);

        if (contextObject.domain === "onest:work-opportunities") {
            console.log("Inside jobs context--------------->");

            contextObject.bap_id = "onest-jobs-bap.skillsetu.co",
                contextObject.bap_uri = "https://onest-jobs-bap.skillsetu.co/api/v1/onest_ondc/bap"
        } else {
            console.log("Inside courses context--------------->");
            contextObject.bap_id = "onest-bap.skillsetu.co",
                contextObject.bap_uri = "https://onest-bap.skillsetu.co/api/v1/onest_ondc/bap"
        }
        console.log("updated");


        return {
            domain: contextObject.domain ? contextObject?.domain : this.domain,
            // country: contextObject.country ? contextObject?.country : this.country,
            action: action,
            version: ONEST_VERSIONS.v_1_1_0,
            bap_id: contextObject.bap_id,
            bap_uri: contextObject.bap_uri,
            transaction_id: contextObject.transaction_id ? contextObject.transaction_id : generatedTransactionId,
            ttl: ttl,
            message_id: messageId,
            timestamp: new Date().toISOString(),
            ...(bpp_id && { bpp_id: bpp_id }),
            ...(bpp_uri && { bpp_uri: bpp_uri })
        };

    }

    createContext(contextObj, action) {
        return {
            domain: contextObj?.domain,
            transaction_id: contextObj?.transaction_id,
            bpp_id: contextObj?.bpp_id,
            bpp_uri: contextObj?.bpp_uri,
            action: action,
            city: contextObj?.city,
            version: contextObj?.version,
            bap_id: contextObj?.bap_id,
            bap_uri: contextObj?.bap_uri,
            timestamp: new Date(Date.now()),
            country: contextObj?.country,
            ttl: contextObj?.ttl,
            message_id: uuidv4().toString()
        }
    }
}

// async function ContextFactory(){

// }
const contextFactory = new ContextFactoryClass();
export {
    contextFactory
} 
