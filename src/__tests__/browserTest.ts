interface BrowserByUserAgentData {
    name: string;
    ver?: string;
}

function browserByUserAgent(userAgent: string): BrowserByUserAgentData {
    const regExp = (name: string) => new RegExp(`(${name})\\/([\\w\\.]+)`, "i");

    const firefox = regExp("Firefox");
    const seamonkey = regExp("Seamonkey");
    const yandex = regExp("YaBrowser");
    const chrome = regExp("Chrome");
    const chromium = regExp("Chromium");
    const safari = regExp("Safari");
    const opera = regExp("OPR|Opera");
    const edge = regExp("Edge");
    const edg = regExp("Edg"); // В новых версиях Edge версия идет после 'Edg/' (предополжительно, после 82 версии)
    const ie = /(MSIE|rv)(?::|\s)([\w\.]+)/i;

    const is = (exp: any) => exp.test(userAgent);
    const info = (exp: any, name?: string) => {
        let m = exp.exec(userAgent);
        return m && { name: name || m[1], ver: m[2] };
    };
    if (is(firefox) && !is(seamonkey)) return info(firefox);
    if (is(seamonkey)) return info(seamonkey);
    if (is(yandex)) return info(yandex, "Yandex");
    if (is(opera)) return info(opera, "Opera");
    if (is(edg)) return info(edg, "Edge");
    if (is(edge)) return info(edge);
    if (is(chrome) && !is(chromium)) return info(chrome);
    if (is(chromium)) return info(chromium);
    if (is(safari) && !is(chromium) && !is(chrome)) {
        const version = regExp("Version"); // Версия Safari идет после 'Version/'
        return {
            name: info(safari).name,
            ver: info(version).ver,
        };
    }
    if (is(ie)) return info(ie, "IE");
    return { name: userAgent.length >= 20 ? userAgent.slice(0, 20) + "..." : userAgent };
}

const userAgents = {
    firefox: {
        agent: "Mozilla/5.0 (Windows NT 5.1; rv:36.0) Gecko/20100101 Firefox/36.0",
        ver: "36.0",
    },
    seamonkey: {
        agent: "Mozilla/5.0 (X11; Linux x86_64; rv:29.0) Gecko/20100101 Firefox/29.0 SeaMonkey/2.26",
        ver: "2.26",
    },
    yandex: {
        agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 YaBrowser/21.5.0 Yowser/2.5 Safari/537.36",
        ver: "21.5.0",
    },
    chrome: {
        agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36",
        ver: "78.0.3904.108",
    },
    chromium: {
        agent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/534.30 (KHTML, like Gecko) Ubuntu/11.04 Chromium/12.0.742.112 Chrome/12.0.742.112 Safari/534.30",
        ver: "12.0.742.112",
    },
    safari: {
        agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1",
        ver: "12.1",
    },
    opera: {
        agent: "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36 OPR/43.0.2442.991",
        ver: "43.0.2442.991",
    },
    ie: {
        agent: "Mozilla/4.0 (compatible; MSIE 6.0; Windows 98)",
        ver: "6.0",
    },
    edge: {
        agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134",
        ver: "42.17134",
    },
    edg: {
        agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36 Edg/91.0.864.37",
        ver: "91.0.864.37",
    },
    based: {
        agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/603.3.8 (KHTML, like Gecko)",
        ver: "",
    },
};

describe("agents versions test", () => {
    it("firefox 21.5.0", () => {
        const result = browserByUserAgent(userAgents.firefox.agent);
        expect(result).toEqual({
            name: "Firefox",
            ver: userAgents.firefox.ver,
        });
    });

    it("seamonkey 2.26", () => {
        const result = browserByUserAgent(userAgents.seamonkey.agent);
        expect(result).toEqual({
            name: "SeaMonkey",
            ver: userAgents.seamonkey.ver,
        });
    });

    it("yandex 21.5.0", () => {
        const result = browserByUserAgent(userAgents.yandex.agent);
        expect(result).toEqual({
            name: "Yandex",
            ver: userAgents.yandex.ver,
        });
    });

    it("chrome 78", () => {
        const result = browserByUserAgent(userAgents.chrome.agent);
        expect(result).toEqual({
            name: "Chrome",
            ver: userAgents.chrome.ver,
        });
    });

    it("chromium 12", () => {
        const result = browserByUserAgent(userAgents.chromium.agent);
        expect(result).toEqual({
            name: "Chromium",
            ver: userAgents.chromium.ver,
        });
    });

    it("safari 12.1", () => {
        const result = browserByUserAgent(userAgents.safari.agent);
        expect(result).toEqual({
            name: "Safari",
            ver: userAgents.safari.ver,
        });
    });

    it("edge 40", () => {
        const result = browserByUserAgent(userAgents.edge.agent);
        expect(result).toEqual({
            name: "Edge",
            ver: userAgents.edge.ver,
        });
    });

    it("edg 91", () => {
        const result = browserByUserAgent(userAgents.edg.agent);
        expect(result).toEqual({
            name: "Edge",
            ver: userAgents.edg.ver,
        });
    });

    it("ie 6", () => {
        const result = browserByUserAgent(userAgents.ie.agent);
        expect(result).toEqual({
            name: "IE",
            ver: userAgents.ie.ver,
        });
    });

    it("opera 43", () => {
        const result = browserByUserAgent(userAgents.opera.agent);
        expect(result).toEqual({
            name: "Opera",
            ver: userAgents.opera.ver,
        });
    });

    it("unknown browser", () => {
        const result = browserByUserAgent(userAgents.based.agent);
        expect(result).toEqual({
            name: "Mozilla/5.0 (Macinto...",
        });
    });
});
