// Music Feature Explorer - Interactive Spotify Analysis
// CSE 442 Assignment 3

// Global variables
let fullData = [];
let filteredData = [];
let selectedData = [];
let svg, xScale, yScale, colorScale;
let currentXAxis = 'popularity'; // Fixed to popularity
let currentYAxis = 'energy';

// Chart dimensions
const margin = { top: 40, right: 120, bottom: 60, left: 60 };
const width = 1200 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Feature metadata
const featureInfo = {
  danceability: { label: 'Danceability', range: [0, 1] },
  energy: { label: 'Energy', range: [0, 1] },
  valence: { label: 'Valence (Positivity)', range: [0, 1] },
  tempo: { label: 'Tempo (BPM)', range: [0, 250] },
  loudness: { label: 'Loudness (dB)', range: [-60, 5] },
  acousticness: { label: 'Acousticness', range: [0, 1] },
  speechiness: { label: 'Speechiness', range: [0, 1] },
  popularity: { label: 'Popularity', range: [0, 100] }
};

// Load and process data
d3.csv('data/dataset.csv').then(function(data) {
  console.log('Loaded', data.length, 'records');
  
  // Sample data for performance (take every 10th song, or adjust as needed)
  const sampleRate = Math.ceil(data.length / 10000); // Target ~10k points
  fullData = data.filter((d, i) => i % sampleRate === 0).map(d => ({
    track_name: d.track_name,
    artists: d.artists,
    genre: d.track_genre,
    popularity: +d.popularity || 0,
    danceability: +d.danceability || 0,
    energy: +d.energy || 0,
    valence: +d.valence || 0,
    tempo: +d.tempo || 0,
    loudness: +d.loudness || 0,
    acousticness: +d.acousticness || 0,
    speechiness: +d.speechiness || 0,
    instrumentalness: +d.instrumentalness || 0,
    liveness: +d.liveness || 0
  }));
  
  filteredData = [...fullData];
  
  console.log('Sampled to', fullData.length, 'songs for visualization');
  
  // Populate genre checkboxes
  const genres = [...new Set(fullData.map(d => d.genre))].sort();
  const genreContainer = d3.select('#genre-checkboxes');
  
  genres.forEach((genre, i) => {
    const item = genreContainer.append('div')
      .attr('class', 'genre-checkbox-item');
    
    item.append('input')
      .attr('type', 'checkbox')
      .attr('id', `genre-${i}`)
      .attr('value', genre)
      .property('checked', false) // Start unchecked
      .on('change', applyFilters);
    
    item.append('label')
      .attr('for', `genre-${i}`)
      .text(genre);
  });
  
  // Create visualizations
  createScatterPlot();
  updateStatistics();
  
  // Set up event listeners
  setupInteractions();
  setupInteractions();
});

function createScatterPlot() {
  // Clear existing
  d3.select('#main-chart').selectAll('*').remove();
  
  // Create SVG
  svg = d3.select('#main-chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  // Get current feature ranges
  const xInfo = featureInfo[currentXAxis];
  const yInfo = featureInfo[currentYAxis];
  
  // Scales
  xScale = d3.scaleLinear()
    .domain(xInfo.range)
    .range([0, width])
    .nice();
  
  yScale = d3.scaleLinear()
    .domain(yInfo.range)
    .range([height, 0])
    .nice();
  
  // Color by genre (using a large set of distinct colors)
  const genres = [...new Set(filteredData.map(d => d.genre))];
  
  // Expanded color palette with 30+ distinct colors
  const distinctColors = [
    '#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
    '#911eb4', '#42d4f4', '#f032e6', '#bfef45', '#fabed4',
    '#469990', '#dcbeff', '#9A6324', '#fffac8', '#800000',
    '#aaffc3', '#808000', '#ffd8b1', '#000075', '#a9a9a9',
    '#ff6347', '#4682b4', '#32cd32', '#ff1493', '#00ced1',
    '#ff8c00', '#9932cc', '#00fa9a', '#dc143c', '#00bfff',
    '#ffa500', '#8a2be2', '#adff2f', '#ff69b4', '#1e90ff'
  ];
  
  colorScale = d3.scaleOrdinal()
    .domain(genres)
    .range(distinctColors);
  
  // Add grid
  svg.append('g')
    .attr('class', 'grid')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale)
      .tickSize(-height)
      .tickFormat(''));
  
  svg.append('g')
    .attr('class', 'grid')
    .call(d3.axisLeft(yScale)
      .tickSize(-width)
      .tickFormat(''));
  
  // Add axes
  svg.append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .append('text')
    .attr('class', 'axis-label')
    .attr('x', width / 2)
    .attr('y', 40)
    .attr('fill', 'black')
    .text(xInfo.label);
  
  svg.append('g')
    .attr('class', 'axis y-axis')
    .call(d3.axisLeft(yScale))
    .append('text')
    .attr('class', 'axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -45)
    .attr('fill', 'black')
    .text(yInfo.label);
  
  // Add title
  svg.append('text')
    .attr('class', 'chart-title')
    .attr('x', width / 2)
    .attr('y', -15)
    .attr('text-anchor', 'middle')
    .style('font-size', '18px')
    .style('font-weight', '600')
    .text(`${yInfo.label} vs. ${xInfo.label}`);
  
  // Draw points
  updateScatterPoints();
  
  // Add brush
  const brush = d3.brush()
    .extent([[0, 0], [width, height]])
    .on('end', brushed);
  
  svg.append('g')
    .attr('class', 'brush')
    .call(brush);
}

