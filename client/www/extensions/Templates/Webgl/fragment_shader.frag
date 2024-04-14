// Go for highest precision available
precision highp float;

varying vec2 coord;

// Mandelbrot coords
uniform float height;
uniform float width;
uniform float scale;
uniform float scaleD;
uniform float scaleY;
uniform float scaleYD;

uniform vec2 center;
uniform vec2 centerD;
uniform float zoom;

// Julia coords
uniform vec2 center2;
uniform float zoom2;

// Color parameters
float R = 0.0;
float G = 0.43;
float B = 1.;
float Divider = 23.;
float Power = 1.2;
float Radius = 0.7037;

float times_frc(float a, float b)
{
  return mix(0.0, a * b, b != 0.0 ? 1.0 : 0.0);
}

float plus_frc(float a, float b)
{
  return mix(a, a + b, b != 0.0 ? 1.0 : 0.0);
}

float minus_frc(float a, float b)
{
  return mix(a, a - b, b != 0.0 ? 1.0 : 0.0);
}

// Double emulation based on GLSL Mandelbrot Shader by Henry Thasler (www.thasler.org/blog)
//
// Emulation based on Fortran-90 double-single package. See http://crd.lbl.gov/~dhbailey/mpdist/
// Substract: res = ds_add(a, b) => res = a + b
vec2 add(vec2 dsa, vec2 dsb)
{
  vec2 dsc;
  float t1, t2, e;

  t1 = plus_frc(dsa.x, dsb.x);
  e = minus_frc(t1, dsa.x);
  t2 = plus_frc(plus_frc(plus_frc(minus_frc(dsb.x, e), minus_frc(dsa.x, minus_frc(t1, e))), dsa.y), dsb.y);
  dsc.x = plus_frc(t1, t2);
  dsc.y = minus_frc(t2, minus_frc(dsc.x, t1));
  return dsc;
}

// Substract: res = ds_sub(a, b) => res = a - b
vec2 sub(vec2 dsa, vec2 dsb)
{
  vec2 dsc;
  float e, t1, t2;

  t1 = minus_frc(dsa.x, dsb.x);
  e = minus_frc(t1, dsa.x);
  t2 = minus_frc(plus_frc(plus_frc(minus_frc(minus_frc(0.0, dsb.x), e), minus_frc(dsa.x, minus_frc(t1, e))), dsa.y), dsb.y);

  dsc.x = plus_frc(t1, t2);
  dsc.y = minus_frc(t2, minus_frc(dsc.x, t1));
  return dsc;
}

// Compare: res = -1 if a < b
//              = 0 if a == b
//              = 1 if a > b
float cmp(vec2 dsa, vec2 dsb)
{
  if (dsa.x < dsb.x)
  {
    return -1.;
  }
  if (dsa.x > dsb.x)
  {
    return 1.;
  }
  if (dsa.y < dsb.y)
  {
    return -1.;
  }
  if (dsa.y > dsb.y)
  {
    return 1.;
  }
  return 0.;
}

// Multiply: res = ds_mul(a, b) => res = a * b
vec2 mul(vec2 dsa, vec2 dsb)
{
  vec2 dsc;
  float c11, c21, c2, e, t1, t2;
  float a1, a2, b1, b2, cona, conb, split = 8193.;

  cona = times_frc(dsa.x, split);
  conb = times_frc(dsb.x, split);
  a1 = minus_frc(cona, minus_frc(cona, dsa.x));
  b1 = minus_frc(conb, minus_frc(conb, dsb.x));
  a2 = minus_frc(dsa.x, a1);
  b2 = minus_frc(dsb.x, b1);

  c11 = times_frc(dsa.x, dsb.x);
  c21 = plus_frc(times_frc(a2, b2), plus_frc(times_frc(a2, b1), plus_frc(times_frc(a1, b2), minus_frc(times_frc(a1, b1), c11))));

  c2 = plus_frc(times_frc(dsa.x, dsb.y), times_frc(dsa.y, dsb.x));

  t1 = plus_frc(c11, c2);
  e = minus_frc(t1, c11);
  t2 = plus_frc(plus_frc(times_frc(dsa.y, dsb.y), plus_frc(minus_frc(c2, e), minus_frc(c11, minus_frc(t1, e)))), c21);

  dsc.x = plus_frc(t1, t2);
  dsc.y = minus_frc(t2, minus_frc(dsc.x, t1));

  return dsc;
}

