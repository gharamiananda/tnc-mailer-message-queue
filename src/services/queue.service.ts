import { Client } from "@upstash/qstash";
import { env } from "../config/env";

const qstash = new Client({ token: env.QSTASH_TOKEN });

export interface BatchPayload {
  recipients: Array<{
    recipientId:  string;
    name:         string;
    email:        string;
    designation:  string;
    token:        string;
  }>;
}

export async function enqueueBatch(payload: BatchPayload): Promise<void> {
  await qstash.publishJSON({
    url:     `${env.WORKER_BASE_URL}/api/worker/send-batch`,
    body:    payload,
    retries: 3,
  });
}