// Global variables
let cerealData = [];
let currentData = [];
let svg, xScale, yScale, sizeScale, colorScale;
let xAxis, yAxis;
let margin = { top: 40, right: 120, bottom: 60, left: 80 };
let width = 900 - margin.left - margin.right;
let height = 600 - margin.top - margin.bottom;

// Manufacturer full names mapping
const manufacturerNames = {
    'N': 'Nabisco',
    'Q': 'Quaker Oats',
    'K': 'Kelloggs',
    'R': 'Ralston Purina',
    'G': 'General Mills',
    'P': 'Post',
    'A': 'American Home Food Products'
};

// Color scheme for manufacturers
const manufacturerColors = {
    'N': '#e41a1c',
    'Q': '#377eb8',
    'K': '#4daf4a',
    'R': '#984ea3',
    'G': '#ff7f00',
    'P': '#ffff33',
    'A': '#a65628'
};

// Axis labels mapping
const axisLabels = {
    'sugars': 'Sugar Content (g)',
    'calories': 'Calories',
    'protein': 'Protein (g)',
    'fiber': 'Fiber (g)',
    'sodium': 'Sodium (mg)',
    'fat': 'Fat (g)',
    'carbo': 'Carbohydrates (g)',
    'rating': 'Consumer Rating'
};

// Initialize the visualization
document.addEventListener('DOMContentLoaded', function() {
    loadData();
});

// Load and process the data
function loadData() {
    d3.csv('data/cereal.csv').then(function(data) {
        // Parse numeric values
        cerealData = data.map(d => ({
            name: d.name,
            mfr: d.mfr,
            type: d.type,
            calories: +d.calories,
            protein: +d.protein,
            fat: +d.fat,
            sodium: +d.sodium,
            fiber: +d.fiber,
            carbo: +d.carbo,
            sugars: +d.sugars,
            potass: +d.potass,
            vitamins: +d.vitamins,
            shelf: +d.shelf,
            weight: +d.weight,
            cups: +d.cups,
            rating: +d.rating
        }));

        currentData = cerealData;

        // Populate manufacturer filter
        populateManufacturerFilter();

        // Initialize the visualization
        initializeVisualization();

        // Update statistics
        updateStatistics();

        // Create legend
        createLegend();

        // Setup event listeners
        setupEventListeners();
    }).catch(function(error) {
        console.error('Error loading the data:', error);
    });
}

// Populate manufacturer filter dropdown
function populateManufacturerFilter() {
    const manufacturers = [...new Set(cerealData.map(d => d.mfr))].sort();
    const select = d3.select('#manufacturer-filter');

    manufacturers.forEach(mfr => {
        select.append('option')
            .attr('value', mfr)
            .text(manufacturerNames[mfr] || mfr);
    });
}

