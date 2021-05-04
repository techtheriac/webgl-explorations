// coming from vertex shader
varying float vNoise; 
varying vec2 vUv;
uniform sampler2D cityScapeTexture;
uniform float time;

void main() {
  vec3 color1 = vec3(1.0, 0.0, 0.0);
  vec3 color2 = vec3(1.0, 0.0, 1.0);
  vec3 finalColor = mix(color1, color2, 0.5 *  (vNoise + 1.0));

  vec2 newUv = vUv;

  newUv = vec2(newUv.x, newUv.y + 0.1 * sin(newUv.x * 10.0 + time / 20.0));

  vec4 cityScapeView = texture2D(cityScapeTexture, newUv);

  //gl_FragColor = vec4(finalColor, 1.0);
 // gl_FragColor = vec4(vUv, 0.0, 1.0);
    gl_FragColor = vec4(vNoise);
  //gl_FragColor = cityScapeView;
}