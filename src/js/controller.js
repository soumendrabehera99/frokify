import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import receipeView from './views/receipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

const recipeContainer = document.querySelector('.recipe');

if (module.hot) {
  module.hot.accept();
}

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

async function controlRecipes() {
  try {
    const id = window.location.hash.slice(1);
    // console.log(id);

    if (!id) return;
    receipeView.renderSpinner(recipeContainer);

    // 0) Update results view to mark seleted search result
    resultsView.update(model.getSearchResultPage());

    //Updating the bookmarksview
    bookmarksView.update(model.state.bookmarks);

    //(1) loading receipe
    await model.loadRecipe(id);
    // console.log(recipe);

    //(2) Rendering recipe
    receipeView.render(model.state.recipe);
  } catch (err) {
    recipeContainer.innerHTML = '';
    receipeView.renderError();
    console.log(err);
  }
}

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    //(1) get Search query
    const query = searchView.getQuery();
    if (!query) return;

    // (2) load search result
    await model.loadSearchResults(query);

    // (3) render result
    // console.log(model.state.search.result);
    // resultsView.render(model.state.search.result);
    // console.log(model.getSearchResultPage(2));

    resultsView.render(model.getSearchResultPage());

    //4  render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // render new result
  resultsView.render(model.getSearchResultPage(goToPage));

  //4  render new pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update the receipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  // receipeView.render(model.state.recipe);
  receipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // Add or remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmarks(model.state.recipe);
  else model.deleteBookmarks(model.state.recipe.id);

  // 2) Update receipe view
  // console.log(model.state.recipe);
  receipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  // console.log(newRecipe);
  try {
    // show spinner
    addRecipeView.renderSpinner();

    //Upload the new Recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render receipe in receipe view
    receipeView.render(model.state.recipe);

    // Display a success message
    addRecipeView.renderMessage();

    //Render bookmarks view for new element
    bookmarksView.render(model.state.bookmarks);

    // change id in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //Close modal window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    // console.log(err);
    addRecipeView.renderError(err);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  receipeView.addHandlerRender(controlRecipes);
  receipeView.addHandlerUpdateServings(controlServings);
  receipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
