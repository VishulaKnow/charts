function checkRoles(rolesList: string[], userRoles: string[], and: boolean = true, not: boolean = false): boolean {
    if (!rolesList || !userRoles) return false;

    if (!not && (rolesList.length === 0 || userRoles.length === 0)) return false;
    if (not && rolesList.length === 0) return true;

    let includes: boolean;
    if (and) includes = userRoles.filter((g) => rolesList.includes(g)).length == rolesList.length;
    else includes = userRoles.some((g) => rolesList.includes(g));
    return not ? !includes : includes;
}

describe("common", () => {
    it("nulls arrays", () => {
        let arrPri = null;
        let arrInp = null;
        const res = checkRoles(arrPri, arrInp);
        expect(res).toEqual(false);
    });
});

describe("must include", () => {
    describe("AND", () => {
        let rolesList: string[];
        let userRoles: string[];

        beforeEach(() => {
            rolesList = ["a", "b", "c"];
            userRoles = ["b", "c", "a"];
        });

        it("empty arrays", () => {
            rolesList = [];
            userRoles = [];
            const res = checkRoles(rolesList, userRoles);
            expect(res).toEqual(false);
        });

        it("arrays with diff length but has common", () => {
            rolesList = ["a"];
            const res = checkRoles(rolesList, userRoles);
            expect(res).toEqual(true);
        });

        it("arrays with diff length hasn't common", () => {
            rolesList = ["test1"];
            const res = checkRoles(rolesList, userRoles);
            expect(res).toEqual(false);
        });

        it("equal arrays", () => {
            rolesList = ["b", "c", "a"];
            const res = checkRoles(rolesList, userRoles);
            expect(res).toEqual(true);
        });

        it("equal arrays with diff orders", () => {
            const res = checkRoles(rolesList, userRoles);
            expect(res).toEqual(true);
        });

        it("includes groups", () => {
            const userGroups = ["a", "b", "c"];
            const groups = ["a", "c"];
            const res = checkRoles(groups, userGroups);
            expect(res).toEqual(true);
        });
    });

    describe("OR", () => {
        let rolesList: string[];
        let userRoles: string[];

        beforeEach(() => {
            rolesList = ["a", "b", "c"];
            userRoles = ["b", "c", "a"];
        });

        it("empty arrays", () => {
            rolesList = [];
            userRoles = [];
            const res = checkRoles(rolesList, userRoles, false);
            expect(res).toEqual(false);
        });

        it("arrays with diff length but has common", () => {
            rolesList = ["a"];
            const res = checkRoles(rolesList, userRoles, false);
            expect(res).toEqual(true);
        });

        it("arrays with diff length but has common 2", () => {
            rolesList = ["a", "test", "test2"];
            const res = checkRoles(rolesList, userRoles, false);
            expect(res).toEqual(true);
        });

        it("arrays with diff length without common", () => {
            rolesList = ["test"];
            const res = checkRoles(rolesList, userRoles, false);
            expect(res).toEqual(false);
        });

        it("arrays with diff length without common 2", () => {
            rolesList = ["test", "test2", "test3"];
            const res = checkRoles(rolesList, userRoles, false);
            expect(res).toEqual(false);
        });

        it("equal arrays", () => {
            rolesList = ["b", "c", "a"];
            const res = checkRoles(rolesList, userRoles, false);
            expect(res).toEqual(true);
        });

        it("equal arrays with diff orders", () => {
            const res = checkRoles(rolesList, userRoles, false);
            expect(res).toEqual(true);
        });

        it("includes groups", () => {
            const userGroups = ["a", "b", "c"];
            const groups = ["a", "c"];
            const res = checkRoles(groups, userGroups, false);
            expect(res).toEqual(true);
        });
    });
});

describe("must not include", () => {
    describe("AND", () => {
        let rolesList: string[];
        let userRoles: string[];

        beforeEach(() => {
            rolesList = ["a", "b", "c"];
            userRoles = ["b", "c", "a"];
        });

        it("empty roles", () => {
            rolesList = [];
            const result = checkRoles(rolesList, userRoles, true, true);
            expect(result).toBe(true);
        });

        it("one role and user has it", () => {
            rolesList = ["a"];
            const result = checkRoles(rolesList, userRoles, true, true);
            expect(result).toBe(false);
        });

        it("one role and user doesn't have it", () => {
            rolesList = ["d"];
            const result = checkRoles(rolesList, userRoles, true, true);
            expect(result).toBe(true);
        });

        it("user has some roles, but not all", () => {
            rolesList = ["a", "c", "d", "f"];
            const result = checkRoles(rolesList, userRoles, true, true);
            expect(result).toBe(true);
        });

        it("user has all roles", () => {
            const result = checkRoles(rolesList, userRoles, true, true);
            expect(result).toBe(false);
        });

        it("empty user roles", () => {
            userRoles = [];
            const result = checkRoles(rolesList, userRoles, true, true);
            expect(result).toBe(true);
        });
    });

    describe("OR", () => {
        let rolesList: string[];
        let userRoles: string[];

        beforeEach(() => {
            rolesList = ["a", "b", "c"];
            userRoles = ["b", "c", "a"];
        });

        it("one role and user has it", () => {
            rolesList = ["a"];
            const result = checkRoles(rolesList, userRoles, false, true);
            expect(result).toBe(false);
        });

        it("one role and user doesn't have it", () => {
            rolesList = ["d"];
            const result = checkRoles(rolesList, userRoles, false, true);
            expect(result).toBe(true);
        });

        it("user has one role from roles list", () => {
            rolesList = ["a", "f", "k"];
            const result = checkRoles(rolesList, userRoles, false, true);
            expect(result).toBe(false);
        });

        it("user has all roles", () => {
            const result = checkRoles(rolesList, userRoles, false, true);
            expect(result).toBe(false);
        });

        it("empty user roles", () => {
            userRoles = [];
            const result = checkRoles(rolesList, userRoles, true, true);
            expect(result).toBe(true);
        });
    });
});
