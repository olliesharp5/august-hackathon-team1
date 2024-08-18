# DuckHunt Reloaded

Proudly present our retro game: DuckHunt Reloaded

![Am I responsive](#)

[View DuckHunt Reloaded live link ](https://olliesharp5.github.io/august-hackathon-team1/)

# Overview

This is our submission for the Code Institute August Hackathon: Pixel Pioneers.

The hackathon is a rapid and collaborative event where teams of about 5 or 6 individuals work together on software projects in sprints with the goal of creating a functioning end product within just a few days.

Team Members:

- [Jaimie](https://github.com/JaimieHemmings)
- [Noah](https://github.com/Noah-Samawi)
- [Mihály](https://github.com/Nmyhi)
- [Chris](https://github.com/Chris-Tranter)
- [Oliver](https://github.com)

The goal of this Hackathon event is to create a Retro Game, including the use of 8 bit graphics, sound effects and music. As a group we came together to discuss previous retro games we have enjoyed including Tetris, Road Rash, Z, Worms, Duck Hunt etc.

We believed that creating something along the lines of an RPG would cause us issues with scoping the project appropriately to suit the alotted timeframe and so we eventually decided we would create, in homage to the original, a Duck Hunt clone and so "Duck Hunt Remastered" was conceptualised.

---

## CONTENTS

* [User Experience](#user-experience-ux)
  * [User Stories](#user-stories)

* [Design](#design)
  * [Database](#Database)
  * [Colour Scheme](#colour-scheme)
  * [Typography](#typography)
  * [Imagery](#imagery)
  * [Wireframes](#wireframes)

* [Features](#features)
  * [General Features on Each Page](#general-features-on-each-page)
  * [Future Implementations](#future-implementations)
  * [Accessibility](#accessibility)

* [Technologies Used](#technologies-used)
  * [Languages Used](#languages-used)
  * [Frameworks, Libraries & Programs Used](#frameworks-libraries--programs-used)

* [Deployment & Local Development](#deployment--local-development)
  * [Deployment](#deployment)
  * [Local Development](#local-development)
    * [How to Fork](#how-to-fork)
    * [How to Clone](#how-to-clone)

* [Testing](#testing)

* [Credits](#credits)
  * [Code Used](#code-used)
  * [Content](#content)
  * [Media](#media)
  * [Acknowledgments](#acknowledgments)

---

## User Experience (UX)

### Initial Discussion

DuckHunt Reloaded is the rethinking of the old classic DuchHunt

### User Stories

* As a player, I want to see the main menu.
* As a player, I want to start a new game.
* As a player, I want to view the leaderboard.
* As a player, I want to shoot ducks that fly across the screen.
* As a player, I want to experience a variety of environments (e.g., forest, swamp, winter landscape), so that the game remains visually engaging and varied.
* As a player, I want to save my score on the leaderboard.
* As a player, I want to have instructions. 

#### Client Goals

As the client I would to:

- Create an engaging and fun 8 bit retro style game
- Make the game replayable
- Have a persistent leaderboard that contains all the high scores

#### First Time Visitor Goals

As a first time visitor I would like:

- To immediately understand the purpose the website
- To be able to understand the rules of the game
- To be able to play the game
- To submit my score to the leaderboards

#### Returning Visitor Goals

As a returning visitor I would like:

- Try and beat my high score
- Revisit the rules to get clarification if needed

## Design

* We were following the original game design in terms of srt style.
* We were implementing new game mechanics. Shorter rounds and more birds at the same time.

### Database

* We have used Firebase for our database.
* Database model:

![Database](/documentation/img/database_model.png)

### Colour Scheme

The colour scheme and overall aesthetic of the website will be based on retro style 8 bit video games, obviously taking great inspiration from the graphical style of the original Duck Hunt game.

### Typography

[Jersey-10](https://fonts.google.com/specimen/Jersey+10?query=jersey+10 "Retro looking google font") google font was used to create retro looking text.

![Jersey-10](/documentation/img/font.png)

### Imagery

For the imagery of the website we have found some open source sprites true to the original version of the game.

### Wireframes

#### Menu

![Main Menu](documentation/img/menu.png)

#### Instructions

![Instructions](documentation/img/instructions.png)

#### End Game

![End Game](documentation/img/instructions.png)


## Features

### General features on each page

- Home page
  - The homepage will be the home of the overhwleming majority of the website content, if not all of it.
  - See the instructions for the game
  - Play the game
  - See the leaderboards
  - Submit a high score

### Future Implementations

Continued development could include further development to implement the following:

- A variety of game modes (Crazy mode - would infinitely spawn an overwhelming number of targets for the player to shoot)

### Accessibility

* Semantic html was used for accessibility.

## Technologies Used

HTML5, CSS, Javascript

### Languages Used

* HTML
* CSS
* JavaScript

### Frameworks, Libraries & Programs Used

* [Balsamiq](https://www.balsamiq.com/wireframes/ "Balsamiq Wireframing Tool") was used to create the wireframes/sitemap for the site.
* [Pixabay](https://pixabay.com/ "8 bit sounds free library") was used for downloading sound effects and music.
* [Miro](https://miro.com/ "creative project manager software") was used for brainstorming and making notes, task list.
* [Gitpod](https://gitpod.io/ "cloud based IDE") was used for development.
* [Git](https://github.com/ "Version Control System") was used for developers to work on their own branch. Once approved changes would be merged into the main repository.
* [FireBase](https://https://firebase.google.com/ "Database") was used for our database.

## Deployment & Local Development

### Deployment

Github Pages was used to deploy the live website. The instructions to achieve this are below:

1. Log in (or sign up) to Github.
2. Find the repository for this project, olliesharp5/august-hackathon-team1.
3. Click on the Settings link.
4. Click on the Pages link in the left hand side navigation bar.
5. In the Source section, choose main from the drop down select branch menu. Select Root from the drop down select folder menu.
6. Click Save. Your live Github Pages site is now deployed at the URL shown.

### Local Development

#### How to Fork

To fork the olliesharp5/august-hackathon-team1 repository:

1. Log in (or sign up) to Github.
2. Go to the repository for this project, olliesharp5/august-hackathon-team1.
3. Click the Fork button in the top right corner.

#### How to Clone

To clone the olliesharp5/august-hackathon-team1:

1. Log in (or sign up) to GitHub.
2. Go to the repository for this project, olliesharp5/august-hackathon-team1.
3. Click on the code button, select whether you would like to clone with HTTPS, SSH or GitHub CLI and copy the link shown.
4. Open the terminal in your code editor and change the current working directory to the location you want to use for the cloned directory.
5. Type 'git clone' into the terminal and then paste the link you copied in step 3. Press enter.

## Testing

* Manual Testing:

Game functions have been tested manually throughout the whole developement process on various hand held devices and desktop devices.

* Found bugs:

- Bug 1: Gunshot sound not playing in the deployed version.
  - Description: Gunshot sound not playing in the deployed version due to a rooting issue.
  - Steps to Reproduce:
    1. [Step 1] correct the routing of the sound file form : new Audio('../assets/sounds/gunshot.mp3');
    2. [Step 2] test the gunshot in the deployed version
  - Expected Outcome: gunshot sound plays in deployed version.
  - Actual Outcome: gunshot sound plays in deployed version.

- Bug 2: Back to main menu button does not work on the leaderboard.
  - Description: Back to main menu button does not work on the leaderboard.
  - Steps to Reproduce:
    1. [Step 1] Fix the button.
    2. [Step 2] Test the button.
  - Expected Outcome: when we push the button the game rerenders the main menu.
  - Actual Outcome: when we push the button the game rerenders the main menu.

  - Bug 3: Misses counter issues.
  - Description: When the game displays levelx get ready the user can shoot and the game counts the misses which is not ideal.
  - Steps to Reproduce:
    1. [Step 1] Implement logic for checking for ducks spawning and enable the counter just then.
    2. [Step 2] Test the implementation.
  - Expected Outcome: The counter not counts the misses before the ducks spawn.
  - Actual Outcome: The counter not counts the misses before the ducks spawn.

  - Bug 4: The game not displaying the top score.
  - Description: The game is not displaying the top score in the main menu.
  - Steps to Reproduce:
    1. [Step 1] Fix the top score display.
    2. [Step 2] Test the top score display.
  - Expected Outcome: The top score is visible in the main menu.
  - Actual Outcome: The top score is visible in the main menu.

  - Bug 5: Sometimes on higher levels the ducks show 'traces' for few seconds.
  - Description: Sometimes on higher levels the ducks show 'traces' for few seconds.
  - Steps to Reproduce:
    1. [Step 1] Check and fix the logic.
    2. [Step 2] Manual test the gameplay.
  - Expected Outcome: The birds are not leaving 'traces' anumore.
  - Actual Outcome: The birds are not leaving 'traces' anumore.

## Credits

- [Jaimie](https://github.com/JaimieHemmings)
- [Noah](https://github.com/Noah-Samawi)
- [Mihály](https://github.com/Nmyhi)
- [Chris](https://github.com/Chris-Tranter)
- [Oliver](https://github.com)

### Code Used

All the codes in this Repo was developed by us!

### Content

This content has been created by us - Retro Rascals -

###  Media

Every asset and sound in the project is , loyalty free, free to use for sommercial purposes.
  
###  Acknowledgments

Thanks to CodeInstitute for creating the Event!