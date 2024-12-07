import Validator from 'jsonschema';

import { searchContext, searchMessage, searchValidation } from "./search_validation_schema";
import { selectContext, selectMessage, selectValidation} from "./select_validation_schema";
import {initContext, initMessage, initValidation } from "./init_validation_schema";
import { confirmContext, confirmMessage, confirmValidation } from "./confirm_validation_schema";
import { statusContext, statusMessage, statusValidation } from "./status_validation_schema";
import { supportContext, supportMessage, supportValidation } from "./support_validation_schema";
import { updateContext, updateMessage, updateValidation } from "./update_validation_schema";
import { trackContext, trackMessage, trackValidation } from "./track_validation_schema";

var v = new Validator.Validator();

class BPPValidator {
    private static instance: BPPValidator | null = null;

    // Private constructor to prevent direct instantiation
    private constructor() {}

    // Static method to get the singleton instance
    public static getInstance(): BPPValidator {
        if (this.instance === null) {
        this.instance = new BPPValidator();
        }
        return this.instance;
    }
    validationErrorMessages = async (inputArray: any[]) => {

        let schemaErrors = []
        for (let i = 0; i < inputArray.length; i++) {
            let errObject = {
                path: inputArray[i]?.property,
                message: inputArray[i]?.message,
                value: inputArray[i]?.instance,
                schema:inputArray[i]?.schema
            }
            schemaErrors.push(errObject)
        }
        return schemaErrors
    }

    validateSearch = async (data: any) => {
        v.addSchema(searchContext, '/searchContext');
        v.addSchema(searchMessage, '/searchMessage');
        var response = await v.validate(data?.body, searchValidation)
        console.log("validation errors",response["errors"]);
        let schemaErrors = []
        if (response["errors"].length == 0) {
            return { validation_flag: true, error_list: schemaErrors }
        }
        schemaErrors = await this.validationErrorMessages(response["errors"])
        return { validation_flag: false, error_list: schemaErrors }
    }
    validateSelect = async (data: any) => {
        v.addSchema(selectContext, '/selectContext');
        v.addSchema(selectMessage, '/selectMessage');
        var response = await v.validate(data?.body, selectValidation)
        let schemaErrors = []
        console.log("validation errors",response["errors"]);
        
        if (response["errors"].length == 0) {
            return { validation_flag: true, error_list: schemaErrors }
        }
        schemaErrors = await this.validationErrorMessages(response["errors"])
        return { validation_flag: false, error_list: schemaErrors }
    }
    validateInit = async (data: any) => {
        v.addSchema(initContext, '/initContext');
        v.addSchema(initMessage, '/initMessage');
        var response = await v.validate(data?.body, initValidation)
        console.log("validation errors",response["errors"]);
        let schemaErrors = []
        if (response["errors"].length == 0) {
            return { validation_flag: true, error_list: schemaErrors }
        }
        schemaErrors = await this.validationErrorMessages(response["errors"])
        return { validation_flag: false, error_list: schemaErrors }
    }
    validateConfirm = async (data: any) => {
        v.addSchema(confirmContext, '/confirmContext');
        v.addSchema(confirmMessage, '/confirmMessage');
        var response = await v.validate(data?.body, confirmValidation)
        console.log("validation errors",response["errors"]);
        let schemaErrors = []
        if (response["errors"].length == 0) {
            return { validation_flag: true, error_list: schemaErrors }
        }
        schemaErrors = await this.validationErrorMessages(response["errors"])
        return { validation_flag: false, error_list: schemaErrors }
    }
    validateTrack = async (data: any) => {
        v.addSchema(trackContext, '/trackContext');
        v.addSchema(trackMessage, '/trackMessage');
        var response = await v.validate(data?.body, trackValidation)
        console.log("validation errors",response["errors"]);
        let schemaErrors = []
        if (response["errors"].length == 0) {
            return { validation_flag: true, error_list: schemaErrors }
        }
        schemaErrors = await this.validationErrorMessages(response["errors"])
        return { validation_flag: false, error_list: schemaErrors }
    }
    validateSupport = async (data: any) => {
        v.addSchema(supportContext, '/supportContext');
        v.addSchema(supportMessage, '/supportMessage');
        var response = await v.validate(data?.body, supportValidation)
        console.log("validation errors",response["errors"]);
        let schemaErrors = []
        if (response["errors"].length == 0) {
            return { validation_flag: true, error_list: schemaErrors }
        }
        schemaErrors = await this.validationErrorMessages(response["errors"])
        return { validation_flag: false, error_list: schemaErrors }
    }
    validateStatus = async (data: any) => {
        v.addSchema(statusContext, '/statusContext');
        v.addSchema(statusMessage, '/statusMessage');
        var response = await v.validate(data?.body, statusValidation)
        console.log("validation errors",response["errors"]);
        let schemaErrors = []
        if (response["errors"].length == 0) {
            return { validation_flag: true, error_list: schemaErrors }
        }
        schemaErrors = await this.validationErrorMessages(response["errors"])
        return { validation_flag: false, error_list: schemaErrors }
    }
    validateUpdate = async (data: any) => {
        v.addSchema(updateContext, '/updateContext');
        v.addSchema(updateMessage, '/updateMessage');
        var response = await v.validate(data?.body, updateValidation)
        console.log("validation errors",response["errors"]);
        let schemaErrors = []
        if (response["errors"].length == 0) {
            return { validation_flag: true, error_list: schemaErrors }
        }
        schemaErrors = await this.validationErrorMessages(response["errors"])
        return { validation_flag: false, error_list: schemaErrors }
    }
    
    
}


export default BPPValidator