import React, { useState, useEffect } from 'react';

export default function Example() {
  // Declare a new state variable, which we'll call "count"
  const [count, setCount] = useState(0);
  const [count2, setCount2] = useState(0);

  useEffect(() => {
    console.log('Jim1');
    let count3 = count2;
    const intervalId = setInterval(() => {
      console.log('Jim2');
      count3 += 0.1;
      setCount2(count3);
    }, 1000);
    return function cleanup () {
      console.log('Jim3');
      clearInterval(intervalId);
    }
  }, []);

  return (
    <div>
      <p>You clicked {count + count2} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}