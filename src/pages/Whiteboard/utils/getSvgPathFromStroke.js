/* Here we use prefect-freehand library to do the rendering.

Rendering:
While getStroke returns an array of points representing the outline of a stroke, it's up to you to decide how you will render these points.

The function below will turn the points returned by getStroke into SVG path data.

visit:https://www.npmjs.com/package/perfect-freehand for more information*/

//below is the code from prefect-freehand library that realises the rendering of stroke
const average = (a, b) => (a + b) / 2;

export const getSvgPathFromStroke = (points, closed = true) => {
  const len = points.length;

  if (len < 4) {
    return ``;
  }

  let a = points[0];
  let b = points[1];
  const c = points[2];

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(
    2
  )},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(
    b[1],
    c[1]
  ).toFixed(2)} T`;

  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i];
    b = points[i + 1];
    result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(
      2
    )} `;
  }

  if (closed) {
    result += "Z";
  }

  return result;
};
