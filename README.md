# "Root Routes"
* Project for Hack the Change 2026! 
* **Team:** Papoi 🤓
* **Prompt:** <i>How can we leverage technology to promote health, social connection, and well-being in our communities?</i>
* **Tech Stack:** 
  * FRONTEND: React.js and Vite, utilizing Leaflet.js
  * BACKEND: FastAPI utilizing Calgary Tree Dataset to create a SQLite database

The user enters their community within Calgary, as well as the time they are aiming to go outside. "Root Routes" starts a timer and gives the user a challenge — find a tree of a random species within your neighbourhood. The user can access a map within the app to see where the trees are located. Upon arriving at a tree, the user can ask the app to identify the tree. The app compares the user's location to the locations of trees in the database. If the tree species and location matches the user's location and their given species, the tree and the route information (whether they reached their goal time) are added to an entry under the "Trees" tab, so the user can look at the trees they've found.

At any tree they've been to, the user can leave a review on the tree or report the tree. Any user who has visited a particular tree can view reviews on it. Reporting the tree links to the City of Calgary's Contact Urban Forestry page.

## How to develop:
**FRONTEND**
If you don't have Node.js installed on your computer, install the LTS version from here: https://nodejs.org/

You can check if it's installed by running:\
`node --version`\
`npm --version`

After cloning the repository, follow the steps below:

IN FOLDER: app/frontend

Install dependencies

```
npm install
```

Start the development server

```
npm run dev
```

Go to the localhost url in your browser (can be found in your terminal)!


**BACKEND**
SETTING UP VIRTUAL ENVIRONMENT:
IN FOLDER: app/backend (cd into this)

Create virtual environment

```
python -m venv venv
```

Activate virtual environment

```
.\venv\Scripts\Activate.ps1
```

Deactivate virtual environment

```
deactivate
```

SETTING UP LOCAL DATABASE: 
IN FOLDER: app/backend (cd into this)

Make sure the virtual environment is active (see steps above)

Run the following commands below

```
python -m pip install --upgrade pip
```

```
pip install "fastapi[standard]" sqlmodel
```

Verify the installation of fastapi
```
pip list
```

Start the application

```
uvicorn main:app --reload
```
