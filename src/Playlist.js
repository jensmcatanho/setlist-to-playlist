export default class Playlist {
    constructor(artist, date) {
        this.artist = artist;
        this.date = date;
        this.songs = [];
    }

    addSong(song) {
        this.songs.push({"name": song, "id": ""});
    }

    printSongs() {
        console.log(this.songs);
    }
}