function updateScatterPoints() {
  const tooltip = d3.select('#tooltip');
  
  const points = svg.selectAll('.data-point')
    .data(filteredData, d => `${d.track_name}-${d.artists}`);
  
  // Exit
  points.exit()
    .transition()
    .duration(300)
    .attr('r', 0)
    .remove();
  
  // Enter + Update
  const pointsEnter = points.enter()
    .append('circle')
    .attr('class', 'data-point')
    .attr('r', 0);
  
  pointsEnter.merge(points)
    .transition()
    .duration(300)
    .attr('cx', d => xScale(d[currentXAxis]))
    .attr('cy', d => yScale(d[currentYAxis]))
    .attr('r', 3.5)
    .attr('fill', d => colorScale(d.genre))
    .attr('opacity', 0.6);
  
  // Re-bind events after transition
  svg.selectAll('.data-point')
    .on('mouseover', function(event, d) {
      d3.select(this)
        .attr('r', 6)
        .attr('opacity', 1)
        .attr('stroke', '#333')
        .attr('stroke-width', 2);
      
      tooltip.style('opacity', 1)
        .html(`
          <strong>${d.track_name}</strong><br/>
          ${d.artists}<br/>
          <em>${d.genre}</em><br/>
          <br/>
          Danceability: ${d.danceability.toFixed(2)}<br/>
          Energy: ${d.energy.toFixed(2)}<br/>
          Valence: ${d.valence.toFixed(2)}<br/>
          Tempo: ${d.tempo.toFixed(0)} BPM<br/>
          Popularity: ${d.popularity}
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    })
    .on('mouseout', function() {
      d3.select(this)
        .attr('r', 3.5)
        .attr('opacity', 0.6)
        .attr('stroke', 'none');
      
      tooltip.style('opacity', 0);
    });
}

function updateAxes() {
  const xInfo = featureInfo[currentXAxis];
  const yInfo = featureInfo[currentYAxis];
  
  // Update scales
  xScale.domain(xInfo.range).nice();
  yScale.domain(yInfo.range).nice();
  
  // Update axes with transition
  svg.select('.x-axis')
    .transition()
    .duration(500)
    .call(d3.axisBottom(xScale))
    .select('.axis-label')
    .text(xInfo.label);
  
  svg.select('.y-axis')
    .transition()
    .duration(500)
    .call(d3.axisLeft(yScale))
    .select('.axis-label')
    .text(yInfo.label);
  
  // Update title
  svg.select('.chart-title')
    .text(`${yInfo.label} vs. ${xInfo.label}`);
  
  // Update points
  svg.selectAll('.data-point')
    .transition()
    .duration(500)
    .attr('cx', d => xScale(d[currentXAxis]))
    .attr('cy', d => yScale(d[currentYAxis]));
}

function brushed(event) {
  const selection = event.selection;
  
  if (!selection) {
    selectedData = [];
    svg.selectAll('.data-point')
      .attr('opacity', 0.6)
      .attr('r', 3.5);
  } else {
    const [[x0, y0], [x1, y1]] = selection;
    
    selectedData = filteredData.filter(d => {
      const x = xScale(d[currentXAxis]);
      const y = yScale(d[currentYAxis]);
      return x >= x0 && x <= x1 && y >= y0 && y <= y1;
    });
    
    svg.selectAll('.data-point')
      .attr('opacity', d => {
        const x = xScale(d[currentXAxis]);
        const y = yScale(d[currentYAxis]);
        return (x >= x0 && x <= x1 && y >= y0 && y <= y1) ? 0.9 : 0.1;
      })
      .attr('r', d => {
        const x = xScale(d[currentXAxis]);
        const y = yScale(d[currentYAxis]);
        return (x >= x0 && x <= x1 && y >= y0 && y <= y1) ? 5 : 3.5;
      });
  }
  
  updateStatistics();
}

function updateStatistics() {
  const dataToUse = selectedData.length > 0 ? selectedData : filteredData;
  
  const avgDance = d3.mean(dataToUse, d => d.danceability).toFixed(2);
  const avgEnergy = d3.mean(dataToUse, d => d.energy).toFixed(2);
  const avgValence = d3.mean(dataToUse, d => d.valence).toFixed(2);
  
  // Find most popular genre
  const genreCounts = d3.rollup(dataToUse, v => v.length, d => d.genre);
  const topGenre = Array.from(genreCounts, ([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)[0];
  
  d3.select('#song-count').text(dataToUse.length.toLocaleString());
  d3.select('#avg-dance').text(avgDance);
  d3.select('#avg-energy').text(avgEnergy);
  d3.select('#avg-valence').text(avgValence);
  d3.select('#top-genre').text(topGenre ? `${topGenre.genre} (${topGenre.count})` : '-');
}

function setupInteractions() {
  // Genre checkboxes already have change listeners attached during creation
  
  // Select all genres button
  d3.select('#select-all-genres').on('click', function() {
    d3.selectAll('#genre-checkboxes input[type="checkbox"]').property('checked', true);
    applyFilters();
  });
  
  // Clear genres button
  d3.select('#clear-genres').on('click', function() {
    d3.selectAll('#genre-checkboxes input[type="checkbox"]').property('checked', false);
    applyFilters();
  });
  
  // Only Y-axis selection (X-axis is fixed to popularity)
  d3.select('#y-axis-select').on('change', function() {
    currentYAxis = this.value;
    updateAxes();
  });
  
  // Range sliders
  ['dance', 'energy', 'valence'].forEach(feature => {
    d3.select(`#${feature}-min`).on('input', function() {
      updateSliderValue(feature);
      applyFilters();
    });
    d3.select(`#${feature}-max`).on('input', function() {
      updateSliderValue(feature);
      applyFilters();
    });
  });
  
  // Reset button
  d3.select('#reset-btn').on('click', function() {
    d3.selectAll('#genre-checkboxes input[type="checkbox"]').property('checked', true);
    d3.select('#dance-min').property('value', 0);
    d3.select('#dance-max').property('value', 100);
    d3.select('#energy-min').property('value', 0);
    d3.select('#energy-max').property('value', 100);
    d3.select('#valence-min').property('value', 0);
    d3.select('#valence-max').property('value', 100);
    updateSliderValue('dance');
    updateSliderValue('energy');
    updateSliderValue('valence');
    applyFilters();
  });
}

