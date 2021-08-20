require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()

const { Deta } = require("deta")
const deta_project_key = process.env.deta_project_key
const deta = Deta(deta_project_key);
const checkJwt = require('./middleware/checkJWT')

app.use(cors({
    origin: 'https://imagin.live'
}));
app.use(express.json())

app.post("/users", async (req, res) => {
    const db = deta.Base('users');

    const { user } = req.body;
    const userData = {
        email: user.email,
        user_id: user.user_id
    }

    const data = await db.put(userData)
    res.status(201).json(data)
});

//Below this, JWT required
app.use(checkJwt)

app.get("/sites", async (req, res) => {
    const db = deta.Base('sites');
    const data = await db.fetch({ user_id: req.user.sub })

    res.status(201).json(data)
});

app.post("/sites", async(req, res) => {
    const db = deta.Base('sites');
    const { sitename } = req.body;
    
    const siteData = {
        sitename: sitename,
        user_id: req.user.sub,
        created_at: new Date()
    }
    const data = await db.put(siteData)

    res.status(201).json(data)
});

app.put('/sites/:id', async (req, res) => {
    //Todo: only owner allowed
    const db = deta.Base('sites');
    const { sitename } = req.body;
    const { id } = req.params;

    const updatedData = {
        'sitename' : sitename,
        'updated_at' : new Date()
    }

    const newItem = await db.update(updatedData);
    res.status(201).json(newItem)
});

app.put('/sites/theme/:id', async (req, res) => {
    //Todo: only owner allowed
    const db = deta.Base('sites');
    const { theme } = req.body;
    const { id } = req.params;

    const updatedData = {
        'theme' : theme,
        'updated_at' : new Date()
    }

    const newItem = await db.update(updatedData);
    res.status(201).json(newItem)
});

//Fallback route
app.use(function (err, req, res, next) {
    if (err.name === "UnauthorizedError") {
        return res.status(401).send({ msg: "Invalid token" });
    }

    next(err, req, res);
});

const port = 5000
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
module.exports = app;