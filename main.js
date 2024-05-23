var canvas = document.getElementById('my_Canvas');
var gl = canvas.getContext('experimental-webgl');
var edgeInput = document.getElementById('edgeInput');
edgeInput.addEventListener('input', updateCube);

var vertices = [
    -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1,
    -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
    -1, -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1,
    1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1,
    -1, -1, -1, -1, -1, 1, 1, -1, 1, 1, -1, -1,
    -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1,
];

function updateCube() {
    var edge = parseFloat(edgeInput.value);
    var halfEdge = edge / 2;

    // Update cube vertices
    vertices = [
        -halfEdge, -halfEdge, -halfEdge, halfEdge, -halfEdge, -halfEdge, halfEdge, halfEdge, -halfEdge, -halfEdge, halfEdge, -halfEdge,
        -halfEdge, -halfEdge, halfEdge, halfEdge, -halfEdge, halfEdge, halfEdge, halfEdge, halfEdge, -halfEdge, halfEdge, halfEdge,
        -halfEdge, -halfEdge, -halfEdge, -halfEdge, halfEdge, -halfEdge, -halfEdge, halfEdge, halfEdge, -halfEdge, -halfEdge, halfEdge,
        halfEdge, -halfEdge, -halfEdge, halfEdge, halfEdge, -halfEdge, halfEdge, halfEdge, halfEdge, halfEdge, -halfEdge, halfEdge,
        -halfEdge, -halfEdge, -halfEdge, -halfEdge, -halfEdge, halfEdge, halfEdge, -halfEdge, halfEdge, halfEdge, -halfEdge, -halfEdge,
        halfEdge, -halfEdge, -halfEdge, halfEdge, halfEdge, -halfEdge, halfEdge, halfEdge, halfEdge, halfEdge, halfEdge, -halfEdge, halfEdge
    ];

    // Update vertex buffer data
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

var colors = [
    5, 3, 7, 5, 3, 7, 5, 3, 7, 5, 3, 7,
    1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3,
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0
];

var indices = [
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23
];

var vertex_buffer = gl.createBuffer();
updateCube();

var color_buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

var index_buffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

var vertCode = 'attribute vec3 position;' +
    'uniform mat4 Pmatrix;' +
    'uniform mat4 Vmatrix;' +
    'uniform mat4 Mmatrix;' +
    'attribute vec3 color;' +
    'varying vec3 vColor;' +
    'void main(void) { ' +
    'gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);' +
    'vColor = color;' +
    '}';

var fragCode = 'precision mediump float;' +
    'varying vec3 vColor;' +
    'void main(void) {' +
    'gl_FragColor = vec4(vColor, 1.);' +
    '}';

var vertShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertShader, vertCode);
gl.compileShader(vertShader);

var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragShader, fragCode);
gl.compileShader(fragShader);

var shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertShader);
gl.attachShader(shaderProgram, fragShader);
gl.linkProgram(shaderProgram);

var Pmatrix = gl.getUniformLocation(shaderProgram, "Pmatrix");
var Vmatrix = gl.getUniformLocation(shaderProgram, "Vmatrix");
var Mmatrix = gl.getUniformLocation(shaderProgram, "Mmatrix");

gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
var position = gl.getAttribLocation(shaderProgram, "position");
gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(position);

gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
var color = gl.getAttribLocation(shaderProgram, "color");
gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(color);

gl.useProgram(shaderProgram);

var proj_matrix = mat4.create();
var view_matrix = mat4.create();
var mov_matrix = mat4.create();

mat4.perspective(proj_matrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100);
mat4.identity(view_matrix);

var camAngleX = 0;
var camAngleY = 0;
var camRadius = 5;
var zoomSpeed = 0.1;
var angleSpeed = 0.05;

function updateViewMatrix() {
    mat4.identity(view_matrix);
    var camX = camRadius * Math.sin(camAngleY) * Math.cos(camAngleX);
    var camY = camRadius * Math.sin(camAngleX);
    var camZ = camRadius * Math.cos(camAngleY) * Math.cos(camAngleX);

    mat4.lookAt(view_matrix, [camX, camY, camZ], [0, 0, 0], [0, 1, 0]);
}

updateViewMatrix();

document.addEventListener('keydown', (event) => {
    const key = event.key;
    if (key === 'ArrowUp') {
        camAngleX -= angleSpeed;
        if (camAngleX < -Math.PI / 2) camAngleX = -Math.PI / 2;
    } else if (key === 'ArrowDown') {
        camAngleX += angleSpeed;
        if (camAngleX > Math.PI / 2) camAngleX = Math.PI / 2;
    } else if (key === 'ArrowLeft') {
        camAngleY -= angleSpeed;
    } else if (key === 'ArrowRight') {
        camAngleY += angleSpeed;
    } else if (key === 'z') {
        camRadius -= zoomSpeed;
        if (camRadius < 1) camRadius = 1;
    } else if (key === 'x') {
        camRadius += zoomSpeed;
    }

    updateViewMatrix();
});

function animate(time) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0.5, 0.5, 0.5, 0.9);
    gl.clearDepth(1.0);

    gl.viewport(0.0, 0.0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(Pmatrix, false, proj_matrix);
    gl.uniformMatrix4fv(Vmatrix, false, view_matrix);
    gl.uniformMatrix4fv(Mmatrix, false, mov_matrix);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    window.requestAnimationFrame(animate);
}
animate(0);
