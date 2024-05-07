// Taya Ambrose
// Email: tjambros@ucsc.edu
// CSE 160, Assignment 1

// From following Professor Davis' videos

var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1; // flag
  uniform int u_whichTexture;
  void main() {

    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;                   // Use color

    } else if (u_whichTexture == -1) {
      gl_FragColor = vec4(v_UV, 1.0, 1.0);            // Use UV debug color

    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);   // Use texture0

    } else if (u_whichTexture == 1) { // take out to revert
      gl_FragColor = texture2D(u_Sampler1, v_UV);   // Use texture1

    } else {
      gl_FragColor = vec4(1, .2, .2, 1);   // Error, put Redish
    }
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering contect for WebGL
    //gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_Position
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  //Get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }

  //Get the storage location of u_Sampler1 // flag
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements)

}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const PICTURE = 3;

// Globals related UI elements
let g_selectedColor = [0.0,0.0,0.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_globalAngle = 0;
let g_verticalAngle = 0;
let g_zAngle = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_animation = true;
let bubbles = -1;
let g_bubbles = false;
let g_leftFinAngle = 0;
let g_eyePosition = -170;
// let g_eyesMove = false;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {

    // document.getElementById('angleSlide').addEventListener('mouseup', function() { g_globalAngle = this.value; renderAllShapes(); });
    document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
    document.getElementById('verticalAngleSlide').addEventListener('mousemove', function() { g_verticalAngle = this.value; renderAllShapes(); });
    document.getElementById('zSlide').addEventListener('mousemove', function() { g_zAngle = this.value; renderAllShapes(); });
    document.getElementById('yellowSlide').addEventListener('mousemove', function() { g_yellowAngle = this.value; renderAllShapes(); });
    document.getElementById('magentaSlide').addEventListener('mousemove', function() { g_magentaAngle = this.value; renderAllShapes(); });
    document.getElementById('finSlide').addEventListener('mousemove', function() { g_leftFinAngle = this.value; renderAllShapes(); });
    document.getElementById('eyeSlide').addEventListener('mousemove', function() { g_eyePosition = this.value; renderAllShapes(); });

    // Reset Camera
    document.getElementById("cam_reset").onclick = function() { g_globalAngle = 0; g_verticalAngle = 0; g_zAngle = 0; document.getElementById("angleSlide").value = 0; 
		document.getElementById("verticalAngleSlide").value = 0; document.getElementById("zSlide").value = 0; renderAllShapes();};


    
    // buttons to turn on/off animations
	  document.getElementById("animationOn").onclick = function() {g_animation = true;}
	  document.getElementById("animationOff").onclick = function() {g_animation = false;}

    // document.getElementById("eyesOn").onclick = function() {g_eyesMove = true;}
    // document.getElementById("eyesOff").onclick = function() {g_eyesMove = false;}

    // buttons to turn on/off bubbles
	  document.getElementById("bubbleSelectedOn").onclick = function() {g_bubbles = true;}
	  document.getElementById("bubbleSelectedOff").onclick = function() {g_bubbles = false;}
}

// texture
function initTextures() {

  var image = new Image(); // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }

  // Register the event hangler to be called on loading an image
  image.onload = function(){ sendImageToTEXTURE0( image); };
  // Tell the browser to load an image
  image.src = 'brick3.jpg';

  // Add more texture loading

  return true;
}

function sendImageToTEXTURE0(image) {
  var texture = gl.createTexture(); // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  //Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);

  //gl.clear(gl.COLOR_BUFFER_BIT);      // Clear canvas

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);     // Draw the rectangle
  console.log('finished loadTexture');
}

/////////////////////////
// texture two, test
function initTextures2() {

  var sky = new Image(); // Create the sky object
  if (!sky) {
    console.log('Failed to create the sky object');
    return false;
  }

  // Register the event hangler to be called on loading an sky
  sky.onload = function(){ sendImageToTEXTURE1( sky); };
  // Tell the browser to load an sky
  sky.src = 'sky1.jpg';

  // Add more texture loading

  return true;
}

