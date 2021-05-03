// coming from vertex shader
varying float vNoise; 
varying vec2 vUv;
uniform sampler2D cityScapeTexture;

void main() {
  vec3 color1 = vec3(1.0, 0.0, 0.0);
  vec3 color2 = vec3(1.0, 0.0, 1.0);
  vec3 finalColor = mix(color1, color2, 0.5 *  (vNoise + 1.0));

  vec4 cityScapeView = texture2D(cityScapeTexture, vUv);

  //gl_FragColor = vec4(finalColor, 1.0);
  //gl_FragColor = vec4(vUv, 0.0, 1.0);
  gl_FragColor = cityScapeView;
}