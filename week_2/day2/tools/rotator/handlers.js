
export const rotatorHandlers = {
  async prepare_rotation_list({current, result}) {
    console.log('Preparing rotation list with current:', current, 'and result:', result);
        return getRotationMap(current, result);
  }
};


function rotateRight(pipe) {
  const [top, right, bottom, left] = pipe;
  return [left, top, right, bottom];
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function getRotationCount(currentPipe, targetPipe) {
  let rotated = [...currentPipe];

  for (let i = 0; i < 4; i++) {
    if (arraysEqual(rotated, targetPipe)) {
      return i;
    }
    rotated = rotateRight(rotated);
  }

  return null;
}

function getRotationMap(currentState, targetState) {
  const result = {};

  for (const cell in currentState) {
    result[cell] = getRotationCount(currentState[cell], targetState[cell]);
  }

  return result;
}