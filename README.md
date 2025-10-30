# Music Mood Through COVID

An interactive D3.js visualization exploring how musical characteristics of popular songs changed during the COVID-19 pandemic (2017-2024).

## Live Demo
[View on GitLab Pages](https://yourusername.gitlab.io/spotify-trends-viz/)

## Features
- **Multi-line chart** showing valence, energy, and danceability trends over time
- **Interactive tooltips** with detailed information on hover
- **Brush zoom** to focus on specific time periods
- **Feature filter** dropdown to isolate individual metrics
- **COVID-19 annotation** highlighting the pandemic period

## Data Source
[Spotify Tracks Dataset](https://www.kaggle.com/datasets/maharshipandya/-spotify-tracks-dataset) (Kaggle)

## Technologies
- D3.js v7
- HTML5, CSS3, JavaScript
- GitLab Pages

## Local Development
1. Clone the repository
2. Open `index.html` in a web browser
3. Or use a local server: `python -m http.server 8000`

## Deployment
This project automatically deploys to GitLab Pages via `.gitlab-ci.yml` when pushed to the `main` branch.

## Project Structure
```
spotify-trends-viz/
├── index.html          # Main webpage
├── script.js           # D3.js visualization code
├── style.css           # Styling
├── data/
│   └── dataset.csv     # Spotify tracks data
├── .gitlab-ci.yml      # GitLab Pages deployment config
└── README.md           # This file
```

## CSE 442 Assignment 3
University of Washington - Fall 2025
