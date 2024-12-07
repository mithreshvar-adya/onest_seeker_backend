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
        "domain": { "enum": ["ONDC:ONEST10"] },
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
        "timestamp": { "type": "string"}
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
                                            "enum": ["REMOTE", "HYBRID", "ONSITE"]
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
                                        }
                                    },
                                    "required": ["id", "descriptor", "fulfillment_ids"]
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
        "message": { "$ref": "/searchMessage" },
    }
};

export { searchContext, searchMessage, searchValidation };
