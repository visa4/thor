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
    }

    startSchedule() {
        setInterval(this.schedule.bind(this), 1000);
    }

    schedule() {

        let data = {
            'timestamp' : this._getTimestamp()
        };
        console.log('schedule REG', `timeline-${data.timestamp}`);
        this.eventManager.fire(`timeline-${data.timestamp}`, data);
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
        this.timeslotService.play(timeslot);

        console.log('schedule ATT', `timeline-${this._getTimestamp() + parseInt(timeslot.duration)}`);
        this.eventManager.on(
            `timeline-${this._getTimestamp() + parseInt(timeslot.duration)}`,
            this.processPlaylist.bind({playlistService : this, playlist: playlist})
        )
     
    }

    /**
     * @param evt
     */
    processPlaylist(evt) {
        let timeslot = this.playlist.next();
        if (timeslot) {
            this.playlistService.timeslotService.play(timeslot);
            this.playlistService.eventManager.on(
                `timeline-${this.playlistService._getTimestamp() + parseInt(timeslot.duration)}`,
                this.playlistService.processPlaylist.bind({playlistService : this.playlistService, playlist: this.playlist})
            )
        }
    }
}

module.exports = PlaylistService;