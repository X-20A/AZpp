import Dexie from 'dexie';
import Settings from './settings';
import Content from './content';

export default class azppDatabase extends Dexie {
    settings!: Dexie.Table<Settings, string>;
    contents!: Dexie.Table<Content, string>;

    constructor() {
        super('azpp');

        this.version(1).stores({
            settings: 'id',
            contents: 'id',
        });
    }
}