function updateSliderValue(feature) {
  const min = +d3.select(`#${feature}-min`).property('value') / 100;
  const max = +d3.select(`#${feature}-max`).property('value') / 100;
  d3.select(`#${feature}-value`).text(`${min.toFixed(2)}-${max.toFixed(2)}`);
}

function applyFilters() {
  // Get checked genres from checkboxes
  const selectedGenres = [];
  d3.selectAll('#genre-checkboxes input[type="checkbox"]:checked').each(function() {
    selectedGenres.push(d3.select(this).property('value'));
  });
  
  const danceMin = +d3.select('#dance-min').property('value') / 100;
  const danceMax = +d3.select('#dance-max').property('value') / 100;
  const energyMin = +d3.select('#energy-min').property('value') / 100;
  const energyMax = +d3.select('#energy-max').property('value') / 100;
  const valenceMin = +d3.select('#valence-min').property('value') / 100;
  const valenceMax = +d3.select('#valence-max').property('value') / 100;
  
  filteredData = fullData.filter(d => {
    // Check if genre is in selected genres (or if none selected, show all)
    const genreMatch = selectedGenres.length === 0 || selectedGenres.includes(d.genre);
    const danceMatch = d.danceability >= danceMin && d.danceability <= danceMax;
    const energyMatch = d.energy >= energyMin && d.energy <= energyMax;
    const valenceMatch = d.valence >= valenceMin && d.valence <= valenceMax;
    return genreMatch && danceMatch && energyMatch && valenceMatch;
  });
  
  selectedData = []; // Clear selection
  updateScatterPoints();
  updateStatistics();
}