function sendImageToTEXTURE1(image) {
  var textureSky = gl.createTexture(); // Create a textureSky object
  if (!textureSky) {
    console.log('Failed to create the textureSky object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable textureSky unit0
  gl.activeTexture(gl.TEXTURE1);
  //Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, textureSky);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler1, 1);

  //gl.clear(gl.COLOR_BUFFER_BIT);      // Clear canvas

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);     // Draw the rectangle
  console.log('finished loadTexture part 2');
}
/////////////////////////

// Set up actions for the HTML UI elements
function main() {

  // Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables.
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  initTextures();
  initTextures2();


  // canvas.onmousedown = function(event) {
  //   // if shift key is pressed with mouse click
  //   if (event.shiftKey) {
  //     // make eyes move! or stop moving
  //     eyesMove = !eyesMove;
  //   }
  // };

  // Specify the color for clearing <canvas>
  //gl.clearColor(30/255.0, 125/255.0, 155/255.0, 1.0);
  gl.clearColor(135/255.0, 206/255.0, 235/255.0, 1.0);

  //drawCube(M);
  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;
var g_seconds_bubbles = 0;
var repeatInterval = 10;

// Called by browser repeatedly whenever it's time
function tick() {
  // Save the current time
  g_seconds = performance.now()/1000.0 - g_startTime;
  g_seconds_bubbles = performance.now()/1000.0 - g_startTime;
  g_seconds_bubbles %= repeatInterval;
  //console.log(g_seconds);
  //stats.begin();
  udpdateAnimationAngles();
  // udpdateAnimationPositionEyes();
  bubble();

  // Draw everything
  renderAllShapes();

  //stats.end();
  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}


function udpdateAnimationAngles() {
  if (g_animation) {
    g_yellowAngle = (45*Math.sin(g_seconds));
    g_magentaAngle = (45*Math.sin(g_seconds));
    g_leftFinAngle = (45*Math.sin(g_seconds));    }
    //g_eyePosition = Math.sin(g_seconds) * 280;  }
}

// function udpdateAnimationPositionEyes() {
//   if (eyesMove) {
//     g_eyePosition = Math.sin(g_seconds) * 280;  }
// }

function bubble() {
  if (g_bubbles) {
    bubbles = g_seconds_bubbles;
  }
}

var g_eye = [0,0,3];
var g_at = [0,0,-100];
var g_up = [0,1,0];

// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {

  // Check the time at the start of this function
  var startTime = performance.now();

  // Pass the projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(60, 1 * canvas.width/canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
  
  // Pass the view matrix
  var viewMat = new Matrix4();
  viewMat.setLookAt(g_eye[0],g_eye[1],g_eye[2], g_at[0],g_at[1],g_at[2], g_up[0],g_up[1],g_up[2]); // (eye, at, up)
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4()
    .rotate(g_globalAngle, 0, 1, 0) // Horizontal rotation
    .rotate(g_verticalAngle, 1, 0, 0) // Vertical rotation
    .rotate(g_zAngle, 0, 0, 1); // Other rotation...

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw a test triangle
  //drawTriangle3D( [-1.0,0.0,0.0, -0.5,-1.0,0.0, 0.0,0.0,0.0] );
  
////////////////////////////////////////////////////////////////////////////////////////////////

  // // Draw a base tail cube
  // var baseTail = new Cube();
  // baseTail.color = [.9, 0.3, 0.0, 1.0];
  // baseTail.matrix.translate(-.013, -0.15, 0.3);
  // baseTail.matrix.rotate(-5, 1, 0, 0);
  // baseTail.matrix.rotate(-g_yellowAngle, 0, 1, 0);
  // var baseTailCoordinatesMat = new Matrix4(baseTail.matrix);
  // baseTail.matrix.scale(0.1, 0.3, 0.2);
  // baseTail.render();

  // // Draw the end tail cube
  // var endTail = new Cube();
  // endTail.color = [.9, 0.3, 0.0, 1.0];
  // endTail.matrix = new Matrix4(baseTailCoordinatesMat);
  // endTail.matrix.translate(0, 0.65, 0);
  // //endTail.matrix.rotate(g_magentaAngle,0,1,0);
  // endTail.matrix.scale(0.1, 0.4, 0.2);
  // endTail.matrix.translate(-0., -1.7, 0.75);
  // endTail.render();

  // Draw the body cube
  var body = new Cube();
  body.color = [.9, 0.2, 0.0, 1.0];
  body.textureNum = 0;
  body.matrix.translate(-0.25,-0.2,-0.2);
  //body.matrix.rotate(-5,1,0,0);
  body.matrix.scale(0.5,0.3,0.5);
  body.render();

  var block = new Cube();
  block.color = [0/255, 128/255, 128/255, 1.0];
  block.textureNum = -2;
  block.matrix.translate(-0.5,-0.5,-0.5);
  //block.matrix.rotate(-5,1,0,0);
  block.matrix.scale(0.5,0.3,0.5);
  block.render();

  var ground = new Cube();
  ground.color = [.3, 0.8, 0.3, 1.0];
  ground.textureNum = -2;
  ground.matrix.translate(-6,-1.2,-5);
  //ground.matrix.rotate(-5,1,0,0);
  ground.matrix.scale(20,0.1,20);
  ground.render();

  // var sky = new Cube();
  // sky.color = [135/255.0, 206/255.0, 235/255.0, 1.0];
  // sky.textureNum = -2;
  // sky.matrix.translate(-0.8,-0.8,-0.8);
  // //block.matrix.rotate(-5,1,0,0);
  // sky.matrix.scale(0.5,0.3,0.5);
  // sky.render();


  var sky = new Cube();
  sky.color = [135/255.0, 206/255.0, 235/255.0, 1.0];
  sky.textureNum = 1;
  sky.matrix.scale(50,50,50);
  sky.matrix.translate(-.5,-.5,-.5);
  sky.render();


  // var tummy = new Cube();
  // tummy.color = [.9, 0.3, 0.0, 1.0];
  // tummy.matrix.translate(-0.2,-0.25,-0.15);
  // tummy.matrix.rotate(-5,1,0,0);
  // tummy.matrix.scale(0.5*(4/5),0.3*(4/5),0.5*(4/5));
  // tummy.render();

  // // Draw eyes
  // var leftEye = new Cube();
  // leftEye.color = [1, 1, 1, 1.0];
  // leftEye.matrix.translate(-0.2,-0.11,-0.25);
  // leftEye.matrix.rotate(-5,1,0,0);
  // leftEye.matrix.scale(0.1,0.1,0.1);
  // leftEye.render();

  // var leftEyePupil = new Cube();
  // leftEyePupil.color = [0, 0, 0, 1.0];
  // leftEyePupil.matrix.translate(-0.175 + g_eyePosition/10000,-0.11,-0.251); //17
  // leftEyePupil.matrix.rotate(-5,1,0,0);
  // leftEyePupil.matrix.scale(0.05,0.05,0.05);
  // leftEyePupil.render();

  // var rightEye = new Cube();
  // rightEye.color = [1, 1, 1, 1.0];
  // rightEye.matrix.translate(0.1, -0.11, -0.25); // Move over to the right by changing the x-coordinate
  // rightEye.matrix.rotate(-5, 1, 0, 0);
  // rightEye.matrix.scale(0.1, 0.1, 0.1);
  // rightEye.render();

  // var rightEyePupil = new Cube();
  // rightEyePupil.color = [0, 0, 0, 1.0];
  // rightEyePupil.matrix.translate(0.125 + g_eyePosition/10000, -0.11, -0.251); // Move over to the right by changing the x-coordinate
  // rightEyePupil.matrix.rotate(-5, 1, 0, 0);
  // rightEyePupil.matrix.scale(0.05, 0.05, 0.05);
  // rightEyePupil.render();

  // // Top Fin
  // var topOne = new Cube();
  // topOne.color = [.9, 0.3, 0.0, 1.0];
  // topOne.matrix.translate(-0.05,-0.0,-0.15);
  // topOne.matrix.rotate(-5,1,0,0);
  // topOne.matrix.scale(0.1,0.2,0.1);
  // topOne.render();

  // var topTwo = new Cube();
  // topTwo.color = [.9, 0.3, 0.0, 1.0];
  // topTwo.matrix.translate(-0.05,-0.0,-0.05);
  // topTwo.matrix.rotate(-5,1,0,0);
  // topTwo.matrix.scale(0.1,0.25,0.1);
  // topTwo.render();

  // var topThree = new Cube();
  // topThree.color = [.9, 0.3, 0.0, 1.0];
  // topThree.matrix.translate(-0.05,-0.0,0.05);
  // topThree.matrix.rotate(-5,1,0,0);
  // topThree.matrix.scale(0.1,0.18,0.1);
  // topThree.render();

  // // Side Fins
  // var leftFin = new Cube();
  // leftFin.color = [.9, 0.5, 0.0, 1.0];
  // leftFin.matrix.translate(-0.3,-0.1,-0.05);
  // leftFin.matrix.rotate(-5,1,0,0);
  // leftFin.matrix.rotate(g_leftFinAngle,0,1,0);
  // leftFin.matrix.scale(0.1*(3/4),0.2*(3/4),0.2*(3/4));
  // leftFin.render();

  // var rightFin = new Cube();
  // rightFin.color = [.9, 0.5, 0.0, 1.0];
  // rightFin.matrix.translate(0.25,-0.1,0.0);
  // rightFin.matrix.rotate(-5,1,0,0);
  // rightFin.matrix.rotate(-g_leftFinAngle,0,1,0);
  // rightFin.matrix.scale(0.1*(3/4),0.15*(3/4),0.15*(3/4));
  // rightFin.render();

  // // Stripes
  // var stripe = new Cube();
  // stripe.color = [1, 1, 1, 1.0];
  // stripe.matrix.translate(-0.26,-0.18,-0.1);
  // stripe.matrix.rotate(-5,1,0,0);
  // stripe.matrix.scale(0.52,0.3,0.05);
  // stripe.render();

  // var stripeTwo = new Cube();
  // stripeTwo.color = [1, 1, 1, 1.0];
  // stripeTwo.matrix.translate(-0.26,-0.17,0.03);
  // stripeTwo.matrix.rotate(-5,1,0,0);
  // stripeTwo.matrix.scale(0.52,0.3,0.05);
  // stripeTwo.render();

  // var stripeThree = new Cube();
  // stripeThree.color = [1, 1, 1, 1.0];
  // stripeThree.matrix.translate(-0.26,-0.16,0.165);
  // stripeThree.matrix.rotate(-5,1,0,0);
  // stripeThree.matrix.scale(0.52,0.3,0.05);
  // stripeThree.render();

  // // Mouth

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // //Bubbles!
  // var K = 9.0;
  // for (var i = 1; i < K; i++) {
  //   var c = new Cube();
  //   c.color = [0,.4,.7,1];
  //   c.matrix.translate(-.8, bubbles - 4 * i / K - 2, 0);
  //   c.matrix.rotate(g_seconds * 50, 1, 1, 1);
  //   c.matrix.scale(0.5/((i%3)+8),0.5/((i%3)+8),0.5/((i%3)+8));
  //   c.render();
  // }

  // var B = 10.0;
  // for (var i = 1; i < B; i++) {
  //   var c = new Cube();
  //   c.color = [0,.4,.7,1];
  //   c.matrix.translate(0.5, bubbles - 3.2 * i / B - 3, -.65);
  //   c.matrix.rotate(g_seconds * 50, 1, 1, 1);
  //   c.matrix.scale(0.5/((i%3)+8),0.5/((i%3)+8),0.5/((i%3)+8));
  //   c.render();
  // }

  // var C = 7.0;
  // for (var i = 1; i < C; i++) {
  //   var c = new Cube();
  //   c.color = [0,.4,.7,1];
  //   c.matrix.translate(0.2, bubbles - 3.2 * i / 7 - 4, .65);
  //   c.matrix.rotate(g_seconds * 75, 1, 1, 1);
  //   c.matrix.scale(0.5/((i%3)+8),0.5/((i%3)+8),0.5/((i%3)+8));
  //   c.render();
  // }

  // Update stats // flag
  //stats.update();

  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), "numdot");

}

