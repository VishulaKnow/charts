const compare = (groupList: string[], userGroups: string[], and: boolean = true): boolean => {
    if (!groupList || !userGroups) return false;
    if (and && groupList.length > userGroups.length) return false;
    if (groupList.length === 0 || userGroups.length === 0) return false;

    let findedOne = false;
    for (let i = 0; i < groupList.length; i++) {
        const finded = userGroups.findIndex((el) => el === groupList[i]) !== -1;
        if (and && !finded) return false;
        if (!findedOne && finded) findedOne = true;
    }

    return findedOne;
};

describe("AND", () => {
    let arrPri: string[];
    let arrInp: string[];

    beforeEach(() => {
        arrPri = ["apple", "samsung", "lg"];
        arrInp = ["samsung", "lg", "apple"];
    });

    it("nulls arrays", () => {
        arrPri = null;
        arrInp = null;
        const res = compare(arrPri, arrInp);
        expect(res).toEqual(false);
    });

    it("empty arrays", () => {
        arrPri = [];
        arrInp = [];
        const res = compare(arrPri, arrInp);
        expect(res).toEqual(false);
    });

    it("arrays with diff length but has common", () => {
        arrPri = ["apple"];
        const res = compare(arrPri, arrInp);
        expect(res).toEqual(true);
    });

    it("arrays with diff length hasn't common", () => {
        arrPri = ["test1"];
        const res = compare(arrPri, arrInp);
        expect(res).toEqual(false);
    });

    it("equal arrays", () => {
        arrPri = ["samsung", "lg", "apple"];
        const res = compare(arrPri, arrInp);
        expect(res).toEqual(true);
    });

    it("equal arrays with diff orders", () => {
        const res = compare(arrPri, arrInp);
        expect(res).toEqual(true);
    });
});

describe("OR", () => {
    let arrPri: string[];
    let arrInp: string[];

    beforeEach(() => {
        arrPri = ["apple", "samsung", "lg"];
        arrInp = ["samsung", "lg", "apple"];
    });

    it("nulls arrays", () => {
        arrPri = null;
        arrInp = null;
        const res = compare(arrPri, arrInp, false);
        expect(res).toEqual(false);
    });

    it("empty arrays", () => {
        arrPri = [];
        arrInp = [];
        const res = compare(arrPri, arrInp, false);
        expect(res).toEqual(false);
    });

    it("arrays with diff length but has common", () => {
        arrPri = ["apple"];
        const res = compare(arrPri, arrInp, false);
        expect(res).toEqual(true);
    });

    it("arrays with diff length but has common 2", () => {
        arrPri = ["apple", "test", "test2"];
        const res = compare(arrPri, arrInp, false);
        expect(res).toEqual(true);
    });

    it("arrays with diff length without common", () => {
        arrPri = ["test"];
        const res = compare(arrPri, arrInp, false);
        expect(res).toEqual(false);
    });

    it("arrays with diff length without common 2", () => {
        arrPri = ["test", "test2", "test3"];
        const res = compare(arrPri, arrInp, false);
        expect(res).toEqual(false);
    });

    it("equal arrays", () => {
        arrPri = ["samsung", "lg", "apple"];
        const res = compare(arrPri, arrInp, false);
        expect(res).toEqual(true);
    });

    it("equal arrays with diff orders", () => {
        const res = compare(arrPri, arrInp, false);
        expect(res).toEqual(true);
    });
});
