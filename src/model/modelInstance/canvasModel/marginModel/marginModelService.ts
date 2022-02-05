import { MarginSide } from "./canvasMarginModel";


interface MarginIncreaseLog {
    key: string;
    data: MarginLogData;
}

export interface MarginLogData {
    side: MarginSide;
    byValue: number;
}

export class MarginModelService {
    private log: MarginIncreaseLog[] = [];

    appendLog(key: string, side: MarginSide, byValue: number) {
        const log = this.findLogByKey(key);
        if (log) {
            log.data = { side, byValue }
            return;
        }

        this.log.push({
            key,
            data: {
                side,
                byValue
            }
        });
    }

    getDataByKey(key: string) {
        return this.findLogByKey(key)?.data;
    }

    private findLogByKey(key: string) {
        return this.log.find(l => l.key === key);
    }
}