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

        //todo: pak de opgeslagen video terug met de datestring!
        const datestring = date.getDate()  + "-" + (date.getMonth()+1) + "-" + date.getFullYear() + "_" +
            date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds() + "-" + date.getMilliseconds();//maak er een mooie datestring van

        fs.writeFileSync(`uploads/${datestring}.py`, req.body.script);//sla de code op op de harde schijf met datestring in de naam van het bestand

        if (currentlyRunningScript) {
            //er is al een ander script bezig

            res.status(200).send("Busy");

            return;
        }

        //todo: errors simpeler maken?

        var dataToSend: String;
        // spawn new child process to call the python script

        currentlyRunningScript = true;

        let python;

        try {
            python = spawn('L:\\Bureaublad\\WPy64-3902\\python-3.9.0.amd64\\python', [`uploads/${datestring}.py`]);
        } catch(e) {
            currentlyRunningScript = false;
            console.log(e);
        }

        // collect data from script
        python.stdout.on('data', function (data) {
            console.log('Pipe data from python script ...');
            dataToSend = data.toString();
        });
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
    console.log(`Example app listening at http://localhost:${port}`)
});

/*
todo: handige config file maken voor instellen python path etc etc voor handig op school instellen na thuis maken
todo: veilig maken, function whitelist?
*/
