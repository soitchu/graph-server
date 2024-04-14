#version 300 es
precision highp float;

//---------------------------------------------------------------------------
//--- High Precision float ver: 1.000 ---------------------------------------
//---------------------------------------------------------------------------
#ifndef _GLSL_HP32
#define _GLSL_HP32
//---------------------------------------------------------------------------
// helper functions (internals)
void hp32_nor(vec3 c) // bubble sort c coordinates desc by magnitude
{
  float x;
  if (abs(c.x) < abs(c.y)) {
    x = c.x;
    c.x = c.y;
    c.y = x;
  }
  if (abs(c.x) < abs(c.z)) {
    x = c.x;
    c.x = c.z;
    c.z = x;
  }
  if (abs(c.y) < abs(c.z)) {
    x = c.y;
    c.y = c.z;
    c.z = x;
  }
}
void hp32_err(vec3 c, vec3 e) // c+=e; apply rounding error e corection to c
{
  float q;
  q = c.x;
  c.x += e.x;
  e.x = e.x - (c.x - q);
  q = c.x;
  c.x += e.y;
  e.y = e.y - (c.x - q);
  q = c.x;
  c.x += e.z;
  e.z = e.z - (c.x - q);
  q = c.y;
  c.y += e.x;
  e.x = e.x - (c.y - q);
  q = c.y;
  c.y += e.y;
  e.y = e.y - (c.y - q);
  q = c.y;
  c.y += e.z;
  e.z = e.z - (c.y - q);
  q = c.z;
  c.z += e.x;
  e.x = e.x - (c.z - q);
  q = c.z;
  c.z += e.y;
  e.y = e.y - (c.z - q);
  q = c.z;
  c.z += e.z;
  e.z = e.z - (c.z - q);
  hp32_nor(c);
}
void hp32_split(vec3 h, vec3 l, vec3 a) // (h+l)=a; split mantissas to half
{
  const float n = 8388609.0; // 10000000000001 bin uses ~half of mantissa bits
  h = a *
      n; // this shifts the a left by half of mantissa (almost no rounding yet)
  l = h - a; // this will round half of mantissa as h,a have half of mantisa
             // bits exponent difference
  h -= l;    // this will get rid of the `n*` part from number leaving just high
             // half of mantisa from original a
  l = a - h; // this is just the differenc ebetween original a and h ... so
             // lower half of mantisa beware might change sign
}

//---------------------------------------------------------------------------
// double api (comment it out if double not present)
// vec3 hp32_set(double a) // double -> vec2
// {
//   vec3 c;
//   c.x = a;
//   a -= c.x;
//   c.y = a;
//   a -= c.y;
//   c.z = a;
//   hp32_nor(c);
//   return c;
// }
// double hp32_getl(vec3 a) {
//   double c;
//   c = a.z + a.y;
//   c += a.x;
//   return c;
// } // vec2 -> double
//---------------------------------------------------------------------------
// normal api
vec3 hp32_set(float a) { return vec3(a, 0.0, 0.0); } // float -> vec2
float hp32_get(vec3 a) {
  float c;
  c = a.z + a.y;
  c += a.x;
  return c;
} // vec2 -> float
vec3 hp32_add(vec3 a, vec3 b) // = a+b
{
  // c=a+b; addition
  vec3 c = a + b, e;
  float q;
  // e=(a+b)-c; rounding error
  c.x = a.x + b.x;
  e.x = c.x - a.x;
  e.x -= b.x;
  c.y = a.y + b.y;
  e.y = c.y - a.y;
  e.y -= b.y;
  c.z = a.z + b.z;
  e.z = c.z - a.z;
  e.z -= b.z;
  e = -e;
  hp32_err(c, e);
  return c;
}
vec3 hp32_sub(vec3 a, vec3 b) // = a-b
{
  // c=a-b; substraction
  vec3 c = a - b, e;
  float q;
  // e=(a-b)-c; rounding error
  c.x = a.x + b.x;
  e.x = c.x - a.x;
  e.x += b.x;
  c.y = a.y + b.y;
  e.y = c.y - a.y;
  e.y += b.y;
  c.z = a.z + b.z;
  e.z = c.z - a.z;
  e.z += b.z;
  e = -e;
  hp32_err(c, e);
  return c;
}
vec3 hp32_mul_half(vec3 a, vec3 b) // = a*b where a,b are just half of mantissas
                                   // !!! internal call do not use this !!!
{
  //  c = (a.x+a.y+a.z)*(b.x+b.y+b.z)     // multiplication of 2 expresions
  //  c = (a.x*b.x)+(a.x*b.y)+(a.x*b.z)   // expanded
  //     +(a.y*b.x)+(a.y*b.y)+(a.y*b.z)
  //     +(a.z*b.x)+(a.z*b.y)+(a.z*b.z)
  //  c = (a.x*b.x)                       // ordered desc by magnitude (x>=y>=z)
  //     +(a.x*b.y)+(a.y*b.x)
  //     +(a.x*b.z)+(a.z*b.x)+(a.y*b.y)
  //     +(a.y*b.z)+(a.z*b.y)
  //     +(a.z*b.z)
  vec3 c, e, f;
  float q, r;
  // c=a*b; (e,f)=(a*b)-c; multiplication
  c.x = (a.x * b.x);
  r = (a.x * b.y);
  q = c.x;
  c.x += r;
  e.x = r - (c.x - q);
  r = (a.y * b.x);
  q = c.x;
  c.x += r;
  e.y = r - (c.x - q);
  c.y = (a.x * b.z);
  r = (a.z * b.x);
  q = c.y;
  c.y += r;
  e.z = r - (c.y - q);
  r = (a.y * b.y);
  q = c.y;
  c.y += r;
  f.x = r - (c.y - q);
  c.z = (a.y * b.z);
  r = (a.z * b.y);
  q = c.z;
  c.z += r;
  f.y = r - (c.z - q);
  r = (a.z * b.z);
  q = c.z;
  c.z += r;
  f.z = r - (c.z - q);
  e = +hp32_add(e, f);
  hp32_err(c, e);
  return c;
}
vec3 hp32_mul(vec3 a, vec3 b) // = a*b
{
  vec3 ah, al, bh, bl, c;
  // split operands to halves of mantissa
  hp32_split(ah, al, a);
  hp32_split(bh, bl, b);
  //  c = (ah+al)*(bh+bl) = ah*bh + ah*bl + al*bh + al*bl
  c = hp32_mul_half(ah, bh);
  c = hp32_add(c, hp32_mul_half(ah, bl));
  c = hp32_add(c, hp32_mul_half(al, bh));
  c = hp32_add(c, hp32_mul_half(al, bl));
  return c;
}

