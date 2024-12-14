const selectContext = {
    "id": "/selectContext",
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
        "domain": { "enum": ["onest:work-opportunities"] },
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
        "timestamp": { "type": "string"}
    }
};

const selectMessage = {
    "id": "/selectMessage",
    "type": "object",
    "required": [ "order" ],
    "additionalProperties": true,
    "properties": {
        "order": {
            "type": "object",
            "properties": {
                "provider": {
                    "type": "object",
                    "properties": {
                        "id": { "type": "string" },
                        "descriptor": {
                            "type": "object",
                            "properties": {
                                "name": { "type": "string" }
                            },
                            "required": ["name"]
                        },
                        "fulfillments": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "id": { "type": "string" },
                                    "type": { 
                                        "enum": ["REMOTE", "HYBRID", "ONSITE"]
                                    }
                                },
                                "required": ["id", "type"]
                            }
                        }
                    },
                    "required": ["id", "descriptor", "fulfillments"]
                },
                "items": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": { "type": "string" },
                            "descriptor": {
                                "type": "object",
                                "properties": {
                                    "name": { "type": "string" },
                                    "long_desc": { "type": "string" }
                                },
                                "required": ["name", "long_desc"]
                            },
                            "fulfillment_ids": {
                                "type": "array",
                                "items": { "type": "string" }
                            }
                        },
                        "required": ["id", "descriptor", "fulfillment_ids"]
                    }
                }
            },
            "required": ["provider", "items"]
        }
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