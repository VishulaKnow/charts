import { DataSource } from "../model/model";

type Condition = '>' | '<' | '=' | '<=' | '>='


export interface IDataModel {
    source: DataSource;
    filter: (dataSourceName: string, filterParams: FilterParams[]) => void;
}

interface FilterParams {
    fieldName: string;
    condition: Condition;
    compareTo: string | number | Date;
}

export class DataModel implements IDataModel {
    public source: DataSource;
    public filter(dataSourceName: string, filterParams: FilterParams[]): void {
        throw new Error('');
    }
}

