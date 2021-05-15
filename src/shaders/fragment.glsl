// coming from vertex shader
varying float vNoise; 
varying vec2 vUv;
uniform sampler2D uImage;
uniform float time;
uniform float hoverState;

void main() {
  vec3 color1 = vec3(1.0, 0.0, 0.0);
  vec3 color2 = vec3(1.0, 0.0, 1.0);
  vec3 finalColor = mix(color1, color2, 0.5 *  (vNoise + 1.0));

  vec2 newUv = vUv;
  
  vec2 p = newUv;
  float x = hoverState;

  x = smoothstep(0.0, 1.0, (x*2.0*p.y-1.0));
  vec4 f = mix(
    texture2D(uImage, (p-0.5) * (1.0-x)+0.5),
    texture2D(uImage, (p-0.5) * x+0.5), x);

  //newUv = vec2(newUv.x, newUv.y + 0.1 * sin(newUv.x * 10.0 + time / 20.0));

  vec4 uImageView = texture2D(uImage, newUv);

  //gl_FragColor = vec4(finalColor, 1.0);
  //gl_FragColor = vec4(vUv, 0.0, 1.0);
 // gl_FragColor = vec4(vNoise, 0.0, 0.0, 1.0);
 gl_FragColor = f;
 gl_FragColor.rgb += 0.05*vec3(vNoise);
}