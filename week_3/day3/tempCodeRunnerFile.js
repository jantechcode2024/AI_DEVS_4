async function sendRequest(command) {

    const res = await fetch("https://hub.ag3nts.org/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: {
            apikey: AI_DEVS_API_KEY,
            task: "reactor",
            answer: {
                command: command
            },
        }
    });

    console.log('res is ', res)
    return res.json().catch(() => null);
}