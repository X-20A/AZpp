import Dexie from 'dexie';
export default class azppDatabase extends Dexie {
    settings;
    contents;
    constructor() {
        super('azpp');
        this.version(1).stores({
            settings: 'id',
            contents: 'id',
        });
    }
}
//# sourceMappingURL=db.js.map