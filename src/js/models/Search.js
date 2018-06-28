import axios from 'axios';

export default class Search {
    constructor(query) {
        this.query = query;
    }

    async getResults() {
        // proxy needed to bypass cross origin error (this isn't necessary on a live server)
        const proxy = 'https://cors-anywhere.herokuapp.com/'
        const key = '26a5beb1fbce94c14c503ceaa54a3461';

        try {
            const res = await axios(`${proxy}http://food2fork.com/api/search?key=${key}&q=${this.query}`);
            this.result = res.data.recipes;
            // console.log(this.result);
        } catch (error) {
            alert(error);
        };
    };
}
