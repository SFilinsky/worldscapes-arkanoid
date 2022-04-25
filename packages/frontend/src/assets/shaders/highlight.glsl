precision highp float;

varying vec2      vTextureCoord;

uniform sampler2D uSampler;

uniform float     iTime;
uniform float     uAlpha;

uniform vec4      inputPixel;
uniform vec4      inputSize;
uniform vec4      outputFrame;
uniform vec4      filterArea;


// Custom
uniform vec2      iMouse;
uniform vec3      borderColor;
uniform vec3      highlightColor;


#define sizeX 1.0
#define sizeY 1.0
#define fadeDistance 60.0


void main()
{

  vec4 originalColor = texture2D(uSampler, vTextureCoord);

  vec2 iResolution = filterArea.xy;
  vec2 uv = vTextureCoord * inputSize.xy / outputFrame.zw;
  vec2 screenPos = vTextureCoord * inputSize.xy + outputFrame.xy;

  float gapX = 0.025;
  float gapY = 0.15;

  // Distance from point to center
  vec2 uvToCenter = vec2(
    abs(0.5 - uv.x),
    abs(0.5 - uv.y)
  );


  // Mask points on border
  float tooCloseX = 1.0 - step(0.0, uvToCenter.x + gapX - sizeX / 2.0);
  float tooFarX = step(0.0, uvToCenter.x - sizeX / 2.0);

  float tooCloseY = 1.0 - step(0.0, uvToCenter.y + gapY - sizeY / 2.0);
  float tooFarY = step(0.0, uvToCenter.y - sizeY / 2.0);

  float display = (1.0 - tooFarX) * (1.0 - tooFarY) * step(1.0, (1.0 - tooCloseX) + (1.0 - tooCloseY));

  // Calculate distance factor
  vec2 distanceToBall = abs(iMouse - screenPos);
  float distanceFactor = smoothstep(
    0.0,
    fadeDistance,
    sqrt(distanceToBall.x * distanceToBall.x + distanceToBall.y * distanceToBall.y)
  );

  // Output to screen
  float mixFactor = (1.0 - distanceFactor) * 0.75;
  gl_FragColor = mix(
    mix(
      originalColor,
      vec4(highlightColor, originalColor.a),
      mixFactor
    ),
    mix(
      vec4(borderColor, originalColor.a),
      vec4(highlightColor, originalColor.a),
      mixFactor
    ),
    display
  );
//  gl_FragColor = display * vec4(highlightColor, 1.0);
//  gl_FragColor = vec4(uvToCenter, 0., 1.0);
//  gl_FragColor = vec4(screenPos / fadeDistance, 0.0, 1.0);
//  gl_FragColor = vec4(mixFactor, mixFactor, mixFactor, 1.0);
}