function drawCube(M) {
  var rgba = [1.0, 1.0, 1.0, 1.0]; // Default color
  var rgba2 = [0.0, 1.0, 1.0, 1.0]; // Default color2
  var rgba3 = [0.0, 0.0, 1.0, 1.0]; // Default color3

  // Pass the color of a point to u_FragColor variable
  gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

  // Pass the matrix to u_ModelMatrix attribute
  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);

  // Front side of cube (assumed to be facing towards the light source)
  drawTriangle3D([0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0]);
  drawTriangle3D([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0]);

  // Top side of cube
  gl.uniform4f(u_FragColor, rgba[0] * .8, rgba[1] * .8, rgba[2] * .8, rgba[3]);
  drawTriangle3D([0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0]);
  drawTriangle3D([0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0]);

  // Bottom side of cube
  gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  drawTriangle3D([0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0]);
  drawTriangle3D([0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0]);

  // Left side of cube
  gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  drawTriangle3D([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0]);
  drawTriangle3D([0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0]);

  // Right side of cube
  gl.uniform4f(u_FragColor, rgba[0] * 0.6, rgba[1] * 0.6, rgba[2] * 0.6, rgba[3]);
  drawTriangle3D([1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0]);
  drawTriangle3D([1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0]);

  // Back side of cube
  gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  drawTriangle3D([0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0]);
  drawTriangle3D([0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0]);
}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
      console.log("Failed to get " + htmlID + " from the HTML");
      return;
    }
    htmlElm.innerHTML = text;
  }
