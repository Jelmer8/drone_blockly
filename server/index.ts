import express = require("express")
import {Express, Request, Response} from "express";
import fs = require('fs');
import {spawn} from "child_process";

const app: Express = express();
const port = 3000;
const jsonParser = express.json();
const dir = "uploads";

var currentlyRunningScript = false;

if (!fs.existsSync(dir)){//als uploads mapje niet bestaat, maak deze aan
    fs.mkdirSync(dir);
}

app.post("/", jsonParser, (req: Request, res: Response) => {//request handler voor POST /sendCode
    if (req.body && req.body.script) {

        const date = new Date();//maak een nieuwe Date object

        const datestring = date.getDate()  + "-" + (date.getMonth()+1) + "-" + date.getFullYear() + "_" +
            date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds() + "-" + date.getMilliseconds();//maak er een mooie datestring van

        fs.writeFileSync(`uploads/${datestring}.py`, req.body.script);//sla de code op op de harde schijf met datestring in de naam van het bestand

        if (currentlyRunningScript) {
            //er is al een ander script bezig

            res.status(200).send("Busy");

            return;
        }

        var dataToSend: String = "";
        // spawn new child process to call the python script

        currentlyRunningScript = true;

        let python;

        try {
            python = spawn('python3', [`uploads/${datestring}.py`]);
        } catch(e) {
            currentlyRunningScript = false;
            console.log(e);
        }

        // collect data from script
        python.stdout.on('data', function (data) {
            dataToSend += data.toString();
        });
		
		python.stderr.on('data', function(data) {
			dataToSend += data.toString();
		})
		
        // in close event we are sure that stream from child process is closed
        python.on('close', (code) => {
            currentlyRunningScript = false;
            console.log(`child process close all stdio with code ${code}`);
            // send data to browser
            res.send(dataToSend);
        });

    } else {
        console.log("No script sent");
        res.json({ message: "No script sent" });
        res.status(422).send();
    }
});

app.listen(port, () => {
    console.log(`Server is gereed`)
});