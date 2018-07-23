import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

// Global state of the app
// - Search object
// - Current recipe object
// - Shopping list object
// - Liked recipes

const state = {};
// for testing purposes
// window.state = state;

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

    if (id) {
        // prepare ui for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected search item
        if (state.search) searchView.highlightSelected(id);

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
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );
        } catch (error) {
            alert('Error processing recipe!');
            console.log(error);
        }
    }
}

/**
 * LIST CONTROLLER
 */
const controlList = () => {
    // create a new list IF there isn't one yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

/**
 * LIKE CONTROLLER
 */
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // user has not yet liked the current recipe
    if (!state.likes.isLiked(currentID)) {
        // add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        )

        // toggle the like button
        likesView.toggleLikeBtn(true);

        // add like to the ui list
        likesView.renderLike(newLike);

    // user has already like the current recipe
    } else {
        // remove like from the state
        state.likes.deleteLike(currentID);

        // toggle the like button
        likesView.toggleLikeBtn(false);

        // remove like from the ui list
        likesView.deleteLike(currentID);
    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());
}

// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();

    // Restore likes
    state.likes.readLocalStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render existing liked recipes in likes menu from localStoreage
    state.likes.likes.forEach(like => likesView.renderLike(like));
});


// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    // try and read the element that was clicked on
    const id = e.target.closest('.shopping__item').dataset.itemid;
    // handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // delete from state
        state.list.deleteItem(id);

        // delete from ui
        listView.deleteItem(id);

    // handle count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});


// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);
// add same event listener to multiple events
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    // * matches any child element of btn-decrease
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // decrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }
});

// window.l = new List();
