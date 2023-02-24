const {fetch} = require("undici")

const {GPT_API_KEY} = process.env;

class ChatGPTResponder {

    static conversationHistory = [];

    static async getResponse(q) {
    
        return fetch("https://api.openai.com/v1/completions", {

            body: JSON.stringify({model: "text-davinci-003", prompt: q, temperature: 0, max_tokens: 2048}),
            headers: {
                "authorization": `Bearer ${GPT_API_KEY}`,
                "content-type": "application/json"
            },
            method: "POST"
            }).then(res => {
                return res.json().then(json => {
                    var {choices} = json;
                    const response = choices[0].text;
                    return response;
                })
            })
        
    }

}

module.exports = {ChatGPTResponder}