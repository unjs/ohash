export function generateItems(num) {
  return new Array(num).fill(0).map(() => {
    return {
      propNum: Math.random(),
      propBool: Math.random() > 0.5,
      propString: Math.random().toString(16),
      propDate: new Date(),
      propObj: {
        propNum: Math.random(),
        propBool: Math.random() > 0.5,
        propString: Math.random().toString(16),
        propDate: new Date(),
      },
    };
  });
}
