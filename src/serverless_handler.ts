import { serverless } from '@probot/serverless-lambda'
import { probotApp } from './probot_app';

export const probot = serverless(probotApp);