// Initialize the SVG and scales
function initializeVisualization() {
    // Clear any existing SVG
    d3.select('#scatter-plot').selectAll('*').remove();

    // Create SVG
    svg = d3.select('#scatter-plot')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    xScale = d3.scaleLinear().range([0, width]);
    yScale = d3.scaleLinear().range([height, 0]);
    sizeScale = d3.scaleSqrt().range([4, 20]);
    colorScale = d3.scaleOrdinal()
        .domain(Object.keys(manufacturerColors))
        .range(Object.values(manufacturerColors));

    // Create axes groups
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`);

    svg.append('g')
        .attr('class', 'y-axis');

    // Add axis labels
    svg.append('text')
        .attr('class', 'x-axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + 45);

    svg.append('text')
        .attr('class', 'y-axis-label')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -60);

    // Initial render
    updateVisualization();
}

// Update the visualization based on current selections
function updateVisualization() {
    const xVar = document.getElementById('x-axis-select').value;
    const yVar = document.getElementById('y-axis-select').value;
    const sizeVar = document.getElementById('size-select').value;

    // Update scales
    xScale.domain([0, d3.max(currentData, d => d[xVar]) * 1.1]);
    yScale.domain([0, d3.max(currentData, d => d[yVar]) * 1.1]);
    sizeScale.domain([0, d3.max(currentData, d => d[sizeVar])]);

    // Update axes
    const xAxisFunc = d3.axisBottom(xScale).ticks(8);
    const yAxisFunc = d3.axisLeft(yScale).ticks(8);

    svg.select('.x-axis')
        .transition()
        .duration(750)
        .call(xAxisFunc);

    svg.select('.y-axis')
        .transition()
        .duration(750)
        .call(yAxisFunc);

    // Update axis labels
    svg.select('.x-axis-label')
        .text(axisLabels[xVar]);

    svg.select('.y-axis-label')
        .text(axisLabels[yVar]);

    // Bind data to circles
    const circles = svg.selectAll('.cereal-circle')
        .data(currentData, d => d.name);

    // Enter new circles
    circles.enter()
        .append('circle')
        .attr('class', 'cereal-circle')
        .attr('cx', d => xScale(d[xVar]))
        .attr('cy', d => yScale(d[yVar]))
        .attr('r', 0)
        .attr('fill', d => colorScale(d.mfr))
        .attr('opacity', 0.7)
        .attr('stroke', '#333')
        .attr('stroke-width', 1)
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut)
        .merge(circles)
        .transition()
        .duration(750)
        .attr('cx', d => xScale(d[xVar]))
        .attr('cy', d => yScale(d[yVar]))
        .attr('r', d => sizeScale(d[sizeVar]))
        .attr('fill', d => colorScale(d.mfr));

    // Exit old circles
    circles.exit()
        .transition()
        .duration(750)
        .attr('r', 0)
        .remove();
}

// Handle mouse over event
function handleMouseOver(event, d) {
    // Highlight the circle
    d3.select(this)
        .transition()
        .duration(200)
        .attr('opacity', 1)
        .attr('stroke-width', 3);

    // Create tooltip
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
        .html(`
            <strong>${d.name}</strong><br>
            <em>${manufacturerNames[d.mfr]}</em><br>
            <hr>
            Rating: ${d.rating.toFixed(1)}<br>
            Calories: ${d.calories}<br>
            Sugar: ${d.sugars}g<br>
            Fiber: ${d.fiber}g<br>
            Protein: ${d.protein}g<br>
            Fat: ${d.fat}g<br>
            Sodium: ${d.sodium}mg
        `);
}

// Handle mouse out event
function handleMouseOut(event, d) {
    // Reset the circle
    d3.select(this)
        .transition()
        .duration(200)
        .attr('opacity', 0.7)
        .attr('stroke-width', 1);

    // Remove tooltip
    d3.selectAll('.tooltip').remove();
}

// Update statistics
function updateStatistics() {
    const totalCereals = currentData.length;
    const avgSugar = d3.mean(currentData, d => d.sugars).toFixed(1);
    const avgRating = d3.mean(currentData, d => d.rating).toFixed(1);
    const avgCalories = d3.mean(currentData, d => d.calories).toFixed(0);

    document.getElementById('total-cereals').textContent = totalCereals;
    document.getElementById('avg-sugar').textContent = avgSugar + 'g';
    document.getElementById('avg-rating').textContent = avgRating;
    document.getElementById('avg-calories').textContent = avgCalories;
}

// Create legend
function createLegend() {
    const legendContainer = d3.select('#legend-container');

    Object.entries(manufacturerNames).forEach(([code, name]) => {
        const item = legendContainer.append('div')
            .attr('class', 'legend-item');

        item.append('div')
            .attr('class', 'legend-color')
            .style('background-color', manufacturerColors[code]);

        item.append('span')
            .text(name);
    });
}

// Setup event listeners for controls
function setupEventListeners() {
    document.getElementById('x-axis-select').addEventListener('change', updateVisualization);
    document.getElementById('y-axis-select').addEventListener('change', updateVisualization);
    document.getElementById('size-select').addEventListener('change', updateVisualization);

    document.getElementById('manufacturer-filter').addEventListener('change', function() {
        const selectedMfr = this.value;

        if (selectedMfr === 'all') {
            currentData = cerealData;
        } else {
            currentData = cerealData.filter(d => d.mfr === selectedMfr);
        }

        updateVisualization();
        updateStatistics();
    });
}
