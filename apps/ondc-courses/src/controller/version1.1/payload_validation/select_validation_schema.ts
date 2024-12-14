const selectContext = {
    "id": "/selectContext",
    "type": "object",
    "required": [
        "domain",
        "version",
        "action",
        "bap_id",
        "bap_uri", 
        "bpp_id",
        "bpp_uri",
        "transaction_id",
        "message_id",
        "timestamp"
    ],
    "additionalProperties": true,
    "properties": {
        "domain": { "enum": ["onest:learning-experiences"] },
        "action": { 
            "enum": ["on_select"]
        },
        "version": { "type": "string" },
        "bap_id": { "type": "string" },
        "bap_uri": { "type": "string" },
        "bpp_id": { "type": "string" },
        "bpp_uri": { "type": "string" },
        "transaction_id": { "type": "string" },
        "message_id": { "type": "string" },
        "timestamp": { "type": "string" }
    }
};

const selectMessage = {
    "id": "/selectMessage",
    "type": "object",
    // "required": ["order", "catalog"],
    "required": ["order"],
    "additionalProperties": true,
    "properties": {
        "order": {
            "type": "object",
            "required": ["provider", "items"],
            "properties": {
                "provider": {
                    "type": "object",
                    // "required": ["id", "descriptor", "fulfillments"],
                    "required": ["id", "descriptor"],
                    "properties": {
                        "id": { "type": "string" },
                        "descriptor": {
                            "type": "object",
                            "required": ["name"],
                            "properties": {
                                "name": { "type": "string" }
                            }
                        },
                        // "fulfillments": {
                        //     "type": "array",
                        //     "items": {
                        //         "type": "object",
                        //         "required": ["id", "type"],
                        //         "properties": {
                        //             "id": { "type": "string" },
                        //             "type": { 
                        //                 "enum": ["IN-PERSON", "ONLINE", "HYBRID"]
                        //             }
                        //         }
                        //     }
                        // }
                    }
                },
                "items": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": ["id", "descriptor", "fulfillment_ids"],
                        "properties": {
                            "id": { "type": "string" },
                            "descriptor": {
                                "type": "object",
                                "required": ["name", "long_desc"],
                                "properties": {
                                    "name": { "type": "string" },
                                    "long_desc": { "type": "string" }
                                }
                            },
                            "fulfillment_ids": {
                                "type": "array",
                                "items": { "type": "string" }
                            }
                        }
                    }
                }
            }
        },
        // "catalog": {
        //     "type": "object",
        //     "properties": {
        //         "providers": {
        //             "type": "array",
        //             "items": {
        //                 "type": "object",
        //                 "properties": {
        //                     "items": {
        //                         "type": "array",
        //                         "items": {
        //                             "type": "object",
        //                             "properties": {
        //                                 "price": {
        //                                     "type": "object",
        //                                     "properties": {
        //                                         "currency": { "type": "string" },
        //                                         "value": { "type": "string" },
        //                                         "maximum_value": { "type": "string" },
        //                                         "minimum_value": { "type": "string" }
        //                                     },
        //                                     "required": ["currency"],
        //                                     "anyOf": [
        //                                         { "required": ["maximum_value", "minimum_value"] },
        //                                        { "required": ["value"] }
        //                                      ]
        //                                 }
        //                             },
        //                             "required": ["price"]
        //                         }
        //                     }
        //                 },
        //                 "required": ["items"]
        //             }
        //         }
        //     },
        //     "required": ["providers"]
        // }
    }
};

const selectValidation = {
    "id": "/select",
    "type": "object",
    "properties": {
        "context": { "$ref": "/selectContext" },
        "message": { "$ref": "/selectMessage" },
    }
};

export { selectContext, selectMessage, selectValidation };
