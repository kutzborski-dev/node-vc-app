import * as path from 'path';
import express from 'express';
import App from '../services/app.js';
import { isUuid, uuid } from 'uuidv4';

export default class Router {
    triggereQueue = [];

    constructor(instance) {
        this.instance = instance;
        this.instance.set('view engine', 'ejs');
        this.instance.set('views', path.join(App.basePath, '/components'));
        this.instance.use('/scripts', express.static(path.join(App.basePath, '/scripts')));
        this.instance.use(express.json());
        this.instance.use(express.urlencoded({extended: true}));

        this.init();

        return new Proxy(this, {
            get(target, prop) {
                if(prop in target) return target[prop];
                if(prop in target.instance) return target.instance[prop];
                return undefined;
            }
        });
    }

    init() {
        this.instance.get('/', (req, res) => {
            res.render('views/home.ejs', {
                clientID: null
            });
        });
    }

    setup() {
        this.get('/login', (req, res) => {
            res.render('views/login.ejs');
        });

        this.post('/login', (req, res,) => {
            let roomID = isUuid(req.body.roomID) ? red.body.roomID : uuid();

            return res.redirect('/room/'+ roomID);
        });

        this.get('/rooms', (req, res) => {
            res.render('views/rooms.ejs');
        });

        this.get('/room/:roomID', (req, res) => {
            if(!req.params.roomID || !isUuid(req.params.roomID)) return res.redirect('rooms');
            const roomID = req.params.roomID;

            let roomData = {
                roomID
            }

            res.render('views/room.ejs', roomData);
        });
    }

    getInstance() {
        return this.instance;
    }
}