import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import { elements, renderLoader, clearLoader } from './views/base';

// Global state of the app
// - Search object
// - Current recipe object
// - Shopping list object
// - Liked recipes

const state = {};

// SEARCH CONTROLLER
const controlSearch = async () => {
    // 1) Get query from view
    // console.log(query);
    // TESTING ONLY
    // const query = 'pasta';
    const query = searchView.getInput();

    if (query) {
        // 2) New search object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchResults);

        try{
            // 4) Search for recipes
            await state.search.getResults();

            // 5) Render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (error) {
            alert("Search failed!");
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    // stops the page from reloading
    e.preventDefault();
    controlSearch();
});

// FOR TESTING ONLY
// window.addEventListener('load', e => {
//     // stops the page from reloading
//     e.preventDefault();
//     controlSearch();
// });

// use event delegation because pagination buttons are available on load
elements.searchResPages.addEventListener('click', e => {
    // span, icon, and button were all clickable
    // closest lets use select a specific class nearby the click
    // even if you click on another element
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
        // console.log(goToPage);
    }
    // console.log(btn);
});

// RECIPE CONTROLLER
// const r = new Recipe(46956);
// r.getRecipe();
// console.log(r);
// end testing
const controlRecipe = async () => {
    // Get ID from url
    const id = window.location.hash.replace('#', '');
    console.log(id);


    if (id) {
        // prepare ui for changes


        // create new recipe object
        state.recipe = new Recipe(id);

        try {
            // get recipe data
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // render recipe
            console.log(state.recipe);
        } catch (error) {
            alert('Error processing recipe!');
            console.log(error);
        }
    }
}

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);
// add same event listener to multiple events
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));
