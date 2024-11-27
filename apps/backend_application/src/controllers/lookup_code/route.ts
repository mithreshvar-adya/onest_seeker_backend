import express from 'express';
import handler from './handler';
import { authentication } from "@adya/shared";
import { 
    validate,
    createLookupCodeSchema,
    bulkCreateLookupCodeSchema,
    updateLookupCodeSchema,
    envSchema,
    updateEnvSchema,
    listQuerySchema
} from './validation';

const router = express.Router();
const newHandler = handler.getInstance();

// Lookup Code routes
router.post('/create_bulk_lookup_code', 
    authentication, 
    validate(bulkCreateLookupCodeSchema), 
    newHandler.createBulkLookupCode
);

router.post('/create', 
    authentication, 
    validate(createLookupCodeSchema), 
    newHandler.createLookupCode
);

router.get('/get/:id', 
    authentication, 
    newHandler.getLookupCode
);

router.get('/get_all', 
    authentication, 
    validate(listQuerySchema), 
    newHandler.listLookupCode
);

router.post('/update/:id',
    authentication, 
    validate(updateLookupCodeSchema), 
    newHandler.updateLookupCode
);

router.delete('/delete/:id',
    authentication, 
    newHandler.deleteLookupCode
);

// Global ENV routes
router.post('/create/env', 
    authentication, 
    validate(envSchema), 
    newHandler.createEnv
);

router.post('/updateEnv/env', 
    authentication, 
    validate(updateEnvSchema), 
    newHandler.updateEnv
);

export default router;
