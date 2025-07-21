import React from 'react';
import Greeting from '../components/Greeting';
import InfoBox from '../components/InfoBox';

const Home: React.FC = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <Greeting />
      <InfoBox />
    </div>
  );
};

export default Home; 