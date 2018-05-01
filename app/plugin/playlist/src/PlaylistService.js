/**
 *
 */
class PlaylistService {

    /**
     * @param timeslotService
     */
    constructor(timeslotService, playlistStorage) {
        this.playlistStorage = playlistStorage ? playlistStorage : null;
        this.timeslotService = timeslotService ? timeslotService : null;
        this.eventManager = new EvtManager();
        this.runningPlaylist = {};
        this.eventManager.on(`play-playlist`, this.changeRunningPlaylist.bind(this));
        this.eventManager.on(`stop-playlist`, this.changeIdlePlaylist.bind(this));
    }

    startSchedule() {
        setInterval(this.schedule.bind(this), 1000);
    }

    schedule() {

        let data = {
            'timestamp' : this._getTimestamp()
        };
        console.log('PLAYLIST SCHEDULE', `timeline-${data.timestamp}`);
        this.eventManager.fire(`timeline-${data.timestamp}`, data, true);
    }

    /**
     * @return {number}
     * @private
     */
    _getTimestamp() {
        return Math.round(new Date() / 1000);
    }

    /**
     * @param playlist
     */
    play(playlist) {

        if (this.runningPlaylist[playlist.getMonitorId()]) {
            // TODO stop playlist;

        }

        this.runningPlaylist[playlist.getMonitorId()] = playlist;

        playlist.reset();
        let timeslot = playlist.current();
        this.timeslotService.play(timeslot, this._getTimeslotOptions(playlist));

        this.eventManager.fire('play-playlist', playlist);

        console.log('schedule ATT', `timeline-${this._getTimestamp() + parseInt(timeslot.duration)}`);
        this.eventManager.on(
            `timeline-${this._getTimestamp() + parseInt(timeslot.duration)}`,
            this.processPlaylist.bind({playlistService : this, playlist: playlist})
        )
    }

    /**
     *
     * @param playlist
     * @private
     */
    _getTimeslotOptions(playlist) {
        let options = {};

        if (playlist && typeof playlist === 'object' && playlist.options && typeof playlist.options === 'object') {

            switch (true) {
                case typeof playlist.options.context === 'string':
                    options.context = playlist.options.context;
            }

        }
        return options;
    }

    /**
     * @param evt
     */
    processPlaylist(evt) {
        let timeslot = this.playlist.next();

        switch (true) {
            case timeslot !== null && typeof timeslot === 'object':
                console.log('NEXT PLAYLIST',`timeline-${this.playlistService._getTimestamp() + parseInt(timeslot.duration)}`, timeslot);
                this.playlistService.timeslotService.play(timeslot);
                this.playlistService.eventManager.on(
                    `timeline-${this.playlistService._getTimestamp() + parseInt(timeslot.duration)}`,
                    this.playlistService.processPlaylist.bind({playlistService : this.playlistService, playlist: this.playlist})
                );
                break;
            case !timeslot && this.playlist.options.loop:
                this.playlist.reset();
                timeslot = this.playlist.current();
                this.playlistService.timeslotService.play(timeslot);
                console.log('RESTART PLAYLIST', `timeline-${this.playlistService._getTimestamp() + parseInt(timeslot.duration)}`, timeslot);
                this.playlistService.eventManager.on(
                    `timeline-${this.playlistService._getTimestamp() + parseInt(timeslot.duration)}`,
                    this.playlistService.processPlaylist.bind({playlistService : this.playlistService, playlist: this.playlist})
                );
                break;
            default:
                this.playlistService.eventManager.fire('stop-playlist', this.playlist);
                break;

        }
    }

    /**
     * @param evt
     */
    changeRunningPlaylist(evt) {
        evt.data.status = Playlist.RUNNING;
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
        evt.data.status = Playlist.IDLE;
        evt.data.reset();
        delete this.runningPlaylist[evt.data.getMonitorId()];
        console.log('STOP PLAYLIST', evt);
        this.playlistStorage.update(evt.data)
            .then((data) => {})
            .catch((err) => { console.log(err) });
    }
}

module.exports = PlaylistService;