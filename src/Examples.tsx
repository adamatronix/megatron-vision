import React, { useEffect, useRef } from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';
import MegatronVision from './MegatronVision';

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 80vh;
`

const Menu = styled.div` 
  position: absolute;
  left: 0;
  top: 0;
  z-index: 999;
` 

const videoUrl = 'https://prismic-io.s3.amazonaws.com/adamatronix/3c654cc8-a646-446a-a080-1835024f2aff_Dolby_Spheres_v2_Lossless-thedigitaltheater.mp4';
const vimeo = 'https://player.vimeo.com/external/481036304.hd.mp4?s=e4dfafa5bddef5c359107995319e497432f5c26a&profile_id=175';
const Example = () => {
  const elRef = useRef();
  const megatronRef = useRef<MegatronVision>();

  useEffect(() => {
    megatronRef.current = new MegatronVision(elRef.current,{ autoPlay: false, muted: false, src: videoUrl, endedCallback: () => { console.log('video ended')} });

    return () => {
      megatronRef.current.destroy();
      megatronRef.current = null;
    }
  }, []);

  const destroyIt = () => {
    megatronRef.current.destroy();
    megatronRef.current = null;
  }

  const play = () => {
    megatronRef.current.video.play();
  }

  const pause = () => {
    megatronRef.current.video.pause();
  }

  const fullscreen = () => {
    if(elRef.current) {
      elRef.current.requestFullscreen();
    }
  }
  return (
    <>
<Container ref={elRef}>
  <Menu><button onClick={destroyIt}>Destroy</button><button onClick={play}>Play</button><button onClick={pause}>Pause</button><button onClick={fullscreen}>Fullscreen</button></Menu>

  </Container>
    
    </>
    
  )
  
}

render(<Example/>,
  document.getElementById('root')
);

