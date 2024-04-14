#include <emscripten/emscripten.h>
#include <math.h>
#include <vector>

using namespace std;

#ifdef __cplusplus
#define EXTERN extern "C"
#else
#define EXTERN
#endif

uint8_t result[8294400];
uint8_t val[4];
int MAX_ITERATION = 1000;

extern "C" {
EXTERN EMSCRIPTEN_KEEPALIVE void cal(double x, double y) {
  double xTemp = 0, yTemp = 0;
  int iterations = 0;
  double xtemp2 = 0;

  while (xTemp * xTemp + yTemp * yTemp <= 4 && iterations < MAX_ITERATION) {
    xtemp2 = xTemp * xTemp - yTemp * yTemp + x;
    yTemp = 2 * xTemp * yTemp + y;
    xTemp = xtemp2;
    iterations = iterations + 1;
  }


  double co = (float) iterations + 1.0 - log2(0.5 * log2(hypot(yTemp, xTemp)));
  co = sqrt(max(0.0, co) / 256.0);

  if (iterations >= MAX_ITERATION) {
    val[0] = 0;
    val[1] = 0;
    val[2] = 0;
    val[3] = 128;
  } else {
    val[0] = int((0.5 + 0.5 * cos(6.2831 * co + 0.0)) * 255.0);
    val[1] = int((0.5 + 0.5 * cos(6.2831 * co + 0.43)) * 255.0);
    val[2] = int((0.5 + 0.5 * cos(6.2831 * co + 0.8)) * 255.0);
    val[3] = 128;
  }

 
}

EXTERN EMSCRIPTEN_KEEPALIVE uint64_t getOffset() { return (uint64_t)&result; }

EXTERN EMSCRIPTEN_KEEPALIVE void calc(int canvasWidth, int canvasHeight,
                                      double translateX, double translateY,
                                      double scale, double scaleY, double start,
                                      double end, int max_iter) {
  
  MAX_ITERATION = max_iter;

  for (int i = start; i < end; i++) {
    for (int j = 0; j < canvasHeight; j++) {
      cal((float)i / scale - translateX,
          -((float)j / scale - translateY) / scaleY);

      uint64_t pixelPos = (j * canvasWidth + i) * 4;

      if (pixelPos >= 8294400) {
        continue;
      }

      result[pixelPos + 0] = val[0];
      result[pixelPos + 1] = val[1];
      result[pixelPos + 2] = val[2];
      result[pixelPos + 3] = val[3];

      // if(pixelPos % 5 == 0) {
      //   result[pixelPos + 0] = 0;
      //   result[pixelPos + 1] = 0;
      //   result[pixelPos + 2] = 0;
      // } else{
      //   result[pixelPos + 0] = 255;
      //   result[pixelPos + 1] = 255;
      //   result[pixelPos + 2] = 255;
      // }
      // result[pixelPos + 3] = 255;
    }
  }
}
}
