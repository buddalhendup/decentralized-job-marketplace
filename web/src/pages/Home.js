import React from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

export default function Home() {
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Decentralized Job Marketplace
      </Typography>
      <Typography variant="body1">
        Welcome! This platform allows clients to post jobs and workers to accept them.  Funds are locked in an escrow smart
        contract on the Polygon network and released once the client confirms completion or automatically after the deadline.
      </Typography>
    </Container>
  );
}
