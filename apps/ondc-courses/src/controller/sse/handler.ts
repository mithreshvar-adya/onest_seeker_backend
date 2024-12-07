import { Dump } from '@adya/shared';
import EventEmitter from 'events';
import axios from "axios"
import { OnActions } from "@adya/shared";
import SelectService from '../version1.1/select/service';
import InitService from '../version1.1/init/service';
import ConfirmService from '../version1.1/confirm/service';
import Sseservice from './service'

// const sseProtocolService = new SseProtocol();
const sseService = Sseservice.getInstance();
const course_dump = Dump.getInstance();
const eventEmitters = new Map();
const on_action = new OnActions()
import { JsonWebToken } from "@adya/shared";
import { GlobalEnv } from '../../config/env';


const jsonWebToken = new JsonWebToken()

class SseController {

    /**
    * on event 
    * @param {*} req    HTTP request object
    * @param {*} res    HTTP response object
    * @param {*} next   Callback argument to the middleware function
    * @return {callback}
    */

    async startEvent(req, res) {
        const { query } = req;
        const msgId = query?.message_id
        const course_id = query?.course_id
        const action = query?.action
        console.log("Action for Event Creation:",action,course_id);
        
        if (action == "select") {
            const decoded = await jsonWebToken.verify((req.headers.authorization).split(" ")[1])
            const user_id = decoded?.id
            sseService.select(msgId, user_id, course_id)
        }


        if (!msgId) {
            return res.status(400).send('Message ID is required');
        }

        // Create a new EventEmitter for the given msgId if not exists
        if (!eventEmitters.has(msgId)) {
            eventEmitters.set(msgId, new EventEmitter());
            console.log(`Event emitter created for msgId: ${msgId}`);
        }

        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Send initial message to client
        res.write('data: Event stream started\n\n');

        // Listen for messages and send them to the client
        const emitter = eventEmitters.get(msgId);
        emitter.on('message', (data) => {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        });

        // End the event after 10 seconds
        setTimeout(() => {
            eventEmitters.delete(msgId);
            res.write('data: Event stream ended\n\n');
            res.end();
            console.log(`Event stream ended for msgId: ${msgId}`);
        }, 120000);

    }

    async emitEventSearch(req, res) {
        const { params, body } = req
        const data = body;
        const msgId = params?.id

        if (!msgId || !data) {
            return res.status(400).send('Message ID and data are required');
        }

        const emitter = eventEmitters.get(msgId);
        if (!emitter) {
            return res.status(404).send(`No event found for message ID: ${msgId}`);
        }

        console.log("Received Messege From L1 On_search", params?.id);
        // course_dump.create({ dump: data })

        // Emit the data to the corresponding event
        emitter.emit('message', data);

        const response = {
            message: "Data emitted to event with message ID for on_search",
            id:msgId,
            status:true
        }
        // res.send(`Data emitted to event with message ID for on_search: ${msgId}`);
        res.send(response);

    }

    async emitEventSelect(req, res) {
        const { params, body } = req
        const data = body;
        const msgId = params?.id

        if (!msgId || !data) {
            return res.status(400).send('Message ID and data are required');
        }

        const emitter = eventEmitters.get(msgId);
        if (!emitter) {
            return res.status(404).send(`No event found for message ID: ${msgId}`);
        }

        console.log("Received Messege From L1 On_select", params?.id);
        // course_dump.create({ dump: data })

        // Emit the data to the corresponding event
        emitter.emit('message', data);

        // res.send(`Data emitted to event with message ID for on_select: ${msgId}`);
        const response = {
            message: "Data emitted to event with message ID for on_select",
            id:msgId,
            status:true
        }
        res.send(response);

        console.log("RECEIVED ON_SELECT on L1 Adaptor ==========>>>>>>", body);
        const create_payload = {
            "transaction_id": body?.context?.transaction_id,
            "action": body?.context?.action,
            "message_id": body?.context?.message_id,
            "response": body
        }
        await on_action.createOnAction(GlobalEnv.MONGO_DB_URL, GlobalEnv.MONGO_DB_NAME, create_payload)
        if (!(body?.error && body?.error?.code)) {
            const service = SelectService.getInstance()
            service.on_select(body?.context, body?.message)
        }

    }

    async emitEventinit(req, res) {
        const { params, body } = req
        const data = body;
        const msgId = params?.id

        if (!msgId || !data) {
            return res.status(400).send('Message ID and data are required');
        }

        const emitter = eventEmitters.get(msgId);
        if (!emitter) {
            return res.status(404).send(`No event found for message ID: ${msgId}`);
        }

        console.log("Received Messege From L1 On_init", params?.id);
        emitter.emit('message', data);

        // res.send(`Data emitted to event with message ID for on_init: ${msgId}`);
        const response = {
            message: "Data emitted to event with message ID for on_init",
            id:msgId,
            status:true
        }
        res.send(response);

        console.log("RECEIVED ON_INIT on L1 Adaptor ==========>>>>>>", body);
        const create_payload = {
            "transaction_id": body?.context?.transaction_id,
            "action": body?.context?.action,
            "message_id": body?.context?.message_id,
            "response": body
        }
        await on_action.createOnAction(GlobalEnv.MONGO_DB_URL,GlobalEnv.MONGO_DB_NAME, create_payload)
        if (!(body?.error && body?.error?.code)) {
            const service = InitService.getInstance()
            service.on_init(body?.context, body?.message)
        }

    }

    async emitEventConfirm(req, res) {
        const { params, body } = req
        const data = body;
        const msgId = params?.id

        if (!msgId || !data) {
            return res.status(400).send('Message ID and data are required');
        }

        const emitter = eventEmitters.get(msgId);
        if (!emitter) {
            return res.status(404).send(`No event found for message ID: ${msgId}`);
        }

        console.log("Received Messege From L1 On_confirm", params?.id);
        emitter.emit('message', data);

        // res.send(`Data emitted to event with message ID for on_confirm: ${msgId}`);
        const response = {
            message: "Data emitted to event with message ID for on_confirm",
            id:msgId,
            status:true
        }
        res.send(response);

        console.log("RECEIVED ON_CONFIRM on L1 Adaptor ==========>>>>>>", body);
        const create_payload = {
            "transaction_id": body?.context?.transaction_id,
            "action": body?.context?.action,
            "message_id": body?.context?.message_id,
            "response": body
        }
        await on_action.createOnAction(GlobalEnv.MONGO_DB_URL,GlobalEnv.MONGO_DB_NAME,create_payload)
        if (!(body?.error && body?.error?.code)) {
            const service = ConfirmService.getInstance()
            service.on_confirm(body?.context, body?.message)
        }

    }
}

export default SseController;