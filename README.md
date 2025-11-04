# 🥣 Cereal Nutrition Explorer

An interactive D3.js visualization exploring nutritional patterns and consumer ratings across breakfast cereals. This project investigates the relationship between nutritional characteristics (sugar, fiber, protein, etc.) and consumer preferences.

## Live Demo
[View on GitHub Pages](https://dlymCode.github.io/cse442A3/)

## Research Question
**How do nutritional characteristics relate to consumer ratings of breakfast cereals?**  
Does healthier nutrition (higher fiber, lower sugar) lead to better ratings, or do taste preferences dominate consumer choices?

## Features
- **Interactive Scatter Plot** - Explore relationships between any pair of nutritional variables
- **Dynamic Axis Selection** - Choose X-axis, Y-axis, and bubble size from 7+ nutritional dimensions
- **Manufacturer Filtering** - Filter by specific cereal brands (Kellogg's, General Mills, Quaker, etc.)
- **Rich Tooltips** - Hover over cereals to see complete nutritional information
- **Animated Transitions** - Smooth animations when switching between different views
- **Summary Statistics** - Live-updating stats showing averages and totals
- **Color-Coded Legend** - Visual guide to manufacturer brands
- **Light/Dark Mode Toggle** - Switch between themes with preference saved locally

## Visual Encodings
- **Position (X, Y):** Nutritional variables (sugar, calories, fiber, protein, sodium, fat, carbs, rating)
- **Color:** Manufacturer (7 distinct brands)
- **Size:** Adjustable third dimension (default: calories)
- **Opacity & Stroke:** Hover highlighting for detail exploration

## Interaction Techniques
- **Dynamic Queries:** Real-time filtering via dropdown menus
- **Details-on-Demand:** Tooltips reveal complete nutritional profiles
- **Coordinated Views:** Statistics and legend update with filters
- **Theme Switching:** Toggle between light and dark modes

## Data Source
[80 Cereals Dataset](https://www.kaggle.com/datasets/crawford/80-cereals) (Kaggle)  
Contains nutritional information and consumer ratings for 77 breakfast cereals.

## Technologies
- D3.js v7 - Data-driven visualization
- HTML5, CSS3 (with CSS Variables for theming)
- Vanilla JavaScript (ES6+)
- GitHub Pages - Web hosting

## Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/dlymCode/cse442A3.git
   cd cse442A3
   ```

2. Start a local server:
   ```bash
   python -m http.server 8000
   ```

3. Open in browser:
   ```
   http://localhost:8000
   ```

## Project Structure
```
cse442A3/
├── index.html          # Main webpage with embedded write-up
├── script.js           # D3.js visualization logic
├── style.css           # Theming and responsive styles
├── data/
│   └── cereal.csv      # Cereal nutritional dataset
└── README.md           # This file
```

## Development Process
- **Time Investment:** ~12-15 hours
- **Most Challenging:** Implementing smooth axis transitions while maintaining data binding
- **Key Learning:** Balancing information density with visual clarity

## Write-Up
A complete write-up including design rationale, alternatives considered, and development commentary is embedded directly in the visualization webpage.

## CSE 442 Assignment 3
University of Washington - Fall 2025  
Interactive Visualization Project
