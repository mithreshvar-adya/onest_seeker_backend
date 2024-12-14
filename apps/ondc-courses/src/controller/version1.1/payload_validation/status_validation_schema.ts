const statusContext = {
    "id": "/statusContext",
    "type": "object",
    "required": [
        "domain",
        "action",
        "version",
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
            "enum": ["on_status"] 
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

const statusMessage = {
    "id": "/statusMessage",
    "type": "object",
    // "required": ["order","catalog"],
    "required": ["order"],
    "additionalProperties": true,
    "properties": {
        "order": {
            "type": "object",
            "properties": {
                "id": { "type": "string" },
                "provider": {
                    "type": "object",
                    "properties": {
                        "descriptor": {
                            "type": "object",
                            "properties": {
                                "name": { "type": "string" }
                            },
                            "required": ["name"]
                        },
                        // "locations": {
                        //     "type": "array",
                        //     "items": {
                        //         "type": "object",
                        //         "properties": {
                        //             "id": { "type": "string" }
                        //         },
                        //         "required": ["id"]
                        //     }
                        // }
                    },
                    "required": ["descriptor"]
                },
                "items": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": { "type": "string" },
                            "fulfillment_ids": {
                                "type": "array",
                                "items": { "type": "string" }
                            }
                        },
                        "required": ["id", "fulfillment_ids"]
                    }
                },
                "fulfillments": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": { "type": "string" },
                            "state": {
                                "type": "object",
                                "properties": {
                                    "descriptor": {
                                        "type": "object",
                                        "properties": {
                                            "code": {
                                                "enum": ["NOT-STARTED", "IN-PROGRESS", "COMPLETED", "ACTIVE", "EXPIRED"]
                                            },
                                            "name": {
                                                "enum": ["Not Started", "In Progress", "Completed", "Active", "Expired"]
                                            }
                                        },
                                        "required": ["code", "name"]
                                    },
                                    "updated_at": { "type": "string"}
                                },
                                "required": ["descriptor", "updated_at"]
                            },
                            "customer": {
                                "type": "object",
                                "properties": {
                                    "person": {
                                        "type": "object",
                                        "properties": {
                                            "name": { "type": "string" }
                                        },
                                        "required": ["name"]
                                    },
                                    "contact": {
                                        "type": "object",
                                        "properties": {
                                            "phone": { "type": "string" },
                                            "email": { "type": "string" }
                                        },
                                        "anyOf": [
                                            { "required": ["phone"] },
                                            { "required": ["email"] }
                                        ],
                                    }
                                },
                                "required": ["person", "contact"]
                            }
                        },
                        "required": ["id", "state", "customer"]
                    }
                }
            },
            "required": ["id", "provider", "items", "fulfillments"]
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

const statusValidation = {
    "id": "/status",
    "type": "object",
    "properties": {
        "context": { "$ref": "/statusContext" },
        "message": { "$ref": "/statusMessage" }
    }
};

export { statusContext, statusMessage, statusValidation };
