const updateContext = {
    "id": "/updateContext",
    "type": "object",
    "required": [],
    "additionalProperties": true,
    "properties": {}
};

const updateMessage = {
    "id": "/updateMessage",
    "type": "object",
    "required": [],
    "additionalProperties": true,
    "properties": {}
}

const updateValidation = {
    "id": "/update",
    "type": "object",
    "properties": {
        "context": { "$ref": "/updateContext" },
        "message": { "$ref": "/updateMessage" },
    }
};

export { updateContext, updateMessage, updateValidation };