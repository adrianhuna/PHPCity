# PHPCity

PHPCity is an implementation of city metaphor visualization and provides visualization of PHP projects
which are implemented in the object-oriented fashion. The most famous city metaphor visualization
is probably [Code City](http://wettel.github.io/codecity.html) but there is also [JSCity](https://github.com/aserg-ufmg/JSCity) for visualizing javascript cities.
Our metaphor is implemented using similar technologies as that are found in JSCity project,
however, we focus on different aspects of software projects.

There are only 5 levels of buildings' widths and heights that are the same for all cities. As a result of this
design decision, you cannot compare two cities relative to each other. By limiting the number of levels
city skyline looks more realistic.

Our adaptation of Code City metaphor is implemented in TypeScript and uses [three.js](http://threejs.org/) library for rendering.
PHPCity is focused on visualization of classes/interfaces and their namespaces. Districts of a city represent namespaces,
and classes and interfaces are represented by buildings. Hierarchy of namespaces is represented by districts
stacked on top of one on another. Number of attributes, number of methods, and lines of code are metrics that can be
mapped on buildings' height and width.

Positions of districts and buildings are calculated as 2D bin packing problem. [2D bin packing library](https://github.com/jakesgordon/bin-packing)
was used in order to find the best positions for city elements, thus this visualization creates the most
compact cities possible.

You can see the visualization in action here on [GitHub pages](https://adrianhuna.github.io/PHPCity).
There are multiple demo projects to showcase. You can select a project from select box in the top menu and a city
visualization will load.

## Visualize custom project
<a name="visualize-custom-project"></a>In order to visualize your own PHP project, you will need to generate JSON file describing your project. Please,
see instructions in [backend part](https://github.com/adrianhuna/PHPCity/backend) of this project.

## How to use PHPCity
Instructions are provided in the [visualization](https://adrianhuna.github.io/PHPCity) by clicking "Help" item in the top menu.