#endif

// Credit: https://oriont.net/posts/newton-fractal

out vec4 outColor;

uniform float width;
uniform float height;

bool error;

#define complex vec2

uniform vec3 mousepos;

const complex c_nan = complex(10000.0, 20000.0);
const float PI = 3.1415926535897932384626433832795;
const int MAX_ITERATION = 10000;

bool diverges(complex z) { return z.x >= 10000.0 || z.y >= 10000.0; }

float c_arg(complex z) {
  if (z == complex(0, 0)) {
    error = true;
  }
  return atan(z.y, z.x);
}

#define c_abs(a) length(a)

complex c_pow(complex z, complex w) {
  float r = c_abs(z);
  float theta = c_arg(z);

  float r_ = pow(r, w.x);
  float theta_ = theta * w.x;

  if (w.y != 0.0) {
    r_ *= exp(-w.y * theta);
    theta_ += w.y * log(r);
  }

  return complex(r_ * cos(theta_), r_ * sin(theta_));
}

complex c_sub(complex x, complex y) { return complex(x.x - y.x, x.y - y.y); }

complex c_add(complex x, complex y) { return complex(x.x + y.x, x.y + y.y); }

complex c_mul(complex x, complex y) {
  return complex(x.x * y.x - x.y * y.y, x.y * y.x + x.x * y.y);
}

complex c_div(complex x, complex y) {
  float den = y.x * y.x + y.y * y.y;
  if (den == 0.0) {
    // Can't divide by 0
    error = true;
    return c_nan;
  }
  return complex((x.x * y.x + x.y * y.y) / den, (x.y * y.x - x.x * y.y) / den);
}

complex c_sin(complex z) {
  return complex(sin(z.x) * cosh(z.y), cos(z.x) * sinh(z.y));
}

complex c_cos(complex z) {
  return complex(cos(z.x) * cosh(z.y), -sin(z.x) * sinh(z.y));
}

complex c_scale(complex z, float x) { return complex(z.x * x, z.y * x); }

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 getColor(float h, float s, float v) {
  return vec4(hsv2rgb(vec3(h, s, v)), 0.6);
}

vec2 ds_set(float a) {
  vec2 z;
  z.x = a;
  z.y = 0.0;
  return z;
}
vec2 ds_add(vec2 dsa, vec2 dsb) {
  vec2 dsc;
  float t1, t2, e;

  t1 = dsa.x + dsb.x;
  e = t1 - dsa.x;
  t2 = ((dsb.x - e) + (dsa.x - (t1 - e))) + dsa.y + dsb.y;

  dsc.x = t1 + t2;
  dsc.y = t2 - (dsc.x - t1);
  return dsc;
}

