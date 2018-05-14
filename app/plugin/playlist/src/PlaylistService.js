
try {
    EvtManager = require('./../../../lib/event/EvtManager');
    Playlist = require('./../../../lib/model/playlist/Playlist');
}
catch(err) {

    EvtManager = require(__dirname + '/lib/event/EvtManager.js');
    Playlist = require(__dirname + '/lib/model/playlist/Playlist');
}
/**
 *
 */
class PlaylistService {

    static get PLAY()  { return 'play-playlist'; }

    static get STOP()  { return 'stop-playlist'; }

    static get PAUSE()  { return 'pause-playlist'; }

    static get RESUME() { return 'resume-playlist'; }

    /**
     *
     * @param {TimeslotSenderService} timeslotSender
     * @param {Storage} playlistStorage
     * @param {Timer} timer
     */
    constructor(timeslotSender, playlistStorage, timer) {

        /**
         * @type {Timer}
         */
        this.timer = timer;
        /**
         *
         * @type {TimeslotSenderService}
         */
        this.timeslotSender = timeslotSender ? timeslotSender : null;

        /**
         * @type {Storage}
         */
        this.playlistStorage = playlistStorage ? playlistStorage : null;

        /**
         * Event manager
         */
        this.eventManager = new EvtManager();

        /**
         * List running playlist
         * @type {Object}
         */
        this.runningPlaylist = {};

        /**
         * Listeners
         */
        this.eventManager.on(PlaylistService.PLAY, this.changeRunningPlaylist.bind(this));
        this.eventManager.on(PlaylistService.STOP, this.changeIdlePlaylist.bind(this));
        this.eventManager.on(PlaylistService.PAUSE, this.changePausePlaylist.bind(this));
        this.eventManager.on(PlaylistService.RESUME, this.changeResumePlaylist.bind(this));

        if (this.timer) {
            this.timer.addEventListener('secondsUpdated', (evt)  => {
                this.schedule();
            });
/*
            this.timer.addEventListener('secondTenthsUpdated', (evt)  => {
               console.log(evt.detail.timer.getTotalTimeValues().secondTenths, 'second tenthe')
            });
            */
        } else {
            throw 'Timer not set';
        }
    }

    schedule() {

        let data = {
            timelineSeconds : this.timer.getTotalTimeValues().seconds
        };

        this.eventManager.fire(`timeline-${data.timelineSeconds}`, data, true);
        this._updateRunnintPlaylist();
    }
    /**
     *
     * @param {Playlist} playlist
     * @return {boolean}
     */
    isRunning(playlist) {

        let isRunning = false;
        switch (true) {
            case this.runningPlaylist[`${playlist.getMonitorId()}-${Playlist.CONTEXT_STANDARD}`] !== undefined &&
                this.runningPlaylist[`${playlist.getMonitorId()}-${Playlist.CONTEXT_STANDARD}`].id === playlist.id:
                isRunning = true;
                break;
            case this.runningPlaylist[`${playlist.getMonitorId()}-${Playlist.CONTEXT_OVERLAY}`] !== undefined &&
                this.runningPlaylist[`${playlist.getMonitorId()}-${Playlist.CONTEXT_OVERLAY}`].id === playlist.id:
                isRunning = true;
                break;
            case this.runningPlaylist[`${playlist.getMonitorId()}-${Playlist.CONTEXT_DEFAULT}`] !== undefined &&
                this.runningPlaylist[`${playlist.getMonitorId()}-${Playlist.CONTEXT_DEFAULT}`].id === playlist.id:
                isRunning = true;
                break;
        }
        return isRunning;
    }

    /**
     * @param {Playlist} playlist
     */
    setRunningPlaylist(playlist) {
        if (!(typeof playlist.getMonitorId === 'function')) {
            return;
        }
        this.runningPlaylist[`${playlist.getMonitorId()}-${playlist.context}`] = playlist;
    }

    /**
     *
     * @param {string} monitorId
     * @return {string} context
     */
    getRunningPlaylist(monitorId, context) {
        return this.runningPlaylist[`${monitorId}-${context}`];
    }

    /**
     * @param {Playlist} playlist
     */
    removeRunningPlaylist(playlist) {

        let nameContext = `${playlist.getMonitorId()}-${Playlist.CONTEXT_OVERLAY}`;
        if (this.runningPlaylist[nameContext] && this.runningPlaylist[nameContext].id === playlist.id) {
            delete this.runningPlaylist[nameContext];
        }

        nameContext = `${playlist.getMonitorId()}-${Playlist.CONTEXT_STANDARD}`;
        if (this.runningPlaylist[nameContext] && this.runningPlaylist[nameContext].id === playlist.id) {
            delete this.runningPlaylist[nameContext];
        }
    }

    /**
     * @param {Playlist} playlist
     */
    play(playlist) {

        let runningPlaylist = this.getRunningPlaylist(playlist.getMonitorId(), playlist.context);
        if (runningPlaylist) {
            this.pause(runningPlaylist);
        }


        this.setRunningPlaylist(playlist);
        this._executeBids(playlist, 'play');
        playlist.status = Playlist.RUNNING;

        let timeslot = playlist.first();
        timeslot.playlistId = playlist.id;
        this.timeslotSender.play(timeslot);
        this.eventManager.fire(PlaylistService.PLAY, playlist);
        this.eventManager.on(
            `timeline-${this.timer.getTotalTimeValues().seconds + parseInt(timeslot.duration)}`,
            this.processPlaylist.bind({playlistService : this, playlist: playlist})
        )
    }

