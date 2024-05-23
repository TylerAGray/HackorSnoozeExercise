"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:
const $body = $("body");
const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");
const $favoritedStories = $("#favorited-stories");
const $ownStories = $("#my-stories");
const $storiesContainer = $("#stories-container");

// selector that finds all three story lists
const $storiesLists = $(".stories-list");

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");

const $submitForm = $("#submit-form");

const $navSubmitStory = $("#nav-submit-story");
const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");

const $userProfile = $("#user-profile");

/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */
function hidePageComponents() {
  const components = [
    $storiesLists,
    $submitForm,
    $loginForm,
    $signupForm,
    $userProfile
  ];
  components.forEach(c => c.hide());
}

/** Overall function to kick off the app. */
async function start() {
  console.debug("start");

  // "Remember logged-in user" and log in, if credentials in localStorage
  await checkForRememberedUser();

  // if we got a logged-in user
  if (currentUser) {
    // Update the navbar to reflect the logged-in user
    updateNavOnLogin();
    
    // Retrieve and show stories when the page loads
    await getAndShowStoriesOnStart();
  }
}

/** When a user first logins in, update the navbar to reflect that. */
function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").css('display', 'flex');
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** When a user logs out, update the navbar to reflect that. */
function updateNavOnLogout() {
  console.debug("updateNavOnLogout");
  $(".main-nav-links").hide();
  $navLogin.show();
  $navLogOut.hide();
  $navUserProfile.hide();
}

// On initial load, start the app
start();
