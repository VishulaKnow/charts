import { MarginSide } from "./canvasModel";

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
        this.log.push({
            key,
            data: {
                side,
                byValue
            }
        });
    }

    getDataByKey(key: string) {
        return this.log.find(l => l.key === key)?.data;
    }
}