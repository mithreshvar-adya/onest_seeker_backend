const confirmContext = {
    "id": "/confirmContext",
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
            "enum": [ "on_confirm"]
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

const confirmMessage = {
    "id": "/confirmMessage",
    "type": "object",
    "required": [
        "order"
    ],
    "additionalProperties": true,
    "properties": {
        "order": {
            "type": "object",
            "required": [
                "id",
                "provider",
                "items",
                "fulfillments"
            ],
            
            "properties": {
                "id": { "type": "string" },
                "provider": {
                    "type": "object",
                    "required": [
                        "descriptor",
                        "locations"
                    ],
                    
                    "properties": {
                        "descriptor": {
                            "type": "object",
                            "required": [
                                "name"
                            ],
                            
                            "properties": {
                                "name": { "type": "string" }
                            }
                        },
                        "locations": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "required": [
                                    "id"
                                ],
                                
                                "properties": {
                                    "id": { "type": "string" }
                                }
                            }
                        }
                    }
                },
                "items": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": [
                            "id",
                            "descriptor",
                            "fulfillment_ids"
                        ],
                        
                        "properties": {
                            "id": { "type": "string" },
                            "descriptor": {
                                "type": "object",
                                "required": [
                                    "name",
                                    "long_desc"
                                ],
                                
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
                },
                "fulfillments": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": [
                            "id",
                            "state",
                            "customer"
                        ],
                        
                        "properties": {
                            "id": { "type": "string" },
                            "state": {
                                "type": "object",
                                "required": [
                                    "descriptor",
                                    "updated_at"
                                ],
                                
                                "properties": {
                                    "descriptor": {
                                        "type": "object",
                                        "required": [
                                            "code",
                                            "name"
                                        ],
                                        
                                        "properties": {
                                            "code": { 
                                    
                                                "enum": ["APPLICATION-STARTED", "APPLICATION-IN-PROGRESS", "APPLICATION-FILLED", "APPLICATION-SUBMITTED", "APPLICATION-REJECTED", "ASSESSMENT-IN-PROGRESS", "OFFER-EXTENDED", "OFFER-ACCEPTED", "OFFER-REJECTED"]
                                            },
                                            "name": { 
                                          
                                                "enum": ["Application Started", "Application in Progress", "Application Filled", "Application Submitted", "Application Rejected", "Assessment in Progress", "Offer Extended", "Offer Accepted", "Offer Rejected"]
                                            }
                                        }
                                    },
                                    "updated_at": { "type": "string" }
                                }
                            },
                            "customer": {
                                "type": "object",
                                "required": [
                                    "person",
                                    "contact"
                                ],
                                
                                "properties": {
                                    "person": {
                                        "type": "object",
                                        "required": [
                                            "name",
                                            "gender",
                                            "age"
                                        ],
                                        
                                        "properties": {
                                            "name": { "type": "string" },
                                            "gender": { 
                                                "type": "string",
                                                "enum": ["Male", "Female", "Transgender", "Other"]
                                            },
                                            "age": { "type": "string" }
                                        }
                                    },
                                    "contact": {
                                        "type": "object",
                                        "required": [
                                            "phone",
                                            "email"
                                        ],
                                        
                                        "properties": {
                                            "phone": { "type": "string" },
                                            "email": { "type": "string" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

const confirmValidation = {
    "id": "/confirm",
    "type": "object",
    "properties": {
        "context": { "$ref": "/confirmContext" },
        "message": { "$ref": "/confirmMessage" }
    }
};

export { confirmContext, confirmMessage, confirmValidation };
