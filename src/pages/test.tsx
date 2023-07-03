import { useEffect } from "react";

const TestComponent = () => {
  useEffect(() => {
    console.log('testComponent');
  }, []);
  console.log('test outside useEffect');
  return(<h2>test</h2>);

};

export default TestComponent;
