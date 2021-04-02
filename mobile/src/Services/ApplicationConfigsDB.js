import {appIndexDb} from "../AppDatabase";

const APPLICATION_CONFIGS = "application_configs";

class ApplicationConfigsDB {

    async getApplicationConfigs() {
        return await this.getDB().get(APPLICATION_CONFIGS, APPLICATION_CONFIGS)
    }

    async saveApplicationConfigs(configs) {
        return this.getDB().put(APPLICATION_CONFIGS, configs, APPLICATION_CONFIGS);
    }

    getDB() {
        if (!this.db) {
            this.db = appIndexDb.db;
        }
        return this.db
    }

}


export const applicationConfigsDB = new ApplicationConfigsDB();
