/* ==== initializes the canvas ==== */
function start(numOfNodes) {
  numOfNodes = numOfNodes || 150;
  svg.remove();
  svg = d3.select("body").append("svg")
    .attr("class", "col-lg-9 col-md-9 col-sm-12")
    .attr("height", height);
 
  // generate new graph
  graph = generateGraph(numOfNodes);
  people = graph.people;

  // pick a starting point of every graph, and map them to their sizes
  // makes limited infection easier
  sizeMap = countGroups();

  console.log("Graph: ", graph);
  console.log("StartId to Size Map: ", sizeMap);

  // stores sizes of graphs in descending order
  // makes limited infection easier
  sizes = [];
  for (k in sizeMap) {
    if (sizeMap.hasOwnProperty(k)) {
      sizes.push(k);
    }
  }
  // sort in descending order
  sizes.sort(function (a,  b) { return b - a; });

  // d3 setup
  force
      .nodes(graph.people)
      .links(graph.links)
      .start();

  var link = svg.selectAll(".link")
      .data(graph.links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(1); });

  var node = svg.selectAll(".node")
      .data(graph.people)
    .enter().append("circle")
      .attr("class", "node")
      .attr("id", function(d, i) {var result = "p" + i; return result;})
      .attr("r", 5)
      .style("fill", function(d) { return color(d.version); })
      .call(force.drag);

  node.append("text")
      .text(function(d) { return d.id; });

  node.on("click", function() {
    var num = this.id.replace( /^\D+/g, '');
    infect(parseInt(num));
  });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  });

}

/* =========== functions for generating the relation graph ============== */
function Person(id, group) {
  this.id = id;
  this.group = group;
  this.version = 0;
  this.neighbors = [];
}

function Link(source, target) {
  this.source = source;
  this.target = target;
}

// generate a group of graphs with n nodes in total
function generateGraph(n) {
  var ppl = [];
  var lks = [];
  // randomly determine the number of graphs in the canvas 
  var totalGroups = Math.ceil(Math.random() * Math.floor(n / 10));

  var groupMap = {};
  var students = new Set();
  // generate n people and push them into the ppl array
  // and randomly assign them to groups
  for (var i = 0; i < n; i++) {
    var group = Math.floor(Math.random() * totalGroups);
    ppl.push(new Person(i, group));
    if (!groupMap[group]) {
      groupMap[group] = [];
    }
    groupMap[group].push(i);
  }

  // generate links between people in the same group
  for (var g = 0; g < totalGroups; g++) {
    var curGroup = groupMap[g];
    if (!curGroup) continue;
    for (var i = 0; i < curGroup.length - 1; i++) {
      for (var j = i + 1; j < curGroup.length; j++) {
        var p1 = curGroup[i];
        var p2 = curGroup[j];
        if (Math.random() > 0.4 && !students.has(p2)) {    
          ppl[p1].neighbors.push(p2);
          ppl[p2].neighbors.push(p1);
          lks.push(new Link(p1, p2));
          students.add(p2);
        }
      }
    }
  }
  
  var graph = { people : ppl, links : lks};
  return graph;
}

// the actual groups might be different from the one assigned because links are randomly generated
function countGroups() {
  var sizeMap = {};
  var visited = new Set();

  // do bfs on each single graph and count their sizes
  for (var i = 0; i < people.length; i++) {
    if (visited.has(i)) continue;
    visited.add(i);
    var count = 0;
    var inCurGraph = [];
    inCurGraph.push(i);
    while (inCurGraph.length > 0) {
      var curPerson = graph.people[inCurGraph.shift()];
      count++;
      curPerson.neighbors.forEach(function(p) {
        if (!visited.has(p)) inCurGraph.push(p);
        visited.add(p);
      });
    }

    if (!sizeMap[count]) sizeMap[count] = [];
    sizeMap[count].push(i);
  } 
  return sizeMap;
}


/* =========== functions for infecting ============= */
function infect(startId) {
  var startPerson = graph.people[startId];
  console.log("Starting infection from: ", startId, " current version: ", startPerson.version);
  var newVersion = startPerson.version + 1;
  var visited = new Set();
  visited.add(startId);
  startPerson.version = newVersion;
  var tobeInfected = [];
  tobeInfected.push(parseInt(startId));

  var nextLevel = [];
  var level = 0;
  // do a bfs, change version and color
  function levelInfect() {
    var nextInfected;
    while (tobeInfected.length > 0) {
      // console.log("infect check", startId);
      nextInfected = graph.people[tobeInfected.shift()];
      nextInfected.version = newVersion;
      // assign a new class to nodes so that when level finishes d3 can easily select them all 
      // and color them in one pass
      d3.select("circle#p" + nextInfected.id)
        .attr("class", "node infect-gr" + nextInfected.group + "-lv" + level);
      nextInfected.neighbors.forEach(function(p) {
        if (!visited.has(p)) nextLevel.push(p);
        visited.add(p);
      });
    }

    if (!nextInfected) return;
    // level finished, start coloring
    tobeInfected = nextLevel.slice();
    nextLevel = [];
    d3.selectAll(".infect-gr" + nextInfected.group + "-lv" + level)
    .transition()
    .style("fill", function(d) { return color(d.version); })
    .duration(500);
    level++;
    setTimeout(levelInfect, 500);

  }

  levelInfect();

}

// find a combination of graphs whose sizes' sum is
// smaller than the limit
// stores their starting points in res
function findLimGroups(res, lim) {
  for (var i = 0; i < sizes.length; i++) {
    var curSize = sizes[i];
    for (var j = 0; j < sizeMap[curSize].length; j++) {
      if (lim >= curSize) {
        lim -= sizes[i];
        res.push(sizeMap[curSize][j]);
      }
    }
  }
}

// find a working infection with greedy approach
function liminfect(lim) {
  // find a combination of graphs whose size sum is in the limit
  var limInfectGroups = [];
  findLimGroups(limInfectGroups, parseInt(lim));

  // different groups might be on different versions, after the new roll out
  // they should be on the same, most recent new version
  var highestVersion = 0;
  limInfectGroups.forEach(function(id) {
    highestVersion = Math.max(highestVersion, people[id].version);
  });
  limInfectGroups.forEach(function(id) {
    people[id].version = highestVersion;
  });
  limInfectGroups.forEach(infect);
}