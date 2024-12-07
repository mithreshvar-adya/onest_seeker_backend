const searchContext = {
    "id": "/searchContext",
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
        "domain": { "enum": ["ONDC:ONEST11"] },
        "action": { 
            "enum": ["on_search"] 
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

const searchMessage = {
    "id": "/searchMessage",
    "type": "object",
    "required": ["catalog"],
    "additionalProperties": true,
    "properties": {
        "catalog": {
            "type": "object",
            "properties": {
                "descriptor": {
                    "type": "object",
                    "properties": {
                        "name": { "type": "string" }
                    },
                    "required": ["name"]
                },
                "providers": {
                    "type": "array",
                    "items": {
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
                                            "enum": ["IN-PERSON", "ONLINE", "HYBRID"]
                                        }
                                    },
                                    "required": ["id", "type"]
                                }
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
                                        },
                                        "price": {
                                            "type": "object",
                                            "properties": {
                                                "currency": { "type": "string" },
                                                "value": { "type": "string" },
                                                "maximum_value": { "type": "string" },
                                                "minimum_value": { "type": "string" }
                                            },
                                            "required": ["currency"],
                                            "anyOf": [
                                                { "required": ["maximum_value", "minimum_value"] },
                                               { "required": ["value"] }
                                             ]
                                        }
                                    },
                                    "required": ["id", "descriptor", "fulfillment_ids", "price"]
                                }
                            }
                        },
                        "required": ["id", "descriptor", "fulfillments", "items"]
                    }
                }
            },
            "required": ["descriptor", "providers"]
        }
    }
};

const searchValidation = {
    "id": "/search",
    "type": "object",
    "properties": {
        "context": { "$ref": "/searchContext" },
        "message": { "$ref": "/searchMessage" }
    }
};

export { searchContext, searchMessage, searchValidation };