// create double-single number from float
vec2 set(float a)
{
  return vec2(a, 0.0);
}

float rand(vec2 co)
{
  // implementation found at: lumina.sourceforge.net/Tutorials/Noise.html
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

vec2 complexMul(vec2 a, vec2 b)
{
  return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

// double complex multiplication
vec4 dcMul(vec4 a, vec4 b)
{
  return vec4(sub(mul(a.xy, b.xy), mul(a.zw, b.zw)), add(mul(a.xy, b.zw), mul(a.zw, b.xy)));
}

vec4 dcAdd(vec4 a, vec4 b)
{
  return vec4(add(a.xy, b.xy), add(a.zw, b.zw));
}

// Length of double complex
vec2 dcLength(vec4 a)
{
  return add(mul(a.xy, a.xy), mul(a.zw, a.zw));
}

vec4 dcSet(vec2 a)
{
  return vec4(a.x, 0., a.y, 0.);
}

vec4 dcSet(vec2 a, vec2 ad)
{
  return vec4(a.x, ad.x, a.y, ad.y);
}

// Multiply double-complex with double
vec4 dcMul(vec4 a, vec2 b)
{
  return vec4(mul(a.xy, b), mul(a.wz, b));
}

vec3 colorDoublePrecision(vec4 c)
{
  vec4 dZ = dcSet(vec2(0.0, 0.0));
  vec4 add = c;

  int j = ITERATIONS;
  for (int i = 0; i <= ITERATIONS; i++)
  {
    if (cmp(dcLength(dZ), set(1000.0)) > 0.)
    {
      break;
    }
    dZ = dcAdd(dcMul(dZ, dZ), add);
    j = i;
  }
  float dotZZ = dZ.x * dZ.x + dZ.z * dZ.z; // extract high part

  if (j < ITERATIONS)
  {
    float co = float(j) + 1.0 - log2(.5*log2(dotZZ));
    co = sqrt(max(0.,co)/256.0);
    // co += rand(coord*fract(time))*0.02;
    // return vec3(1.0, 1.0, 1.0);
    return vec3(.5+.5*cos(6.2831*co+R),.5+.5*cos(6.2831*co + G),.5+.5*cos(6.2831*co +B));
  }
  else
  {
    // Inside
    // return vec3(0.05, 0.01, 0.02);
    return vec3(0.05,0.01,0.02);
  }

  // if (cmp(vec2(c.z, c.w), set(200.0)) > 0.)
  // {
  //   return vec3(1.0, 1.0, 1.0);
  // }
  // else
  // {
  //   // Inside
  //   return vec3(1.0, 0.01, 0.02);
  // }
}

vec3 colorSplit(vec4 cor)
{

  return (colorDoublePrecision(cor)).bgr;
}

void main()
{
  vec2 pos = gl_FragCoord.xy;

  vec4 centerX4 = dcSet(vec2(center.x, 0), vec2(centerD.x, 0));
  vec4 centerY4 = dcSet(vec2(center.y, 0), vec2(centerD.y, 0));

  vec4 scale4 = dcSet(vec2(scale, 0), vec2(scaleD, 0));
  vec4 scaleY4 = dcSet(vec2(scaleY, 0), vec2(scaleYD, 0));

  vec4 posX4 = dcSet(vec2(pos.x, 0));
  vec4 posY4 = dcSet(vec2(pos.y, 0));

  vec4 positionX = dcAdd(dcMul(posX4, scale4), centerX4);
  vec4 positionY = dcMul(dcAdd(dcMul(dcAdd(posY4, dcSet(set(height))), scale4), centerY4), scaleY4);

  // float x = translateY;
  // float y = (pos;

  vec3 v = colorSplit(vec4(positionX.x, positionX.y, positionY.x, positionY.y));

  gl_FragColor = vec4(v, 0.5);
}