uniform vec4      filterArea;
uniform float     iTime;
varying vec2      vTextureCoord;

float noise(vec2 point) {
  return fract(sin(dot(point, vec2(12.9898, 78.233))) * 43758.5453);
}

void main()
{
  vec2 iResolution = filterArea.xy;

  // Normalized pixel coordinates (from 0 to 1)
  vec2 uv = vec2(vTextureCoord.x, 1.0 - vTextureCoord.y);

  // Generate noise
  float value = noise(uv);

  // Pick Stars
  float display = ceil(value - 0.992);

  // Brightness
  float brB = abs(0.25 + 0.5 * sin(value * 1000.0)) * display;

  float brR = (1.0 - 0.25 * brB) * display;
  float brG = (abs(sin(uv.y * 1000.0)) * value - 0.5 * brB) * display;

  // Time variation factor
  vec3 col = 0.65 + 0.25 * cos(iTime / 1000.0 + sin(vec3(brR, brG, brB)) + value * 1000.0);


  // Output to screen
  gl_FragColor = vec4(brR * col.x, brG * col.y, brB * col.z, 1.0);
  //gl_FragColor = vec4(uv, 0, 1.0);
  //gl_FragColor = vec4(value, value, value, 1.0);
}
