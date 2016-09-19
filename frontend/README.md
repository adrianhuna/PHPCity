# PHPCity frontend
This is frontend part of [PHPCity](https://github.com/adrianhuna/PHPCity) visualization. Visit [visualization application](https://adrianhuna.github.io/PHPCity) to see it in action. Instructions for visualizing your projects can be found in [backend part](https://github.com/adrianhuna/PHPCity/tree/master/backend) of this project.

To read more about this project see README in [root directory](https://github.com/adrianhuna/PHPCity/blob/master/README.md).

## Development
This project is written in Typescript. If you need to edit something, please proceed as follows:
- move into `frontend` folder of [PHPCity](https://github.com/adrianhuna/PHPCity) if you are not already (`cd frontend`)
- run `npm install` to install development libraries
- run `bower install` to install project's dependencies
- run `gulp` to start building process
- open `dist/index.html` in your browser
- edit files as needed - changes will be detected and reflected automatically

Gulp task `gulp build:dist` is designed to be used when creating a new release.

## Libraries used
#### [three.js](http://threejs.org/)
- WebGL 3D library

#### [bin-packing](https://github.com/jakesgordon/bin-packing)
- optimal positioning of buildings in the city

#### [d3](https://d3js.org/)
- for histogram visualization

#### [stats.js](https://github.com/mrdoob/stats.js/)
- JavaScript performance monitor

#### OrbitControls](http://threejs.org/examples/js/controls/OrbitControls.js)
- orbiting controls that allow zooming and panning

#### Well known
- [jquery](https://jquery.com/)
- [bootstrap](http://getbootstrap.com/)
- [underscore](http://underscorejs.org/)
- [font-awesome](http://fontawesome.io/)
