import React, { useEffect, useRef } from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';
import MegatronVision from './MegatronVision';

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
`

const Example = () => {
  const elRef = useRef();

  useEffect(() => {
    new MegatronVision(elRef.current);
  }, []);

  return (
    <Container ref={elRef}></Container>
  )
  
}

render(<Example/>,
  document.getElementById('root')
);

