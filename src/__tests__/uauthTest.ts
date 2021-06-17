interface OauthItem {
    Code: string;
    Title?: string;
    Icon?: string;
    [field: string]: string | number;
}

function getBtnType(items: OauthItem[]): "link" | "primary" {
    if (items.length === 2 && items.findIndex((i) => i.Code === "form") !== -1) return "primary";
    if (items.length === 1 && items.findIndex((i) => i.Code === "form") === -1) return "primary";
    return "link";
}

describe("", () => {
    it("two ways and one is form", () => {
        let items: OauthItem[] = [{ Code: "form" }, { Code: "sd" }];
        const res = getBtnType(items);
        expect(res).toBe("primary");
    });

    it("one way and it is not form", () => {
        let items: OauthItem[] = [{ Code: "sd" }];
        const res = getBtnType(items);
        expect(res).toBe("primary");
    });

    it("one way and it is form", () => {
        let items: OauthItem[] = [{ Code: "form" }];
        const res = getBtnType(items);
        expect(res).toBe("link");
    });

    it("two non-form ways", () => {
        let items: OauthItem[] = [{ Code: "sd" }, { Code: "asd" }];
        const res = getBtnType(items);
        expect(res).toBe("link");
    });

    it("more than two ways", () => {
        let items: OauthItem[] = [{ Code: "form" }, { Code: "sd" }, { Code: "asd" }];
        const res = getBtnType(items);
        expect(res).toBe("link");
    });
});
