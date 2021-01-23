import Engine from "../engine/engine";
import { DataModel } from "./dataModel";

interface Dashboard {
    dataModel: DataModel;
    engines: Engine[];
}

