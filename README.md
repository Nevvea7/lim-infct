# Limited Infection Visualization

## The Program

**Warning** only tested in Google Chrome.

See it live [here](http://nevvea7.github.io/lim-infct/) or just clone the repo and open index.html in your browser!

Color changes indicate version changes. Sometimes the color change isn't very obvious, so look closely!

Many thanks to d3.js, especially [this example](http://bl.ocks.org/mbostock/4062045)

### Generate Random Acyclic Graph

- Every time the page loads, it would generate a group of graphs that contains 150 nodes in total
- Put a number in the "Generate" box and hit "Generate" to generate new graphs
- If you leave it blank, the default number of nodes it just 150

### Total Infection

- Click on any node or specify a starting id to invoke Total Infection

### Limited Infection

- Put a number in the "set infected cap" box and hit "Lim Infect" to invoke Limited Infection
- If involved groups were on different versions before limited infection starts, they should be on the same, highest version after being infected together
- If nothing happens, just refresh the page.

## The Challenges

- First time writing front-end JavaScript
- Getting to know d3.js

## Wishlist

- An auto-scrolling log on the side that shows every event, right now you can kind of see what's going on using the browser's Developer Tools
- Better, more responsive UI
- Label nodes with random names
- Better documentation


