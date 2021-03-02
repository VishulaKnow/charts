export class Namer {
    private static prefix = 'charts-';

    public static getClassName(classOfElem: string): string {
        return this.prefix + classOfElem;
    }

    public static getId(idName: string, chartId: number): string {
        return this.prefix + idName + '-' + chartId;
    }
}