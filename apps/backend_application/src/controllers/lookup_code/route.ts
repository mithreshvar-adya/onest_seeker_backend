import express from 'express';
import handler from './handler';

const router = express.Router();
const newHandler = handler.getInstance();

router.post('/create_bulk_lookup_code', newHandler.createBulkLookupCode);
router.post('/create', newHandler.createLookupCode);
router.get('/get/:id', newHandler.getLookupCode);
router.get('/get_all/', newHandler.listLookupCode);
router.post('/update/:id',newHandler.updateLookupCode);
router.delete('/delete/:id',newHandler.deleteLookupCode);
// router.get('/:lookup_type',newHandler.listLookupCodeByLookupType)

// Global ENV
router.post('/create/env', newHandler.createEnv);
router.post('/updateEnv/env', newHandler.updateEnv);

export default router;
