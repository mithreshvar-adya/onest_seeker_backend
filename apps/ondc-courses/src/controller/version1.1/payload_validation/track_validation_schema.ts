const trackContext = {
    "id": "/trackContext",
    "type": "object",
    "required": [],
    "additionalProperties": true,
    "properties": {}
};

const trackMessage = {
    "id": "/trackMessage",
    "type": "object",
    "required": [],
    "additionalProperties": true,
    "properties": {}
}

const trackValidation = {
    "id": "/track",
    "type": "object",
    "properties": {
        "context": { "$ref": "/trackContext" },
        "message": { "$ref": "/trackMessage" },
    }
};

export { trackContext, trackMessage, trackValidation };