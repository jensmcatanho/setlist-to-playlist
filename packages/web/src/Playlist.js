export default class Playlist {
    constructor(setlist) {
        this.artistName = setlist.setlist[0].artist.name;
        this.venue = {
            "name": setlist.setlist[0].venue.name,
            "city": setlist.setlist[0].venue.city.name,
            "country": setlist.setlist[0].venue.city.country.name,
        };
        this.setlist_url = setlist.setlist[0].url;
        this.tour_name = setlist.setlist[0].tour.name;

        this.songs = [];
        this.description = "";

        const numSets = setlist.setlist[0].sets.set.length;
        for (let i = 0; i < numSets; ++i) {
            const numSongs = setlist.setlist[0].sets.set[i].song.length;

            for (let j = 0; j < numSongs; ++j) {
                this.addSong(setlist.setlist[0].sets.set[i].song[j].name);
            }
        }

        this.parseDate(setlist.setlist[0].eventDate);
        this.createDescription();
    }

    parseDate(date) {
        const [day, month, year] = date.split('-');
        this.date = `${day}/${month}/${year}`
    }

    createDescription() {
        if (this.tour_name !== "") {
            this.description = `${this.tour_name} @ ${this.venue.name} - ${this.venue.city} -` +
                ` ${this.venue.country} - ${this.setlist_url}`;
        } else {
            this.description = `${this.venue.name} - ${this.venue.city} - ${this.venue.country} -` +
                ` ${this.setlist_url}`;
        }
    }

    addSong(song) {
        this.songs.push({"name": song, "id": ""});
    }

    printSongs() {
        console.log(this.songs);
    }
}