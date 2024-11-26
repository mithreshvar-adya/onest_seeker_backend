class ApiResponseFormat {
    dataArr:any
    data : any
    constructor() {
        this.dataArr = [];
        this.data = {};
    }

    SUCCESS_RESP(data:any, message:any) {
        return {
            meta: {
                status: true,
                message: message || ""
            },
            data: data || this.data
        };
    }

    FAILURE_RESP(data:any, error_details:any, message:any) {
        return {
            meta: {
                status: false,
                message: message || ""
            },
            error: error_details || {
                name: "",
                message: ""
            }
        };
    }

    SUCCESS_RESP_WITH_PAGINATION(pagination:any, data:any, message:any) {
        return {
            meta: {
                status: true,
                message: message || "",
                pagination: pagination || {
                    per_page: 0,
                    page_no: 0,
                    total_rows: 0,
                    total_pages: 0
                }
            },
            data: data ||  this.dataArr
        };
    }

    ONEST_ONDC_SUCCESS_RESP() {
        return {
            "message": {
                "ack": {
                    "status": "ACK"
                }
            }
        };
    }

    ONEST_ONDC_FAILURE_RESP(error_type:string="", error_code:string="",error_message:any="", error_path:any="") {
        return {
            "message": {
                "ack": {
                    "status": "NACK"
                }
            },
            "error": {
                "type": error_type,
                "code": error_code,
                "path": `${error_path}`,
                "message": `${error_message}`
            }
        };
    }
}

// Export the class instance
const apiResponse = new ApiResponseFormat();


export {
    apiResponse
};
