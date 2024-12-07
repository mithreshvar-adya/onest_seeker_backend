import express from 'express';
import SseController from './handler';

const sseController = new SseController();
const rootRouter = express.Router();

// rootRouter.get('/events', sseController.createEvent); // frontend call
// rootRouter.post('/wb_listener/:id', sseController.adaptorOnSearch); // adptor call


rootRouter.get('/events',sseController.startEvent); // frontend call
rootRouter.post('/listener/:id', sseController.emitEventSearch);  // adptor call
rootRouter.post('/on_search/:id', sseController.emitEventSearch);
rootRouter.post('/on_select/:id', sseController.emitEventSelect);
rootRouter.post('/on_init/:id', sseController.emitEventinit);
rootRouter.post('/on_confirm/:id', sseController.emitEventConfirm);




export default rootRouter;