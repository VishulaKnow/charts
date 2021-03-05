export class NamesManager {
    private static prefix = 'charts-';

    public static getClassName(classOfElem: string): string {
        return this.prefix + classOfElem;
    }

    public static getId(idName: string, blockId: number): string {
        return this.prefix + idName + '-' + blockId;
    }
}