"use strict";

/******************************************************************************
 * User
 */

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

class User {
  /** set up a new user */

  constructor(userObj) {
    this.username = userObj.username;
    this.name = userObj.name;
    this.createdAt = userObj.createdAt;
    this.updatedAt = userObj.updatedAt;
    // instantiate Story instances for the user
    this.favorites = [];
    this.ownStories = [];
  }

  /** call static method to get token for user from API,
   *  then return a new User instance
   */

  static async login(username, password) {
    const token = await axios.post(`${BASE_URL}/login`, {
      user: { username, password },
    });
    const user = new User(token.data.user);
    user.loginToken = token.data.token;

    // get the user's favorites and stories
    await user.retrieveDetails();

    return user;
  }

  /** call static method to get token and user from API,
   *  then return a new User instance
   */

  static async signup(username, password, name) {
    const token = await axios.post(`${BASE_URL}/signup`, {
      user: { username, password, name },
    });
    const user = new User(token.data.user);
    user.loginToken = token.data.token;

    return user;
  }

  /** call static method to get user from API,
   *  then return a new User instance
   */

  static async loginViaStoredCredentials(token, username) {
    const user = await axios.get(`${BASE_URL}/users/${username}`, {
      params: { token },
    });
    const userData = user.data.user;
    const newUser = new User(userData);
    newUser.loginToken = token;

    await newUser.retrieveDetails();

    return newUser;
  }

  /** get user's own stories and favorites from API */

  async retrieveDetails() {
    await this.getOwnStories();
    await this.getFavoriteStories();
  }

  /** get user's own stories from API */

  async getOwnStories() {
    const response = await axios.get(`${BASE_URL}/users/${this.username}`, {
      params: { token: this.loginToken },
    });
    this.ownStories = response.data.user.stories.map(s => new Story(s));
  }

  /** get user's favorite stories from API */

  async getFavoriteStories() {

    try {
   
      const response = await axios.get(`${BASE_URL}/users/${this.username}/favorites`, {
   
        params: { token: this.loginToken },
   
      });
   
      console.log(response.data); // Debugging: log the response data
   
      this.favorites = response.data.user.favorites.map(s => new Story(s));
   
    } catch (error) {
   
      console.error('Error fetching favorite stories:', error.response ? error.response.data : error.message);
   
    }
   
   }
   
/** Add a story to the user's favorites */

async addFavorite(storyId) {

  try {
 
    const response = await axios.post(`${BASE_URL}/users/${this.username}/favorites/${storyId}`, null, {
 
      params: { token: this.loginToken },
 
    });
 
    console.log('Added favorite story response:', response.data); // Log response data
 
    this.favorites.push(new Story(response.data.story));
 
  } catch (error) {
 
    console.error('Error adding favorite story:', error.response ? error.response.data : error.message);
 
  }
 
 }
 
 /** Remove a story from the user's favorites */
 
 async removeFavorite(storyId) {
 
  try {
 
    const response = await axios.delete(`${BASE_URL}/users/${this.username}/favorites/${storyId}`, {
 
      params: { token: this.loginToken },
 
    });
 
    console.log('Removed favorite story response:', response.data); // Log response data
 
    this.favorites = this.favorites.filter(s => s.storyId !== storyId);
 
  } catch (error) {
 
    console.error('Error removing favorite story:', error.response ? error.response.data : error.message);
 
  }
 
 }

  /** determine if given story is a favorite of user */

  isFavorite(story) {
    return this.favorites.some(s => s.storyId === story.storyId);
  }

  /** make POST request to API to add/remove story from user's favorites */

  async _toggleFavorite(story) {
    if (this.isFavorite(story)) {
      await axios.post(`${BASE_URL}/users/${this.username}/favorites/${story.storyId}`, {
        token: this.loginToken,
      });
    } else {
      await axios.delete(`${BASE_URL}/users/${this.username}/favorites/${story.storyId}`, {
        params: { token: this.loginToken },
      });
    }
  }
}

/******************************************************************************
 * Story
 */

class Story {
  constructor(storyObj) {
    this.storyId = storyObj.storyId;
    this.title = storyObj.title;
    this.author = storyObj.author;
    this.url = storyObj.url;
    this.username = storyObj.username;
    this.createdAt = storyObj.createdAt;
    this.updatedAt = storyObj.updatedAt;
  }

  /** Get hostname from URL */

  getHostName() {
    let hostName;
    // Remove 'http://' or 'https://'
    if (this.url.indexOf("://") > -1) {
      hostName = this.url.split("/")[2];
    } else {
      hostName = this.url.split("/")[0];
    }
    // Remove 'www.' if there
    if (hostName.slice(0, 4) === "www.") {
      hostName = hostName.slice(4);
    }
    return hostName;
  }
}

/******************************************************************************
 * StoryList
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Get list of stories from API */

  static async getStories() {
    const response = await axios.get(`${BASE_URL}/stories`);
    const stories = response.data.stories.map(s => new Story(s));
    return new StoryList(stories);
  }

  /** POST a new story to the API */

  async addStory(user, newStory) {
    const response = await axios.post(`${BASE_URL}/stories`, {
      token: user.loginToken,
      story: newStory,
    });
    const story = new Story(response.data.story);
    this.stories.unshift(story);
    user.ownStories.unshift(story);
    return story;
  }

  /** Remove story */

  async removeStory(user, storyId) {
    await axios.delete(`${BASE_URL}/stories/${storyId}`, {
      params: { token: user.loginToken },
    });
    this.stories = this.stories.filter(story => story.storyId !== storyId);
    user.ownStories = user.ownStories.filter(s => s.storyId !== storyId);
  }
}
