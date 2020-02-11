'use strict'

import { DynamoDB } from 'aws-sdk';
import bunyan from 'bunyan';
import {configureDynamoDB} from './utils/lambdaConfig'
import {getUserFromRequestSession} from './utils/requestSession'

const dynamodb = configureDynamoDB();
const TableName = process.env.MESSAGES_DYNAMODB_TABLE || '';
const RequestSessionTableName = process.env.REQUEST_SESSION_DYNAMODB_TABLE || '';
const logger = bunyan.createLogger({name: "getMessageLambda"});

export interface GetMessageEventInput {
    arguments: {
        deviceId: string,
        timestamp: number
    },
    identity: any,
    request: any
}

export const handler = async (event: GetMessageEventInput): Promise<any> => {
    logger.info(event);
    const requestTraceId: string = event.request.headers['x-amzn-trace-id']
    const user = await getUserFromRequestSession(RequestSessionTableName, requestTraceId)
    logger.info({user: user})

    const message = {
        deviceId: "F123",
        timestamp: "2019-08-29T23:49:35Z",
        message: "a message",
        messageType: "TYPE",
        customErrors: [
            {
                message: "Error calling downstream API",
                errorType: "REST_API",
                errorInfo: {
                    code: "INTERNAL_SERVER_ERROR",
                    status: 500,
                },
            },
            {
                message: "Error with GraphQL query",
                errorType: "GRAPHQL",
                errorInfo: {
                    code: "VALIDATION_ERROR",
                },
            },
        ],
    }
    return message

    // const dbParams: DynamoDB.DocumentClient.GetItemInput = {
    //     TableName,
    //     Key: {
    //         deviceId: event.arguments.deviceId,
    //         timestamp: event.arguments.timestamp
    //     }
    // };

    // try {
    //     const data = await dynamodb.get(dbParams).promise();
    //     logger.info('Successfully got message:', data.Item);
    //     return data.Item;
    //   } catch (err) {
    //     logger.error('ERROR:', err);
    //     return err;
    // }
}