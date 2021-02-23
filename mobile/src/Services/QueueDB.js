import {appIndexDb} from "../AppDatabase";

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
            const patients = await db.getAll(PATIENTS);

            const stashUserData = {
                userId: userDetails.mobile_number,
                queue: queue,
                patients: patients
            }
            await db.put(STASH_DATA, stashUserData);
        }
    }

    async popData() {
        const userDetails = await appIndexDb.getUserDetails()
        const db = this.getDB();
        if (userDetails && userDetails["mobile_number"]) {
            const userId = userDetails["mobile_number"]
            const stashQueue = await db.get(STASH_DATA, userId);
            if (stashQueue) {
                const queue = stashQueue.queue
                if (queue && queue.length > 0) {
                    for (const queueItem of queue) {
                        await db.put(QUEUE, queueItem);
                    }
                }

                const patients = stashQueue.patients
                if (patients && patients.length > 0) {
                    for (const patientItem of patients) {
                        await db.put(PATIENTS, patientItem);
                    }
                }

                await db.delete(STASH_DATA, userId);
            }
        }
    }
}

export const queueDb = new QueueDB()
