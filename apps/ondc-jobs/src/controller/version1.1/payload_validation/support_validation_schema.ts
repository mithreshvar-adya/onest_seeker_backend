const supportContext = {
    "id": "/supportContext",
    "type": "object",
    "required": [],
    "additionalProperties": true,
    "properties": {}
};

const supportMessage = {
    "id": "/supportMessage",
    "type": "object",
    "required": [],
    "additionalProperties": true,
    "properties": {}
}

const supportValidation = {
    "id": "/support",
    "type": "object",
    "properties": {
        "context": { "$ref": "/supportContext" },
        "message": { "$ref": "/supportMessage" },
    }
};

export { supportContext, supportMessage, supportValidation };