    /**
     * @param {Playlist} playlist
     */
    stop(playlist) {

        this.removeRunningPlaylist(playlist);
        this._executeBids(playlist, 'stop');
        playlist.status = Playlist.IDLE;
        let timeslot = playlist.current();
        timeslot.playlistId = playlist.id;
        this.timeslotSender.stop(timeslot);
        this.eventManager.fire(PlaylistService.STOP, playlist);
    }

    /**
     * @param {Playlist} playlist
     */
    resume(playlist) {

        let runningPlaylist = this.getRunningPlaylist(playlist.getMonitorId(), playlist.context);
        if (runningPlaylist) {
            this.pause(runningPlaylist);
        }

        this.setRunningPlaylist(playlist);
        playlist.status = Playlist.RUNNING;
        this._executeBids(playlist, 'resume');

        let timeslot = playlist.current();
        timeslot.playlistId = playlist.id;
        this.timeslotSender.resume(timeslot);
        this.eventManager.fire(PlaylistService.RESUME, playlist);

        this.eventManager.on(
            `timeline-${this.timer.getTotalTimeValues().seconds + parseInt(timeslot.duration) - timeslot.currentTime}`,
            this.processPlaylist.bind({playlistService : this, playlist: playlist})
        )
    }

    /**
     * @param {Playlist} playlist
     */
    pause(playlist) {

        playlist.status = Playlist.PAUSE;
        this.removeRunningPlaylist(playlist);
        this._executeBids(playlist, 'pause');
        let timeslot = playlist.current();
        timeslot.playlistId = playlist.id;
        this.timeslotSender.pause(timeslot);
        this.eventManager.fire(PlaylistService.PAUSE, playlist);
    }

    /**
     * @param evt
     */
    processPlaylist(evt) {

        console.group();
        console.log('PROCESSS', this.playlist.name, this.playlist.current());
        if (!this.playlistService.isRunning(this.playlist)) {
            console.log('PLAYLIST NOT RUNNING', this.playlist.name, this.playlist);
            return;
        }

        let runningPlaylist =  this.playlistService
            .getRunningPlaylist(this.playlist.getMonitorId(), this.playlist.context);

        let currentTimeslot = runningPlaylist.current();
       // this.playlistService.eventManager._consoleDebug();

        switch (true) {
            case currentTimeslot.currentTime < (currentTimeslot.duration-1):
                // Old event on the same playlist
                console.log('PLAYLIST JUMP' ,this.playlist.name, currentTimeslot.currentTime, currentTimeslot.duration -1 );
                break;
            case runningPlaylist.hasNext():
                let nextTimeslot = runningPlaylist.next();
                console.log('PLAYLIST NEXT', this.playlist.name, nextTimeslot);
                nextTimeslot.playlistId = this.playlist.id;
                this.playlistService.timeslotSender.play(nextTimeslot);
                this.playlistService.eventManager.on(
                    `timeline-${this.playlistService.timer.getTotalTimeValues().seconds + parseInt(nextTimeslot.duration)}`,
                    this.playlistService.processPlaylist.bind({playlistService : this.playlistService, playlist: this.playlist})
                );
                break;
            case !runningPlaylist.hasNext() && this.playlist.loop:
                console.log('PLAYLIST LOOP', this.playlist.name, this.playlist);
                this.playlistService.play(this.playlist);
                break;
            case runningPlaylist !== undefined:
                console.log('PLAYLIST STOP', this.playlist.name, this.playlist);
                this.playlistService.stop(this.playlist);
                break;
        }
        console.groupEnd();
    }

    /**
     * @param evt
     */
    changeRunningPlaylist(evt) {
        evt.data.reset();
        console.log('START PLAYLIST', evt);
        this.playlistStorage.update(evt.data)
            .then((data) => {})
            .catch((err) => { console.log(err) });
    }

    /**
     *
     * @param evt
     */
    changeIdlePlaylist(evt) {
        evt.data.reset();
        console.log('STOP PLAYLIST', evt);
        this.playlistStorage.update(evt.data)
            .then((data) => {})
            .catch((err) => { console.log(err) });
    }

    /**
     *
     * @param evt
     */
    changePausePlaylist(evt) {
        console.log('PAUSE PLAYLIST', evt);
        this.playlistStorage.update(evt.data)
            .then((data) => {})
            .catch((err) => { console.log(err) });
    }

    /**
     *
     * @param evt
     */
    changeResumePlaylist(evt) {
        console.log('RESUME PLAYLIST', evt);
        this.playlistStorage.update(evt.data)
            .then((data) => {})
            .catch((err) => { console.log(err) });
    }


    /**
     * @private
     */
    _updateRunnintPlaylist() {

        for (let key in this.runningPlaylist) {

            let timeslot = this.runningPlaylist[key].timeslots[this.runningPlaylist[key].currentIndex];
            if (!timeslot || timeslot.currentTime + 1 >= timeslot.duration) {
                continue;
            }

            this.runningPlaylist[key].timeslots[this.runningPlaylist[key].currentIndex].currentTime++;
            this.playlistStorage.update(this.runningPlaylist[key])
                .then((data) => {
                })
                .catch((err) => { console.log(err) });
        }
    }

    /**
     * @param {Playlist} playlist
     * @param {String} method
     * @private
     */
    _executeBids(playlist, method) {
        if (playlist.binds === undefined || playlist.binds.length === 0) {
            return;
        }

        for (let cont = 0; playlist.binds.length > cont; cont++) {

            this.playlistStorage
                .get(playlist.binds[cont])
                .then((data) => {
                    this[method](data);
                })
                .catch((err) => { console.log(err) });
        }
    }
}

module.exports = PlaylistService;