vec2 ds_mul(vec2 dsa, vec2 dsb) {
  vec2 dsc;
  float c11, c21, c2, e, t1, t2;
  float a1, a2, b1, b2, cona, conb, split = 8193.;

  cona = dsa.x * split;
  conb = dsb.x * split;
  a1 = cona - (cona - dsa.x);
  b1 = conb - (conb - dsb.x);
  a2 = dsa.x - a1;
  b2 = dsb.x - b1;

  c11 = dsa.x * dsb.x;
  c21 = a2 * b2 + (a2 * b1 + (a1 * b2 + (a1 * b1 - c11)));

  c2 = dsa.x * dsb.y + dsa.y * dsb.x;

  t1 = c11 + c2;
  e = t1 - c11;
  t2 = dsa.y * dsb.y + ((c2 - e) + (c11 - (t1 - e))) + c21;

  dsc.x = t1 + t2;
  dsc.y = t2 - (dsc.x - t1);

  return dsc;
}

// vec2[2] squareImaginary(vec2 number[2]) {
//   return vec2(
//     ds_mul(number[0], number[0]) - ds_mul(number[1], number[1]),
//     ds_mul(ds_mul(ds_set(2.0), number[0]), number[1]);
//   );
// }

int iterateMandelbrot(vec2 coord[2]) {
  vec2 z[2];

  for (int i = 0; i < MAX_ITERATION; i++) {
    vec2 number[2];
    number[0] = vec2(z[0].x, z[0].y);
    number[1] = vec2(z[1].x, z[1].y);
    //   z = squareImaginary(z) + coord;
    z[0] = ds_add(ds_add(ds_mul(number[0], number[0]),
                         ds_mul(ds_set(-1.0), ds_mul(number[1], number[1]))),
                  coord[0]);
    z[1] = ds_add(ds_mul(ds_mul(ds_set(2.0), number[0]), number[1]), coord[1]);

    if (ds_add(ds_mul(z[0], z[0]), ds_mul(z[1], z[1]))[0] > 4.0) {
      return i;
    }
  }
  return MAX_ITERATION;
}


vec3 colorDoublePrecision(vec2 p, float falloff) {

  vec4 c = dcAdd(dcMul(dcSet(p),vec2(zoom,0.)),dcSet(center, centerD));

  vec4 dZ = dcSet(vec2(0.0,0.0));
  vec4 add = c;

  int j = ITERATIONS;
  for (int i = 0; i <= ITERATIONS; i++) {
    if (cmp(dcLength(dZ), set(1000.0))>0.) {break;}
    dZ = dcAdd(dcMul(dZ,dZ),add);
    j = i;
  }
  float dotZZ = dZ.x*dZ.x+dZ.z*dZ.z; // extract high part

  if (j < ITERATIONS) {
    // The color scheme here is based on one
    // from the Mandelbrot in Inigo Quilez's Shader Toy:
    float co = float(j) + 1.0 - log2(.5*log2(dotZZ));
    co = sqrt(max(0.,co)/256.0);
    co += rand(coord*fract(time))*0.02;
    return falloff*vec3(.5+.5*cos(6.2831*co+R),.5+.5*cos(6.2831*co + G),.5+.5*cos(6.2831*co +B));
  }  else {
    // Inside
    return vec3(0.05,0.01,0.02);
  }
}

vec4 newtonsMethod(vec2 x, vec2 y) {
  // vec2 a = ds_set(3.0);
  // vec2 b = ds_set(2.0);
  // vec2 result = ds_mul(a, b);

  // if (result[0] > 5.9 && result[0] < 6.1) {
  //   return vec4(255, 255, 0, 1);
  // } else {
  //   return vec4(0.0, 0.0, 0.0, 1);
  // }

  vec2 coord[2];
  coord[0] = x;
  coord[1] = y;

  int iterations = iterateMandelbrot(coord);

  if (iterations == MAX_ITERATION) {
    return vec4(0.0, 0.0, 0.0, 1);
  } else {
    return vec4(255, 255, 0, 1);
  }
}

void main() {
  vec2 pos = gl_FragCoord.xy;
  vec2 posX = ds_set(pos.x);
  vec2 posY = ds_set(pos.y);
  vec2 mouseposX = ds_set(mousepos[0]);
  vec2 mouseposY = ds_set(mousepos[1]);

  vec2 scaleInverse = ds_set(mousepos[2]);

  vec2 x = ds_add(ds_mul(posX, scaleInverse), ds_mul(ds_set(-1.0), mouseposX));
  vec2 y = ds_add(
      ds_mul(ds_add(posY, ds_mul(ds_set(-1.0), ds_set(height))), scaleInverse),
      ds_mul(ds_set(-1.0), mouseposY));

  outColor = newtonsMethod(x, y);
}

// temp0.scale = 5303569.399051037;
// temp0.resize(679, 516);
// temp0.translate = { x: 1.401157379345879, y: 0.000045187366920136526,
// iniX: 1.4011837766623776, iniY: 0.000051221039262715044 }