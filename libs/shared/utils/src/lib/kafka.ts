
import { Kafka, logLevel, CompressionTypes } from 'kafkajs';
import * as net from 'net'

let kafkaInstance : Kafka | null = null;
let producerInstance : any | null = null;


function getKafkaInstance(client_id:string, brokers:string[], ssl:boolean, host_name_or_ip:string, port_number:number) {
    if (!kafkaInstance) {
        kafkaInstance = new Kafka({
                clientId: client_id,
                brokers: brokers,
                socketFactory: ({ host, port, ssl, onConnect }) => {
                    const socket = net.connect({host:host_name_or_ip,port:port_number},onConnect);
                    socket.setMaxListeners(20);
                    socket.setNoDelay(true);
                    return socket;
                },
                ssl: ssl,
                connectionTimeout: 30000,  // You can adjust this timeout as necessary
                requestTimeout: 30000,     // You can adjust this timeout as necessary
                // logLevel: logLevel.DEBUG, // Enable detailed logging
        });
    }
    return kafkaInstance;
}
async function getKafkaProducerInstance(client_id:string, brokers:string[], ssl:boolean, host_name_or_ip:string, port_number:number) {
    if (!producerInstance) {
        const kafka = getKafkaInstance(client_id, brokers, ssl, host_name_or_ip, port_number);
        producerInstance = kafka.producer({
            // allowAutoTopicCreation: true,
            transactionTimeout: 10000,
            retry: {
                retries: 1,
                maxRetryTime: 3,
            },
        });
        await producerInstance.connect()
    }
    return producerInstance;
}
async function ProduceEachMsgtoKafka(producer:any, topic:string="", message:string="", key:string="", headers:any={}, partition:number=0 ){    
    await producer.connect()
    let response = await producer.send({
        topic: topic,
        messages: [
            // {key:key, value: message, headers:headers, partition:partition},
            {key:key, value: message},
        ],
    })
    console.log(JSON.stringify(response))
    await producer.disconnect();
}

//batch if needed will add that

async function createTopicInKafka(kafkaInstance:Kafka,  topic_name:string, number_of_partitions:number=1, replicationFactor:number=1,message_retention_time:string='18000000'){
    try{
        let admin = kafkaInstance.admin()
        await admin.connect();
        // Create a new topic
        const topicsCreated = await admin.createTopics({
            topics: [
                {
                    topic: topic_name,
                    numPartitions: number_of_partitions,
                    replicationFactor: replicationFactor,
                    configEntries: [
                        {
                            name: 'retention.ms',
                            value: message_retention_time 
                        }
                    ]
                }
            ]
        });

        if (topicsCreated) {
            console.log('Topic created successfully.');
        } else {
            console.log('Topic already exists or failed to create.');
        }
        await admin.disconnect();
    }
    catch(err){
        console.log("Error =======>>>>", err)
    }
}

async function createAllTopicsInKafka(kafkaInstance:Kafka,  topics_arr:any){
    try{
        topics_arr.map(async (topic_details:any)=>{
            await createTopicInKafka(kafkaInstance, topic_details?.topic_name, topic_details?.number_of_partitions,topic_details?.replication_factor,topic_details?.message_retention_time)
        })
    }
    catch(err){
        console.log("Error =======>>>>", err)
    }
}
export { getKafkaInstance, getKafkaProducerInstance, ProduceEachMsgtoKafka, createTopicInKafka, createAllTopicsInKafka };

