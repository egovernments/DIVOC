import {appIndexDb} from "../AppDatabase";
import {is24hoursAgo} from "../SyncFacade";

const PATIENTS = "patients";
const QUEUE = "queue";
const STASH_DATA = "stash_data";

class QueueDB {


    getDB() {
        if (!this.db) {
            this.db = appIndexDb.db;
        }
        return this.db
    }

    async stashData() {
        const userDetails = await appIndexDb.getUserDetails()
        const db = this.getDB();
        if (userDetails && userDetails.mobile_number) {
            const queue = await db.getAll(QUEUE);
            if (queue && queue.length > 0) {
                const patients = await db.getAll(PATIENTS);
                const stashUserData = {
                    userId: userDetails.mobile_number,
                    date: new Date().toISOString(),
                    queue: queue,
                    patients: patients
                }
                await db.put(STASH_DATA, stashUserData);
            }
        }
    }

    async popData() {
        const userDetails = await appIndexDb.getUserDetails()
        const db = this.getDB();
        if (userDetails && userDetails["mobile_number"]) {
            const userId = userDetails["mobile_number"]
            const stashQueue = await db.get(STASH_DATA, userId);
            if (stashQueue) {
                const stashDate = new Date(stashQueue.date);
                if (!is24hoursAgo(stashDate)) {
                    await this.saveQueue(stashQueue.queue);
                    await this.saveRecipient(stashQueue.patients);
                }
                await db.delete(STASH_DATA, userId);
            }
        }
    }

    async saveRecipient(recipient) {
        if (recipient && recipient.length > 0) {
            const db = this.getDB()
            for (const recipientItem of recipient) {
                await db.put(PATIENTS, recipientItem);
            }
        }
    }

    async saveQueue(queue) {
        if (queue && queue.length > 0) {
            const db = this.getDB()
            for (const queueItem of queue) {
                await db.put(QUEUE, queueItem);
            }
        }
    }
}

export const queueDb = new QueueDB()
