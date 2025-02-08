import express from "express";
import axios from "axios";
import cors from "cors";
import serverless from "serverless-http";

const app = express();
app.use(cors());

app.get("/get_word", async (req, res) => {
    const response = await axios.get("https://gist.githubusercontent.com/faiznazeer/74d88006748a622aa696bdee811f38fd/raw/60531ab531c4db602dacaa4f6c0ebf2590b123da/wordle-nyt-answers-alphabetical.txt");
    const wordList = response.data.split("\n");
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    res.send({
        word: randomWord
    });
})

module.exports.handler = serverless(app);