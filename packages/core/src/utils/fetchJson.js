export default function fetchJson(url, callback) {
    const req = new XMLHttpRequest();
    req.onload = () => {
        if (req.status >= 200 && req.status < 300) {
            const text = req.responseText;
            try {
                callback(null, JSON.parse(text));
            } catch (e) {
                callback(e, null);
            }
        } else {
            callback(new Error(`${req.status}: ${req.statusText}`), null);
        }
    };
    req.onerror = (e) => {
        callback(e.error, null);
    };
    req.open('GET', url, true);
    req.send(null);
}
