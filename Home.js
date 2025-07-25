import React from 'react';
import { v4 as uuidV4 } from 'uuid';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const createDocument = () => {
    const id = uuidV4();
    navigate(`/documents/${id}`);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Welcome to Real-Time Document Editor</h1>
      <button onClick={createDocument}>Create Document</button>
    </div>
  );
};

export default Home;
