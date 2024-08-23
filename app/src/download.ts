import type { Session } from 'electron';

export class DownloadManger {
    constructor(session: Session) {
        session.addListener('will-download', (e, item) => {
            console.log(item);
        });
    }
}
